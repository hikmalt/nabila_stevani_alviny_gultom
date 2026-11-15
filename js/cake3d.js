// =============================================
// 3D BIRTHDAY CAKE (from reference code)
// Three.js powered - drag to rotate, 
// shake mouse / click to blow out candle
// =============================================

// Adapted from birthday-site-main reference

let _scene, _camera, _renderer, _candleFlame, _cakeGroup;
let _isCakeActive = false;
let _isDragging = false;
let _prevDragX = 0;
let _prevDragY = 0;
let _cakeRotY = 0;
let _cakeRotX = 0.2;

let _shakeHistory = [];
let _lastShakeDir = null;
let _shakeSwitches = 0;
let _lastMouseX = 0;
const SHAKE_THRESHOLD = 80;

window.init3DCake = function() {
  _isCakeActive = true;

  // Full-screen premium overlay
  const container = document.createElement('div');
  container.id = 'cake-container';
  container.style.cssText = `
    position: fixed;
    top: 0; left: 0;
    width: 100%; height: 100%;
    z-index: 99999;
    background: radial-gradient(ellipse at center, #1a0a2e 0%, #0d0518 60%, #000 100%);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    cursor: grab;
    animation: cakeFadeIn 0.8s ease;
  `;

  // Add fade in animation
  const cakeStyle = document.createElement('style');
  cakeStyle.textContent = `
    @keyframes cakeFadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes fadeOutScale { from { opacity: 1; transform: scale(1); } to { opacity: 0; transform: scale(0.8); } }
    @keyframes wishTextGlow {
      0%, 100% { text-shadow: 0 0 20px #ff69b4, 0 0 40px #ff1493; }
      50% { text-shadow: 0 0 40px #ffd700, 0 0 80px #ff69b4; }
    }
  `;
  document.head.appendChild(cakeStyle);
  document.body.appendChild(container);

  // Title
  const title = document.createElement('h2');
  title.id = 'cake-title';
  title.innerText = '🎂 Make a Wish! Shake your mouse left & right or click!';
  title.style.cssText = `
    color: #fff;
    font-family: 'Pacifico', cursive;
    font-size: clamp(0.9rem, 2.5vw, 1.3rem);
    text-align: center;
    text-shadow: 0 0 20px #ff69b4, 0 0 40px #ff1493;
    margin: 0 20px 8px 20px;
    z-index: 1;
    pointer-events: none;
    animation: wishTextGlow 3s ease-in-out infinite;
  `;
  container.appendChild(title);

  // Shake indicator
  const shakeIndicator = document.createElement('div');
  shakeIndicator.id = 'shake-indicator';
  shakeIndicator.innerHTML = '💨 💨 💨';
  shakeIndicator.style.cssText = `
    font-size: 1.6rem;
    letter-spacing: 8px;
    opacity: 0.3;
    transition: opacity 0.3s;
    margin-bottom: 8px;
    z-index: 1;
    pointer-events: none;
  `;
  container.appendChild(shakeIndicator);

  // Close button
  const closeBtn = document.createElement('button');
  closeBtn.textContent = '✕ Close';
  closeBtn.style.cssText = `
    position: absolute;
    top: 20px; right: 20px;
    background: rgba(255,255,255,0.1);
    border: 1px solid rgba(255,255,255,0.2);
    color: white;
    padding: 8px 18px;
    border-radius: 999px;
    cursor: pointer;
    font-size: 0.85rem;
    z-index: 1;
    transition: background 0.2s;
  `;
  closeBtn.addEventListener('click', () => {
    _isCakeActive = false;
    if (_renderer) _renderer.dispose();
    container.style.animation = 'fadeOutScale 0.6s ease forwards';
    setTimeout(() => { container.remove(); cakeStyle.remove(); }, 700);
  });
  container.appendChild(closeBtn);

  // Fallback if Three.js not loaded
  if (typeof THREE === 'undefined') {
    const msg = document.createElement('div');
    msg.style.cssText = 'color:#ff69b4;font-size:1.4rem;text-align:center;padding:60px;font-family:Dancing Script,cursive;line-height:2;';
    msg.innerHTML = '🎂<br><br>Click anywhere to blow out the candle<br>and make your wish! 💫';
    container.appendChild(msg);
    container.addEventListener('click', () => _blowOutCandleFallback(container));
    return;
  }

  try {
    // Three.js scene
    _scene = new THREE.Scene();
    _camera = new THREE.PerspectiveCamera(45, window.innerWidth / (window.innerHeight * 0.72), 0.1, 1000);
    _camera.position.set(0, 6, 14);
    _camera.lookAt(0, 2, 0);

    _renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    _renderer.setSize(window.innerWidth, window.innerHeight * 0.72);
    _renderer.shadowMap.enabled = true;
    _renderer.setClearColor(0x000000, 0);
    _renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(_renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffeedd, 0.5);
    _scene.add(ambientLight);

    const candleLight = new THREE.PointLight(0xffaa33, 2.5, 20);
    candleLight.position.set(0, 8, 0);
    _scene.add(candleLight);

    const rimLight = new THREE.DirectionalLight(0xff69b4, 0.8);
    rimLight.position.set(-5, 5, -5);
    _scene.add(rimLight);

    const topLight = new THREE.DirectionalLight(0xffffff, 0.4);
    topLight.position.set(5, 10, 5);
    _scene.add(topLight);

    // === Build Cake ===
    _cakeGroup = new THREE.Group();
    _scene.add(_cakeGroup);

    // Plate
    const plateGeo = new THREE.CylinderGeometry(4.2, 4.2, 0.2, 64);
    const plateMat = new THREE.MeshPhongMaterial({ color: 0xffffff, shininess: 200 });
    const plate = new THREE.Mesh(plateGeo, plateMat);
    plate.position.y = -0.1;
    _cakeGroup.add(plate);

    // Bottom layer - chocolate
    const layer1Geo = new THREE.CylinderGeometry(3.5, 3.5, 2.2, 64);
    const layer1Mat = new THREE.MeshPhongMaterial({ color: 0x6B3A2C, shininess: 60 });
    const layer1 = new THREE.Mesh(layer1Geo, layer1Mat);
    layer1.position.y = 1.1;
    _cakeGroup.add(layer1);

    // Frosting bottom
    const frostMat = new THREE.MeshPhongMaterial({ color: 0xFFB6C1, shininess: 150 });
    const frost1 = new THREE.Mesh(new THREE.CylinderGeometry(3.65, 3.65, 0.3, 64), frostMat);
    frost1.position.y = 2.35;
    _cakeGroup.add(frost1);

    // Middle layer - pink
    const layer2Mat = new THREE.MeshPhongMaterial({ color: 0xFF69B4, shininess: 80 });
    const layer2 = new THREE.Mesh(new THREE.CylinderGeometry(2.8, 2.8, 1.8, 64), layer2Mat);
    layer2.position.y = 3.35;
    _cakeGroup.add(layer2);

    // Frosting middle
    const frost2 = new THREE.Mesh(new THREE.CylinderGeometry(2.95, 2.95, 0.28, 64), frostMat);
    frost2.position.y = 4.4;
    _cakeGroup.add(frost2);

    // Top layer - purple
    const layer3Mat = new THREE.MeshPhongMaterial({ color: 0xC084FC, shininess: 120 });
    const layer3 = new THREE.Mesh(new THREE.CylinderGeometry(2.0, 2.0, 1.5, 64), layer3Mat);
    layer3.position.y = 5.24;
    _cakeGroup.add(layer3);

    // Top frosting
    const frost3 = new THREE.Mesh(new THREE.CylinderGeometry(2.1, 2.1, 0.22, 64), frostMat);
    frost3.position.y = 6.11;
    _cakeGroup.add(frost3);

    // Colorful sprinkles
    const sprinkleColors = [0xFF1493, 0xFFD700, 0x00BFFF, 0xFF4500, 0x7FFF00, 0xFF69B4, 0xDA70D6];
    for (let i = 0; i < 40; i++) {
      const sprinkleGeo = typeof THREE.CapsuleGeometry !== 'undefined'
        ? new THREE.CapsuleGeometry(0.07, 0.28, 4, 8)
        : new THREE.CylinderGeometry(0.07, 0.07, 0.28 + 0.07 * 2, 8);
      const sprinkleMat = new THREE.MeshPhongMaterial({
        color: sprinkleColors[Math.floor(Math.random() * sprinkleColors.length)]
      });
      const sprinkle = new THREE.Mesh(sprinkleGeo, sprinkleMat);
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 1.8;
      sprinkle.position.set(Math.cos(angle) * radius, 6.25, Math.sin(angle) * radius);
      sprinkle.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      _cakeGroup.add(sprinkle);
    }

    // Candle
    const candleMat = new THREE.MeshPhongMaterial({ color: 0xFFF0F5 });
    const candle = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 2.0, 32), candleMat);
    candle.position.set(0, 7.22, 0);
    _cakeGroup.add(candle);

    // Wick
    const wickMat = new THREE.MeshPhongMaterial({ color: 0x333333 });
    const wick = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.3, 8), wickMat);
    wick.position.set(0, 8.37, 0);
    _cakeGroup.add(wick);

    // Flame group
    const flameGroup = new THREE.Group();
    flameGroup.position.set(0, 8.8, 0);
    _cakeGroup.add(flameGroup);
    _candleFlame = flameGroup;

    const flameMat = new THREE.MeshBasicMaterial({ color: 0xFFAA00, transparent: true, opacity: 0.95 });
    const flameInner = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.65, 16), flameMat);
    flameGroup.add(flameInner);

    const glowMat = new THREE.MeshBasicMaterial({ color: 0xFF6600, transparent: true, opacity: 0.35 });
    const glow = new THREE.Mesh(new THREE.SphereGeometry(0.32, 16, 16), glowMat);
    glow.position.y = -0.15;
    flameGroup.add(glow);

    // Start animations
    _animateCake();
    _setupOrbitDrag(container);
    _setupShakeGesture(container, shakeIndicator);

    container.addEventListener('click', () => {
      if (_isCakeActive && _candleFlame && _candleFlame.visible) {
        _blowOutCandle(title);
      }
    });

    // Resize
    window.addEventListener('resize', () => {
      if (!_renderer) return;
      _camera.aspect = window.innerWidth / (window.innerHeight * 0.72);
      _camera.updateProjectionMatrix();
      _renderer.setSize(window.innerWidth, window.innerHeight * 0.72);
    });

  } catch (err) {
    console.error('3D Cake error:', err);
    const broken = container.querySelector('canvas');
    if (broken) broken.remove();
    const msg = document.createElement('div');
    msg.style.cssText = 'color:#ff69b4;font-size:1.4rem;text-align:center;padding:60px;font-family:Dancing Script,cursive;line-height:2;';
    msg.innerHTML = '🎂<br><br>Tap anywhere to blow out the candle<br>and make your wish! 💫';
    container.appendChild(msg);
    container.addEventListener('click', () => _blowOutCandleFallback(container));
  }
};

