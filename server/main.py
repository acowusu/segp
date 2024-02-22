from fastapi import FastAPI, Form
from openllm import LLM
from typing import Any, AsyncGenerator, Dict, TypedDict, Union
import torch
from diffusers import StableDiffusionPipeline
import bentoml
from bentoml.io import Image, JSON, Multipart
from typing_extensions import Annotated
import uuid

# LDA
# Bert Topic
import uvicorn
import json

# llm = LLM("TheBloke/Llama-2-13B-chat-GPTQ", backend="vllm"  )
# llm = LLM("TheBloke/Mixtral-8x7B-Instruct-v0.1-GPTQ", backend="vllm"  )
llm = LLM(
    model_id="TheBloke/Mistral-7B-Instruct-v0.1-AWQ",
    quantization="awq",
    dtype="half",
    gpu_memory_utilization=0.95,
    max_model_len=8192,
    backend="vllm",
)
# llm = LLM("mistralai/Mixtral-8x7B-Instruct-v0.1", backend="vllm"  )
# stable_diffusion =  bentoml.diffusers_simple.stable_diffusion.create_runner("CompVis/stable-diffusion-v1-4")
# stable_diffusion_runner = bento_model.to_runner()
# stable_diffusion_runner = bentoml.diffusers_simple.stable_diffusion.create_runner("CompVis/stable-diffusion-v1-4")
# svc = bentoml.Service("anything_v3", runners=[stable_diffusion_runner])
bentoml.diffusers.import_model(
    "anything-v3",
    "Linaqruf/anything-v3.0",
)
bento_model = bentoml.diffusers.get("anything-v3:latest")
anything_v3_runner = bento_model.to_runner()

svc = bentoml.Service("anything_v3", runners=[anything_v3_runner])


@svc.api(input=JSON(), output=Image())
def txt2img(input_data):
    images, _ = anything_v3_runner.run(**input_data)
    return images[0]


app = FastAPI(root_path="/v1")
svc.mount_asgi_app(app)


@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.post("/image")
async def login(
    prompt: Annotated[str, Form()],
    width: Annotated[str, Form()],
    height: Annotated[str, Form()],
):
    res = anything_v3_runner.run(prompt=prompt, width=width, height=height)
    return images[0]


@app.post("/login/")
async def login(username: Annotated[str, Form()], password: Annotated[str, Form()]):
    return {"username": username}


@app.post("/generate")
async def generate(
    prompt: Annotated[str, Form()], temperature: Annotated[float, Form()]
):
    request_id = f"tinyllm-{uuid.uuid4().hex}"
    previous_texts = [[]] * 1

    generator = llm.generate_iterator(
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


@app.post("/instruct")
async def generate(
    instructions: Annotated[str, Form()],
    prompt: Annotated[str, Form()],
    temperature: Annotated[float, Form()],
):
    request_id = f"tinyllm-{uuid.uuid4().hex}"
    previous_texts = [[]] * 1
    prompt = f"[INST] <<SYS>>{instructions}<</SYS>>{prompt}[/INST]"
    generator = llm.generate_iterator(
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


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8888)
