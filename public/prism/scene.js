import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

const hero = document.querySelector(".hero");
const canvas = document.querySelector(".hero-canvas");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "low-power" });
} catch (e) {
  renderer = null;
}

if (renderer) {
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
  camera.position.set(0, 0, 14);

  scene.add(new THREE.AmbientLight(0xd9c4ff, 0.9));
  const key = new THREE.DirectionalLight(0xffffff, 2.2);
  key.position.set(2, 8, 6);
  scene.add(key);
  const rim = new THREE.PointLight(0xb9f36c, 30, 30);
  rim.position.set(-5, -3, 4);
  scene.add(rim);
  const fill = new THREE.PointLight(0x7b3fe4, 60, 40);
  fill.position.set(4, 2, -2);
  scene.add(fill);

  const lilac = (c, o = 0.88) =>
    new THREE.MeshStandardMaterial({ color: c, flatShading: true, roughness: 0.25, metalness: 0.1, transparent: true, opacity: o, emissive: c, emissiveIntensity: 0.12 });

  const shapes = [
    { g: new THREE.OctahedronGeometry(0.9), m: lilac(0xe6d6ff), p: [1.2, 2.6, 0], s: 1 },
    { g: new THREE.CylinderGeometry(0.28, 0.28, 2.4, 6), m: lilac(0xc9a7ff), p: [4.6, 2.4, -1], s: 1, r: [0.3, 0, 1.2] },
    { g: new THREE.OctahedronGeometry(0.7), m: lilac(0xb48cf5), p: [5.2, -0.6, 0.5], s: [0.7, 1.6, 0.7] },
    { g: new THREE.IcosahedronGeometry(0.75), m: lilac(0xd8c2ff), p: [2.2, -2.4, 1], s: 1 },
    { g: new THREE.BoxGeometry(1.1, 0.3, 1.1), m: lilac(0xb9f36c, 0.95), p: [3.6, -3.4, 0.6], s: 1, r: [0.5, 0.6, 0.2] },
    { g: new THREE.TetrahedronGeometry(0.6), m: lilac(0xe6d6ff), p: [6.4, 1.2, -2], s: 1 },
    { g: new THREE.OctahedronGeometry(0.45), m: lilac(0xc9a7ff), p: [0.2, -0.6, -2.5], s: [0.7, 1.5, 0.7] },
    { g: new THREE.IcosahedronGeometry(0.4), m: lilac(0xb48cf5), p: [7.2, -2.6, -3], s: 1 },
  ];

  const group = new THREE.Group();
  scene.add(group);
  const crystals = shapes.map((d, i) => {
    const mesh = new THREE.Mesh(d.g, d.m);
    mesh.position.set(...d.p);
    if (Array.isArray(d.s)) mesh.scale.set(...d.s); else mesh.scale.setScalar(d.s);
    if (d.r) mesh.rotation.set(...d.r);
    const edges = new THREE.LineSegments(
      new THREE.EdgesGeometry(d.g),
      new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.35 })
    );
    mesh.add(edges);
    group.add(mesh);
    return { mesh, base: mesh.position.clone(), phase: i * 1.37, spin: 0.15 + (i % 3) * 0.08 };
  });

  const dust = new THREE.BufferGeometry();
  const count = 220;
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    pos[i * 3] = (Math.random() - 0.3) * 18;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 12;
    pos[i * 3 + 2] = (Math.random() - 0.5) * 8;
  }
  dust.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const motes = new THREE.Points(dust, new THREE.PointsMaterial({ color: 0xe6d6ff, size: 0.04, transparent: true, opacity: 0.6, depthWrite: false }));
  scene.add(motes);

  let mobile = false;
  function resize() {
    const w = hero.clientWidth, h = hero.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    mobile = w < 760;
    // On narrow screens the crystals sit above the text instead of beside it.
    group.position.set(mobile ? -1.85 : 0, mobile ? 3.0 : 0, 0);
    group.scale.setScalar(mobile ? 0.5 : 1);
  }
  resize();
  window.addEventListener("resize", resize);

  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  window.addEventListener("pointermove", (e) => {
    pointer.tx = (e.clientX / window.innerWidth - 0.5) * 2;
    pointer.ty = (e.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });

  const clock = new THREE.Clock();
  function frame() {
    const t = clock.getElapsedTime();
    pointer.x += (pointer.tx - pointer.x) * 0.04;
    pointer.y += (pointer.ty - pointer.y) * 0.04;
    const scroll = Math.min(window.scrollY / hero.clientHeight, 1);

    crystals.forEach((c) => {
      c.mesh.position.y = c.base.y + Math.sin(t * 0.6 + c.phase) * 0.22 + scroll * (1.5 + c.phase * 0.25);
      c.mesh.rotation.y += c.spin * 0.01;
      c.mesh.rotation.x = Math.sin(t * 0.3 + c.phase) * 0.25;
    });
    motes.rotation.y = t * 0.015;
    camera.position.x = pointer.x * 0.6;
    camera.position.y = -pointer.y * 0.4;
    camera.lookAt(mobile ? 0 : 1.5, 0, 0);
    renderer.render(scene, camera);
  }

  let running = false;
  let visible = true;
  function loop() {
    if (!running) return;
    frame();
    requestAnimationFrame(loop);
  }
  function update() {
    const should = visible && !document.hidden && !reduceMotion;
    if (should && !running) { running = true; requestAnimationFrame(loop); }
    if (!should) running = false;
  }
  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; update(); }).observe(hero);
  document.addEventListener("visibilitychange", update);

  frame();
  hero.classList.add("has-3d");
  update();
}
