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

// Parallax blobs — react to mouse movement
const blobs = document.querySelectorAll('.blob');
let mouseX = 0, mouseY = 0, blobX = 0, blobY = 0;

document.addEventListener('mousemove', (e) => {
  mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
  mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
});

function animateBlobs() {
  blobX += (mouseX - blobX) * 0.03;
  blobY += (mouseY - blobY) * 0.03;
  blobs.forEach((blob, i) => {
    const factor = (i + 1) * 12;
    blob.style.translate = `${blobX * factor}px ${blobY * factor}px`;
  });
  requestAnimationFrame(animateBlobs);
}
animateBlobs();

// Shake detection on mobile — triggers blob pulse
if ('DeviceMotionEvent' in window) {
  let lastShake = 0;
  let lastAcc = { x: 0, y: 0, z: 0 };

  window.addEventListener('devicemotion', (e) => {
    const acc = e.accelerationIncludingGravity;
    if (!acc) return;
    const delta = Math.abs(acc.x - lastAcc.x) + Math.abs(acc.y - lastAcc.y) + Math.abs(acc.z - lastAcc.z);
    lastAcc = { x: acc.x, y: acc.y, z: acc.z };

    if (delta > 25 && Date.now() - lastShake > 1500) {
      lastShake = Date.now();
      blobs.forEach(blob => {
        blob.animate([
          { transform: 'scale(1)', opacity: blob.style.opacity || 0.45 },
          { transform: 'scale(1.4)', opacity: 0.8 },
          { transform: 'scale(1)', opacity: blob.style.opacity || 0.45 }
        ], { duration: 800, easing: 'ease-out' });
      });
    }
  });
}

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

// Typing sound (Web Audio API — mechanical keyboard click)
let audioCtx;
let soundMuted = true;

document.getElementById('muteBtn').addEventListener('click', () => {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  soundMuted = !soundMuted;
  document.getElementById('muteBtn').textContent = soundMuted ? 'unmute' : 'mute';
});

