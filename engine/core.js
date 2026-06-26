/**
 * IR Homepage Scapes — Core Engine
 * engine/core.js
   *
   * Central namespace and renderer setup.
   * Re-codeable: swap renderer, add post-processing, change resolution here.
   */

window.IRScapes = (function () {

    // ─── State ────────────────────────────────────────────────────────────────
    let renderer, scene, clock;
  let currentWorld = null;
  let quality = 'high';
  let animFrameId = null;

  // ─── Quality presets ──────────────────────────────────────────────────────
  const QUALITY = {
        low:    { shadows: false, pixelRatio: 0.75, antialias: false },
              medium: { shadows: true,  pixelRatio: 1.0,  antialias: false },
                    high:   { shadows: true,  pixelRatio: Math.min(window.devicePixelRatio, 2), antialias: true }
  };

  // ─── Init renderer ────────────────────────────────────────────────────────
  function initRenderer() {
        const canvas = document.getElementById('world-canvas');
    const q = QUALITY[quality];

    renderer = new THREE.WebGLRenderer({
            canvas,
            antialias: q.antialias,
            powerPreference: 'high-performance'
});
    renderer.setPixelRatio(q.pixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = q.shadows;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.outputEncoding = THREE.sRGBEncoding;

    clock = new THREE.Clock();

    window.addEventListener('resize', onResize);
  }

  function onResize() {
        if (!renderer) return;
    const q = QUALITY[quality];
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(q.pixelRatio);
    if (currentWorld && currentWorld.onResize) {
      currentWorld.onResize(window.innerWidth, window.innerHeight);
    }
  }

  // ─── World lifecycle ──────────────────────────────────────────────────────
  function loadWorld(worldDef) {
        // Stop previous world
    if (animFrameId) cancelAnimationFrame(animFrameId);
    if (currentWorld && currentWorld.dispose) currentWorld.dispose();

    scene = new THREE.Scene();
    currentWorld = worldDef;

    // Show explorer screen
    document.getElementById('world-select').classList.remove('active');
    document.getElementById('explorer-screen').classList.add('active');
    document.getElementById('world-label').textContent = worldDef.name;

    // Build the world
    worldDef.build(scene, renderer, quality);

    // Start camera
    IRScapes.Camera.init(scene, worldDef.cameraConfig || {});

    // Start render loop
    loop();
  }

  function loop() {
        animFrameId = requestAnimationFrame(loop);
    const delta = clock.getDelta();
    const elapsed = clock.getElapsedTime();

    // Tick world
    if (currentWorld && currentWorld.tick) currentWorld.tick(delta, elapsed, scene);

    // Tick camera
    IRScapes.Camera.tick(delta);

    renderer.render(scene, IRScapes.Camera.get());
}

  // ─── Quality switching ────────────────────────────────────────────────────
  function setQuality(q) {
        quality = q;
    const preset = QUALITY[q];
    renderer.setPixelRatio(preset.pixelRatio);
    renderer.shadowMap.enabled = preset.shadows;
    // Update quality button states
    document.querySelectorAll('#quality-toggle button').forEach((btn, i) => {
      btn.classList.toggle('active', ['low','medium','high'][i] === q);
  });
}

  // ─── Go home ──────────────────────────────────────────────────────────────
  function goHome() {
    if (animFrameId) cancelAnimationFrame(animFrameId);
    if (currentWorld && currentWorld.dispose) currentWorld.dispose();
    currentWorld = null;
    document.getElementById('explorer-screen').classList.remove('active');
    document.getElementById('world-select').classList.add('active');
  }

  // ─── Public API ───────────────────────────────────────────────────────────
  return {
        initRenderer,
    loadWorld,
    setQuality,
    goHome,
        getScene: () => scene,
    getRenderer: () => renderer,
        getQuality: () => quality,
        Camera: null, // filled by camera.js
        Animals: null // filled by animals.js
    };

})();
