/**
 * Data-driven 3D Indoor Manifest for Wutai Elementary School Classroom (霧臺國小教室).
 * Plugs into the same World3DCanvas engine via sceneType: 'indoor'.
 */

export const WUTAI_SCHOOL_INDOOR = {
  worldId: 'wutai_school_indoor',
  sceneType: 'indoor',
  parentWorldId: 'wutai',
  locationId: 'school',
  titleZh: '霧臺國小英語教室',
  titleEn: 'Wutai Elementary Classroom',
  roomSize: { width: 16, depth: 14, height: 4.8 },
  spawnPoint: [0, 4.9],
  spawnYaw: 0, // Face north toward the blackboard & podium
  exitDoor: {
    position: [0, 6.45],
    triggerRadius: 1.65,
    labelZh: '走出教室回到小鎮'
  },
  blackboard: {
    position: [0, 2.35, -6.82],
    width: 6.8,
    height: 2.1,
    greetingEn: 'Good morning! Welcome to Wutai Elementary School!'
  },
  podium: {
    stagePos: [0, -5.45],
    stageSize: [8.4, 0.24, 2.2],
    deskPos: [-1.8, -5.25],
    deskSize: [1.9, 0.9, 0.85]
  },
  windows: [
    { wall: 'left', z: -3.4 },
    { wall: 'left', z: 0.2 },
    { wall: 'left', z: 3.8 }
  ],
  bookshelf: {
    position: [6.7, -5.8],
    size: [2.0, 2.4, 0.7]
  },
  bulletinBoard: {
    position: [7.84, 2.25, 0.0],
    width: 4.2,
    height: 1.8
  },
  // 3 columns x 3 rows = 9 interactive student desk + chair pairs
  desks: (() => {
    const items = [];
    const cols = [-4.0, 0.0, 4.0];
    const rows = [-1.6, 0.9, 3.4];
    let idx = 1;
    rows.forEach((rz) => {
      cols.forEach((cx) => {
        items.push({
          id: `desk_${idx}`,
          label: `座位 ${idx}`,
          deskPos: [cx, rz],
          deskSize: [1.55, 0.78, 0.9],
          seatPos: [cx, rz + 0.78],
          seatYaw: Math.PI, // Facing -Z (north toward blackboard)
          seatHeight: 0.48
        });
        idx += 1;
      });
    });
    return items;
  })(),
  // Principal patrolling smoothly inside the classroom
  principalNpc: {
    locationId: 'school',
    startPosition: [1.6, -4.3],
    bodyColor: 0x1e3a8a,
    headColor: 0xfde68a,
    accentColor: 0x38bdf8,
    triggerRadius: 2.8,
    walkSpeed: 1.75,
    pauseSeconds: 2.4,
    waypoints: [
      [1.6, -4.3],  // Beside teacher's podium
      [-2.0, -3.3], // Front aisle left
      [-2.0, 2.2],  // Walking down left student aisle
      [2.0, 2.2],   // Walking across back aisle
      [2.0, -3.3],  // Walking up right student aisle
      [5.2, -4.4]   // Checking classroom bookshelf
    ]
  }
};
