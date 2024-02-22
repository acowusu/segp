import bentoml
from PIL.Image import Image
from typing import Optional, AsyncGenerator, List
from openllm import LLM
import uuid

IMAGE_MODEL_ID = "proteus:latest"
LLM_MODEL_ID = "TheBloke/Mixtral-8x7B-v0.1-GPTQ"
sample_prompt = (
    "A cinematic shot of a baby racoon wearing an intricate italian priest robe."
)

MAX_TOKENS = 1024
PROMPT_TEMPLATE = """<s>[INST] <<SYS>>
You are a helpful, respectful and honest assistant. Always answer as helpfully as possible, while being safe. Your answers should not include any harmful, unethical, racist, sexist, toxic, dangerous, or illegal content. Please ensure that your responses are socially unbiased and positive in nature.

If a question does not make any sense, or is not factually coherent, explain why instead of answering something not correct. If you don't know the answer to a question, please don't share false information.
<</SYS>>

{user_prompt} [/INST] """


@bentoml.service(
    traffic={"timeout": 500},
    workers=1,
    resources={
        "memory": "45000Mi",
        "gpu": 2,
    },
    # http={"port": 5000}
)
class SDXLTurbo:
    def __init__(self) -> None:
        self.pipe = bentoml.diffusers.load_model(IMAGE_MODEL_ID)

    @bentoml.api
    def txt2img(
        self,
        prompt: str = sample_prompt,
        num_inference_steps: int = 1,
        width: int = 512,
        height: int = 512,
        negative_prompt: str = "",
        guidance_scale: float = 0.0,
    ) -> Image:
        image = self.pipe(
            prompt=prompt,
            num_inference_steps=num_inference_steps,
            guidance_scale=guidance_scale,
            width=width,
            height=height,
            negative_prompt=negative_prompt,
        ).images[0]
        return image


@bentoml.service(
    traffic={
        "timeout": 500,
    },
    resources={
        "gpu": 2,
    },
    # http={"port": 5000}
)
class LLMGenerator:
    def __init__(self) -> None:
        # self.model = LLM(LLM_MODEL_ID)
        self.model = LLM(
            model_id="TheBloke/Mistral-7B-Instruct-v0.1-AWQ",
            quantization="awq",
            dtype="half",
            gpu_memory_utilization=0.95,
            max_model_len=8192,
            backend="vllm",
        )

    @bentoml.api
    async def generate(
        self,
        prompt: str = "Explain superconductors like I'm five years old",
        temperature: float = 1,
    ) -> AsyncGenerator[str, None]:
        request_id = f"tinyllm-{uuid.uuid4().hex}"
        previous_texts = [[]] * 1

        generator = self.model.generate_iterator(
            prompt, request_id=request_id, n=1, temperature=temperature
        )

        async def streamer() -> AsyncGenerator[str, None]:
            async for request_output in generator:
                for output in request_output.outputs:
                    i = output.index
                    previous_texts[i].append(output.text)
                    yield output.text

        async for _ in streamer():
            pass
        return "".join(previous_texts[0])


@bentoml.service(
    traffic={
        "timeout": 500,
    },
    resources={"cpu": "1"},
    # http={"port": 5000}
)
class controller:
    image_service = bentoml.depends(SDXLTurbo)
    llm_service = bentoml.depends(LLMGenerator)

    def __init__(self) -> None:
        pass

    @bentoml.api
    async def generate(
        self,
        prompt: str = "Explain superconductors like I'm five years old",
        temperature: float = 1,
    ) -> AsyncGenerator[str, None]:
        return await self.llm_service.generate(prompt, temperature)

    @bentoml.api
    def txt2img(
        self,
        prompt: str = sample_prompt,
        num_inference_steps: int = 1,
        width: int = 512,
        height: int = 512,
        negative_prompt: str = "",
        guidance_scale: float = 0.0,
    ) -> Image:
        return self.image_service.txt2img(
            prompt, num_inference_steps, width, height, negative_prompt, guidance_scale
        )
