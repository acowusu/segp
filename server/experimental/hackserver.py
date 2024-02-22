import time

import requests
import scipy
import torch
from flask import Flask, jsonify, request
from flask_cors import CORS
from openai import OpenAI
from transformers import AutoProcessor, BarkModel

client = OpenAI()

headers = {"Authorization": "Bearer ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~"}
STT_API_URL = "https://api-inference.huggingface.co/models/openai/whisper-large"

GPT_KEY = "api_key (removed for the purpose of demo, no time to create .env file)"

app = Flask(__name__)
CORS(app)


@app.route("/api/speech_to_text", methods=["POST"])
def query():
    """ """
    file = request.files["audioFile"]
    response = requests.post(STT_API_URL, headers=headers, data=file)

    print(response)
    return response.json()


@app.router("generate_response", methods=["POST"])
def gen_res():
    """ """
    data = request.files["convo"]

    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {
                "role": "system",
                "content": "You are a helpful language tutor! please help assist your students with their leearning. Today, the topic of discussion will be"
                + data["topic"],
            },
            {"role": "user", "content": data["chat"]},
        ],
    )
    return response.json()


# from IPython.display import Audio


@app.route("/api/tts", methods=["POST"])
def tts():
    """ """
    text_prompt = "Let's try generating speech, with Bark, a text-to-speech model"
    inputs = processor(text_prompt, voice_preset="fr_speaker_3")

    # generate speech
    speech_output = model.generate(**inputs.to(device))

    sampling_rate = model.generation_config.sample_rate
    # Audio(speech_output[0].cpu().numpy(), rate=sampling_rate)

    scipy.io.wavfile.write(
        "bark_out.wav", rate=sampling_rate, data=speech_output[0].cpu().numpy()
    )

    return


model = BarkModel.from_pretrained("suno/bark-small")

device = "cuda:0" if torch.cuda.is_available() else "cpu"
model = model.to(device)

processor = AutoProcessor.from_pretrained("suno/bark")
# text_prompt = "Let's try generating speech, with Bark, a text-to-speech model"
# inputs = processor(text_prompt, voice_preset="fr_speaker_3")

# # generate speech
# speech_output = model.generate(**inputs.to(device))

# sampling_rate = model.generation_config.sample_rate
# # Audio(speech_output[0].cpu().numpy(), rate=sampling_rate)

# scipy.io.wavfile.write("bark_out.wav", rate=sampling_rate, data=speech_output[0].cpu().numpy())


if __name__ == "__main__":
    app.run(debug=True)
