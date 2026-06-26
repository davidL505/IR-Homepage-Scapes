/**
 * IR Homepage Scapes — Camera Controller
 * engine/camera.js
   *
   * Pointer/cursor-based exploration:
 *  - Click + drag to orbit/look around
 *  - Scroll wheel to zoom in/out
   *  - Hover near edges to pan
 *  - Click on objects = interaction raycast
 *  - Cinematic auto-drift mode when idle
 *
 * Re-codeable: swap camera type, change FOV, adjust speeds here.
   */

IRScapes.Camera = (function () {

    let camera, scene;
  let isDragging = false;
  let lastMouse = { x: 0, y: 0 };
  let spherical = { theta: 0, phi: Math.PI / 3, radius: 80 };
  let target = new THREE.Vector3(0, 0, 0);
  let cinematic = true;
  let idleTimer = 0;
  const IDLE_SECONDS = 4;
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  // ── Config defaults (overridden per world via cameraConfig) ───────────────
  let cfg = {
    fov: 65,
    near: 0.5,
    far: 8000,
    minPhi: 0.15,
    maxPhi: Math.PI / 2.1,
    minRadius: 10,
    maxRadius: 300,
    orbitSpeed: 0.005,
    zoomSpeed: 5,
    edgePanSpeed: 0.003,
    cinematicSpeed: 0.00015
};

  function init(sceneRef, config) {
    scene = sceneRef;
    Object.assign(cfg, config);

    camera = new THREE.PerspectiveCamera(cfg.fov, window.innerWidth / window.innerHeight, cfg.near, cfg.far);
    updateCameraPosition();

    // Pointer events on canvas
    const canvas = document.getElementById('world-canvas');
    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseup',   onMouseUp);
    canvas.addEventListener('mouseleave',onMouseUp);
    canvas.addEventListener('wheel',     onWheel, { passive: false });
    canvas.addEventListener('click',     onClick);

    // Touch support (mobile / trackpad)
    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    canvas.addEventListener('touchmove',  onTouchMove,  { passive: false });
    canvas.addEventListener('touchend',   onMouseUp);
}

  function updateCameraPosition() {
    const x = spherical.radius * Math.sin(spherical.phi) * Math.sin(spherical.theta);
    const y = spherical.radius * Math.cos(spherical.phi);
    const z = spherical.radius * Math.sin(spherical.phi) * Math.cos(spherical.theta);
    camera.position.set(target.x + x, target.y + y, target.z + z);
    camera.lookAt(target);
}

  function onMouseDown(e) {
    isDragging = true;
    cinematic = false;
    idleTimer = 0;
    lastMouse.x = e.clientX;
    lastMouse.y = e.clientY;
}

  function onMouseMove(e) {
    if (!isDragging) {
      // Edge pan
      edgePan(e.clientX, e.clientY);
      return;
}
    const dx = e.clientX - lastMouse.x;
    const dy = e.clientY - lastMouse.y;
    spherical.theta -= dx * cfg.orbitSpeed;
    spherical.phi = Math.max(cfg.minPhi, Math.min(cfg.maxPhi, spherical.phi - dy * cfg.orbitSpeed));
    lastMouse.x = e.clientX;
    lastMouse.y = e.clientY;
    updateCameraPosition();
    idleTimer = 0;
}

  function onMouseUp() { isDragging = false; }

  function onWheel(e) {
    e.preventDefault();
    spherical.radius = Math.max(cfg.minRadius, Math.min(cfg.maxRadius, spherical.radius + e.deltaY * 0.1 * cfg.zoomSpeed));
    updateCameraPosition();
    idleTimer = 0;
    cinematic = false;
}

  function edgePan(cx, cy) {
    const W = window.innerWidth, H = window.innerHeight;
    const margin = 60;
    if (cx < margin) spherical.theta -= cfg.edgePanSpeed * (margin - cx) / margin;
    if (cx > W - margin) spherical.theta += cfg.edgePanSpeed * (cx - (W - margin)) / margin;
    if (cy < margin) spherical.phi = Math.max(cfg.minPhi, spherical.phi - cfg.edgePanSpeed * (margin - cy) / margin);
    if (cy > H - margin) spherical.phi = Math.min(cfg.maxPhi, spherical.phi + cfg.edgePanSpeed * (cy - (H - margin)) / margin);
    updateCameraPosition();
}

  // Touch (two-finger pinch zoom)
  let touchStart = [];
  function onTouchStart(e) {
    e.preventDefault();
    if (e.touches.length === 1) {
      isDragging = true;
      cinematic = false;
      lastMouse.x = e.touches[0].clientX;
      lastMouse.y = e.touches[0].clientY;
}
    touchStart = [...e.touches].map(t => ({ x: t.clientX, y: t.clientY }));
  }

  function onTouchMove(e) {
        e.preventDefault();
    if (e.touches.length === 1 && isDragging) {
      const dx = e.touches[0].clientX - lastMouse.x;
      const dy = e.touches[0].clientY - lastMouse.y;
      spherical.theta -= dx * cfg.orbitSpeed;
      spherical.phi = Math.max(cfg.minPhi, Math.min(cfg.maxPhi, spherical.phi - dy * cfg.orbitSpeed));
      lastMouse.x = e.touches[0].clientX;
      lastMouse.y = e.touches[0].clientY;
      updateCameraPosition();
    } else if (e.touches.length === 2 && touchStart.length === 2) {
      const prev = Math.hypot(touchStart[0].x - touchStart[1].x, touchStart[0].y - touchStart[1].y);
      const curr = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
      spherical.radius = Math.max(cfg.minRadius, Math.min(cfg.maxRadius, spherical.radius - (curr - prev) * 0.2));
      updateCameraPosition();
      touchStart = [...e.touches].map(t => ({ x: t.clientX, y: t.clientY }));
    }
}

  // Click to interact with animals/terrain
  function onClick(e) {
        mouse.x =  (e.clientX / window.innerWidth)  * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const scene = IRScapes.getScene();
    if (!scene) return;
    const interactables = scene.children.filter(c => c.userData.interactive);
    const hits = raycaster.intersectObjects(interactables, true);
    if (hits.length > 0) {
      const obj = hits[0].object;
      while (obj.parent && !obj.userData.onInteract) obj = obj.parent;
      if (obj.userData.onInteract) obj.userData.onInteract(obj);
    }
}

  // Cinematic auto-drift
  function tick(delta) {
    if (!camera) return;
    idleTimer += delta;
    if (idleTimer > IDLE_SECONDS && !isDragging) cinematic = true;
    if (cinematic) {
      spherical.theta += cfg.cinematicSpeed * 60 * delta;
      updateCameraPosition();
    }
  }

  function setTarget(vec3) {
        target.copy(vec3);
    updateCameraPosition();
  }

  function onResize(w, h) {
        if (camera) {
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
        }
  }

  return { init, tick, get: () => camera, setTarget, onResize };

  })();
