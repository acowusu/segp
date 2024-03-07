from dataclasses import Field
from fastapi import FastAPI, Form, HTTPException
from typing_extensions import Annotated
import uvicorn
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM, BitsAndBytesConfig
import sys

model_id = "mistralai/Mixtral-8x7B-Instruct-v0.1"
tokenizer = AutoTokenizer.from_pretrained(model_id)

quantization_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_compute_dtype=torch.float16
)
model = AutoModelForCausalLM.from_pretrained(
    model_id, quantization_config=quantization_config)

app = FastAPI(root_path="/v3")


@app.post("/generate")
async def generate(prompt: Annotated[str, Form()], temperature: Annotated[float, Form()], max_new_tokens: Annotated[int, Form()] = 8192):
    try:
        inputs = tokenizer(prompt, return_tensors="pt").to(0)
        output = model.generate(
            **inputs, temperature=temperature, max_new_tokens=max_new_tokens)
        json_data = (tokenizer.decode(output[0], skip_special_tokens=True))
        return {"response": json_data}
    except torch.cuda.OutOfMemoryError:
        sys.exit(1)
    except Exception:
        raise HTTPException(status_code=500, detail="Internal server error")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8893)
