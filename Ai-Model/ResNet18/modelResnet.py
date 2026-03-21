from torchvision import models
import torch.nn as nn

class BirdResNet18(nn.Module):
    def __init__(self, num_classes=525):
        super().__init__()

        self.model = models.resnet18(weights=None)

        in_features = self.model.fc.in_features
        self.model.fc = nn.Linear(in_features, num_classes)

    def forward(self, x):
        return self.model(x)