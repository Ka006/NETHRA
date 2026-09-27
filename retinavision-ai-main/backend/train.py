import os
import pandas as pd
import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader
from torchvision import models, transforms
from PIL import Image

class RetinalDataset(Dataset):
    def __init__(self, csv_file, img_dir, transform=None):
        self.df = pd.read_csv(os.path.expanduser(csv_file))
        self.img_dir = os.path.expanduser(img_dir)
        self.transform = transform

    def __len__(self):
        return len(self.df)

    def __getitem__(self, idx):
        img_name = f"{self.df.iloc[idx, 0]}.png"
        img_path = os.path.join(self.img_dir, img_name)
        image = Image.open(img_path).convert("RGB")
        label = int(self.df.iloc[idx, 1])

        if self.transform:
            image = self.transform(image)

        return image, label

train_transforms = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.RandomHorizontalFlip(),
    transforms.RandomRotation(15),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

def train_model():
    device = torch.device("mps" if torch.backends.mps.is_available() else "cpu")
    print(f"Training using hardware acceleration device: {device}")

    # Explicitly check relative and root dataset locations
    if os.path.exists("../dataset/train.csv"):
        csv_path = "../dataset/train.csv"
        img_dir = "../dataset/train_images"
    else:
        csv_path = "~/dataset/train.csv"
        img_dir = "~/dataset/train_images"

    dataset = RetinalDataset(csv_file=csv_path, img_dir=img_dir, transform=train_transforms)
    dataloader = DataLoader(dataset, batch_size=32, shuffle=True, num_workers=0) # num_workers=0 prevents multiprocessing issues on macOS

    model = models.resnet50(weights=models.ResNet50_Weights.DEFAULT)
    model.fc = nn.Linear(model.fc.in_features, 5)
    model.to(device)

    criterion = nn.CrossEntropyLoss()
    optimizer = torch.optim.Adam(model.parameters(), lr=1e-4)

    os.makedirs("models", exist_ok=True)

    epochs = 5
    for epoch in range(epochs):
        model.train()
        running_loss = 0.0
        for images, labels in dataloader:
            images, labels = images.to(device), labels.to(device)

            optimizer.zero_grad()
            outputs = model(images)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()

            running_loss += loss.item() * images.size(0)

        epoch_loss = running_loss / len(dataset)
        print(f"Epoch {epoch+1}/{epochs} - Loss: {epoch_loss:.4f}")

    torch.save(model.state_dict(), "models/dr_resnet50_fine_tuned.pth")
    print("Fine-tuned model successfully saved to backend/models/dr_resnet50_fine_tuned.pth")

if __name__ == "__main__":
    train_model()
