def seconds_to_srt_time(seconds):
    """Converts seconds to SRT time format

    :param seconds:

    """
    hours = seconds // 3600
    minutes = (seconds % 3600) // 60
    seconds = seconds % 60
    milliseconds = (seconds - int(seconds)) * 1000
    return "%02d:%02d:%02d,%03d" % (hours, minutes, int(seconds), int(milliseconds))


def create_srt(data):
    """Creates SRT format subtitles from data

    :param data:

    """
    subtitles = ""
    start_time = 0
    for idx, clip in enumerate(data, start=1):
        end_time = start_time + clip["duration"]
        subtitle_text = clip["text"]
        subtitle = f"{idx}\n{seconds_to_srt_time(start_time)} --> {seconds_to_srt_time(end_time)}\n{subtitle_text}\n\n"
        subtitles += subtitle
        start_time = end_time
    return subtitles


data = [
    {
        "audioUrl": "http://localhost:8888/audio/5802178923580196912.mp3",
        "duration": 5.296,
        "text": "The sun was setting behind the distant mountains, casting a warm glow over the tranquil valley below.",
    },
    {
        "audioUrl": "http://localhost:8888/audio/8816817326943404923.mp3",
        "duration": 3.942,
        "text": "Birds chirped softly in the trees, and a gentle breeze rustled the leaves.",
    },
    {
        "audioUrl": "http://localhost:8888/audio/-1336862706260963644.mp3",
        "duration": 6.491,
        "text": "As the evening descended, the sky turned into a canvas of vibrant colors, painting the horizon with shades of orange, pink, and purple.",
    },
    {
        "audioUrl": "http://localhost:8888/audio/-4072941278507644217.mp3",
        "duration": 3.942,
        "text": "It was a peaceful scene, a moment of serenity amidst the chaos of the world.",
    },
]

# Generate subtitles
subtitles = create_srt(data)

# Write subtitles to a file
with open("subtitles.srt", "w") as file:
    file.write(subtitles)
