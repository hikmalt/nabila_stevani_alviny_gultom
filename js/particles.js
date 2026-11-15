// =============================================
// PARTICLES & HERO CANVAS ANIMATION
// =============================================

(function() {
  'use strict';

  // ===== LOADER PARTICLES =====
  function initLoaderParticles() {
    const canvas = document.getElementById('loader-particles');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const colors = ['#7C3AED','#EC4899','#F59E0B','#10B981','#3B82F6','#EF4444'];

    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 3 + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        alpha: Math.random() * 0.6 + 0.2
      });
    }

    let animId;
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color + Math.round(p.alpha * 255).toString(16).padStart(2, '0');
        ctx.fill();
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
      });
      animId = requestAnimationFrame(draw);
    }
    draw();
    return animId;
  }

  // ===== HERO CANVAS - PARTICLE CONSTELLATION =====
  function initHeroCanvas() {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    const PARTICLE_COUNT = 100;
    const particles = [];
    const mouse = { x: -9999, y: -9999 };

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 2.5 + 0.5,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        alpha: Math.random() * 0.5 + 0.1,
        color: ['#7C3AED','#EC4899','#F59E0B','#3B82F6','#10B981','#ffffff'][Math.floor(Math.random() * 6)]
      });
    }

    canvas.addEventListener('mousemove', e => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    });

    function connectParticles() {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(124,58,237,${(1 - dist / 120) * 0.15})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
        // Connect to mouse
        const mdx = particles[i].x - mouse.x;
        const mdy = particles[i].y - mouse.y;
        const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
        if (mdist < 150) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = `rgba(236,72,153,${(1 - mdist / 150) * 0.4})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }

    function animHero() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      connectParticles();

      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
        ctx.globalAlpha = 1;

        // Mouse repulsion
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 80) {
          p.vx += (dx / dist) * 0.3;
          p.vy += (dy / dist) * 0.3;
        }

        // Speed limit
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (speed > 2) { p.vx = (p.vx / speed) * 2; p.vy = (p.vy / speed) * 2; }

        p.x += p.vx;
        p.y += p.vy;

        // Friction
        p.vx *= 0.99;
        p.vy *= 0.99;

        // Bounce
        if (p.x < 0 || p.x > canvas.width) { p.vx *= -1; p.x = Math.max(0, Math.min(canvas.width, p.x)); }
        if (p.y < 0 || p.y > canvas.height) { p.vy *= -1; p.y = Math.max(0, Math.min(canvas.height, p.y)); }
      });

      requestAnimationFrame(animHero);
    }
    animHero();
  }

  // ===== CUSTOM CURSOR =====
  function initCursor() {
    const cursor = document.getElementById('custom-cursor');
    const trail = document.getElementById('cursor-trail');
    if (!cursor || !trail) return;

    let mouseX = 0, mouseY = 0;
    let trailX = 0, trailY = 0;

    document.addEventListener('mousemove', e => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursor.style.left = mouseX + 'px';
      cursor.style.top = mouseY + 'px';
    });

    function animTrail() {
      trailX += (mouseX - trailX) * 0.12;
      trailY += (mouseY - trailY) * 0.12;
      trail.style.left = trailX + 'px';
      trail.style.top = trailY + 'px';
      requestAnimationFrame(animTrail);
    }
    animTrail();

    // Hover effects
    document.querySelectorAll('a, button, [class*="btn"], .gallery-item, .skill-card, .wish-card, .hobby-pill').forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('expanded'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('expanded'));
    });
  }

  // ===== TYPEWRITER EFFECT =====
  window.initTypewriter = function(elementId, words, speed = 100, deleteSpeed = 50, pause = 2000) {
    const el = document.getElementById(elementId);
    if (!el) return;

    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    function type() {
      const currentWord = words[wordIndex];
      if (isDeleting) {
        el.textContent = currentWord.substring(0, charIndex - 1);
        charIndex--;
      } else {
        el.textContent = currentWord.substring(0, charIndex + 1);
        charIndex++;
      }

      let delay = isDeleting ? deleteSpeed : speed;

      if (!isDeleting && charIndex === currentWord.length) {
        delay = pause;
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        wordIndex = (wordIndex + 1) % words.length;
        delay = 300;
      }

      setTimeout(type, delay);
    }
    type();
  };

  // ===== COUNTER ANIMATION =====
  window.animateCounter = function(el, target, duration = 2000) {
    const start = 0;
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target);
      if (progress < 1) requestAnimationFrame(update);
      else el.textContent = target;
    }
    requestAnimationFrame(update);
  };

  // ===== SCROLL REVEAL =====
  window.initScrollReveal = function() {
    const revealEls = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(el => observer.observe(el));
  };

  // Init on load
  window.addEventListener('DOMContentLoaded', () => {
    initLoaderParticles();
    initHeroCanvas();
    initCursor();
  });
})();