function _setupOrbitDrag(container) {
  container.addEventListener('mousedown', e => {
    _isDragging = true;
    _prevDragX = e.clientX;
    _prevDragY = e.clientY;
    container.style.cursor = 'grabbing';
  });
  window.addEventListener('mousemove', e => {
    if (_isDragging && _cakeGroup) {
      const dx = e.clientX - _prevDragX;
      const dy = e.clientY - _prevDragY;
      _cakeRotY += dx * 0.01;
      _cakeRotX += dy * 0.005;
      _cakeRotX = Math.max(-0.5, Math.min(0.8, _cakeRotX));
      _prevDragX = e.clientX;
      _prevDragY = e.clientY;
    }
  });
  window.addEventListener('mouseup', () => {
    _isDragging = false;
    const c = document.getElementById('cake-container');
    if (c) c.style.cursor = 'grab';
  });

  // Touch
  let prevTX = 0;
  container.addEventListener('touchstart', e => { prevTX = e.touches[0].clientX; }, { passive: true });
  container.addEventListener('touchmove', e => {
    if (_cakeGroup) {
      const dx = e.touches[0].clientX - prevTX;
      _cakeRotY += dx * 0.01;
      prevTX = e.touches[0].clientX;
    }
  }, { passive: true });
}

function _setupShakeGesture(container, indicator) {
  _lastMouseX = 0;
  _shakeSwitches = 0;
  _lastShakeDir = null;

  window.addEventListener('mousemove', e => {
    if (!_isCakeActive || !_candleFlame || !_candleFlame.visible) return;
    const dx = e.clientX - _lastMouseX;
    _lastMouseX = e.clientX;
    if (Math.abs(dx) < 5) return;
    const dir = dx > 0 ? 'right' : 'left';
    if (dir !== _lastShakeDir) {
      if (_lastShakeDir !== null) {
        _shakeSwitches++;
        const lit = Math.min(_shakeSwitches, 3);
        indicator.style.opacity = '1';
        indicator.innerHTML = '💨'.repeat(lit) + `<span style="opacity:0.2">${'💨'.repeat(3 - lit)}</span>`;
        if (_shakeSwitches >= 5) {
          const titleEl = document.getElementById('cake-title');
          _blowOutCandle(titleEl);
          _shakeSwitches = 0;
        }
      }
      _lastShakeDir = dir;
    }
  });
}

