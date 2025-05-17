
document.addEventListener("DOMContentLoaded", () => {
    const heyLuminaBtn = document.getElementById("hey-lumina-button");

    async function speak(text) {
        try {
            const response = await fetch("/speak", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ text }),
            });
            const data = await response.json();
            if (data.audio) {
                const audio = new Audio(data.audio);
                await audio.play();
            } else {
                console.error("No audio returned:", data);
            }
        } catch (err) {
            console.error("Failed to speak:", err);
        }
    }

    heyLuminaBtn.addEventListener("click", () => {
        speak("Welcome to Lumina Legacy. I am your AI assistant.");
    });
});

    const stopButton = document.getElementById("stop-button");
    const subtitleBox = document.getElementById("subtitles");

    let currentAudio = null;

    async function speak(text) {
        try {
            const response = await fetch("/speak", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ text }),
            });
            const data = await response.json();
            if (data.audio) {
                if (currentAudio) currentAudio.pause();
                currentAudio = new Audio(data.audio);
                subtitleBox.textContent = text;
                await currentAudio.play();
            } else {
                console.error("No audio returned:", data);
            }
        } catch (err) {
            console.error("Failed to speak:", err);
        }
    }

    stopButton.addEventListener("click", () => {
        if (currentAudio) {
            currentAudio.pause();
            currentAudio = null;
        }
        subtitleBox.textContent = "";
    });

    const userInput = document.getElementById("user-input");
    const askButton = document.getElementById("ask-lumina");

    askButton.addEventListener("click", () => {
        const question = userInput.value.trim();
        if (question.length > 0) {
            speak(question);
            userInput.value = "";
        }
    });

    userInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            askButton.click();
        }
    });

    const orb = document.getElementById("orb");

    function setOrbState(state) {
        if (!orb) return;
        orb.classList.remove("orb-idle", "orb-thinking", "orb-speaking");
        orb.classList.add("orb-" + state);
    }
