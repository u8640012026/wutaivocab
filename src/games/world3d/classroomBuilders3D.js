import * as THREE from 'three';
import { createStylizedCharacter } from './townBuilders3D';

/**
 * Procedural 3D Classroom Interior Builder (霧臺國小教室).
 * Uses inward-facing single-sided walls so 3rd-person orbit camera
 * can always see into the room cleanly without wall occlusion.
 */

function createBlackboardTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 320;
  const ctx = canvas.getContext('2d');

  // Slate chalkboard green
  ctx.fillStyle = '#14532d';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Subtle chalk smudge
  ctx.fillStyle = 'rgba(255,255,255,0.04)';
  ctx.fillRect(40, 30, 944, 260);

  ctx.textAlign = 'center';
  ctx.fillStyle = '#fef08a';
  ctx.font = 'bold 42px sans-serif';
  ctx.fillText('Wutai Elementary School  •  English Class', 512, 84);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 34px sans-serif';
  ctx.fillText('"Good morning! How are you today?"', 512, 165);

  ctx.fillStyle = '#a7f3d0';
  ctx.font = 'bold 26px sans-serif';
  ctx.fillText('★ Listen, Speak & Explore Wutai Town! ★', 512, 238);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function buildClassroomInterior(manifest, envRefs, isDark) {
  const group = new THREE.Group();
  const groundTargets = [];
  const boxColliders = [];
  const interactiveMeshes = [];

  const { width: rw, depth: rd, height: rh } = manifest.roomSize;
  const halfW = rw / 2;
  const halfD = rd / 2;

  // Classroom overhead point lights (bright in day, cozy warm glow at night)
  const roomLightA = new THREE.PointLight(0xfffbeb, isDark ? 2.4 : 1.1, 24, 1.2);
  roomLightA.position.set(-2.8, rh - 0.5, -1.5);
  const roomLightB = new THREE.PointLight(0xfffbeb, isDark ? 2.4 : 1.1, 24, 1.2);
  roomLightB.position.set(2.8, rh - 0.5, 2.0);
  group.add(roomLightA, roomLightB);
  envRefs.lampLights.push(roomLightA, roomLightB);

  // 1. Warm Wooden Classroom Floor
  const floorGeo = new THREE.PlaneGeometry(rw, rd);
  floorGeo.rotateX(-Math.PI / 2);
  const floorMat = new THREE.MeshStandardMaterial({ color: 0xd9a066, roughness: 0.78 });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.receiveShadow = true;
  floor.name = 'walkable_ground';
  group.add(floor);
  groundTargets.push(floor);

  // Subtle wood plank lines
  const plankMat = new THREE.MeshBasicMaterial({ color: 0xb47b44, transparent: true, opacity: 0.35 });
  for (let z = -halfD + 1; z < halfD; z += 1.4) {
    const line = new THREE.Mesh(new THREE.PlaneGeometry(rw - 0.2, 0.04), plankMat);
    line.rotation.x = -Math.PI / 2;
    line.position.set(0, 0.008, z);
    group.add(line);
  }

  // 2. Inward-facing single-sided walls (never block 3rd-person orbit camera!)
  const wallMat = new THREE.MeshStandardMaterial({
    color: 0xf1f5f9,
    roughness: 0.88,
    side: THREE.FrontSide
  });
  const wainscotMat = new THREE.MeshStandardMaterial({
    color: 0xa7f3d0,
    roughness: 0.85,
    side: THREE.FrontSide
  });

  const addInwardWall = (w, h, pos, rotY) => {
    const upper = new THREE.Mesh(new THREE.PlaneGeometry(w, h), wallMat);
    upper.position.set(pos[0], h / 2, pos[2]);
    upper.rotation.y = rotY;
    upper.receiveShadow = true;
    group.add(upper);

    const lower = new THREE.Mesh(new THREE.PlaneGeometry(w, 1.1), wainscotMat);
    lower.position.set(pos[0], 0.55, pos[2]);
    // Nudge 1cm inward so there's zero z-fighting
    lower.position.x += Math.sin(rotY) * 0.015;
    lower.position.z += Math.cos(rotY) * 0.015;
    lower.rotation.y = rotY;
    group.add(lower);
  };

  addInwardWall(rw, rh, [0, 0, -halfD], 0);              // North (Blackboard wall)
  addInwardWall(rw, rh, [0, 0, halfD], Math.PI);         // South (Exit door wall)
  addInwardWall(rd, rh, [-halfW, 0, 0], Math.PI / 2);    // West (Window wall)
  addInwardWall(rd, rh, [halfW, 0, 0], -Math.PI / 2);    // East (Bulletin wall)

  // 3. Large Classroom Windows on Left Wall (Sky-reactive Day/Night)
  const paneMat = new THREE.MeshStandardMaterial({
    color: 0xbae6fd,
    emissive: isDark ? 0x1e3a8a : 0x7dd3fc,
    emissiveIntensity: isDark ? 0.5 : 0.65,
    roughness: 0.15
  });
  envRefs.windowMats.push(paneMat);
  const frameMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.7 });

  manifest.windows.forEach((win) => {
    const wGroup = new THREE.Group();
    wGroup.position.set(-halfW + 0.05, 2.45, win.z);
    wGroup.rotation.y = Math.PI / 2;

    const glass = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.75, 0.08), paneMat);
    wGroup.add(glass);

    // Mullion bars & sill
    const sill = new THREE.Mesh(new THREE.BoxGeometry(2.65, 0.14, 0.28), frameMat);
    sill.position.y = -0.92;
    const barV = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.75, 0.12), frameMat);
    const barH = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.08, 0.12), frameMat);
    wGroup.add(sill, barV, barH);
    group.add(wGroup);
  });

  // 4. Front Blackboard (Clickable to hear greeting!)
  const bb = manifest.blackboard;
  const bbFrame = new THREE.Mesh(
    new THREE.BoxGeometry(bb.width + 0.28, bb.height + 0.28, 0.14),
    frameMat
  );
  bbFrame.position.set(bb.position[0], bb.position[1], bb.position[2]);
  bbFrame.userData = { actionType: 'blackboard', textEn: bb.greetingEn };
  group.add(bbFrame);
  interactiveMeshes.push(bbFrame);

  const bbFace = new THREE.Mesh(
    new THREE.PlaneGeometry(bb.width, bb.height),
    new THREE.MeshBasicMaterial({ map: createBlackboardTexture() })
  );
  bbFace.position.set(bb.position[0], bb.position[1], bb.position[2] + 0.08);
  bbFace.userData = { actionType: 'blackboard', textEn: bb.greetingEn };
  group.add(bbFace);
  interactiveMeshes.push(bbFace);

  // Chalk Tray
  const tray = new THREE.Mesh(new THREE.BoxGeometry(bb.width * 0.7, 0.08, 0.22), frameMat);
  tray.position.set(bb.position[0], bb.position[1] - bb.height / 2 - 0.05, bb.position[2] + 0.16);
  group.add(tray);

  // Wall Clock above Blackboard
  const clockFrame = new THREE.Mesh(
    new THREE.CylinderGeometry(0.42, 0.42, 0.1, 20),
    new THREE.MeshStandardMaterial({ color: 0x334155 })
  );
  clockFrame.rotation.x = Math.PI / 2;
  clockFrame.position.set(0, 3.95, -halfD + 0.08);
  const clockFace = new THREE.Mesh(
    new THREE.CircleGeometry(0.35, 20),
    new THREE.MeshBasicMaterial({ color: 0xffffff })
  );
  clockFace.position.set(0, 3.95, -halfD + 0.14);
  const handHour = new THREE.Mesh(
    new THREE.BoxGeometry(0.04, 0.18, 0.02),
    new THREE.MeshBasicMaterial({ color: 0x0f172a })
  );
  handHour.position.set(0, 4.01, -halfD + 0.15);
  const handMin = new THREE.Mesh(
    new THREE.BoxGeometry(0.03, 0.26, 0.02),
    new THREE.MeshBasicMaterial({ color: 0xef4444 })
  );
  handMin.position.set(0.08, 3.95, -halfD + 0.155);
  handMin.rotation.z = -Math.PI / 2;
  group.add(clockFrame, clockFace, handHour, handMin);

  // 5. Raised Wooden Podium + Teacher's Desk & Props
  const { stagePos, stageSize, deskPos, deskSize } = manifest.podium;
  const stageMesh = new THREE.Mesh(
    new THREE.BoxGeometry(stageSize[0], stageSize[1], stageSize[2]),
    new THREE.MeshStandardMaterial({ color: 0x9a6332, roughness: 0.8 })
  );
  stageMesh.position.set(stagePos[0], stageSize[1] / 2, stagePos[1]);
  stageMesh.receiveShadow = true;
  group.add(stageMesh);

  const teacherDesk = new THREE.Mesh(
    new THREE.BoxGeometry(deskSize[0], deskSize[1], deskSize[2]),
    new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.72 })
  );
  teacherDesk.position.set(deskPos[0], stageSize[1] + deskSize[1] / 2, deskPos[1]);
  teacherDesk.castShadow = true;
  group.add(teacherDesk);
  boxColliders.push({
    minX: deskPos[0] - deskSize[0] / 2,
    maxX: deskPos[0] + deskSize[0] / 2,
    minZ: deskPos[1] - deskSize[2] / 2,
    maxZ: deskPos[1] + deskSize[2] / 2
  });

  // Props on Teacher's Desk (Book stack + Red Apple + Mini Globe)
  const bookStack = new THREE.Mesh(
    new THREE.BoxGeometry(0.36, 0.16, 0.28),
    new THREE.MeshStandardMaterial({ color: 0x2563eb })
  );
  bookStack.position.set(deskPos[0] - 0.5, stageSize[1] + deskSize[1] + 0.08, deskPos[1]);
  const apple = new THREE.Mesh(
    new THREE.SphereGeometry(0.11, 10, 10),
    new THREE.MeshStandardMaterial({ color: 0xef4444 })
  );
  apple.position.set(deskPos[0] + 0.45, stageSize[1] + deskSize[1] + 0.11, deskPos[1] + 0.1);
  const globe = new THREE.Mesh(
    new THREE.SphereGeometry(0.18, 12, 12),
    new THREE.MeshStandardMaterial({ color: 0x0ea5e9 })
  );
  globe.position.set(deskPos[0] + 0.1, stageSize[1] + deskSize[1] + 0.22, deskPos[1] - 0.1);
  group.add(bookStack, apple, globe);

  // 6. Classroom Bookshelf (Back-right corner)
  const bs = manifest.bookshelf;
  const shelfMesh = new THREE.Mesh(
    new THREE.BoxGeometry(bs.size[0], bs.size[1], bs.size[2]),
    new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.8 })
  );
  shelfMesh.position.set(bs.position[0], bs.size[1] / 2, bs.position[1]);
  shelfMesh.castShadow = true;
  group.add(shelfMesh);
  boxColliders.push({
    minX: bs.position[0] - bs.size[0] / 2,
    maxX: bs.position[0] + bs.size[0] / 2,
    minZ: bs.position[1] - bs.size[2] / 2,
    maxZ: bs.position[1] + bs.size[2] / 2
  });

  // Colorful books inside shelf
  const bookColors = [0xef4444, 0x3b82f6, 0x10b981, 0xf59e0b, 0x8b5cf6];
  bookColors.forEach((col, i) => {
    const bMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.24, 0.34, 0.24),
      new THREE.MeshStandardMaterial({ color: col })
    );
    bMesh.position.set(bs.position[0] - 0.65 + i * 0.32, 1.35, bs.position[1] + 0.25);
    group.add(bMesh);
  });

  // 7. Right Wall Bulletin Board with Colorful Posters
  const bb2 = manifest.bulletinBoard;
  const corkBoard = new THREE.Mesh(
    new THREE.BoxGeometry(0.1, bb2.height, bb2.width),
    new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.9 })
  );
  corkBoard.position.set(bb2.position[0], bb2.position[1], bb2.position[2]);
  group.add(corkBoard);

  [0x38bdf8, 0xf472b6, 0x34d399].forEach((pCol, idx) => {
    const poster = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.9, 0.85),
      new THREE.MeshStandardMaterial({ color: pCol })
    );
    poster.position.set(bb2.position[0] - 0.02, bb2.position[1] + (idx === 1 ? -0.1 : 0.1), -1.2 + idx * 1.2);
    group.add(poster);
  });

  // 8. 9 Student Desks + Interactive Seats
  const woodTopMat = new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.65 });
  const metalLegMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.5 });
  const chairSeatMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.7 });
  const seats = [];

  manifest.desks.forEach((d) => {
    const [dx, dz] = d.deskPos;
    const [dw, dh, dd] = d.deskSize;

    // Desk top
    const top = new THREE.Mesh(new THREE.BoxGeometry(dw, 0.1, dd), woodTopMat);
    top.position.set(dx, dh, dz);
    top.castShadow = true;
    top.receiveShadow = true;
    group.add(top);

    // 4 Desk legs
    [[-dw * 0.42, -dd * 0.38], [dw * 0.42, -dd * 0.38], [-dw * 0.42, dd * 0.38], [dw * 0.42, dd * 0.38]].forEach(([lx, lz]) => {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.08, dh, 0.08), metalLegMat);
      leg.position.set(dx + lx, dh / 2, dz + lz);
      group.add(leg);
    });

    // Textbook prop on desk
    const notebook = new THREE.Mesh(
      new THREE.BoxGeometry(0.36, 0.04, 0.28),
      new THREE.MeshStandardMaterial({ color: 0xfef3c7 })
    );
    notebook.position.set(dx - 0.15, dh + 0.07, dz);
    group.add(notebook);

    // Desk collider (keep chair clearance free so player can approach & sit)
    boxColliders.push({
      minX: dx - dw / 2,
      maxX: dx + dw / 2,
      minZ: dz - dd / 2,
      maxZ: dz + dd / 2
    });

    // Student Chair
    const [sx, sz] = d.seatPos;
    const chairGroup = new THREE.Group();
    chairGroup.position.set(sx, 0, sz);

    const seatMesh = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.09, 0.52), chairSeatMat);
    seatMesh.position.y = d.seatHeight;
    seatMesh.castShadow = true;
    seatMesh.userData = { seatId: d.id };
    chairGroup.add(seatMesh);
    interactiveMeshes.push(seatMesh);

    const backrest = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.48, 0.08), chairSeatMat);
    backrest.position.set(0, d.seatHeight + 0.25, 0.24);
    backrest.userData = { seatId: d.id };
    chairGroup.add(backrest);
    interactiveMeshes.push(backrest);

    [[-0.22, -0.2], [0.22, -0.2], [-0.22, 0.2], [0.22, 0.2]].forEach(([clx, clz]) => {
      const cLeg = new THREE.Mesh(new THREE.BoxGeometry(0.06, d.seatHeight, 0.06), metalLegMat);
      cLeg.position.set(clx, d.seatHeight / 2, clz);
      chairGroup.add(cLeg);
    });

    group.add(chairGroup);
    seats.push({
      id: d.id,
      label: d.label,
      position: [sx, sz],
      yaw: d.seatYaw,
      seatHeight: d.seatHeight
    });
  });

  // 9. Classroom Exit Door (inward-facing plane so 3rd-person camera behind wall is never occluded) + Glowing Floor Mat
  const exit = manifest.exitDoor;
  const doorFrame = new THREE.Mesh(
    new THREE.PlaneGeometry(2.2, 2.75),
    new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.75, side: THREE.FrontSide })
  );
  doorFrame.position.set(exit.position[0], 1.375, halfD - 0.025);
  doorFrame.rotation.y = Math.PI;
  doorFrame.userData = { actionType: 'exit_indoor' };
  group.add(doorFrame);
  interactiveMeshes.push(doorFrame);

  const doorKnob = new THREE.Mesh(
    new THREE.CircleGeometry(0.08, 12),
    new THREE.MeshBasicMaterial({ color: 0xfbbf24, side: THREE.FrontSide })
  );
  doorKnob.position.set(exit.position[0] - 0.78, 1.28, halfD - 0.03);
  doorKnob.rotation.y = Math.PI;
  group.add(doorKnob);

  const exitMatGeo = new THREE.RingGeometry(0.85, 1.3, 28);
  exitMatGeo.rotateX(-Math.PI / 2);
  const exitMat = new THREE.Mesh(
    exitMatGeo,
    new THREE.MeshBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.78, side: THREE.DoubleSide })
  );
  exitMat.position.set(exit.position[0], 0.05, exit.position[1]);
  exitMat.userData = { actionType: 'exit_indoor' };
  group.add(exitMat);
  interactiveMeshes.push(exitMat);

  // 10. Patrolling Principal NPC inside the classroom
  const pCfg = manifest.principalNpc;
  const principalGroup = new THREE.Group();
  principalGroup.position.set(pCfg.startPosition[0], 0, pCfg.startPosition[1]);

  const pRingGeo = new THREE.RingGeometry(pCfg.triggerRadius - 0.24, pCfg.triggerRadius, 32);
  pRingGeo.rotateX(-Math.PI / 2);
  const pRing = new THREE.Mesh(
    pRingGeo,
    new THREE.MeshBasicMaterial({ color: 0x34d399, transparent: true, opacity: 0.65, side: THREE.DoubleSide })
  );
  pRing.position.y = 0.06;
  principalGroup.add(pRing);

  const principalMesh = createStylizedCharacter({
    bodyColor: pCfg.bodyColor,
    headColor: pCfg.headColor,
    accentColor: pCfg.accentColor,
    hasHat: true,
    locationId: pCfg.locationId
  });
  principalGroup.add(principalMesh);
  principalMesh.traverse((obj) => {
    if (obj.isMesh) {
      obj.userData = { locationId: pCfg.locationId };
      interactiveMeshes.push(obj);
    }
  });
  group.add(principalGroup);

  return {
    group,
    groundTargets,
    boxColliders,
    interactiveMeshes,
    seats,
    exitMat,
    principal: {
      cfg: pCfg,
      group: principalGroup,
      mesh: principalMesh,
      ring: pRing
    }
  };
}
