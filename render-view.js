import * as THREE from "https://esm.sh/three@0.180.0";
import { OrbitControls } from "https://esm.sh/three@0.180.0/examples/jsm/controls/OrbitControls.js";

const root = document.getElementById("floor-plan-render-20260722");
const stage = root.querySelector(".render-stage");
const viewButtons = Array.from(root.querySelectorAll("[data-render-view]"));
const qualityButton = root.querySelector(".render-quality-toggle");
const downloadButton = root.querySelector(".render-download");

const W = 29.9;
const H = 14.82;
const TOP_H = 6.22;
const AISLE_Z = 7.82;
const FINANCE_X = 9.0;
const MEETING_X = 20.9;
const WALL_H = 2.65;
const WALL_T = 0.16;
const FLOOR_T = 0.06;
const DOOR_H = 2.12;

function canvasTexture(width, height, draw, repeatX = 1, repeatY = 1) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  draw(context, width, height);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(repeatX, repeatY);
  texture.anisotropy = 4;
  return texture;
}

function random(seed) {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

const marbleTexture = canvasTexture(1024, 1024, (ctx, width, height) => {
  const rand = random(18);
  ctx.fillStyle = "#f8f4ed";
  ctx.fillRect(0, 0, width, height);
  for (let i = 0; i < 72; i += 1) {
    ctx.beginPath();
    ctx.moveTo(rand() * width, rand() * height);
    for (let j = 0; j < 4; j += 1) {
      ctx.lineTo(rand() * width, rand() * height);
    }
    ctx.strokeStyle = i % 7 === 0 ? "rgba(173, 127, 69, 0.28)" : "rgba(118, 112, 103, 0.12)";
    ctx.lineWidth = i % 7 === 0 ? 3.4 : 1.4;
    ctx.stroke();
  }
}, 5, 3);

const carpetTexture = canvasTexture(1024, 512, (ctx, width, height) => {
  ctx.fillStyle = "#eee9df";
  ctx.fillRect(0, 0, width, height);
  for (let y = 22; y < height; y += 34) {
    ctx.fillStyle = y % 68 === 22 ? "rgba(49, 41, 34, 0.82)" : "rgba(93, 78, 64, 0.5)";
    ctx.fillRect(0, y, width, 12);
  }
  ctx.fillStyle = "rgba(172, 101, 65, 0.5)";
  for (let x = 80; x < width; x += 180) {
    ctx.fillRect(x, 0, 8, height);
  }
}, 2, 1);

const officeCarpetTexture = canvasTexture(1024, 1024, (ctx, width, height) => {
  const rand = random(44);
  ctx.fillStyle = "#8e9292";
  ctx.fillRect(0, 0, width, height);
  for (let y = 0; y < height; y += 128) {
    for (let x = 0; x < width; x += 128) {
      ctx.fillStyle = (x / 128 + y / 128) % 2 === 0 ? "#9ba0a0" : "#7f8585";
      ctx.fillRect(x, y, 128, 128);
      ctx.strokeStyle = "rgba(255,255,255,0.16)";
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, 128, 128);
      for (let i = 0; i < 18; i += 1) {
        ctx.strokeStyle = `rgba(45, 49, 49, ${0.08 + rand() * 0.12})`;
        ctx.beginPath();
        if ((x / 128 + y / 128) % 2 === 0) {
          const lx = x + rand() * 128;
          ctx.moveTo(lx, y);
          ctx.lineTo(lx + (rand() - 0.5) * 18, y + 128);
        } else {
          const ly = y + rand() * 128;
          ctx.moveTo(x, ly);
          ctx.lineTo(x + 128, ly + (rand() - 0.5) * 18);
        }
        ctx.stroke();
      }
    }
  }
}, 2.6, 2.6);

const ceilingTileTexture = canvasTexture(512, 512, (ctx, width, height) => {
  ctx.fillStyle = "#f5f4f1";
  ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = "rgba(82, 82, 78, 0.22)";
  ctx.lineWidth = 2;
  for (let x = 0; x <= width; x += 64) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y <= height; y += 64) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
  ctx.fillStyle = "rgba(80, 80, 78, 0.18)";
  for (let y = 8; y < height; y += 16) {
    for (let x = 8; x < width; x += 16) {
      ctx.fillRect(x, y, 1.5, 1.5);
    }
  }
}, 3, 3);

function artTexture(base, accent) {
  return canvasTexture(512, 512, (ctx, width, height) => {
    ctx.fillStyle = "#f6f0e8";
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = base;
    ctx.globalAlpha = 0.8;
    ctx.fillRect(width * 0.18, height * 0.14, width * 0.58, height * 0.68);
    ctx.fillStyle = accent;
    ctx.globalAlpha = 0.62;
    ctx.beginPath();
    ctx.ellipse(width * 0.58, height * 0.45, width * 0.24, height * 0.2, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = "rgba(255, 245, 194, 0.95)";
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.moveTo(width * 0.26, height * 0.22);
    ctx.bezierCurveTo(width * 0.5, height * 0.55, width * 0.22, height * 0.72, width * 0.78, height * 0.82);
    ctx.stroke();
  });
}

const scene = new THREE.Scene();
scene.background = new THREE.Color("#f2f0eb");
scene.fog = new THREE.Fog("#f2f0eb", 40, 72);

let renderQuality = localStorage.getItem("office-render-quality") === "fast" ? "fast" : "crisp";
function renderPixelRatio() {
  if (renderQuality === "fast") return 1;
  return Math.min(window.devicePixelRatio || 1, 2);
}

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: false,
  preserveDrawingBuffer: false,
  powerPreference: "high-performance"
});
renderer.setPixelRatio(renderPixelRatio());
renderer.shadowMap.enabled = false;
renderer.shadowMap.type = THREE.PCFShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.08;
stage.prepend(renderer.domElement);

