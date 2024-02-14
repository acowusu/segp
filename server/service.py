from __future__ import annotations
import uuid
from typing import Any, AsyncGenerator, Dict, TypedDict, Union

from bentoml import Service
from bentoml.io import JSON, Text
from openllm import LLM

# llm = LLM("HuggingFaceH4/zephyr-7b-alpha", backend="vllm")
llm = LLM("TheBloke/Llama-2-13B-chat-GPTQ", backend="vllm"  )
# llm = LLM("mistralai/Mistral-7B-v0.1", backend="vllm", dtype='half')
# llm = LLM("TheBloke/Mixtral-8x7B-Instruct-v0.1-GPTQ", backend="vllm", dtype='half')
# llm = LLM("mistralai/Mixtral-8x7B-Instruct-v0.1", backend="vllm", dtype='half')
# stable_diffusion = bentoml.diffusers_simple.stable_diffusion.create_runner("CompVis/stable-diffusion-v1-4")

# mistralai/Mistral-7B-Instruct-v0.2
#  LLM(model="TheBloke/Mistral-7B-Instruct-v0.1-AWQ",2)
svc = Service("tinyllm", runners=[llm.runner])


class GenerateInput(TypedDict):
    prompt: str
    stream: bool
    sampling_params: Dict[str, Any]


@svc.api(
    route="/v1/generate",
    input=JSON.from_sample(
        GenerateInput(
            prompt="What is time?",
            stream=False,
            sampling_params={"temperature": 0.73},
        )
    ),
    output=Text(content_type="text/event-stream"),
)
async def generate(request: GenerateInput) -> Union[AsyncGenerator[str, None], str]:
    n = request["sampling_params"].pop("n", 1)
    request_id = f"tinyllm-{uuid.uuid4().hex}"
    previous_texts = [[]] * n
    
    print(request_id)

    generator = llm.generate_iterator(
        request["prompt"], request_id=request_id, n=n, **request["sampling_params"]
    )
    # print(generator.outputs[0].text)
    async def streamer() -> AsyncGenerator[str, None]:
        async for request_output in generator:
            for output in request_output.outputs:
                print(output.text)
                i = output.index
                previous_texts[i].append(output.text)
                yield output.text

    if request["stream"]:
        return streamer()

    async for _ in streamer():
        pass
    return "".join(previous_texts[0])