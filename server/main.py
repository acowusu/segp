from fastapi import FastAPI, Form
from openllm import LLM
from typing import Any, AsyncGenerator, Dict, TypedDict, Union

from typing_extensions import Annotated
import uuid

import uvicorn
import json
# llm = LLM("TheBloke/Llama-2-13B-chat-GPTQ", backend="vllm"  )
# llm = LLM("TheBloke/Mixtral-8x7B-Instruct-v0.1-GPTQ", backend="vllm"  )
llm = LLM(model_id="TheBloke/Mistral-7B-Instruct-v0.1-AWQ", quantization='awq', dtype='half', gpu_memory_utilization=.95, max_model_len=8192,  backend="vllm")
app = FastAPI(root_path="/v1")

@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.post("/login/")
async def login(username: Annotated[str, Form()], password: Annotated[str, Form()]):
    return {"username": username}

@app.post("/generate")
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
    # response_json = json.dumps(response)
    # print(response_json)
    # return response_json

@app.post("/instruct")
async def generate(instructions: Annotated[str, Form()],prompt: Annotated[str, Form()], temperature: Annotated[float, Form()]):
    request_id = f"tinyllm-{uuid.uuid4().hex}"
    previous_texts = [[]] * 1
    prompt= f"[INST] <<SYS>>{instructions}<</SYS>>{prompt}[/INST]"
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