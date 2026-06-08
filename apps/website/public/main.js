/**
 * Runwae — main.js
 * Handles: sticky nav, mobile menu, smooth scroll, FAQ accordion,
 * partner tab switcher, marquee pause-on-hover, scroll entrance
 * animations, how-it-works step tabs.
 */

(function () {
  'use strict';

  /* ============================================================
     UTILITY
     ============================================================ */

  function ready(fn) {
    if (document.readyState !== 'loading') { fn(); }
    else { document.addEventListener('DOMContentLoaded', fn); }
  }

  function rafThrottle(fn) {
    let ticking = false;
    return function (...args) {
      if (!ticking) {
        requestAnimationFrame(() => { fn.apply(this, args); ticking = false; });
        ticking = true;
      }
    };
  }

  /* ============================================================
     1. STICKY NAV
     ============================================================ */
  function initStickyNav() {
    const nav = document.getElementById('siteNav');
    if (!nav) return;

    function onScroll() {
      nav.classList.toggle('nav--scrolled', window.scrollY > 10);
    }

    window.addEventListener('scroll', rafThrottle(onScroll), { passive: true });
    onScroll();
  }

  /* ============================================================
     2. MOBILE MENU
     ============================================================ */
  function initMobileMenu() {
    const hamburger = document.getElementById('navHamburger');
    const drawer    = document.getElementById('navDrawer');
    if (!hamburger || !drawer) return;

    let isOpen = false;

    function toggle() {
      isOpen = !isOpen;
      hamburger.classList.toggle('is-open', isOpen);
      drawer.classList.toggle('is-open', isOpen);
      hamburger.setAttribute('aria-expanded', String(isOpen));
      drawer.setAttribute('aria-hidden', String(!isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
    }

    hamburger.addEventListener('click', toggle);

    const closeBtn = document.getElementById('navDrawerClose');
    if (closeBtn) closeBtn.addEventListener('click', toggle);

    drawer.querySelectorAll('.drawer-link').forEach(link => {
      link.addEventListener('click', () => { if (isOpen) toggle(); });
    });

    document.addEventListener('click', (e) => {
      if (isOpen && !drawer.contains(e.target) && !hamburger.contains(e.target)) toggle();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isOpen) toggle();
    });
  }

  /* ============================================================
     3. SMOOTH SCROLL
     ============================================================ */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        const id = anchor.getAttribute('href').slice(1);
        if (!id) return;
        const target = document.getElementById(id);
        if (!target) return;
        e.preventDefault();
        const navHeight = document.getElementById('siteNav')?.offsetHeight || 64;
        const top = target.getBoundingClientRect().top + window.scrollY - navHeight - 16;
        window.scrollTo({ top, behavior: 'smooth' });
      });
    });
  }

  /* ============================================================
     4. FAQ ACCORDION
     ============================================================ */
  function initFaqAccordion() {
    const items = document.querySelectorAll('.faq-item');
    if (!items.length) return;

    items.forEach(item => {
      const trigger = item.querySelector('.faq-item__trigger');
      const body    = item.querySelector('.faq-item__body');
      if (!trigger || !body) return;

      trigger.addEventListener('click', () => {
        const isOpenNow = item.classList.contains('is-open');

        // Close all
        items.forEach(other => {
          other.classList.remove('is-open');
          const ob = other.querySelector('.faq-item__trigger');
          const bb = other.querySelector('.faq-item__body');
          if (ob) ob.setAttribute('aria-expanded', 'false');
          if (bb) bb.setAttribute('aria-hidden', 'true');
        });

        // Toggle current
        if (!isOpenNow) {
          item.classList.add('is-open');
          trigger.setAttribute('aria-expanded', 'true');
          body.setAttribute('aria-hidden', 'false');
        }
      });
    });
  }

  /* ============================================================
     5. PARTNER TAB SWITCHER
     ============================================================ */
  function initPartnerTabs() {
    const allTabBtns = document.querySelectorAll('[data-target]');
    if (!allTabBtns.length) return;

    const contents = {
      'event-host':     document.getElementById('event-host-content'),
      'travel-partner': document.getElementById('travel-partner-content'),
    };

    function activateTab(targetId) {
      allTabBtns.forEach(btn => {
        const isThis = btn.dataset.target === targetId;
        btn.classList.toggle('is-active', isThis);
        btn.setAttribute('aria-selected', String(isThis));
      });

      Object.entries(contents).forEach(([id, el]) => {
        if (!el) return;
        el.classList.toggle('is-active', id === targetId);
      });

      // Re-trigger reveal animations for newly visible content
      setTimeout(() => {
        triggerRevealForContainer(contents[targetId]);
      }, 50);

      // Scroll to top of content
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    allTabBtns.forEach(btn => {
      btn.addEventListener('click', () => activateTab(btn.dataset.target));
    });
  }

  /* ============================================================
     6. PARTNER HASH ROUTING
     Reads #event-host or #travel-partner from the URL on load
     and activates the matching tab on partners.html
     ============================================================ */
  function initPartnerHashRouting() {
    const hash = window.location.hash.slice(1);
    if (hash === 'event-host' || hash === 'travel-partner') {
      const tab = document.querySelector(`[data-target="${hash}"]`);
      if (tab) tab.click();
    }
  }

  /* ============================================================
     7. MODALS (Waitlist + Contact)
     ============================================================ */
  function initModals() {
    function openModal(id) {
      const el = document.getElementById(id);
      if (!el) return;
      el.classList.add('is-open');
      el.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }

    function closeModal(id) {
      const el = document.getElementById(id);
      if (!el) return;
      el.classList.remove('is-open');
      el.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    const waitlistTriggers = ['navWaitlistTrigger', 'drawerWaitlistTrigger'];
    waitlistTriggers.forEach(id => {
      document.getElementById(id)?.addEventListener('click', (e) => {
        e.preventDefault();
        openModal('waitlistModal');
      });
    });

    const contactTriggers = ['navContactTrigger', 'drawerContactTrigger'];
    contactTriggers.forEach(id => {
      document.getElementById(id)?.addEventListener('click', (e) => {
        e.preventDefault();
        openModal('contactModal');
      });
    });

    document.getElementById('waitlistClose')?.addEventListener('click', () => closeModal('waitlistModal'));
    document.getElementById('contactClose')?.addEventListener('click', () => closeModal('contactModal'));

    ['waitlistModal', 'contactModal'].forEach(id => {
      document.getElementById(id)?.addEventListener('click', (e) => {
        if (e.target.id === id) closeModal(id);
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeModal('waitlistModal');
        closeModal('contactModal');
      }
    });

    document.getElementById('waitlistForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      closeModal('waitlistModal');
    });

    document.getElementById('contactForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      closeModal('contactModal');
    });
  }

  /* ============================================================
     8. MARQUEE PAUSE ON HOVER
     ============================================================ */
  function initMarqueePause() {
    document.querySelectorAll('.marquee-track').forEach(track => {
      track.addEventListener('mouseenter', () => { track.style.animationPlayState = 'paused'; });
      track.addEventListener('mouseleave', () => { track.style.animationPlayState = 'running'; });
    });
  }

  /* ============================================================
     7. SCROLL ENTRANCE ANIMATIONS
     ============================================================ */
  function triggerRevealForContainer(container) {
    if (!container) return;
    const revealEls = container.querySelectorAll('.reveal:not(.is-visible)');
    if (!('IntersectionObserver' in window)) {
      revealEls.forEach(el => el.classList.add('is-visible'));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    revealEls.forEach(el => observer.observe(el));
  }

  function initScrollReveal() {
    const revealEls = document.querySelectorAll('.reveal');
    if (!revealEls.length) return;

    if (!('IntersectionObserver' in window)) {
      revealEls.forEach(el => el.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(el => observer.observe(el));
  }

  /* ============================================================
     8. HOW IT WORKS — STEP TABS (B2C)
     ============================================================ */
  function initHowSteps() {
    const tabs      = document.querySelectorAll('.how-step-tab');
    const stepNum   = document.getElementById('howStepNum');
    const stepLabel = document.getElementById('howStepLabel');
    if (!tabs.length) return;

    function activateStep(tab) {
      tabs.forEach(t => {
        t.classList.remove('is-active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('is-active');
      tab.setAttribute('aria-selected', 'true');

      if (stepNum)   stepNum.textContent = tab.dataset.step || '';
      if (stepLabel) stepLabel.innerHTML = tab.dataset.stepLabel || '';
    }

    tabs.forEach(tab => {
      tab.addEventListener('click', () => activateStep(tab));
    });

    // Auto-cycle every 3.5s
    let current = 0;
    const tabArr = Array.from(tabs);
    setInterval(() => {
      current = (current + 1) % tabArr.length;
      activateStep(tabArr[current]);
    }, 3500);
  }

  /* ============================================================
     9. TRAVEL PARTNER SUB-TABS (Hotels vs Activities)
     ============================================================ */
  function initTravelSubTabs() {
    const subtabs = document.querySelectorAll('.tp-subtab');
    if (!subtabs.length) return;

    function activateSubTab(targetId) {
      subtabs.forEach(btn => {
        const isThis = btn.dataset.subtarget === targetId;
        btn.classList.toggle('is-active', isThis);
        btn.setAttribute('aria-selected', String(isThis));
      });
      document.querySelectorAll('.tp-features').forEach(el => {
        el.classList.toggle('is-active', el.id === targetId);
      });
      // Re-trigger reveal animations for newly shown content
      setTimeout(() => {
        const container = document.getElementById(targetId);
        if (container) triggerRevealForContainer(container);
      }, 50);
    }

    subtabs.forEach(btn => {
      btn.addEventListener('click', () => activateSubTab(btn.dataset.subtarget));
    });
  }

  /* ============================================================
     INIT
     ============================================================ */
  ready(() => {
    initStickyNav();
    initMobileMenu();
    initSmoothScroll();
    initFaqAccordion();
    initPartnerTabs();
    initPartnerHashRouting();
    initTravelSubTabs();
    initMarqueePause();
    initScrollReveal();
    initHowSteps();
    initModals();

    // Hero & partner hero elements animate on load immediately
    setTimeout(() => {
      document.querySelectorAll('.hero .reveal, .partner-hero .reveal').forEach((el, i) => {
        setTimeout(() => el.classList.add('is-visible'), i * 120);
      });
    }, 100);
  });

})();