const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 120);
const renderTargets = {
  reception: {
    position: new THREE.Vector3(10.55, 1.38, 13.55),
    target: new THREE.Vector3(13.55, 1.02, 8.25)
  },
  room1: {
    position: new THREE.Vector3(1.52, 1.34, 5.92),
    target: new THREE.Vector3(1.48, 1.02, 1.62)
  },
  room2: {
    position: new THREE.Vector3(6.0, 1.34, 5.92),
    target: new THREE.Vector3(6.0, 1.02, 2.15)
  },
  room3: {
    position: new THREE.Vector3(13.5, 1.34, 5.92),
    target: new THREE.Vector3(13.5, 1.02, 2.15)
  },
  room4: {
    position: new THREE.Vector3(19.5, 1.34, 5.92),
    target: new THREE.Vector3(19.5, 1.02, 2.15)
  },
  room5: {
    position: new THREE.Vector3(22.5, 1.34, 5.92),
    target: new THREE.Vector3(22.5, 1.02, 2.15)
  },
  room6: {
    position: new THREE.Vector3(26.9, 1.34, 5.92),
    target: new THREE.Vector3(26.9, 1.02, 2.15)
  },
  room7: {
    position: new THREE.Vector3(0.85, 1.32, 10.15),
    target: new THREE.Vector3(7.55, 1.02, 10.15)
  },
  room8: {
    position: new THREE.Vector3(1.0, 1.26, 14.38),
    target: new THREE.Vector3(6.75, 1.0, 13.72)
  },
  room9: {
    position: new THREE.Vector3(21.55, 1.34, 12.85),
    target: new THREE.Vector3(28.15, 1.02, 10.75)
  }
};
camera.position.copy(renderTargets.reception.position);
camera.lookAt(renderTargets.reception.target);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.copy(renderTargets.reception.target);
controls.enableDamping = false;
controls.dampingFactor = 0;
controls.enablePan = false;
controls.minDistance = 1.7;
controls.maxDistance = 22;
controls.minPolarAngle = Math.PI * 0.12;
controls.maxPolarAngle = Math.PI * 0.58;
controls.update();

const model = new THREE.Group();
scene.add(model);

function mat(color, roughness = 0.65, metalness = 0) {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness });
}

const materials = {
  base: mat("#d8d4ca", 0.9),
  wall: mat("#fbf8f1", 0.78),
  innerWall: mat("#f2eee6", 0.74),
  featureWall: mat("#efe6d8", 0.62),
  floor: new THREE.MeshStandardMaterial({
    color: "#f6f0e7",
    map: marbleTexture,
    roughness: 0.34,
    metalness: 0
  }),
  corridorFloor: mat("#e1dfdb", 0.76),
  pantryFloor: mat("#e6e2d9", 0.72),
  officeCarpet: new THREE.MeshStandardMaterial({ color: "#8d9292", map: officeCarpetTexture, roughness: 0.96 }),
  ceiling: new THREE.MeshStandardMaterial({ color: "#fbfaf6", roughness: 0.76, side: THREE.DoubleSide }),
  ceilingTile: new THREE.MeshStandardMaterial({ color: "#f3f2ef", map: ceilingTileTexture, roughness: 0.86, side: THREE.DoubleSide }),
  blackSlot: mat("#161616", 0.4, 0.2),
  lightPanel: new THREE.MeshStandardMaterial({
    color: "#fff8dc",
    emissive: "#fff1bd",
    emissiveIntensity: 2.8,
    roughness: 0.2
  }),
  whitePanel: mat("#ffffff", 0.55),
  warmPanel: mat("#d3bc9f", 0.58),
  glass: new THREE.MeshStandardMaterial({
    color: "#c7dbe0",
    roughness: 0.18,
    metalness: 0,
    transparent: true,
    opacity: 0.34,
    side: THREE.DoubleSide,
    depthWrite: false
  }),
  glassDoor: new THREE.MeshStandardMaterial({
    color: "#c8dfe5",
    roughness: 0.18,
    metalness: 0,
    transparent: true,
    opacity: 0.38,
    side: THREE.DoubleSide,
    depthWrite: false
  }),
  frame: mat("#b89b6b", 0.28, 0.5),
  darkFrame: mat("#25231f", 0.35, 0.3),
  wood: mat("#a26a43", 0.46, 0.06),
  darkWood: mat("#6e3e29", 0.48, 0.05),
  stone: new THREE.MeshStandardMaterial({ color: "#f8f2e8", map: marbleTexture, roughness: 0.34, metalness: 0.02 }),
  fabric: mat("#ede5dc", 0.92),
  taupeFabric: mat("#b7aea2", 0.9),
  cognacFabric: mat("#b87445", 0.78),
  chair: mat("#dde1dc", 0.86),
  device: mat("#22272b", 0.32, 0.16),
  screen: new THREE.MeshStandardMaterial({
    color: "#1d313f",
    emissive: "#69b7df",
    emissiveIntensity: 0.22,
    roughness: 0.3,
    metalness: 0.05
  }),
  rug: new THREE.MeshStandardMaterial({ color: "#f0e9dd", map: carpetTexture, roughness: 0.94 }),
  blueCabinet: mat("#536b80", 0.56, 0.02),
  plant: mat("#637b5f", 0.8),
  glow: new THREE.MeshStandardMaterial({
    color: "#fff5c8",
    emissive: "#ffe9a0",
    emissiveIntensity: 2.2,
    roughness: 0.26
  }),
  art: new THREE.MeshStandardMaterial({ map: artTexture("#b87643", "#f4eee2"), roughness: 0.5 })
};

function addBox(width, height, depth, x, y, z, material, parent = model, cast = true, receive = true) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), material);
  mesh.position.set(x, y, z);
  mesh.castShadow = cast;
  mesh.receiveShadow = receive;
  parent.add(mesh);
  return mesh;
}

