import json
import os
from dataclasses import Field
from typing import List

import torch
import uvicorn
from fastapi import FastAPI
from fastapi import Form
from lmformatenforcer import JsonSchemaParser
from lmformatenforcer.integrations.transformers import \
    build_transformers_prefix_allowed_tokens_fn
from pydantic import BaseModel
from transformers import AutoModelForCausalLM
from transformers import AutoTokenizer
from transformers import BitsAndBytesConfig
from transformers import pipeline
from typing_extensions import Annotated

os.environ["HF_HOME"] = "/hf"

model_id = "google/gemma-7b-it"
# model_id = "mistralai/Mixtral-8x7B-Instruct-v0.1"
tokenizer = AutoTokenizer.from_pretrained(model_id, use_auth_token=True)


class Sentence(BaseModel):
    """ """
    text: str  # The spoken text of the sentence


class ScriptSection(BaseModel):
    """ """
    title: str
    sentences: List[Sentence]


class Script(BaseModel):
    """ """
    sections: List[ScriptSection]


quantization_config = BitsAndBytesConfig(
    load_in_4bit=True, bnb_4bit_compute_dtype=torch.float16
)
model = AutoModelForCausalLM.from_pretrained(
    model_id, device_map="auto", quantization_config=quantization_config
)

generator = pipeline("text-generation", model=model, tokenizer=tokenizer)

app = FastAPI(root_path="/v3")

topics = """ {
    
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "name": {"type": "string"},
                    "description": {"type": "string"}
                }
            },
            "min": 3,
            "max": 5
        
    }
"""


@app.post("/generate")
async def generate(
    prompt: Annotated[str, Form()],
    temperature: Annotated[float, Form()],
    max_new_tokens: Annotated[int, Form()] = 8192,
    max_string_token_length: Annotated[int, Form()] = 100,
    schema: Annotated[str, Form()] = topics,
):
    parser = JsonSchemaParser(Script.schema())
    prefix_function = build_transformers_prefix_allowed_tokens_fn(tokenizer, parser)

    output_dict = generator(
        prompt,
        prefix_allowed_tokens_fn=prefix_function,
        max_new_tokens=max_new_tokens,
        temperature=temperature,
        max_length=max_string_token_length,
    )
    output = output_dict[0]["generated_text"][len(prompt) :]
    return {"response": json.loads(output)}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8893)