function playTypeClick() {
  if (!audioCtx || soundMuted) return;
  const t = audioCtx.currentTime;

  // Thump — low sine with fast decay
  const osc = audioCtx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(150 + Math.random() * 30, t);
  osc.frequency.exponentialRampToValueAtTime(60, t + 0.04);

  const gain = audioCtx.createGain();
  gain.gain.setValueAtTime(0.12, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start(t);
  osc.stop(t + 0.05);
}

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
      if (text[charIndex] !== ' ' && charIndex % 2 === 0) playTypeClick();
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
const htmlKeys = new Set(['heroTitle', 'ctaTitle', 'eaTitle', 'plan1Desc', 'plan2Desc', 'plan3Desc', 'plan2Price']);

// Save casual text from HTML as source of truth
const casualStyle = {};
document.querySelectorAll('[data-key]').forEach(el => {
  casualStyle[el.dataset.key] = htmlKeys.has(el.dataset.key) ? el.innerHTML : el.textContent;
});

const styles = {
  formal: {
    heroTitle: 'Deine Gedanken direkt als Text. <em>Ohne Tippen.</em>',
    heroSub: 'Shush nimmt auf, was Sie sagen, und wandelt es in perfekt formatierten Text um. Direkt in Ihren bevorzugten Apps.',
    heroCta: 'Jetzt 3 Tage kostenlos testen',
    styleLabel: 'Maßgeschneidert',
    styleDesc: 'Sie entscheiden, wie Ihr Text aussieht. Shush passt sich Ihrem Schreibstil an. Probieren Sie es aus:',
    step1h: 'Doppeltippen', step1p: 'Drücken Sie zweimal die Lautstärketaste — in jeder beliebigen Anwendung.',
    step2h: 'Sprechen', step2p: 'Sagen Sie, was Ihnen durch den Kopf geht.',
    step3h: 'Erneut Drücken', step3p: 'Ihr Text wird automatisch eingefügt. Genau dort, wo Sie ihn benötigen.',
    feat1h: 'Universell einsetzbar', feat1p: 'Ob WhatsApp, Notion, Google Docs oder Ihre bevorzugte Notiz-App — Shush fügt den Text genau dort ein, wo Sie ihn brauchen.',
    feat2h: 'Mehrsprachig', feat2p: 'Sprechen Sie einfach los. Shush erkennt die Sprache automatisch und transkribiert zuverlässig. Auch Deutsch und Englisch gemischt.',
    feat3h: 'Barrierefreiheit im Fokus', feat3p: 'Wir möchten, dass jede Stimme genutzt werden kann. Intuitive Bedienung ohne komplexe Menüführung.',
    feat4h: 'Zeitersparnis im Überblick', feat4p: 'Verfolgen Sie in Ihren Statistiken, wie viele Stunden Tipparbeit Sie sich diese Woche gespart haben.',
    quote: '„Als Journalist muss ich häufig schnell Gedanken festhalten. Shush ist das erste Tool, das meinen Workflow nicht unterbricht, sondern merklich beschleunigt."',
    quoteCite: '— Ein sehr beschäftigter Mensch',
    pricingTitle: 'Wählen Sie Ihren Plan',
    plan1Name: 'Reinschnuppern', plan1Price: '0 €', plan1Desc: '3 Tage volle Funktion.<br>Perfekt zum Ausprobieren.', plan1Cta: 'Kostenlos testen',
    plan2Name: 'Shush', plan2Price: '27 € <span>/ Jahr</span>', plan2Desc: 'Voller Zugriff auf alle Features.<br>Preisgarantie für das erste Jahr.', plan2Cta: 'Jetzt sichern',
    plan3Name: 'Für Sonderwünsche', plan3Price: 'Individuell', plan3Desc: 'Ihnen fehlt noch etwas an Shush?<br>Ein Feature, das Sie unbedingt benötigen?', plan3Cta: 'Kontakt aufnehmen',
    pricingNote: 'Hinweis: Nach dem ersten Jahr evaluieren wir gemeinsam die Konditionen. Der aktuelle Preis gilt garantiert für die ersten 12 Monate.',
    eaLabel: 'Early Access',
    eaTitle: 'Shush ist bereits <em>verfügbar</em>',
    eaDesc1: 'Die App befindet sich derzeit im Freigabeprozess für den App Store. Sie können Shush jedoch bereits jetzt nutzen. Als Early-Access-Nutzer erhalten Sie eine kostenlose Testphase auf unbestimmte Zeit mit bis zu 1.000 Wörtern alle 3 Stunden.',
    eaDesc2: '1.000 Wörter entsprechen etwa 5 WhatsApp-Verläufen, 3 Notion-Seiten oder einem ausführlichen Meeting-Protokoll.',
    ea1h: 'APK herunterladen', ea1p: 'Am einfachsten: Öffnen Sie diese Seite direkt auf Ihrem Android-Gerät (z.B. den Link per WhatsApp oder Signal an sich selbst senden). Tippen Sie anschließend auf den Download-Button.',
    ea2h: 'Installation erlauben', ea2p: 'Ihr Gerät fragt, ob Sie Apps aus unbekannten Quellen installieren möchten. Tippen Sie auf „Einstellungen" und aktivieren Sie die Erlaubnis für Ihren Browser.',
    ea3h: 'App installieren', ea3p: 'Öffnen Sie die heruntergeladene Datei und tippen Sie auf „Installieren". Öffnen Sie Shush nach der Installation.',
    ea4h: 'Mikrofon erlauben', ea4p: 'Android fragt beim ersten Start automatisch — tippen Sie auf „Erlauben".',
    ea5h: 'Benachrichtigungen erlauben', ea5p: 'Damit Shush Ihnen den Aufnahmestatus anzeigen kann. Auch hier „Erlauben" wählen.',
    ea6h: 'Bedienungshilfen aktivieren', ea6p: 'Damit Shush Text in andere Apps einfügen kann. Sie werden zu den Android-Einstellungen weitergeleitet — finden Sie Shush in der Liste, aktivieren Sie den Schalter und bestätigen Sie.',
    ea7h: 'Loslegen', ea7p: 'Drücken Sie zweimal die Leiser-Taste, sprechen Sie, und drücken Sie erneut zweimal. Ihr Text wird automatisch in das aktive Textfeld eingefügt.',
    ctaTitle: 'Werden Sie Teil der <em>Reise</em>',
    ctaSub: 'Wir dokumentieren die Entwicklung von Shush transparent. Möchten Sie Feedback geben oder zu den ersten Nutzern gehören?',
  },
  messy: {
    heroTitle: 'deine gedanken direkt als text. <em>ohne Tippen</em>',
    heroSub: 'shush nimmt auf was du sagst und macht daraus text. direkt in deine apps halt',
    heroCta: 'jetzt 3 tage koatenlos testen',
    styleLabel: 'maßgeschneidert',
    styleDesc: 'du entscheidest wie dein text aussieht. shush passt sich deinem schreibstil an probier es aus:',
    step1h: 'drücken', step1p: 'zweimal die lautstärketaste drücken egal in welcher app',
    step2h: 'reden', step2p: 'sag was dir durch den Kopf geht',
    step3h: 'nochmal drücken', step3p: 'dein text wird eingefügt genau da wo du ihn brauchst',
    feat1h: 'überall einsatzbereit', feat1p: 'egal ob Whatsapp notion google docs oder deine notiz app shush fügt den text dort ein wo du ihn brauchst',
    feat2h: 'multilingual', feat2p: 'sprich einfach los. shush erkennt die sprache automatisch und transkribiert fhelerfrei auch deutsch und englisch gemischt',
    feat3h: 'barrierefrei gedacht', feat3p: 'wir wollen dass jede stimme genuzt werden kann einfachste bedienung ohne komplizierte Menüs',
    feat4h: 'Zeit sparen und tracken', feat4p: 'sieh in deinen stats wie viele stunden tippen du dir diese Woche gespart hast',
    quote: '„als Journalist muss ich oft schnell gedanken festhalten. shush ist das erste tool das meinen Workflow nicht unterbricht sondern beschleunigt"',
    quoteCite: '— ein sehr beschäftigter Mensch',
    pricingTitle: 'wähle deinen Plan',
    plan1Name: 'reinschnuppern', plan1Price: '0 €', plan1Desc: '3 tage volle funktion.<br>perfekt zum Ausprobieren.', plan1Cta: 'gratis testen',
    plan2Name: 'shush', plan2Price: '27 € <span>/ jahr</span>', plan2Desc: 'voller zugriff auf alle features.<br>preisgarantie fürs erste Jahr.', plan2Cta: 'jetzt sichern',
    plan3Name: 'für extrawürste', plan3Price: 'individuell', plan3Desc: 'dir fehlt noch was an shush?<br>ein feature das du unbedingt brauchst?', plan3Cta: 'lass uns reden',
    pricingNote: 'hinweis: nach dem ersten jahr schauen wir gemeinsam wie es weitergeht. wir garantieren den Preis aktuell nur für die ersten 12 monate',
    eaLabel: 'early access',
    eaTitle: 'shush ist bereits <em>verfügbar</em>',
    eaDesc1: 'die app ist noch nicht im app store (jaja der approval prozess) aber du kannst sie jetzt schon nutzen. als early access user bekommst du eine kostenlose testphase auf unbestimmte Zeit mit bis zu 1.000 wörtern alle 3 stunden',
    eaDesc2: '1.000 wörter? das sind 5 whatsapp verläufe 3 notion seiten oder die komplette gedankenwelt die du hattest während du so getan hast als würdest du zuhören',
    ea1h: 'apk runterladen', ea1p: 'am einfachsten: öffne die seite auf deinem handy (zb link an dich selbst per whatsapp oder signal schicken). dann auf den download button tippen',
    ea2h: 'installation erlauben', ea2p: 'dein handy fragt ob du apps aus unbekannten quellen installieren willst. auf einstellungen tippen und erlaubnis aktivieren',
    ea3h: 'app installieren', ea3p: 'die datei öffnen und auf installieren tippen. danach shush öffnen',
    ea4h: 'mikrofon erlauben', ea4p: 'android fragt automatisch einfach erlauben tippen',
    ea5h: 'benachrichtigungen erlauben', ea5p: 'damit shush dir den status anzeigen kann. auch hier einfach erlauben',
    ea6h: 'bedienungshilfen aktivieren', ea6p: 'damit shush text in andere apps einfügen kann. du wirst zu den einstellungen weitergeleitet shush in der liste finden schalter aktivieren bestätigen',
    ea7h: 'loslegen', ea7p: 'drück 2 mal die leiser taste sprich los und drück noch 2 mal. dein text wird automatisch ins aktive textfeld eingefügt in jeder deiner apps',
    ctaTitle: 'werde teil der <em>Reise</em>',
    ctaSub: 'wir dokumentieren die entwicklung von shush transparent. du willst feedback geben oder zu den ersten Usern gehören?',
  }
};

function applyStyle(style) {
  document.querySelectorAll('.style-opt').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.style === style);
  });

  const source = style === 'casual' ? casualStyle : styles[style];
  if (!source) return;

  document.querySelectorAll('[data-key]').forEach(el => {
    const key = el.dataset.key;
    if (source[key] !== undefined) {
      if (htmlKeys.has(key)) el.innerHTML = source[key];
      else el.textContent = source[key];
    }
  });
}