function addCylinder(radiusTop, radiusBottom, height, x, y, z, material, parent = model, segments = 16) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radiusTop, radiusBottom, height, segments), material);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function addFloor(x0, z0, x1, z1, material = materials.floor) {
  return addBox(x1 - x0 - 0.04, FLOOR_T, z1 - z0 - 0.04, (x0 + x1) / 2, 0, (z0 + z1) / 2, material, model, false, true);
}

function addWall(x0, z0, x1, z1, height = WALL_H, material = materials.wall, thickness = WALL_T) {
  const dx = x1 - x0;
  const dz = z1 - z0;
  const length = Math.hypot(dx, dz);
  if (length < 0.02) return null;
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(length, height, thickness), material);
  mesh.position.set((x0 + x1) / 2, height / 2 + 0.04, (z0 + z1) / 2);
  mesh.rotation.y = -Math.atan2(dz, dx);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  model.add(mesh);
  return mesh;
}

function addGlassWall(x0, z0, x1, z1, height = WALL_H) {
  const dx = x1 - x0;
  const dz = z1 - z0;
  const length = Math.hypot(dx, dz);
  if (length < 0.02) return null;
  const group = new THREE.Group();
  group.position.set((x0 + x1) / 2, 0.04, (z0 + z1) / 2);
  group.rotation.y = -Math.atan2(dz, dx);

  addBox(length, height - 0.18, 0.055, 0, height / 2, 0, materials.glass, group, false, true).renderOrder = 2;
  addBox(length + 0.06, 0.08, 0.1, 0, 0.05, 0, materials.frame, group);
  addBox(length + 0.06, 0.075, 0.1, 0, height - 0.05, 0, materials.frame, group);
  const count = Math.max(1, Math.ceil(length / 2.35));
  for (let i = 0; i <= count; i += 1) {
    addBox(0.05, height, 0.1, -length / 2 + length * i / count, height / 2, 0, materials.frame, group);
  }
  model.add(group);
  return group;
}

function addDoorX(hingeX, z, width, spanSign, angleSign, material = materials.glassDoor) {
  const pivot = new THREE.Group();
  pivot.position.set(hingeX, 0.06, z);
  pivot.rotation.y = angleSign * THREE.MathUtils.degToRad(57);
  addBox(width, DOOR_H, 0.045, spanSign * width / 2, DOOR_H / 2, 0, material, pivot, material !== materials.glassDoor, true);
  model.add(pivot);
  return pivot;
}

function addDoorZ(x, hingeZ, width, spanSign, angleSign) {
  const pivot = new THREE.Group();
  pivot.position.set(x, 0.06, hingeZ);
  pivot.rotation.y = angleSign * THREE.MathUtils.degToRad(57);
  addBox(0.045, DOOR_H, width, 0, DOOR_H / 2, spanSign * width / 2, materials.wood, pivot, true, true);
  model.add(pivot);
  return pivot;
}

function localOffset(localX, localZ, rotation) {
  return {
    x: localX * Math.cos(rotation) + localZ * Math.sin(rotation),
    z: -localX * Math.sin(rotation) + localZ * Math.cos(rotation)
  };
}

function addOfficeChair(x, z, rotation = 0, material = materials.chair) {
  const group = new THREE.Group();
  group.position.set(x, 0.04, z);
  group.rotation.y = rotation;
  addCylinder(0.24, 0.27, 0.055, 0, 0.06, 0, materials.darkFrame, group, 12);
  addCylinder(0.035, 0.045, 0.4, 0, 0.28, 0, materials.darkFrame, group, 12);
  addBox(0.48, 0.1, 0.44, 0, 0.52, 0, material, group);
  addBox(0.48, 0.46, 0.075, 0, 0.78, 0.2, material, group);
  model.add(group);
  return group;
}

function addDesk(x, z, rotation = 0, width = 1.2, depth = 0.6, monitor = true) {
  const group = new THREE.Group();
  group.position.set(x, 0.04, z);
  group.rotation.y = rotation;
  addBox(width, 0.08, depth, 0, 0.76, 0, materials.whitePanel, group);
  addBox(width * 0.96, 0.035, depth * 0.92, 0, 0.825, 0, materials.stone, group);
  addBox(width * 0.98, 0.26, 0.045, 0, 0.96, depth / 2 + 0.04, materials.whitePanel, group);
  addBox(width * 0.88, 0.16, 0.035, 0, 1.0, depth / 2 + 0.072, materials.glass, group, false, true);
  [-1, 1].forEach((sx) => {
    [-1, 1].forEach((sz) => {
      addBox(0.045, 0.7, 0.045, sx * (width / 2 - 0.09), 0.38, sz * (depth / 2 - 0.08), materials.frame, group);
    });
  });
  addBox(0.54, 0.025, 0.18, 0, 0.86, 0.1, materials.device, group, false, true);
  if (monitor) {
    addBox(0.52, 0.32, 0.04, 0, 1.15, -0.16, materials.screen, group);
    addBox(0.045, 0.2, 0.035, 0, 0.96, -0.16, materials.darkFrame, group);
  }
  model.add(group);
  return group;
}

function addDeskSet(x, z, rotation = 0, width = 1.2, depth = 0.6, visitor = false) {
  addDesk(x, z, rotation, width, depth, true);
  const staff = localOffset(0, depth / 2 + 0.42, rotation);
  addOfficeChair(x + staff.x, z + staff.z, rotation);
  if (visitor) {
    const guest = localOffset(0, -(depth / 2 + 0.42), rotation);
    addOfficeChair(x + guest.x, z + guest.z, rotation + Math.PI, materials.taupeFabric);
  }
}

