// ═══════════════════════════════════════════════════════════
// MAIN.JS — Luxury Magazine Theme Orchestrator
// Uses GSAP (from referensi) + Intersection Observer
// ═══════════════════════════════════════════════════════════

(function () {
  'use strict';

  // ══════════════════
  // LOADING SCREEN
  // ══════════════════
  function initLoader() {
    const loader = document.getElementById('loading-screen');
    if (!loader) return;

    // Count up loader percentage
    const numEl = loader.querySelector('.loader-progress-num');
    let num = 0;
    const countInterval = setInterval(() => {
      num = Math.min(num + Math.random() * 8, 99);
      if (numEl) numEl.textContent = Math.floor(num) + '%';
    }, 100);

    setTimeout(() => {
      clearInterval(countInterval);
      if (numEl) numEl.textContent = '100%';
      setTimeout(() => {
        loader.classList.add('done');
        setTimeout(() => loader.remove(), 900);
        // Trigger hero animations after loader done
        initHeroAnimations();
      }, 400);
    }, 2400);
  }

  // ══════════════════
  // GSAP HERO ANIMATIONS
  // ══════════════════
  function initHeroAnimations() {
    if (typeof gsap === 'undefined') {
      // Fallback: plain CSS animation
      document.querySelectorAll('[data-gsap]').forEach(el => el.classList.add('visible'));
      return;
    }

    // Register ScrollTrigger
    if (typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
    }

    // Hero text — stagger (from referensi Hero.jsx)
    gsap.fromTo('.hero-eyebrow', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: 'power2.out', delay: 0.2 });
    gsap.fromTo('.headline-word', { y: 40, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.2, duration: 1.2, ease: 'power3.out', delay: 0.4 });
    gsap.fromTo('.hero-role-wrap', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease: 'power2.out', delay: 1 });
    gsap.fromTo('.hero-desc', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease: 'power2.out', delay: 1.1 });
    gsap.fromTo('.hero-cta', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease: 'power2.out', delay: 1.2 });
    gsap.fromTo('.hero-counters', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease: 'power2.out', delay: 1.3 });
    gsap.fromTo('.hero-right', { x: 40, opacity: 0 }, { x: 0, opacity: 1, duration: 1.2, ease: 'power3.out', delay: 0.8 });
    gsap.fromTo('.scroll-hint', { opacity: 0 }, { opacity: 1, duration: 1, delay: 2 });

    // Animate name underline
    setTimeout(() => {
      const nameEl = document.querySelector('.headline-name');
      if (nameEl) nameEl.classList.add('anim');
    }, 2000);

    // ScrollTrigger reveals (from referensi GSAP approach)
    if (typeof ScrollTrigger !== 'undefined') {
      document.querySelectorAll('[data-gsap="fade-up"]').forEach((el, i) => {
        gsap.fromTo(el,
          { y: 30, opacity: 0 },
          {
            y: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
            delay: parseFloat(el.style.getPropertyValue('--di') || 0) * 0.1,
            scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' }
          }
        );
      });
      document.querySelectorAll('[data-gsap="fade-right"]').forEach(el => {
        gsap.fromTo(el,
          { x: -30, opacity: 0 },
          {
            x: 0, opacity: 1, duration: 0.9, ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' }
          }
        );
      });
      document.querySelectorAll('[data-gsap="fade-left"]').forEach(el => {
        gsap.fromTo(el,
          { x: 30, opacity: 0 },
          {
            x: 0, opacity: 1, duration: 0.9, ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' }
          }
        );
      });
    } else {
      // Fallback: IntersectionObserver
      const obs = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
        });
      }, { threshold: 0.15 });
      document.querySelectorAll('[data-gsap]').forEach(el => obs.observe(el));
    }

    // Counter animation with ScrollTrigger
    animateCounters();

    // Birthday timeline line
    const bdLine = document.getElementById('bd-tl-line');
    if (bdLine && typeof ScrollTrigger !== 'undefined') {
      gsap.fromTo(bdLine,
        { height: '0%' },
        {
          height: '100%', duration: 2, ease: 'power2.inOut',
          scrollTrigger: { trigger: '.bd-timeline', start: 'top 70%' }
        }
      );
    } else if (bdLine) {
      const o = new IntersectionObserver(e => {
        if (e[0].isIntersecting) { bdLine.style.height = '100%'; o.disconnect(); }
      });
      o.observe(document.querySelector('.bd-timeline') || bdLine);
    }
  }

  // ══════════════════
  // COUNTER ANIMATION
  // ══════════════════
  function animateCounters() {
    const counters = document.querySelectorAll('.counter-num[data-target]');

    function animate(el) {
      const target = parseInt(el.dataset.target);
      const start = performance.now();
      const duration = 2000;
      function update(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(eased * target);
        if (progress < 1) requestAnimationFrame(update);
        else el.textContent = target;
      }
      requestAnimationFrame(update);
    }

    if (typeof ScrollTrigger !== 'undefined') {
      counters.forEach(el => {
        ScrollTrigger.create({
          trigger: el,
          start: 'top 85%',
          once: true,
          onEnter: () => animate(el)
        });
      });
    } else {
      const obs = new IntersectionObserver(entries => {
        entries.forEach(e => { if (e.isIntersecting) { animate(e.target); obs.unobserve(e.target); } });
      }, { threshold: 0.5 });
      counters.forEach(el => obs.observe(el));
    }
  }

  // ══════════════════
  // NAVIGATION
  // ══════════════════
  function initNav() {
    const nav = document.getElementById('main-nav');
    const burger = document.getElementById('nav-burger');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileClose = document.getElementById('mobile-menu-close');
    const mmLinks = document.querySelectorAll('.mm-link');
    const navLinks = document.querySelectorAll('.nav-link');

    // Scroll: add .scrolled class
    const onScroll = () => {
      if (window.scrollY > 30) nav.classList.add('scrolled');
      else nav.classList.remove('scrolled');
      updateActiveLink();
      updateScrollProgress();
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    // Mobile menu
    burger && burger.addEventListener('click', () => mobileMenu.classList.add('open'));
    mobileClose && mobileClose.addEventListener('click', () => mobileMenu.classList.remove('open'));
    mmLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
      });
    });

    // Smooth scroll all anchor links
    document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', e => {
        const href = link.getAttribute('href');
        if (href === '#' || !href) return;
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          const navH = 72;
          const top = target.getBoundingClientRect().top + window.scrollY - navH;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      });
    });

    function updateActiveLink() {
      const sections = document.querySelectorAll('.section[id]');
      let current = '';
      sections.forEach(section => {
        const top = section.getBoundingClientRect().top;
        if (top <= 100) current = section.id;
      });
      navLinks.forEach(link => {
        const s = link.dataset.s;
        link.classList.toggle('active', s === current);
      });
    }
  }

  // ══════════════════
  // SCROLL PROGRESS
  // ══════════════════
  function updateScrollProgress() {
    const bar = document.getElementById('scroll-progress-line');
    if (!bar) return;
    const scrolled = window.scrollY;
    const total = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (scrolled / total * 100) + '%';
  }

  // ══════════════════
  // PREMIUM CURSOR (from referensi style)
  // ══════════════════
  function initCursor() {
    const dot = document.getElementById('cursor-dot');
    const ring = document.getElementById('cursor-ring');
    if (!dot || !ring) return;

    let ringX = 0, ringY = 0;
    let mouseX = 0, mouseY = 0;

    document.addEventListener('mousemove', e => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.left = mouseX + 'px';
      dot.style.top = mouseY + 'px';
    });

    function animRing() {
      ringX += (mouseX - ringX) * 0.15;
      ringY += (mouseY - ringY) * 0.15;
      ring.style.left = ringX + 'px';
      ring.style.top = ringY + 'px';
      requestAnimationFrame(animRing);
    }
    animRing();

    // Hover states
    const hoverEls = 'a, button, .gtab, .cta-btn, .skill-card, .g-item, .social-item, .album-nav-btn, .bd-btn, .nav-link, .music-widget';
    document.querySelectorAll(hoverEls).forEach(el => {
      el.addEventListener('mouseenter', () => { dot.classList.add('hovered'); ring.classList.add('hovered'); });
      el.addEventListener('mouseleave', () => { dot.classList.remove('hovered'); ring.classList.remove('hovered'); });
    });

    // Hide cursor when off screen
    document.addEventListener('mouseleave', () => { dot.style.opacity = '0'; ring.style.opacity = '0'; });
    document.addEventListener('mouseenter', () => { dot.style.opacity = '1'; ring.style.opacity = '1'; });
  }

  // ══════════════════
  // HERO CANVAS — Minimal Floating Particles
  // ══════════════════
  function initHeroCanvas() {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize, { passive: true });

    const particles = [];
    const count = 60;
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.5 + 0.3,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        alpha: Math.random() * 0.4 + 0.05
      });
    }

    const mouse = { x: -999, y: -999 };
    window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw connections (from referensi particle constellation)
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 100) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(255,255,255,${(1 - d / 100) * 0.05})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
        // Mouse connect
        const dx = particles[i].x - mouse.x;
        const dy = particles[i].y - mouse.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 120) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = `rgba(255,255,255,${(1 - d / 120) * 0.12})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }

      // Draw particles
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${p.alpha})`;
        ctx.fill();

        // Mouse repulsion
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 80) {
          p.vx += (dx / d) * 0.15;
          p.vy += (dy / d) * 0.15;
        }

        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (speed > 1.5) { p.vx = (p.vx / speed) * 1.5; p.vy = (p.vy / speed) * 1.5; }
        p.vx *= 0.995; p.vy *= 0.995;
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
      });

      requestAnimationFrame(draw);
    }
    draw();
  }

  // ══════════════════
  // SKILL BARS
  // ══════════════════
  function initSkillBars() {
    const bars = document.querySelectorAll('.skill-fill[data-pct]');
    if (!bars.length) return;
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const pct = e.target.dataset.pct;
          e.target.style.width = pct + '%';
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.3 });
    bars.forEach(b => obs.observe(b));
  }

  // ══════════════════
  // TILT EFFECT on cards (from referensi TechCard.jsx)
  // ══════════════════
  function initTiltCards() {
    document.querySelectorAll('.skill-card, .ff-card, .bd-wish-card, .bd-tl-card').forEach(card => {
      card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width - 0.5) * 14;
        const y = ((e.clientY - rect.top) / rect.height - 0.5) * -14;
        card.style.transform = `perspective(700px) rotateX(${y}deg) rotateY(${x}deg) translateY(-4px)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

  // ══════════════════
  // CARD GLOW FOLLOW (from referensi .card::before style)
  // ══════════════════
  function initCardGlow() {
    document.querySelectorAll('.card').forEach(card => {
      card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--mx', x + 'px');
        card.style.setProperty('--my', y + 'px');
      });
    });
  }

  // ══════════════════
  // MUSIC PLAYER
  // ══════════════════
  function initMusic() {
    const toggle = document.getElementById('music-toggle');
    const music = document.getElementById('bg-music');
    const widget = document.getElementById('music-widget');
    const iconPlay = document.getElementById('icon-play');
    const iconPause = document.getElementById('icon-pause');
    if (!toggle || !music) return;

    let playing = !music.paused;
    window.mainMusicLocked = false;

    function updateUI() {
      if (playing) {
        iconPlay.style.display = 'none'; iconPause.style.display = '';
        widget.classList.remove('paused');
      } else {
        iconPlay.style.display = ''; iconPause.style.display = 'none';
        widget.classList.add('paused');
      }
    }
    updateUI();

    const playMusic = async () => {
      if (window.mainMusicLocked) return false;
      try {
        await music.play();
        playing = true;
        updateUI();
        return true;
      } catch (e) {
        console.warn('Autoplay blocked:', e.message);
        return false;
      }
    };

    // Try autoplay immediately
    playMusic();

    // Fallback: play on first user interaction if browser blocked it
    const firstInteraction = async (e) => {
      if (window.mainMusicLocked) return;
      if (e && e.target && (e.target.closest('#btn-cinematic') || e.target.closest('.cinematic-overlay') || e.target.closest('#cinematic-overlay'))) {
        return;
      }
      if (!playing) {
        const success = await playMusic();
        if (success) {
          ['click', 'pointerdown', 'keydown'].forEach(evt => {
            document.removeEventListener(evt, firstInteraction);
          });
        }
      }
    };

    ['click', 'pointerdown', 'keydown'].forEach(evt => {
      document.addEventListener(evt, firstInteraction, { passive: true });
    });

    widget.addEventListener('click', async (e) => {
      e.stopPropagation(); // prevent firstInteraction overlap
      if (window.mainMusicLocked) return;
      if (playing) {
        music.pause();
        playing = false;
        updateUI();
      } else {
        playMusic();
      }
    });

    // Auto-collapse the music widget after 4 seconds
    setTimeout(() => {
      if (widget) widget.classList.add('collapsed');
    }, 4000);

    // Expose for other functions (e.g. Cinematic Recap)
    window.mainMusicControl = {
      pause: () => {
        window.mainMusicLocked = true;
        const was = playing;
        if (music) {
          music.pause();
        }
        playing = false;
        updateUI();
        return was;
      },
      unlock: () => {
        window.mainMusicLocked = false;
      },
      play: () => {
        window.mainMusicLocked = false;
        if (!playing) {
          playMusic();
        }
      },
      isPlaying: () => playing
    };
  }

  // ══════════════════
  // DYNAMIC GALLERY + LIGHTBOX
  // ══════════════════
  function initGallery() {
    const grid = document.getElementById('dynamic-gallery-grid');
    if (!grid || typeof GALLERY_DATA === 'undefined') return;

    // Build items
    grid.innerHTML = '';
    GALLERY_DATA.forEach((data, index) => {
      const gItem = document.createElement('div');

      let sizeClass = '';
      if (index % 7 === 0) sizeClass = 'tall';
      else if (index % 5 === 0) sizeClass = 'wide';

      gItem.className = `g-item ${sizeClass}`;
      gItem.dataset.cat = data.category_id;
      if (data.video_src) gItem.dataset.videoSrc = data.video_src;
      gItem.dataset.title = data.title || data.category_label;
      gItem.dataset.gsap = 'fade-up';
      gItem.style.setProperty('--di', index % 10);

      gItem.innerHTML = `
        <div class="g-placeholder" style="position:relative; width:100%; height:100%;">
          <img src="${data.src}" alt="${data.title || data.category_label}" style="width:100%; height:100%; object-fit:cover; border-radius:inherit; filter:grayscale(100%); transition:filter 0.4s ease;" loading="lazy" onmouseover="this.style.filter='grayscale(0%)'" onmouseout="this.style.filter='grayscale(100%)'" />
          ${data.video_src ? `<div style="position:absolute; inset:0; display:flex; align-items:center; justify-content:center; pointer-events:none;"><span style="background:rgba(0,0,0,0.65); backdrop-filter:blur(4px); border:1px solid rgba(255,255,255,0.3); border-radius:50%; width:46px; height:46px; display:flex; align-items:center; justify-content:center; color:#fff; font-size:1.1rem; padding-left:3px; box-shadow:0 6px 20px rgba(0,0,0,0.5);">▶</span></div>` : ''}
        </div>
        <div class="g-hover"><span>${data.title || data.category_label}</span></div>
      `;
      grid.appendChild(gItem);
    });

    // Generate tabs dynamically based on unique categories
    const tabsContainer = document.getElementById('dynamic-gallery-tabs');
    const uniqueCats = [...new Set(GALLERY_DATA.map(d => d.category_id))];
    
    if (tabsContainer) {
      tabsContainer.innerHTML = '';
      
      const allBtn = document.createElement('button');
      allBtn.className = 'gtab active';
      allBtn.dataset.f = 'all';
      allBtn.textContent = 'All';
      tabsContainer.appendChild(allBtn);

      uniqueCats.forEach((cat) => {
        const btn = document.createElement('button');
        btn.className = 'gtab';
        btn.dataset.f = cat;
        // Format label from category_label of first matching item
        const firstMatch = GALLERY_DATA.find(d => d.category_id === cat);
        const label = firstMatch ? firstMatch.category_label : cat.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        btn.textContent = label;
        tabsContainer.appendChild(btn);
      });
    }

    const tabs = document.querySelectorAll('.gtab');
    const items = document.querySelectorAll('.g-item');
    const loadMoreBtn = document.getElementById('btn-load-more');
    const loadMoreContainer = document.getElementById('gallery-load-more');
    let displayLimit = 20;

    function applyFilter(filter) {
      let count = 0;
      items.forEach(item => {
        let cat = item.dataset.cat || '';
        const isMatch = filter === 'all' || cat === filter;
        
        item.style.transition = 'opacity 0.3s, transform 0.3s';
        if (isMatch) {
          if (count < displayLimit) {
            item.style.display = '';
            requestAnimationFrame(() => { item.style.opacity = '1'; item.style.transform = ''; });
          } else {
            item.style.display = 'none';
            item.style.opacity = '0';
          }
          count++;
        } else {
          item.style.opacity = '0';
          item.style.transform = 'scale(0.9)';
          setTimeout(() => { item.style.display = 'none'; }, 300);
        }
      });

      if (count > displayLimit) {
        if (loadMoreContainer) loadMoreContainer.style.display = 'block';
      } else {
        if (loadMoreContainer) loadMoreContainer.style.display = 'none';
      }
    }

    if (loadMoreBtn) {
      loadMoreBtn.addEventListener('click', () => {
        displayLimit += 20;
        const activeTab = document.querySelector('.gtab.active');
        const currentFilter = activeTab ? activeTab.dataset.f : 'all';
        applyFilter(currentFilter);
      });
    }

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        displayLimit = 20; // reset limit on tab change
        applyFilter(tab.dataset.f);
      });
    });

    // initial apply
    applyFilter('all');

    // Lightbox
    const lb = document.getElementById('lightbox');
    const lbContent = document.getElementById('lb-content');
    const lbClose = document.getElementById('lb-close');
    const lbPrev = document.getElementById('lb-prev');
    const lbNext = document.getElementById('lb-next');
    const lbCounter = document.getElementById('lb-counter');
    let currentIdx = 0;

    function visibleItems() { return Array.from(items).filter(i => i.style.display !== 'none'); }

    function openLb(idx) {
      const vis = visibleItems();
      if (!vis[idx]) return;
      currentIdx = idx;
      const item = vis[idx];

      const oldVid = lbContent.querySelector('video');
      if (oldVid) oldVid.pause();

      lbContent.innerHTML = '';

      if (item.dataset.videoSrc) {
        const vidWrapper = document.createElement('div');
        vidWrapper.style.cssText = 'display:flex; flex-direction:column; align-items:center; max-width:90vw;';
        
        const video = document.createElement('video');
        video.src = item.dataset.videoSrc;
        video.controls = true;
        video.autoplay = true;
        video.playsInline = true;
        video.style.cssText = 'max-width:85vw; max-height:70vh; border-radius:12px; box-shadow:0 10px 40px rgba(0,0,0,0.8); background:#000; outline:none;';
        vidWrapper.appendChild(video);

        if (item.dataset.title) {
          const cap = document.createElement('p');
          cap.style.cssText = 'color:#eee; font-family:"Space Grotesk",sans-serif; font-size:1rem; margin-top:1rem; text-align:center; max-width:600px;';
          cap.textContent = item.dataset.title;
          vidWrapper.appendChild(cap);
        }
        lbContent.appendChild(vidWrapper);
      } else {
        const clone = item.querySelector('.g-placeholder').cloneNode(true);
        if (clone) {
          clone.style.cssText = `width:70vw;max-width:560px;height:60vh;border-radius:12px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1rem;background:inherit;overflow:hidden;`;

          const img = clone.querySelector('img');
          if (img) img.style.objectFit = 'contain';

          lbContent.appendChild(clone);
        }

        if (item.dataset.title) {
          const cap = document.createElement('p');
          cap.style.cssText = 'color:#eee; font-family:"Space Grotesk",sans-serif; font-size:0.95rem; margin-top:0.75rem; text-align:center;';
          cap.textContent = item.dataset.title;
          lbContent.appendChild(cap);
        }
      }

      if (lbCounter) lbCounter.textContent = `${idx + 1} / ${vis.length}`;
      lb.classList.add('open');
      document.body.style.overflow = 'hidden';
    }

    function closeLb() {
      const activeVid = lbContent.querySelector('video');
      if (activeVid) activeVid.pause();
      lb.classList.remove('open');
      document.body.style.overflow = '';
    }

    items.forEach((item) => {
      item.addEventListener('click', () => {
        const vis = visibleItems();
        const idx = vis.indexOf(item);
        if (idx !== -1) openLb(idx);
      });
    });

    if (lbClose) lbClose.addEventListener('click', closeLb);
    if (lbPrev) lbPrev.addEventListener('click', e => { e.stopPropagation(); const vis = visibleItems(); openLb((currentIdx - 1 + vis.length) % vis.length); });
    if (lbNext) lbNext.addEventListener('click', e => { e.stopPropagation(); const vis = visibleItems(); openLb((currentIdx + 1) % vis.length); });
    if (lb) lb.querySelector('.lb-backdrop').addEventListener('click', closeLb);

    document.addEventListener('keydown', e => {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'Escape') closeLb();
      if (e.key === 'ArrowLeft') lbPrev?.click();
      if (e.key === 'ArrowRight') lbNext?.click();
    });
  }

  // ══════════════════
  // ALBUM (Birthday)
  // ══════════════════
  function initAlbum() {
    const slides = document.querySelectorAll('.album-slide');
    const dots = document.querySelectorAll('.album-nav-dot');
    const prev = document.getElementById('al-prev');
    const next = document.getElementById('al-next');
    let cur = 0;

    function show(idx) {
      slides.forEach((s, i) => { s.classList.toggle('active', i === idx); });
      dots.forEach((d, i) => { d.classList.toggle('active', i === idx); });
      cur = idx;
    }

    prev && prev.addEventListener('click', () => show((cur - 1 + slides.length) % slides.length));
    next && next.addEventListener('click', () => show((cur + 1) % slides.length));
    dots.forEach((d, i) => d.addEventListener('click', () => show(i)));

    // Auto-advance
    let autoId;
    const bdSection = document.getElementById('birthday');
    if (bdSection) {
      const obs = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting) {
          autoId = setInterval(() => show((cur + 1) % slides.length), 4500);
        } else {
          clearInterval(autoId);
        }
      }, { threshold: 0.3 });
      obs.observe(bdSection);
    }

    show(0);
  }

  // ══════════════════
  // CONTACT FORM
  // ══════════════════
  window.handleForm = function (e) {
    e.preventDefault();
    const form = document.getElementById('contact-form');
    const success = document.getElementById('form-success');
    const btn = form.querySelector('.form-submit');

    btn.disabled = true;
    btn.querySelector('span').textContent = 'Sending...';

    setTimeout(() => {
      form.style.display = 'none';
      if (success) success.style.display = 'flex';
      form.style.flexDirection = 'column';
      setTimeout(() => {
        form.style.display = '';
        if (success) success.style.display = 'none';
        form.reset();
        btn.disabled = false;
        btn.querySelector('span').textContent = 'Send Message';
      }, 5000);
    }, 1200);
  };

  // ══════════════════
  // EASTER EGG — Konami Code
  // ══════════════════
  function initKonami() {
    const code = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    let i = 0;
    document.addEventListener('keydown', e => {
      if (e.key === code[i]) { i++; } else { i = 0; }
      if (i === code.length) {
        if (typeof window.launchFireworks === 'function') window.launchFireworks();
        if (typeof window.rainConfetti === 'function') setTimeout(window.rainConfetti, 400);
        showToast('🎮 Konami Code! Easter Egg unlocked! ✦');
        i = 0;
      }
    });
  }

  // ══════════════════
  // TOAST
  // ══════════════════
  window.showToast = function (msg, duration = 3500) {
    const old = document.querySelector('.toast-lux');
    if (old) old.remove();
    const t = document.createElement('div');
    t.className = 'toast-lux';
    t.textContent = msg;
    t.style.cssText = `
      position:fixed; bottom:90px; left:50%;
      transform:translateX(-50%) translateY(16px);
      background:rgba(10,10,10,0.96);
      backdrop-filter:blur(24px);
      border:1px solid rgba(255,255,255,0.1);
      color:rgba(255,255,255,0.9);
      padding:12px 24px;
      border-radius:6px;
      font-size:0.8rem;
      font-weight:600;
      letter-spacing:0.5px;
      z-index:90000;
      box-shadow:0 8px 32px rgba(0,0,0,0.4);
      opacity:0;
      transition:all 0.4s cubic-bezier(0.4,0,0.2,1);
      pointer-events:none;
    `;
    document.body.appendChild(t);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      t.style.opacity = '1'; t.style.transform = 'translateX(-50%) translateY(0)';
    }));
    setTimeout(() => {
      t.style.opacity = '0'; t.style.transform = 'translateX(-50%) translateY(16px)';
      setTimeout(() => t.remove(), 400);
    }, duration);
  };

  // ══════════════════
  // IN-VIEW SLIDESHOW (Hero, About, & Journey Cards)
  // ══════════════════
  function initImageSlideshow() {
    function fadeImage(imgEl, newSrc) {
      if (!imgEl) return;
      if (typeof gsap !== 'undefined') {
        gsap.to(imgEl, {
          opacity: 0.1, duration: 0.4, onComplete: () => {
            imgEl.src = newSrc;
            gsap.to(imgEl, { opacity: 1, duration: 0.4 });
          }
        });
      } else {
        imgEl.style.transition = 'opacity 0.4s ease';
        imgEl.style.opacity = 0;
        setTimeout(() => {
          imgEl.src = newSrc;
          imgEl.style.opacity = 1;
        }, 400);
      }
    }

    function createInViewSlideshow(imgEl, imagesArray, interval = 4500, startOffset = 0) {
      if (!imgEl || !imagesArray || imagesArray.length <= 1) return;
      let currentIndex = startOffset % imagesArray.length;
      if (startOffset > 0) imgEl.src = imagesArray[currentIndex];

      let timer = null;

      const obs = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            if (!timer) {
              timer = setInterval(() => {
                currentIndex = (currentIndex + 1) % imagesArray.length;
                fadeImage(imgEl, imagesArray[currentIndex]);
              }, interval);
            }
          } else {
            if (timer) {
              clearInterval(timer);
              timer = null;
            }
          }
        });
      }, { threshold: 0.1 });

      obs.observe(imgEl);
    }

    // Hero & About
    if (typeof SITE_DATA !== 'undefined' && SITE_DATA.soloImages && SITE_DATA.soloImages.length > 1) {
      const heroImg = document.querySelector('#hero-photo img');
      const aboutImg = document.querySelector('#about-photo img');
      createInViewSlideshow(heroImg, SITE_DATA.soloImages, 4500, 0);
      createInViewSlideshow(aboutImg, SITE_DATA.soloImages, 4500, 1);
    }

    // Journey Cards
    const journeyCards = document.querySelectorAll('.journey-card');
    journeyCards.forEach(card => {
      const imgRaw = card.dataset.images;
      if (!imgRaw) return;
      try {
        const imgs = JSON.parse(imgRaw);
        if (imgs.length > 1) {
          const imgEl = card.querySelector('.journey-card-img img');
          createInViewSlideshow(imgEl, imgs, 4000, 0);
        }
      } catch (e) { }
    });
  }

  // ══════════════════
  // SINGLE IMAGE LIGHTBOX (Hero & About)
  // ══════════════════
  function initSingleLightbox() {
    const heroImg = document.querySelector('#hero-photo img');
    const aboutImg = document.querySelector('#about-photo img');

    function openImage(src) {
      const overlay = document.createElement('div');
      overlay.style.cssText = 'position:fixed; inset:0; background:rgba(0,0,0,0.9); z-index:100000; display:flex; align-items:center; justify-content:center; opacity:0; transition:opacity 0.4s ease; cursor:zoom-out;';

      const img = document.createElement('img');
      img.src = src;
      img.style.cssText = 'max-width:90%; max-height:90%; border-radius:12px; transform:scale(0.9); transition:transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); box-shadow:0 10px 40px rgba(0,0,0,0.5); object-fit:contain;';

      overlay.appendChild(img);
      document.body.appendChild(overlay);

      requestAnimationFrame(() => {
        overlay.style.opacity = '1';
        img.style.transform = 'scale(1)';
      });

      overlay.addEventListener('click', () => {
        overlay.style.opacity = '0';
        img.style.transform = 'scale(0.9)';
        setTimeout(() => overlay.remove(), 400);
      });
    }

    if (heroImg) {
      heroImg.parentElement.style.cursor = 'zoom-in';
      heroImg.parentElement.addEventListener('click', () => openImage(heroImg.src));
    }
    if (aboutImg) {
      aboutImg.parentElement.style.cursor = 'zoom-in';
      aboutImg.parentElement.addEventListener('click', () => openImage(aboutImg.src));
    }
  }

  // ══════════════════
  // JOURNEY LIGHTBOX
  // ══════════════════
  function initJourneyLightbox() {
    const cards = document.querySelectorAll('.journey-card');

    cards.forEach(card => {
      const imgContainer = card.querySelector('.journey-card-img');
      const imagesRaw = card.dataset.images;
      if (!imgContainer || !imagesRaw) return;

      let images = [];
      try { images = JSON.parse(imagesRaw); } catch (e) { return; }
      if (images.length === 0) return;

      const textContent = card.querySelector('.journey-text-content');

      imgContainer.addEventListener('click', () => {
        const currentSrc = imgContainer.querySelector('img').src;
        let currentIdx = images.findIndex(s => currentSrc.includes(s.split('/').pop()));
        if (currentIdx === -1) currentIdx = 0;

        const overlay = document.createElement('div');
        overlay.style.cssText = 'position:fixed; inset:0; background:rgba(5,5,5,0.95); z-index:100000; display:flex; align-items:center; justify-content:center; opacity:0; transition:opacity 0.4s ease; backdrop-filter: blur(10px); padding: 2rem;';

        const modal = document.createElement('div');
        modal.style.cssText = 'display:flex; flex-direction:row; max-width:1000px; width:100%; max-height:80vh; background:#111; border-radius:16px; border:1px solid rgba(255,255,255,0.1); overflow:hidden; transform:scale(0.95); transition:transform 0.4s var(--ease-spring); box-shadow: 0 20px 60px rgba(0,0,0,0.6); position: relative;';

        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '✕';
        closeBtn.style.cssText = 'position:absolute; top:16px; right:16px; background:rgba(255,255,255,0.1); border:none; color:#fff; width:36px; height:36px; border-radius:50%; font-size:1rem; cursor:pointer; z-index:10; display:flex; align-items:center; justify-content:center;';
        closeBtn.onclick = closeLightbox;

        const imgCol = document.createElement('div');
        imgCol.style.cssText = 'flex:1; background:#000; position:relative; display:flex; align-items:center; justify-content:center; overflow:hidden;';

        const imgEl = document.createElement('img');
        imgEl.src = images[currentIdx];
        imgEl.style.cssText = 'width:100%; height:100%; object-fit:contain;';
        imgCol.appendChild(imgEl);

        if (images.length > 1) {
          const prevBtn = document.createElement('button');
          prevBtn.innerHTML = '‹';
          prevBtn.style.cssText = 'position:absolute; left:10px; top:50%; transform:translateY(-50%); background:rgba(255,255,255,0.1); border:none; color:#fff; width:40px; height:40px; border-radius:50%; font-size:1.5rem; cursor:pointer;';

          const nextBtn = document.createElement('button');
          nextBtn.innerHTML = '›';
          nextBtn.style.cssText = 'position:absolute; right:10px; top:50%; transform:translateY(-50%); background:rgba(255,255,255,0.1); border:none; color:#fff; width:40px; height:40px; border-radius:50%; font-size:1.5rem; cursor:pointer;';

          const counter = document.createElement('div');
          counter.style.cssText = 'position:absolute; bottom:10px; left:50%; transform:translateX(-50%); background:rgba(0,0,0,0.6); color:#fff; padding:4px 12px; border-radius:20px; font-size:0.8rem;';
          counter.innerText = `1 / ${images.length}`;

          const updateImg = () => {
            imgEl.style.opacity = 0;
            setTimeout(() => {
              imgEl.src = images[currentIdx];
              counter.innerText = `${currentIdx + 1} / ${images.length}`;
              imgEl.style.opacity = 1;
            }, 200);
          };
          imgEl.style.transition = 'opacity 0.2s ease';

          prevBtn.onclick = (e) => { e.stopPropagation(); currentIdx = (currentIdx - 1 + images.length) % images.length; updateImg(); };
          nextBtn.onclick = (e) => { e.stopPropagation(); currentIdx = (currentIdx + 1) % images.length; updateImg(); };

          imgCol.appendChild(prevBtn);
          imgCol.appendChild(nextBtn);
          imgCol.appendChild(counter);
        }

        const textCol = document.createElement('div');
        textCol.style.cssText = 'flex:1; padding:3rem; display:flex; flex-direction:column; justify-content:center; max-width: 450px;';
        if (textContent) textCol.innerHTML = textContent.innerHTML;

        modal.appendChild(imgCol);
        modal.appendChild(textCol);
        modal.appendChild(closeBtn);
        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        if (window.innerWidth < 768) {
          modal.style.flexDirection = 'column';
          modal.style.overflowY = 'auto';
          imgCol.style.height = '300px';
          imgCol.style.flex = 'none';
          textCol.style.padding = '2rem';
          textCol.style.maxWidth = '100%';
        }

        requestAnimationFrame(() => {
          overlay.style.opacity = '1';
          modal.style.transform = 'scale(1)';
        });

        function closeLightbox() {
          overlay.style.opacity = '0';
          modal.style.transform = 'scale(0.95)';
          setTimeout(() => overlay.remove(), 400);
        }

        overlay.addEventListener('click', (e) => { if (e.target === overlay) closeLightbox(); });
      });
    });
  }

  // ══════════════════
  // CINEMATIC RECAP
  // ══════════════════
  function initCinematicRecap() {
    const btn = document.getElementById('btn-cinematic');
    if (!btn || typeof GALLERY_DATA === 'undefined') return;

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();

      // 1. Pause and lock main index background music
      let wasPlaying = false;
      if (window.mainMusicControl) {
        wasPlaying = window.mainMusicControl.pause();
      }

      // 2. Filter available media items
      const items = GALLERY_DATA.filter(d => d.video_src || d.src);
      if (items.length === 0) {
        if (window.mainMusicControl) {
          window.mainMusicControl.unlock();
          if (wasPlaying) window.mainMusicControl.play();
        }
        return;
      }

      // 3. Play recap backsound: Christina Perri — A Thousand Years
      const recapAudio = new Audio('./assets/backsounds/a-thousand-years-by-christina-perri.opus');
      recapAudio.loop = true;
      recapAudio.volume = 0.55;
      recapAudio.play().catch(err => console.warn('Recap audio autoplay note:', err));

      // 4. Create Fullscreen Overlay
      const overlay = document.createElement('div');
      overlay.id = 'cinematic-overlay';
      overlay.className = 'cinematic-overlay';
      overlay.style.cssText = `
        position: fixed;
        inset: 0;
        background: radial-gradient(circle at center, #111111 0%, #000000 100%);
        z-index: 999999;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.45s cubic-bezier(0.16, 1, 0.3, 1);
        overflow: hidden;
        user-select: none;
        font-family: 'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
      `;

      // Top Progress Bar
      const progressContainer = document.createElement('div');
      progressContainer.style.cssText = 'position:absolute; top:0; left:0; width:100%; height:4px; background:rgba(255,255,255,0.12); z-index:30;';
      const progressBar = document.createElement('div');
      progressBar.style.cssText = 'height:100%; width:0%; background:linear-gradient(90deg, #c5a059, #f7d794, #ffffff); transition:width 0.1s linear;';
      progressContainer.appendChild(progressBar);
      overlay.appendChild(progressContainer);

      // Top Control Bar
      const topBar = document.createElement('div');
      topBar.style.cssText = 'position:absolute; top:20px; left:24px; right:24px; display:flex; justify-content:space-between; align-items:center; z-index:30; pointer-events:auto; transition:opacity 0.3s ease;';

      // Title & Badge Pill (Left)
      const titleBadge = document.createElement('div');
      titleBadge.style.cssText = 'background:rgba(20,20,20,0.85); backdrop-filter:blur(16px); border:1px solid rgba(255,255,255,0.18); color:#fff; padding:10px 22px; border-radius:30px; font-size:0.88rem; display:flex; align-items:center; gap:12px; box-shadow:0 10px 30px rgba(0,0,0,0.6); max-width:65vw; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;';

      // Right Action Buttons
      const rightBtns = document.createElement('div');
      rightBtns.style.cssText = 'display:flex; align-items:center; gap:12px;';

      const togglePauseBtn = document.createElement('button');
      togglePauseBtn.innerHTML = '⏸ Jeda';
      togglePauseBtn.style.cssText = 'background:rgba(255,255,255,0.12); backdrop-filter:blur(12px); border:1px solid rgba(255,255,255,0.22); color:#fff; padding:9px 20px; border-radius:30px; font-size:0.85rem; font-weight:600; cursor:pointer; font-family:inherit; transition:all 0.25s; display:flex; align-items:center; gap:6px;';
      togglePauseBtn.onmouseover = () => { togglePauseBtn.style.background = 'rgba(255,255,255,0.25)'; };
      togglePauseBtn.onmouseout = () => { togglePauseBtn.style.background = 'rgba(255,255,255,0.12)'; };

      const closeBtn = document.createElement('button');
      closeBtn.innerHTML = '✕ Tutup';
      closeBtn.style.cssText = 'background:rgba(255,255,255,0.12); backdrop-filter:blur(12px); border:1px solid rgba(255,255,255,0.22); color:#fff; padding:9px 22px; border-radius:30px; font-size:0.85rem; font-weight:600; cursor:pointer; font-family:inherit; transition:all 0.25s;';
      closeBtn.onmouseover = () => { closeBtn.style.background = 'rgba(239,68,68,0.85)'; closeBtn.style.borderColor = 'rgba(239,68,68,1)'; };
      closeBtn.onmouseout = () => { closeBtn.style.background = 'rgba(255,255,255,0.12)'; closeBtn.style.borderColor = 'rgba(255,255,255,0.22)'; };

      rightBtns.appendChild(togglePauseBtn);
      rightBtns.appendChild(closeBtn);
      topBar.appendChild(titleBadge);
      topBar.appendChild(rightBtns);
      overlay.appendChild(topBar);

      // Center Media Stage
      const stage = document.createElement('div');
      stage.style.cssText = 'position:relative; width:100%; height:calc(100vh - 140px); max-height:82vh; display:flex; align-items:center; justify-content:center; padding:10px 40px; box-sizing:border-box;';

      const img = document.createElement('img');
      img.style.cssText = 'max-width:100%; max-height:100%; object-fit:contain; border-radius:14px; box-shadow:0 25px 70px rgba(0,0,0,0.95); display:none; opacity:0; transition:opacity 0.4s ease, filter 0.4s ease; filter:grayscale(100%); cursor:pointer;';
      img.onmouseover = () => { img.style.filter = 'grayscale(0%)'; };
      img.onmouseout = () => { img.style.filter = 'grayscale(100%)'; };

      const video = document.createElement('video');
      video.playsInline = true;
      video.autoplay = true;
      video.controls = false;
      video.style.cssText = 'max-width:100%; max-height:100%; object-fit:contain; border-radius:14px; box-shadow:0 25px 70px rgba(0,0,0,0.95); display:none; opacity:0; transition:opacity 0.4s ease, filter 0.4s ease; filter:grayscale(100%); cursor:pointer; background:#000;';
      video.onmouseover = () => { video.style.filter = 'grayscale(0%)'; };
      video.onmouseout = () => { video.style.filter = 'grayscale(100%)'; };

      // Navigation Arrows (Prev / Next)
      const prevBtn = document.createElement('button');
      prevBtn.innerHTML = '&#8249;';
      prevBtn.title = 'Sebelumnya';
      prevBtn.style.cssText = 'position:absolute; left:20px; top:50%; transform:translateY(-50%); width:52px; height:52px; border-radius:50%; background:rgba(20,20,20,0.65); backdrop-filter:blur(10px); border:1px solid rgba(255,255,255,0.25); color:#fff; font-size:2.2rem; line-height:1; display:flex; align-items:center; justify-content:center; cursor:pointer; z-index:25; transition:all 0.25s; opacity:0.85; padding-bottom:4px;';
      prevBtn.onmouseover = () => { prevBtn.style.opacity = '1'; prevBtn.style.transform = 'translateY(-50%) scale(1.12)'; prevBtn.style.borderColor = '#c5a059'; };
      prevBtn.onmouseout = () => { prevBtn.style.opacity = '0.85'; prevBtn.style.transform = 'translateY(-50%) scale(1)'; prevBtn.style.borderColor = 'rgba(255,255,255,0.25)'; };

      const nextBtn = document.createElement('button');
      nextBtn.innerHTML = '&#8250;';
      nextBtn.title = 'Selanjutnya';
      nextBtn.style.cssText = 'position:absolute; right:20px; top:50%; transform:translateY(-50%); width:52px; height:52px; border-radius:50%; background:rgba(20,20,20,0.65); backdrop-filter:blur(10px); border:1px solid rgba(255,255,255,0.25); color:#fff; font-size:2.2rem; line-height:1; display:flex; align-items:center; justify-content:center; cursor:pointer; z-index:25; transition:all 0.25s; opacity:0.85; padding-bottom:4px;';
      nextBtn.onmouseover = () => { nextBtn.style.opacity = '1'; nextBtn.style.transform = 'translateY(-50%) scale(1.12)'; nextBtn.style.borderColor = '#c5a059'; };
      nextBtn.onmouseout = () => { nextBtn.style.opacity = '0.85'; nextBtn.style.transform = 'translateY(-50%) scale(1)'; nextBtn.style.borderColor = 'rgba(255,255,255,0.25)'; };

      stage.appendChild(img);
      stage.appendChild(video);
      stage.appendChild(prevBtn);
      stage.appendChild(nextBtn);
      overlay.appendChild(stage);

      // Bottom Bar (Now Playing + Media Status)
      const bottomBar = document.createElement('div');
      bottomBar.style.cssText = 'position:absolute; bottom:20px; left:24px; right:24px; display:flex; justify-content:space-between; align-items:center; z-index:30; pointer-events:auto; transition:opacity 0.3s ease; flex-wrap:wrap; gap:12px;';

      const mediaTypeBadge = document.createElement('div');
      mediaTypeBadge.style.cssText = 'background:rgba(20,20,20,0.85); backdrop-filter:blur(16px); border:1px solid rgba(255,255,255,0.18); color:#c5a059; padding:9px 20px; border-radius:30px; font-size:0.82rem; font-weight:600; display:flex; align-items:center; gap:8px; box-shadow:0 8px 24px rgba(0,0,0,0.5);';

      const musicWidget = document.createElement('div');
      musicWidget.style.cssText = 'background:rgba(20,20,20,0.85); backdrop-filter:blur(16px); border:1px solid rgba(255,255,255,0.18); color:#fff; padding:9px 20px; border-radius:30px; font-size:0.82rem; display:flex; align-items:center; gap:10px; box-shadow:0 8px 24px rgba(0,0,0,0.5);';
      musicWidget.innerHTML = `
        <div class="music-bars" style="display:flex; align-items:flex-end; gap:3px; height:14px;">
          <span style="display:block; width:3px; height:6px; background:#c5a059; border-radius:2px; animation:mbar 1.2s ease-in-out infinite;"></span>
          <span style="display:block; width:3px; height:14px; background:#c5a059; border-radius:2px; animation:mbar 1.2s ease-in-out infinite; animation-delay:0.2s;"></span>
          <span style="display:block; width:3px; height:10px; background:#c5a059; border-radius:2px; animation:mbar 1.2s ease-in-out infinite; animation-delay:0.4s;"></span>
          <span style="display:block; width:3px; height:14px; background:#c5a059; border-radius:2px; animation:mbar 1.2s ease-in-out infinite; animation-delay:0.1s;"></span>
        </div>
        <span style="letter-spacing:0.5px;">Christina Perri — A Thousand Years</span>
      `;

      bottomBar.appendChild(mediaTypeBadge);
      bottomBar.appendChild(musicWidget);
      overlay.appendChild(bottomBar);

      document.body.appendChild(overlay);
      requestAnimationFrame(() => { overlay.style.opacity = '1'; });

      // Playback State
      let currentSlideIdx = 0;
      let isPaused = false;
      let animFrameId = null;
      let slideStartTime = 0;
      let slideDuration = 10000;
      let elapsedBeforePause = 0;

      function loadSlide(newIdx) {
        if (animFrameId) cancelAnimationFrame(animFrameId);
        currentSlideIdx = (newIdx + items.length) % items.length;
        elapsedBeforePause = 0;
        progressBar.style.width = '0%';

        const item = items[currentSlideIdx];

        // Title Badge
        const catText = item.category_label || 'Kenangan';
        const titleText = item.title || item.category_label || 'Momen Berharga';
        titleBadge.innerHTML = `
          <span style="color:#c5a059; font-weight:700; text-transform:uppercase; font-size:0.75rem; letter-spacing:1px;">${catText}</span>
          <span style="color:rgba(255,255,255,0.25);">|</span>
          <span style="color:#f0f0f0;">${titleText}</span>
          <span style="color:#888; font-size:0.8rem; margin-left:4px;">(${currentSlideIdx + 1}/${items.length})</span>
        `;

        if (item.video_src) {
          // VIDEO ITEM: Putar selama 10 detik, default hitam putih, kursor mendekat -> warna original
          slideDuration = 10000;
          mediaTypeBadge.innerHTML = `🎬 Video Edukasi & Sejarah • 10 Detik • Suara Jelas (45%)`;

          // Hide image
          img.style.display = 'none';
          img.style.opacity = '0';

          // Prepare & play video
          video.style.display = 'block';
          video.style.filter = 'grayscale(100%)'; // Hitam putih default
          video.src = item.video_src;
          video.volume = 0.45; // Suara dinaikkan agar terdengar jelas dan pas!
          video.currentTime = 0;

          const playPromise = video.play();
          if (playPromise !== undefined) {
            playPromise.then(() => {
              video.style.opacity = '1';
            }).catch(err => {
              console.warn('Video playback notice:', err);
              // Fallback if browser requires muted gesture
              video.muted = true;
              video.play().then(() => {
                video.muted = false;
                video.volume = 0.45;
                video.style.opacity = '1';
              }).catch(e => {
                video.style.opacity = '1';
              });
            });
          }

          // If video duration is shorter than 10s and ends naturally
          video.onended = () => {
            if (!isPaused) loadSlide(currentSlideIdx + 1);
          };
        } else {
          // PHOTO ITEM: Tampilkan selama 3.5 detik
          slideDuration = 3500;
          mediaTypeBadge.innerHTML = `📸 Galeri & Potret • 3.5 Detik`;

          // Clean and hide video
          video.onended = null;
          video.pause();
          video.src = '';
          video.style.display = 'none';
          video.style.opacity = '0';

          // Show image
          img.style.display = 'block';
          img.src = item.src;
          requestAnimationFrame(() => {
            img.style.opacity = '1';
          });
        }

        slideStartTime = performance.now();
        if (!isPaused) {
          stepAnimation(slideStartTime);
        }
      }

      function stepAnimation(now) {
        if (isPaused) return;
        const currentElapsed = elapsedBeforePause + (now - slideStartTime);
        const pct = Math.min(100, (currentElapsed / slideDuration) * 100);
        progressBar.style.width = pct + '%';

        if (currentElapsed >= slideDuration) {
          loadSlide(currentSlideIdx + 1);
        } else {
          animFrameId = requestAnimationFrame(stepAnimation);
        }
      }

      function togglePause() {
        if (isPaused) {
          // Resume
          isPaused = false;
          togglePauseBtn.innerHTML = '⏸ Jeda';
          slideStartTime = performance.now();
          if (items[currentSlideIdx].video_src && video.paused) {
            video.play().catch(e => e);
          }
          animFrameId = requestAnimationFrame(stepAnimation);
        } else {
          // Pause
          isPaused = true;
          togglePauseBtn.innerHTML = '▶ Lanjut';
          elapsedBeforePause += (performance.now() - slideStartTime);
          if (animFrameId) cancelAnimationFrame(animFrameId);
          if (items[currentSlideIdx].video_src && !video.paused) {
            video.pause();
          }
        }
      }

      function closeCinematic() {
        if (animFrameId) cancelAnimationFrame(animFrameId);
        document.removeEventListener('keydown', onKeyDown);

        video.onended = null;
        video.pause();
        video.src = '';

        recapAudio.pause();
        recapAudio.src = '';

        overlay.style.opacity = '0';
        setTimeout(() => {
          overlay.remove();
          // Unlock and resume main index background music if it was playing
          if (window.mainMusicControl) {
            window.mainMusicControl.unlock();
            if (wasPlaying) {
              window.mainMusicControl.play();
            }
          }
        }, 450);
      }

      // Event listeners for controls
      togglePauseBtn.onclick = (ev) => { ev.stopPropagation(); togglePause(); };
      closeBtn.onclick = (ev) => { ev.stopPropagation(); closeCinematic(); };
      prevBtn.onclick = (ev) => { ev.stopPropagation(); loadSlide(currentSlideIdx - 1); };
      nextBtn.onclick = (ev) => { ev.stopPropagation(); loadSlide(currentSlideIdx + 1); };

      // Keyboard controls
      const onKeyDown = (ev) => {
        if (ev.key === 'Escape') {
          closeCinematic();
        } else if (ev.key === 'ArrowRight') {
          loadSlide(currentSlideIdx + 1);
        } else if (ev.key === 'ArrowLeft') {
          loadSlide(currentSlideIdx - 1);
        } else if (ev.key === ' ') {
          ev.preventDefault();
          togglePause();
        }
      };
      document.addEventListener('keydown', onKeyDown);

      // Auto-hide controls after inactivity
      let mouseTimer = null;
      const faders = [topBar, bottomBar, prevBtn, nextBtn];
      function showControls() {
        faders.forEach(el => { el.style.opacity = '1'; el.style.pointerEvents = 'auto'; });
        overlay.style.cursor = 'default';
        clearTimeout(mouseTimer);
        mouseTimer = setTimeout(() => {
          if (!isPaused) {
            faders.forEach(el => { el.style.opacity = '0'; el.style.pointerEvents = 'none'; });
            overlay.style.cursor = 'none';
          }
        }, 2500);
      }
      overlay.addEventListener('mousemove', showControls);
      showControls();

      // Start first slide!
      loadSlide(0);
    });
  }

  // ══════════════════
  // INIT ALL
  // ══════════════════
  window.addEventListener('DOMContentLoaded', () => {
    initLoader();
    initCursor();
    initHeroCanvas();
    initNav();
    initMusic();
    initSkillBars();
    initImageSlideshow();
    initSingleLightbox();
    initJourneyLightbox();
    initCinematicRecap();
    initTiltCards();
    initCardGlow();
    initGallery();
    initAlbum();
    initKonami();

    // Welcome toast after load
    setTimeout(() => showToast('✦ Welcome to my universe — scroll to explore'), 3500);
  });

})();
