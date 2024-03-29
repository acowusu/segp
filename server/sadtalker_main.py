import glob
import os
import subprocess
from base64 import b64encode
from datetime import datetime

import uvicorn
from fastapi import FastAPI
from fastapi import Form
from fastapi import HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing_extensions import Annotated


class SadTalker(BaseModel):
    """ """

    driven_audio: Annotated[str, Form()]
    source_image: Annotated[str, Form()]


app = FastAPI(root_path="/v4")


@app.get("/")
def read_root():
    """ """
    return {"msg": "Hello World"}


def is_valid_path(path):
    """

    :param path:

    """
    return path.startswith("/")


def is_valid_audio_extension(path):
    """

    :param path:

    """
    _, extension = os.path.splitext(path)
    valid_audio_extensions = [".wav", ".mp3"]

    if extension.lower() not in valid_audio_extensions:
        return False

    return True


def is_valid_image_extension(path):
    """

    :param path:

    """
    _, extension = os.path.splitext(path)
    valid_image_extensions = [".png", ".mp4"]

    if extension.lower() not in valid_image_extensions:
        return False

    return True

@app.get("/status")
async def status():
    return {"status": "ok"}

@app.post("/avatar/")
async def animate_portrait(sadtalker: SadTalker):
    try:
        if not is_valid_path(sadtalker.driven_audio):
            raise HTTPException(status_code=400,
                                detail="Invalid driven_audio path")
        if not is_valid_path(sadtalker.source_image):
            raise HTTPException(status_code=400,
                                detail="Invalid source_image path")
        if not is_valid_audio_extension(sadtalker.driven_audio):
            raise HTTPException(status_code=400,
                                detail="Invalid driven_audio extension")
        if not is_valid_image_extension(sadtalker.source_image):
            raise HTTPException(status_code=400,
                                detail="Invalid source_image extension")

        os.chdir("/home/ls1221/segp/server/SadTalker")
        results_dir = "/www/sadtalker_results/"
        command = [
            "python3",
            "inference.py",
            "--driven_audio",
            sadtalker.driven_audio,
            "--source_image",
            sadtalker.source_image,
            "--enhancer",
            "gfpgan",
            "--result_dir",
            results_dir,
        ]
        subprocess.run(command, check=True, capture_output=True, shell=False)

        # get the last from results
        results = sorted(os.listdir(results_dir))
        mp4_name = results[-1]
        path = results_dir + results[-1]
        response = FileResponse(path=path, filename=mp4_name, media_type="video/mp4")

        return response

    except subprocess.CalledProcessError:
        raise HTTPException(status_code=500, detail="Subprocess call error")
    except Exception:
        raise HTTPException(status_code=500, detail="Internal server error")


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8894)