function addMeetingTable(x, z, width, depth, chairsPerLong = 3, rotation = 0, endChairs = true) {
  const group = new THREE.Group();
  group.position.set(x, 0.04, z);
  group.rotation.y = rotation;
  addBox(width, 0.09, depth, 0, 0.76, 0, materials.wood, group);
  addBox(width * 0.97, 0.04, depth * 0.92, 0, 0.835, 0, materials.stone, group);
  [-1, 1].forEach((sx) => {
    [-1, 1].forEach((sz) => {
      addBox(0.065, 0.68, 0.065, sx * (width / 2 - 0.2), 0.38, sz * (depth / 2 - 0.16), materials.frame, group);
    });
  });
  model.add(group);

  for (let i = 0; i < chairsPerLong; i += 1) {
    const localX = chairsPerLong === 1 ? 0 : -width * 0.34 + i * (width * 0.68 / (chairsPerLong - 1));
    const south = localOffset(localX, depth / 2 + 0.48, rotation);
    const north = localOffset(localX, -(depth / 2 + 0.48), rotation);
    addOfficeChair(x + south.x, z + south.z, rotation);
    addOfficeChair(x + north.x, z + north.z, rotation + Math.PI);
  }
  if (endChairs) {
    const east = localOffset(width / 2 + 0.48, 0, rotation);
    const west = localOffset(-(width / 2 + 0.48), 0, rotation);
    addOfficeChair(x + east.x, z + east.z, rotation + Math.PI / 2);
    addOfficeChair(x + west.x, z + west.z, rotation - Math.PI / 2);
  }
}

function addAreaRug(x, z, width, depth, rotation = 0) {
  const rug = addBox(width, 0.025, depth, x, 0.055, z, materials.rug, model, false, true);
  rug.rotation.y = rotation;
  return rug;
}

function addSofa(x, z, width = 2.4, rotation = 0) {
  const group = new THREE.Group();
  group.position.set(x, 0.04, z);
  group.rotation.y = rotation;
  const depth = 0.84;
  addBox(width, 0.22, depth, 0, 0.22, 0, materials.darkFrame, group);
  addBox(width * 0.84, 0.2, depth * 0.68, 0, 0.42, -0.02, materials.fabric, group);
  addBox(width * 0.86, 0.62, 0.18, 0, 0.72, depth / 2 - 0.08, materials.fabric, group);
  addBox(0.2, 0.48, depth * 0.9, -width / 2 + 0.1, 0.52, 0, materials.fabric, group);
  addBox(0.2, 0.48, depth * 0.9, width / 2 - 0.1, 0.52, 0, materials.fabric, group);
  addBox(0.38, 0.28, 0.11, -width * 0.22, 0.9, depth / 2 - 0.18, materials.taupeFabric, group);
  addBox(0.38, 0.28, 0.11, width * 0.18, 0.9, depth / 2 - 0.18, materials.cognacFabric, group);
  model.add(group);
  return group;
}

function addReceptionDesk(x, z, width = 3.05, rotation = 0) {
  const group = new THREE.Group();
  group.position.set(x, 0.04, z);
  group.rotation.y = rotation;
  const depth = 0.78;
  addBox(width, 0.78, depth, 0, 0.46, 0, materials.darkWood, group);
  addBox(width * 0.88, 0.52, 0.035, 0, 0.5, depth / 2 + 0.02, materials.cognacFabric, group);
  addBox(width * 1.04, 0.075, depth * 1.05, 0, 0.9, 0, materials.stone, group);
  addBox(0.62, 0.36, 0.045, 0.18, 1.24, -0.13, materials.screen, group);
  addBox(0.12, 0.25, 0.12, 1.1, 1.1, 0.05, materials.frame, group);
  model.add(group);
  const chairOffset = localOffset(0, -(depth / 2 + 0.5), rotation);
  addOfficeChair(x + chairOffset.x, z + chairOffset.z, rotation + Math.PI);
  return group;
}

function addCabinet(x, z, width = 1.25, rotation = 0) {
  const group = new THREE.Group();
  group.position.set(x, 0.04, z);
  group.rotation.y = rotation;
  addBox(width, 1.3, 0.36, 0, 0.65, 0, materials.innerWall, group);
  addBox(0.02, 1.16, 0.38, 0, 0.66, 0, materials.frame, group);
  model.add(group);
}

function addPrinterUnit(x, z, rotation = 0) {
  const group = new THREE.Group();
  group.position.set(x, 0.04, z);
  group.rotation.y = rotation;
  addBox(0.78, 0.62, 0.52, 0, 0.31, 0, materials.innerWall, group);
  addBox(0.62, 0.2, 0.42, 0, 0.73, 0, materials.device, group);
  model.add(group);
}

function addDisplayStand(x, z, rotation = 0) {
  const group = new THREE.Group();
  group.position.set(x, 0.04, z);
  group.rotation.y = rotation;
  addBox(1.5, 0.76, 0.06, 0, 1.26, 0, materials.device, group);
  addBox(0.78, 0.06, 0.48, 0, 0.15, 0, materials.frame, group);
  addCylinder(0.04, 0.05, 0.68, 0, 0.52, 0, materials.frame, group, 14);
  model.add(group);
}

function addBreakroomCounter(x, z, width = 3.5) {
  const group = new THREE.Group();
  group.position.set(x, 0.04, z);
  const depth = 0.52;
  addBox(width, 0.76, depth, 0, 0.42, 0, materials.innerWall, group);
  addBox(width * 1.02, 0.07, depth * 1.06, 0, 0.84, -0.01, materials.stone, group);
  addBox(0.76, 0.04, 0.36, -0.82, 0.9, -0.02, materials.device, group);
  addCylinder(0.025, 0.03, 0.34, -0.82, 1.08, 0.14, materials.frame, group, 10);
  addBox(0.62, 0.42, 0.38, 0.95, 1.08, -0.02, materials.device, group);
  addBox(1.25, 0.45, 0.28, -0.08, 1.43, 0.14, materials.innerWall, group);
  model.add(group);
}

