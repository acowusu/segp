import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {

  // Call gpt with the data

  const pdfBody = await req.json()
  const data = pdfBody.data
  console.log(data)
  
  return NextResponse.json({scripts: scriptData, status: 200});
  // return NextResponse.json({data: [], status: 200});
}


export const scriptData = 
[
    {
        "section": "Introduction to AlexNet",
        "scripts": [
            "Welcome to our deep dive into the world of neural networks. Today, we're unraveling the architecture of AlexNet, the model that revolutionized image classification in the ImageNet challenge.",
            "Embark on a journey through the layers of AlexNet, the neural network that marked a milestone in the ImageNet competition, setting new standards for image classification."
        ]
    },
    {
        "section": "Overview of AlexNet's Structure",
        "scripts": [
            "AlexNet is more than just a neural network; it's a deep convolutional neural network with eight learned layers. Five of these are convolutional, and the remaining three are fully-connected, each playing a critical role in image classification.",
            "Dive into the intricacies of AlexNet's architecture: eight layers deep, with a unique composition of five convolutional layers followed by three fully-connected layers. This structure is meticulously designed to process millions of images with astounding accuracy."
        ]
    },
    {
        "section": "The Role of Convolutional Layers",
        "scripts": [
            "The convolutional layers are the detectives of AlexNet, uncovering patterns and features in images. Each layer filters the inputs, making sense of the complex visual data, and passing on the most crucial information to the next layer.",
            "Imagine each convolutional layer in AlexNet as a magnifying glass, scrutinizing different aspects of the image, from edges and textures to complex patterns, refining the understanding of the image with each layer."
        ]
    },
    {
        "section": "ReLU Nonlinearity: The Secret Ingredient",
        "scripts": [
            "AlexNet's secret ingredient is the ReLU, or Rectified Linear Unit. This non-saturating nonlinearity means AlexNet learns faster, making it more efficient than its predecessors with traditional neuron models.",
            "At the heart of AlexNet's learning prowess lies the ReLU nonlinearity. Unlike traditional models, ReLUs don't saturate, propelling AlexNet to learn at an unprecedented pace, a key to its success."
        ]
    },
    {
        "section": "Harnessing the Power of Multiple GPUs",
        "scripts": [
            "AlexNet isn't just big; it's clever. Spreading its network across two GPUs, it navigates the computational challenges, ensuring each layer, each neuron, contributes to understanding the vast world of images.",
            "In a dance of data and computation, AlexNet leverages dual GPUs, balancing the immense workload, a testament to its innovative design in handling complex, high-resolution images."
        ]
    },
    {
        "section": "Overcoming Overfitting: Dropout Technique",
        "scripts": [
            "In the realm of neural networks, overfitting is the arch-nemesis. AlexNet introduces the dropout technique, turning off neurons randomly during training to ensure the model is robust and generalizes well.",
            "AlexNet's battle strategy against overfitting includes the ingenious dropout technique. By randomly deactivating neurons during training, it ensures the network remains versatile, ready to tackle unseen images."
        ]
    },
    {
        "section": "Data Augmentation: The Art of Diversity",
        "scripts": [
            "Data augmentation is AlexNet's way of ensuring its training is rooted in the richness of the real world. By tweaking and transforming images, it learns to recognize patterns in a myriad of scenarios, boosting its accuracy and reliability.",
            "Through data augmentation, AlexNet doesn't just see an image; it sees possibilities. By manipulating and adjusting images, it learns to understand and classify them in all their diverse and complex forms."
        ]
    },
    {
        "section": "Conclusion: AlexNet's Legacy",
        "scripts": [
            "AlexNet is not just a model; it's a revolution in image classification. Its deep, intricate architecture has paved the way for future innovations, setting new benchmarks in accuracy and efficiency.",
            "As we conclude our journey through AlexNet, it stands as a testament to innovation and precision in the world of deep learning. Its architecture, a blueprint of brilliance, continues to inspire and lead the path forward in image recognition."
        ]
    }
]