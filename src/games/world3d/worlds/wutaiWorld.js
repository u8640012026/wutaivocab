/**
 * Data-driven 3D World Manifest for Wutai Town (霧臺小鎮 3D).
 * Designed so future cities (e.g. Tokyo, New York) can plug into the exact same
 * World3DCanvas engine simply by swapping a world config object + optional .glb URLs.
 */

export const WUTAI_3D_WORLD = {
  worldId: 'wutai',
  titleZh: '霧臺小鎮 3D',
  titleEn: 'Wutai Mountain Village',
  worldRadius: 46,
  spawnPoint: [0, 14], // [x, z] facing north toward central plaza & school
  spawnYaw: 0,
  plazaCenter: [0, 0],
  roads: [
    // Main North-South Avenue (Home -> Plaza -> School -> Bookstore/Supermarket)
    { from: [0, 26], to: [0, -24], width: 4.4 },
    // Main East-West Avenue (Station -> Plaza -> Park)
    { from: [-28, 0], to: [28, 0], width: 4.2 },
    // North Ring connecting Plaza Hall, Bookstore, Supermarket, Park
    { from: [-24, -18], to: [24, -18], width: 3.4 },
    // South Ring connecting Station, Home, Clinic, Cinema
    { from: [-22, 16], to: [24, 16], width: 3.4 }
  ],
  buildings: [
    {
      locationId: 'school',
      position: [0, -13],
      rotationY: 0,
      size: [9.5, 5.2, 6.2],
      roofColor: 0x2563eb,
      wallColor: 0xf1f5f9,
      trimColor: 0x38bdf8,
      style: 'school',
      npcPosition: [0, -8.3],
      npcBodyColor: 0x1e3a8a,
      npcHeadColor: 0xfde68a,
      triggerRadius: 3.8
    },
    {
      locationId: 'bookstore',
      position: [-12, -23],
      rotationY: 0.25,
      size: [6.8, 4.4, 5.6],
      roofColor: 0xd97706,
      wallColor: 0xfef3c7,
      trimColor: 0xf59e0b,
      style: 'bookstore',
      npcPosition: [-10.8, -18.8],
      npcBodyColor: 0xb45309,
      npcHeadColor: 0xfcd34d,
      triggerRadius: 3.5
    },
    {
      locationId: 'supermarket',
      position: [13, -22],
      rotationY: -0.25,
      size: [7.6, 4.2, 5.8],
      roofColor: 0x059669,
      wallColor: 0xecfdf5,
      trimColor: 0x34d399,
      style: 'supermarket',
      npcPosition: [11.6, -17.8],
      npcBodyColor: 0x1f2937,
      npcHeadColor: 0x374151,
      triggerRadius: 3.6
    },
    {
      locationId: 'plaza',
      position: [-23, -15],
      rotationY: 0.55,
      size: [7.6, 4.6, 6.4],
      roofColor: 0x7c3aed,
      wallColor: 0x475569,
      trimColor: 0xf472b6,
      style: 'plaza',
      npcPosition: [-19.4, -12.0],
      npcBodyColor: 0x9333ea,
      npcHeadColor: 0xfbcfe8,
      triggerRadius: 3.6
    },
    {
      locationId: 'station',
      position: [-25, 2],
      rotationY: Math.PI / 2,
      size: [7.2, 4.0, 5.4],
      roofColor: 0xea580c,
      wallColor: 0xffedd5,
      trimColor: 0xfb923c,
      style: 'station',
      npcPosition: [-20.4, 2.0],
      npcBodyColor: 0x78350f,
      npcHeadColor: 0xfef3c7,
      triggerRadius: 3.6
    },
    {
      locationId: 'park',
      position: [24, -4],
      rotationY: -Math.PI / 2,
      size: [7.8, 3.4, 7.8],
      roofColor: 0x0d9488,
      wallColor: 0x99f6e4,
      trimColor: 0x2dd4bf,
      style: 'park',
      npcPosition: [19.2, -4.0],
      npcBodyColor: 0x92400e,
      npcHeadColor: 0xfdba74,
      triggerRadius: 3.8
    },
    {
      locationId: 'clinic',
      position: [13, 14],
      rotationY: -0.3,
      size: [6.4, 4.2, 5.4],
      roofColor: 0x0284c7,
      wallColor: 0xf8fafc,
      trimColor: 0x38bdf8,
      style: 'clinic',
      npcPosition: [11.5, 10.2],
      npcBodyColor: 0xf8fafc,
      npcHeadColor: 0x94a3b8,
      triggerRadius: 3.5
    },
    {
      locationId: 'cinema',
      position: [24, 18],
      rotationY: -0.65,
      size: [8.2, 5.0, 6.2],
      roofColor: 0xbe123c,
      wallColor: 0x1e293b,
      trimColor: 0xfbbf24,
      style: 'cinema',
      npcPosition: [20.2, 14.5],
      npcBodyColor: 0xe11d48,
      npcHeadColor: 0x334155,
      triggerRadius: 3.8
    },
    {
      locationId: 'home',
      position: [-12, 22],
      rotationY: 0.3,
      size: [6.2, 4.0, 5.4],
      roofColor: 0xb45309,
      wallColor: 0xfef9c3,
      trimColor: 0x84cc16,
      style: 'home',
      npcPosition: [-10.4, 18.0],
      npcBodyColor: 0x65a30d,
      npcHeadColor: 0xfde68a,
      triggerRadius: 3.5
    }
  ],
  trees: [
    [-7, -5], [7, -5], [-7, 7], [7, 7],
    [-19, -24], [2, -26], [22, -22], [30, -14],
    [-31, -8], [-31, 12], [-21, 24], [3, 27],
    [19, 27], [31, 7], [17, -11], [-17, 10]
  ]
};