function addFridge(x, z, rotation = 0) {
  const group = new THREE.Group();
  group.position.set(x, 0.04, z);
  group.rotation.y = rotation;
  addBox(0.74, 1.65, 0.62, 0, 0.82, 0, materials.device, group);
  addBox(0.68, 1.02, 0.035, 0, 1.08, -0.325, materials.stone, group, false, true);
  addBox(0.68, 0.48, 0.035, 0, 0.32, -0.325, materials.innerWall, group, false, true);
  model.add(group);
}

function addLoungeChair(x, z, rotation = 0) {
  const group = new THREE.Group();
  group.position.set(x, 0.04, z);
  group.rotation.y = rotation;
  addBox(0.58, 0.18, 0.5, 0, 0.38, 0, materials.fabric, group);
  addBox(0.58, 0.48, 0.12, 0, 0.66, 0.22, materials.fabric, group);
  model.add(group);
}

function addCafeTable(x, z, width = 1.2, depth = 0.56) {
  const group = new THREE.Group();
  group.position.set(x, 0.04, z);
  addBox(width, 0.07, depth, 0, 0.68, 0, materials.stone, group);
  addCylinder(0.055, 0.07, 0.62, 0, 0.35, 0, materials.frame, group, 14);
  model.add(group);
  addLoungeChair(x, z - 0.66, Math.PI);
  addLoungeChair(x, z + 0.66, 0);
}

function addPlant(x, z, scale = 1) {
  const group = new THREE.Group();
  group.position.set(x, 0.04, z);
  group.scale.setScalar(scale);
  addCylinder(0.23, 0.18, 0.36, 0, 0.18, 0, materials.stone, group, 14);
  addCylinder(0.035, 0.045, 0.9, 0, 0.68, 0, materials.darkWood, group, 10);
  for (let i = 0; i < 12; i += 1) {
    const angle = i * Math.PI * 2 / 12;
    const leaf = addBox(0.38, 0.025, 0.1, Math.cos(angle) * 0.18, 1.0 + (i % 3) * 0.08, Math.sin(angle) * 0.18, materials.plant, group);
    leaf.rotation.y = -angle;
    leaf.rotation.z = i % 2 ? 0.32 : -0.28;
  }
  model.add(group);
}

function addCeiling(x0, z0, x1, z1, style = "smooth") {
  const cx = (x0 + x1) / 2;
  const cz = (z0 + z1) / 2;
  const width = x1 - x0;
  const depth = z1 - z0;
  const y = 2.72;
  const material = style === "tile" ? materials.ceilingTile : materials.ceiling;
  addBox(width, 0.08, depth, cx, y, cz, material, model, false, true);

  addBox(width - 0.36, 0.035, 0.045, cx, y - 0.09, z0 + 0.28, materials.lightPanel, model, false, false);
  addBox(width - 0.36, 0.035, 0.045, cx, y - 0.09, z1 - 0.28, materials.lightPanel, model, false, false);
  addBox(0.045, 0.035, depth - 0.36, x0 + 0.28, y - 0.09, cz, materials.lightPanel, model, false, false);
  addBox(0.045, 0.035, depth - 0.36, x1 - 0.28, y - 0.09, cz, materials.lightPanel, model, false, false);

  const spanCount = Math.max(2, Math.round(width / 2.7));
  for (let i = 0; i < spanCount; i += 1) {
    const lx = x0 + width * (i + 0.5) / spanCount;
    addBox(0.15, 0.025, depth * 0.62, lx, y - 0.1, cz, materials.blackSlot, model, false, false);
    addBox(0.07, 0.03, depth * 0.56, lx, y - 0.13, cz, materials.lightPanel, model, false, false);
  }

  const lightCount = Math.max(2, Math.round(width / 2.8));
  for (let i = 0; i < lightCount; i += 1) {
    const lx = x0 + width * (i + 0.5) / lightCount;
    addBox(0.09, 0.028, depth * 0.32, lx, y - 0.145, cz, materials.lightPanel, model, false, false);
  }
}

function addWallPanelZ(x, y, z, width, height, material = materials.whitePanel) {
  return addBox(width, height, 0.045, x, y, z, material, model, true, true);
}

function addWallPanelX(x, y, z, width, height, material = materials.whitePanel) {
  return addBox(0.045, height, width, x, y, z, material, model, true, true);
}

function addWallArtZ(x, z, width = 0.82, height = 1.12, material = materials.art) {
  const art = new THREE.Mesh(new THREE.PlaneGeometry(width, height), material);
  art.position.set(x, 1.5, z);
  art.rotation.y = 0;
  art.castShadow = false;
  model.add(art);
  addBox(width + 0.08, height + 0.08, 0.035, x, 1.5, z - 0.018, materials.frame, model, false, true);
  return art;
}

function addBookcaseZ(x, z, width = 2.1, color = materials.blueCabinet) {
  const group = new THREE.Group();
  group.position.set(x, 0.04, z);
  addBox(width, 2.0, 0.34, 0, 1.03, 0, color, group);
  [-0.72, 0, 0.72].forEach((sx) => addBox(0.045, 1.82, 0.36, sx, 1.04, -0.01, materials.whitePanel, group));
  [0.52, 0.98, 1.44].forEach((sy) => addBox(width * 0.9, 0.04, 0.36, 0, sy, -0.01, materials.whitePanel, group));
  const colors = ["#f4eee4", "#d6bfa0", "#293541", "#a76846", "#e8dfd2"];
  for (let row = 0; row < 3; row += 1) {
    for (let i = 0; i < 7; i += 1) {
      addBox(0.1, 0.28 + (i % 2) * 0.08, 0.08, -width * 0.38 + i * width * 0.12, 0.48 + row * 0.47, -0.21, mat(colors[(i + row) % colors.length], 0.66), group);
    }
  }
  model.add(group);
  return group;
}

