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
import { buildClassroomInterior } from './classroomBuilders3D';

const toExitSpawn = (b) => ({
  x: b.exitSpawnPoint[0],
  z: b.exitSpawnPoint[1],
  yaw: b.exitYaw ?? 0,
  camYaw: Math.PI
});

/**
 * Reusable 3D Interactive World Canvas Engine (Three.js).
 * Supports both outdoor towns ('outdoor') and indoor rooms ('indoor'):
 * - 3rd-person chase orbit camera & 1st-person free-look camera
 * - Cinematic smooth camera focus during NPC dialogue
 * - Patrolling NPCs (e.g., Principal walking inside the classroom)
 * - Interactive seats (sitting pose at student desks) & clickable blackboards
 * - Outdoor <-> Indoor building entry and exit door mat transitions
 */
export const World3DCanvas = ({
  worldManifest,
  spawnOverride = null,
  locationsById,
  visitingTeacherLocationId,
  hasMetTeacherToday,
  isDark,
  cameraMode = 'third',
  isDialogueOpen = false,
  activeLocationId = null,
  teleportRequest = null,
  standUpSignal = 0,
  joystickRef,
  onNearestLocationChange,
  onInteractLocation,
  onEnterIndoor,
  onExitIndoor,
  onBlackboardSpeak,
  onSeatChange,
  onPositionUpdate
}) => {
  const mountRef = useRef(null);
  const [projectedLabels, setProjectedLabels] = useState([]);
  const [nearestAction, setNearestAction] = useState(null); // { type: 'npc'|'enter'|'exit'|'seat', id, label }

  const isIndoor = worldManifest.sceneType === 'indoor';

  const propsRef = useRef({});
  propsRef.current = {
    cameraMode,
    isDialogueOpen,
    activeLocationId,
    onNearestLocationChange,
    onInteractLocation,
    onEnterIndoor,
    onExitIndoor,
    onBlackboardSpeak,
    onSeatChange,
    onPositionUpdate
  };

  const envRefsRef = useRef(null);
  const isDarkRef = useRef(isDark);
  isDarkRef.current = isDark;

  const initialX = spawnOverride?.x ?? worldManifest.spawnPoint[0];
  const initialZ = spawnOverride?.z ?? worldManifest.spawnPoint[1];
  const initialCamYaw = spawnOverride?.camYaw ?? worldManifest.spawnYaw ?? 0;

  const playerStateRef = useRef({
    x: initialX,
    z: initialZ,
    yaw: spawnOverride?.yaw ?? Math.PI,
    camYaw: initialCamYaw,
    camPitch: isIndoor ? 0.36 : 0.34,
    camDistance: isIndoor ? 6.2 : 9.5,
    walkPhase: 0,
    targetPoint: null, // { x, z, autoInteractLocationId?, autoEnterBuilding?, autoExitIndoor?, autoSeat? }
    nearestId: null,
    nearestSeat: null,
    seatedSeat: null
  });

  // Reset player spawn whenever worldManifest switches (outdoor <-> indoor)
  useEffect(() => {
    const st = playerStateRef.current;
    st.x = spawnOverride?.x ?? worldManifest.spawnPoint[0];
    st.z = spawnOverride?.z ?? worldManifest.spawnPoint[1];
    st.yaw = spawnOverride?.yaw ?? Math.PI;
    st.camYaw = spawnOverride?.camYaw ?? worldManifest.spawnYaw ?? 0;
    st.camPitch = worldManifest.sceneType === 'indoor' ? 0.36 : 0.34;
    st.camDistance = worldManifest.sceneType === 'indoor' ? 6.2 : 9.5;
    st.targetPoint = null;
    st.nearestId = null;
    st.nearestSeat = null;
    st.seatedSeat = null;
    setNearestAction(null);
    propsRef.current.onSeatChange?.(null);
  }, [worldManifest, spawnOverride]);

  // Stand up on explicit HUD button click
  useEffect(() => {
    if (standUpSignal > 0 && playerStateRef.current.seatedSeat) {
      playerStateRef.current.seatedSeat = null;
      propsRef.current.onSeatChange?.(null);
    }
  }, [standUpSignal]);

  // Day/Night reactive lighting
  useEffect(() => {
    if (envRefsRef.current) {
      applyDayNightTheme(envRefsRef.current, isDark);
    }
  }, [isDark]);

  // Quick Teleport (outdoor landmarks)
  useEffect(() => {
    if (!teleportRequest || worldManifest.sceneType === 'indoor') return;
    const b = worldManifest.buildings?.find((item) => item.locationId === teleportRequest.locationId);
    if (!b) return;
    const [nx, nz] = b.npcPosition;
    const dirLen = Math.hypot(nx, nz) || 1;
    const px = nx - (nx / dirLen) * 2.3;
    const pz = nz - (nz / dirLen) * 2.3;
    const faceYaw = Math.atan2(nx - px, nz - pz);

    const st = playerStateRef.current;
    st.seatedSeat = null;
    st.x = px;
    st.z = pz;
    st.yaw = faceYaw;
    st.camYaw = Math.atan2(-(nx - px), -(nz - pz));
    st.targetPoint = null;
  }, [teleportRequest, worldManifest]);

  const handleLabelClick = (lbl) => {
    const st = playerStateRef.current;
    st.seatedSeat = null;
    propsRef.current.onSeatChange?.(null);

    if (lbl.actionType === 'exit_indoor') {
      const ex = worldManifest.exitDoor;
      if (Math.hypot(st.x - ex.position[0], st.z - ex.position[1]) <= ex.triggerRadius + 0.5) {
        propsRef.current.onExitIndoor?.();
      } else {
        st.targetPoint = { x: ex.position[0], z: ex.position[1] - 0.8, autoExitIndoor: true };
      }
      return;
    }

    if (lbl.actionType === 'enter_indoor') {
      const b = worldManifest.buildings?.find((item) => item.locationId === lbl.id);
      if (!b) return;
      const dist = Math.hypot(st.x - b.npcPosition[0], st.z - b.npcPosition[1]);
      if (dist <= b.triggerRadius + 0.5) {
        propsRef.current.onEnterIndoor?.(b.indoorWorldId, toExitSpawn(b));
      } else {
        const dirLen = Math.hypot(b.npcPosition[0], b.npcPosition[1]) || 1;
        st.targetPoint = {
          x: b.npcPosition[0] - (b.npcPosition[0] / dirLen) * 1.9,
          z: b.npcPosition[1] - (b.npcPosition[1] / dirLen) * 1.9,
          autoEnterBuilding: b
        };
      }
      return;
    }

    if (lbl.actionType === 'principal_indoor') {
      propsRef.current.onInteractLocation?.(lbl.id);
      return;
    }

    // Standard outdoor NPC walk & interact
    const b = worldManifest.buildings?.find((item) => item.locationId === lbl.id);
    if (!b) return;
    const distToNpc = Math.hypot(st.x - b.npcPosition[0], st.z - b.npcPosition[1]);
    if (distToNpc <= b.triggerRadius + 0.4) {
      propsRef.current.onInteractLocation?.(lbl.id);
      return;
    }
    const dirLen = Math.hypot(b.npcPosition[0], b.npcPosition[1]) || 1;
    st.targetPoint = {
      x: b.npcPosition[0] - (b.npcPosition[0] / dirLen) * 1.9,
      z: b.npcPosition[1] - (b.npcPosition[1] / dirLen) * 1.9,
      autoInteractLocationId: lbl.id
    };
  };

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

    // Scene-specific geometry setup
    const circleColliders = [];
    const boxColliders = [];
    let clickableMeshes = [];
    const npcEntries = [];
    let totemCrown = null;
    let indoorCtx = null;

    if (worldManifest.sceneType === 'indoor') {
      indoorCtx = buildClassroomInterior(worldManifest, envRefs, isDarkRef.current);
      scene.add(indoorCtx.group);
      clickableMeshes = [...indoorCtx.groundTargets, ...indoorCtx.interactiveMeshes];
      boxColliders.push(...indoorCtx.boxColliders);
    } else {
      const { group: terrainGroup, groundTargets, totemCrown: crown } = buildTerrainAndScenery(worldManifest, envRefs);
      totemCrown = crown;
      scene.add(terrainGroup);
      clickableMeshes.push(...groundTargets);

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

        npcEntries.push({ cfg: b, npcGroup, ring, npcMesh, teacherMesh, isTeacherHere });

        const [bw, , bd] = b.size;
        circleColliders.push({ x: b.position[0], z: b.position[1], radius: Math.max(bw, bd) * 0.56 });
      });
    }

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
    const destRingGeo = new THREE.RingGeometry(0.32, 0.5, 24);
    destRingGeo.rotateX(-Math.PI / 2);
    const destRingMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.85,
      side: THREE.DoubleSide
    });
    const destRing = new THREE.Mesh(destRingGeo, destRingMat);
    destRing.visible = false;
    destRing.position.y = 0.08;
    scene.add(destRing);

    // Patrol state for indoor Principal
    const patrolState = {
      wpIndex: 1,
      pauseLeft: 1.5,
      walkPhase: 0
    };

    // Input state
    const keys = {};
    const raycaster = new THREE.Raycaster();
    let isDragging = false;
    let pointerDownPos = { x: 0, y: 0 };
    let lastPointerPos = { x: 0, y: 0 };
    let dragMovedDist = 0;

    const triggerContextualAction = () => {
      const st = playerStateRef.current;
      if (worldManifest.sceneType === 'indoor') {
        const ex = worldManifest.exitDoor;
        if (Math.hypot(st.x - ex.position[0], st.z - ex.position[1]) <= ex.triggerRadius) {
          propsRef.current.onExitIndoor?.();
          return;
        }
        if (st.nearestId) {
          propsRef.current.onInteractLocation?.(st.nearestId);
          return;
        }
        if (st.nearestSeat && !st.seatedSeat) {
          st.seatedSeat = st.nearestSeat;
          st.targetPoint = null;
          propsRef.current.onSeatChange?.(st.nearestSeat);
        }
        return;
      }

      if (st.nearestId) {
        const b = worldManifest.buildings.find((item) => item.locationId === st.nearestId);
        if (b?.indoorWorldId) {
          propsRef.current.onEnterIndoor?.(b.indoorWorldId, toExitSpawn(b));
        } else {
          propsRef.current.onInteractLocation?.(st.nearestId);
        }
      }
    };

    const handleKeyDown = (e) => {
      const k = e.key.toLowerCase();
      keys[k] = true;
      if ((k === 'e' || k === 'enter' || k === 'f') && !propsRef.current.isDialogueOpen) {
        if (k === 'f' && playerStateRef.current.nearestSeat && !playerStateRef.current.seatedSeat) {
          const seat = playerStateRef.current.nearestSeat;
          playerStateRef.current.seatedSeat = seat;
          playerStateRef.current.targetPoint = null;
          propsRef.current.onSeatChange?.(seat);
          return;
        }
        triggerContextualAction();
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
      const minPitch = propsRef.current.cameraMode === 'first' ? -0.45 : 0.14;
      const maxPitch = propsRef.current.cameraMode === 'first' ? 0.45 : (worldManifest.sceneType === 'indoor' ? 0.92 : 1.05);
      st.camPitch = THREE.MathUtils.clamp(st.camPitch + dy * 0.005, minPitch, maxPitch);
    };

    const handlePointerUp = (e) => {
      if (!isDragging) return;
      isDragging = false;
      if (propsRef.current.isDialogueOpen) return;

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
          const ud = hit.object.userData || {};

          if (ud.actionType === 'blackboard') {
            propsRef.current.onBlackboardSpeak?.(ud.textEn);
            return;
          }

          if (ud.actionType === 'exit_indoor') {
            const ex = worldManifest.exitDoor;
            if (Math.hypot(playerStateRef.current.x - ex.position[0], playerStateRef.current.z - ex.position[1]) <= ex.triggerRadius + 0.5) {
              propsRef.current.onExitIndoor?.();
            } else {
              playerStateRef.current.seatedSeat = null;
              propsRef.current.onSeatChange?.(null);
              playerStateRef.current.targetPoint = {
                x: ex.position[0],
                z: ex.position[1] - 0.8,
                autoExitIndoor: true
              };
            }
            return;
          }

          if (ud.seatId && indoorCtx) {
            const seat = indoorCtx.seats.find((s) => s.id === ud.seatId);
            if (seat) {
              const st = playerStateRef.current;
              if (Math.hypot(st.x - seat.position[0], st.z - seat.position[1]) <= 2.2) {
                st.seatedSeat = seat;
                st.targetPoint = null;
                propsRef.current.onSeatChange?.(seat);
              } else {
                st.seatedSeat = null;
                propsRef.current.onSeatChange?.(null);
                st.targetPoint = {
                  x: seat.position[0],
                  z: seat.position[1] + 0.25,
                  autoSeat: seat
                };
              }
              return;
            }
          }

          if (ud.locationId) {
            if (worldManifest.sceneType === 'indoor') {
              propsRef.current.onInteractLocation?.(ud.locationId);
              return;
            }
            const b = worldManifest.buildings.find((item) => item.locationId === ud.locationId);
            if (b) {
              const dist = Math.hypot(
                playerStateRef.current.x - b.npcPosition[0],
                playerStateRef.current.z - b.npcPosition[1]
              );
              if (dist <= b.triggerRadius + 0.6) {
                if (b.indoorWorldId) {
                  propsRef.current.onEnterIndoor?.(b.indoorWorldId, toExitSpawn(b));
                } else {
                  propsRef.current.onInteractLocation?.(ud.locationId);
                }
              } else {
                const dirLen = Math.hypot(b.npcPosition[0], b.npcPosition[1]) || 1;
                playerStateRef.current.targetPoint = {
                  x: b.npcPosition[0] - (b.npcPosition[0] / dirLen) * 1.8,
                  z: b.npcPosition[1] - (b.npcPosition[1] / dirLen) * 1.8,
                  autoEnterBuilding: b.indoorWorldId ? b : null,
                  autoInteractLocationId: b.indoorWorldId ? null : ud.locationId
                };
              }
              return;
            }
          }

          // Walk to clicked floor/ground point
          const pt = hit.point;
          playerStateRef.current.seatedSeat = null;
          propsRef.current.onSeatChange?.(null);

          if (worldManifest.sceneType === 'indoor') {
            const hw = worldManifest.roomSize.width / 2 - 0.8;
            const hd = worldManifest.roomSize.depth / 2 - 0.8;
            playerStateRef.current.targetPoint = {
              x: THREE.MathUtils.clamp(pt.x, -hw, hw),
              z: THREE.MathUtils.clamp(pt.z, -hd, hd)
            };
          } else {
            const r = Math.hypot(pt.x, pt.z);
            const maxR = worldManifest.worldRadius - 2;
            const scale = r > maxR ? maxR / r : 1;
            playerStateRef.current.targetPoint = {
              x: pt.x * scale,
              z: pt.z * scale
            };
          }
        }
      }
    };

    const handleWheel = (e) => {
      if (propsRef.current.cameraMode === 'first' || propsRef.current.isDialogueOpen) return;
      const st = playerStateRef.current;
      const minD = worldManifest.sceneType === 'indoor' ? 3.8 : 4.5;
      const maxD = worldManifest.sceneType === 'indoor' ? 9.5 : 18;
      st.camDistance = THREE.MathUtils.clamp(st.camDistance + e.deltaY * 0.006, minD, maxD);
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

    let animId = 0;
    let lastTime = performance.now();
    let labelFrameCounter = 0;
    const camTargetPos = new THREE.Vector3();
    const camLookAtPos = new THREE.Vector3();
    const currentCamPos = new THREE.Vector3(playerStateRef.current.x, 5, playerStateRef.current.z + 7);
    const currentLookAt = new THREE.Vector3(playerStateRef.current.x, 1.4, playerStateRef.current.z);
    const projVec = new THREE.Vector3();

    const resolveCollisions = (nx, nz) => {
      let rx = nx;
      let rz = nz;
      const pad = 0.42;

      for (let i = 0; i < circleColliders.length; i++) {
        const c = circleColliders[i];
        const dx = rx - c.x;
        const dz = rz - c.z;
        const dist = Math.hypot(dx, dz);
        const minD = c.radius + 0.55;
        if (dist < minD && dist > 0.0001) {
          rx = c.x + (dx / dist) * minD;
          rz = c.z + (dz / dist) * minD;
        }
      }

      for (let i = 0; i < boxColliders.length; i++) {
        const b = boxColliders[i];
        const closestX = THREE.MathUtils.clamp(rx, b.minX, b.maxX);
        const closestZ = THREE.MathUtils.clamp(rz, b.minZ, b.maxZ);
        const dx = rx - closestX;
        const dz = rz - closestZ;
        const distSq = dx * dx + dz * dz;
        if (distSq < pad * pad) {
          if (distSq > 0.00001) {
            const dist = Math.sqrt(distSq);
            rx = closestX + (dx / dist) * pad;
            rz = closestZ + (dz / dist) * pad;
          } else {
            // Inside box: push out along nearest edge
            rx = b.maxX + pad;
          }
        }
      }

      if (worldManifest.sceneType === 'indoor') {
        const hw = worldManifest.roomSize.width / 2 - 0.65;
        const hd = worldManifest.roomSize.depth / 2 - 0.65;
        rx = THREE.MathUtils.clamp(rx, -hw, hw);
        rz = THREE.MathUtils.clamp(rz, -hd, hd);
      } else {
        const maxR = worldManifest.worldRadius - 1.5;
        const r = Math.hypot(rx, rz);
        if (r > maxR) {
          rx = (rx / r) * maxR;
          rz = (rz / r) * maxR;
        }
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

      // 1. Movement input
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
          if (st.seatedSeat) {
            st.seatedSeat = null;
            propsRef.current.onSeatChange?.(null);
          }
          const sinY = Math.sin(st.camYaw);
          const cosY = Math.cos(st.camYaw);
          moveX = (-sinY * forward) + (cosY * strafe);
          moveZ = (-cosY * forward) + (-sinY * strafe);
          const mag = Math.hypot(moveX, moveZ) || 1;
          const baseSpeed = worldManifest.sceneType === 'indoor' ? 5.0 : 7.0;
          const speed = (keys['shift'] ? baseSpeed * 1.45 : baseSpeed) * Math.min(mag, 1);
          moveX = (moveX / mag) * speed;
          moveZ = (moveZ / mag) * speed;
          isMoving = true;
        } else if (st.targetPoint) {
          const dx = st.targetPoint.x - st.x;
          const dz = st.targetPoint.z - st.z;
          const dist = Math.hypot(dx, dz);
          if (dist < 0.45) {
            const tp = st.targetPoint;
            st.targetPoint = null;
            if (tp.autoExitIndoor) {
              propsRef.current.onExitIndoor?.();
            } else if (tp.autoEnterBuilding) {
              const b = tp.autoEnterBuilding;
              propsRef.current.onEnterIndoor?.(b.indoorWorldId, toExitSpawn(b));
            } else if (tp.autoSeat) {
              st.seatedSeat = tp.autoSeat;
              propsRef.current.onSeatChange?.(tp.autoSeat);
            } else if (tp.autoInteractLocationId) {
              propsRef.current.onInteractLocation?.(tp.autoInteractLocationId);
            }
          } else {
            const speed = worldManifest.sceneType === 'indoor' ? 5.2 : 7.2;
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
        let diff = targetYaw - st.yaw;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        st.yaw += diff * Math.min(1, dt * 12);
        st.walkPhase += dt * 11;
      } else {
        st.walkPhase = 0;
      }

      // Destination ring
      if (st.targetPoint && !inDialogue) {
        destRing.visible = true;
        destRing.position.set(st.targetPoint.x, 0.08, st.targetPoint.z);
        const pulse = 0.85 + Math.sin(tSec * 6) * 0.2;
        destRing.scale.set(pulse, pulse, 1);
      } else {
        destRing.visible = false;
      }

      // Update player mesh (standing/walking vs seated at desk)
      playerMesh.visible = mode !== 'first';
      const limbs = playerMesh.userData.limbs;
      if (st.seatedSeat) {
        playerMesh.position.set(st.seatedSeat.position[0], -0.24, st.seatedSeat.position[1]);
        playerMesh.rotation.y = st.seatedSeat.yaw;
        if (limbs) {
          limbs.leftLeg.rotation.x = -Math.PI / 2.1;
          limbs.rightLeg.rotation.x = -Math.PI / 2.1;
          limbs.leftLeg.position.set(-0.16, 0.54, 0.22);
          limbs.rightLeg.position.set(0.16, 0.54, 0.22);
          limbs.leftArm.rotation.x = -0.35;
          limbs.rightArm.rotation.x = -0.35;
        }
      } else {
        playerMesh.position.set(st.x, 0, st.z);
        playerMesh.rotation.y = st.yaw;
        if (limbs) {
          const swing = isMoving ? Math.sin(st.walkPhase) * 0.55 : 0;
          limbs.leftLeg.rotation.x = swing;
          limbs.rightLeg.rotation.x = -swing;
          limbs.leftLeg.position.set(-0.16, 0.31, 0);
          limbs.rightLeg.position.set(0.16, 0.31, 0);
          limbs.leftArm.rotation.x = -swing * 0.8;
          limbs.rightArm.rotation.x = swing * 0.8;
        }
      }

      // 2. Scene-specific updates (Indoor Principal Patrol & Seats vs Outdoor NPCs)
      let nearestId = null;
      let nextNearestAction = null;

      if (worldManifest.sceneType === 'indoor' && indoorCtx) {
        const p = indoorCtx.principal;
        const pPos = p.group.position;
        const distToPrincipal = Math.hypot(st.x - pPos.x, st.z - pPos.z);
        const insidePrincipal = distToPrincipal <= p.cfg.triggerRadius;

        if (insidePrincipal) {
          nearestId = p.cfg.locationId;
        }

        // Principal walking patrol inside classroom (pauses when talking or player is close)
        const pLimbs = p.mesh.userData.limbs;
        if (inDialogue || distToPrincipal <= 2.3) {
          const faceAngle = Math.atan2(st.x - pPos.x, st.z - pPos.z);
          p.mesh.rotation.y = faceAngle;
          if (pLimbs) {
            pLimbs.leftLeg.rotation.x = 0;
            pLimbs.rightLeg.rotation.x = 0;
            pLimbs.leftArm.rotation.x = 0;
            pLimbs.rightArm.rotation.x = 0;
          }
        } else if (patrolState.pauseLeft > 0) {
          patrolState.pauseLeft -= dt;
          if (pLimbs) {
            pLimbs.leftLeg.rotation.x = 0;
            pLimbs.rightLeg.rotation.x = 0;
            pLimbs.leftArm.rotation.x = 0;
            pLimbs.rightArm.rotation.x = 0;
          }
        } else {
          const wp = p.cfg.waypoints[patrolState.wpIndex];
          const dx = wp[0] - pPos.x;
          const dz = wp[1] - pPos.z;
          const dist = Math.hypot(dx, dz);
          if (dist < 0.2) {
            patrolState.pauseLeft = p.cfg.pauseSeconds;
            patrolState.wpIndex = (patrolState.wpIndex + 1) % p.cfg.waypoints.length;
          } else {
            const step = Math.min(dist, p.cfg.walkSpeed * dt);
            pPos.x += (dx / dist) * step;
            pPos.z += (dz / dist) * step;
            const targetYaw = Math.atan2(dx, dz);
            let diff = targetYaw - p.mesh.rotation.y;
            while (diff > Math.PI) diff -= Math.PI * 2;
            while (diff < -Math.PI) diff += Math.PI * 2;
            p.mesh.rotation.y += diff * Math.min(1, dt * 8);

            patrolState.walkPhase += dt * 7.5;
            if (pLimbs) {
              const sw = Math.sin(patrolState.walkPhase) * 0.45;
              pLimbs.leftLeg.rotation.x = sw;
              pLimbs.rightLeg.rotation.x = -sw;
              pLimbs.leftArm.rotation.x = -sw * 0.7;
              pLimbs.rightArm.rotation.x = sw * 0.7;
            }
          }
        }

        p.ring.material.opacity = insidePrincipal ? 0.9 : 0.45 + Math.sin(tSec * 3) * 0.12;

        // Check Exit Mat & Nearest Seat
        const ex = worldManifest.exitDoor;
        const distToExit = Math.hypot(st.x - ex.position[0], st.z - ex.position[1]);
        let closestSeat = null;
        let closestSeatDist = Infinity;
        if (!st.seatedSeat) {
          indoorCtx.seats.forEach((seat) => {
            const sd = Math.hypot(st.x - seat.position[0], st.z - seat.position[1]);
            if (sd <= 1.35 && sd < closestSeatDist) {
              closestSeatDist = sd;
              closestSeat = seat;
            }
          });
        }
        st.nearestSeat = closestSeat;

        if (distToExit <= ex.triggerRadius) {
          nextNearestAction = { type: 'exit', label: '走出教室回到小鎮' };
        } else if (insidePrincipal) {
          nextNearestAction = { type: 'npc', id: p.cfg.locationId, label: '和 校長 對話' };
        } else if (closestSeat) {
          nextNearestAction = { type: 'seat', seat: closestSeat, label: `坐下 (${closestSeat.label})` };
        }
      } else {
        // Outdoor NPCs & Building triggers
        let nearestDist = Infinity;
        npcEntries.forEach((entry, idx) => {
          const [nx, nz] = entry.cfg.npcPosition;
          const dist = Math.hypot(st.x - nx, st.z - nz);
          const inside = dist <= entry.cfg.triggerRadius;

          if (inside && dist < nearestDist) {
            nearestDist = dist;
            nearestId = entry.cfg.locationId;
          }

          entry.npcMesh.position.y = Math.sin(tSec * 2.4 + idx) * 0.05;
          if (entry.teacherMesh) {
            entry.teacherMesh.position.y = Math.sin(tSec * 3.1 + idx) * 0.08;
          }
          entry.ring.material.opacity = inside ? 0.9 : 0.42 + Math.sin(tSec * 3 + idx) * 0.12;
          const ringScale = inside ? 1.06 + Math.sin(tSec * 6) * 0.04 : 1.0;
          entry.ring.scale.set(ringScale, ringScale, 1);

          if (dist < 7.5) {
            const faceAngle = Math.atan2(st.x - nx, st.z - nz);
            entry.npcMesh.rotation.y = faceAngle;
            if (entry.teacherMesh) entry.teacherMesh.rotation.y = faceAngle;
          }
        });

        if (nearestId) {
          const b = worldManifest.buildings.find((item) => item.locationId === nearestId);
          const locMeta = locationsById[nearestId];
          if (b?.indoorWorldId) {
            nextNearestAction = { type: 'enter', building: b, label: `走進 ${locMeta?.nameZh || nearestId}` };
          } else {
            nextNearestAction = { type: 'npc', id: nearestId, label: `和 ${locMeta?.nameZh || nearestId} 對話` };
          }
        }

        if (totemCrown) {
          totemCrown.rotation.y = tSec * 0.9;
          totemCrown.position.y = 3.55 + Math.sin(tSec * 2) * 0.12;
        }
      }

      if (nearestId !== st.nearestId) {
        st.nearestId = nearestId;
        propsRef.current.onNearestLocationChange?.(nearestId);
      }

      // 3. Camera positioning
      if (inDialogue && activeLoc) {
        let nx = 0;
        let nz = 0;
        if (worldManifest.sceneType === 'indoor' && indoorCtx) {
          nx = indoorCtx.principal.group.position.x;
          nz = indoorCtx.principal.group.position.z;
        } else {
          const targetEntry = npcEntries.find((e) => e.cfg.locationId === activeLoc);
          if (targetEntry) {
            nx = targetEntry.cfg.npcPosition[0];
            nz = targetEntry.cfg.npcPosition[1];
          }
        }
        const midX = (st.x + nx) * 0.5;
        const midZ = (st.z + nz) * 0.5;
        const dx = st.x - nx;
        const dz = st.z - nz;
        const len = Math.hypot(dx, dz) || 1;
        const perpX = -dz / len;
        const perpZ = dx / len;
        camTargetPos.set(midX + perpX * 3.2 + (dx / len) * 1.2, 2.25, midZ + perpZ * 3.2 + (dz / len) * 1.2);
        camLookAtPos.set(nx, 1.35, nz);
      } else if (mode === 'first') {
        const baseEye = st.seatedSeat ? 1.22 : 1.65;
        const eyeY = baseEye + (isMoving ? Math.sin(st.walkPhase * 2) * 0.04 : 0);
        const px = st.seatedSeat ? st.seatedSeat.position[0] : st.x;
        const pz = st.seatedSeat ? st.seatedSeat.position[1] : st.z;
        camTargetPos.set(px, eyeY, pz);
        camLookAtPos.set(
          px - Math.sin(st.camYaw) * Math.cos(st.camPitch) * 6,
          eyeY - Math.sin(st.camPitch) * 6,
          pz - Math.cos(st.camYaw) * Math.cos(st.camPitch) * 6
        );
      } else {
        const px = st.seatedSeat ? st.seatedSeat.position[0] : st.x;
        const pz = st.seatedSeat ? st.seatedSeat.position[1] : st.z;
        const horizDist = Math.cos(st.camPitch) * st.camDistance;
        const vertDist = Math.sin(st.camPitch) * st.camDistance + 1.5;
        camTargetPos.set(
          px + Math.sin(st.camYaw) * horizDist,
          vertDist,
          pz + Math.cos(st.camYaw) * horizDist
        );
        camLookAtPos.set(px, 1.35, pz);
      }

      const camSmooth = mode === 'first' && !inDialogue ? 1 : Math.min(1, dt * 8.5);
      currentCamPos.lerp(camTargetPos, camSmooth);
      currentLookAt.lerp(camLookAtPos, camSmooth);
      camera.position.copy(currentCamPos);
      camera.lookAt(currentLookAt);

      renderer.render(scene, camera);

      // 4. Projected 2D screen badges (~20Hz)
      labelFrameCounter += 1;
      if (labelFrameCounter % 3 === 0) {
        const cw = renderer.domElement.clientWidth;
        const ch = renderer.domElement.clientHeight;
        const nextLabels = [];

        const pushLabel = (worldX, worldY, worldZ, payload) => {
          projVec.set(worldX, worldY, worldZ).project(camera);
          if (projVec.z > 1 || projVec.z < -1) return;
          const sx = (projVec.x * 0.5 + 0.5) * cw;
          const sy = (-projVec.y * 0.5 + 0.5) * ch;
          if (sx < -80 || sx > cw + 80 || sy < -40 || sy > ch + 40) return;
          nextLabels.push({ ...payload, x: sx, y: sy });
        };

        if (worldManifest.sceneType === 'indoor' && indoorCtx) {
          const pPos = indoorCtx.principal.group.position;
          const pDist = Math.hypot(st.x - pPos.x, st.z - pPos.z);
          pushLabel(pPos.x, 2.55, pPos.z, {
            id: indoorCtx.principal.cfg.locationId,
            actionType: 'principal_indoor',
            nameZh: '校長 (Principal)',
            avatar: '🏫',
            isNearby: pDist <= indoorCtx.principal.cfg.triggerRadius,
            actionHint: 'E 對話'
          });

          const ex = worldManifest.exitDoor;
          const exDist = Math.hypot(st.x - ex.position[0], st.z - ex.position[1]);
          pushLabel(ex.position[0], 2.5, ex.position[1], {
            id: 'exit_door',
            actionType: 'exit_indoor',
            nameZh: '教室大門',
            avatar: '🚪',
            isNearby: exDist <= ex.triggerRadius,
            actionHint: 'E 出去'
          });
        } else {
          npcEntries.forEach((entry) => {
            const [nx, nz] = entry.cfg.npcPosition;
            const dist = Math.hypot(st.x - nx, st.z - nz);
            if (dist > 34 && !entry.isTeacherHere) return;
            const locMeta = locationsById[entry.cfg.locationId];
            pushLabel(nx, 2.75, nz, {
              id: entry.cfg.locationId,
              actionType: entry.cfg.indoorWorldId ? 'enter_indoor' : 'npc',
              nameZh: locMeta?.nameZh || entry.cfg.locationId,
              avatar: locMeta?.npcAvatar || '📍',
              isNearby: dist <= entry.cfg.triggerRadius,
              isTeacherHere: entry.isTeacherHere,
              actionHint: entry.cfg.indoorWorldId ? 'E 進入教室' : 'E 對話'
            });
          });
        }

        setProjectedLabels(nextLabels);
        setNearestAction(nextNearestAction);
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

  const handleActionButtonClick = () => {
    if (!nearestAction) return;
    if (nearestAction.type === 'exit') {
      propsRef.current.onExitIndoor?.();
    } else if (nearestAction.type === 'enter') {
      const b = nearestAction.building;
      propsRef.current.onEnterIndoor?.(b.indoorWorldId, toExitSpawn(b));
    } else if (nearestAction.type === 'npc') {
      propsRef.current.onInteractLocation?.(nearestAction.id);
    } else if (nearestAction.type === 'seat') {
      playerStateRef.current.seatedSeat = nearestAction.seat;
      playerStateRef.current.targetPoint = null;
      propsRef.current.onSeatChange?.(nearestAction.seat);
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden select-none">
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing touch-none" />

      {/* Projected crisp HTML labels floating above 3D landmarks / indoor NPCs */}
      {!isDialogueOpen && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
          {projectedLabels.map((lbl) => (
            <button
              key={lbl.id}
              onClick={() => handleLabelClick(lbl)}
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
                  {lbl.actionHint || 'E 對話'}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Contextual Bottom-Right Action Pill (Enter / Exit / Sit / Talk) */}
      {!isDialogueOpen && nearestAction && (
        <button
          onClick={handleActionButtonClick}
          className="absolute bottom-6 right-5 sm:right-8 z-30 px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-black text-sm shadow-2xl border-2 border-white/60 flex items-center gap-2 animate-bounce cursor-pointer active:scale-95"
        >
          <span>{nearestAction.type === 'seat' ? '💺' : nearestAction.type === 'exit' || nearestAction.type === 'enter' ? '🚪' : '💬'}</span>
          <span>{nearestAction.label}</span>
        </button>
      )}
    </div>
  );
};

export default World3DCanvas;
