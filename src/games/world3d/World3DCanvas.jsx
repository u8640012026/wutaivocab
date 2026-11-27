import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  createEnvironmentLighting,
  applyDayNightTheme,
  buildTerrainAndScenery,
  buildLandmarkBuilding,
  buildNpcAndTrigger,
  createStylizedCharacter,
  disposeObject3D
} from './townBuilders3D';

/**
 * Reusable 3D Interactive World Canvas Engine (Three.js).
 * Supports:
 * - 3rd-person chase orbit camera & 1st-person free-look camera
 * - Cinematic smooth camera focus during NPC dialogue
 * - WASD / Arrow keys + Virtual Joystick + Tap-to-Move on terrain / Tap-Building to approach & talk
 * - Screen-projected HTML markers for sharp bilingual landmark signs & prompt bubbles
 */
export const World3DCanvas = ({
  worldManifest,
  locationsById,
  visitingTeacherLocationId,
  hasMetTeacherToday,
  isDark,
  cameraMode = 'third',
  isDialogueOpen = false,
  activeLocationId = null,
  teleportRequest = null,
  joystickRef,
  onNearestLocationChange,
  onInteractLocation,
  onPositionUpdate
}) => {
  const mountRef = useRef(null);
  const [projectedLabels, setProjectedLabels] = useState([]);

  // Mutable refs read inside requestAnimationFrame without tearing down WebGL context
  const propsRef = useRef({
    cameraMode,
    isDialogueOpen,
    activeLocationId,
    onNearestLocationChange,
    onInteractLocation,
    onPositionUpdate
  });
  propsRef.current = {
    cameraMode,
    isDialogueOpen,
    activeLocationId,
    onNearestLocationChange,
    onInteractLocation,
    onPositionUpdate
  };

  const envRefsRef = useRef(null);
  const isDarkRef = useRef(isDark);
  isDarkRef.current = isDark;

  const playerStateRef = useRef({
    x: worldManifest.spawnPoint[0],
    z: worldManifest.spawnPoint[1],
    yaw: worldManifest.spawnYaw || 0,
    camYaw: worldManifest.spawnYaw || 0,
    camPitch: 0.34,
    camDistance: 9.5,
    walkPhase: 0,
    targetPoint: null, // { x, z, autoInteractLocationId? }
    nearestId: null
  });

  const walkToAndInteract = (locationId) => {
    const b = worldManifest.buildings.find((item) => item.locationId === locationId);
    if (!b) return;
    const st = playerStateRef.current;
    const distToNpc = Math.hypot(st.x - b.npcPosition[0], st.z - b.npcPosition[1]);
    if (distToNpc <= b.triggerRadius + 0.4) {
      onInteractLocation?.(locationId);
      return;
    }
    const dirLen = Math.hypot(b.npcPosition[0], b.npcPosition[1]) || 1;
    st.targetPoint = {
      x: b.npcPosition[0] - (b.npcPosition[0] / dirLen) * 1.9,
      z: b.npcPosition[1] - (b.npcPosition[1] / dirLen) * 1.9,
      autoInteractLocationId: locationId
    };
  };

  // React to Day / Night changes instantaneously
  useEffect(() => {
    if (envRefsRef.current) {
      applyDayNightTheme(envRefsRef.current, isDark);
    }
  }, [isDark]);

  // React to Quick Teleport requests from the Compass/Landmark drawer
  useEffect(() => {
    if (!teleportRequest) return;
    const b = worldManifest.buildings.find((item) => item.locationId === teleportRequest.locationId);
    if (!b) return;
    const [nx, nz] = b.npcPosition;
    // Land ~2.3m in front of NPC (toward plaza center)
    const dirLen = Math.hypot(nx, nz) || 1;
    const px = nx - (nx / dirLen) * 2.3;
    const pz = nz - (nz / dirLen) * 2.3;
    const faceYaw = Math.atan2(nx - px, nz - pz);

    const st = playerStateRef.current;
    st.x = px;
    st.z = pz;
    st.yaw = faceYaw;
    st.camYaw = faceYaw;
    st.targetPoint = null;
  }, [teleportRequest, worldManifest]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(56, width / height, 0.1, 180);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    const envRefs = createEnvironmentLighting(scene, isDarkRef.current);
    envRefsRef.current = envRefs;

    const { group: terrainGroup, groundTargets, totemCrown } = buildTerrainAndScenery(worldManifest, envRefs);
    scene.add(terrainGroup);

    // Build landmarks, colliders, and NPCs
    const colliders = [];
    const clickableMeshes = [...groundTargets];
    const npcEntries = [];

    worldManifest.buildings.forEach((b) => {
      const buildingMesh = buildLandmarkBuilding(b, envRefs);
      scene.add(buildingMesh);
      buildingMesh.traverse((obj) => {
        if (obj.isMesh) clickableMeshes.push(obj);
      });

      const isTeacherHere = Boolean(b.locationId === visitingTeacherLocationId && !hasMetTeacherToday);
      const { group: npcGroup, ring, npcMesh, teacherMesh } = buildNpcAndTrigger(b, isTeacherHere);
      scene.add(npcGroup);
      npcGroup.traverse((obj) => {
        if (obj.isMesh) clickableMeshes.push(obj);
      });

      npcEntries.push({
        cfg: b,
        npcGroup,
        ring,
        npcMesh,
        teacherMesh,
        isTeacherHere
      });

      // Approximate rotated footprint with generous padding for smooth wall sliding
      const [bw, , bd] = b.size;
      const halfR = Math.max(bw, bd) * 0.56;
      colliders.push({ x: b.position[0], z: b.position[1], radius: halfR });
    });

    // Player Avatar
    const playerMesh = createStylizedCharacter({
      bodyColor: 0x059669,
      headColor: 0xfef3c7,
      accentColor: 0xf59e0b,
      hasHat: true,
      hasBackpack: true
    });
    scene.add(playerMesh);

    // Tap-to-move destination indicator ring
    const destRingGeo = new THREE.RingGeometry(0.35, 0.55, 24);
    destRingGeo.rotateX(-Math.PI / 2);
    const destRingMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.85,
      side: THREE.DoubleSide
    });
    const destRing = new THREE.Mesh(destRingGeo, destRingMat);
    destRing.visible = false;
    destRing.position.y = 0.09;
    scene.add(destRing);

    // Input state
    const keys = {};
    const raycaster = new THREE.Raycaster();
    let isDragging = false;
    let pointerDownPos = { x: 0, y: 0 };
    let lastPointerPos = { x: 0, y: 0 };
    let dragMovedDist = 0;

    const handleKeyDown = (e) => {
      const k = e.key.toLowerCase();
      keys[k] = true;
      if ((k === 'e' || k === 'enter') && !propsRef.current.isDialogueOpen) {
        const nearest = playerStateRef.current.nearestId;
        if (nearest && propsRef.current.onInteractLocation) {
          propsRef.current.onInteractLocation(nearest);
        }
      }
    };

    const handleKeyUp = (e) => {
      keys[e.key.toLowerCase()] = false;
    };

    const handlePointerDown = (e) => {
      if (propsRef.current.isDialogueOpen) return;
      isDragging = true;
      dragMovedDist = 0;
      pointerDownPos = { x: e.clientX, y: e.clientY };
      lastPointerPos = { x: e.clientX, y: e.clientY };
    };

    const handlePointerMove = (e) => {
      if (!isDragging || propsRef.current.isDialogueOpen) return;
      const dx = e.clientX - lastPointerPos.x;
      const dy = e.clientY - lastPointerPos.y;
      dragMovedDist += Math.hypot(dx, dy);
      lastPointerPos = { x: e.clientX, y: e.clientY };

      const st = playerStateRef.current;
      st.camYaw -= dx * 0.006;
      const minPitch = propsRef.current.cameraMode === 'first' ? -0.45 : 0.12;
      const maxPitch = propsRef.current.cameraMode === 'first' ? 0.45 : 1.05;
      st.camPitch = THREE.MathUtils.clamp(st.camPitch + dy * 0.005, minPitch, maxPitch);
    };

    const handlePointerUp = (e) => {
      if (!isDragging) return;
      isDragging = false;
      if (propsRef.current.isDialogueOpen) return;

      // Short tap/click (< 7px drag) -> Raycast Tap-to-Move or Interact
      if (dragMovedDist < 7 && Math.hypot(e.clientX - pointerDownPos.x, e.clientY - pointerDownPos.y) < 7) {
        const rect = renderer.domElement.getBoundingClientRect();
        const ndc = new THREE.Vector2(
          ((e.clientX - rect.left) / rect.width) * 2 - 1,
          -((e.clientY - rect.top) / rect.height) * 2 + 1
        );
        raycaster.setFromCamera(ndc, camera);
        const hits = raycaster.intersectObjects(clickableMeshes, false);
        if (hits.length > 0) {
          const hit = hits[0];
          const hitLocId = hit.object.userData?.locationId;
          if (hitLocId) {
            const b = worldManifest.buildings.find((item) => item.locationId === hitLocId);
            if (b) {
              const distToNpc = Math.hypot(
                playerStateRef.current.x - b.npcPosition[0],
                playerStateRef.current.z - b.npcPosition[1]
              );
              if (distToNpc <= b.triggerRadius + 0.6) {
                propsRef.current.onInteractLocation?.(hitLocId);
              } else {
                // Walk right to the NPC & auto-open dialogue on arrival
                const dirLen = Math.hypot(b.npcPosition[0], b.npcPosition[1]) || 1;
                playerStateRef.current.targetPoint = {
                  x: b.npcPosition[0] - (b.npcPosition[0] / dirLen) * 1.8,
                  z: b.npcPosition[1] - (b.npcPosition[1] / dirLen) * 1.8,
                  autoInteractLocationId: hitLocId
                };
              }
            }
          } else {
            // Walk to clicked ground spot
            const pt = hit.point;
            const r = Math.hypot(pt.x, pt.z);
            const maxR = worldManifest.worldRadius - 2;
            const scale = r > maxR ? maxR / r : 1;
            playerStateRef.current.targetPoint = {
              x: pt.x * scale,
              z: pt.z * scale,
              autoInteractLocationId: null
            };
          }
        }
      }
    };

    const handleWheel = (e) => {
      if (propsRef.current.cameraMode === 'first' || propsRef.current.isDialogueOpen) return;
      const st = playerStateRef.current;
      st.camDistance = THREE.MathUtils.clamp(st.camDistance + e.deltaY * 0.006, 4.5, 18);
    };

    const handleResize = () => {
      if (!container) return;
      const nw = container.clientWidth || window.innerWidth;
      const nh = container.clientHeight || window.innerHeight;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('resize', handleResize);
    const domEl = renderer.domElement;
    domEl.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    domEl.addEventListener('wheel', handleWheel, { passive: true });

    // Animation loop
    let animId = 0;
    let lastTime = performance.now();
    let labelFrameCounter = 0;
    const camTargetPos = new THREE.Vector3();
    const camLookAtPos = new THREE.Vector3();
    const currentCamPos = new THREE.Vector3(
      playerStateRef.current.x,
      6,
      playerStateRef.current.z + 9
    );
    const currentLookAt = new THREE.Vector3(playerStateRef.current.x, 1.5, playerStateRef.current.z);
    const projVec = new THREE.Vector3();

    const resolveCollisions = (nx, nz) => {
      let rx = nx;
      let rz = nz;
      // Building circular bounds
      for (let i = 0; i < colliders.length; i++) {
        const c = colliders[i];
        const dx = rx - c.x;
        const dz = rz - c.z;
        const dist = Math.hypot(dx, dz);
        const minD = c.radius + 0.55;
        if (dist < minD && dist > 0.0001) {
          rx = c.x + (dx / dist) * minD;
          rz = c.z + (dz / dist) * minD;
        }
      }
      // World perimeter bound
      const maxR = worldManifest.worldRadius - 1.5;
      const r = Math.hypot(rx, rz);
      if (r > maxR) {
        rx = (rx / r) * maxR;
        rz = (rz / r) * maxR;
      }
      return [rx, rz];
    };

    const animate = (now) => {
      animId = requestAnimationFrame(animate);
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;
      const tSec = now * 0.001;

      const st = playerStateRef.current;
      const {
        cameraMode: mode,
        isDialogueOpen: inDialogue,
        activeLocationId: activeLoc
      } = propsRef.current;

      // 1. Movement input (disabled while talking)
      let moveX = 0;
      let moveZ = 0;
      let isMoving = false;

      if (!inDialogue) {
        let forward = 0;
        let strafe = 0;
        if (keys['w'] || keys['arrowup']) forward += 1;
        if (keys['s'] || keys['arrowdown']) forward -= 1;
        if (keys['a'] || keys['arrowleft']) strafe -= 1;
        if (keys['d'] || keys['arrowright']) strafe += 1;

        const joy = joystickRef?.current;
        if (joy && (Math.abs(joy.x) > 0.05 || Math.abs(joy.y) > 0.05)) {
          strafe += joy.x;
          forward -= joy.y;
        }

        if (Math.abs(forward) > 0.05 || Math.abs(strafe) > 0.05) {
          st.targetPoint = null;
          const sinY = Math.sin(st.camYaw);
          const cosY = Math.cos(st.camYaw);
          // Camera looks toward (-sin(camYaw), -cos(camYaw))
          moveX = (-sinY * forward) + (cosY * strafe);
          moveZ = (-cosY * forward) + (-sinY * strafe);
          const mag = Math.hypot(moveX, moveZ) || 1;
          const speed = (keys['shift'] ? 10.5 : 7.0) * Math.min(mag, 1);
          moveX = (moveX / mag) * speed;
          moveZ = (moveZ / mag) * speed;
          isMoving = true;
        } else if (st.targetPoint) {
          const dx = st.targetPoint.x - st.x;
          const dz = st.targetPoint.z - st.z;
          const dist = Math.hypot(dx, dz);
          if (dist < 0.45) {
            const autoLoc = st.targetPoint.autoInteractLocationId;
            st.targetPoint = null;
            if (autoLoc) {
              propsRef.current.onInteractLocation?.(autoLoc);
            }
          } else {
            const speed = 7.2;
            moveX = (dx / dist) * speed;
            moveZ = (dz / dist) * speed;
            isMoving = true;
          }
        }
      }

      if (isMoving) {
        const [rx, rz] = resolveCollisions(st.x + moveX * dt, st.z + moveZ * dt);
        st.x = rx;
        st.z = rz;
        const targetYaw = Math.atan2(moveX, moveZ);
        // Shortest angular interpolation
        let diff = targetYaw - st.yaw;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        st.yaw += diff * Math.min(1, dt * 12);
        st.walkPhase += dt * 11;
      } else {
        st.walkPhase = 0;
      }

      // Update destination ring
      if (st.targetPoint && !inDialogue) {
        destRing.visible = true;
        destRing.position.set(st.targetPoint.x, 0.1, st.targetPoint.z);
        const pulse = 0.85 + Math.sin(tSec * 6) * 0.2;
        destRing.scale.set(pulse, pulse, 1);
      } else {
        destRing.visible = false;
      }

      // Sync player mesh & limbs
      playerMesh.visible = mode !== 'first';
      playerMesh.position.set(st.x, 0, st.z);
      playerMesh.rotation.y = st.yaw;
      const limbs = playerMesh.userData.limbs;
      if (limbs) {
        const swing = isMoving ? Math.sin(st.walkPhase) * 0.55 : 0;
        limbs.leftLeg.rotation.x = swing;
        limbs.rightLeg.rotation.x = -swing;
        limbs.leftArm.rotation.x = -swing * 0.8;
        limbs.rightArm.rotation.x = swing * 0.8;
      }

      // 2. NPC idle animation, facing & proximity detection
      let nearestId = null;
      let nearestDist = Infinity;

      npcEntries.forEach((entry, idx) => {
        const [nx, nz] = entry.cfg.npcPosition;
        const dist = Math.hypot(st.x - nx, st.z - nz);
        const inside = dist <= entry.cfg.triggerRadius;

        if (inside && dist < nearestDist) {
          nearestDist = dist;
          nearestId = entry.cfg.locationId;
        }

        // Gentle breathing / floating ring
        entry.npcMesh.position.y = Math.sin(tSec * 2.4 + idx) * 0.05;
        if (entry.teacherMesh) {
          entry.teacherMesh.position.y = Math.sin(tSec * 3.1 + idx) * 0.08;
        }
        entry.ring.material.opacity = inside ? 0.9 : 0.42 + Math.sin(tSec * 3 + idx) * 0.12;
        const ringScale = inside ? 1.06 + Math.sin(tSec * 6) * 0.04 : 1.0;
        entry.ring.scale.set(ringScale, ringScale, 1);

        // NPC smoothly turns to greet nearby player
        if (dist < 7.5) {
          const faceAngle = Math.atan2(st.x - nx, st.z - nz);
          entry.npcMesh.rotation.y = faceAngle;
          if (entry.teacherMesh) entry.teacherMesh.rotation.y = faceAngle;
        }
      });

      if (nearestId !== st.nearestId) {
        st.nearestId = nearestId;
        propsRef.current.onNearestLocationChange?.(nearestId);
      }

      // Rotate central plaza totem crystal gently
      totemCrown.rotation.y = tSec * 0.9;
      totemCrown.position.y = 3.55 + Math.sin(tSec * 2) * 0.12;

      // 3. Camera positioning (Dialogue Cinematic Focus vs 1st Person vs 3rd Person)
      if (inDialogue && activeLoc) {
        const targetEntry = npcEntries.find((e) => e.cfg.locationId === activeLoc);
        if (targetEntry) {
          const [nx, nz] = targetEntry.cfg.npcPosition;
          const midX = (st.x + nx) * 0.5;
          const midZ = (st.z + nz) * 0.5;
          const dx = st.x - nx;
          const dz = st.z - nz;
          const len = Math.hypot(dx, dz) || 1;
          // Perpendicular offset for over-the-shoulder RPG framing
          const perpX = -dz / len;
          const perpZ = dx / len;
          camTargetPos.set(midX + perpX * 3.6 + (dx / len) * 1.4, 2.3, midZ + perpZ * 3.6 + (dz / len) * 1.4);
          camLookAtPos.set(nx, 1.35, nz);
        }
      } else if (mode === 'first') {
        const eyeY = 1.65 + (isMoving ? Math.sin(st.walkPhase * 2) * 0.04 : 0);
        camTargetPos.set(st.x, eyeY, st.z);
        camLookAtPos.set(
          st.x - Math.sin(st.camYaw) * Math.cos(st.camPitch) * 6,
          eyeY - Math.sin(st.camPitch) * 6,
          st.z - Math.cos(st.camYaw) * Math.cos(st.camPitch) * 6
        );
      } else {
        const horizDist = Math.cos(st.camPitch) * st.camDistance;
        const vertDist = Math.sin(st.camPitch) * st.camDistance + 1.5;
        camTargetPos.set(
          st.x + Math.sin(st.camYaw) * horizDist,
          vertDist,
          st.z + Math.cos(st.camYaw) * horizDist
        );
        camLookAtPos.set(st.x, 1.4, st.z);
      }

      const camSmooth = mode === 'first' && !inDialogue ? 1 : Math.min(1, dt * 8.5);
      currentCamPos.lerp(camTargetPos, camSmooth);
      currentLookAt.lerp(camLookAtPos, camSmooth);
      camera.position.copy(currentCamPos);
      camera.lookAt(currentLookAt);

      renderer.render(scene, camera);

      // 4. Update projected 2D landmark badges & player radar pos every 3 frames (~20Hz)
      labelFrameCounter += 1;
      if (labelFrameCounter % 3 === 0) {
        const cw = renderer.domElement.clientWidth;
        const ch = renderer.domElement.clientHeight;
        const nextLabels = [];

        npcEntries.forEach((entry) => {
          const [nx, nz] = entry.cfg.npcPosition;
          const dist = Math.hypot(st.x - nx, st.z - nz);
          if (dist > 34 && !entry.isTeacherHere) return;

          projVec.set(nx, 2.75, nz).project(camera);
          if (projVec.z > 1 || projVec.z < -1) return;

          const sx = (projVec.x * 0.5 + 0.5) * cw;
          const sy = (-projVec.y * 0.5 + 0.5) * ch;
          if (sx < -80 || sx > cw + 80 || sy < -40 || sy > ch + 40) return;

          const locMeta = locationsById[entry.cfg.locationId];
          nextLabels.push({
            id: entry.cfg.locationId,
            x: sx,
            y: sy,
            nameZh: locMeta?.nameZh || entry.cfg.locationId,
            avatar: locMeta?.npcAvatar || '📍',
            isNearby: dist <= entry.cfg.triggerRadius,
            isTeacherHere: entry.isTeacherHere,
            distance: Math.round(dist)
          });
        });

        setProjectedLabels(nextLabels);
        propsRef.current.onPositionUpdate?.({ x: st.x, z: st.z, yaw: st.camYaw });
      }
    };

    animId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('resize', handleResize);
      domEl.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      domEl.removeEventListener('wheel', handleWheel);
      disposeObject3D(scene);
      renderer.dispose();
      if (domEl.parentNode === container) {
        container.removeChild(domEl);
      }
    };
  }, [worldManifest, visitingTeacherLocationId, hasMetTeacherToday, locationsById, joystickRef]);

  return (
    <div className="relative w-full h-full overflow-hidden select-none">
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing touch-none" />

      {/* Projected crisp HTML labels floating above 3D landmarks */}
      {!isDialogueOpen && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
          {projectedLabels.map((lbl) => (
            <button
              key={lbl.id}
              onClick={() => walkToAndInteract(lbl.id)}
              style={{
                transform: `translate3d(${lbl.x}px, ${lbl.y}px, 0) translate(-50%, -100%)`
              }}
              className={`absolute top-0 left-0 pointer-events-auto px-2.5 py-1 rounded-full backdrop-blur-md border shadow-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                lbl.isNearby
                  ? 'bg-emerald-500/95 border-white text-white scale-105 animate-bounce'
                  : lbl.isTeacherHere
                  ? 'bg-amber-500/90 border-amber-200 text-white'
                  : 'bg-slate-900/70 hover:bg-emerald-600/85 border-white/25 text-white'
              }`}
            >
              <span className="text-sm">{lbl.avatar}</span>
              <span className="text-[11px] font-black font-heading whitespace-nowrap">
                {lbl.nameZh}
              </span>
              {lbl.isTeacherHere && (
                <span className="text-[9px] bg-white/25 px-1.5 py-0.5 rounded-full font-black">
                  外師
                </span>
              )}
              {lbl.isNearby && (
                <span className="text-[10px] bg-white text-emerald-700 px-1.5 py-0.5 rounded-full font-black">
                  E 對話
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default World3DCanvas;
