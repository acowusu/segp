import io
import tempfile
import wave

# from fastapi.responses import StreamingResponse
import uvicorn
from fastapi import FastAPI, Request, Response
from fastapi.responses import FileResponse
from TTS.api import TTS
# You'll need to install Coqui TTS: pip install TTS
from TTS.utils.synthesizer import Synthesizer

app = FastAPI(root_path="/v0")
tts = TTS(model_name="tts_models/en/jenny/jenny", progress_bar=False)


@app.post("/generate_audio")
async def generate_audio(request: Request):
    request_body = await request.json()
    script = request_body.get("script")

    if not script:
        return Response("Missing 'script' field in request", status_code=400)

    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as temp_audio_file:
        tts.tts_to_file(text=script, file_path=temp_audio_file)

        # Approximate duration
        with wave.open(temp_audio_file, "r") as wav_file:
            frames = wav_file.getnframes()
            rate = wav_file.getframerate()
            duration = frames / float(rate)

        # Send the temporary file as the response
        response = FileResponse(
            path=temp_audio_file.name,
            filename="generated_audio.wav",  # Set a desired filename
            media_type="audio/wav",
            headers={"Content-Disposition": "inline", "Audio-Duration": str(duration)},
        )

    return response


# 8890
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8890)
