import json
import os
from dataclasses import Field

import torch
import uvicorn
from fastapi import FastAPI
from fastapi import Form
from jsonformer.format import highlight_values
from jsonformer.main import Jsonformer
from transformers import AutoModelForCausalLM
from transformers import AutoTokenizer
from transformers import BitsAndBytesConfig
from typing_extensions import Annotated

os.environ["HF_HOME"] = "/hf"

model_id = "google/gemma-7b-it"
# model_id = "mistralai/Mixtral-8x7B-Instruct-v0.1"
tokenizer = AutoTokenizer.from_pretrained(model_id, use_auth_token=True)
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

quantization_config = BitsAndBytesConfig(load_in_4bit=True,
                                         bnb_4bit_compute_dtype=torch.float16)
model = AutoModelForCausalLM.from_pretrained(
    model_id, device_map="auto", quantization_config=quantization_config)

app = FastAPI(root_path="/v3")


@app.post("/generate")
async def generate(
    prompt: Annotated[str, Form()],
    temperature: Annotated[float, Form()],
    max_new_tokens: Annotated[int, Form()] = 8192,
    max_string_token_length: Annotated[int, Form()] = 100,
    schema: Annotated[str, Form()] = topics,
):
    # inputs = tokenizer(prompt, return_tensors="pt").to(0)
    schema = json.loads(schema)
    topicBuilder = Jsonformer(
        model=model,
        tokenizer=tokenizer,
        json_schema=schema,
        prompt=prompt,
        max_number_tokens=max_new_tokens,
        max_string_token_length=max_string_token_length,
        debug=True,
    )
    # output = model.generate(
    #     **inputs, temperature=temperature, max_new_tokens=max_new_tokens)
    # json_data = (tokenizer.decode(output[0], skip_special_tokens=True))
    output = topicBuilder()
    json_data = highlight_values(output)
    # print(topicBuilder.get_prompt())
    return {"response": output}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8893)
