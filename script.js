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
const styles = {
  casual: {
    heroTitle: 'deine gedanken direkt als text. <em>ohne tippen &lt;3</em>',
    heroSub: 'shush nimmt auf, was du sagst, und macht daraus sofort fertigen text -> direkt in deine lieblings apps.',
    heroCta: 'jetzt 7 tage kostenlos testen ✌️',
    step1h: 'drücken', step1p: 'drück zwei mal auf die leiser taste, egal in welcher app.',
    step2h: 'sprechen', step2p: 'sag einfach, was dir durch den kopf geht.',
    step3h: 'nochmal drücken', step3p: 'dein text wird ganz entspannt eingefügt, genau wo du willst.',
    feat1h: 'überall einsatzbereit', feat1p: 'egal ob whatsapp, notion, google docs oder notiz app. shush fügt den text dort ein, wo du ihn brauchst.',
    feat2h: 'multilingual', feat2p: 'sprich einfach los. shush erkennt die sprache und transkribiert fehlerfrei. auch deutsch und englisch gemischt sind kein problem.',
    feat3h: 'barrierefrei gedacht', feat3p: 'wir wollen, dass jede stimme genutzt werden kann. einfachste bedienung ohne komplizierte menüs.',
    feat4h: 'zeit sparen und tracken', feat4p: 'sieh in deinen stats, wie viele stunden tippen du dir diese woche gespart hast.',
    quote: '„als journalist muss ich oft schnell gedanken festhalten. shush ist das erste tool, das meinen workflow nicht unterbricht, sondern beschleunigt :)"',
    pricingTitle: 'wähle deinen plan ✨',
    ctaTitle: 'werde teil der <em>reise\u00a0</em>🚀',
    ctaSub: 'wir dokumentieren die entwicklung von shush transparent. du willst feedback geben oder zu den ersten usern gehören?',
    ctaBtn: 'community beitreten ✌️',
    phrases: [
      "hey, erinner mich daran nach der arbeit einkaufen zu gehen :)",
      "ich hatte gerade eine mega idee für das projekt — lass mich das kurz festhalten ✨",
      "schick sarah eine nachricht: bin zehn minuten später, sorry! 🙈",
      "notiz an mich: vor dem meeting am montag die api-docs checken 📝"
    ]
  },
  formal: {
    heroTitle: 'Deine Gedanken direkt als Text. <em>Ohne Tippen.</em>',
    heroSub: 'Shush nimmt auf, was du sagst, und wandelt es sofort in perfekt formatierten Text um. Direkt in deinen Apps.',
    heroCta: 'Jetzt 7 Tage kostenlos testen',
    step1h: 'Doppeltippen', step1p: 'Drück zweimal die Lautstärketaste in jeder beliebigen Anwendung.',
    step2h: 'Sprechen', step2p: 'Sag was dir durch den Kopf geht.',
    step3h: 'Nochmal Doppeltippen', step3p: 'Dein Text wird automatisch eingefügt. Direkt in deine App.',
    feat1h: 'Universell einsetzbar', feat1p: 'Ob WhatsApp, Notion, Google Docs oder Deine bevorzugte Notiz-App. Shush fügt den Text genau dort ein, wo du Ihn.',
    feat2h: 'Mehrsprachig', feat2p: 'Sprich einfach los. Shush erkennt die Sprache automatisch und transkribiert zuverlässig.',
    feat3h: 'Barrierefreiheit im Fokus', feat3p: 'Wir möchten, dass jede Stimme genutzt werden kann. Intuitive Bedienung ohne komplexe Menüführung.',
    feat4h: 'Zeitersparnis im Überblick', feat4p: 'Verfolg in deinen Statistiken, wie viele Stunden Tipparbeit Du dir in dieser Woche gespart hast.',
    quote: '„Als Journalist muss ich häufig schnell Gedanken festhalten. Shush ist das erste Tool, das meinen Workflow nicht unterbricht, sondern merklich beschleunigt."',
    pricingTitle: 'Wählen Deinen Plan',
    ctaTitle: 'Werde Teil der <em>Reise</em>',
    ctaSub: 'Wir dokumentieren die Entwicklung von Shush transparent. Du möchtest Feedback geben oder zu den ersten Nutzern gehören?',
    ctaBtn: 'Der Community beitreten',
    phrases: [
      "Bitte erinnern Sie mich daran, nach der Arbeit Lebensmittel einzukaufen.",
      "Ich hatte soeben eine Idee für das Projekt — lassen Sie mich das kurz festhalten.",
      "Senden Sie Sarah folgende Nachricht: Ich werde circa zehn Minuten später eintreffen.",
      "Notiz an mich selbst: Vor dem Meeting am Montag die API-Dokumentation durchsehen."
    ]
  },
  messy: {
    heroTitle: 'Deine gedanken direkt als text. <em>ohne Tippen</em>',
    heroSub: 'shush nimmt auf was du sagst und wandelt es sofort in text um. direkt in deine Zwischenablage',
    heroCta: 'jetzt 7 tage koatenlos testen',
    step1h: 'Shortcut', step1p: 'drück zweimal die lautstärketaste egal in welcher app',
    step2h: 'sprechen', step2p: 'sag was dir durch den Kopf geht',
    step3h: 'Fertig', step3p: 'dein text ist in der zwischenablage. füg ihn ein wo du willst',
    feat1h: 'überall einsetzbar', feat1p: 'egal ob Whatsapp Notion google docs oder deine ideen app. shush fügt den text dort ein wo du ihn brauchst',
    feat2h: 'multilingual', feat2p: 'sprich einfach los. shush erkennt die sprache automatisch und transkribiert fhelerfrei — es sei denn du willst es',
    feat3h: 'barrierefrei gedacht', feat3p: 'wir wollen dass jede stimme genuzt werden kann. einfachste bedienung ohne komplizierte Menüs',
    feat4h: 'Zeit sparen und tracken', feat4p: 'sieh in deinen stats wie viele stunden tippen du dir diese Woche gespart hast',
    quote: '„als Journalist muss ich oft schnell gedanken festhalten. shush ist das erste tool das meinen Workflow nicht unterbricht sondern beschleunigt"',
    pricingTitle: 'wähle deinen Plan',
    ctaTitle: 'werde teil der <em>Reise</em>',
    ctaSub: 'wir dokumentieren die entwicklung von shush transparent. du willst feedback geben oder zu den ersten Usern gehören?',
    ctaBtn: 'community beitreten',
    phrases: [
      "hey erinner mich daran nach der arbeit einkaufen zu gehen",
      "ich hatte gerade ne Idee für das projekt lass mich das kurz festhalten",
      "schick sarah ne nachricht bin zehn minuten Später sorry",
      "Notiz an mich vor dem meeting am montag die api docs checken"
    ]
  }
};

