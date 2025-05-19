
    const orb = document.getElementById("orb");
    const subtitleBox = document.getElementById("subtitles");
    const stopButton = document.getElementById("stop-button");
    let currentAudio = null;

    function setOrbState(state) {
        if (!orb) return;
        orb.classList.remove("orb-idle", "orb-thinking", "orb-speaking");
        orb.classList.add("orb-" + state);
    }

    // 🔊 SPEAK function + auto-listen after
    async function speak(text) {
        try {
            setOrbState("thinking");
            subtitleBox.textContent = text;

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
                currentAudio.onended = () => {
                    setOrbState("idle");
                    startRecognition(); // 🧠 Auto-listen loop after voice ends
                };
            } else {
                setOrbState("speaking");
                setTimeout(() => {
                    setOrbState("idle");
                    startRecognition(); // fallback auto-listen
                }, 3000);
            }
        } catch (err) {
            console.error("Error:", err);
            setOrbState("idle");
        }
    }

    // 🛑 Stop button resets everything
    stopButton.addEventListener("click", () => {
        if (currentAudio) {
            currentAudio.pause();
            currentAudio = null;
        }
        subtitleBox.textContent = "";
        setOrbState("idle");
    });

    // 🎤 Voice Recognition (Auto Listening Mode)
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    function startRecognition() {
        recognition.start();
    }

    recognition.onresult = async function (event) {
        const question = event.results[0][0].transcript;
        subtitleBox.textContent = "🗣️ " + question;

        try {
            const response = await fetch("/ask", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ question }),
            });
            const data = await response.json();
            if (data.reply) {
                speak(data.reply); // 🔁 Continue the loop
            }
        } catch (err) {
            console.error("Voice ask error:", err);
        }
    };

    recognition.onerror = function (event) {
        console.warn("Recognition error:", event.error);
    };

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

    async function loadMilestones() {
        const res = await fetch("/timeline");
        const data = await res.json();
        const list = document.getElementById("milestone-list");
        if (data && data.timeline && data.timeline.length) {
            list.innerHTML = data.timeline.map(m => `<div>📅 ${m.date}: ${m.event}</div>`).join("");
        } else {
            list.innerHTML = "<div>No milestones recorded yet.</div>";
        }
    }

    async function loadMemoryForm() {
        const res = await fetch("/memory");
        const data = await res.json();
        if (data) {
            document.querySelector("input[name='name']").value = data.personal.name || "";
            document.querySelector("input[name='goal']").value = data.business.goal || "";
            document.querySelector("input[name='voice_style']").value = data.preferences.voice_style || "";
            document.querySelector("input[name='income_target']").value = data.business.income_target || "";
            document.querySelector("input[name='mood']").value = data.emotional.recent_state || "";
        }
    }

    document.getElementById("memory-form").onsubmit = async function (e) {
        e.preventDefault();
        const body = {
            name: this.name.value,
            goal: this.goal.value,
            voice_style: this.voice_style.value,
            income_target: this.income_target.value,
            mood: this.mood.value
        };
        await fetch("/update-memory", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });
        alert("✅ Memory updated!");
    };

    window.onload = () => {
        loadMilestones?.();
        loadMemoryForm?.();
    };