function addSuspendedLight(x, z, length = 2.8, rotation = 0) {
  const group = new THREE.Group();
  group.position.set(x, 0, z);
  group.rotation.y = rotation;
  addBox(0.03, 0.34, 0.03, -length / 2 + 0.2, 2.5, 0, materials.blackSlot, group, false, false);
  addBox(0.03, 0.34, 0.03, length / 2 - 0.2, 2.5, 0, materials.blackSlot, group, false, false);
  addBox(length, 0.08, 0.13, 0, 2.31, 0, materials.blackSlot, group, false, false);
  addBox(length * 0.92, 0.032, 0.1, 0, 2.25, 0, materials.lightPanel, group, false, false);
  model.add(group);
}

function addPlanter(x, z, width = 0.92, rotation = 0) {
  const group = new THREE.Group();
  group.position.set(x, 0.04, z);
  group.rotation.y = rotation;
  addBox(width, 0.22, 0.28, 0, 0.16, 0, materials.whitePanel, group);
  [-0.28, 0, 0.28].forEach((offset) => {
    addCylinder(0.025, 0.03, 0.48, offset, 0.52, 0, materials.plant, group, 8);
    const leaf = addBox(0.24, 0.025, 0.08, offset + 0.08, 0.74, 0.02, materials.plant, group);
    leaf.rotation.z = 0.35;
  });
  model.add(group);
}

function labelTexture(name, dimensions) {
  const canvas = document.createElement("canvas");
  canvas.width = 768;
  canvas.height = 296;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.strokeStyle = "rgba(98, 91, 82, 0.25)";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.roundRect(16, 16, 736, 264, 32);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#24221f";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = '600 68px "PingFang SC", "Microsoft YaHei", sans-serif';
  ctx.fillText(name, 384, 104);
  ctx.fillStyle = "#6d675f";
  ctx.font = '400 48px "PingFang SC", "Microsoft YaHei", sans-serif';
  ctx.fillText(dimensions, 384, 200);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  return texture;
}

function addLabel(name, dimensions, x, z, scale = 2.3) {
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
    map: labelTexture(name, dimensions),
    transparent: true,
    depthTest: false,
    depthWrite: false
  }));
  sprite.position.set(x, 2.14, z);
  sprite.scale.set(scale, scale * 0.43, 1);
  sprite.renderOrder = 50;
  model.add(sprite);
}

function addFeatureArt(x, z) {
  const panel = addBox(2.7, 1.12, 0.035, x, 0.76, z, materials.featureWall, model, true, true);
  panel.rotation.y = 0;
  const art = new THREE.Mesh(new THREE.PlaneGeometry(0.86, 0.86), materials.art);
  art.position.set(x + 0.86, 1.12, z + 0.025);
  art.rotation.y = 0;
  model.add(art);
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(x - 0.9, 1.26, z + 0.055),
    new THREE.Vector3(x - 0.54, 1.0, z + 0.055),
    new THREE.Vector3(x - 0.78, 0.74, z + 0.055),
    new THREE.Vector3(x - 0.18, 0.62, z + 0.055),
    new THREE.Vector3(x + 0.18, 0.88, z + 0.055)
  ]);
  const neon = new THREE.Mesh(new THREE.TubeGeometry(curve, 20, 0.012, 6, false), materials.glow);
  neon.castShadow = false;
  model.add(neon);
}

function addCeilingHints() {
  [
    [1.5, 0.45], [6, 0.45], [13.5, 0.45], [19.5, 0.45], [22.5, 0.45], [27, 0.45],
    [4.5, 13.95], [25.4, 8.55], [14.8, 8.55]
  ].forEach(([x, z]) => {
    addBox(0.72, 0.035, 0.05, x, 1.88, z, materials.glow, model, false, false);
  });
}

addBox(W + 0.6, 0.2, H + 0.6, W / 2, -0.17, H / 2, materials.base, model, false, true);
addFloor(0, 0, 3, TOP_H, materials.officeCarpet);
addFloor(3, 0, 9, TOP_H, materials.officeCarpet);
addFloor(9, 0, 18, TOP_H, materials.officeCarpet);
addFloor(18, 0, 21, TOP_H, materials.officeCarpet);
addFloor(21, 0, 24, TOP_H, materials.officeCarpet);
addFloor(24, 0, W, TOP_H, materials.officeCarpet);
addFloor(0, TOP_H, W, AISLE_Z, materials.floor);
addFloor(0, AISLE_Z, FINANCE_X, 12.82, materials.officeCarpet);
addFloor(0, 12.82, FINANCE_X, H, materials.pantryFloor);
addFloor(FINANCE_X, AISLE_Z, MEETING_X, H);
addFloor(MEETING_X, AISLE_Z, W, H, materials.officeCarpet);

addWall(0, 0, W, 0, WALL_H);
addWall(0, 0, 0, H, WALL_H);
addWall(W, 0, W, H, WALL_H);
addWall(0, H, 12.9, H, WALL_H);
addWall(15.2, H, W, H, WALL_H);
[3, 9, 18, 21, 24].forEach((x) => addWall(x, 0, x, TOP_H, WALL_H, materials.innerWall));

[
  [0, 3],
  [3, 9],
  [9, 18],
  [18, 21],
  [21, 24],
  [24, W]
].forEach(([x0, x1]) => {
  const doorWidth = 0.9;
  const doorX = x1 - doorWidth - 0.35;
  addGlassWall(x0, TOP_H, doorX, TOP_H);
  addGlassWall(doorX + doorWidth, TOP_H, x1, TOP_H);
  addDoorX(doorX + doorWidth, TOP_H, doorWidth, -1, -1);
});

