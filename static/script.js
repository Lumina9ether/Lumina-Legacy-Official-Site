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
