const finishButton = document.querySelector("#finishButton");
const nameSubmitButton = document.querySelector("#nameSubmitButton");
const yourNameInput = document.querySelector("#yourNameInput");
const herNameInput = document.querySelector("#herNameInput");
const nameError = document.querySelector("#nameError");
const heartLoader = document.querySelector("#heartLoader");
const screens = Array.from(document.querySelectorAll("[data-screen]"));
const yesButton = document.querySelector("#yesButton");
const noButton = document.querySelector("#noButton");
const backButton = document.querySelector("#backButton");
const giftButtons = Array.from(document.querySelectorAll("[data-gift]"));
const panels = Array.from(document.querySelectorAll("[data-panel]"));
const miniPlayer = document.querySelector("#miniPlayer");
const playButton = document.querySelector("#playButton");
const hearts = document.querySelector("#hearts");
const sendHugButton = document.querySelector("#sendHugButton");
const memoryButtons = Array.from(document.querySelectorAll(".memory-thumb"));
const featuredMemory = document.querySelector("#featuredMemory");
const featuredMemoryImage = document.querySelector("#featuredMemoryImage");
const featuredMemoryTitle = document.querySelector("#featuredMemoryTitle");
const featuredMemoryKicker = document.querySelector("#featuredMemoryKicker");
const memoryAudio = document.querySelector("#memoryAudio");
const memoryMusic = document.querySelector(".memory-music");
const memoryPlayButton = document.querySelector("#memoryPlayButton");
const memoryProgress = document.querySelector("#memoryProgress");
const memoryCurrentTime = document.querySelector("#memoryCurrentTime");
const memoryDuration = document.querySelector("#memoryDuration");
const firstMeetVideo = document.querySelector("#firstMeetVideo");

let noDodges = 0;

function setHash(name) {
  const nextHash = `#${name}`;
  if (window.location.hash !== nextHash) {
    history.pushState(null, "", nextHash);
  }
}

