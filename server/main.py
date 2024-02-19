from fastapi import FastAPI, Form

from openllm import LLM
from typing import Any, AsyncGenerator, Dict, TypedDict, Union

from typing_extensions import Annotated
import uuid

import uvicorn
import json

import torch
from transformers import AutoTokenizer, AutoModelForCausalLM, BitsAndBytesConfig

model_id = "mistralai/Mixtral-8x7B-Instruct-v0.1"
tokenizer = AutoTokenizer.from_pretrained(model_id)

quantization_config = BitsAndBytesConfig(
    load_in_4bit=True, bnb_4bit_compute_dtype=torch.float16
)
model = AutoModelForCausalLM.from_pretrained(
    model_id, quantization_config=quantization_config
)

app = FastAPI(root_path="/v1")


@app.post("/generate")
async def generate(
    prompt: Annotated[str, Form()], temperature: Annotated[float, Form()]
):
    inputs = tokenizer(prompt, return_tensors="pt").to(0)
    output = model.generate(**inputs, max_new_tokens=8192)
    json_data = tokenizer.decode(output[0], skip_special_tokens=True)
    return json_data


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8888)
