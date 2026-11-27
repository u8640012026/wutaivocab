import * as THREE from 'three';

/**
 * Procedural low-poly Three.js builders for Wutai Town 3D.
 * Separated from World3DCanvas so visual packs or GLTFLoader meshes
 * can be swapped cleanly in the future.
 */

export function createEnvironmentLighting(scene, isDark) {
  const hemi = new THREE.HemisphereLight(0xdbeafe, 0x365314, 1.0);
  scene.add(hemi);

  const sun = new THREE.DirectionalLight(0xfffbeb, 1.45);
  sun.position.set(28, 42, 22);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.near = 5;
  sun.shadow.camera.far = 110;
  const d = 42;
  sun.shadow.camera.left = -d;
  sun.shadow.camera.right = d;
  sun.shadow.camera.top = d;
  sun.shadow.camera.bottom = -d;
  sun.shadow.bias = -0.0008;
  scene.add(sun);

  // Subtle celestial body (Sun / Moon)
  const orbGeo = new THREE.SphereGeometry(3.2, 16, 16);
  const orbMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
  const celestialOrb = new THREE.Mesh(orbGeo, orbMat);
  celestialOrb.position.set(36, 48, -42);
  scene.add(celestialOrb);

  // Starfield for night mode
  const starCount = 260;
  const starPositions = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI * 0.42;
    const r = 82;
    starPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    starPositions[i * 3 + 1] = r * Math.cos(phi) + 8;
    starPositions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
  const starMat = new THREE.PointsMaterial({
    color: 0xf8fafc,
    size: 0.65,
    transparent: true,
    opacity: isDark ? 0.9 : 0.0
  });
  const stars = new THREE.Points(starGeo, starMat);
  scene.add(stars);

  const refs = { scene, hemi, sun, celestialOrb, stars, windowMats: [], lampLights: [] };
  applyDayNightTheme(refs, isDark);
  return refs;
}

export function applyDayNightTheme(envRefs, isDark) {
  if (!envRefs) return;
  const { scene, hemi, sun, celestialOrb, stars, windowMats, lampLights } = envRefs;

  if (isDark) {
    scene.background = new THREE.Color(0x0b1224);
    scene.fog = new THREE.FogExp2(0x0b1224, 0.011);
    hemi.color.setHex(0x64748b);
    hemi.groundColor.setHex(0x0f172a);
    hemi.intensity = 0.65;
    sun.color.setHex(0x93c5fd);
    sun.intensity = 0.72;
    sun.position.set(-22, 36, -24);
    celestialOrb.material.color.setHex(0xfef9c3);
    celestialOrb.position.set(-34, 42, -45);
    stars.material.opacity = 0.92;
  } else {
    scene.background = new THREE.Color(0x87ceeb);
    scene.fog = new THREE.FogExp2(0xbae6fd, 0.0085);
    hemi.color.setHex(0xe0f2fe);
    hemi.groundColor.setHex(0x4d7c0f);
    hemi.intensity = 1.05;
    sun.color.setHex(0xfffbeb);
    sun.intensity = 1.45;
    sun.position.set(28, 42, 22);
    celestialOrb.material.color.setHex(0xfde047);
    celestialOrb.position.set(36, 48, -42);
    stars.material.opacity = 0.0;
  }

  windowMats.forEach((mat) => {
    mat.emissive.setHex(isDark ? 0xfbbf24 : 0x38bdf8);
    mat.emissiveIntensity = isDark ? 1.15 : 0.15;
  });

  lampLights.forEach((light) => {
    light.intensity = isDark ? 1.9 : 0.0;
  });
}

