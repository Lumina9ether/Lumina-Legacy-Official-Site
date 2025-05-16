
document.addEventListener("DOMContentLoaded", () => {
    const orb = document.getElementById("orb");
    const subtitle = document.getElementById("subtitle");

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

    function onUserInteract() {
        window.removeEventListener("click", onUserInteract);
        window.removeEventListener("scroll", onUserInteract);
        speak("Welcome to Lumina Legacy. I am your AI assistant.");
    }

    window.addEventListener("click", onUserInteract);
    window.addEventListener("scroll", onUserInteract);
});