let currentStyle = 'casual';

// Keys that use innerHTML (contain <em> tags)
const htmlKeys = new Set(['heroTitle', 'ctaTitle']);

function applyStyle(style) {
  currentStyle = style;
  const s = styles[style];

  document.querySelectorAll('.style-opt').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.style === style);
  });

  // Apply all data-key elements
  document.querySelectorAll('[data-key]').forEach(el => {
    const key = el.dataset.key;
    if (s[key] !== undefined) {
      if (htmlKeys.has(key)) el.innerHTML = s[key];
      else el.textContent = s[key];
    }
  });

  // Hero CTA special (has SVG sibling)
  const ctaSpan = document.querySelector('[data-key="heroCta"]');
  if (ctaSpan) ctaSpan.textContent = s.heroCta;

  // CTA button
  const ctaBtn = document.querySelector('.cta .btn-primary');
  if (ctaBtn) ctaBtn.innerHTML = ctaBtn.querySelector('svg').outerHTML + ' ' + s.ctaBtn;

  // Update demo phrases
  phrases.length = 0;
  phrases.push(...s.phrases);
}

document.querySelectorAll('.style-opt').forEach(btn => {
  btn.addEventListener('click', () => {
    applyStyle(btn.dataset.style);
    const label = document.getElementById('editStyleLabel');
    if (label) label.textContent = btn.dataset.style;
  });
});

applyStyle('casual');

// --- Editor ---
let editMode = false;

function toggleEdit(on) {
  editMode = on;
  document.body.classList.toggle('editing', on);
  document.getElementById('editBar').classList.toggle('visible', on);
  document.getElementById('editStyleLabel').textContent = currentStyle;
  document.querySelectorAll('[data-key], [data-edit]').forEach(el => {
    el.contentEditable = on ? 'true' : 'false';
  });
}

document.getElementById('editToggle').addEventListener('click', (e) => {
  e.preventDefault();
  toggleEdit(!editMode);
});

document.getElementById('editClose').addEventListener('click', () => toggleEdit(false));

// Save edits back to styles object on blur
document.addEventListener('focusout', (e) => {
  if (!editMode || !e.target.dataset.key) return;
  const key = e.target.dataset.key;
  const value = htmlKeys.has(key) ? e.target.innerHTML : e.target.textContent;
  styles[currentStyle][key] = value;
});

// Export
document.getElementById('editExport').addEventListener('click', () => {
  const json = JSON.stringify(styles, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'shush-styles.json'; a.click();
  URL.revokeObjectURL(url);
});
