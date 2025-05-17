
from flask import Flask, request, jsonify, render_template, send_file
from flask_cors import CORS
import openai
import os
import uuid
from google.cloud import texttospeech

app = Flask(__name__)
CORS(app)

# OpenAI setup
client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Set up Google Cloud Text-to-Speech
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "lumina-voice-ai.json"
tts_client = texttospeech.TextToSpeechClient()

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/ask", methods=["POST"])
def ask():
    data = request.get_json()
    question = data.get("question", "")
    if not question:
        return jsonify({"reply": "Please ask a question."})

    try:
        memory = load_memory()
        context_intro = (
            f"User Name: {memory['personal'].get('name', '')}
"
            f"Birthday: {memory['personal'].get('birthday', '')}
"
            f"Location: {memory['personal'].get('location', '')}
"
            f"Goal: {memory['business'].get('goal', '')}
"
            f"Niche: {memory['business'].get('niche', '')}
"
            f"Target Income: {memory['business'].get('income_target', '')}
"
            f"Voice Style: {memory['preferences'].get('voice_style', '')}
"
            f"Theme Color: {memory['preferences'].get('theme_color', '')}
"
            f"Recent Mood: {memory['emotional'].get('recent_state', '')}, Motivation Level: {memory['emotional'].get('motivation_level', 0)}"
        )

        conversation = [
            {"role": "system", "content": "You are Lumina, an intelligent and soulful AI who remembers and supports the user with cosmic insight."},
            {"role": "system", "content": f"Here is the user's context: {context_intro}"},
            {"role": "user", "content": question}
        ]

        response = client.chat.completions.create(
            model="gpt-4",
            messages=conversation
        )

        answer = response.choices[0].message.content.strip()
        return jsonify({"reply": answer})
    except Exception as e:
        return jsonify({"reply": f"Error: {str(e)}"})
    except Exception as e:
        return jsonify({"reply": f"Error: {str(e)}"})

@app.route("/speak", methods=["POST"])
def speak():
    data = request.get_json()
    text = data.get("text", "")
    if not text:
        return jsonify({"audio": ""})

    try:
        synthesis_input = texttospeech.SynthesisInput(text=text)
        voice = texttospeech.VoiceSelectionParams(
            language_code="en-US",
            name="en-US-Wavenet-F",  # Choose any preferred voice here
            ssml_gender=texttospeech.SsmlVoiceGender.FEMALE
        )
        audio_config = texttospeech.AudioConfig(
            audio_encoding=texttospeech.AudioEncoding.MP3
        )

        response = tts_client.synthesize_speech(
            input=synthesis_input,
            voice=voice,
            audio_config=audio_config
        )

        filename = f"static/audio_{uuid.uuid4().hex}.mp3"
        with open(filename, "wb") as out:
            out.write(response.audio_content)

        return jsonify({"audio": "/" + filename})
    except Exception as e:
        return jsonify({"audio": "", "error": str(e)})

if __name__ == "__main__":
    app.run(debug=True)