addGlassWall(0, AISLE_Z, 7.65, AISLE_Z);
addGlassWall(8.6, AISLE_Z, 10.7, AISLE_Z);
addWall(10.7, AISLE_Z, 16.2, AISLE_Z, WALL_H, materials.featureWall);
addFeatureArt(13.45, AISLE_Z + 0.11);
addReceptionDesk(14.35, 9.45, 3.05);
addSofa(9.72, 9.7, 2.4, -Math.PI / 2);
addGlassWall(19.4, AISLE_Z, W, AISLE_Z);
addDoorX(8.6, AISLE_Z, 0.95, -1, 1);

addWall(FINANCE_X, AISLE_Z, FINANCE_X, 13.35, WALL_H, materials.innerWall);
addWall(FINANCE_X, 14.3, FINANCE_X, H, WALL_H, materials.innerWall);
addDoorZ(FINANCE_X, 14.3, 0.95, -1, 1);
addWall(0, 12.82, FINANCE_X, 12.82, WALL_H, materials.innerWall);

addWall(MEETING_X, AISLE_Z, MEETING_X, 8.17, WALL_H, materials.innerWall);
addWall(MEETING_X, 9.12, MEETING_X, H, WALL_H, materials.innerWall);
addDoorZ(MEETING_X, 9.12, 0.95, -1, -1);
addDoorX(12.9, H, 1.05, 1, 1, materials.wood);
addDoorX(15.2, H, 1.05, -1, -1, materials.wood);

addBox(0.78, 2.05, 0.78, 13.8, 1.06, 5.0, materials.featureWall);
addBox(0.78, 2.05, 0.78, 21.9, 1.06, 5.0, materials.featureWall);

addDeskSet(1.4, 2.55, 0, 1.2, 0.6, true);
addCabinet(1.45, 0.38, 1.45, 0);
addDeskSet(4.55, 2.0, 0, 1.2, 0.6, false);
addDeskSet(7.25, 2.0, 0, 1.2, 0.6, false);
addAreaRug(5.95, 4.45, 3.0, 1.85);
addMeetingTable(5.95, 4.45, 2.15, 0.86, 2, 0, false);
addPrinterUnit(3.55, 5.45, 0);
[10.7, 13.5, 16.25].forEach((x) => addDeskSet(x, 1.55, 0, 1.2, 0.6, false));
[10.7, 13.5, 16.25].forEach((x) => addDeskSet(x, 4.15, 0, 1.2, 0.6, false));
addPrinterUnit(9.45, 5.45, 0);
addDeskSet(19.45, 2.45, 0, 1.2, 0.6, true);
addCabinet(19.45, 0.38, 1.35, 0);
addDeskSet(22.45, 2.45, 0, 1.2, 0.6, true);
addCabinet(22.45, 0.38, 1.35, 0);
addAreaRug(26.75, 3.25, 4.35, 2.65);
addMeetingTable(26.75, 3.25, 3.15, 1.15, 3, 0, true);
addDisplayStand(26.75, 0.45, 0);

[9.25, 11.35].forEach((z) => {
  addDeskSet(2.25, z, -Math.PI / 2, 1.2, 0.6, false);
  addDeskSet(6.75, z, Math.PI / 2, 1.2, 0.6, false);
});
addPrinterUnit(0.55, 9.95, Math.PI / 2);
addFridge(0.55, 14.42, 0);
addBreakroomCounter(2.75, 14.46, 3.5);
addCafeTable(5.25, 13.75, 1.2, 0.56);
addSofa(7.0, 14.25, 1.55, 0);
addAreaRug(25.45, 11.35, 5.25, 2.72);
addMeetingTable(25.45, 11.35, 4.15, 1.32, 4, 0, true);
addDisplayStand(28.85, 8.55, Math.PI / 2);
addPlant(17.4, 10.25, 0.85);
addPlant(28.8, 13.8, 0.8);

[
  ["1号房间", "3.00 × 6.22m", 1.5, 3.05, 1.7],
  ["2号房间", "6.00 × 6.22m", 6.0, 3.05, 1.85],
  ["3号房间", "9.00 × 6.22m", 13.5, 3.05, 2.0],
  ["4号房间", "3.00 × 6.22m", 19.5, 3.05, 1.65],
  ["5号房间", "3.00 × 6.22m", 22.5, 3.05, 1.65],
  ["6号房间", "5.90 × 6.22m", 26.95, 3.05, 1.85],
  ["7号房间", "9.00 × 5.00m", 4.5, 10.3, 1.95],
  ["8号房间", "9.00 × 2.00m", 4.5, 13.77, 1.85],
  ["9号房间", "9.00 × 7.00m", 25.4, 11.3, 2.0]
].forEach(([name, dimensions, x, z, scale]) => addLabel(name, dimensions, x, z, scale));

addSuspendedLight(14.35, 9.3, 3.2, 0);
addSuspendedLight(25.45, 11.35, 4.6, 0);

addCylinder(0.62, 0.62, 0.1, 11.15, 0.42, 10.0, materials.stone, model, 24);
addCylinder(0.08, 0.08, 0.38, 11.15, 0.22, 10.0, materials.frame, model, 18);
addBox(0.38, 0.06, 0.28, 10.96, 0.54, 9.86, materials.cognacFabric);
addPlanter(12.55, 8.18, 1.1, 0);
addWallArtZ(12.25, AISLE_Z + 0.085, 0.72, 1.0, materials.art);
addWallArtZ(15.05, AISLE_Z + 0.085, 0.72, 1.0, new THREE.MeshStandardMaterial({ map: artTexture("#536b80", "#efe5d4"), roughness: 0.5 }));

addBookcaseZ(7.55, 12.58, 1.9, materials.whitePanel);
addPlanter(1.45, 8.22, 0.9, 0);
addWallPanelZ(4.4, 1.45, 12.73, 1.55, 0.92, materials.whitePanel);
addBox(1.45, 0.06, 0.08, 4.4, 1.93, 12.66, materials.lightPanel, model, false, false);

