import cv2
import math
import numpy as np
import time
import warnings
import torch
from PIL import Image
import mediapipe as mp

warnings.simplefilter("ignore", UserWarning)

# Import refactored modules
from models.resnet import ResNet50
from models.lstm import LSTMPyTorch
from utils.gaze import get_gaze_direction
from utils.image import pth_processing
from utils.display import display_EMO_PRED, display_FPS

if __name__ == "__main__":
    name_backbone_model = '../models/FER_static_ResNet50_AffectNet.pt'
    
    lstm_models = ['Aff-Wild2', 'CREMA-D', 'IEMOCAP', 'RAMAS', 'RAVDESS', 'SAVEE']
    current_model_idx = 0
    name_LSTM_model = lstm_models[current_model_idx]
    
    pth_backbone_model = ResNet50(7, channels=3)
    pth_backbone_model.load_state_dict(torch.load(name_backbone_model, map_location=torch.device('cpu'), weights_only=False))
    pth_backbone_model.eval()
    
    pth_LSTM_model = LSTMPyTorch()
    pth_LSTM_model.load_state_dict(torch.load(f'../models/FER_dinamic_LSTM_{name_LSTM_model}.pt', map_location=torch.device('cpu'), weights_only=False))
    pth_LSTM_model.eval()
    
    DICT_EMO = {0: 'Neutral', 1: 'Happiness', 2: 'Sadness', 3: 'Surprise', 4: 'Fear', 5: 'Disgust', 6: 'Anger'}
    
    cap = cv2.VideoCapture(0)
    w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    fps = np.round(cap.get(cv2.CAP_PROP_FPS))
    
    lstm_features = []
    
    mp_face_mesh = mp.solutions.face_mesh
    with mp_face_mesh.FaceMesh(
        max_num_faces=1,
        refine_landmarks=True,
        min_detection_confidence=0.5,
        min_tracking_confidence=0.5) as face_mesh:
        
        while cap.isOpened():
            t1 = time.time()
            success, frame = cap.read()
            if frame is None or not success: 
                break
            
            frame_copy = frame.copy()
            frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            
            # Process with MediaPipe Face Mesh
            results = face_mesh.process(frame_rgb)
            
            if results.multi_face_landmarks:
                for face_landmarks in results.multi_face_landmarks:
                    # Gaze Tracking
                    gaze_dir, gaze_color, r_x, r_y = get_gaze_direction(face_landmarks, frame, w, h)
                    cv2.putText(frame, f'Gaze: {gaze_dir}', (10, 70), cv2.FONT_HERSHEY_SIMPLEX, 1, gaze_color, 3)
                    # Show ratios on screen for calibration
                    cv2.putText(frame, f'Ratio X: {r_x:.2f} | Ratio Y: {r_y:.2f}', (10, 100), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
                    
                    # Calculate bounding box for Face Emotion Recognition
                    x_coords = [landmark.x for landmark in face_landmarks.landmark]
                    y_coords = [landmark.y for landmark in face_landmarks.landmark]
                    
                    x_min = int(min(x_coords) * w)
                    x_max = int(max(x_coords) * w)
                    y_min = int(min(y_coords) * h)
                    y_max = int(max(y_coords) * h)
                    
                    # Add some padding to bounding box
                    box_w = x_max - x_min
                    box_h = y_max - y_min
                    pad_x = int(box_w * 0.1)
                    pad_y = int(box_h * 0.1)
                    
                    startX = max(0, x_min - pad_x)
                    startY = max(0, y_min - pad_y)
                    endX = min(w - 1, x_max + pad_x)
                    endY = min(h - 1, y_max + pad_y)
                    
                    cur_face = frame_rgb[startY:endY, startX:endX]
                    
                    if cur_face.size > 0:
                        try:
                            cur_face_processed = pth_processing(Image.fromarray(cur_face))
                            features = torch.nn.functional.relu(pth_backbone_model.extract_features(cur_face_processed)).detach().numpy()
                            if len(lstm_features) == 0:
                                lstm_features = [features]*10
                            else:
                                lstm_features = lstm_features[1:] + [features]
                            lstm_f = torch.from_numpy(np.vstack(lstm_features))
                            lstm_f = torch.unsqueeze(lstm_f, 0)
                            output = pth_LSTM_model(lstm_f).detach().numpy()
                            cl = np.argmax(output)
                            label = DICT_EMO[cl]
                            frame = display_EMO_PRED(frame, (startX, startY, endX, endY), label+' {0:.1%}'.format(output[0][cl]), line_width=3)
                        except Exception as e:
                            print("Emotion Error:", e)
                            pass
            
            t2 = time.time()
            frame = display_FPS(frame, 'FPS: {0:.1f}'.format(1 / (t2 - t1)), box_scale=.5)
            
            # Display current model info
            cv2.putText(frame, f'Model: {name_LSTM_model} (Press "m" to switch)', (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
            
            cv2.imshow('Webcam Face Emotion Analysis - Press Q to Quit', frame)
            
            key = cv2.waitKey(1) & 0xFF
            if key == ord('q'):
                break
            elif key == ord('m'):
                current_model_idx = (current_model_idx + 1) % len(lstm_models)
                name_LSTM_model = lstm_models[current_model_idx]
                pth_LSTM_model.load_state_dict(torch.load(f'../models/FER_dinamic_LSTM_{name_LSTM_model}.pt', map_location=torch.device('cpu'), weights_only=False))
                pth_LSTM_model.eval()
                print(f"Switched to model: {name_LSTM_model}")
                
        cap.release()
        cv2.destroyAllWindows()
