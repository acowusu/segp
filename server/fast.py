import numpy as np
import pandas as pd
import bentoml
from bentoml.io import NumpyNdarray, JSON
from pydantic import BaseModel
from fastapi.responses import StreamingResponse
from io import BytesIO
from openllm import LLM
from typing import Any, AsyncGenerator, Dict, TypedDict, Union
from fastapi import FastAPI, Form, Response
from openllm import LLM
from typing import Any, AsyncGenerator, Dict, TypedDict, Union
import torch
from diffusers import StableDiffusionPipeline
import bentoml
from bentoml.io import Image, JSON, Multipart
from typing_extensions import Annotated
import uuid
llm = LLM(model_id="TheBloke/Mistral-7B-Instruct-v0.1-AWQ", quantization='awq', dtype='half', gpu_memory_utilization=.95, max_model_len=8192,  backend="vllm")
# dataautogpt3/ProteusV0.2
# LDA
# Bert Topic
import uvicorn
import json
# bentoml.diffusers.import_model(
#     "anything-v3",
#     "Linaqruf/anything-v3.0",
# )
# bentoml.diffusers.import_model(
#     "sd2",
#     "stabilityai/stable-diffusion-2",
# )

# bentoml.diffusers.import_model(
#     "midjourney",
#     "prompthero/openjourney-v4",
# )
# bentoml.diffusers.import_model(
#     "proteus",
#     "dataautogpt3/ProteusV0.2",
# )
# bentoml.diffusers.import_model(
#     "sdvid",
#     "stabilityai/stable-video-diffusion-img2vid-xt",
# )
# bentoml.diffusers.import_model(
#     "sdxl",
#     "stabilityai/stable-diffusion-xl-base-1.0",
# )
# bento_model = bentoml.diffusers.get("anything-v3:latest")
# bento_model = bentoml.diffusers.get("sd2:latest")
# bento_model = bentoml.diffusers.get("sdxl:latest")
bento_model = bentoml.diffusers.get("proteus:latest")

anything_v3_runner = bento_model.to_runner()
anything_v3_runner.init_local()


svc = bentoml.Service("anything_v3", runners=[anything_v3_runner])


@svc.api(input=JSON(), output=Image())
def txt2img(input_data):
    images, _ = anything_v3_runner.run(**input_data)
    return images[0]


fastapi_app = FastAPI(root_path="/v1")
svc.mount_asgi_app(fastapi_app)


@fastapi_app.post(
    "/image"
)
async def predict_async(prompt: Annotated[str, Form()], negative_prompt: Annotated[str, Form()],  width: Annotated[int, Form()],  height: Annotated[int, Form()],   num_inference_steps: Annotated[int, Form()]):
    images = anything_v3_runner.run(prompt=prompt, width=width, height=height,
                                    negative_prompt=negative_prompt, num_inference_steps=num_inference_steps)
    print(images[0][0])
    filtered_image = BytesIO()
    images[0][0].save(filtered_image, "JPEG")
    filtered_image.seek(0)
    return StreamingResponse(filtered_image, media_type="image/jpeg")



@fastapi_app.post("/generate")
async def generate(prompt: Annotated[str, Form()], temperature: Annotated[float, Form()]):
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
if __name__ == "__main__":
    uvicorn.run(fastapi_app, host="0.0.0.0", port=8888)