addWallPanelX(W - 0.08, 1.48, 10.9, 1.9, 1.1, materials.whitePanel);
addWallPanelX(W - 0.11, 1.48, 10.9, 1.65, 0.88, materials.screen);
addBookcaseZ(22.15, H - 0.2, 2.2, materials.blueCabinet);
addPlanter(28.25, 8.18, 1.05, 0);
addBox(3.4, 0.48, 0.35, 23.0, 0.62, H - 0.23, materials.warmPanel);
addBox(3.0, 0.04, 0.32, 23.0, 0.93, H - 0.42, materials.lightPanel, model, false, false);

const shadowPlane = new THREE.Mesh(
  new THREE.PlaneGeometry(W + 13, H + 13),
  new THREE.ShadowMaterial({ color: "#24221f", opacity: 0.13 })
);
shadowPlane.rotation.x = -Math.PI / 2;
shadowPlane.position.set(W / 2, -0.27, H / 2);
shadowPlane.receiveShadow = true;
scene.add(shadowPlane);

scene.add(new THREE.HemisphereLight("#ffffff", "#aaa49a", 2.3));

const sun = new THREE.DirectionalLight("#fff4df", 4.2);
sun.position.set(-16, 32, 24);
sun.castShadow = false;
sun.shadow.mapSize.set(1024, 1024);
sun.shadow.camera.left = -35;
sun.shadow.camera.right = 35;
sun.shadow.camera.top = 24;
sun.shadow.camera.bottom = -24;
sun.shadow.camera.near = 1;
sun.shadow.camera.far = 80;
sun.shadow.bias = -0.00018;
scene.add(sun);

const fill = new THREE.DirectionalLight("#dceeff", 1.2);
fill.position.set(32, 12, -16);
scene.add(fill);

let animationFrame = 0;
let cameraAnimationFrame = 0;
let renderUntil = 0;
let firstFrame = true;

function setQualityButton() {
  if (!qualityButton) return;
  const crisp = renderQuality === "crisp";
  qualityButton.setAttribute("aria-pressed", String(crisp));
  qualityButton.classList.toggle("btn-primary", crisp);
  const label = qualityButton.querySelector("span");
  if (label) label.textContent = crisp ? "清晰" : "流畅";
}

function applyRenderQuality() {
  renderer.setPixelRatio(renderPixelRatio());
  setQualityButton();
  resize();
  requestRender(420);
}

function resize() {
  const width = Math.max(stage.clientWidth, 320);
  const height = Math.max(stage.clientHeight, 420);
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  requestRender(260);
}

function setButtons(active) {
  viewButtons.forEach((button) => {
    const selected = button.dataset.renderView === active;
    button.setAttribute("aria-pressed", String(selected));
    button.classList.toggle("btn-primary", selected);
  });
}

function moveCamera(view) {
  if (cameraAnimationFrame) {
    cancelAnimationFrame(cameraAnimationFrame);
    cameraAnimationFrame = 0;
  }
  const destination = renderTargets[view] || renderTargets.reception;
  const startPosition = camera.position.clone();
  const startTarget = controls.target.clone();
  const startedAt = performance.now();
  const duration = 360;
  setButtons(view);

  function step(now) {
    if (!isPanelVisible()) {
      cameraAnimationFrame = 0;
      return;
    }
    const t = Math.min((now - startedAt) / duration, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    camera.position.lerpVectors(startPosition, destination.position, eased);
    controls.target.lerpVectors(startTarget, destination.target, eased);
    camera.lookAt(controls.target);
    renderScene();
    if (t < 1) {
      cameraAnimationFrame = requestAnimationFrame(step);
    } else {
      cameraAnimationFrame = 0;
      requestRender(180);
    }
  }
  cameraAnimationFrame = requestAnimationFrame(step);
}

viewButtons.forEach((button) => {
  button.addEventListener("click", () => moveCamera(button.dataset.renderView));
});
qualityButton?.addEventListener("click", () => {
  renderQuality = renderQuality === "crisp" ? "fast" : "crisp";
  localStorage.setItem("office-render-quality", renderQuality);
  applyRenderQuality();
});
downloadButton.addEventListener("click", () => {
  renderScene();
  const link = document.createElement("a");
  link.href = renderer.domElement.toDataURL("image/png");
  link.download = "office-render-view.png";
  link.click();
});

new ResizeObserver(resize).observe(stage);
window.addEventListener("resize", resize);
setQualityButton();
resize();

function isPanelVisible() {
  return !document.hidden && !root.closest("[data-panel]")?.hidden;
}

function renderScene() {
  controls.update();
  renderer.render(scene, camera);
  if (firstFrame) {
    firstFrame = false;
    window.__floorPlanRenderReady = true;
    window.__floorPlanRender = { renderer, scene, camera, controls, requestRender };
  }
}

function animate(now) {
  animationFrame = 0;
  if (!isPanelVisible()) return;
  renderScene();
  if (now < renderUntil) {
    animationFrame = requestAnimationFrame(animate);
  }
}

function requestRender(duration = 140) {
  renderUntil = Math.max(renderUntil, performance.now() + duration);
  if (!animationFrame && isPanelVisible()) {
    animationFrame = requestAnimationFrame(animate);
  }
}

controls.addEventListener("change", () => requestRender(120));
controls.addEventListener("start", () => requestRender(420));
controls.addEventListener("end", () => requestRender(220));
window.addEventListener("floor-plan:viewchange", (event) => {
  if (event.detail?.view === "render") {
    resize();
    requestRender(420);
  } else {
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
      animationFrame = 0;
    }
    if (cameraAnimationFrame) {
      cancelAnimationFrame(cameraAnimationFrame);
      cameraAnimationFrame = 0;
    }
  }
});
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
      animationFrame = 0;
    }
    if (cameraAnimationFrame) {
      cancelAnimationFrame(cameraAnimationFrame);
      cameraAnimationFrame = 0;
    }
  } else if (isPanelVisible()) {
    requestRender(260);
  }
});
requestRender(420);
