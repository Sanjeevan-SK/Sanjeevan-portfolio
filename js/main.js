// ==========================================
// PORTFOLIO — MAIN JS
// ==========================================

/* ---------- LOADER ---------- */
const GREETINGS = [
  { text: 'Hello!',     lang: 'English' },
  { text: 'வணக்கம்!', lang: 'Tamil'   },
  { text: 'Bonjour!',   lang: 'French'  },
  { text: 'Hola!',      lang: 'Spanish' },
  { text: 'こんにちは!', lang: 'Japanese'},
];

(function runLoader() {
  const loader  = document.getElementById('loader');
  const greetEl = document.getElementById('loader-greeting');
  const subEl   = document.getElementById('loader-sub');
  if (!loader || !greetEl) return;

  let idx = 0;
  function showGreeting() {
    greetEl.style.animation = 'none';
    greetEl.textContent = GREETINGS[idx].text;
    subEl.textContent   = GREETINGS[idx].lang;
    void greetEl.offsetWidth;
    greetEl.style.animation = 'loaderFade 0.9s ease forwards';
    idx++;
    if (idx < GREETINGS.length) {
      setTimeout(showGreeting, 700);
    }
  }
  showGreeting();

  setTimeout(() => {
    loader.style.display = 'none';
    document.body.classList.add('loaded');
    initAll();
  }, 3600);
})();

/* ---------- INIT ---------- */
function initAll() {
  initNav();
  initTypingEffect();
  initScrollReveal();
  initCounters();
  showToast();
}

/* ---------- FLOATING NAV ---------- */
function initNav() {
  const nav     = document.getElementById('floating-nav');
  const items   = nav ? nav.querySelectorAll('.nav-item') : [];
  const sections = [];

  items.forEach(item => {
    const href = item.getAttribute('href');
    if (href && href.startsWith('#')) {
      const sec = document.querySelector(href);
      if (sec) sections.push({ el: sec, item });
    }
  });

  function updateActive() {
    const scrollY = window.scrollY + window.innerHeight * 0.4;
    let current = sections[0];
    for (const s of sections) {
      if (s.el.offsetTop <= scrollY) current = s;
    }
    items.forEach(i => i.classList.remove('active'));
    if (current) current.item.classList.add('active');
  }

  window.addEventListener('scroll', updateActive, { passive: true });
  updateActive();
}

/* ---------- TYPING EFFECT ---------- */
function initTypingEffect() {
  const el = document.getElementById('typed-text');
  if (!el) return;

  const phrases = [
    'Software Engineer',
    'AI Engineer',
    'Data Engineer',
    'Full Stack Developer',
  ];

  let pIdx = 0, cIdx = 0, deleting = false;
  const speed = { type: 80, delete: 40, pause: 2000 };

  function tick() {
    const phrase = phrases[pIdx];
    if (!deleting) {
      el.textContent = phrase.slice(0, ++cIdx);
      if (cIdx === phrase.length) {
        deleting = true;
        return setTimeout(tick, speed.pause);
      }
    } else {
      el.textContent = phrase.slice(0, --cIdx);
      if (cIdx === 0) {
        deleting = false;
        pIdx = (pIdx + 1) % phrases.length;
      }
    }
    setTimeout(tick, deleting ? speed.delete : speed.type);
  }
  tick();
}

/* ---------- SCROLL REVEAL ---------- */
function initScrollReveal() {
  const revealEls    = document.querySelectorAll('.reveal');
  const staggerEls   = document.querySelectorAll('.reveal-stagger');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  [...revealEls, ...staggerEls].forEach(el => observer.observe(el));
}

/* ---------- ANIMATED COUNTERS ---------- */
function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el    = entry.target;
      const end   = parseInt(el.getAttribute('data-count'), 10);
      const dur   = 1800;
      const step  = Math.ceil(end / (dur / 16));
      let current = 0;
      const suffix = el.getAttribute('data-suffix') || '';
      const tick = () => {
        current = Math.min(current + step, end);
        el.textContent = current + suffix;
        if (current < end) requestAnimationFrame(tick);
      };
      tick();
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });

  if (counters.length > 0) {
    counters.forEach(el => observer.observe(el));
  }
  
  initContactForm();
}


/* ---------- CONTACT FORM SUBMISSION ---------- */
function initContactForm() {
  const form = document.getElementById('contact-form');
  const status = document.getElementById('form-status');
  const btn = document.getElementById('btn-submit');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // UI state: loading
    btn.disabled = true;
    const originalBtnText = btn.innerHTML;
    btn.innerHTML = 'Sending...';
    status.className = 'form-status';
    status.style.display = 'none';

    const formData = new FormData(form);
    const object = Object.fromEntries(formData);
    const json = JSON.stringify(object);

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: json
      });
      
      const result = await response.json();
      
      if (response.status === 200) {
        status.textContent = 'Message sent successfully!';
        status.classList.add('success');
        form.reset();
        showFeedbackToast('Success! Your message was sent.', '🎉');
      } else {
        status.textContent = result.message || 'Something went wrong.';
        status.classList.add('error');
      }
    } catch (error) {
      status.textContent = 'Unable to send message. Please check your connection.';
      status.classList.add('error');
    } finally {
      btn.disabled = false;
      btn.innerHTML = originalBtnText;
      status.style.display = 'block';
    }
  });
}

function showFeedbackToast(msg, icon = '👋') {
  const toast = document.getElementById('toast');
  if (!toast) return;
  
  const iconEl = toast.querySelector('.toast-icon');
  const textEl = toast.querySelector('span:not(.toast-icon)');
  
  if (iconEl) iconEl.textContent = icon;
  if (textEl) textEl.textContent = msg;

  toast.style.display = 'flex';
  toast.classList.remove('hiding');
  
  setTimeout(() => {
    toast.classList.add('hiding');
    setTimeout(() => {
      toast.style.display = 'none';
      toast.classList.remove('hiding');
    }, 400);
  }, 4000);
}

// Update showToast to prevent duplicate logic if needed
function showToast() {
  setTimeout(() => showFeedbackToast("Welcome! Let's build something great together."), 1000);
}


/* ---------- SMOOTH SCROLL NAV LINKS ---------- */
document.addEventListener('click', (e) => {
  const link = e.target.closest('a[href^="#"]');
  if (!link) return;
  e.preventDefault();
  const target = document.querySelector(link.getAttribute('href'));
  if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
});
