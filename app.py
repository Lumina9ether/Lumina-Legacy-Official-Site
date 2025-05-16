
from flask import Flask, request, render_template
from google.cloud import texttospeech
import os

app = Flask(__name__)

os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "lumina-voice-ai.json"

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/speak', methods=['POST'])
def speak():
    try:
        data = request.json
        text = data.get("text", "Welcome to Lumina Legacy. I am your AI assistant.")

        client = texttospeech.TextToSpeechClient()
        input_text = texttospeech.SynthesisInput(text=text)

        voice = texttospeech.VoiceSelectionParams(
            language_code="en-US",
            name="en-US-Wavenet-D",
            ssml_gender=texttospeech.SsmlVoiceGender.FEMALE
        )

        audio_config = texttospeech.AudioConfig(audio_encoding=texttospeech.AudioEncoding.MP3)
        response = client.synthesize_speech(input=input_text, voice=voice, audio_config=audio_config)

        output_path = "static/greeting.mp3"
        with open(output_path, "wb") as out:
            out.write(response.audio_content)

        return {"audio": "/static/greeting.mp3"}
    except Exception as e:
        return {"error": str(e)}, 500

if __name__ == "__main__":
    app.run(debug=True)
