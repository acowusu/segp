# This is responsible for running the image model
# https://iguana.alexo.uk/v2/image
import json
import os
import uuid
from io import BytesIO
from typing import Any
from typing import AsyncGenerator
from typing import Dict
from typing import TypedDict
from typing import Union

import bentoml
import numpy as np
import pandas as pd
import torch
import uvicorn
from bentoml.io import Image
from bentoml.io import JSON
from bentoml.io import Multipart
from bentoml.io import NumpyNdarray
from fastapi import FastAPI
from fastapi import Form
from fastapi import Response
from fastapi.responses import StreamingResponse
from openllm import LLM
from pydantic import BaseModel
from typing_extensions import Annotated
# llm = LLM(model_id="TheBloke/Mistral-7B-Instruct-v0.1-AWQ", quantization='awq', dtype='half', gpu_memory_utilization=.95, max_model_len=8192,  backend="vllm")
# dataautogpt3/ProteusV0.2
# LDA
# Bert Topic

# sudo mount -t tmpfs -o size=100000m tmpfs /hf
os.environ["HF_HOME"] = "/hf"


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
bentoml.diffusers.import_model(
    "proteus",
    "dataautogpt3/ProteusV0.2",
)
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

# @bentoml.service(
#     resources={"cpu": "2"},
#     traffic={"timeout": 10},
# )
svc = bentoml.Service("anything_v3", runners=[anything_v3_runner])


@svc.api(input=JSON(), output=Image())
def txt2img(input_data):
    """

    :param input_data:

    """
    images, _ = anything_v3_runner.run(**input_data)
    return images[0]


fastapi_app = FastAPI(root_path="/v2")
svc.mount_asgi_app(fastapi_app)


@fastapi_app.post("/image")
async def predict_async(
    prompt: Annotated[str, Form()],
    negative_prompt: Annotated[str, Form()],
    width: Annotated[int, Form()],
    height: Annotated[int, Form()],
    num_inference_steps: Annotated[int, Form()],
):
    images = anything_v3_runner.run(
        prompt=prompt,
        width=width,
        height=height,
        negative_prompt=negative_prompt,
        num_inference_steps=num_inference_steps,
    )
    print(images[0][0])
    filtered_image = BytesIO()
    images[0][0].save(filtered_image, "JPEG")
    filtered_image.seek(0)
    return StreamingResponse(filtered_image, media_type="image/jpeg")


if __name__ == "__main__":
    uvicorn.run(fastapi_app, host="0.0.0.0", port=8892)
