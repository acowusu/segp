import io
import os
import tempfile
import wave
from turtle import st

import scipy
import torch
import uvicorn
from fastapi import FastAPI
from fastapi import Request
from fastapi import Response
from fastapi.responses import FileResponse
from transformers import AutoProcessor
from transformers import MusicgenForConditionalGeneration
from transformers import pipeline

# sudo mount -t tmpfs -o size=100000m tmpfs /hf
os.environ["HF_HOME"] = "/hf"
# from fastapi.responses import StreamingResponse

# You'll need to install Coqui TTS: pip install TTS
app = FastAPI(root_path="/v6")

# synthesiser = pipeline("text-to-audio", "facebook/musicgen-large")

device = "cuda:0" if torch.cuda.is_available() else "cpu"
processor = AutoProcessor.from_pretrained("facebook/musicgen-large")
model = MusicgenForConditionalGeneration.from_pretrained(
    "facebook/musicgen-large").to(device)

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
    duration = int(duration) * model.config.audio_encoder.frame_rate
    print(duration)
    if not script:
        return Response("Missing 'script' field in request", status_code=400)

    # music = synthesiser(script, forward_params={"do_sample": True})
    inputs = processor(
        text=[script],
        padding=True,
        return_tensors="pt",
    ).to(device)
    outputs = model.generate(**inputs, max_new_tokens=duration)

    with tempfile.NamedTemporaryFile(suffix=".wav",
                                     delete=False) as temp_audio_file:
        sampling_rate = model.config.audio_encoder.sampling_rate
        scipy.io.wavfile.write(temp_audio_file,
                               rate=sampling_rate,
                               data=outputs[0, 0].cpu().numpy())

        # Approximate duration
        # with wave.open(temp_audio_file, "r") as wav_file:
        #     frames = wav_file.getnframes()
        #     rate = wav_file.getframerate()
        #     duration = frames / float(rate)

        # Send the temporary file as the response
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
    uvicorn.run(app, host="0.0.0.0", port=8896)