export function buildTerrainAndScenery(world, envRefs) {
  const group = new THREE.Group();
  const groundTargets = [];

  // 1. Grass base disc
  const groundGeo = new THREE.CircleGeometry(world.worldRadius + 14, 48);
  groundGeo.rotateX(-Math.PI / 2);
  const groundMat = new THREE.MeshStandardMaterial({
    color: 0x4d8b55,
    roughness: 0.92
  });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.receiveShadow = true;
  ground.name = 'walkable_ground';
  group.add(ground);
  groundTargets.push(ground);

  // 2. Central Slate Plaza (Rukai stone-slate aesthetic)
  const plazaGeo = new THREE.CylinderGeometry(7.2, 7.5, 0.12, 8);
  const plazaMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.85 });
  const plaza = new THREE.Mesh(plazaGeo, plazaMat);
  plaza.position.set(0, 0.04, 0);
  plaza.receiveShadow = true;
  group.add(plaza);
  groundTargets.push(plaza);

  const innerRingGeo = new THREE.RingGeometry(2.6, 3.3, 8);
  innerRingGeo.rotateX(-Math.PI / 2);
  const innerRingMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.7 });
  const innerRing = new THREE.Mesh(innerRingGeo, innerRingMat);
  innerRing.position.set(0, 0.11, 0);
  group.add(innerRing);

  // Center Lily Totem Pillar
  const totemBase = new THREE.Mesh(
    new THREE.CylinderGeometry(0.9, 1.2, 0.8, 8),
    new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.8 })
  );
  totemBase.position.set(0, 0.45, 0);
  totemBase.castShadow = true;
  group.add(totemBase);

  const totemPillar = new THREE.Mesh(
    new THREE.CylinderGeometry(0.45, 0.55, 2.4, 8),
    new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.65 })
  );
  totemPillar.position.set(0, 1.9, 0);
  totemPillar.castShadow = true;
  group.add(totemPillar);

  const totemCrown = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.65, 0),
    new THREE.MeshStandardMaterial({ color: 0xfef08a, emissive: 0xf59e0b, emissiveIntensity: 0.45 })
  );
  totemCrown.position.set(0, 3.55, 0);
  group.add(totemCrown);

  // 3. Stone Slate Roads
  const roadMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.9 });
  world.roads.forEach((road) => {
    const dx = road.to[0] - road.from[0];
    const dz = road.to[1] - road.from[1];
    const length = Math.hypot(dx, dz);
    const roadMesh = new THREE.Mesh(new THREE.BoxGeometry(road.width, 0.08, length), roadMat);
    roadMesh.position.set((road.from[0] + road.to[0]) / 2, 0.03, (road.from[1] + road.to[1]) / 2);
    roadMesh.rotation.y = Math.atan2(dx, dz);
    roadMesh.receiveShadow = true;
    group.add(roadMesh);
    groundTargets.push(roadMesh);
  });

  // 4. Dawu Mountain Ring around the perimeter
  const mountainMatA = new THREE.MeshStandardMaterial({ color: 0x1e4d3b, roughness: 0.95, flatShading: true });
  const mountainMatB = new THREE.MeshStandardMaterial({ color: 0x14532d, roughness: 0.95, flatShading: true });
  const peakCount = 22;
  for (let i = 0; i < peakCount; i++) {
    const angle = (i / peakCount) * Math.PI * 2;
    const dist = world.worldRadius + 10 + (i % 3) * 4;
    const height = 14 + (i % 4) * 5.5;
    const radius = 10 + (i % 3) * 3.5;
    const cone = new THREE.Mesh(
      new THREE.ConeGeometry(radius, height, 6),
      i % 2 === 0 ? mountainMatA : mountainMatB
    );
    cone.position.set(Math.cos(angle) * dist, height / 2 - 0.5, Math.sin(angle) * dist);
    cone.rotation.y = angle * 0.7;
    group.add(cone);
  }

  // 5. Stylized Trees & Streetlamps
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 });
  const leafMatA = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.85, flatShading: true });
  const leafMatB = new THREE.MeshStandardMaterial({ color: 0xf472b6, roughness: 0.8, flatShading: true }); // Mountain cherry accents

  world.trees.forEach(([tx, tz], idx) => {
    const tree = new THREE.Group();
    tree.position.set(tx, 0, tz);

    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.32, 1.8, 6), trunkMat);
    trunk.position.y = 0.9;
    trunk.castShadow = true;
    tree.add(trunk);

    const isSakura = idx % 4 === 1;
    const canopyMat = isSakura ? leafMatB : leafMatA;
    const crown1 = new THREE.Mesh(new THREE.ConeGeometry(1.45, 2.3, 7), canopyMat);
    crown1.position.y = 2.45;
    crown1.castShadow = true;
    tree.add(crown1);

    const crown2 = new THREE.Mesh(new THREE.ConeGeometry(1.05, 1.75, 7), canopyMat);
    crown2.position.y = 3.5;
    crown2.castShadow = true;
    tree.add(crown2);

    group.add(tree);
  });

  // Plaza Corner Lanterns
  const lampOffsets = [[-5.5, -5.5], [5.5, -5.5], [-5.5, 5.5], [5.5, 5.5]];
  lampOffsets.forEach(([lx, lz]) => {
    const post = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.14, 3.2, 6),
      new THREE.MeshStandardMaterial({ color: 0x334155 })
    );
    post.position.set(lx, 1.6, lz);
    post.castShadow = true;
    group.add(post);

    const bulbMat = new THREE.MeshStandardMaterial({
      color: 0xfef3c7,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.5
    });
    envRefs.windowMats.push(bulbMat);
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.28, 10, 10), bulbMat);
    bulb.position.set(lx, 3.3, lz);
    group.add(bulb);

    const ptLight = new THREE.PointLight(0xfbbf24, 0, 16, 1.6);
    ptLight.position.set(lx, 3.2, lz);
    group.add(ptLight);
    envRefs.lampLights.push(ptLight);
  });

  return { group, groundTargets, totemCrown };
}