document.querySelectorAll('.style-opt').forEach(btn => {
  btn.addEventListener('click', () => applyStyle(btn.dataset.style));
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
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') overlay.classList.remove('visible'); });

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

// --- Easter Eggs ---

// 1. Tab blur/focus title swap
const originalTitle = document.title;
document.addEventListener('visibilitychange', () => {
  document.title = document.hidden ? '🤫 shushhh... komm zurück' : originalTitle;
});

// 2. Console message
console.log(
  '%c🤫 shush',
  'font-size: 48px; font-weight: bold; color: #c4b5fd; text-shadow: 2px 2px 0 #1a1a2e;'
);
console.log(
  '%cneugierig? schreib uns → shush.love',
  'font-size: 14px; color: #888; font-family: monospace;'
);

// 4. Text swap on h2 hover — shows a cute message, then reverts
const cuteMessages = [
  'shush hört dir zu <3',
  'shush weiß was du sagen willst :3',
  'shush versteht schon :)',
  'sag einfach was du denkst <3',
  'shush macht den rest :)',
];
document.querySelectorAll('h2').forEach(h => {
  let timeout;
  h.addEventListener('mouseenter', () => {
    const original = h.textContent;
    const msg = cuteMessages[Math.floor(Math.random() * cuteMessages.length)];
    h.textContent = msg;
    timeout = setTimeout(() => { h.textContent = original; }, 1500);
    h.addEventListener('mouseleave', () => {
      clearTimeout(timeout);
      h.textContent = original;
    }, { once: true });
  });
});

// 6. Scroll progress bar
const progressBar = document.createElement('div');
Object.assign(progressBar.style, {
  position: 'fixed', top: '0', left: '0', height: '2px', width: '0',
  background: 'rgba(196, 181, 253, 0.25)', zIndex: '9999',
  transition: 'width 0.1s', pointerEvents: 'none',
});
document.body.appendChild(progressBar);
window.addEventListener('scroll', () => {
  const pct = window.scrollY / (document.body.scrollHeight - window.innerHeight) * 100;
  progressBar.style.width = pct + '%';
}, { passive: true });