function showScreen(name, options = {}) {
  const { updateHash = true } = options;

  document.body.dataset.currentScreen = name;

  if (name !== "detail") {
    pauseFirstMeetVideo();
    stopMemoryAudio();
  }

  screens.forEach((screen) => {
    screen.hidden = screen.dataset.screen !== name;
  });

  if (updateHash) {
    setHash(name);
  }

  const nextScreen = screens.find((screen) => screen.dataset.screen === name);
  if (nextScreen) {
    nextScreen.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function alignDetailScreen() {
  const detailScreen = screens.find((screen) => screen.dataset.screen === "detail");
  if (detailScreen && !detailScreen.hidden) {
    detailScreen.scrollIntoView({ behavior: "auto", block: "start" });
  }
}

function showPanel(name, options = {}) {
  const { updateHash = true } = options;

  panels.forEach((panel) => {
    panel.classList.toggle("active-panel", panel.dataset.panel === name);
  });

  showScreen("detail", { updateHash: false });

  if (updateHash) {
    setHash(name);
  }

  const activePanel = panels.find((panel) => panel.dataset.panel === name);
  if (activePanel) {
    activePanel.setAttribute("tabindex", "-1");
    activePanel.focus({ preventScroll: true });
  }

  if (name === "memories") {
    window.setTimeout(playFirstMeetVideo, 220);
    window.setTimeout(playMemoryAudio, 260);
  } else {
    pauseFirstMeetVideo();
    stopMemoryAudio();
  }

  requestAnimationFrame(alignDetailScreen);
  window.setTimeout(alignDetailScreen, 250);
}

function dodgeNoButton() {
  noDodges += 1;
  const rangeX = window.innerWidth < 540 ? 72 : 150;
  const rangeY = window.innerWidth < 540 ? 36 : 54;
  const x = Math.round((Math.random() * 2 - 1) * rangeX);
  const y = Math.round((Math.random() * 2 - 1) * rangeY);

  noButton.style.transform = `translate(${x}px, ${y}px)`;

  if (noDodges > 3) {
    noButton.textContent = "YES?";
  }
}

function createHeart() {
  if (!hearts) return;
  const heart = document.createElement("span");
  heart.textContent = Math.random() > 0.45 ? "\u2665" : "\uD83D\uDC95";
  heart.style.left = `${Math.random() * 100}vw`;
  heart.style.fontSize = `${18 + Math.random() * 26}px`;
  heart.style.animationDuration = `${3.5 + Math.random() * 3}s`;
  hearts.appendChild(heart);
  setTimeout(() => heart.remove(), 8000);
}

function burst(count = 24) {
  for (let i = 0; i < count; i++) {
    setTimeout(createHeart, i * 35);
  }
}

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) {
    return "0:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remainingSeconds}`;
}

function syncMemoryPlayer() {
  if (!memoryAudio || !memoryProgress || !memoryCurrentTime || !memoryDuration) {
    return;
  }

  const duration = memoryAudio.duration || 0;
  const percent = duration ? (memoryAudio.currentTime / duration) * 100 : 0;
  memoryProgress.value = String(percent);
  memoryCurrentTime.textContent = formatTime(memoryAudio.currentTime);
  memoryDuration.textContent = formatTime(duration);
}

function setMemoryPlaying(isPlaying) {
  if (!memoryMusic || !memoryPlayButton) {
    return;
  }

  memoryMusic.classList.toggle("is-playing", isPlaying);
  memoryPlayButton.setAttribute("aria-label", isPlaying ? "Pause memories song" : "Play memories song");
}

async function playMemoryAudio() {
  if (!memoryAudio) {
    return;
  }

  try {
    memoryAudio.loop = true;
    await memoryAudio.play();
  } catch {
    setMemoryPlaying(false);
  }
}

function stopMemoryAudio() {
  if (!memoryAudio) {
    return;
  }

  memoryAudio.pause();
  setMemoryPlaying(false);
}

function playFirstMeetVideo() {
  if (!firstMeetVideo) {
    return;
  }

  firstMeetVideo.muted = true;
  const playPromise = firstMeetVideo.play();
  if (playPromise) {
    playPromise.catch(() => {});
  }
}

function pauseFirstMeetVideo() {
  if (firstMeetVideo) {
    firstMeetVideo.pause();
  }
}

function selectMemory(button) {
  if (!featuredMemory || !featuredMemoryImage || !featuredMemoryTitle || !featuredMemoryKicker) {
    return;
  }

  const nextSource = button.dataset.memorySrc;
  const nextTitle = button.dataset.memoryTitle || "saved memory";
  const nextKicker = button.dataset.memoryKicker || "our little moment";

  if (!nextSource) {
    return;
  }

  memoryButtons.forEach((item) => {
    item.classList.toggle("is-active", item === button);
  });

  featuredMemory.classList.add("is-changing");

  window.setTimeout(() => {
    featuredMemoryImage.src = nextSource;
    featuredMemoryImage.alt = `Memory: ${nextTitle}`;
    featuredMemoryTitle.textContent = nextTitle;
    featuredMemoryKicker.textContent = nextKicker;
    featuredMemory.classList.remove("is-changing");
  }, 150);

  button.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
}

setInterval(createHeart, 900);

if (nameSubmitButton) {
  nameSubmitButton.addEventListener("click", () => {
    const yourName = yourNameInput.value.trim().toLowerCase();
    const herName = herNameInput.value.trim().toLowerCase();

   if (
  (yourName === "azimjon" && herName === "charos") ||
  (yourName === "charos" && herName === "azimjon")
) {
  nameError.textContent = "";
  heartLoader.hidden = false;
  burst(45);

  setTimeout(() => {
    showScreen("surprise");
  }, 1800);
} else {
  nameError.textContent = "Bizning ismlarimizni yozib ko‘r ❤️";
}
  });
}

yesButton.addEventListener("click", () => {
  burst(35);
  showScreen("gifts");
});

noButton.addEventListener("pointerenter", dodgeNoButton);
noButton.addEventListener("focus", dodgeNoButton);
noButton.addEventListener("click", dodgeNoButton);

giftButtons.forEach((button) => {
  button.addEventListener("click", () => {
    burst(20);
    showPanel(button.dataset.gift);
  });
});

memoryButtons.forEach((button) => {
  button.addEventListener("click", () => {
    selectMemory(button);
    burst(8);
  });
});

if (memoryAudio && memoryPlayButton && memoryProgress) {
  memoryPlayButton.addEventListener("click", async () => {
    try {
      if (memoryAudio.paused) {
        await memoryAudio.play();
      } else {
        memoryAudio.pause();
      }
    } catch {
      memoryAudio.pause();
    }
  });

  memoryAudio.addEventListener("loadedmetadata", syncMemoryPlayer);
  memoryAudio.addEventListener("timeupdate", syncMemoryPlayer);
  memoryAudio.addEventListener("play", () => setMemoryPlaying(true));
  memoryAudio.addEventListener("pause", () => setMemoryPlaying(false));
  memoryAudio.addEventListener("ended", () => {
    setMemoryPlaying(false);
    syncMemoryPlayer();
  });

  memoryProgress.addEventListener("input", () => {
    if (!Number.isFinite(memoryAudio.duration)) {
      return;
    }

    memoryAudio.currentTime = (Number(memoryProgress.value) / 100) * memoryAudio.duration;
  });
}

backButton.addEventListener("click", () => {
  showScreen("gifts");
});

document.querySelectorAll(".topbar a[href^='#']").forEach((link) => {
  link.addEventListener("click", (event) => {
    const target = link.getAttribute("href").slice(1);

    if (target === "gifts") {
      event.preventDefault();
      showScreen("gifts");
      return;
    }

    if (target === "letter" || target === "memories") {
      event.preventDefault();
      showPanel(target);
      return;
    }

    if (target === "surprise") {
      event.preventDefault();
      showScreen("surprise");
    }
  });
});

if (sendHugButton) {
  sendHugButton.addEventListener("click", () => {
    burst(120);
    sendHugButton.textContent = "HUG SENT \uD83D\uDC95";
  });
}
if (finishButton) {
  finishButton.addEventListener("click", () => {
    burst(150);
    showScreen("final");
  });
}
if (playButton) {
  playButton.addEventListener("click", () => {
    const isPlaying = miniPlayer.classList.toggle("is-playing");
    playButton.setAttribute("aria-pressed", String(isPlaying));
    playButton.setAttribute("aria-label", isPlaying ? "Pause playlist" : "Play playlist");
  });
}

function showFromHash() {
  const target = window.location.hash.slice(1);

  if (target === "gifts" || target === "surprise") {
    showScreen(target, { updateHash: false });
    return;
  }

  if (panels.some((panel) => panel.dataset.panel === target)) {
    showPanel(target, { updateHash: false });
    return;
  }

  showScreen("nameGate", { updateHash: false });
}

window.addEventListener("hashchange", showFromHash);
showFromHash();