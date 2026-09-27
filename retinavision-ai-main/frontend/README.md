# RetinaVision AI: Clinical Decision Support System

An end-to-end medical AI platform combining fine-tuned **ResNet50** deep learning weights with the **International Clinical Diabetic Retinopathy (ICDR)** clinical rules engine.

---

## 🚀 Key Features
* **Authentic Deep Learning Weights:** Powered by fine-tuned ResNet50 convolutional neural network weights (`model.pth` / `models/dr_resnet50_fine_tuned.pth`).
* **Clinical Rules Engine:** Dynamic risk stratification and stage mapping (Stages 0–4) handling biomarker tracking and specialist care pathways.
* **Secure Backend:** Built on **FastAPI** with in-memory stream processing ensuring zero persistent image storage for data privacy.

---

## 🛠️ Local Installation & Setup

### 1. Install Dependencies
```bash
pip install -r requirements.txt