
    const orb = document.getElementById("orb");
    const subtitleBox = document.getElementById("subtitles");
    const stopButton = document.getElementById("stop-button");
    let currentAudio = null;

    function setOrbState(state) {
        if (!orb) return;
        orb.classList.remove("orb-idle", "orb-thinking", "orb-speaking");
        orb.classList.add("orb-" + state);
    }

    async function speak(text) {
        try {
            setOrbState("thinking");
            subtitleBox.textContent = text;  // Show response in subtitles no matter what

            const response = await fetch("/speak", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text }),
            });

            const data = await response.json();

            if (data.audio) {
                setOrbState("speaking");
                if (currentAudio) currentAudio.pause();
                currentAudio = new Audio(data.audio);
                currentAudio.play();
                currentAudio.onended = () => setOrbState("idle");
            } else {
                setOrbState("speaking");
                setTimeout(() => setOrbState("idle"), 3000);  // Simulate speaking
            }
        } catch (err) {
            console.error("Error:", err);
            setOrbState("idle");
        }
    }

    stopButton.addEventListener("click", () => {
        if (currentAudio) {
            currentAudio.pause();
            currentAudio = null;
        }
        subtitleBox.textContent = "";
        setOrbState("idle");
    });

    const heyLuminaBtn = document.getElementById("hey-lumina-button");
    heyLuminaBtn.addEventListener("click", () => {
        speak("Welcome to Lumina Legacy. I am your AI assistant.");
    });

    const askButton = document.getElementById("ask-lumina");
    const userInput = document.getElementById("user-input");

    askButton.addEventListener("click", async () => {
        const question = userInput.value.trim();
        if (question.length > 0) {
            try {
                const response = await fetch("/ask", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ question }),
                });
                const data = await response.json();
                if (data.reply) {
                    speak(data.reply);
                }
            } catch (err) {
                console.error("Error:", err);
            }
            userInput.value = "";
        }
    });

    userInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            askButton.click();
        }
    });
