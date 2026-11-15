// =============================================
// MATRIX RAIN EFFECT (Birthday Section)
// =============================================

(function() {
  'use strict';

  let matrixInterval = null;
  let matrixRunning = false;

  const MATRIX_CHARS = 'HAPPYBIRTHDAYLOVEYOU★♦❤✦💫🌟⭐✨🎉🎊🎂🌸💖'.split('');
  const COLORS = ['#FF6B9D','#FF8E53','#FFD93D','#A855F7','#3B82F6','#10B981'];

  function initMatrixRain() {
    const canvas = document.getElementById('matrix-rain');
    if (!canvas || matrixRunning) return;

    const ctx = canvas.getContext('2d');
    matrixRunning = true;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = canvas.parentElement ? canvas.parentElement.offsetHeight : window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    const fontSize = 18;
    let columns = Math.floor(canvas.width / fontSize);
    const drops = [];
    const columnColors = [];
    const delays = [];
    const started = [];

    function initColumns() {
      columns = Math.floor(canvas.width / fontSize);
      drops.length = 0;
      columnColors.length = 0;
      delays.length = 0;
      started.length = 0;
      for (let i = 0; i < columns; i++) {
        drops[i] = 0;
        columnColors[i] = COLORS[i % COLORS.length];
        delays[i] = Math.random() * 3000;
        started[i] = false;
      }
    }
    initColumns();

    const maxLength = () => Math.floor(canvas.height / fontSize) + 2;
    const startTime = Date.now();

    function draw() {
      // Fade trail
      ctx.fillStyle = 'rgba(5,2,15,0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `bold ${fontSize}px 'Space Grotesk', monospace`;
      const currentTime = Date.now();
      const ml = maxLength();

      for (let i = 0; i < drops.length; i++) {
        if (!started[i] && currentTime - startTime >= delays[i]) {
          started[i] = true;
        }
        if (started[i] && drops[i] < ml) {
          const char = MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)];
          const x = i * fontSize;
          const y = drops[i] * fontSize;
          const color = columnColors[i];

          // Glowing head character
          ctx.fillStyle = '#ffffff';
          ctx.shadowColor = color;
          ctx.shadowBlur = 15;
          ctx.fillText(char, x, y);
          ctx.shadowBlur = 0;

          // Trail
          if (drops[i] > 1) {
            ctx.fillStyle = color + 'CC';
            ctx.shadowColor = color;
            ctx.shadowBlur = 4;
            ctx.fillText(MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)], x, y - fontSize);
            ctx.shadowBlur = 0;
          }
        }

        if (started[i]) drops[i]++;

        if (drops[i] >= ml) {
          drops[i] = 0;
          delays[i] = Math.random() * 2000;
          started[i] = false;
        }
      }
    }

    matrixInterval = setInterval(draw, 50);

    window.addEventListener('resize', () => {
      clearTimeout(window._matrixResize);
      window._matrixResize = setTimeout(() => {
        resize();
        initColumns();
      }, 200);
    });
  }

  // Stop matrix
  window.stopMatrixRain = function() {
    if (matrixInterval) {
      clearInterval(matrixInterval);
      matrixInterval = null;
    }
    matrixRunning = false;
  };

  // Start when birthday section is visible
  function observeBirthdaySection() {
    const bdSection = document.getElementById('birthday');
    if (!bdSection) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          initMatrixRain();
        } else {
          if (matrixInterval) {
            clearInterval(matrixInterval);
            matrixInterval = null;
            matrixRunning = false;
          }
        }
      });
    }, { threshold: 0.1 });

    observer.observe(bdSection);
  }

  // Floating birthday particles (stars, hearts, emojis)
  function initBirthdayParticles() {
    const container = document.getElementById('birthday-particles');
    if (!container) return;

    const emojis = ['⭐','💫','✨','🌟','💖','💕','🎉','🎊','🎈','🎁','🌸','💝','🦋'];
    let particleInterval;

    function createParticle() {
      const el = document.createElement('div');
      el.style.cssText = `
        position: absolute;
        font-size: ${Math.random() * 20 + 12}px;
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        opacity: 0;
        pointer-events: none;
        animation: bdParticleFloat ${Math.random() * 4 + 3}s ease-in-out forwards;
        z-index: 0;
      `;
      el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      container.appendChild(el);
      setTimeout(() => el.remove(), 7000);
    }

    // Add CSS animation
    if (!document.getElementById('bd-particle-css')) {
      const style = document.createElement('style');
      style.id = 'bd-particle-css';
      style.textContent = `
        @keyframes bdParticleFloat {
          0% { opacity: 0; transform: translateY(0) scale(0) rotate(0deg); }
          20% { opacity: 0.8; transform: translateY(-30px) scale(1) rotate(10deg); }
          80% { opacity: 0.6; transform: translateY(-120px) scale(1.1) rotate(-5deg); }
          100% { opacity: 0; transform: translateY(-200px) scale(0.5) rotate(20deg); }
        }
      `;
      document.head.appendChild(style);
    }

    function startParticles() {
      particleInterval = setInterval(createParticle, 600);
    }

    const bdSection = document.getElementById('birthday');
    if (bdSection) {
      const obs = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            if (!particleInterval) startParticles();
          } else {
            clearInterval(particleInterval);
            particleInterval = null;
          }
        });
      }, { threshold: 0.1 });
      obs.observe(bdSection);
    }
  }

  window.addEventListener('DOMContentLoaded', () => {
    observeBirthdaySection();
    initBirthdayParticles();
  });
})();
