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

// Nav scroll effect
const nav = document.querySelector('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

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
// sympathisch / relatable
  "ich weiß ich sollte das nicht vergessen aber ich vergesse es sowieso also: zahnarzt termin morgen.",
  "warte kurz ich hab gerade eine geniale idee bevor sie wieder weg ist.",
  "notiz an mich selbst: das ding das ich heute morgen im halbschlaf gedacht hab war eigentlich gut.",

  // witzig / selbstironisch
  "to do: endlich diesen einen tab schließen den ich seit drei wochen offen habe.",
  "erinnerung an mich selbst: du wolltest 'kurz' nachschauen und es sind zwei stunden geworden.",
  "schreib kevin: ja ich hab deine nachricht gesehen, nein ich hab nicht geantwortet, sorry.",

  // produktiv / flow
  "feedback für den client: version zwei gefällt mir besser, aber absatz drei muss weg.",
  "schnelle idee für den pitch: statt folie 4 einfach ein gif von nem keks. oder einem krümel oder so",

  // provokativ / edge
  "ich hab recht gehabt und möchte das jetzt irgendwo festhalten bevor ich höflich tue, also es war folgenderm...",
  "erinnerung: du brauchst das nicht kaufen. du brauchst das nicht kaufen. du brauchst...",
  "reminder an mich selbst: das playstore approval endlich durchbekommen *daumendrück*"
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

// --- Waitlist form ---
const SHEET_URL = 'https://script.google.com/macros/s/AKfycbx0f4RDYBHSiyIqHFme8oCJ5DIffUfzsiSHtOH2qM5D8Lv2ATUMiu4GD1lnxd5gzTfp/exec';

let jsonpCounter = 0;

function submitWaitlist(email) {
  return new Promise((resolve, reject) => {
    const cbName = '_waitlistCb' + (++jsonpCounter);
    const timeout = setTimeout(() => {
      cleanup();
      reject(new Error('timeout'));
    }, 10000);

    function cleanup() {
      clearTimeout(timeout);
      delete window[cbName];
      const el = document.getElementById(cbName);
      if (el) el.remove();
    }

    window[cbName] = (data) => {
      cleanup();
      resolve(data);
    };

    const script = document.createElement('script');
    script.id = cbName;
    script.src = SHEET_URL + '?callback=' + cbName + '&email=' + encodeURIComponent(email);
    document.body.appendChild(script);
  });
}

document.getElementById('waitlistForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const feedback = document.getElementById('waitlistFeedback');
  const btn = form.querySelector('.cta-submit');
  const email = document.getElementById('waitlistEmail').value.trim();

  if (form.querySelector('.honeypot').value) return;

  btn.disabled = true;
  btn.textContent = '...';
  feedback.textContent = '';
  feedback.className = 'cta-feedback';

  try {
    const data = await submitWaitlist(email);

    if (data.result === 'ok') {
      feedback.textContent = 'du bist dabei!';
      feedback.classList.add('success');
      form.reset();
    } else if (data.result === 'duplicate') {
      feedback.textContent = 'diese email ist bereits registriert.';
      feedback.classList.add('success');
    } else {
      feedback.textContent = data.message || 'etwas ist schiefgelaufen.';
      feedback.classList.add('error');
    }
  } catch {
    feedback.textContent = 'verbindung fehlgeschlagen. versuch es nochmal.';
    feedback.classList.add('error');
  }

  btn.disabled = false;
  btn.innerHTML = 'dabei sein <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>';
});

// --- Legal modals (content rendered via JS, not in HTML source) ---
const legalContent = {
  impressum: () => `<h3>Impressum</h3>
    <p>${['Leon',' Bubova'].join('')}<br>${['Richard-Wagner-','Str. 51'].join('')}<br>${['50674',' Köln'].join('')}</p>
    <p>Kontakt: über das Formular auf dieser Seite</p>`,
  datenschutz: () => `<h3>Datenschutz</h3>
    <p>diese seite setzt keine cookies und nutzt kein tracking. es werden keine analyse-tools oder werbedienste eingebunden.</p>
    <p>wenn du deine email-adresse über das formular einträgst, wird diese ausschließlich gespeichert, um dich zu informieren, wenn shush verfügbar ist. deine email wird nicht an dritte weitergegeben. du kannst jederzeit die löschung deiner daten verlangen — schreib uns einfach über das formular.</p>
    <p>die seite wird über GitHub Pages gehostet. dabei können serverseitig technisch notwendige zugriffsdaten (z.b. IP-adresse) verarbeitet werden. details dazu findest du in der <a href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement" target="_blank" rel="noopener">GitHub Privacy Policy</a>.</p>`
};

const overlay = document.getElementById('legalOverlay');
const legalEl = document.getElementById('legalContent');

document.querySelectorAll('[data-legal]').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const key = link.dataset.legal;
    if (legalContent[key]) {
      legalEl.innerHTML = legalContent[key]();
      overlay.classList.add('visible');
    }
  });
});

document.getElementById('legalClose').addEventListener('click', () => overlay.classList.remove('visible'));
overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.classList.remove('visible'); });

// --- LinkedIn (obfuscated) ---
document.querySelector('.li-link').addEventListener('click', () => {
  const u = ['https://www.','linked','in.com/in/',null].filter(Boolean).join('');
  window.open(u + document.querySelector('.li-link').dataset.li + '/', '_blank');
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
