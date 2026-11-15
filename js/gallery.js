// =============================================
// GALLERY - Filter + Lightbox
// =============================================

(function() {
  'use strict';

  function initGallery() {
    // ===== FILTER =====
    const filterBtns = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');

    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        // Active state
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.dataset.filter;

        galleryItems.forEach(item => {
          const category = item.dataset.category;
          const show = filter === 'all' || category === filter;

          if (show) {
            item.style.display = '';
            item.style.opacity = '0';
            item.style.transform = 'scale(0.9)';
            setTimeout(() => {
              item.style.opacity = '1';
              item.style.transform = 'scale(1)';
            }, 50);
          } else {
            item.style.opacity = '0';
            item.style.transform = 'scale(0.9)';
            setTimeout(() => { item.style.display = 'none'; }, 300);
          }
        });
      });
    });

    // ===== LIGHTBOX =====
    const lightbox = document.getElementById('lightbox');
    const lightboxContent = document.getElementById('lightbox-content');
    const lightboxClose = document.getElementById('lightbox-close');
    const lightboxPrev = document.getElementById('lightbox-prev');
    const lightboxNext = document.getElementById('lightbox-next');

    let currentIndex = 0;
    const visibleItems = () => Array.from(galleryItems).filter(i => i.style.display !== 'none');

    if (!lightbox) return;

    function openLightbox(index) {
      const items = visibleItems();
      if (!items[index]) return;
      currentIndex = index;

      const item = items[index];
      const placeholder = item.querySelector('.gallery-placeholder');
      const overlay = item.querySelector('.gallery-overlay');
      const caption = overlay ? overlay.querySelector('p') : null;

      lightboxContent.innerHTML = '';

      // Clone the placeholder content
      if (placeholder) {
        const clone = placeholder.cloneNode(true);
        clone.style.cssText = `
          width: 80vw;
          max-width: 600px;
          height: 60vh;
          border-radius: 16px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1rem;
        `;
        // Scale up the emoji
        const emojiSpan = clone.querySelector('span');
        if (emojiSpan) emojiSpan.style.fontSize = '6rem';
        const pEl = clone.querySelector('p');
        if (pEl) pEl.style.fontSize = '1.1rem';
        lightboxContent.appendChild(clone);
      }

      // Caption
      if (caption) {
        const capEl = document.createElement('p');
        capEl.style.cssText = 'color: rgba(255,255,255,0.7); font-size: 0.95rem; margin-top: 1rem; text-align: center;';
        capEl.textContent = caption.textContent;
        lightboxContent.appendChild(capEl);
      }

      lightbox.classList.add('open');
      document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
      lightbox.classList.remove('open');
      document.body.style.overflow = '';
    }

    galleryItems.forEach((item, index) => {
      item.addEventListener('click', () => {
        const items = visibleItems();
        const visibleIndex = items.indexOf(item);
        if (visibleIndex !== -1) openLightbox(visibleIndex);
      });
    });

    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);

    if (lightboxPrev) {
      lightboxPrev.addEventListener('click', (e) => {
        e.stopPropagation();
        const items = visibleItems();
        currentIndex = (currentIndex - 1 + items.length) % items.length;
        openLightbox(currentIndex);
      });
    }

    if (lightboxNext) {
      lightboxNext.addEventListener('click', (e) => {
        e.stopPropagation();
        const items = visibleItems();
        currentIndex = (currentIndex + 1) % items.length;
        openLightbox(currentIndex);
      });
    }

    // Close on background click
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('open')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') lightboxPrev && lightboxPrev.click();
      if (e.key === 'ArrowRight') lightboxNext && lightboxNext.click();
    });

    // Touch swipe on lightbox
    let touchStartX = 0;
    lightbox.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
    lightbox.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 50) {
        const items = visibleItems();
        if (dx < 0) { currentIndex = (currentIndex + 1) % items.length; }
        else { currentIndex = (currentIndex - 1 + items.length) % items.length; }
        openLightbox(currentIndex);
      }
    });
  }

  // ===== SKILL BARS ANIMATION =====
  function initSkillBars() {
    const bars = document.querySelectorAll('.skill-bar');
    if (!bars.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const bar = entry.target;
          const fill = bar.querySelector('.skill-fill');
          const level = bar.dataset.level || '0';
          if (fill) fill.style.width = level + '%';
          observer.unobserve(bar);
        }
      });
    }, { threshold: 0.5 });

    bars.forEach(bar => observer.observe(bar));
  }

  window.addEventListener('DOMContentLoaded', () => {
    initGallery();
    initSkillBars();
  });
})();
