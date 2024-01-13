import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {

  // Call gpt with the data

  const pdfBody = await req.json()
  const data = pdfBody.data
  console.log(data)
  
  return NextResponse.json({scripts: scriptData, status: 200});
  // return NextResponse.json({data: [], status: 200});
}




const scriptData = 
[
  {
      "section": "Introduction",
      "script1": "Welcome to our exploration of one of the most influential breakthroughs in the field of deep learning: the architecture of AlexNet. This neural network not only won the ImageNet Challenge but also revolutionized the way we approach image classification.",
      "script2": "Today, we're diving into the world of deep learning to unravel the secrets behind AlexNet's architecture, a model that transformed the landscape of computer vision and neural networks."
  },
  {
      "section": "Overview of AlexNet's Architecture",
      "script1": "AlexNet is designed with eight layers. The first five are convolutional layers, essential for picking up features and patterns in images, and the remaining three are fully connected layers that classify these features into 1000 different categories.",
      "script2": "Let's break down AlexNet's structure. It comprises eight layers, with the initial five being convolutional layers for feature detection. The last three are fully connected layers, focusing on classifying these features into one of 1000 categories."
  },
  {
      "section": "Convolutional Layers",
      "script1": "In the convolutional layers, the first one stands out with its 96 kernels of size 11x11x3. These layers progressively understand complex patterns, from simple edges in the initial layers to intricate details in deeper layers.",
      "script2": "The first convolutional layer uses 96 unique kernels of size 11x11x3 to capture basic patterns. As we move deeper, these layers get sophisticated, recognizing complex aspects of images, a hallmark of AlexNet's powerful feature detection."
  },
  {
      "section": "Fully Connected Layers",
      "script1": "Transitioning from convolutional layers, we have three fully connected layers. Each of these has a vast number of neurons: 4096 in the first two and 1000 in the last, fine-tuning the network's decision-making process.",
      "script2": "The journey through AlexNet leads us to its three fully connected layers. Packed with neurons, these layers are where the network makes sense of the information, culminating in the final layer with 1000 neurons for classification."
  },
  {
      "section": "Unique Features of AlexNet",
      "script1": "AlexNet introduced several innovative features. Notably, it used ReLU activation to speed up training. It also applied dropout and data augmentation techniques to reduce overfitting, making the network both efficient and robust.",
      "script2": "Among its pioneering features, AlexNet utilized ReLU activation for faster training and introduced dropout and data augmentation strategies. These features collectively enhanced the model's efficiency and generalization capabilities."
  },
  {
      "section": "Conclusion",
      "script1": "AlexNet's architecture was a milestone in deep learning, setting new standards for neural network design. Its influence extends beyond ImageNet, paving the way for future innovations in image recognition.",
      "script2": "As we conclude, it's clear that AlexNet isn't just a model; it's a beacon in deep learning history. Its architecture has inspired a generation of neural networks, revolutionizing image classification as we know it."
  }
]
