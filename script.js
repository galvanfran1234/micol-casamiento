// State Variables
let isEnvelopeOpened = false;
let isCardFlipped = false;
let audioCtx = null;
let isMusicPlaying = false;
let synthTimer = null;

// 1. OPEN ENVELOPE UNBOXING ANIMATION
function openEnvelope() {
  if (isEnvelopeOpened) return;
  isEnvelopeOpened = true;

  const box = document.getElementById('envelope-box');
  const screen = document.getElementById('envelope-screen');

  box.classList.add('open');
  playChime();

  setTimeout(() => {
    screen.classList.add('opened');
    if (!isMusicPlaying) {
      toggleMusic();
    }
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

// 4. MP3 BACKGROUND MUSIC PLAYER & VOLUME CONTROL
let lastVolume = 0.5;

function toggleMusic() {
  const audio = document.getElementById('bg-music');
  const widget = document.getElementById('music-widget');
  const icon = document.getElementById('music-icon');

  if (!audio) return;

  if (isMusicPlaying) {
    audio.pause();
    isMusicPlaying = false;
    if (widget) widget.classList.remove('playing');
    if (icon) icon.innerHTML = '🎵';
  } else {
    audio.play().then(() => {
      isMusicPlaying = true;
      if (widget) widget.classList.add('playing');
      if (icon) icon.innerHTML = '⏸';
    }).catch(err => {
      console.log('Audio play action queued:', err);
    });
  }
}

function setVolume(val) {
  const audio = document.getElementById('bg-music');
  const volumeIcon = document.getElementById('volume-icon');

  if (!audio) return;

  const parsedVal = parseFloat(val);
  audio.volume = parsedVal;

  if (volumeIcon) {
    if (parsedVal === 0) {
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

  if (!audio) return;

  if (audio.volume > 0) {
    lastVolume = audio.volume;
    setVolume(0);
    if (slider) slider.value = 0;
  } else {
    const restoreVal = lastVolume > 0 ? lastVolume : 0.5;
    setVolume(restoreVal);
    if (slider) slider.value = restoreVal;
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

function playChime() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1046.50, ctx.currentTime + 0.6);
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.6);
  } catch (e) {}
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

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  initCountdown();
});
