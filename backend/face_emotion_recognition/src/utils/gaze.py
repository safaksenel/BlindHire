import cv2

def get_gaze_direction(face_landmarks, frame, w, h):
    # Right eye (person's right eye, left side of image)
    right_iris = face_landmarks.landmark[468]
    right_eye_outer = face_landmarks.landmark[33]
    right_eye_inner = face_landmarks.landmark[133]
    right_eye_top = face_landmarks.landmark[159]
    right_eye_bottom = face_landmarks.landmark[145]
    
    # Left eye (person's left eye, right side of image)
    left_iris = face_landmarks.landmark[473]
    left_eye_inner = face_landmarks.landmark[362]
    left_eye_outer = face_landmarks.landmark[263]
    left_eye_top = face_landmarks.landmark[386]
    left_eye_bottom = face_landmarks.landmark[374]
    
    # Draw eye landmarks to visually show eye tracking
    for landmark in [right_iris, left_iris]:
        cv2.circle(frame, (int(landmark.x * w), int(landmark.y * h)), 3, (0, 255, 255), -1) # Yellow dots for pupils
    
    for landmark in [right_eye_outer, right_eye_inner, left_eye_inner, left_eye_outer]:
        cv2.circle(frame, (int(landmark.x * w), int(landmark.y * h)), 2, (255, 0, 0), -1) # Blue dots for eye corners
    
    # Ratios
    ratio_x_right = (right_iris.x - right_eye_outer.x) / (right_eye_inner.x - right_eye_outer.x + 1e-6)
    ratio_y_right = (right_iris.y - right_eye_top.y) / (right_eye_bottom.y - right_eye_top.y + 1e-6)
    
    ratio_x_left = (left_iris.x - left_eye_inner.x) / (left_eye_outer.x - left_eye_inner.x + 1e-6)
    ratio_y_left = (left_iris.y - left_eye_top.y) / (left_eye_bottom.y - left_eye_top.y + 1e-6)
    
    ratio_x = (ratio_x_right + ratio_x_left) / 2.0
    ratio_y = (ratio_y_right + ratio_y_left) / 2.0
    
    # Eşik değerlerini (Threshold) esnetiyoruz. İnsan gözünün şekline göre değişebilir.
    if ratio_x < 0.42:
        gaze_x = "Right"
    elif ratio_x > 0.58:
        gaze_x = "Left"
    else:
        gaze_x = "Center"
        
    # Üst göz kapağı irisi daha çok örttüğü için ratio_y genelde 0.35-0.45 civarıdır.
    if ratio_y < 0.30:
        gaze_y = "Up"
    elif ratio_y > 0.65:
        gaze_y = "Down"
    else:
        gaze_y = "Center"
        
    if gaze_x == "Center" and gaze_y == "Center":
        return "Center", (0, 255, 0), ratio_x, ratio_y
    elif gaze_x != "Center":
        return gaze_x, (0, 0, 255), ratio_x, ratio_y
    else:
        return gaze_y, (0, 0, 255), ratio_x, ratio_y
