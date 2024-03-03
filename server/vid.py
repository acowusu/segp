import math
import os
from io import BytesIO

import bentoml
import PIL
import torch
import uvicorn
from bentoml.io import JSON, Image
from diffusers.utils import export_to_video, load_image
from fastapi import FastAPI, File, Form, UploadFile
from fastapi.responses import FileResponse
from typing_extensions import Annotated

os.environ["HF_HOME"] = "/hf"

MODEL_ID = "stabilityai/stable-video-diffusion-img2vid-xt"

bentoml.diffusers.import_model("svd-xt", MODEL_ID)

bento_model = bentoml.diffusers.get("svd-xt:latest")
svd_runner = bento_model.to_runner()
svd_runner.init_local()

svc = bentoml.Service("svd-xt", runners=[svd_runner])


@svc.api(input=Image(), output=Image())
def img2vid(input_data):
    """

    :param input_data: 

    """
    res = svd_runner.run(**input_data)
    return res[0][0]


app = FastAPI(root_path="/v9")
svc.mount_asgi_app(app)


@app.get("/status")
async def status():
    return {"status": "ok"}


@app.post("/video")
async def generate_video(
    image_file: UploadFile = Form(...),
    fps: Annotated[int, Form()] = 7,
    video_length: Annotated[int, Form()] = 10,
):
    data = await image_file.read()
    image = PIL.Image.open(BytesIO(data))
    image = image.resize((1024, 576))
    image = PIL.ImageOps.exif_transpose(image)
    image = image.convert("RGB")
    generator = torch.manual_seed(42)

    frames = [image]
    no_frames_generated = 25
    iterations = math.ceil(video_length * fps / no_frames_generated)
    for _ in range(iterations):
        ext_image = frames[-1]
        new_frames = svd_runner.run(
            ext_image,
            decode_chunk_size=8,
            generator=generator,
            motion_bucket_id=120,
            noise_aug_strength=0.1,
        )[0][0]
        frames.extend(new_frames[1:])

    # default written to temporary file
    path = export_to_video(frames, fps=fps)

    return FileResponse(path=path, media_type="video/mp4")


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8899)
