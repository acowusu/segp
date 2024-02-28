import bentoml
from bentoml.io import Image, JSON
from fastapi import FastAPI, Form
import uvicorn
from typing_extensions import Annotated
from diffusers.utils import load_image, export_to_video
import torch

MODEL_ID= "stabilityai/stable-video-diffusion-img2vid-xt"

bentoml.diffusers.import_model(
        "svd-xt",
        MODEL_ID
)

bento_model = bentoml.diffusers.get("svd-xt:latest")
print(bento_model)
svd_runner = bento_model.to_runner()
svd_runner.init_local()

svc = bentoml.Service("svd-xt",
        runners=[svd_runner])

@svc.api(input=Image(), output=Image())
def img2vid(input_data):
    res = svd_runner.run(**input_data)
    return res[0][0]

app = FastAPI(root_path="/v9")
svc.mount_asgi_app(app)

@app.get("/status")
async def status():
    return {"status": "ok"}

@app.post("/video")
async def generate_video(image_path: Annotated[str, Form()]):
    image = load_image(image_path)
    generator = torch.manual_seed(42)
    frames = svd_runner.run(image, decode_chunk_size=8, generator=generator)[0][0]
    print(frames)
    path = export_to_video(frames, fps=7) # default written to temporary file
    return {"filepath": path}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8899)
