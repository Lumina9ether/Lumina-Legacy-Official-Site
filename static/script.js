// Placeholder


function setOrbState(state) {
  const orb = document.getElementById("orb");
  if (!orb) return;

  orb.classList.remove("idle", "listening", "speaking");

  switch (state) {
    case "listening":
      orb.classList.add("listening");
      break;
    case "speaking":
      orb.classList.add("speaking");
      break;
    default:
      orb.classList.add("idle");
  }
}

function speakLumina(text) {
  setOrbState("speaking");
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.onend = () => {
    setOrbState("idle");
  };
  speechSynthesis.speak(utterance);
}


window.addEventListener("load", () => {
  fetch('/speak', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: "Welcome to Lumina Legacy. I am your AI assistant." })
  })
  .then(res => res.json())
  .then(data => {
    const audio = new Audio(data.audio);
    const orb = document.getElementById("orb");
    if (orb) orb.classList.add("speaking");

    audio.play();
    audio.onended = () => {
      if (orb) {
        orb.classList.remove("speaking");
        orb.classList.add("idle");
      }
    };
  });
});
