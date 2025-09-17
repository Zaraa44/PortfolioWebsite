/* =========================
   Scroll arrow (hero → next)
   ========================= */
const arrow = document.querySelector('.scroll-arrow');
if (arrow) {
    arrow.addEventListener('click', () => {
        const next = document.querySelector('.hero')?.nextElementSibling;
        if (next) next.scrollIntoView({ behavior: 'smooth' });
    });
}

/* =========================
   Burger / Fullscreen menu
   ========================= */
const burger     = document.getElementById('burger');
const menu       = document.getElementById('menu');
const menuClose  = document.getElementById('menuClose');

function openMenu(){
    menu?.classList.add('open');
    burger?.classList.add('open');
}
function closeMenu(){
    menu?.classList.remove('open');
    burger?.classList.remove('open');
}

burger?.addEventListener('click', () => {
    menu?.classList.contains('open') ? closeMenu() : openMenu();
});
menuClose?.addEventListener('click', closeMenu);
menu?.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });

/* =========================
   Typewriter effect (Hero)
   ========================= */
const typeEl = document.getElementById('typewriter');
let typerSession = 0;

function textFromI18n(lang) {
    const dict = (window.I18N && window.I18N[lang]) || window.I18N.en;
    const raw = (dict.hero_title || 'Hi,<br>my name is Nisa.').replace(/<br\s*\/?>/gi, '\n');
    return raw;
}

async function typeText(text, opts = {}) {
    const { delay = 60, linePause = 300, clearFirst = true } = opts;
    if (!typeEl) return;
    typerSession += 1;
    const session = typerSession;

    if (clearFirst) typeEl.innerHTML = "";

    for (let i = 0; i < text.length; i++) {
        if (session !== typerSession) return; // aborted
        const ch = text[i];
        if (ch === '\n') {
            typeEl.innerHTML += '<br>';
            await new Promise(r => setTimeout(r, linePause));
        } else {
            typeEl.innerHTML += `<span class="type-char">${ch}</span>`;
            await new Promise(r => setTimeout(r, delay));
        }
    }
}

async function retypeForLang(lang) {
    const txt = textFromI18n(lang);
    const isMobile = matchMedia('(max-width: 768px)').matches;
    await typeText(txt, { delay: isMobile ? 70 : 50, linePause: 350, clearFirst: true });
}

/* =========================
   Language toggle
   ========================= */
const langBtnFixed = document.getElementById('langToggle');
const langPills    = document.querySelectorAll('.lang-pill');

function applyTranslations(lang) {
    const dict = (window.I18N && window.I18N[lang]) || window.I18N.en;

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (!key || dict[key] == null) return;
        if (key === 'hero_title') return; // handled by typewriter
        el.textContent = dict[key];
    });

    if (langBtnFixed) langBtnFixed.textContent = lang.toUpperCase();
    langPills.forEach(p => p.classList.toggle('active', p.dataset.lang === lang));

    try { localStorage.setItem('lang', lang); } catch {}
}

function setLang(lang) {
    const normalized = (lang || 'en').toLowerCase();
    const chosen = (window.I18N && window.I18N[normalized]) ? normalized : 'en';
    applyTranslations(chosen);
    retypeForLang(chosen); // run typewriter
}

// Desktop chip cycles EN ↔ NL
langBtnFixed?.addEventListener('click', () => {
    const current = (localStorage.getItem('lang') || 'en').toLowerCase();
    setLang(current === 'en' ? 'nl' : 'en');
});

// Mobile pills explicit
langPills.forEach(pill => {
    pill.addEventListener('click', () => setLang(pill.dataset.lang));
});

// Init language (from storage or browser default)
(() => {
    const stored = (localStorage.getItem('lang') || '').toLowerCase();
    if (stored && window.I18N[stored]) return setLang(stored);

    const browser = (navigator.language || 'en').slice(0,2).toLowerCase();
    setLang(window.I18N[browser] ? browser : 'en');
})();

// Scroll reveal effect for About Me
const fadeEls = document.querySelectorAll('#about .fade-in');

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.2 });

fadeEls.forEach(el => observer.observe(el));

// Skill bars vullen als ze in beeld komen + percentage telt op
(() => {
  const bars = document.querySelectorAll('#about .skill-bars .progress');
  if (!bars.length) return;

  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      const bar = entry.target;
      bar.classList.add('fill');         // triggert scaleX-animatie

      // percentage-label animeren van 0 → doel (uit de tekst, bv. "90%")
      const label = bar.querySelector('span');
      if (label) {
        const target = parseInt(label.textContent, 10) || 0;
        label.textContent = '0%';
        const start = performance.now();
        const duration = 2000;

        const tick = (now) => {
          const p = Math.min((now - start) / duration, 1);
          label.textContent = Math.round(p * target) + '%';
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }

      obs.unobserve(bar); // één keer animeren
    });
  }, { threshold: 0.15 });

  bars.forEach(b => io.observe(b));
})();

// Typewriter effect for About Me
const aboutEl = document.getElementById('about-typewriter');
if (aboutEl) {
  const text = aboutEl.textContent.trim(); // originele tekst
  aboutEl.textContent = ""; // leegmaken
  let i = 0;

  function typeWriter() {
    if (i < text.length) {
      aboutEl.textContent += text.charAt(i);
      i++;
      setTimeout(typeWriter, 40); // snelheid aanpassen (ms per letter)
    }
  }

  // Start effect wanneer sectie in beeld komt
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        typeWriter();
        obs.disconnect(); // maar één keer uitvoeren
      }
    });
  }, { threshold: 0.4 });

  observer.observe(aboutEl);
}
