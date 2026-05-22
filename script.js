/**
 * Quran Academy — script.js
 * Vanilla JS — no dependencies
 */

/* ════════════════════════════════════════════════
   UTILITY HELPERS
════════════════════════════════════════════════ */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

function debounce(fn, delay = 100) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/* ════════════════════════════════════════════════
   DOM READY
════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initHamburger();
  initSmoothScroll();
  initRevealOnScroll();
  initCounters();
  initTestimonialsSlider();
  initFormValidation();
  initBackToTop();
  initActiveNavLinks();
  initTickerClone();
  initCurrentYear();
});

/* ════════════════════════════════════════════════
   1. NAVBAR — sticky + glass on scroll
════════════════════════════════════════════════ */
function initNavbar() {
  const navbar = $('#navbar');
  if (!navbar) return;

  const scrolled = () => {
    const past = window.scrollY > 40;
    navbar.classList.toggle('scrolled', past);
  };

  window.addEventListener('scroll', scrolled, { passive: true });
  scrolled(); // initial call
}

/* ════════════════════════════════════════════════
   2. HAMBURGER MENU
════════════════════════════════════════════════ */
function initHamburger() {
  const btn = $('#hamburger');
  const menu = $('#nav-menu');
  if (!btn || !menu) return;

  // Create overlay
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: fixed; inset: 0; z-index: 4;
    background: rgba(0,0,0,0.5);
    opacity: 0; pointer-events: none;
    transition: opacity 0.3s ease;
    backdrop-filter: blur(2px);
  `;
  document.body.appendChild(overlay);

  function openMenu() {
    btn.classList.add('open');
    menu.classList.add('open');
    btn.setAttribute('aria-expanded', 'true');
    overlay.style.opacity = '1';
    overlay.style.pointerEvents = 'auto';
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    btn.classList.remove('open');
    menu.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
    overlay.style.opacity = '0';
    overlay.style.pointerEvents = 'none';
    document.body.style.overflow = '';
  }

  btn.addEventListener('click', () => {
    if (menu.classList.contains('open')) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  overlay.addEventListener('click', closeMenu);

  // Close on nav link click
  $$('.nav-link, .nav-cta-btn', menu).forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.classList.contains('open')) {
      closeMenu();
      btn.focus();
    }
  });

  // Close on resize if desktop
  window.addEventListener('resize', debounce(() => {
    if (window.innerWidth > 768) closeMenu();
  }, 200));
}

/* ════════════════════════════════════════════════
   3. SMOOTH SCROLL — anchor links
════════════════════════════════════════════════ */
function initSmoothScroll() {
  const NAV_HEIGHT = parseInt(
    getComputedStyle(document.documentElement).getPropertyValue('--nav-height') || '72'
  );

  $$('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (href === '#') return;

      const target = $(href);
      if (!target) return;

      e.preventDefault();

      const targetTop = target.getBoundingClientRect().top + window.scrollY - NAV_HEIGHT;

      window.scrollTo({ top: targetTop, behavior: 'smooth' });
    });
  });
}

/* ════════════════════════════════════════════════
   4. REVEAL ON SCROLL — Intersection Observer
════════════════════════════════════════════════ */
function initRevealOnScroll() {
  const elements = $$('.reveal');
  if (!elements.length) return;

  // If reduced motion is preferred, show all immediately
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    elements.forEach(el => el.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -60px 0px' }
  );

  elements.forEach(el => observer.observe(el));
}

/* ════════════════════════════════════════════════
   5. ANIMATED COUNTERS
════════════════════════════════════════════════ */
function initCounters() {
  const counters = $$('.stat-number[data-target]');
  if (!counters.length) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    counters.forEach(el => {
      const target = parseInt(el.dataset.target, 10);
      const suffix = el.dataset.suffix || '';
      el.textContent = target + suffix;
    });
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach(el => observer.observe(el));
}

function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  const suffix = el.dataset.suffix || '';
  const duration = 2000; // ms
  const startTime = performance.now();

  // Easing function — ease-out-quad
  function easeOutQuad(t) {
    return t * (2 - t);
  }

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = easeOutQuad(progress);
    const current = Math.round(eased * target);

    el.textContent = current + suffix;

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      el.textContent = target + suffix;
    }
  }

  requestAnimationFrame(update);
}

/* ════════════════════════════════════════════════
   6. TESTIMONIALS SLIDER
════════════════════════════════════════════════ */
function initTestimonialsSlider() {
  const slider = $('#testimonials-slider');
  if (!slider) return;

  const slides = $$('.testimonial-slide', slider);
  const dotsContainer = $('#slider-dots');
  const prevBtn = $('#prev-btn');
  const nextBtn = $('#next-btn');

  if (!slides.length) return;

  let current = 0;
  let autoplayTimer = null;
  const AUTOPLAY_DELAY = 4000;

  function goTo(index, direction = 'next') {
    const prev = slides[current];
    const next = slides[index];

    // Exit animation on current slide
    prev.style.transition = 'opacity 0.45s ease, transform 0.45s ease';
    prev.style.opacity = '0';
    prev.style.transform = direction === 'next' ? 'translateX(-60px)' : 'translateX(60px)';
    prev.style.position = 'absolute';
    prev.style.inset = '0';

    // Prepare next slide
    next.style.transition = 'none';
    next.style.opacity = '0';
    next.style.transform = direction === 'next' ? 'translateX(60px)' : 'translateX(-60px)';
    next.style.position = 'relative';
    next.style.inset = '';

    // Force reflow
    void next.offsetWidth;

    // Animate in
    next.style.transition = 'opacity 0.45s ease, transform 0.45s ease';
    next.style.opacity = '1';
    next.style.transform = 'translateX(0)';

    // After transition: reset old slide
    prev.addEventListener('transitionend', () => {
      prev.classList.remove('active');
      prev.style.cssText = '';
    }, { once: true });

    next.classList.add('active');
    current = index;

    // Update dots
    if (dotsContainer) {
      $$('.dot', dotsContainer).forEach((dot, i) => {
        dot.classList.toggle('active', i === current);
        dot.setAttribute('aria-current', i === current ? 'true' : 'false');
      });
    }
  }

  function next() {
    const nextIndex = (current + 1) % slides.length;
    goTo(nextIndex, 'next');
  }

  function prev() {
    const prevIndex = (current - 1 + slides.length) % slides.length;
    goTo(prevIndex, 'prev');
  }

  function startAutoplay() {
    stopAutoplay();
    autoplayTimer = setInterval(next, AUTOPLAY_DELAY);
  }

  function stopAutoplay() {
    clearInterval(autoplayTimer);
    autoplayTimer = null;
  }

  // Button events
  if (nextBtn) nextBtn.addEventListener('click', () => { next(); resetAutoplay(); });
  if (prevBtn) prevBtn.addEventListener('click', () => { prev(); resetAutoplay(); });

  function resetAutoplay() {
    stopAutoplay();
    startAutoplay();
  }

  // Dot navigation
  if (dotsContainer) {
    $$('.dot', dotsContainer).forEach((dot, i) => {
      dot.addEventListener('click', () => {
        if (i !== current) {
          goTo(i, i > current ? 'next' : 'prev');
          resetAutoplay();
        }
      });
    });
  }

  // Pause on hover
  const wrapper = slider.closest('.testimonials-wrapper');
  if (wrapper) {
    wrapper.addEventListener('mouseenter', stopAutoplay);
    wrapper.addEventListener('mouseleave', startAutoplay);
    wrapper.addEventListener('focusin', stopAutoplay);
    wrapper.addEventListener('focusout', startAutoplay);
  }

  // Touch / swipe support
  let touchStartX = 0;
  let touchEndX = 0;

  slider.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
    stopAutoplay();
  }, { passive: true });

  slider.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    const delta = touchStartX - touchEndX;
    if (Math.abs(delta) > 50) {
      if (delta > 0) next();
      else prev();
    }
    startAutoplay();
  }, { passive: true });

  // Keyboard support
  slider.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { next(); resetAutoplay(); }
    if (e.key === 'ArrowLeft') { prev(); resetAutoplay(); }
  });

  // Init first slide
  slides.forEach((slide, i) => {
    if (i !== 0) {
      slide.style.opacity = '0';
      slide.style.position = 'absolute';
      slide.style.inset = '0';
    }
  });

  startAutoplay();
}

/* ════════════════════════════════════════════════
   7. FORM VALIDATION
════════════════════════════════════════════════ */
function initFormValidation() {
  const form = $('#enrollment-form');
  if (!form) return;

  const successMsg = $('#form-success');
  const submitBtn = $('#form-submit');

  const validators = {
    'full-name': {
      el: $('#full-name', form),
      errorEl: $('#full-name-error', form),
      validate(value) {
        if (!value.trim()) return 'Please enter your full name.';
        if (value.trim().length < 2) return 'Name must be at least 2 characters.';
        if (value.trim().length > 80) return 'Name must be under 80 characters.';
        return null;
      }
    },
    'email': {
      el: $('#email', form),
      errorEl: $('#email-error', form),
      validate(value) {
        if (!value.trim()) return 'Please enter your email address.';
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
        if (!re.test(value.trim())) return 'Please enter a valid email address.';
        return null;
      }
    },
    'phone': {
      el: $('#phone', form),
      errorEl: $('#phone-error', form),
      validate(value) {
        if (!value.trim()) return 'Please enter your WhatsApp number.';
        // Allow +, digits, spaces, dashes
        const re = /^[\+]?[\d\s\-()]{7,20}$/;
        if (!re.test(value.trim())) return 'Please enter a valid phone number (7–20 digits).';
        return null;
      }
    },
    'student-age': {
      el: $('#student-age', form),
      errorEl: $('#student-age-error', form),
      validate(value) {
        if (!value.trim()) return 'Please enter the student\'s age.';
        const age = parseInt(value, 10);
        if (isNaN(age) || age < 4 || age > 80) return 'Age must be between 4 and 80.';
        return null;
      }
    },
    'course': {
      el: $('#course', form),
      errorEl: $('#course-error', form),
      validate(value) {
        if (!value) return 'Please select a course of interest.';
        return null;
      }
    }
  };

  function validateField(key) {
    const { el, errorEl, validate } = validators[key];
    const error = validate(el.value);
    if (error) {
      el.classList.add('error');
      el.setAttribute('aria-invalid', 'true');
      errorEl.textContent = error;
      return false;
    } else {
      el.classList.remove('error');
      el.removeAttribute('aria-invalid');
      errorEl.textContent = '';
      return true;
    }
  }

  // Validate on blur (live feedback)
  Object.keys(validators).forEach(key => {
    const { el } = validators[key];
    if (!el) return;

    el.addEventListener('blur', () => validateField(key));

    // Clear error on input (optimistic)
    el.addEventListener('input', () => {
      if (el.classList.contains('error')) {
        el.classList.remove('error');
        el.removeAttribute('aria-invalid');
        validators[key].errorEl.textContent = '';
      }
    });
  });

  // Submit
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    let isValid = true;
    Object.keys(validators).forEach(key => {
      if (!validateField(key)) isValid = false;
    });

    if (!isValid) {
      // Scroll to first error
      const firstError = form.querySelector('.error');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstError.focus();
      }
      return;
    }

    // Simulate submission (no real backend)
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';
    submitBtn.style.opacity = '0.7';

    setTimeout(() => {
      form.reset();
      submitBtn.disabled = false;
      submitBtn.innerHTML = `
        <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" style="width:18px;height:18px;flex-shrink:0"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"/></svg>
        Send Enrollment Request
      `;
      submitBtn.style.opacity = '';

      if (successMsg) {
        successMsg.hidden = false;
        successMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        // Auto-hide after 8s
        setTimeout(() => { successMsg.hidden = true; }, 8000);
      }
    }, 1200);
  });
}

/* ════════════════════════════════════════════════
   8. BACK TO TOP BUTTON
════════════════════════════════════════════════ */
function initBackToTop() {
  const btn = $('#back-to-top');
  if (!btn) return;

  const toggle = () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  };

  window.addEventListener('scroll', toggle, { passive: true });
  toggle();

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ════════════════════════════════════════════════
   9. ACTIVE NAV LINK ON SCROLL
════════════════════════════════════════════════ */
function initActiveNavLinks() {
  const sections = $$('section[id]');
  const navLinks = $$('.nav-link[href^="#"]');
  if (!sections.length || !navLinks.length) return;

  const NAV_HEIGHT = 80;

  function updateActiveLink() {
    const scrollY = window.scrollY + NAV_HEIGHT + 10;

    let currentSection = sections[0].id;

    sections.forEach(section => {
      if (section.offsetTop <= scrollY) {
        currentSection = section.id;
      }
    });

    navLinks.forEach(link => {
      const href = link.getAttribute('href').slice(1); // remove #
      link.classList.toggle('active', href === currentSection);
    });
  }

  window.addEventListener('scroll', debounce(updateActiveLink, 80), { passive: true });
  updateActiveLink();
}

/* ════════════════════════════════════════════════
   10. TICKER DUPLICATE for seamless loop
════════════════════════════════════════════════ */
function initTickerClone() {
  const tickerItems = $('#ticker-items');
  if (!tickerItems) return;

  // Clone the ticker content to create a seamless loop
  const clone = tickerItems.cloneNode(true);
  clone.setAttribute('aria-hidden', 'true');
  tickerItems.parentNode.appendChild(clone);
}

/* ════════════════════════════════════════════════
   11. FOOTER CURRENT YEAR
════════════════════════════════════════════════ */
function initCurrentYear() {
  const el = $('#current-year');
  if (el) el.textContent = new Date().getFullYear();
}