export function buildLandmarkBuilding(cfg, envRefs) {
  const [w, h, d] = cfg.size;
  const building = new THREE.Group();
  building.position.set(cfg.position[0], 0, cfg.position[1]);
  building.rotation.y = cfg.rotationY || 0;
  building.userData = { locationId: cfg.locationId };

  // Main body
  const wallMat = new THREE.MeshStandardMaterial({ color: cfg.wallColor, roughness: 0.8 });
  const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), wallMat);
  body.position.y = h / 2;
  body.castShadow = true;
  body.receiveShadow = true;
  body.userData = { locationId: cfg.locationId };
  building.add(body);

  // Pitched / Stepped Roof
  const roofMat = new THREE.MeshStandardMaterial({ color: cfg.roofColor, roughness: 0.7 });
  const roof = new THREE.Mesh(new THREE.ConeGeometry(Math.max(w, d) * 0.74, 2.2, 4), roofMat);
  roof.position.y = h + 1.05;
  roof.rotation.y = Math.PI / 4;
  roof.castShadow = true;
  roof.userData = { locationId: cfg.locationId };
  building.add(roof);

  // Entrance Door
  const doorMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.85 });
  const door = new THREE.Mesh(new THREE.BoxGeometry(1.4, 2.2, 0.18), doorMat);
  door.position.set(0, 1.1, d / 2 + 0.05);
  building.add(door);

  // Glowing Windows (react to Day/Night)
  const winMat = new THREE.MeshStandardMaterial({
    color: 0xe0f2fe,
    emissive: 0xfbbf24,
    emissiveIntensity: 0.2,
    roughness: 0.2
  });
  envRefs.windowMats.push(winMat);

  [-w * 0.28, w * 0.28].forEach((wx) => {
    const win = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.1, 0.16), winMat);
    win.position.set(wx, h * 0.56, d / 2 + 0.04);
    building.add(win);
  });

  // Style-specific props for instant landmark silhouette recognition
  const trimMat = new THREE.MeshStandardMaterial({ color: cfg.trimColor, roughness: 0.5 });

  if (cfg.style === 'school') {
    // Clock tower spire
    const tower = new THREE.Mesh(new THREE.BoxGeometry(2.0, 2.4, 2.0), wallMat);
    tower.position.set(0, h + 1.8, 0);
    tower.castShadow = true;
    building.add(tower);

    const clockFace = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 0.15, 16), winMat);
    clockFace.rotation.x = Math.PI / 2;
    clockFace.position.set(0, h + 2.0, 1.02);
    building.add(clockFace);
  } else if (cfg.style === 'clinic') {
    // Medical Cross sign on front roof
    const crossV = new THREE.Mesh(new THREE.BoxGeometry(0.42, 1.3, 0.2), new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xef4444, emissiveIntensity: 0.35 }));
    const crossH = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.42, 0.2), new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xef4444, emissiveIntensity: 0.35 }));
    crossV.position.set(0, h + 0.3, d / 2 + 0.15);
    crossH.position.set(0, h + 0.3, d / 2 + 0.15);
    building.add(crossV, crossH);
  } else if (cfg.style === 'supermarket' || cfg.style === 'bookstore') {
    // Front Awning
    const awning = new THREE.Mesh(new THREE.BoxGeometry(w * 0.86, 0.3, 1.4), trimMat);
    awning.position.set(0, 2.6, d / 2 + 0.65);
    awning.rotation.x = 0.22;
    awning.castShadow = true;
    building.add(awning);
  } else if (cfg.style === 'cinema') {
    // Glowing Marquee Sign
    const marquee = new THREE.Mesh(
      new THREE.BoxGeometry(w * 0.78, 1.0, 0.5),
      new THREE.MeshStandardMaterial({ color: 0xfbbf24, emissive: 0xf59e0b, emissiveIntensity: 0.6 })
    );
    marquee.position.set(0, h - 0.5, d / 2 + 0.35);
    building.add(marquee);
  } else if (cfg.style === 'plaza') {
    // Twin Rukai Slate Pillars flanking entrance
    [-2.4, 2.4].forEach((px) => {
      const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.38, 3.6, 6), trimMat);
      pillar.position.set(px, 1.8, d / 2 + 0.9);
      pillar.castShadow = true;
      building.add(pillar);
    });
  } else if (cfg.style === 'home') {
    // Cozy Chimney
    const chimney = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.8, 0.8), new THREE.MeshStandardMaterial({ color: 0x9a3412 }));
    chimney.position.set(w * 0.25, h + 1.4, -0.5);
    building.add(chimney);
  }

  return building;
}

