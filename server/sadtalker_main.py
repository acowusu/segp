from fastapi import FastAPI, Form
from typing_extensions import Annotated
from pydantic import BaseModel
import subprocess
from datetime import datetime
import uvicorn
from base64 import b64encode
import os
import glob


class SadTalker(BaseModel):
    driven_audio: Annotated[str, Form()]
    source_image: Annotated[str, Form()]


app = FastAPI()


@app.get("/")
def read_root():
    return {"msg": "Hello World"}


@app.post("/avatar/")
async def animate_portrait(sadtalker: SadTalker):
    try:
        results_dir = "../../../../../www/sadtalker_results/"
        os.chdir("./SadTalker")
        command = [
            "python3", "inference.py",
            "--driven_audio", sadtalker.driven_audio,
            "--source_image", sadtalker.source_image,
            "--enhancer", "gfpgan",
            "--result_dir", results_dir
        ]
        print(' '.join(command))
        subprocess.run(command, check=True)

        # get the last from results
        print(os.listdir(results_dir))
        results = sorted(os.listdir(results_dir))
        mp4_name = glob.glob(results_dir + '*.mp4')[0]
        mp4 = open('{}'.format(mp4_name), 'rb').read()
        data_url = "data:video/mp4;base64," + b64encode(mp4).decode()

        # Return data url
        return {
            "message": "Returned animation: {}".format(mp4_name),
            "data_url": data_url
        }
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8888)
