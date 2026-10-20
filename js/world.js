/* ==================================================================
   Virtual Artifact Hunt — 3D gallery (Three.js r159, classic build)
   Each region is a dim room styled after its culture (see rooms.js).
   The player stands near the middle, drags to look around, and a
   flashlight follows the pointer.
   Artifacts are shuffled into random hiding spots each round: inside
   chests, drawers, crates and lidded baskets, under cloths, behind
   pillars, on cluttered shelves, in a display case. Everything is
   built from primitives in code — no model files.
   Public API: WORLD.supported(), init(el, {onPick, onToast}),
   loadRegion(key, artifacts), markFound(id), hint(id),
   screenPos(id), setActive(bool)
   ================================================================== */

const WORLD = (() => {
  const T = window.THREE;
  const HALF = 8.5, HEIGHT = 5, CAM_R = 2.0, EYE = 1.65;

  let renderer = null, scene = null, camera = null, host = null, spot = null;
  let raf = 0, active = false, last = 0;
  let containers = [], artifactObjs = {}, glintAt = {}, room = null;
  let cb = { onPick() {}, onToast() {}, onInspect() {} };
  const cam = { a: 0, look: 1.1, fov: 55, ta: null, tlook: null, tfov: null };
  // Close-up mode: the camera flies to a per-object pose (view.cam, looking
  // at view.look, both in view.anchor's local space) so players can see
  // into open drawers, chests, crates, baskets, shelves and behind pillars.
  const insp = { active: false, t: 0, view: null, yaw: 0, lift: 0 };
  const pointer = { x: 0, y: 0, over: false };
  const ray = new (T ? T.Raycaster : Object)();

  // ------------------------------------------------------------ helpers
  function supported() {
    if (!T) return false;
    try {
      const c = document.createElement('canvas');
      return !!(c.getContext('webgl2') || c.getContext('webgl'));
    } catch { return false; }
  }

  const mat = (color, o = {}) => new T.MeshStandardMaterial({ color, roughness: o.rough ?? 0.85, metalness: o.metal ?? 0, ...o.extra });

  function mesh(geo, material, x = 0, y = 0, z = 0) {
    const m = new T.Mesh(geo, material);
    m.position.set(x, y, z);
    m.castShadow = true;
    m.receiveShadow = true;
    return m;
  }
  const box = (w, h, d, m, x, y, z) => mesh(new T.BoxGeometry(w, h, d), m, x, y, z);

  function hollow(w, h, d, t, m) {
    const g = new T.Group();
    g.add(box(w, t, d, m, 0, t / 2, 0));
    g.add(box(t, h, d, m, -w / 2 + t / 2, h / 2, 0));
    g.add(box(t, h, d, m, w / 2 - t / 2, h / 2, 0));
    g.add(box(w, h, t, m, 0, h / 2, -d / 2 + t / 2));
    g.add(box(w, h, t, m, 0, h / 2, d / 2 - t / 2));
    return g;
  }

  function canvasTex(w, h, draw, repeat) {
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    draw(c.getContext('2d'), w, h);
    const t = new T.CanvasTexture(c);
    t.colorSpace = T.SRGBColorSpace;
    if (repeat) { t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(repeat, repeat); }
    return t;
  }


  function iconTexture(key) {
    const c = document.createElement('canvas');
    c.width = 256; c.height = 282;
    const tex = new T.CanvasTexture(c);
    tex.colorSpace = T.SRGBColorSpace;
    const img = new Image();
    img.onload = () => { c.getContext('2d').drawImage(img, 0, 0, 256, 282); tex.needsUpdate = true; };
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(ICONS[key]());
    return tex;
  }

  let sparkleTex = null;
  function sparkleTexture() {
    if (sparkleTex) return sparkleTex;
    sparkleTex = canvasTex(64, 64, (g) => {
      const grd = g.createRadialGradient(32, 32, 0, 32, 32, 30);
      grd.addColorStop(0, 'rgba(255,255,240,1)');
      grd.addColorStop(0.25, 'rgba(255,230,160,.8)');
      grd.addColorStop(1, 'rgba(255,220,140,0)');
      g.fillStyle = grd; g.fillRect(0, 0, 64, 64);
      g.fillStyle = 'rgba(255,255,255,.95)';
      g.fillRect(30, 2, 4, 60); g.fillRect(2, 30, 60, 4);
    });
    return sparkleTex;
  }

  function tag(obj, kind, data) {
    obj.userData.kind = kind;
    Object.assign(obj.userData, data);
    return obj;
  }

  const shuffle = (arr) => { for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; } return arr; };

  // ----------------------------------------------------------- artifact
  function makeArtifact(a) {
    const g = new T.Group();
    const tex = iconTexture(a.icon);
    const plane = new T.Mesh(
      new T.PlaneGeometry(0.42, 0.462),
      new T.MeshStandardMaterial({ map: tex, transparent: true, alphaTest: 0.35, side: T.DoubleSide, roughness: 0.75 })
    );
    plane.position.y = 0.271;
    g.add(plane);
    g.add(mesh(new T.CylinderGeometry(0.11, 0.13, 0.04, 14), mat(0x2b1c10), 0, 0.02, 0));
    const sp = new T.Sprite(new T.SpriteMaterial({ map: sparkleTexture(), transparent: true, opacity: 0, depthWrite: false, blending: T.AdditiveBlending }));
    sp.scale.set(0.35, 0.35, 0.35);
    sp.position.set(0.12, 0.42, 0.02);
    g.add(sp);
    g.userData.sparkle = sp;
    return tag(g, 'artifact', { id: a.id });
  }

  // Containers are built by rooms.js and registered here so picking,
  // opening animations, glints and hints can find them.
  function makeContainer(group, label, apply, view) {
    const c = { group, label, open: false, t: 0, apply, view, holds: null, emptyHint: null, flash: 0 };
    tag(group, 'container', { container: c });
    containers.push(c);
    return c;
  }

  // ------------------------------------------------------- region build
  function disposeScene() {
    if (!scene) return;
    scene.traverse(o => {
      if (o.geometry) o.geometry.dispose();
      if (o.material) {
        (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => { if (m.map && m.map !== sparkleTex) m.map.dispose(); m.dispose(); });
      }
    });
  }

  function loadRegion(key, artifacts) {
    disposeScene();
    scene = new T.Scene();
    containers = []; artifactObjs = {}; glintAt = {};

    spot = new T.SpotLight(0xfff1d6, 55, 20, 0.36, 0.5, 1.3);
    spot.castShadow = true;
    spot.shadow.mapSize.set(1024, 1024);
    spot.shadow.bias = -0.0006;
    scene.add(spot, spot.target);

    // The room itself — architecture, light, furniture, props — is built
    // per region by rooms.js and hands back its hiding spots.
    room = ROOMS.build(key, { T, HALF, HEIGHT, scene, spot, mesh, box, hollow, tag, makeContainer, shuffle });
    const spots = room.spots;

    shuffle(spots);
    const used = new Set();
    artifacts.forEach((a, i) => {
      const s = spots[i];
      used.add(s);
      const obj = makeArtifact(a);
      obj.position.set(...s.pos);
      obj.scale.setScalar(s.scale);
      if (s.lying) obj.rotation.x = -1.25;
      s.parent.add(obj);
      artifactObjs[a.id] = { obj, container: s.container || null, found: false };
      if (s.container) s.container.holds = a.id;
      glintAt[a.id] = performance.now() + 4000 + i * 1300;
    });
    spots.forEach(s => {
      if (used.has(s) || !s.container || Math.random() > 0.45) return;
      const d = room.filler();
      d.position.set(...s.pos);
      d.scale.setScalar(s.scale);
      s.parent.add(d);
      s.container.emptyHint = 'decoy';
    });

    cam.a = Math.random() * Math.PI * 2;
    cam.look = 1.1; cam.fov = 55;
    cam.ta = cam.tlook = cam.tfov = null;
    Object.assign(insp, { active: false, t: 0, view: null, yaw: 0, lift: 0 });
    cb.onInspect(false);
    resize();
  }

  function enterInspect(view, label) {
    Object.assign(insp, { active: true, view, yaw: 0, lift: 0 });
    cam.tfov = 50;
    pointer.over = false; // light up the close-up itself, not wherever you last tapped
    cb.onInspect(true, label);
  }

  function exitInspect() {
    if (!insp.active) return;
    insp.active = false;
    cam.tfov = 55;
    cb.onInspect(false);
  }

  // ---------------------------------------------------------- picking
  // The first solid surface along the ray decides: walls, cabinet tops and
  // closed lids block whatever is behind them. Glass and sprites don't.
  function hitAt(nx, ny) {
    ray.setFromCamera({ x: nx, y: ny }, camera);
    const hits = ray.intersectObjects(scene.children, true);
    for (const h of hits) {
      const m = h.object;
      if (!m.isMesh || m.userData.passThrough || !m.visible || !visibleChain(m)) continue;
      let o = m;
      while (o && !o.userData.kind) o = o.parent;
      return o || null;
    }
    return null;
  }

  function visibleChain(o) {
    for (; o; o = o.parent) if (!o.visible) return false;
    return true;
  }

  function pick(nx, ny) {
    const o = hitAt(nx, ny);
    if (!o) return;
    const k = o.userData.kind;
    if (k === 'artifact') {
      const rec = artifactObjs[o.userData.id];
      if (rec && !rec.found) cb.onPick(o.userData.id);
    } else if (k === 'container') {
      // First tap opens it and moves in for a close look; tapping it again
      // while you're looking at it closes it.
      const c = o.userData.container;
      const lookingHere = insp.active && insp.view === c.view;
      const wasOpen = c.open;
      SOUND.click();
      if (lookingHere) c.open = !c.open;
      else { c.open = true; enterInspect(c.view, c.label); }
      if (c.open && c.siblings) c.siblings.forEach(o => { o.open = false; });
      if (c.open && !wasOpen && !c.holds) {
        setTimeout(() => cb.onToast(c.emptyHint ? `Nothing in this ${c.label} but clutter.` : `This ${c.label} is empty. Keep searching.`), 600);
      }
    } else if (k === 'inspect') {
      if (!(insp.active && insp.view === o.userData.view)) { SOUND.click(); enterInspect(o.userData.view, o.userData.label); }
    } else if (k === 'decoy') {
      cb.onToast(o.userData.label);
    }
  }

  // ---------------------------------------------------------- controls
  function bindControls(canvas) {
    const pts = new Map();
    let down = null, moved = 0, pinch = 0;
    const ndc = (e) => {
      const r = canvas.getBoundingClientRect();
      return [((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1];
    };
    canvas.addEventListener('pointerdown', (e) => {
      canvas.setPointerCapture(e.pointerId);
      pts.set(e.pointerId, [e.clientX, e.clientY]);
      if (pts.size === 1) { down = [e.clientX, e.clientY]; moved = 0; }
      if (pts.size === 2) { const [a, b] = [...pts.values()]; pinch = Math.hypot(a[0] - b[0], a[1] - b[1]); }
      [pointer.x, pointer.y] = ndc(e); pointer.over = true;
      cam.ta = cam.tlook = cam.tfov = null;
    });
    canvas.addEventListener('pointermove', (e) => {
      [pointer.x, pointer.y] = ndc(e); pointer.over = true;
      if (!pts.has(e.pointerId)) return;
      const prev = pts.get(e.pointerId);
      const dx = e.clientX - prev[0], dy = e.clientY - prev[1];
      pts.set(e.pointerId, [e.clientX, e.clientY]);
      if (pts.size === 2) {
        const [a, b] = [...pts.values()];
        const d = Math.hypot(a[0] - b[0], a[1] - b[1]);
        cam.fov = Math.min(60, Math.max(22, cam.fov - (d - pinch) * 0.08));
        pinch = d; moved = 99;
        return;
      }
      moved += Math.abs(dx) + Math.abs(dy);
      if (insp.active) {
        insp.yaw = Math.min(1.1, Math.max(-1.1, insp.yaw - dx * 0.006));
        insp.lift = Math.min(0.9, Math.max(-0.35, insp.lift + dy * 0.006));
        return;
      }
      cam.a -= dx * 0.0055 * (cam.fov / 55);
      cam.look = Math.min(3.4, Math.max(-0.4, cam.look + dy * 0.012));
    });
    const end = (e) => {
      pts.delete(e.pointerId);
      if (pts.size === 0 && down && moved < 8) pick(...ndc(e));
      if (pts.size === 0) down = null;
    };
    canvas.addEventListener('pointerup', end);
    canvas.addEventListener('pointercancel', end);
    // On touch screens the flashlight stays where you last touched.
    canvas.addEventListener('pointerleave', (e) => { if (!pts.size && e.pointerType === 'mouse') pointer.over = false; });
    canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      cam.fov = Math.min(60, Math.max(22, cam.fov + e.deltaY * 0.03));
    }, { passive: false });
    canvas.addEventListener('keydown', (e) => {
      const k = e.key;
      if (k === 'Escape') exitInspect();
      else if (insp.active && (k === 'ArrowLeft' || k === 'ArrowRight')) nudge(k === 'ArrowLeft' ? 0.12 : -0.12);
      else if (k === 'ArrowLeft') cam.a += 0.12;
      else if (k === 'ArrowRight') cam.a -= 0.12;
      else if (k === 'ArrowUp') cam.look = Math.min(3.4, cam.look + 0.2);
      else if (k === 'ArrowDown') cam.look = Math.max(-0.4, cam.look - 0.2);
      else if (k === '+' || k === '=') cam.fov = Math.max(22, cam.fov - 4);
      else if (k === '-') cam.fov = Math.min(60, cam.fov + 4);
      else if (k === 'Enter' || k === ' ') pick(0, 0);
      else return;
      pointer.over = false;
      e.preventDefault();
    });
  }

  // --------------------------------------------------------- frame loop
  const v3 = T ? new T.Vector3() : null, v3b = T ? new T.Vector3() : null;

  const UP = T ? new T.Vector3(0, 1, 0) : null;
  const camPos = T ? new T.Vector3() : null, camLook = T ? new T.Vector3() : null;
  const inLook = T ? new T.Vector3() : null, inCam = T ? new T.Vector3() : null;

  function updateCamera(dt) {
    const ease = (cur, tgt, k) => (tgt == null ? cur : cur + (tgt - cur) * k);
    if (cam.ta != null) { let d = cam.ta - cam.a; d = Math.atan2(Math.sin(d), Math.cos(d)); cam.a += d * 0.08; if (Math.abs(d) < 0.002) cam.ta = null; }
    cam.look = ease(cam.look, cam.tlook, 0.08);
    cam.fov = ease(cam.fov, cam.tfov, 0.08);
    camPos.set(Math.sin(cam.a) * CAM_R, EYE, Math.cos(cam.a) * CAM_R);
    camLook.set(-Math.sin(cam.a) * 8, cam.look, -Math.cos(cam.a) * 8);

    insp.t = Math.min(1, Math.max(0, insp.t + (insp.active ? 1 : -1) * dt * 2.2));
    if (insp.t > 0 && insp.view) {
      const { anchor, cam: c, look: l } = insp.view;
      anchor.updateWorldMatrix(true, false);
      anchor.localToWorld(inLook.set(l[0], l[1], l[2]));
      anchor.localToWorld(inCam.set(c[0], c[1], c[2]));
      inCam.sub(inLook).applyAxisAngle(UP, insp.yaw);
      inCam.y += insp.lift;
      inCam.add(inLook);
      const s = insp.t * insp.t * (3 - 2 * insp.t);
      camPos.lerp(inCam, s);
      camLook.lerp(inLook, s);
    } else if (!insp.active) {
      insp.view = null;
    }
    camera.position.copy(camPos);
    camera.lookAt(camLook);
    if (Math.abs(camera.fov - cam.fov) > 0.01) { camera.fov = cam.fov; camera.updateProjectionMatrix(); }

    ray.setFromCamera(pointer.over ? pointer : { x: 0, y: 0 }, camera);
    spot.position.copy(camera.position).add(v3.set(0.15, -0.2, 0).applyQuaternion(camera.quaternion));
    spot.target.position.copy(ray.ray.origin).addScaledVector(ray.ray.direction, 7);
    spot.target.updateMatrixWorld();

    if (pointer.over) host.style.cursor = hitAt(pointer.x, pointer.y) ? 'pointer' : 'grab';
  }

  function isLit(obj) {
    obj.getWorldPosition(v3);
    v3b.copy(spot.target.position).sub(spot.position).normalize();
    v3.sub(spot.position);
    const dist = v3.length();
    return dist < 13 && v3.normalize().dot(v3b) > Math.cos(spot.angle * 0.85);
  }

  function updateAnimations(dt, now) {
    containers.forEach(c => {
      const target = c.open ? 1 : 0;
      if (c.t !== target) {
        c.t += Math.sign(target - c.t) * Math.min(Math.abs(target - c.t), dt * 2.6);
        c.apply(c.t);
      }
      if (c.flash > 0) {
        c.flash -= dt;
        const k = Math.max(0, Math.sin(c.flash * 9)) * 0.6;
        c.group.traverse(o => { if (o.isMesh && o.material.emissive) o.material.emissive.setRGB(k, k * 0.8, k * 0.4); });
        if (c.flash <= 0) c.group.traverse(o => { if (o.isMesh && o.material.emissive) o.material.emissive.setRGB(0, 0, 0); });
      }
    });
    Object.entries(artifactObjs).forEach(([id, rec]) => {
      const sp = rec.obj.userData.sparkle;
      if (rec.found) {
        rec.obj.scale.multiplyScalar(1 + dt * 2);
        rec.obj.traverse(o => { if (o.material) { o.material.transparent = true; o.material.opacity = Math.max(0, (o.material.opacity ?? 1) - dt * 2.5); } });
        if (rec.obj.scale.x > 2.5 && rec.obj.parent) rec.obj.parent.remove(rec.obj);
        return;
      }
      if (sp.material.opacity > 0) sp.material.opacity = Math.max(0, sp.material.opacity - dt * 1.8);
      if (sp.userData.hint > 0) { sp.userData.hint -= dt; sp.material.opacity = 0.6 + Math.sin(now / 90) * 0.4; }
      if (now < glintAt[id]) return;
      const hidden = rec.container && rec.container.t < 0.6;
      if (isLit(hidden ? rec.container.group : rec.obj)) {
        if (hidden) rec.container.flash = 0.35; else sp.material.opacity = 1;
        glintAt[id] = now + 6000 + Math.random() * 3000;
      } else {
        glintAt[id] = now + 700;
      }
    });
  }

  function frame(now) {
    raf = requestAnimationFrame(frame);
    if (!active || !scene) return;
    const dt = Math.min(0.05, (now - last) / 1000 || 0);
    last = now;
    updateCamera(dt);
    updateAnimations(dt, now);
    if (room) room.tick(now);
    renderer.render(scene, camera);
  }

  function resize() {
    if (!renderer || !host) return;
    const w = host.clientWidth, h = host.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  // ---------------------------------------------------------- public
  function init(el, callbacks) {
    cb = { ...cb, ...callbacks };
    host = el;
    renderer = new T.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = T.PCFSoftShadowMap;
    renderer.domElement.tabIndex = 0;
    renderer.domElement.setAttribute('aria-label', '3D gallery. Drag or use arrow keys to look around, Enter to search what the flashlight points at, Escape to leave a close-up.');
    el.appendChild(renderer.domElement);
    camera = new T.PerspectiveCamera(55, 16 / 9, 0.05, 40);
    bindControls(renderer.domElement);
    new ResizeObserver(resize).observe(el);
    raf = requestAnimationFrame(frame);
  }

  function markFound(id) {
    const rec = artifactObjs[id];
    if (rec) rec.found = true;
  }

  // Turn toward the artifact from an angle where it's actually visible:
  // facing it head-on can put a pillar dead in the way, so try nearby
  // angles until the first solid thing along the sightline is the
  // artifact itself (or the container it's hidden in) and it's in frame.
  function hint(id) {
    const rec = artifactObjs[id];
    if (!rec) return;
    exitInspect();
    const goal = rec.container && rec.container.t < 0.6 ? rec.container.group : rec.obj;
    const target = new T.Vector3();
    rec.obj.getWorldPosition(target);
    target.y += 0.15;
    const ideal = Math.atan2(-target.x, -target.z);
    const lookY = Math.min(3.4, Math.max(-0.4, target.y));
    const probe = new T.PerspectiveCamera(40, camera.aspect, 0.05, 40);
    const probeRay = new T.Raycaster();
    probeRay.camera = probe; // required for raycasting the sparkle sprites
    let best = ideal;
    for (const off of [0, 0.18, -0.18, 0.36, -0.36, 0.54, -0.54, 0.72, -0.72, 0.9, -0.9]) {
      const a = ideal + off;
      probe.position.set(Math.sin(a) * CAM_R, EYE, Math.cos(a) * CAM_R);
      probe.lookAt(-Math.sin(a) * 8, lookY, -Math.cos(a) * 8);
      probe.updateMatrixWorld();
      const ndc = target.clone().project(probe);
      if (Math.abs(ndc.x) > 0.7 || Math.abs(ndc.y) > 0.75 || ndc.z > 1) continue;
      probeRay.set(probe.position, target.clone().sub(probe.position).normalize());
      const hit = probeRay.intersectObjects(scene.children, true)
        .find(h => h.object.isMesh && !h.object.userData.passThrough && visibleChain(h.object));
      let o = hit && hit.object;
      while (o && o !== goal) o = o.parent;
      if (o === goal) { best = a; break; }
    }
    cam.ta = best;
    cam.tlook = lookY;
    cam.tfov = 40;
    pointer.over = false;
    if (goal !== rec.obj) rec.container.flash = 2.4;
    else rec.obj.userData.sparkle.userData.hint = 2.4;
  }

  function screenPos(id) {
    const rec = artifactObjs[id];
    if (!rec || !camera) return { x: 0.5, y: 0.5 };
    rec.obj.getWorldPosition(v3);
    v3.project(camera);
    return { x: (v3.x + 1) / 2, y: (1 - v3.y) / 2 };
  }

  // On-screen buttons: turn (or peek around, in close-up) and zoom.
  function nudge(da) {
    cam.ta = null;
    if (insp.active) insp.yaw = Math.min(1.1, Math.max(-1.1, insp.yaw + da));
    else cam.a += da;
  }
  function zoom(dfov) {
    cam.tfov = null;
    cam.fov = Math.min(60, Math.max(22, cam.fov + dfov));
  }

  function setActive(on) {
    active = on;
    last = performance.now();
    if (on) resize();
  }

  return { supported, init, loadRegion, markFound, hint, screenPos, setActive, nudge, zoom, exitInspect };
})();
