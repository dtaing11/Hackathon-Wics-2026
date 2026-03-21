from datasets import load_dataset
from torchvision import transforms
from torch.utils.data import DataLoader

def get_dataloaders(batch_size=32):
    dataset = load_dataset("yashikota/birds-525-species-image-classification")

    transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
    ])

    def collate_fn(batch):
        images = []
        labels = []

        for item in batch:
            img = item["image"]
            label = item["label"]

            images.append(transform(img))
            labels.append(label)

        images = transforms.stack = __import__("torch").stack(images)
        labels = __import__("torch").tensor(labels)

        return {
            "pixel_values": images,
            "label": labels
        }

    train_loader = DataLoader(
        dataset["train"],
        batch_size=batch_size,
        shuffle=True,
        collate_fn=collate_fn
    )

    val_loader = DataLoader(
        dataset["validation"],
        batch_size=batch_size,
        shuffle=False,
        collate_fn=collate_fn
    )

    return train_loader, val_loader, dataset