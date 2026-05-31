/* ============================================================
   SECTION 1 — PLEXUS BACKGROUND & CURSOR (Visual FX)
   ============================================================ */

/**
 * Plexus network visualization — floating nodes connected by faint
 * lines, matching the blindsight-landing and about page style.
 */
(function () {
  const canvas = document.getElementById('code-bg');
  const ctx    = canvas.getContext('2d');
  let W, H, nodes, LINK, N;

  function resize() {
    W    = canvas.width  = Math.floor(innerWidth  * devicePixelRatio);
    H    = canvas.height = Math.floor(innerHeight * devicePixelRatio);
    LINK = Math.min(W, H) * 0.15;
    N    = Math.min(90, Math.round(W * H / (24000 * devicePixelRatio)));
    nodes = [];
    for (let i = 0; i < N; i++) {
      nodes.push({
        x:  Math.random() * W,
        y:  Math.random() * H,
        vx: (Math.random() - 0.5) * 0.22 * devicePixelRatio,
        vy: (Math.random() - 0.5) * 0.22 * devicePixelRatio,
        r:  (Math.random() * 1.4 + 0.7) * devicePixelRatio,
        tw: Math.random() * Math.PI * 2
      });
    }
  }
  resize();
  addEventListener('resize', resize);

  function frame() {
    ctx.clearRect(0, 0, W, H);

    // Draw connecting lines between nearby nodes
    for (let i = 0; i < N; i++) {
      const a = nodes[i];
      for (let j = i + 1; j < N; j++) {
        const b = nodes[j];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < LINK) {
          ctx.strokeStyle = `rgba(70,165,255,${(1 - d / LINK) * 0.35})`;
          ctx.lineWidth   = 0.6 * devicePixelRatio;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    // Draw glowing nodes
    for (let i = 0; i < N; i++) {
      const n = nodes[i];
      n.x += n.vx; n.y += n.vy; n.tw += 0.04;
      if (n.x < 0 || n.x > W) n.vx *= -1;
      if (n.y < 0 || n.y > H) n.vy *= -1;
      ctx.beginPath();
      ctx.fillStyle   = `rgba(143,214,255,${0.5 + Math.sin(n.tw) * 0.35})`;
      ctx.shadowBlur  = 7 * devicePixelRatio;
      ctx.shadowColor = 'rgba(58,166,255,0.9)';
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    requestAnimationFrame(frame);
  }
  frame();
})();

/**
 * Custom cursor — tracks mouse with a smooth lagging outer ring.
 * Scales up when hovering interactive elements.
 */
const cur  = document.getElementById('cur');
const cur2 = document.getElementById('cur2');
let mx = 0, my = 0, cx = 0, cy = 0;

document.addEventListener('mousemove', e => {
  mx = e.clientX;
  my = e.clientY;
  cur.style.left = mx + 'px';
  cur.style.top  = my + 'px';
});

(function tick() {
  cx += (mx - cx) * 0.12;
  cy += (my - cy) * 0.12;
  cur2.style.left = cx + 'px';
  cur2.style.top  = cy + 'px';
  requestAnimationFrame(tick);
})();

document.querySelectorAll('a, button').forEach(el => {
  el.addEventListener('mouseenter', () => {
    cur2.style.width   = '60px';
    cur2.style.height  = '60px';
    cur2.style.opacity = '0.5';
  });
  el.addEventListener('mouseleave', () => {
    cur2.style.width   = '36px';
    cur2.style.height  = '36px';
    cur2.style.opacity = '1';
  });
});




/* ============================================================
   SECTION 2 — SCROLL & INTERSECTION OBSERVERS (Animations)
   ============================================================ */

/**
 * Scroll reveal — adds `.vis` class to `.reveal` elements as they
 * enter the viewport, triggering the CSS fade-up transition.
 */
const revealObs = new IntersectionObserver(entries => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      setTimeout(() => e.target.classList.add('vis'), i * 60);
    }
  });
}, { threshold: 0.08 });

document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

/**
 * Stat counters — animates `[data-target]` numbers from 0 to their
 * target value when the About section scrolls into view.
 */
const countObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      document.querySelectorAll('[data-target]').forEach(el => {
        const target = +el.dataset.target;
        const dur    = 1200;
        const start  = performance.now();
        const step   = now => {
          const p = Math.min((now - start) / dur, 1);
          el.textContent = Math.round(p * target);
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      });
      countObs.disconnect();
    }
  });
}, { threshold: 0.4 });

const aboutSec = document.getElementById('about');
if (aboutSec) countObs.observe(aboutSec);

/**
 * Nav active state — highlights the nav link matching the
 * section currently visible in the viewport on scroll.
 */
const sections  = document.querySelectorAll('section[id]');
const navLinks  = document.querySelectorAll('.nav-r a');

window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(s => {
    if (window.scrollY >= s.offsetTop - 140) current = s.id;
  });
  navLinks.forEach(a => {
    const href = a.getAttribute('href');
    if (href === '#' + current) {
      a.style.color = 'var(--cyan)';
    } else if (!a.classList.contains('nav-scholar')) {
      a.style.color = '';
    }
  });
}, { passive: true });


/* ============================================================
   SECTION 3 — FORM HANDLING (Contact)
   ============================================================ */

/**
 * handleSubmit — intercepts the contact form submission,
 * shows a visual success state, then resets the button.
 * @param {Event} e - The form submit event
 */
function handleSubmit(e) {
  e.preventDefault();
  const btn = e.target.querySelector('.form-submit');

  btn.textContent       = 'Sent ✓';
  btn.style.background  = '#3bdc86';
  btn.style.color       = '#050d1a';

  setTimeout(() => {
    btn.textContent      = 'Send Message →';
    btn.style.background = '';
    btn.style.color      = '';
  }, 3000);
}