export function buildNpcAndTrigger(cfg, isTeacherHere) {
  const group = new THREE.Group();
  const [nx, nz] = cfg.npcPosition;
  group.position.set(nx, 0, nz);

  // Glowing ground interaction ring
  const ringGeo = new THREE.RingGeometry(cfg.triggerRadius - 0.28, cfg.triggerRadius, 32);
  ringGeo.rotateX(-Math.PI / 2);
  const ringMat = new THREE.MeshBasicMaterial({
    color: isTeacherHere ? 0xf59e0b : 0x34d399,
    transparent: true,
    opacity: 0.55,
    side: THREE.DoubleSide
  });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.position.y = 0.08;
  group.add(ring);

  // Primary Location NPC
  const npcMesh = createStylizedCharacter({
    bodyColor: cfg.npcBodyColor,
    headColor: cfg.npcHeadColor,
    accentColor: cfg.trimColor,
    hasHat: cfg.style === 'school' || cfg.style === 'station',
    locationId: cfg.locationId
  });
  npcMesh.position.set(0, 0, 0);
  // Face toward plaza center initially
  npcMesh.rotation.y = Math.atan2(-nx, -nz);
  group.add(npcMesh);

  let teacherMesh = null;
  if (isTeacherHere) {
    teacherMesh = createStylizedCharacter({
      bodyColor: 0xf59e0b,
      headColor: 0xfef3c7,
      accentColor: 0xfef08a,
      hasHat: true,
      locationId: cfg.locationId
    });
    teacherMesh.position.set(1.35, 0, 0.35);
    teacherMesh.rotation.y = Math.atan2(-nx, -nz);
    group.add(teacherMesh);
  }

  return { group, ring, npcMesh, teacherMesh };
}

export function createStylizedCharacter({
  bodyColor = 0x10b981,
  headColor = 0xfde68a,
  accentColor = 0x38bdf8,
  hasHat = true,
  hasBackpack = false,
  locationId = null
}) {
  const char = new THREE.Group();
  char.userData = { locationId };

  const legMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });
  const bodyMat = new THREE.MeshStandardMaterial({ color: bodyColor, roughness: 0.65 });
  const headMat = new THREE.MeshStandardMaterial({ color: headColor, roughness: 0.6 });
  const accentMat = new THREE.MeshStandardMaterial({ color: accentColor, roughness: 0.55 });

  // Left & Right Legs (pivoted near hip for walking animation)
  const leftLeg = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.62, 0.24), legMat);
  leftLeg.position.set(-0.16, 0.31, 0);
  leftLeg.castShadow = true;

  const rightLeg = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.62, 0.24), legMat);
  rightLeg.position.set(0.16, 0.31, 0);
  rightLeg.castShadow = true;

  // Torso
  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.72, 0.38), bodyMat);
  torso.position.set(0, 0.96, 0);
  torso.castShadow = true;

  // Left & Right Arms
  const leftArm = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.6, 0.2), bodyMat);
  leftArm.position.set(-0.44, 0.96, 0);
  leftArm.castShadow = true;

  const rightArm = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.6, 0.2), bodyMat);
  rightArm.position.set(0.44, 0.96, 0);
  rightArm.castShadow = true;

  // Head
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.32, 14, 14), headMat);
  head.position.set(0, 1.62, 0);
  head.castShadow = true;

  // Eyes (facing +Z local forward)
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });
  const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), eyeMat);
  eyeL.position.set(-0.11, 1.66, 0.28);
  const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), eyeMat);
  eyeR.position.set(0.11, 1.66, 0.28);

  char.add(leftLeg, rightLeg, torso, leftArm, rightArm, head, eyeL, eyeR);

  if (hasHat) {
    const hat = new THREE.Mesh(new THREE.ConeGeometry(0.36, 0.28, 8), accentMat);
    hat.position.set(0, 1.98, 0);
    hat.castShadow = true;
    char.add(hat);
  }

  if (hasBackpack) {
    const pack = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.54, 0.24), accentMat);
    pack.position.set(0, 0.98, -0.28);
    pack.castShadow = true;
    char.add(pack);
  }

  // Tag clickable parts
  if (locationId) {
    char.traverse((obj) => {
      if (obj.isMesh) obj.userData = { locationId };
    });
  }

  char.userData.limbs = { leftLeg, rightLeg, leftArm, rightArm };
  return char;
}

export function disposeObject3D(root) {
  if (!root) return;
  root.traverse((obj) => {
    if (obj.geometry) obj.geometry.dispose();
    if (obj.material) {
      if (Array.isArray(obj.material)) {
        obj.material.forEach((m) => m?.dispose?.());
      } else {
        obj.material.dispose?.();
      }
    }
  });
}
