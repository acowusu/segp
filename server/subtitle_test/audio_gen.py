import os
from TTS.api import TTS
from pydub import AudioSegment

def seconds_to_srt_time(seconds):
    """Converts seconds to SRT time format"""
    hours = seconds // 3600
    minutes = (seconds % 3600) // 60
    seconds = seconds % 60
    milliseconds = (seconds - int(seconds)) * 1000
    return "%02d:%02d:%02d,%03d" % (hours, minutes, int(seconds), int(milliseconds))

# Directory to store generated audio files
AUDIO_DIRECTORY = "generated_audio"
# Directory to store generated SRT files
SRT_DIRECTORY = "SrtFiles"

# Ensure the directories exist
os.makedirs(AUDIO_DIRECTORY, exist_ok=True)
os.makedirs(SRT_DIRECTORY, exist_ok=True)

# Initialize TTS Model
tts = TTS(model_name="tts_models/en/jenny/jenny", progress_bar=False)

# Read text from script.txt
with open("script.txt", "r") as file:
    lines = file.readlines()

# Initialize list to store generated data
data = []

# Process each line of text
for line_idx, line in enumerate(lines, start=1):
    # Remove leading and trailing whitespaces
    text = line.strip()

    # Generate file name based on text content
    file_name = f"{hash(text)}.mp3"
    file_path = os.path.join(AUDIO_DIRECTORY, file_name)

    # Generate audio file
    tts.tts_to_file(text=text, file_path=file_path)

    # Get audio duration
    audio = AudioSegment.from_file(file_path)
    audio_duration = len(audio) / 1000

    # Convert audio to SRT format
    srt_file_name = f"{line_idx}.srt"
    srt_file_path = os.path.join(SRT_DIRECTORY, srt_file_name)

    # Generate SRT content
    srt_content = f"{line_idx}\n00:00:00,000 --> {seconds_to_srt_time(audio_duration)}\n{text}\n"

    # Write SRT content to file
    with open(srt_file_path, "w") as srt_file:
        srt_file.write(srt_content)

    # Append data for the current line to the list
    data.append({
        "audioUrl": f"http://localhost:8888/audio/{file_name}",
        "duration": audio_duration,
        "text": text,
        "srtUrl": f"http://localhost:8888/srt/{srt_file_name}"
    })

# Print the generated data
print(data)
