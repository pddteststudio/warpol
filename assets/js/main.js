(() => {
  const root = document.documentElement;
  const stored = localStorage.getItem('mps-language');
  const initial = stored === 'en' ? 'en' : 'ru';

  function applyLanguage(lang) {
    root.dataset.language = lang;
    root.lang = lang;
    localStorage.setItem('mps-language', lang);
    document.querySelectorAll('[data-map-title]').forEach(el => {
      if (el.dataset.selectedRu) {
        el.textContent = lang === 'ru' ? el.dataset.selectedRu : el.dataset.selectedEn;
      }
    });
    document.querySelectorAll('[data-map-text]').forEach(el => {
      if (el.dataset.selectedRu) {
        el.textContent = lang === 'ru' ? el.dataset.selectedRu : el.dataset.selectedEn;
      }
    });
  }
  applyLanguage(initial);

  document.querySelector('.lang-toggle')?.addEventListener('click', () => {
    applyLanguage(root.dataset.language === 'ru' ? 'en' : 'ru');
  });

  const menu = document.querySelector('.menu-toggle');
  menu?.addEventListener('click', () => document.body.classList.toggle('menu-open'));
  document.querySelectorAll('.main-nav a').forEach(a => a.addEventListener('click', () => document.body.classList.remove('menu-open')));

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px' });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  // Interactive map placeholder.
  const map = document.querySelector('[data-map]');
  if (map) {
    const viewport = map.querySelector('.map-viewport');
    const canvas = map.querySelector('.map-canvas');
    const title = map.querySelector('[data-map-title]');
    const text = map.querySelector('[data-map-text]');
    let scale = 1;
    let x = 0;
    let y = 0;
    let dragging = false;
    let sx = 0;
    let sy = 0;

    function render(animate = true) {
      canvas.style.transition = animate ? 'transform .18s ease' : 'none';
      canvas.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(${scale})`;
    }
    map.querySelector('[data-map-zoom="in"]').addEventListener('click', () => {
      scale = Math.min(1.8, +(scale + .2).toFixed(2)); render();
    });
    map.querySelector('[data-map-zoom="out"]').addEventListener('click', () => {
      scale = Math.max(.75, +(scale - .2).toFixed(2)); render();
    });
    map.querySelector('[data-map-reset]').addEventListener('click', () => {
      scale = 1; x = 0; y = 0; render();
    });
    viewport.addEventListener('pointerdown', e => {
      dragging = true; sx = e.clientX - x; sy = e.clientY - y;
      viewport.classList.add('dragging'); viewport.setPointerCapture(e.pointerId);
    });
    viewport.addEventListener('pointermove', e => {
      if (!dragging) return;
      x = e.clientX - sx; y = e.clientY - sy; render(false);
    });
    viewport.addEventListener('pointerup', e => {
      dragging = false; viewport.classList.remove('dragging'); viewport.releasePointerCapture(e.pointerId);
    });
    map.querySelectorAll('.map-point').forEach(point => {
      point.addEventListener('pointerdown', e => e.stopPropagation());
      point.addEventListener('click', () => {
        const ru = point.dataset.city;
        const en = point.dataset.cityEn;
        const typeRu = point.dataset.type;
        const typeEn = point.dataset.typeEn;
        title.dataset.selectedRu = ru;
        title.dataset.selectedEn = en;
        text.dataset.selectedRu = `${typeRu}. Демонстрационная точка будущей серверной карты.`;
        text.dataset.selectedEn = `${typeEn}. Demonstration point for the future live server map.`;
        title.textContent = root.dataset.language === 'ru' ? ru : en;
        text.textContent = root.dataset.language === 'ru' ? text.dataset.selectedRu : text.dataset.selectedEn;
      });
    });
  }
})();