// Scroll fade-in
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { rootMargin: '-40px' });
document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

// --- Organic waveform ---
const canvas = document.getElementById('waveform');
const ctx = canvas.getContext('2d');
const W = canvas.width;
const H = canvas.height;
const midY = H / 2;
let speaking = false;
let energy = 0;
let targetEnergy = 0;

const layers = [
  { freq: 0.025, phase: 0, speed: 0.03, amp: 1.0 },
  { freq: 0.045, phase: 1.2, speed: 0.05, amp: 0.6 },
  { freq: 0.08,  phase: 2.8, speed: 0.08, amp: 0.3 },
  { freq: 0.13,  phase: 0.5, speed: 0.12, amp: 0.15 },
];

function drawWaveform() {
  energy += (targetEnergy - energy) * 0.06;
  ctx.clearRect(0, 0, W, H);

  if (energy < 0.005) {
    ctx.beginPath();
    ctx.moveTo(0, midY);
    ctx.lineTo(W, midY);
    ctx.strokeStyle = 'rgba(196, 181, 253, 0.15)';
    ctx.lineWidth = 1;
    ctx.stroke();
    requestAnimationFrame(drawWaveform);
    return;
  }

  layers.forEach(l => { l.phase += l.speed; });

  const points = [];
  for (let x = 0; x <= W; x++) {
    let y = 0;
    layers.forEach(l => {
      y += Math.sin(x * l.freq + l.phase) * l.amp;
    });
    const env = Math.sin((x / W) * Math.PI);
    y *= env * energy * (midY * 0.7);
    points.push(midY + y);
  }

  ctx.beginPath();
  ctx.moveTo(0, midY);
  for (let x = 0; x <= W; x++) ctx.lineTo(x, points[x]);
  ctx.lineTo(W, midY);
  for (let x = W; x >= 0; x--) ctx.lineTo(x, midY - (points[x] - midY));
  ctx.closePath();

  const grad = ctx.createLinearGradient(0, 0, W, 0);
  grad.addColorStop(0, 'rgba(196, 181, 253, 0.0)');
  grad.addColorStop(0.2, 'rgba(196, 181, 253, 0.25)');
  grad.addColorStop(0.5, 'rgba(196, 181, 253, 0.4)');
  grad.addColorStop(0.8, 'rgba(196, 181, 253, 0.25)');
  grad.addColorStop(1, 'rgba(196, 181, 253, 0.0)');
  ctx.fillStyle = grad;
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(0, midY);
  for (let x = 0; x <= W; x++) ctx.lineTo(x, points[x]);
  ctx.strokeStyle = 'rgba(196, 181, 253, 0.5)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  requestAnimationFrame(drawWaveform);
}

let energyInterval;
function startSpeaking() {
  speaking = true;
  targetEnergy = 0.5 + Math.random() * 0.4;
  energyInterval = setInterval(() => {
    if (!speaking) return;
    targetEnergy = 0.3 + Math.random() * 0.7;
  }, 200);
  document.getElementById('demoDot').classList.add('active');
  document.getElementById('demoStatus').textContent = 'nimmt auf...';
}
function stopSpeaking() {
  speaking = false;
  clearInterval(energyInterval);
  targetEnergy = 0;
  document.getElementById('demoDot').classList.remove('active');
  document.getElementById('demoStatus').textContent = 'fertig';
}

drawWaveform();

// --- Typing demo ---
const phrases = [
  "hey, erinner mich daran nach der arbeit einkaufen zu gehen.",
  "ich hatte gerade eine idee für das projekt — lass mich das kurz festhalten.",
  "schick sarah eine nachricht: bin zehn minuten später, sorry!",
  "notiz an mich: vor dem meeting am montag die api-docs checken."
];

const demoText = document.getElementById('demoText');
let phraseIndex = 0;

function runDemo() {
  const text = phrases[phraseIndex % phrases.length];
  phraseIndex++;

  startSpeaking();
  demoText.innerHTML = '<span class="cursor"></span>';

  let charIndex = 0;
  const baseSpeed = 36;

  const typeInterval = setInterval(() => {
    if (charIndex < text.length) {
      demoText.innerHTML = text.slice(0, charIndex + 1) + '<span class="cursor"></span>';
      charIndex++;
    } else {
      clearInterval(typeInterval);
      stopSpeaking();
      setTimeout(() => {
        demoText.innerHTML = '<span class="cursor"></span>';
        setTimeout(runDemo, 1000);
      }, 2500);
    }
  }, baseSpeed);
}

setTimeout(runDemo, 1200);

// --- Style switcher ---
document.querySelectorAll('.style-opt').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.style-opt').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
});

// --- Editor ---
let editMode = false;

function toggleEdit(on) {
  editMode = on;
  document.body.classList.toggle('editing', on);
  document.getElementById('editBar').classList.toggle('visible', on);
  const activeStyle = document.querySelector('.style-opt.active');
  document.getElementById('editStyleLabel').textContent = activeStyle ? activeStyle.dataset.style : '';
  document.querySelectorAll('[data-key], [data-edit]').forEach(el => {
    el.contentEditable = on ? 'true' : 'false';
  });
}

document.getElementById('editToggle').addEventListener('click', (e) => {
  e.preventDefault();
  toggleEdit(!editMode);
});

document.getElementById('editClose').addEventListener('click', () => toggleEdit(false));
