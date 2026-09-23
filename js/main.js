/* ============================================
   Main interactions: hero entrance, scroll reveals,
   mobile nav toggle, gallery carousel, current-day highlight
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ---- Split section headings into words for the reveal effect ----
  // (Hero h1 is pre-split in the HTML to protect the accent span; section
  // headings are plain text, so we split them here at runtime.)
  document.querySelectorAll('.section-head h2').forEach((el) => {
    const words = el.textContent.trim().split(/\s+/);
    el.innerHTML = words
      .map((w) => `<span class="split-line"><span class="split-word">${w}</span></span>`)
      .join(' ');
  });

  // ---- Hero entrance (the one orchestrated motion) ----
  if (window.gsap) {
    gsap.registerPlugin(ScrollTrigger);

    const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    heroTl
      .from('.hero-content .eyebrow-line', { y: 16, opacity: 0, duration: 0.5 })
      .from('.hero-content h1 .split-word', {
        yPercent: 110,
        duration: 0.8,
        stagger: 0.08,
      }, '-=0.2')
      .from('.hero-content p', { y: 18, opacity: 0, duration: 0.6 }, '-=0.4')
      .from('.hero-actions .btn', { y: 14, opacity: 0, duration: 0.5, stagger: 0.1 }, '-=0.3')
      .from('.hero-meta > div', { y: 12, opacity: 0, duration: 0.5, stagger: 0.08 }, '-=0.25');

    // ---- Quiet scroll reveals for section content ----
    document.querySelectorAll('.reveal').forEach((el) => {
      gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
        },
      });
    });

    // ---- Word-by-word reveal for section headings on scroll ----
    document.querySelectorAll('.section-head h2 .split-word').forEach((word) => {
      gsap.set(word, { yPercent: 110 });
    });

    document.querySelectorAll('.section-head').forEach((head) => {
      gsap.to(head.querySelectorAll('h2 .split-word'), {
        yPercent: 0,
        duration: 0.7,
        stagger: 0.04,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: head,
          start: 'top 85%',
        },
      });
    });
  }

  // ---- Mobile nav toggle ----
  const toggle = document.querySelector('.mobile-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (toggle && navLinks) {
    toggle.addEventListener('click', () => {
      const open = navLinks.classList.toggle('open');
      toggle.textContent = open ? '✕' : '☰';
    });
    navLinks.querySelectorAll('a').forEach((a) =>
      a.addEventListener('click', () => {
        navLinks.classList.remove('open');
        toggle.textContent = '☰';
      })
    );
  }

  // ---- Gallery carousel ----
  if (window.Swiper) {
    new Swiper('.gallery-swiper', {
      slidesPerView: 1.15,
      spaceBetween: 20,
      centeredSlides: false,
      pagination: { el: '.swiper-pagination', clickable: true },
      breakpoints: {
        640: { slidesPerView: 1.6 },
        900: { slidesPerView: 2.3 },
      },
    });
  }

  // ---- Highlight today's row in the hours table ----
  const dayMap = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const today = dayMap[new Date().getDay()];
  const row = document.querySelector(`.hours-table tr[data-day="${today}"]`);
  if (row) row.classList.add('today');
});