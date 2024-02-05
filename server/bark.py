# from IPython.display import Audio
from transformers import BarkModel

model = BarkModel.from_pretrained("suno/bark-small")
import torch

device = "cuda:0" if torch.cuda.is_available() else "cpu"
model = model.to(device)
from transformers import AutoProcessor

processor = AutoProcessor.from_pretrained("suno/bark")
text_prompt = "Let's try generating speech, with Bark, a text-to-speech model"
inputs = processor(text_prompt, voice_preset="fr_speaker_3")

# generate speech
speech_output = model.generate(**inputs.to(device))

sampling_rate = model.generation_config.sample_rate
# Audio(speech_output[0].cpu().numpy(), rate=sampling_rate)

import scipyd

scipy.io.wavfile.write("bark_out.wav", rate=sampling_rate, data=speech_output[0].cpu().numpy())