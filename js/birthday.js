// =============================================
// BIRTHDAY FEATURES:
// - Countdown Timer
// - Typewriter Messages
// - Fireworks
// - Confetti
// - Photo Album
// =============================================

(function() {
  'use strict';

  // ===== CONFIG — EDIT THESE =====
  // Set the birthday month (1-12) and day
  const BIRTHDAY_MONTH = 3; // March
  const BIRTHDAY_DAY = 3;   // 3rd

  // Birthday messages (will typewrite one by one)
  const BIRTHDAY_MESSAGES = [
    "Selamat hari ulang tahun, Nabila Stevani Alviny Gultom! 🌟",
    "Semoga harimu dipenuhi kebahagiaan, tawa, dan berkat yang melimpah! 💖",
    "Teruslah bersinar sebagai pencerita sejarah nusantara yang inspiratif! ✨",
    "Sukses selalu untuk studimu di Politeknik Pariwisata Medan! 🏨",
    "Kiranya Tuhan senantiasa memberkati setiap langkah dan impianmu! 🌸",
    "You deserve all the joy, cake, love, and wonderful stories in the world! 🎂"
  ];

  // ===== BACKGROUND SLIDESHOW & COLLAGE =====
  function initCinemaRecap() {
    const cinemaImg = document.getElementById('cinema-recap-img');
    const cinemaVideo = document.getElementById('cinema-recap-video');
    const cinemaControls = document.getElementById('cinema-controls');
    const playPauseBtn = document.getElementById('cinema-play-pause');
    const fsBtn = document.getElementById('cinema-fullscreen');
    const prevBtn = document.getElementById('cinema-prev');
    const nextBtn = document.getElementById('cinema-next');
    const progressBar = document.getElementById('cinema-progress-bar');
    const titleBadge = document.getElementById('cinema-title-badge');
    const statusBadge = document.getElementById('cinema-status-badge');
    const cinemaBox = document.getElementById('cinema-recap-box');
    
    if ((!cinemaImg && !cinemaVideo) || typeof GALLERY_DATA === 'undefined') return;
    
    const items = GALLERY_DATA.filter(d => d.video_src || d.src);
    if (items.length === 0) return;
    
    let idx = 0;
    let timer = null;
    let animFrameId = null;
    let slideStartTime = 0;
    let slideDuration = 10000;
    let elapsedBeforePause = 0;
    let isPlaying = true; // Status kontrol tombol Play/Pause dari user
    let isSectionInView = false; // Status apakah section cinema sedang terlihat di layar (scrolled into view)
    let cinemaAudio = null;

    function getCinemaAudio() {
      if (!cinemaAudio) {
        cinemaAudio = new Audio('./assets/backsounds/hometown-glory-adele.opus');
        cinemaAudio.loop = true;
        cinemaAudio.volume = 0.55; // Backsound volume
        cinemaAudio.currentTime = 80; // Start at chorus 1:20
      }
      return cinemaAudio;
    }

    function showItem(index) {
      if (animFrameId) cancelAnimationFrame(animFrameId);
      clearTimeout(timer);
      idx = (index + items.length) % items.length;
      elapsedBeforePause = 0;
      if (progressBar) progressBar.style.width = '0%';

      const item = items[idx];

      // Update badges
      if (titleBadge) {
        const cat = item.category_label || 'Kenangan';
        const tit = item.title || item.category_label || 'Momen Berharga';
        titleBadge.innerHTML = `<span style="color:#d4af37; font-weight:700;">${cat}</span> <span style="opacity:0.35;">|</span> ${tit} <span style="opacity:0.6; font-size:0.8rem;">(${idx + 1}/${items.length})</span>`;
      }

      if (item.video_src && cinemaVideo) {
        // VIDEO ITEM: Putar 10 detik, hitam putih default, kursor mendekat -> warna original, suara 40%
        slideDuration = 10000; // 10 Detik
        if (statusBadge) {
          statusBadge.innerHTML = '🎬 Video • 10 Detik • Suara Jelas (40%)';
        }

        if (cinemaImg) {
          cinemaImg.style.opacity = '0';
          setTimeout(() => { cinemaImg.style.display = 'none'; }, 250);
        }

        cinemaVideo.style.display = 'block';
        cinemaVideo.style.filter = 'grayscale(100%)';
        cinemaVideo.onmouseover = () => { cinemaVideo.style.filter = 'grayscale(0%)'; };
        cinemaVideo.onmouseout = () => { cinemaVideo.style.filter = 'grayscale(100%)'; };
        cinemaVideo.src = item.video_src;
        cinemaVideo.muted = false; // ADA SUARA
        cinemaVideo.volume = 0.40; // 40% volume: jelas terdengar dan tetap selaras dengan backsound
        cinemaVideo.currentTime = 0;

        // HANYA putar jika isPlaying DAN sedang discroll/dilihat di layar!
        if (isPlaying && isSectionInView) {
          const p = cinemaVideo.play();
          if (p !== undefined) {
            p.then(() => {
              cinemaVideo.style.opacity = '1';
            }).catch(err => {
              console.warn('Cinema video playback note:', err);
              // Fallback jika browser mensyaratkan gesture audio
              cinemaVideo.muted = true;
              cinemaVideo.play().then(() => {
                cinemaVideo.muted = false;
                cinemaVideo.volume = 0.40;
                cinemaVideo.style.opacity = '1';
              }).catch(e => { cinemaVideo.style.opacity = '1'; });
            });
          }
        } else {
          cinemaVideo.pause();
          cinemaVideo.style.opacity = '1';
        }

        // Jika video durasinya berakhir sebelum 10s
        cinemaVideo.onended = () => {
          if (isPlaying && isSectionInView) showItem(idx + 1);
        };
      } else if (cinemaImg) {
        // PHOTO ITEM: Tampilkan 3.5 detik
        slideDuration = 3500;
        if (statusBadge) {
          statusBadge.innerHTML = '📸 Foto Galeri • 3.5 Detik';
        }

        if (cinemaVideo) {
          cinemaVideo.onended = null;
          cinemaVideo.pause();
          cinemaVideo.style.opacity = '0';
          setTimeout(() => { cinemaVideo.style.display = 'none'; cinemaVideo.src = ''; }, 250);
        }

        cinemaImg.style.display = 'block';
        cinemaImg.src = item.src;
        requestAnimationFrame(() => { cinemaImg.style.opacity = '1'; });
      }

      slideStartTime = performance.now();
      // Progress bar dan pergantian hanya jalan jika isPlaying DAN sedang terlihat di layar
      if (isPlaying && isSectionInView) {
        stepProgress(slideStartTime);
      }
    }

    function stepProgress(now) {
      if (!isPlaying || !isSectionInView) return;
      const currentElapsed = elapsedBeforePause + (now - slideStartTime);
      const pct = Math.min(100, (currentElapsed / slideDuration) * 100);
      if (progressBar) progressBar.style.width = pct + '%';

      if (currentElapsed >= slideDuration) {
        // 10 detik untuk video (atau 3.5s untuk foto) selesai -> lanjut ke item berikutnya!
        showItem(idx + 1);
      } else {
        animFrameId = requestAnimationFrame(stepProgress);
      }
    }

    function start() {
      isPlaying = true;
      if (playPauseBtn) playPauseBtn.innerHTML = '⏸ Pause';
      if (isSectionInView) {
        if (window.bdayAudio && !window.bdayAudio.paused) {
          window.bdayAudio.pause();
          window.bdayAudioPausedByCinema = true;
        }
        const audio = getCinemaAudio();
        if (audio && audio.paused) audio.play().catch(e=>e);
        const curItem = items[idx];
        if (curItem && curItem.video_src && cinemaVideo && cinemaVideo.paused) {
          cinemaVideo.play().catch(e=>e);
        }
        slideStartTime = performance.now();
        animFrameId = requestAnimationFrame(stepProgress);
      }
    }

    function stop() {
      isPlaying = false;
      if (animFrameId) cancelAnimationFrame(animFrameId);
      elapsedBeforePause += (performance.now() - slideStartTime);
      if (playPauseBtn) playPauseBtn.innerHTML = '▶ Play';
      if (cinemaAudio && !cinemaAudio.paused) cinemaAudio.pause();
      if (cinemaVideo && !cinemaVideo.paused) cinemaVideo.pause();
      if (window.bdayAudioPausedByCinema && window.bdayAudio) {
        window.bdayAudio.play().catch(e=>e);
        window.bdayAudioPausedByCinema = false;
      }
    }

    // Prev / Next button listeners
    if (prevBtn) {
      prevBtn.onclick = (e) => {
        e.stopPropagation();
        showItem(idx - 1);
      };
    }
    if (nextBtn) {
      nextBtn.onclick = (e) => {
        e.stopPropagation();
        showItem(idx + 1);
      };
    }

    // Play/Pause button
    if (playPauseBtn) {
      playPauseBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        getCinemaAudio();
        if (isPlaying) stop();
        else start();
      });
    }

    if (fsBtn && cinemaBox) {
      fsBtn.addEventListener('click', () => {
        if (!document.fullscreenElement) {
          if (cinemaBox.requestFullscreen) cinemaBox.requestFullscreen();
          else if (cinemaBox.webkitRequestFullscreen) cinemaBox.webkitRequestFullscreen();
          fsBtn.innerHTML = '✖ Exit';
        } else {
          if (document.exitFullscreen) document.exitFullscreen();
          else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
          fsBtn.innerHTML = '⛶ Fullscreen';
        }
      });
      document.addEventListener('fullscreenchange', () => {
        if (!document.fullscreenElement && fsBtn) fsBtn.innerHTML = '⛶ Fullscreen';
      });
    }

    // Auto Play/Pause logic strictly based on scrolling
    const cinemaSection = document.querySelector('.cinema-section');
    if (cinemaSection) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.2) {
            // Masuk section cinema: pause lagu bday utama, putar lagu & video cinema recap
            isSectionInView = true;
            if (window.bdayAudio && !window.bdayAudio.paused) {
               window.bdayAudio.pause();
               window.bdayAudioPausedByCinema = true;
            }
            if (isPlaying) {
              const audio = getCinemaAudio();
              if (audio && audio.paused) audio.play().catch(e=>e);
              const curItem = items[idx];
              if (curItem && curItem.video_src && cinemaVideo && cinemaVideo.paused) {
                cinemaVideo.muted = false;
                cinemaVideo.volume = 0.40;
                cinemaVideo.play().catch(e=>e);
              }
              slideStartTime = performance.now();
              if (animFrameId) cancelAnimationFrame(animFrameId);
              animFrameId = requestAnimationFrame(stepProgress);
            }
          } else {
            // Keluar section cinema (scroll kebawah atau keatas): pause cinema recap segera, resume lagu bday utama
            isSectionInView = false;
            if (animFrameId) cancelAnimationFrame(animFrameId);
            elapsedBeforePause += (performance.now() - slideStartTime);
            if (cinemaAudio && !cinemaAudio.paused) cinemaAudio.pause();
            if (cinemaVideo && !cinemaVideo.paused) cinemaVideo.pause();
            if (window.bdayAudioPausedByCinema && window.bdayAudio) {
               window.bdayAudio.play().catch(e => {
                 if (e.name !== 'AbortError') console.warn('Bday audio resume notice:', e);
               });
               window.bdayAudioPausedByCinema = false;
            }
          }
        });
      }, { threshold: [0, 0.2] });
      observer.observe(cinemaSection);
    }

    // Siapkan item pertama (tidak akan autoplay bersuara sebelum section terlihat di layar)
    showItem(0);
  }

  function initBdaySlideshow() {
    const bgImg = document.getElementById('bday-bg-img');
    const contentBox = document.querySelector('.bd-content');
    if (typeof GALLERY_DATA === 'undefined') return;

    // Separate clean photos for hero background ambient texture
    const photoOnlyItems = GALLERY_DATA.filter(d => !d.video_src && d.src);
    const allItems = GALLERY_DATA.filter(d => d.video_src || d.src);
    if (allItems.length < 5) return;

    // Ambient Background Slideshow (using only clean high-res photos)
    if (bgImg && photoOnlyItems.length > 0) {
      setInterval(() => {
        bgImg.style.opacity = '0';
        setTimeout(() => {
          bgImg.src = photoOnlyItems[Math.floor(Math.random() * photoOnlyItems.length)].src;
          bgImg.style.opacity = '0.35';
        }, 400);
      }, 4000);
    }

    // Dynamic Floating Collage (Cards scattered on Left and Right)
    if (contentBox) {
      // 6 Positions scattered on Left & Right framing the central birthday title
      const positions = [
        { left: '-20%', top: '0%', rot: -12, w: 220, mHide: true, startIdx: 0 },
        { left: '-25%', top: '35%', rot: -5, w: 250, mHide: false, startIdx: 13 },
        { left: '-10%', top: '70%', rot: 8, w: 200, mHide: true, startIdx: 2 },
        { right: '-20%', top: '5%', rot: 15, w: 220, mHide: true, startIdx: 15 },
        { right: '-25%', top: '40%', rot: -8, w: 260, mHide: false, startIdx: 1 },
        { right: '-10%', top: '75%', rot: 6, w: 210, mHide: true, startIdx: 18 }
      ];

      const currentShowing = new Array(positions.length).fill(null);
      const cardControllers = [];

      positions.forEach((pos, cardIndex) => {
        const card = document.createElement('div');
        card.className = pos.mHide ? 'bday-float-card m-hide' : 'bday-float-card';
        card.style.position = 'absolute';
        if (pos.left) card.style.left = pos.left;
        if (pos.right) card.style.right = pos.right;
        card.style.top = pos.top;
        card.style.width = pos.w + 'px';
        card.style.height = (pos.w * 1.3) + 'px';
        card.style.border = '8px solid #fff';
        card.style.borderRadius = '8px';
        card.style.boxShadow = '0 20px 45px rgba(0,0,0,0.65)';
        card.style.transform = `rotate(${pos.rot}deg)`;
        card.style.overflow = 'hidden';
        card.style.zIndex = '-1';
        card.style.background = '#0d0d0d';

        // Image element
        const img = document.createElement('img');
        img.style.cssText = 'position:absolute; inset:0; width:100%; height:100%; object-fit:cover; display:none; opacity:0; transition:opacity 0.6s ease;';

        // Video element (NO FREEZE, MUTED, AUTOPLAY, LOOP)
        const video = document.createElement('video');
        video.muted = true; // "tapi gada suara"
        video.volume = 0;
        video.playsInline = true;
        video.autoplay = true;
        video.loop = true;
        video.controls = false;
        video.style.cssText = 'position:absolute; inset:0; width:100%; height:100%; object-fit:cover; display:none; opacity:0; transition:opacity 0.6s ease; background:#000;';

        card.appendChild(img);
        card.appendChild(video);
        contentBox.appendChild(card);

        let switchTimer = null;
        let activeItem = null;

        function pickNextItem(current) {
          const candidates = allItems.filter(item => {
            if (current && item === current) return false;
            return !currentShowing.includes(item);
          });
          if (candidates.length > 0) {
            return candidates[Math.floor(Math.random() * candidates.length)];
          }
          const fallback = allItems.filter(item => item !== current);
          return fallback[Math.floor(Math.random() * fallback.length)] || allItems[0];
        }

        function displayItem(item) {
          activeItem = item;
          currentShowing[cardIndex] = item;
          clearTimeout(switchTimer);

          if (item.video_src) {
            // Video item: Berjalan tanpa freeze, tanpa suara (muted), berputar selama 10 detik!
            img.style.opacity = '0';
            setTimeout(() => { img.style.display = 'none'; }, 400);

            video.style.display = 'block';
            video.src = item.video_src;
            video.muted = true; // Selalu muted sesuai permintaan user
            video.currentTime = 0;

            const p = video.play();
            if (p !== undefined) {
              p.then(() => {
                video.style.opacity = '1';
              }).catch(err => {
                console.warn('Floating card video notice:', err);
                video.style.opacity = '1';
              });
            }

            // Putar selama 10 detik!
            switchTimer = setTimeout(() => {
              fadeOutAndSwitch();
            }, 10000);
          } else {
            // Photo item: Tampilkan selama ~4.5 detik
            video.pause();
            video.style.opacity = '0';
            setTimeout(() => {
              video.style.display = 'none';
              video.src = '';
            }, 400);

            img.style.display = 'block';
            img.src = item.src;
            requestAnimationFrame(() => {
              img.style.opacity = '1';
            });

            // Ganti foto setelah ~4.5 detik (staggered sedikit agar dinamis)
            const photoDuration = 4200 + Math.random() * 800;
            switchTimer = setTimeout(() => {
              fadeOutAndSwitch();
            }, photoDuration);
          }
        }

        function fadeOutAndSwitch() {
          if (activeItem && activeItem.video_src) {
            video.style.opacity = '0';
          } else {
            img.style.opacity = '0';
          }

          setTimeout(() => {
            const next = pickNextItem(activeItem);
            displayItem(next);
          }, 600);
        }

        function ensurePlay() {
          if (activeItem && activeItem.video_src && video.paused) {
            video.play().catch(e => e);
          }
        }

        cardControllers.push({ ensurePlay });

        // Staggered initial appearance
        const startItem = allItems[pos.startIdx % allItems.length];
        setTimeout(() => {
          displayItem(startItem);
        }, cardIndex * 200);
      });

      // Expose globally to be triggered upon Unlock button click
      window.playBdayCardVideos = () => {
        cardControllers.forEach(ctrl => ctrl.ensurePlay());
      };

      // Jeda video floating card saat hero di-scroll keluar layar demi performa dan baterai hemat
      const heroSection = document.querySelector('.birthday-hero');
      if (heroSection) {
        const heroObserver = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            const vids = contentBox.querySelectorAll('video');
            if (entry.isIntersecting) {
              vids.forEach(v => {
                if (v.style.display !== 'none' && v.src && v.paused) v.play().catch(e => e);
              });
            } else {
              vids.forEach(v => {
                if (!v.paused) v.pause();
              });
            }
          });
        }, { threshold: 0.1 });
        heroObserver.observe(heroSection);
      }
    }
  }

  // ===== COUNTDOWN TIMER =====
  function initCountdown() {
    const cdContainer = document.getElementById('dynamic-countdown');
    if (!cdContainer) return;

    function update() {
      const now = new Date();
      let nextBday = new Date(now.getFullYear(), BIRTHDAY_MONTH - 1, BIRTHDAY_DAY);
      
      const isBirthday = (now.getMonth() + 1 === BIRTHDAY_MONTH && now.getDate() === BIRTHDAY_DAY);

      if (isBirthday) {
        const nowBanner = document.getElementById('birthday-now-banner');
        const topbar = document.getElementById('birthday-topbar');
        if (nowBanner) nowBanner.style.display = 'block';
        if (topbar) topbar.style.display = 'none';
        
        // Fire confetti!
        if (window.confetti && !window.confettiFired) {
          window.confettiFired = true;
          const duration = 3000;
          const end = Date.now() + duration;
          (function frame() {
            confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#d4af37', '#fff', '#8b5cf6'] });
            confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#d4af37', '#fff', '#8b5cf6'] });
            if (Date.now() < end) requestAnimationFrame(frame);
          }());
        }
        return;
      }

      if (now > nextBday) {
        nextBday = new Date(now.getFullYear() + 1, BIRTHDAY_MONTH - 1, BIRTHDAY_DAY);
      }

      const diff = nextBday - now;
      const totalDays = Math.floor(diff / (1000 * 60 * 60 * 24));
      
      const months = Math.floor(totalDays / 30);
      const days = totalDays % 30;
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);

      let units = [];
      if (months > 0) units.push({l: 'Months', v: months});
      units.push({l: 'Days', v: days});
      units.push({l: 'Hours', v: hours});
      units.push({l: 'Mins', v: mins});
      units.push({l: 'Secs', v: secs});

      cdContainer.innerHTML = units.map(u => `
        <div class="bd-cd-item" style="text-align: center;">
          <span style="display:block; font-size: 2.5rem; font-family: 'Playfair Display'; font-weight: 700;">${String(u.v).padStart(2, '0')}</span>
          <span style="font-size:0.75rem; color:#888; text-transform:uppercase; letter-spacing:1px;">${u.l}</span>
        </div>
      `).join('');
    }

    update();
    setInterval(update, 1000);
  }

  // ===== BIRTHDAY TYPEWRITER =====
  function initBdayTypewriter() {
    const el = document.getElementById('bday-typewriter');
    if (!el) return;

    let msgIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    function type() {
      const current = BIRTHDAY_MESSAGES[msgIndex];
      if (isDeleting) {
        el.textContent = current.substring(0, charIndex - 1);
        charIndex--;
      } else {
        el.textContent = current.substring(0, charIndex + 1);
        charIndex++;
      }

      let delay = isDeleting ? 30 : 60;

      if (!isDeleting && charIndex === current.length) {
        delay = 3500;
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        msgIndex = (msgIndex + 1) % BIRTHDAY_MESSAGES.length;
        delay = 500;
      }

      setTimeout(type, delay);
    }
    setTimeout(type, 1000);
  }

  // ===== FIREWORKS =====
  window.launchFireworks = function() {
    const container = document.getElementById('fireworks-container');
    if (!container) return;

    const COLORS = ['#FF6B9D','#FFD93D','#FF6B6B','#A855F7','#3B82F6','#10B981','#FF8E53','#ffffff'];

    function createBurst(x, y) {
      const particleCount = 40;
      for (let i = 0; i < particleCount; i++) {
        const el = document.createElement('div');
        el.className = 'firework-particle';
        const size = Math.random() * 8 + 4;
        const color = COLORS[Math.floor(Math.random() * COLORS.length)];
        const angle = (i / particleCount) * Math.PI * 2;
        const speed = Math.random() * 150 + 80;
        const dx = Math.cos(angle) * speed;
        const dy = Math.sin(angle) * speed;
        const duration = Math.random() * 600 + 800;

        el.style.cssText = `
          width: ${size}px;
          height: ${size}px;
          background: ${color};
          box-shadow: 0 0 ${size * 2}px ${color};
          left: ${x}px;
          top: ${y}px;
          transform: translate(-50%, -50%);
          position: absolute;
          border-radius: 50%;
          animation: burst ${duration}ms cubic-bezier(0,0,0.2,1) forwards;
        `;

        // Dynamic keyframes
        const keyId = 'kf_' + Math.random().toString(36).substr(2);
        const styleEl = document.createElement('style');
        styleEl.textContent = `
          @keyframes ${keyId} {
            0% { transform: translate(-50%,-50%) scale(1); opacity: 1; }
            100% { transform: translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(0); opacity: 0; }
          }
        `;
        document.head.appendChild(styleEl);
        el.style.animation = `${keyId} ${duration}ms cubic-bezier(0,0,0.2,1) forwards`;

        container.appendChild(el);
        setTimeout(() => { el.remove(); styleEl.remove(); }, duration + 100);
      }
    }

    // Launch multiple bursts
    const positions = [
      { x: window.innerWidth * 0.3, y: window.innerHeight * 0.35 },
      { x: window.innerWidth * 0.7, y: window.innerHeight * 0.25 },
      { x: window.innerWidth * 0.5, y: window.innerHeight * 0.5 },
      { x: window.innerWidth * 0.2, y: window.innerHeight * 0.6 },
      { x: window.innerWidth * 0.8, y: window.innerHeight * 0.55 },
    ];

    positions.forEach((pos, i) => {
      setTimeout(() => createBurst(pos.x, pos.y), i * 250);
    });

    // Extra random bursts
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        createBurst(
          Math.random() * window.innerWidth,
          Math.random() * window.innerHeight * 0.7
        );
      }, 1200 + i * 300);
    }
  };

  // ===== CONFETTI =====
  window.rainConfetti = function() {
    const container = document.getElementById('confetti-container');
    if (!container) return;

    const COLORS = ['#FF6B9D','#FFD93D','#FF6B6B','#A855F7','#3B82F6','#10B981','#FF8E53','#FBC2EB','#84FAB0'];
    const SHAPES = ['●', '■', '▲', '★', '♦', '♠'];
    let count = 0;
    const MAX = 200;

    const interval = setInterval(() => {
      if (count >= MAX) { clearInterval(interval); return; }
      count += 3;

      for (let i = 0; i < 3; i++) {
        const el = document.createElement('div');
        el.className = 'confetti-piece';
        const color = COLORS[Math.floor(Math.random() * COLORS.length)];
        const shape = Math.random() > 0.5 ? 'border-radius: 0' : 'border-radius: 50%';
        const size = Math.random() * 10 + 6;
        const duration = Math.random() * 2000 + 2000;
        const delay = Math.random() * 500;
        const left = Math.random() * 100;
        const rotation = Math.random() * 720 - 360;
        const swayAmount = Math.random() * 100 - 50;

        el.style.cssText = `
          position: fixed;
          width: ${size}px;
          height: ${size}px;
          background: ${color};
          left: ${left}vw;
          top: -20px;
          ${shape};
          box-shadow: 0 0 ${size}px ${color}88;
          animation-duration: ${duration}ms;
          animation-delay: ${delay}ms;
          animation-fill-mode: forwards;
        `;

        const kfId = 'cf_' + Math.random().toString(36).substr(2);
        const styleEl = document.createElement('style');
        styleEl.textContent = `
          @keyframes ${kfId} {
            0% { transform: translateY(0) rotate(0deg) translateX(0); opacity: 1; }
            25% { transform: translateY(25vh) rotate(${rotation * 0.25}deg) translateX(${swayAmount * 0.5}px); opacity: 1; }
            50% { transform: translateY(50vh) rotate(${rotation * 0.5}deg) translateX(${swayAmount}px); opacity: 0.8; }
            75% { transform: translateY(75vh) rotate(${rotation * 0.75}deg) translateX(${swayAmount * 0.3}px); opacity: 0.5; }
            100% { transform: translateY(110vh) rotate(${rotation}deg) translateX(0); opacity: 0; }
          }
        `;
        document.head.appendChild(styleEl);
        el.style.animation = `${kfId} ${duration}ms ease-in ${delay}ms forwards`;

        container.appendChild(el);
        setTimeout(() => { el.remove(); styleEl.remove(); }, duration + delay + 100);
      }
    }, 50);
  };



  // ===== HEART TRAIL ON CLICK =====
  function initHeartTrail() {
    document.body.addEventListener('click', function(e) {
      // Avoid firing on links and buttons
      if (e.target.closest('a') || e.target.closest('button')) return;
      createHeart(e.clientX, e.clientY);
    });

    function createHeart(x, y) {
      const hearts = ['❤️','💖','💝','💕','💗','💓','🌸','✨'];
      const count = Math.floor(Math.random() * 5) + 3;

      for (let i = 0; i < count; i++) {
        const el = document.createElement('div');
        el.style.cssText = `
          position: fixed;
          left: ${x}px;
          top: ${y}px;
          font-size: ${Math.random() * 20 + 16}px;
          pointer-events: none;
          z-index: 60000;
          transform: translate(-50%, -50%);
          animation: heartRise ${Math.random() * 1000 + 1500}ms ease forwards;
          animation-delay: ${i * 80}ms;
        `;
        el.textContent = hearts[Math.floor(Math.random() * hearts.length)];

        if (!document.getElementById('heart-rise-css')) {
          const s = document.createElement('style');
          s.id = 'heart-rise-css';
          s.textContent = `
            @keyframes heartRise {
              0% { transform: translate(-50%, -50%) scale(0) rotate(0deg); opacity: 1; }
              50% { opacity: 1; transform: translate(calc(-50% + ${(Math.random() - 0.5) * 60}px), calc(-50% - 80px)) scale(1) rotate(${Math.random() * 30 - 15}deg); }
              100% { transform: translate(calc(-50% + ${(Math.random() - 0.5) * 100}px), calc(-50% - 200px)) scale(0.5) rotate(${Math.random() * 60 - 30}deg); opacity: 0; }
            }
          `;
          document.head.appendChild(s);
        }

        document.body.appendChild(el);
        const dur = (Math.random() * 1000 + 1500) + i * 80 + 100;
        setTimeout(() => el.remove(), dur);
      }
    }
  }

  // ===== CUSTOM CURSOR =====
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
      dot.style.top  = mouseY + 'px';
    });

    function animRing() {
      ringX += (mouseX - ringX) * 0.15;
      ringY += (mouseY - ringY) * 0.15;
      ring.style.left = ringX + 'px';
      ring.style.top  = ringY + 'px';
      requestAnimationFrame(animRing);
    }
    animRing();

    // Hover states
    const hoverEls = 'a, button, .gtab, .cta-btn, .skill-card, .g-item, .social-item, .album-nav-btn, .bd-btn, .nav-link, .music-widget, .envelope-wrapper';
    document.querySelectorAll(hoverEls).forEach(el => {
      el.addEventListener('mouseenter', () => { dot.classList.add('hovered'); ring.classList.add('hovered'); });
      el.addEventListener('mouseleave', () => { dot.classList.remove('hovered'); ring.classList.remove('hovered'); });
    });
  }

  // ===== TIMELINE LIGHTBOX =====
  window.openBdayLightbox = function(item, albumTitle) {
    if (!item) return;

    let overlay = document.getElementById('bday-lightbox-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'bday-lightbox-overlay';
      overlay.style.cssText = 'position:fixed; inset:0; background:rgba(0,0,0,0.92); z-index:9999999; display:flex; flex-direction:column; align-items:center; justify-content:center; opacity:0; transition:opacity 0.35s ease; backdrop-filter:blur(10px); padding:20px; box-sizing:border-box;';

      const container = document.createElement('div');
      container.id = 'bday-lb-container';
      container.style.cssText = 'position:relative; max-width:92vw; max-height:82vh; display:flex; flex-direction:column; align-items:center; justify-content:center;';

      const img = document.createElement('img');
      img.id = 'bday-lightbox-img';
      img.style.cssText = 'max-width:100%; max-height:75vh; object-fit:contain; border-radius:12px; box-shadow:0 15px 50px rgba(0,0,0,0.8); display:none;';

      const video = document.createElement('video');
      video.id = 'bday-lightbox-video';
      video.playsInline = true;
      video.controls = true;
      video.style.cssText = 'max-width:100%; max-height:75vh; object-fit:contain; border-radius:12px; box-shadow:0 15px 50px rgba(0,0,0,0.8); display:none; background:#000;';

      const titleBadge = document.createElement('div');
      titleBadge.id = 'bday-lightbox-title';
      titleBadge.style.cssText = 'color:#fff; font-family:"Space Grotesk",sans-serif; margin-top:16px; font-size:1.05rem; text-align:center; max-width:700px; display:flex; flex-direction:column; align-items:center; gap:6px;';

      const closeBtn = document.createElement('button');
      closeBtn.innerHTML = '✕ Tutup';
      closeBtn.style.cssText = 'position:absolute; top:-45px; right:0; background:rgba(255,255,255,0.15); border:1px solid rgba(255,255,255,0.3); color:#fff; padding:6px 16px; border-radius:20px; font-size:0.85rem; font-weight:600; cursor:pointer; font-family:inherit; transition:all 0.25s;';
      closeBtn.onmouseover = () => { closeBtn.style.background = 'rgba(239,68,68,0.8)'; };
      closeBtn.onmouseout = () => { closeBtn.style.background = 'rgba(255,255,255,0.15)'; };

      container.appendChild(closeBtn);
      container.appendChild(img);
      container.appendChild(video);
      container.appendChild(titleBadge);
      overlay.appendChild(container);
      document.body.appendChild(overlay);

      function closeLb() {
        const vid = document.getElementById('bday-lightbox-video');
        if (vid) { vid.pause(); vid.src = ''; }
        overlay.style.opacity = '0';
        setTimeout(() => { overlay.style.display = 'none'; }, 350);
        if (window.bdayAudioPausedByLightbox && window.bdayAudio) {
          window.bdayAudio.play().catch(e => {
            if (e.name !== 'AbortError') console.warn('Bday audio resume notice:', e);
          });
          window.bdayAudioPausedByLightbox = false;
        }
      }

      closeBtn.onclick = (e) => { e.stopPropagation(); closeLb(); };
      overlay.onclick = (e) => { if (e.target === overlay) closeLb(); };
      window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && overlay.style.display !== 'none') closeLb();
      });
    }

    const imgEl = document.getElementById('bday-lightbox-img');
    const vidEl = document.getElementById('bday-lightbox-video');
    const titleEl = document.getElementById('bday-lightbox-title');

    if (item.video_src && vidEl) {
      // Jeda lagu latar belakang utama sementara saat menonton video di lightbox agar suara tidak tabrakan
      if (window.bdayAudio && !window.bdayAudio.paused) {
        window.bdayAudio.pause();
        window.bdayAudioPausedByLightbox = true;
      }

      // VIDEO ITEM: Putar dengan suara video jelas 40%
      if (imgEl) imgEl.style.display = 'none';
      vidEl.style.display = 'block';
      vidEl.src = item.video_src;
      vidEl.muted = false; // ADA SUARA KETIKA DI-TAP
      vidEl.volume = 0.40; // 40% volume jelas
      vidEl.currentTime = 0;
      vidEl.play().catch(e => {
        vidEl.muted = true;
        vidEl.play().then(() => { vidEl.muted = false; vidEl.volume = 0.40; }).catch(err => err);
      });

      titleEl.innerHTML = `
        <span style="color:#d4af37; font-weight:700; text-transform:uppercase; letter-spacing:1px; font-size:0.8rem;">${albumTitle || item.category_label || 'Kenangan'}</span>
        <span style="color:#f0f0f0; font-size:1.1rem; font-weight:500;">${item.title || item.category_label || ''}</span>
        <span style="color:#c5a059; font-size:0.8rem; background:rgba(212,175,55,0.15); border:1px solid rgba(212,175,55,0.3); padding:3px 12px; border-radius:12px; margin-top:4px;">
          🔊 Suara Video Jelas (40%) • Backsound Utama Dijeda Sementara
        </span>
      `;
    } else if (imgEl) {
      // PHOTO ITEM
      if (vidEl) { vidEl.pause(); vidEl.src = ''; vidEl.style.display = 'none'; }
      imgEl.style.display = 'block';
      imgEl.src = item.src;

      titleEl.innerHTML = `
        <span style="color:#d4af37; font-weight:700; text-transform:uppercase; letter-spacing:1px; font-size:0.8rem;">${albumTitle || item.category_label || 'Kenangan'}</span>
        <span style="color:#f0f0f0; font-size:1.1rem; font-weight:500;">${item.title || item.category_label || ''}</span>
      `;
    }

    overlay.style.display = 'flex';
    requestAnimationFrame(() => { overlay.style.opacity = '1'; });
  };

  function initTimeline() {
    const timelineContainer = document.getElementById('memory-timeline');
    if (!timelineContainer || typeof GALLERY_DATA === 'undefined') return;

    // Group items directly into an object map (no join/split to avoid comma issues)
    const categoryMap = {};
    GALLERY_DATA.forEach(item => {
      const cat = item.category_label || 'Kenangan';
      if (!categoryMap[cat]) categoryMap[cat] = [];
      categoryMap[cat].push(item);
    });

    const albumNames = Object.keys(categoryMap);
    timelineContainer.innerHTML = '';

    albumNames.forEach((album, i) => {
      const align = i % 2 === 0 ? 'left' : 'right';
      const items = categoryMap[album];
      if (!items || items.length === 0) return;

      const itemWrap = document.createElement('div');
      itemWrap.className = 'timeline-item';
      itemWrap.style.cssText = `display:flex; justify-content:${align === 'left' ? 'flex-start' : 'flex-end'}; margin-bottom: 3.5rem; width: 100%; padding: 0 20px; position:relative; box-sizing:border-box;`;

      itemWrap.innerHTML = `
        <div style="position:absolute; left:50%; transform:translateX(-50%); width:2px; height:100%; background:rgba(255,255,255,0.1); top:0; z-index:0;"></div>
        <div class="timeline-dot" style="position:absolute; left:50%; top:24px; transform:translate(-50%, -50%); width:15px; height:15px; background:#d4af37; border-radius:50%; z-index:2; box-shadow:0 0 12px #d4af37;"></div>
        <div class="timeline-content" data-gsap="fade-up" style="width: 46%; background:rgba(20,20,20,0.75); backdrop-filter:blur(14px); padding:1.2rem; border-radius:16px; border:1px solid rgba(255,255,255,0.12); position:relative; z-index:1; cursor:pointer; box-shadow:0 10px 30px rgba(0,0,0,0.55); transition:all 0.3s cubic-bezier(0.4, 0, 0.2, 1); box-sizing:border-box;">
          <div class="tl-media-wrap" style="position:relative; width:100%; height:210px; border-radius:10px; overflow:hidden; background:#000; margin-bottom:0.85rem;">
            <img class="tl-img" style="position:absolute; inset:0; width:100%; height:100%; object-fit:cover; display:none; opacity:0; transition:opacity 0.4s ease;" />
            <video class="tl-video" playsinline muted loop style="position:absolute; inset:0; width:100%; height:100%; object-fit:cover; display:none; opacity:0; transition:opacity 0.4s ease; background:#000;"></video>
            
            <div class="tl-badge" style="position:absolute; top:10px; left:10px; background:rgba(0,0,0,0.75); backdrop-filter:blur(6px); border:1px solid rgba(255,255,255,0.2); color:#d4af37; font-size:0.75rem; font-weight:600; padding:4px 10px; border-radius:20px; font-family:'Space Grotesk',sans-serif; pointer-events:none; z-index:3;"></div>
            
            <div class="tl-sound-hint" style="position:absolute; bottom:10px; right:10px; background:rgba(0,0,0,0.75); backdrop-filter:blur(6px); border:1px solid rgba(255,255,255,0.2); color:#fff; font-size:0.75rem; padding:4px 10px; border-radius:20px; font-family:'Space Grotesk',sans-serif; display:none; align-items:center; gap:5px; pointer-events:none; z-index:3;">
              <span>🔇</span> <span>Tap untuk suara</span>
            </div>
          </div>
          <div style="text-align:center;">
            <h4 style="font-family:'Space Grotesk',sans-serif; color:#d4af37; font-size:1.1rem; margin:0 0 4px 0; text-transform:capitalize; letter-spacing:0.5px;">${album}</h4>
            <p class="tl-caption" style="color:#aaa; font-size:0.85rem; margin:0; line-height:1.4; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;"></p>
          </div>
        </div>
      `;

      timelineContainer.appendChild(itemWrap);

      const contentCard = itemWrap.querySelector('.timeline-content');
      const imgEl = itemWrap.querySelector('.tl-img');
      const videoEl = itemWrap.querySelector('.tl-video');
      const badgeEl = itemWrap.querySelector('.tl-badge');
      const soundHintEl = itemWrap.querySelector('.tl-sound-hint');
      const captionEl = itemWrap.querySelector('.tl-caption');

      contentCard.onmouseover = () => { contentCard.style.borderColor = 'rgba(212,175,55,0.5)'; contentCard.style.transform = 'translateY(-4px)'; };
      contentCard.onmouseout = () => { contentCard.style.borderColor = 'rgba(255,255,255,0.12)'; contentCard.style.transform = 'translateY(0)'; };

      let currentIdx = 0;
      let cardTimer = null;
      let activeItem = null;

      function renderItem(idx) {
        currentIdx = (idx + items.length) % items.length;
        activeItem = items[currentIdx];
        clearTimeout(cardTimer);

        captionEl.textContent = activeItem.title || activeItem.category_label || album;

        if (activeItem.video_src) {
          // VIDEO ITEM: Berjalan 10 detik, awalnya muted ("jangan da suara dulu")!
          badgeEl.innerHTML = '🎬 Video (10s)';
          soundHintEl.style.display = 'flex';

          imgEl.style.opacity = '0';
          setTimeout(() => { imgEl.style.display = 'none'; }, 250);

          videoEl.style.display = 'block';
          videoEl.src = activeItem.video_src;
          videoEl.muted = true; // Muted di timeline card
          videoEl.volume = 0;
          videoEl.currentTime = 0;

          const p = videoEl.play();
          if (p !== undefined) {
            p.then(() => {
              videoEl.style.opacity = '1';
            }).catch(e => {
              videoEl.style.opacity = '1';
            });
          }

          // Berjalan 10 detik sebelum berganti!
          cardTimer = setTimeout(() => {
            transitionNext();
          }, 10000); // 10 Detik
        } else {
          // PHOTO ITEM: Tampilkan 4.5 detik
          badgeEl.innerHTML = '📸 Foto';
          soundHintEl.style.display = 'none';

          videoEl.pause();
          videoEl.style.opacity = '0';
          setTimeout(() => { videoEl.style.display = 'none'; videoEl.src = ''; }, 250);

          imgEl.style.display = 'block';
          imgEl.src = activeItem.src;
          requestAnimationFrame(() => { imgEl.style.opacity = '1'; });

          cardTimer = setTimeout(() => {
            transitionNext();
          }, 4500);
        }
      }

      function transitionNext() {
        if (activeItem && activeItem.video_src) {
          videoEl.style.opacity = '0';
        } else {
          imgEl.style.opacity = '0';
        }
        setTimeout(() => {
          renderItem(currentIdx + 1);
        }, 400);
      }

      // Klik kartu -> Buka Lightbox dengan suara lembut (20%)!
      contentCard.onclick = () => {
        window.openBdayLightbox(activeItem, album);
      };

      // Observe kartu timeline untuk jeda video saat keluar layar
      const cardObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            if (activeItem && activeItem.video_src && videoEl.paused && videoEl.src) {
              videoEl.play().catch(e => e);
            }
          } else {
            if (!videoEl.paused) videoEl.pause();
          }
        });
      }, { threshold: 0.1 });
      cardObserver.observe(itemWrap);

      // Tampilkan item pertama (staggered sedikit antar album)
      setTimeout(() => {
        renderItem(0);
      }, i * 300);
    });
  }

  function initVisualizer() {
    const canvas = document.getElementById('audio-visualizer');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = 150;

    let bars = 50;
    
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const isPlaying = window.bdayAudio && !window.bdayAudio.paused;
      
      const barWidth = (canvas.width / bars) - 2;
      for(let i=0; i<bars; i++) {
        // Random height if playing, flat if paused
        const height = isPlaying ? Math.random() * 100 + 10 : 5;
        const x = i * (canvas.width / bars);
        const y = canvas.height - height;
        
        const gradient = ctx.createLinearGradient(0, canvas.height, 0, y);
        gradient.addColorStop(0, '#ff69b4');
        gradient.addColorStop(1, '#d4af37');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, barWidth, height);
      }
      setTimeout(() => requestAnimationFrame(draw), 100);
    }
    draw();

    window.addEventListener('resize', () => {
      canvas.width = window.innerWidth;
    });
  }

  function initMinigame() {
    const btn = document.getElementById('start-minigame-btn');
    const area = document.getElementById('minigame-area');
    if (!btn || !area) return;

    // Foto-foto Nabila dari assets yang dijadikan target tangkapan
    const nabilaPhotos = [
      './assets/images/random_me/profil.jpg',
      './assets/images/mirror_selfie/mirror selfie.webp',
      './assets/images/random_me/flower/weq3we.webp',
      './assets/images/random_me/flower/rgree.webp',
      './assets/images/random_me/Untitled.webp',
      './assets/images/at_museum_sumatra_utara/museum sumut.webp'
    ];

    let score = 0;
    let timeLeft = 30;
    let gameInterval = null;
    let spawnInterval = null;
    let isPlaying = false;
    let hasWon = false;

    // Inject floatScore keyframe style jika belum ada
    if (!document.getElementById('float-score-css')) {
      const styleEl = document.createElement('style');
      styleEl.id = 'float-score-css';
      styleEl.textContent = `
        @keyframes floatScoreAnim {
          0% { opacity: 1; transform: translate(-50%, -50%) scale(0.8); }
          50% { opacity: 1; transform: translate(-50%, -90%) scale(1.2); }
          100% { opacity: 0; transform: translate(-50%, -140%) scale(0.9); }
        }
        .nabila-bubble:hover {
          transform: scale(1.18) !important;
          box-shadow: 0 0 25px rgba(255, 105, 180, 0.8) !important;
          border-color: #ff69b4 !important;
        }
      `;
      document.head.appendChild(styleEl);
    }

    function startGame() {
      if (isPlaying) return;
      btn.style.display = 'none';
      area.style.display = 'block';
      area.innerHTML = `
        <div id="minigame-score" style="position:absolute; top:20px; left:24px; color:#d4af37; font-family:'Space Grotesk'; font-size:1.35rem; font-weight:700; z-index:10; background:rgba(20,20,20,0.85); backdrop-filter:blur(8px); padding:8px 20px; border-radius:30px; border:1px solid rgba(255,255,255,0.15); box-shadow:0 4px 15px rgba(0,0,0,0.5);">Score: 0 / 10</div>
        <div id="minigame-timer" style="position:absolute; top:20px; right:24px; color:#fff; font-family:'Space Grotesk'; font-size:1.35rem; font-weight:700; z-index:10; background:rgba(20,20,20,0.85); backdrop-filter:blur(8px); padding:8px 20px; border-radius:30px; border:1px solid rgba(255,255,255,0.15); box-shadow:0 4px 15px rgba(0,0,0,0.5);">30s</div>
      `;

      const curScoreEl = document.getElementById('minigame-score');
      const curTimerEl = document.getElementById('minigame-timer');

      score = 0;
      timeLeft = 30;
      isPlaying = true;
      hasWon = false;

      gameInterval = setInterval(() => {
        timeLeft--;
        if (curTimerEl) curTimerEl.innerText = `${timeLeft}s`;
        if (timeLeft <= 0) endGame();
      }, 1000);

      spawnInterval = setInterval(() => {
        if (!isPlaying) return;

        const bubble = document.createElement('div');
        bubble.className = 'nabila-bubble';
        
        const photoSrc = nabilaPhotos[Math.floor(Math.random() * nabilaPhotos.length)];
        const decorEmoji = ['💖', '✨', '👑', '🌸', '🎂'][Math.floor(Math.random() * 5)];
        const bubbleSize = Math.floor(Math.random() * 14) + 64; // 64px - 78px
        const fallSpeed = (Math.random() * 1.5 + 3.2).toFixed(1); // 3.2s - 4.7s

        bubble.style.cssText = `
          position: absolute;
          width: ${bubbleSize}px;
          height: ${bubbleSize}px;
          border-radius: 50%;
          border: 3px solid #d4af37;
          box-shadow: 0 8px 24px rgba(212,175,55,0.6);
          cursor: pointer;
          user-select: none;
          z-index: 5;
          transition: top ${fallSpeed}s linear, opacity 0.2s ease, transform 0.2s ease;
          background: #111;
          display: flex;
          align-items: center;
          justify-content: center;
          top: -90px;
        `;

        bubble.innerHTML = `
          <img src="${photoSrc}" alt="Nabila" style="width:100%; height:100%; border-radius:50%; object-fit:cover; pointer-events:none;" />
          <span style="position:absolute; bottom:-3px; right:-3px; font-size:1.25rem; filter:drop-shadow(0 2px 4px rgba(0,0,0,0.7)); pointer-events:none;">${decorEmoji}</span>
        `;

        const maxLeft = Math.max(10, area.offsetWidth - bubbleSize - 20);
        bubble.style.left = Math.floor(Math.random() * maxLeft + 10) + 'px';
        area.appendChild(bubble);

        // Trigger fall
        requestAnimationFrame(() => {
          setTimeout(() => {
            bubble.style.top = (area.offsetHeight + 100) + 'px';
          }, 30);
        });

        // Click / catch event
        bubble.addEventListener('click', (e) => {
          e.stopPropagation();
          if (!isPlaying) return;

          score++;
          if (curScoreEl) {
            curScoreEl.innerText = `Score: ${score} / 10`;
          }

          // Relative position for floating +1 text
          const rect = area.getBoundingClientRect();
          const bRect = bubble.getBoundingClientRect();
          const clickX = bRect.left - rect.left + bubbleSize / 2;
          const clickY = bRect.top - rect.top + bubbleSize / 2;

          const plusText = document.createElement('div');
          plusText.innerText = '+1 ✨';
          plusText.style.cssText = `
            position: absolute;
            left: ${clickX}px;
            top: ${clickY}px;
            transform: translate(-50%, -50%);
            color: #d4af37;
            font-family: 'Space Grotesk', sans-serif;
            font-size: 1.4rem;
            font-weight: 700;
            pointer-events: none;
            z-index: 10;
            animation: floatScoreAnim 0.75s ease-out forwards;
            text-shadow: 0 0 10px rgba(212,175,55,0.8);
          `;
          area.appendChild(plusText);
          setTimeout(() => plusText.remove(), 750);

          // Heart / sparkle burst
          createHeart(bRect.left + bubbleSize / 2, bRect.top + bubbleSize / 2);

          // Mini confetti burst on milestones
          if (typeof confetti === 'function' && score % 5 === 0) {
            confetti({
              particleCount: 35,
              spread: 60,
              origin: {
                x: (bRect.left + bubbleSize / 2) / window.innerWidth,
                y: (bRect.top + bubbleSize / 2) / window.innerHeight
              }
            });
          }

          // Pop & remove bubble
          bubble.style.transform = 'scale(1.35)';
          bubble.style.opacity = '0';
          bubble.style.pointerEvents = 'none';
          setTimeout(() => bubble.remove(), 200);

          // If reached 10 catches
          if (score >= 10 && !hasWon) {
            hasWon = true;
            if (curScoreEl) {
              curScoreEl.style.color = '#4ade80';
              curScoreEl.style.borderColor = 'rgba(74,222,128,0.5)';
              curScoreEl.innerText = `Score: ${score} / 10 🌟 TERBUKA!`;
            }
          }
        });

        // Cleanup if missed
        setTimeout(() => {
          if (bubble.parentNode) bubble.remove();
        }, parseFloat(fallSpeed) * 1000 + 200);
      }, 550);
    }

    btn.addEventListener('click', startGame);

    function endGame() {
      clearInterval(gameInterval);
      clearInterval(spawnInterval);
      isPlaying = false;

      // Clean remaining bubbles
      area.querySelectorAll('.nabila-bubble').forEach(b => b.remove());

      if (score >= 10) {
        if (typeof confetti === 'function') {
          confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
        }
      }

      area.innerHTML = `
        <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; color:#fff; font-family:'Space Grotesk',sans-serif; text-align:center; padding:2rem; box-sizing:border-box;">
          <div style="font-size:3.5rem; margin-bottom:0.8rem; filter:drop-shadow(0 4px 10px rgba(212,175,55,0.4));">${score >= 10 ? '👑' : '💫'}</div>
          <h3 style="font-size:2.2rem; margin-bottom:0.6rem; color:#d4af37;">${score >= 10 ? 'Luar Biasa! 🎉' : 'Waktu Habis!'}</h3>
          <p style="font-size:1.15rem; color:#eee; max-width:550px; line-height:1.6; margin-bottom:1.5rem;">
            ${score >= 10 
              ? `Hebat! Kamu berhasil menangkap <strong>${score} foto Nabila</strong>! Momen spesial dan harapan ulang tahun kini telah terbuka penuh cinta.` 
              : `Kamu menangkap ${score} foto Nabila. Kumpulkan minimal 10 foto untuk membuka Special Birthday Wish!`}
          </p>
          ${score >= 10 
            ? '<button onclick="window.showCake()" class="cta-btn cta-btn--primary" style="font-size:1.05rem; padding:14px 36px; box-shadow:0 10px 30px rgba(212,175,55,0.4);">Make a Wish Now! 🎂✨</button>' 
            : '<button id="retry-game-btn" class="cta-btn cta-btn--primary" style="font-size:1rem; padding:12px 30px;">Coba Lagi 🔄</button>'}
        </div>
      `;

      const retryBtn = document.getElementById('retry-game-btn');
      if (retryBtn) {
        retryBtn.onclick = () => {
          startGame();
        };
      }
    }
  }

  // ===== CAKE SHOW FUNCTION (bridge to cake3d.js) =====
  window.showCake = function() {
    if (typeof init3DCake === 'function') {
      init3DCake();
    } else {
      alert('🎂 Make a wish! Your wish will surely come true! 💫');
    }
  };

  window.addEventListener('DOMContentLoaded', () => {
    initCursor();
    initCountdown();
    initBdayTypewriter();
    initCinemaRecap();
    initHeartTrail();
    initBdaySlideshow();
    initTimeline();
    initVisualizer();
    initMinigame();

    // Start bday button
    const startBtn = document.getElementById('start-bday-btn');
    if (startBtn) {
      startBtn.addEventListener('click', () => {
        window.launchFireworks();
        setTimeout(window.rainConfetti, 500);
        setTimeout(window.showCake, 2000);
      });
    }
  });
})();