function _animateCake() {
  if (!_isCakeActive) return;
  requestAnimationFrame(_animateCake);
  if (!_isDragging && _cakeGroup) _cakeRotY += 0.003;
  if (_cakeGroup) {
    _cakeGroup.rotation.y = _cakeRotY;
    _cakeGroup.rotation.x = _cakeRotX;
  }
  if (_candleFlame && _candleFlame.visible) {
    _candleFlame.scale.x = 1 + Math.sin(Date.now() * 0.01) * 0.1 + Math.random() * 0.06;
    _candleFlame.scale.y = 1 + Math.cos(Date.now() * 0.008) * 0.12 + Math.random() * 0.05;
  }
  if (_renderer) _renderer.render(_scene, _camera);
}

function _blowOutCandle(titleEl) {
  if (!_candleFlame) return;
  _candleFlame.visible = false;
  if (titleEl) {
    titleEl.innerText = '🎉 Happy Birthday! Your wish is coming true! ✨';
    titleEl.style.textShadow = '0 0 30px #ffd700, 0 0 60px #ff69b4';
  }
  // Launch fireworks
  if (typeof window.launchFireworks === 'function') {
    window.launchFireworks();
    setTimeout(window.launchFireworks, 600);
    setTimeout(window.launchFireworks, 1200);
  }
  if (typeof window.rainConfetti === 'function') {
    setTimeout(window.rainConfetti, 800);
  }

  setTimeout(() => {
    _isCakeActive = false;
    if (_renderer) _renderer.dispose();
    const container = document.getElementById('cake-container');
    if (container) {
      container.style.animation = 'fadeOutScale 1s ease forwards';
      setTimeout(() => container.remove(), 1100);
    }
  }, 5000);
}

function _blowOutCandleFallback(container) {
  if (typeof window.launchFireworks === 'function') {
    window.launchFireworks();
    setTimeout(window.launchFireworks, 600);
  }
  if (typeof window.rainConfetti === 'function') {
    setTimeout(window.rainConfetti, 500);
  }
  setTimeout(() => {
    container.style.animation = 'fadeOutScale 1s ease forwards';
    setTimeout(() => container.remove(), 1100);
  }, 4000);
}
