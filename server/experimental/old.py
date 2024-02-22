from __future__ import annotations
from bentoml.io import Image, JSON, Multipart
from diffusers import StableDiffusionImg2ImgPipeline
from diffusers import StableDiffusionPipeline
from torch import autocast
import torch
import uuid
from typing import Any, AsyncGenerator, Dict, TypedDict, Union
import bentoml
from bentoml import Service, diffusers_simple
from bentoml.io import JSON, Text
from openllm import LLM


class StableDiffusionRunnable(bentoml.Runnable):
    SUPPORTED_RESOURCES = ("nvidia.com/gpu",)
    SUPPORTS_CPU_MULTI_THREADING = True

    def __init__(self):
        model_id = "CompVis/stable-diffusion-v1-4"
        self.device = "cuda"

        txt2img_pipe = StableDiffusionPipeline.from_pretrained(
            model_id, torch_dtype=torch.float16, revision="fp16"
        )
        self.txt2img_pipe = txt2img_pipe.to(self.device)

        self.img2img_pipe = StableDiffusionImg2ImgPipeline(
            vae=self.txt2img_pipe.vae,
            text_encoder=self.txt2img_pipe.text_encoder,
            tokenizer=self.txt2img_pipe.tokenizer,
            unet=self.txt2img_pipe.unet,
            scheduler=self.txt2img_pipe.scheduler,
            safety_checker=self.txt2img_pipe.safety_checker,
            feature_extractor=txt2img_pipe.feature_extractor,
        ).to(self.device)

    @bentoml.Runnable.method(batchable=False, batch_dim=0)
    def txt2img(self, input_data):
        prompt = input_data["prompt"]
        guidance_scale = input_data.get("guidance_scale", 7.5)
        height = input_data.get("height", 512)
        width = input_data.get("width", 512)
        num_inference_steps = input_data.get("num_inference_steps", 50)
        with autocast(self.device):
            images = self.txt2img_pipe(
                prompt=prompt,
                guidance_scale=guidance_scale,
                height=height,
                width=width,
                num_inference_steps=num_inference_steps,
            ).images
            image = images[0]
            return image

    @bentoml.Runnable.method(batchable=False, batch_dim=0)
    def img2img(self, init_image, data):
        new_size = None
        longer_side = max(*init_image.size)
        if longer_side > 512:
            new_size = (512, 512)
        elif init_image.width != init_image.height:
            new_size = (longer_side, longer_side)

        if new_size:
            init_image = init_image.resize(new_size)

        prompt = data["prompt"]
        strength = data.get("strength", 0.8)
        guidance_scale = data.get("guidance_scale", 7.5)
        num_inference_steps = data.get("num_inference_steps", 50)
        with autocast(self.device):
            images = self.img2img_pipe(
                prompt=prompt,
                init_image=init_image,
                strength=strength,
                guidance_scale=guidance_scale,
                num_inference_steps=num_inference_steps,
            ).images
            image = images[0]
            return image


# llm = LLM("HuggingFaceH4/zephyr-7b-alpha", backend="vllm")
llm = LLM("TheBloke/Llama-2-13B-chat-GPTQ", backend="vllm")
# stable_diffusion = diffusers_simple.stable_diffusion.create_runner("CompVis/stable-diffusion-v1-4")
# stable_diffusion_runner = bentoml.Runner(StableDiffusionRunnable, name='stable_diffusion_runner', max_batch_size=10)
stable_diffusion_runner = bentoml.Runner(
    StableDiffusionRunnable, name="stable_diffusion_runner", max_batch_size=10
)


# mistralai/Mistral-7B-Instruct-v0.2
#  LLM(model="TheBloke/Mistral-7B-Instruct-v0.1-AWQ",2)
svc = Service("tinyllm", runners=[llm.runner, stable_diffusion_runner])


class GenerateSDInput(TypedDict):
    prompt: str
    negative_prompt: Union[str, None]
    height: int
    width: int
    num_inference_steps: int
    guidance_scale: float
    eta: int
    lora_weights: Union[str, None]


class GenerateInput(TypedDict):
    prompt: str
    stream: bool
    sampling_params: Dict[str, Any]


@svc.api(
    route="/v1/generate",
    input=JSON.from_sample(
        GenerateInput(
            prompt="What is time?",
            stream=False,
            sampling_params={"temperature": 0.73},
        )
    ),
    output=Text(content_type="text/event-stream"),
)
async def generate(request: GenerateInput) -> Union[AsyncGenerator[str, None], str]:
    n = request["sampling_params"].pop("n", 1)
    request_id = f"tinyllm-{uuid.uuid4().hex}"
    previous_texts = [[]] * n

    generator = llm.generate_iterator(
        request["prompt"], request_id=request_id, n=n, **request["sampling_params"]
    )

    async def streamer() -> AsyncGenerator[str, None]:
        async for request_output in generator:
            for output in request_output.outputs:
                i = output.index
                previous_texts[i].append(output.text)
                yield output.text

    if request["stream"]:
        return streamer()

    async for _ in streamer():
        pass
    return "".join(previous_texts[0])


# @svc.api(
#     route="/v1/stable-diffusion",
#     input=JSON.from_sample(GenerateSDInput(
#         prompt="the scene is a picturesque environment with beautiful flowers and trees. In the center, there is a small cat. The cat is shown with its chin being scratched. It is crouched down peacefully. The cat's eyes are filled with excitement and satisfaction as it uses its small paws to hold onto the food, emitting a content purring sound.",
#         negative_prompt=None,
#         height=1024,
#         width=1024,
#         num_inference_steps=50,
#         guidance_scale=7.5,
#         eta=0,
#         lora_weights=None
#     )),
#     output=Image(),
# )
# async def stable_diffusion(request: Dict[str, Any]) -> str:
#     result = stable_diffusion.txt2img.run(request)
#     return result


@svc.api(input=JSON(), output=Image())
def txt2img(input_data):
    return stable_diffusion_runner.txt2img.run(input_data)


img2img_input_spec = Multipart(img=Image(), data=JSON())


@svc.api(input=img2img_input_spec, output=Image())
def img2img(img, data):
    return stable_diffusion_runner.img2img.run(img, data)
