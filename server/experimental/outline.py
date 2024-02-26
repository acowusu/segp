import json
import outlines
from jsonformer.main import Jsonformer
from jsonformer.format import highlight_values
from transformers import AutoTokenizer, AutoModelForCausalLM, BitsAndBytesConfig
from dataclasses import Field
from fastapi import FastAPI, Form
from typing_extensions import Annotated
import uvicorn
import torch
import os
# os.environ['HF_HOME'] = '/hf'

os.environ["PYTORCH_CUDA_ALLOC_CONF"] = "max_split_size_mb:512"
# model_id = "google/gemma-7b-it"

quantization_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_compute_dtype=torch.float16
)

model = outlines.models.transformers("mistralai/Mixtral-8x7B-Instruct-v0.1",model_kwargs= {"quantization_config":quantization_config}    )

# model_id = "mistralai/Mixtral-8x7B-Instruct-v0.1"
# tokenizer = AutoTokenizer.from_pretrained(model_id, use_auth_token=True)
# if tokenizer.pad_token_id is None:
#     # Required for batching example
#     tokenizer.pad_token_id = tokenizer.eos_token_id
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


# quantization_config = BitsAndBytesConfig(
#     load_in_4bit=True,
#     bnb_4bit_compute_dtype=torch.float16
# )
# model = AutoModelForCausalLM.from_pretrained(
#     model_id,
#     device_map="auto",
#     quantization_config=quantization_config
#     )


app = FastAPI(root_path="/v3")


@app.post("/generate")
async def generate(prompt: Annotated[str, Form()], temperature: Annotated[float, Form()], max_new_tokens: Annotated[int, Form()] = 8192, max_string_token_length: Annotated[int, Form()] = 100, schema: Annotated[str, Form()] = topics):
    # inputs = tokenizer(prompt, return_tensors="pt").to(0)
    # schema = json.loads(schema)
    generator = outlines.generate.json(model, schema)
    output = generator(prompt)
    return {"response": output}

@app.get("/status")
async def status():
    return {"status": "ok"}
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8893)
