from flask import Flask, jsonify, request
import requests
from transformers import BarkModel
import torch
from transformers import AutoProcessor
import scipy

headers = {"Authorization": "Bearer XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"}
STT_API_URL = "https://api-inference.huggingface.co/models/openai/whisper-large"

app = Flask(__name__)

@app.route('/api/speech_to_text', methods=['POST'])
def query():
  file = request.files["audioFile"]
  response = requests.post(STT_API_URL, headers=headers, data=file)    
  return response.json()


# from IPython.display import Audio
@app.route("/api/tts", methods = ["POST"])
def tts():
  text_prompt = "Let's try generating speech, with Bark, a text-to-speech model"
  inputs = processor(text_prompt, voice_preset="fr_speaker_3")

  # generate speech
  speech_output = model.generate(**inputs.to(device))

  sampling_rate = model.generation_config.sample_rate
  # Audio(speech_output[0].cpu().numpy(), rate=sampling_rate)

  scipy.io.wavfile.write("bark_out.wav", rate=sampling_rate, data=speech_output[0].cpu().numpy())

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



if __name__ == '__main__':
    app.run(debug=True)

