import torch
from torchvision import transforms
from PIL import Image
import torchvision.models as models
from torchvision.models import EfficientNet_V2_S_Weights

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

class StudentCountModel(torch.nn.Module):
    def __init__(self, num_outputs=3):
        super(StudentCountModel, self).__init__()
        self.efficientnet = models.efficientnet_v2_s(weights=EfficientNet_V2_S_Weights.DEFAULT)
        self.efficientnet.classifier[1] = torch.nn.Linear(self.efficientnet.classifier[1].in_features, num_outputs)
    
    def forward(self, x):
        return self.efficientnet(x)

model = StudentCountModel().to(device)
model.load_state_dict(torch.load('efficientnet-v2.pth'))
model.eval()

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])

def predict_count(image):
    image = transform(image).unsqueeze(0).to(device)
    with torch.no_grad():
        output = model(image)
    return output.cpu().numpy()[0]
