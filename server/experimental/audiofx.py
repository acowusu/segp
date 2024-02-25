import io
import os
import tempfile
import time
import wave
from turtle import st

import scipy
import torch
import torchaudio
import uvicorn
from audiocraft.data.audio import audio_write
from audiocraft.models import AudioGen
from fastapi import FastAPI
from fastapi import Request
from fastapi import Response
from fastapi.responses import FileResponse

# sudo mount -t tmpfs -o size=100000m tmpfs /hf
os.environ["HF_HOME"] = "/hf"
# from fastapi.responses import StreamingResponse

# You'll need to install Coqui TTS: pip install TTS
app = FastAPI(root_path="/v7")

# synthesiser = pipeline("text-to-audio", "facebook/musicgen-large")

device = "cuda:0" if torch.cuda.is_available() else "cpu"
model = AudioGen.get_pretrained("facebook/audiogen-medium")  # .to(device)

# model     = model.to(device)
# processor = processor.to(device)


@app.get("/status")
async def status():
    return {"status": "ok"}


@app.post("/generate_audio")
async def generate_audio(request: Request):
    request_body = await request.json()
    script = request_body.get("script")
    duration = request_body.get("duration")
    print(duration)
    model.set_generation_params(duration=duration)  # generate 5 seconds.
    print(duration)
    if not script:
        return Response("Missing 'script' field in request", status_code=400)

    # music = synthesiser(script, forward_params={"do_sample": True})

    wav = model.generate([script])  # generates 3 samples.

    with tempfile.NamedTemporaryFile(suffix=".wav",
                                     delete=False) as temp_audio_file:
        scipy.io.wavfile.write(temp_audio_file,
                               rate=model.sample_rate,
                               data=wav[0, 0].cpu().numpy())

        # audio_write(temp_audio_file.name, wav[0].cpu(), model.sample_rate, strategy="loudness", loudness_compressor=True)

        response = FileResponse(
            path=temp_audio_file.name,
            filename="generated_audio.wav",  # Set a desired filename
            media_type="audio/wav",
            headers={
                "Content-Disposition": "inline",
                # "Audio-Duration": str(duration),
                "Media-location": str(temp_audio_file.name),
            },
        )

    return response


# 8890
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8897)
