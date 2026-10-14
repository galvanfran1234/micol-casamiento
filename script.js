// State Variables
let isEnvelopeOpened = false;
let isCardFlipped = false;
let isMusicPlaying = false;

// 1. OPEN ENVELOPE UNBOXING ANIMATION
function openEnvelope() {
  if (isEnvelopeOpened) return;
  isEnvelopeOpened = true;

  const box = document.getElementById('envelope-box');
  const screen = document.getElementById('envelope-screen');

  if (box) box.classList.add('open');
  
  // Mobile audio trigger: Must execute immediately on user gesture
  playMusic();

  setTimeout(() => {
    if (screen) screen.classList.add('opened');
  }, 1200);
}

// 2. TOGGLE 360 CARD FLIP
function toggleCardFlip() {
  const card = document.getElementById('card-3d');
  isCardFlipped = !isCardFlipped;
  if (isCardFlipped) {
    card.classList.add('is-flipped');
  } else {
    card.classList.remove('is-flipped');
  }
}

// 3. LIVE COUNTDOWN TIMER TO DECEMBER 19
function initCountdown() {
  // Target: December 19, 19:45:00
  const now = new Date();
  let targetYear = now.getFullYear();
  let targetDate = new Date(`December 19, ${targetYear} 19:45:00`).getTime();

  // If Dec 19 this year has passed, target next year
  if (targetDate < now.getTime()) {
    targetDate = new Date(`December 19, ${targetYear + 1} 19:45:00`).getTime();
  }

  function update() {
    const current = new Date().getTime();
    const distance = targetDate - current;

    if (distance < 0) {
      document.getElementById('cd-days').innerText = '00';
      document.getElementById('cd-hours').innerText = '00';
      document.getElementById('cd-minutes').innerText = '00';
      document.getElementById('cd-seconds').innerText = '00';
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    document.getElementById('cd-days').innerText = String(days).padStart(2, '0');
    document.getElementById('cd-hours').innerText = String(hours).padStart(2, '0');
    document.getElementById('cd-minutes').innerText = String(minutes).padStart(2, '0');
    document.getElementById('cd-seconds').innerText = String(seconds).padStart(2, '0');
  }

  update();
  setInterval(update, 1000);
}

// 4. MP3 & M4A BACKGROUND MUSIC PLAYER & VOLUME CONTROL
let lastVolume = 0.6;
let isUnlockArmed = false;

function updateMusicUI(playing) {
  const widget = document.getElementById('music-widget');
  const icon = document.getElementById('music-icon');
  if (widget) {
    if (playing) {
      widget.classList.add('playing');
    } else {
      widget.classList.remove('playing');
    }
  }
  if (icon) {
    icon.innerHTML = playing ? '⏸' : '🎵';
  }
}

function playMusic() {
  const audio = document.getElementById('bg-music');
  if (!audio) return;

  // Garantizar que no esté muteado y configurar volumen con seguridad (en iOS el volumen es solo por botones físicos)
  try {
    audio.muted = false;
    if (audio.volume === 0) {
      audio.volume = lastVolume > 0 ? lastVolume : 0.6;
    }
  } catch (_) {}

  // Despertar Web Audio AudioContext (técnica estándar en Safari iOS/WebKit para habilitar el subsistema de audio)
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (AudioCtx) {
      if (!window._weddingAudioCtx) {
        window._weddingAudioCtx = new AudioCtx();
      }
      if (window._weddingAudioCtx.state === 'suspended') {
        window._weddingAudioCtx.resume();
      }
    }
  } catch (_) {}

  // Si ya está sonando, solo sincronizar UI
  if (!audio.paused) {
    isMusicPlaying = true;
    updateMusicUI(true);
    return;
  }

  const playPromise = audio.play();
  if (playPromise !== undefined) {
    playPromise
      .then(() => {
        isMusicPlaying = true;
        updateMusicUI(true);
      })
      .catch((err) => {
        console.warn('Reproducción de audio pospuesta por política del navegador:', err);
        isMusicPlaying = false;
        updateMusicUI(false);
        // Activar reintento ante el próximo toque del usuario
        armNextInteractionAudioUnlock();
      });
  } else {
    isMusicPlaying = true;
    updateMusicUI(true);
  }
}

function pauseMusic() {
  const audio = document.getElementById('bg-music');
  if (!audio) return;

  audio.pause();
  isMusicPlaying = false;
  updateMusicUI(false);
}

function toggleMusic() {
  const audio = document.getElementById('bg-music');
  if (!audio) return;

  if (!audio.paused) {
    pauseMusic();
  } else {
    playMusic();
  }
}

function setVolume(val) {
  const audio = document.getElementById('bg-music');
  const volumeIcon = document.getElementById('volume-icon');
  if (!audio) return;

  const parsedVal = parseFloat(val);
  try {
    audio.volume = parsedVal;
  } catch (_) {}
  audio.muted = parsedVal === 0;

  if (volumeIcon) {
    if (parsedVal === 0 || audio.muted) {
      volumeIcon.innerHTML = '🔇';
    } else if (parsedVal < 0.4) {
      volumeIcon.innerHTML = '🔉';
    } else {
      volumeIcon.innerHTML = '🔊';
    }
  }
}

