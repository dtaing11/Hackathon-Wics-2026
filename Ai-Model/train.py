import torch
import torch.nn as nn
from tqdm import tqdm

from model import BirdCNN
from hf_dataset import get_dataloaders

def train():
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    train_loader, val_loader, dataset = get_dataloaders()

    num_classes = len(dataset["train"].features["label"].names)

    model = BirdCNN(num_classes=num_classes).to(device)

    criterion = nn.CrossEntropyLoss()
    optimizer = torch.optim.SGD(model.parameters(), lr=1e-2, momentum=0.9)
    scheduler = torch.optim.lr_scheduler.StepLR(optimizer, step_size=1, gamma=0.5)
    for epoch in range(5):
        model.train()
        total_loss = 0

        loop = tqdm(train_loader)

        for batch in loop:
            images = batch["pixel_values"].to(device)
            labels = batch["label"].to(device)

            optimizer.zero_grad()

            outputs = model(images)
            loss = criterion(outputs, labels)

            loss.backward()
            optimizer.step()

            total_loss += loss.item()
            loop.set_description(f"Epoch {epoch}")
            loop.set_postfix(loss=loss.item())

        print(f"Epoch {epoch} Loss: {total_loss:.4f}")

    torch.save(model.state_dict(), "bird_cnn_1.pth")


if __name__ == "__main__":
    train()
