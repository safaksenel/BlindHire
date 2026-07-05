# Real-Time Facial Emotion & Gaze Tracking

This repository contains a modular Python application for **real-time facial emotion recognition** and **eye gaze tracking** using a webcam. It is specifically designed for scenarios requiring continuous user analysis, such as online interviews, proctoring systems (anti-cheat), and user behavior studies.

## 🚀 Features

- **Real-Time Emotion Recognition:** Analyzes facial expressions and classifies them into 7 emotions (Neutral, Happiness, Sadness, Surprise, Fear, Disgust, Anger) using a pre-trained ResNet50 + LSTM architecture.
- **Dynamic Model Switching:** Seamlessly switch between different LSTM models trained on various datasets (Aff-Wild2, CREMA-D, IEMOCAP, RAMAS, RAVDESS, SAVEE) at runtime.
- **Eye Gaze Tracking (Anti-Cheat):** Utilizes MediaPipe Face Mesh to precisely track the irises and calculate gaze ratios. It detects whether the user is looking at the screen (Center) or away (Left, Right, Up, Down), providing visual warnings for suspicious behavior.
- **Modular Architecture:** Clean and maintainable project structure separating models, utilities, and execution logic.

## 📁 Project Structure

```text
face_emotion_recognition/
├── models/                         # Pre-trained model weights (*.pt)
├── notebooks/                      # Jupyter notebooks for experimentation
├── src/                            # Source code modules
│   ├── models/
│   │   ├── resnet.py               # ResNet50 architecture for feature extraction
│   │   └── lstm.py                 # LSTM architecture for temporal dynamics
│   ├── utils/
│   │   ├── gaze.py                 # MediaPipe iris tracking and gaze logic
│   │   ├── image.py                # Tensor transformations and processing
│   │   └── display.py              # OpenCV drawing utilities (boxes, text, FPS)
│   └── main.py                     # Main webcam execution loop
├── README.md
└── requirements.txt
```

## 🛠️ Installation

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd face_emotion_recognition
   ```

2. **Create a virtual environment (recommended):**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install the dependencies:**
   Make sure you install the specific version of MediaPipe defined in the requirements to ensure compatibility with the Face Mesh API.
   ```bash
   pip install -r requirements.txt
   ```

## 💻 Usage

To start the real-time webcam analysis, navigate to the `src` directory and run `main.py`:

```bash
cd src
python main.py
```

### Controls during runtime:
- **`m` key:** Switch between different LSTM emotion models dynamically.
- **`q` key:** Quit the application.

## 🧠 Gaze Tracking Calibration
The system displays `Ratio X` and `Ratio Y` directly on the video feed. These numbers represent the position of your iris relative to your eye corners. If the system frequently misclassifies your center gaze as looking away, you can adjust the threshold values in `src/utils/gaze.py` based on your natural resting ratios.

## 📚 Acknowledgements & Citations

The emotion recognition models (ResNet50 + LSTM) and weights provided in this repository are based on the **EMO-AffectNet** project by Elena Ryumina. 

If you use the emotion recognition models in your research, please cite their paper:
```bibtex
@article{RYUMINA2022,
  title        = {{In Search of a Robust Facial Expressions Recognition Model: A Large-Scale Visual Cross-Corpus Study}},
  author       = {{Elena Ryumina and Denis Dresvyanskiy and Alexey Karpov}},
  journal      = {{Neurocomputing}},
  year         = {2022},
  doi          = {10.1016/j.neucom.2022.10.013},
  url          = {https://www.sciencedirect.com/science/article/pii/S0925231222012656},
}
```