function toggleMute() {
  const audio = document.getElementById('bg-music');
  const slider = document.getElementById('volume-slider');
  const volumeIcon = document.getElementById('volume-icon');
  if (!audio) return;

  if (!audio.muted && audio.volume > 0) {
    lastVolume = audio.volume;
    audio.muted = true;
    try { audio.volume = 0; } catch (_) {}
    if (slider) slider.value = 0;
    if (volumeIcon) volumeIcon.innerHTML = '🔇';
  } else {
    const restoreVal = lastVolume > 0 ? lastVolume : 0.6;
    audio.muted = false;
    try { audio.volume = restoreVal; } catch (_) {}
    if (slider) slider.value = restoreVal;
    if (volumeIcon) volumeIcon.innerHTML = '🔊';
  }
}

function toggleVolumePopup(event) {
  if (event) event.stopPropagation();
  const popup = document.getElementById('volume-popup');
  if (popup) {
    popup.classList.toggle('active');
  }
}

// Close volume popup on outside click
document.addEventListener('click', (event) => {
  const widget = document.getElementById('music-widget');
  const popup = document.getElementById('volume-popup');
  if (widget && !widget.contains(event.target) && popup) {
    popup.classList.remove('active');
  }
});

// Setup native audio element state listeners
function setupAudioListeners() {
  const audio = document.getElementById('bg-music');
  if (!audio) return;

  audio.addEventListener('play', () => {
    isMusicPlaying = true;
    updateMusicUI(true);
  });

  audio.addEventListener('pause', () => {
    isMusicPlaying = false;
    updateMusicUI(false);
  });

  audio.addEventListener('ended', () => {
    isMusicPlaying = false;
    updateMusicUI(false);
  });

  audio.addEventListener('error', (e) => {
    console.error('Error en el elemento de audio:', audio.error, e);
    isMusicPlaying = false;
    updateMusicUI(false);
  });
}

// 5. ADD TO GOOGLE CALENDAR
function addToGoogleCalendar() {
  const title = encodeURIComponent("Casamiento de Micol & Adriel");
  const details = encodeURIComponent("Ceremonia Religiosa a las 19:30 hs en Iglesia Juez de la Gandara 850, Libertad. Recepción & Fiesta a las 21:30 hs en Belisario Roldan 911, Libertad.");
  const location = encodeURIComponent("Iglesia Juez de la Gandara 850, Libertad / Belisario Roldan 911, Libertad, Buenos Aires");
  const dates = "20261219T193000Z/20261220T050000Z";

  const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${dates}`;
  window.open(url, '_blank');
}

// 7. OPEN GOOGLE MAPS DIRECTLY
function openGoogleMap(url, event) {
  if (event) {
    if (event.stopPropagation) event.stopPropagation();
    if (event.stopImmediatePropagation) event.stopImmediatePropagation();
    if (event.preventDefault) event.preventDefault();
  }
  window.open(url, '_blank', 'noopener,noreferrer');
}

// 8. COPY BANK ALIAS TO CLIPBOARD
function copyAlias() {
  const aliasText = "Micol.galvan";
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(aliasText).then(() => showAliasFeedback());
  } else {
    // Fallback for older browsers or non-https environments
    const textArea = document.createElement("textarea");
    textArea.value = aliasText;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      showAliasFeedback();
    } catch (err) {
      console.error('Error al copiar alias:', err);
    }
    document.body.removeChild(textArea);
  }
}

function showAliasFeedback() {
  const feedback = document.getElementById('alias-copied-msg');
  if (feedback) {
    feedback.classList.remove('opacity-0');
    setTimeout(() => {
      feedback.classList.add('opacity-0');
    }, 2500);
  }
}

// Fallback multi-dispositivo: si el navegador móvil restringió el inicio en el primer tap,
// se reactiva inmediatamente en la siguiente interacción del usuario (tap/scroll)
function armNextInteractionAudioUnlock() {
  if (isUnlockArmed) return;
  isUnlockArmed = true;

  const unlock = () => {
    const audio = document.getElementById('bg-music');
    if (!audio) return;

    if (audio.paused) {
      const p = audio.play();
      if (p !== undefined) {
        p.then(() => {
          isMusicPlaying = true;
          updateMusicUI(true);
          cleanup();
        }).catch(() => {});
      }
    } else {
      cleanup();
    }
  };

  function cleanup() {
    isUnlockArmed = false;
    ['click', 'touchstart', 'touchend'].forEach((evt) => {
      document.removeEventListener(evt, unlock, { capture: true });
    });
  }

  ['click', 'touchstart', 'touchend'].forEach((evt) => {
    document.addEventListener(evt, unlock, { capture: true, passive: true });
  });
}

// Detección de iPhone para mostrar sugerencia de switch de silencio
function checkIOS() {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  if (isIOS) {
    const hint = document.getElementById('iphone-hint');
    if (hint) hint.classList.remove('hidden');
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  initCountdown();
  setupAudioListeners();
  checkIOS();
});
