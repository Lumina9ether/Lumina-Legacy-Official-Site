
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import openai
import os

app = Flask(__name__)
CORS(app)

# Initialize OpenAI client using new SDK format
client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

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
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are Lumina, a cosmic and helpful AI assistant."},
                {"role": "user", "content": question}
            ]
        )
        answer = response.choices[0].message.content.strip()
        return jsonify({"reply": answer})
    except Exception as e:
        return jsonify({"reply": f"Error: {str(e)}"})

@app.route("/speak", methods=["POST"])
def speak():
    data = request.get_json()
    text = data.get("text", "")
    # Placeholder — no audio playback implemented
    return jsonify({"audio": ""})

if __name__ == "__main__":
    app.run(debug=True)
