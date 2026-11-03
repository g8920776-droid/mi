// Construyo, Practico y Aprendo — comportamiento compartido
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

// Banner: rota las diapositivas y solo reproduce el video visible
(() => {
  const slides = [...document.querySelectorAll('.banner-slide')];
  if (!slides.length) return;
  let i = 0, timer;
  const show = n => {
    i = (n + slides.length) % slides.length;
    slides.forEach((s, k) => {
      const on = k === i, v = s.querySelector('video');
      s.classList.toggle('active', on);
      if (v) on ? v.play().catch(() => {}) : v.pause();
    });
  };
  show(0);
  if (slides.length > 1 && !reduce) {
    const box = document.querySelector('.banner-container');
    const start = () => (timer = setInterval(() => show(i + 1), 7000));
    start();
    box.addEventListener('mouseenter', () => clearInterval(timer));
    box.addEventListener('mouseleave', start);
  }
})();

// Galería
(() => {
  const slides = [...document.querySelectorAll('.gallery-slide')];
  if (!slides.length) return;
  let i = 0;
  const go = d => {
    slides[i].classList.remove('active');
    i = (i + d + slides.length) % slides.length;
    slides[i].classList.add('active');
  };
  document.querySelector('.gallery-btn.prev')?.addEventListener('click', () => go(-1));
  document.querySelector('.gallery-btn.next')?.addEventListener('click', () => go(1));
})();

// Sopas de letras: seleccionas celdas en línea recta (horizontal, vertical o diagonal)
document.querySelectorAll('.wordsearch').forEach(ws => {
  const cols = +ws.dataset.cols, letters = [...ws.dataset.letters];
  const words = ws.dataset.words.split(',');
  const scope = ws.closest('.accordion-content') || document;
  const badges = [...scope.querySelectorAll('.word-badge')];
  const msg = Object.assign(document.createElement('p'), { className: 'msg ok' });
  msg.setAttribute('role', 'status');
  scope.append(msg);

  const grid = ws.appendChild(Object.assign(document.createElement('div'), { className: 'ws-grid' }));
  grid.style.setProperty('--cols', cols);
  let sel = [];
  const cells = letters.map((l, n) => {
    const b = Object.assign(document.createElement('button'), { type: 'button', className: 'ws-cell', textContent: l });
    b.setAttribute('aria-pressed', 'false');
    b.addEventListener('click', () => {
      if (b.classList.contains('found')) return;
      sel = sel.includes(n) ? sel.filter(x => x !== n) : [...sel, n];
      b.classList.toggle('sel');
      b.setAttribute('aria-pressed', sel.includes(n));
      check();
    });
    grid.append(b);
    return b;
  });

  function check() {
    if (sel.length < 2) return;
    const s = [...sel].sort((a, b) => a - b), d = s[1] - s[0];
    const line = [1, cols, cols + 1, cols - 1].includes(d) &&
      s.every((v, k) => !k || v - s[k - 1] === d) &&
      (d !== 1 || s.every(v => Math.floor(v / cols) === Math.floor(s[0] / cols)));
    if (!line) return;
    const text = s.map(n => letters[n]).join('');
    const word = words.find(w => w === text || w === [...text].reverse().join(''));
    if (!word) return;
    s.forEach(n => { cells[n].classList.replace('sel', 'found'); });
    badges.find(b => b.textContent.trim() === word)?.classList.add('completed');
    sel = [];
    if (scope.querySelectorAll('.word-badge.completed').length === words.length) msg.textContent = ws.dataset.done;
  }
});

// Cuestionarios de una pregunta
document.querySelectorAll('.quiz').forEach(q => {
  const out = q.querySelector('.quiz-msg');
  q.querySelector('.check').addEventListener('click', () => {
    const pick = q.querySelector('input:checked');
    out.className = 'quiz-msg ' + (pick?.value === 'correct' ? 'ok' : 'bad');
    out.textContent = !pick ? q.dataset.none : pick.value === 'correct' ? q.dataset.ok : q.dataset.no;
  });
});

// Rompecabezas
document.querySelectorAll('.puzzle-container').forEach(box => {
  const cards = [...box.querySelectorAll('.puzzle-card')], msg = document.getElementById('puzzle-msg');
  cards.forEach(c => c.addEventListener('click', () => {
    if (c.classList.contains('matched')) return;
    c.classList.add('matched');
    c.textContent = '✅ ' + c.dataset.name + ' ensamblada';
    if (cards.every(x => x.classList.contains('matched'))) msg.textContent = '🎉 ¡Excelente! Completaste el rompecabezas de subsistemas terrestres.';
  }));
});
