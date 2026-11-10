// Chatto Dash: what a level looks like. Builds a three.js scene from a level's plain data and draws it for a
// given race time: Enchatto's pastel colours as glossy, softly lit blocks that cast shadows on each other, an ink
// outline round everything, a sky that deepens overhead with clouds above and below the course, and each racer as
// their avatar itself with gloved hands and shoes (the avatar always faces the camera, so a racer seen from
// behind is still recognisable; the hands and shoes turn with the way it runs). Nothing here decides anything
// about the game: where things are comes from lib/dash/sim.ts and the level's own motions.

import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { avatarIconSrc, getAvatarById } from "@/lib/types";
import { INK, PINK, WHITE, YELLOW } from "./build";
import { groundBelow, poseOf } from "./sim";
import { MODE_DIVE, MODE_RESPAWN, MODE_TUMBLE, type Ball, type Level, type Pose, type Solid, type WindZone } from "./types";

const OUTLINE = 0.055;
/** A racer, measured up from its feet: where it turns about, where the middle of its avatar sits, and how big the avatar is */
const RACER_MIDDLE = 0.58;
const RACER_HEAD = 0.74;
const RACER_HEAD_SIZE = 1.3;
const HAND_X = 0.56;
const HAND_Y = 0.56;
/** How big a floor's checks are, in metres: the pattern is what shows how far away a stretch of floor is */
const CHECK = 2;
/** Where the sun is, as a direction from the course: over the camera's left shoulder, so what faces the camera is lit and shadows fall across the track ahead */
const SUN = new THREE.Vector3(-0.55, 0.8, 0.32).normalize();
/** How much of the course round the racer has shadows, in metres each way */
const SHADOW_REACH = 34;
const pose: Pose = { x: 0, y: 0, z: 0, yaw: 0 };

function canvasTexture(w: number, h: number, draw: (c: CanvasRenderingContext2D) => void): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  draw(canvas.getContext("2d")!);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

function rampGeometry(s: Solid, e: number): THREE.BufferGeometry {
  const hx = s.hx + e;
  const hz = s.hz + e;
  const nearTop = s.hy + e;
  const farTop = s.hy + s.rise + e;
  const bottom = Math.min(nearTop, farTop) - s.hy * 2 - e * 2;
  // Corners: near = +z (toward the camera), far = -z
  const v = {
    nbl: [-hx, bottom, hz], nbr: [hx, bottom, hz], ntl: [-hx, nearTop, hz], ntr: [hx, nearTop, hz],
    fbl: [-hx, bottom, -hz], fbr: [hx, bottom, -hz], ftl: [-hx, farTop, -hz], ftr: [hx, farTop, -hz],
  };
  const quads = [
    [v.ntl, v.ntr, v.ftr, v.ftl], // top
    [v.nbl, v.nbr, v.ntr, v.ntl], // near
    [v.fbr, v.fbl, v.ftl, v.ftr], // far
    [v.fbl, v.nbl, v.ntl, v.ftl], // left
    [v.nbr, v.fbr, v.ftr, v.ntr], // right
    [v.fbl, v.fbr, v.nbr, v.nbl], // bottom
  ];
  const pos: number[] = [];
  for (const [a, b, c, d] of quads) pos.push(...a, ...b, ...c, ...a, ...c, ...d);
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(new Array((pos.length / 3) * 2).fill(0), 2));
  g.computeVertexNormals();
  return g;
}

function solidGeometry(s: Solid, e: number): THREE.BufferGeometry {
  let g: THREE.BufferGeometry;
  if (s.shape === "cyl") {
    if (s.look === "mochi") {
      g = new THREE.SphereGeometry(1, 28, 14);
      g.scale(s.hx + e, 0.5 + e, s.hx + e);
      g.translate(0, -s.hy, 0);
    } else {
      g = new THREE.CylinderGeometry(s.hx + e, s.hx + e, (s.hy + e) * 2, 36);
    }
  } else if (s.shape === "ramp") {
    g = rampGeometry(s, e);
  } else {
    const r = Math.min(0.2, s.hx * 0.9, s.hy * 0.9, s.hz * 0.9);
    g = new RoundedBoxGeometry((s.hx + e) * 2, (s.hy + e) * 2, (s.hz + e) * 2, 3, r + e);
  }
  return g.index ? g.toNonIndexed() : g;
}

/**
 * Colours a geometry that is already where it stands in the world. With `checked`, whatever faces up is laid
 * with the floor's checks by where it is; everything else sits in one light check, so it stays plain.
 */
function paint(g: THREE.BufferGeometry, color: string, checked = false) {
  const c = new THREE.Color(color);
  const position = g.getAttribute("position");
  const normal = g.getAttribute("normal");
  const n = position.count;
  const arr = new Float32Array(n * 3);
  const uv = new Float32Array(n * 2);
  for (let i = 0; i < n; i++) {
    arr[i * 3] = c.r;
    arr[i * 3 + 1] = c.g;
    arr[i * 3 + 2] = c.b;
    if (checked && normal.getY(i) > 0.5) {
      uv[i * 2] = position.getX(i) / (CHECK * 2);
      uv[i * 2 + 1] = position.getZ(i) / (CHECK * 2);
    } else {
      uv[i * 2] = uv[i * 2 + 1] = 0.25;
    }
  }
  g.setAttribute("color", new THREE.BufferAttribute(arr, 3));
  g.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
}

/** The block drawn under a floor so it reads as a thick floating slab: `depth` deep, narrowing toward its bottom */
function underside(s: Solid, depth: number, e: number): THREE.BufferGeometry {
  const g = new THREE.BoxGeometry((s.hx - 0.12 + e) * 2, depth + e, (s.hz - 0.12 + e) * 2, 1, 1, 1).toNonIndexed();
  const position = g.getAttribute("position");
  const taper = Math.min(0.55, s.hx * 0.3, s.hz * 0.3);
  for (let i = 0; i < position.count; i++) {
    if (position.getY(i) > 0) continue;
    position.setX(i, position.getX(i) - Math.sign(position.getX(i)) * taper);
    position.setZ(i, position.getZ(i) - Math.sign(position.getZ(i)) * taper);
  }
  g.translate(0, -s.hy - depth / 2, 0);
  g.computeVertexNormals();
  return g;
}

/** Whether anything else in the level reaches into the space under `s` that its underside would fill */
function crowdedBelow(level: Level, s: Solid, depth: number): boolean {
  // Boxes are taken as lying square to the course, and anything turned or moving as a circle with room to spare
  const round = (o: Solid) => (o.yaw || o.motion ? Math.hypot(o.hx, o.shape === "cyl" ? o.hx : o.hz) + (o.motion ? 6 : 0) : 0);
  const mine = round(s);
  for (const o of level.solids) {
    if (o === s) continue;
    const r = round(o);
    const ox = r || o.hx;
    const oz = r || (o.shape === "cyl" ? o.hx : o.hz);
    if (Math.abs(o.x - s.x) > (mine || s.hx) + ox || Math.abs(o.z - s.z) > (mine || s.hz) + oz) continue;
    const top = o.y + o.hy + Math.max(0, o.rise) + (o.motion ? 3 : 0);
    const bottom = o.y - o.hy - (o.motion ? 3 : 0);
    if (top > s.y - s.hy - depth - 0.2 && bottom < s.y - s.hy - 0.05) return true;
  }
  return false;
}

/** A small seeded sequence, so a level's dressing is the same on every device and every visit */
function seeded(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let x = Math.imul(a ^ (a >>> 15), 1 | a);
    x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

interface Mover {
  solid: Solid;
  group: THREE.Group;
  body: THREE.Mesh;
  outline: THREE.Mesh;
  timed: boolean;
}

interface BallView {
  ball: Ball;
  group: THREE.Group;
  mesh: THREE.Mesh;
  rope?: THREE.Mesh;
  last: THREE.Vector3;
}

interface WindView {
  zone: WindZone;
  streaks: THREE.Mesh[];
  seeds: number[];
  material: THREE.MeshBasicMaterial;
}

interface Belt {
  texture: THREE.Texture;
  speed: number;
}

interface RacerView {
  /** At the racer's feet, turned to face where it is going */
  root: THREE.Group;
  /** The hands and where the avatar sits, turning about the racer's middle: a dive, a tumble, the lean of a run */
  lean: THREE.Group;
  feet: THREE.Mesh[];
  hands: THREE.Mesh[];
  /** The avatar itself: the racer's whole body. Not part of `root`: it faces the camera whichever way the racer runs */
  head: THREE.Sprite;
  tag: THREE.Sprite;
  shadow: THREE.Mesh;
  me: boolean;
  phase: number;
  spin: number;
  yaw: number;
  lastX: number;
  lastY: number;
  lastZ: number;
  seen: boolean;
}

const UP = new THREE.Vector3(0, 1, 0);
const tmpV = new THREE.Vector3();
const tmpQ = new THREE.Quaternion();
const tmpAxis = new THREE.Vector3();
const tmpM = new THREE.Matrix4();
const tmpS = new THREE.Vector3();

export class DashScene {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(62, 1, 1.2, 500);
  private materials = new Map<string, THREE.MeshStandardMaterial>();
  private ink = new THREE.MeshBasicMaterial({ color: INK, side: THREE.BackSide });
  private sun = new THREE.DirectionalLight(0xfff3e2, 1.4);
  private sky!: THREE.Mesh;
  private racerParts: {
    foot: THREE.BufferGeometry; hand: THREE.BufferGeometry; handHull: THREE.BufferGeometry;
    shoe: THREE.MeshStandardMaterial; glove: THREE.MeshStandardMaterial; unseen: THREE.MeshBasicMaterial;
  } | null = null;
  private size = { width: 1, height: 1, dpr: 1 };
  /** 0 = everything, 1 = fewer pixels, 2 = no shadows either: stepped down on a device that cannot keep up */
  private economy = 0;
  private frameMs = 16;
  private frameAt = 0;
  private settled = 0;
  private movers: Mover[] = [];
  private ballViews: BallView[] = [];
  private windViews: WindView[] = [];
  private belts: Belt[] = [];
  private spinners: { obj: THREE.Object3D; speed: number; bob: number; baseY: number }[] = [];
  private racers = new Map<string, RacerView>();
  private disposables: { dispose(): void }[] = [];
  private camPos = new THREE.Vector3();
  private camLook = new THREE.Vector3();
  private camReady = false;
  private portrait = true;
  private shake = 0;
  private font: string;

  constructor(canvas: HTMLCanvasElement, private level: Level) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
    this.font = typeof getComputedStyle === "function" ? getComputedStyle(document.body).fontFamily || "sans-serif" : "sans-serif";
    const theme = level.theme;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.scene.background = new THREE.Color(theme.fog);
    this.scene.fog = new THREE.Fog(theme.fog, 70, 210);

    // The sun: the one light that casts shadows, and what glints off anything rounded. Its shadows are drawn
    // for the stretch of course round the racer only, and it is moved along with them each frame.
    const shade = this.sun.shadow;
    shade.mapSize.set(2048, 2048);
    shade.camera.left = shade.camera.bottom = -SHADOW_REACH;
    shade.camera.right = shade.camera.top = SHADOW_REACH;
    shade.camera.near = 10;
    shade.camera.far = 170;
    shade.bias = -0.0004;
    shade.normalBias = 0.035;
    this.sun.castShadow = true;
    this.scene.add(this.sun, this.sun.target);

    this.buildSky();
    this.buildStatic();
    this.buildMovers();
    this.buildBalls();
    this.buildWinds();
    this.buildMarkers();
    this.buildDecor();
    this.buildClouds();
  }

  private keep<T extends { dispose(): void }>(x: T): T {
    this.disposables.push(x);
    return x;
  }

  /** Glossy paint in a colour: smooth enough for the sun to glint off it and the sky to show faintly in it */
  private gloss(color: string, opts: { map?: THREE.Texture; transparent?: boolean } = {}): THREE.MeshStandardMaterial {
    const key = color + (opts.map ? opts.map.uuid : "") + (opts.transparent ? "t" : "");
    let m = this.materials.get(key);
    if (!m) {
      m = new THREE.MeshStandardMaterial({ color, roughness: 0.32, metalness: 0, map: opts.map ?? null, transparent: !!opts.transparent });
      this.materials.set(key, m);
      this.keep(m);
    }
    return m;
  }

  /** A picture laid flat on a solid's top. Lit like the solid under it, so a shadow crosses the two alike */
  private decal(map: THREE.Texture): THREE.MeshStandardMaterial {
    return this.keep(new THREE.MeshStandardMaterial({ map, transparent: true, depthWrite: false, roughness: 0.6, metalness: 0 }));
  }

  /** Something solid: it throws a shadow and shadows fall on it */
  private solid<T extends THREE.Object3D>(o: T): T {
    o.castShadow = true;
    o.receiveShadow = true;
    return o;
  }

  // ─── The sky: a dome that deepens overhead, the light it gives everything, and clouds ───

  private buildSky() {
    const theme = this.level.theme;
    const horizon = new THREE.Color(theme.fog);
    const mid = new THREE.Color(theme.sky[0]);
    const zenith = mid.clone().offsetHSL(0, 0.35, -0.2);
    const below = new THREE.Color(theme.floorAlt).lerp(horizon, 0.35);
    const dome = (radius: number, lit: boolean) => {
      const g = new THREE.SphereGeometry(radius, 32, 24);
      const position = g.getAttribute("position");
      const colors = new Float32Array(position.count * 3);
      const c = new THREE.Color();
      for (let i = 0; i < position.count; i++) {
        const h = position.getY(i) / radius;
        if (h >= 0) {
          // Pale at the horizon, the level's sky colour a third of the way up, deeper overhead
          if (h < 0.1) c.copy(horizon).lerp(mid, h / 0.1);
          else c.copy(mid).lerp(zenith, Math.min(1, (h - 0.1) / 0.45));
          // What lights the scene is brighter than what is seen: a sky is a lamp, not a painted wall
          if (lit) c.lerp(new THREE.Color(1, 1, 1), 0.82);
        } else {
          c.copy(horizon).lerp(below, Math.min(1, -h / 0.5));
          if (lit) c.lerp(new THREE.Color(1, 1, 1), 0.6).multiplyScalar(0.9);
        }
        colors[i * 3] = c.r;
        colors[i * 3 + 1] = c.g;
        colors[i * 3 + 2] = c.b;
      }
      g.setAttribute("color", new THREE.BufferAttribute(colors, 3));
      return g;
    };
    const paint = this.keep(new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, fog: false, depthWrite: false }));
    this.sky = new THREE.Mesh(this.keep(dome(450, false)), paint);
    this.sky.renderOrder = -10;
    this.sky.frustumCulled = false;
    this.scene.add(this.sky);

    // The same sky, blurred, is what lights everything from all round and what glossy paint reflects
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    const around = new THREE.Scene();
    const lamp = dome(20, true);
    around.add(new THREE.Mesh(lamp, paint));
    const target = pmrem.fromScene(around, 0.03);
    this.keep(target);
    this.scene.environment = target.texture;
    this.scene.environmentIntensity = 0.92;
    lamp.dispose();
    pmrem.dispose();

    // The sun itself: a soft glow where the light comes from
    const glow = canvasTexture(128, 128, (c) => {
      const g = c.createRadialGradient(64, 64, 0, 64, 64, 64);
      g.addColorStop(0, "rgba(255,255,255,1)");
      g.addColorStop(0.18, "rgba(255,250,225,0.9)");
      g.addColorStop(0.45, "rgba(255,244,205,0.28)");
      g.addColorStop(1, "rgba(255,244,205,0)");
      c.fillStyle = g;
      c.fillRect(0, 0, 128, 128);
    });
    this.keep(glow);
    const disc = new THREE.Sprite(this.keep(new THREE.SpriteMaterial({ map: glow, transparent: true, depthWrite: false, fog: false })));
    disc.position.copy(SUN).multiplyScalar(400);
    disc.scale.setScalar(170);
    disc.renderOrder = -9;
    this.sky.add(disc);
  }

  /**
   * Clouds round the course, none of them in the way of it: a sea of them under the course to fall toward, banks
   * of them out to each side, and tall ones on the horizon past the finish. All one mesh. They are lit like
   * everything else, so each has a bright top and a tinted belly, and they pale into the distance.
   */
  private buildClouds() {
    const rand = seeded(this.level.id.length * 131 + this.level.solids.length);
    const end = this.level.finish.z;
    const floor = this.level.killY;
    const puffs: number[] = [];
    const cloud = (x: number, y: number, z: number, size: number) => {
      const n = 4 + Math.floor(rand() * 4);
      for (let i = 0; i < n; i++) {
        const along = (i / (n - 1) - 0.5) * size * 2.6;
        const r = size * (0.62 + rand() * 0.5) * (1 - Math.abs(i / (n - 1) - 0.5) * 0.7);
        puffs.push(x + along, y + (rand() - 0.35) * size * 0.5, z + (rand() - 0.5) * size * 1.3, r);
      }
    };
    // Under the course
    for (let z = 40; z > end - 150; z -= 13 + rand() * 9) {
      cloud((rand() - 0.5) * 150, floor - 5 - rand() * 7, z, 4 + rand() * 5);
      cloud((rand() < 0.5 ? -1 : 1) * (18 + rand() * 70), floor - 3 - rand() * 6, z - 6, 4 + rand() * 6);
    }
    // Out to the sides, at the course's own height and above it
    for (let z = 20; z > end - 120; z -= 24 + rand() * 16) {
      for (const side of [-1, 1]) cloud(side * (42 + rand() * 60), -2 + rand() * 26, z + rand() * 12, 4.5 + rand() * 5);
    }
    // On the horizon
    for (let i = 0; i < 12; i++) cloud((rand() - 0.5) * 330, 4 + rand() * 55, end - 95 - rand() * 90, 9 + rand() * 10);

    const count = puffs.length / 4;
    const mesh = new THREE.InstancedMesh(
      this.keep(new THREE.SphereGeometry(1, 18, 12)),
      this.keep(new THREE.MeshStandardMaterial({ color: WHITE, roughness: 1, metalness: 0, emissive: WHITE, emissiveIntensity: 0.16 })),
      count
    );
    for (let i = 0; i < count; i++) {
      const r = puffs[i * 4 + 3];
      tmpV.set(puffs[i * 4], puffs[i * 4 + 1], puffs[i * 4 + 2]);
      mesh.setMatrixAt(i, tmpM.compose(tmpV, tmpQ.identity(), tmpS.set(r, r * 0.62, r)));
    }
    mesh.instanceMatrix.needsUpdate = true;
    mesh.frustumCulled = false;
    this.keep(mesh);
    this.scene.add(mesh);
  }

  // ─── Things that never move: one mesh for all of them, one more for their outline ───

  private buildStatic() {
    const bodies: THREE.BufferGeometry[] = [];
    const hulls: THREE.BufferGeometry[] = [];
    const m = new THREE.Matrix4();
    const under = new THREE.Color();
    for (const s of this.level.solids) {
      if (s.motion || s.active) continue;
      m.makeRotationY(s.yaw).setPosition(s.x, s.y, s.z);
      const body = solidGeometry(s, 0).applyMatrix4(m);
      const floor = s.look === "floor" || s.look === "finish";
      paint(body, s.color, floor);
      bodies.push(body);
      hulls.push(solidGeometry(s, OUTLINE).applyMatrix4(m));
      // A floor is drawn thicker than it is, where there is room under it: a slab floating in the sky, not a sheet
      if (floor && s.shape === "box" && Math.min(s.hx, s.hz) >= 1.4) {
        const depth = Math.min(2.6, 0.9 + Math.min(s.hx, s.hz) * 0.35);
        if (!crowdedBelow(this.level, s, depth)) {
          const block = underside(s, depth, 0).applyMatrix4(m);
          paint(block, "#" + under.set(s.color).lerp(new THREE.Color(this.level.theme.accent), 0.3).multiplyScalar(0.84).getHexString());
          bodies.push(block);
          const hull = underside(s, depth, OUTLINE).applyMatrix4(m);
          hull.setAttribute("uv", new THREE.BufferAttribute(new Float32Array(hull.getAttribute("position").count * 2), 2));
          hulls.push(hull);
        }
      }
      this.dress(s, this.scene, s.x, s.y, s.z, s.yaw);
    }
    if (bodies.length) {
      // Two tones of check, so a floor shows how far away each stretch of it is
      const checks = canvasTexture(128, 128, (c) => {
        c.fillStyle = "#ffffff";
        c.fillRect(0, 0, 128, 128);
        c.fillStyle = "#ebe8f3";
        c.fillRect(64, 0, 64, 64);
        c.fillRect(0, 64, 64, 64);
      });
      checks.wrapS = checks.wrapT = THREE.RepeatWrapping;
      checks.anisotropy = Math.min(8, this.renderer.capabilities.getMaxAnisotropy());
      this.keep(checks);
      const material = this.keep(new THREE.MeshStandardMaterial({ vertexColors: true, map: checks, roughness: 0.46, metalness: 0 }));
      this.scene.add(this.solid(new THREE.Mesh(this.keep(mergeGeometries(bodies)), material)));
      this.scene.add(new THREE.Mesh(this.keep(mergeGeometries(hulls)), this.ink));
      for (const g of [...bodies, ...hulls]) g.dispose();
    }
    // Far below, a floor of haze: something to fall toward
    const haze = new THREE.Mesh(
      this.keep(new THREE.CircleGeometry(420, 40)),
      this.keep(new THREE.MeshBasicMaterial({ color: this.level.theme.fog }))
    );
    haze.rotation.x = -Math.PI / 2;
    haze.position.set(0, this.level.killY - 6, -80);
    this.scene.add(haze);
  }

  /** What is drawn on top of a solid to say what it does: arrows on a belt, a skin on a drum, blades on a pinwheel */
  private dress(s: Solid, parent: THREE.Object3D, x: number, y: number, z: number, yaw: number) {
    const top = y + s.hy + 0.015;
    // Flat on the solid's top, turned with it
    const add = (mesh: THREE.Mesh, turn = 0) => {
      mesh.position.set(x, top, z);
      mesh.rotation.order = "YXZ";
      mesh.rotation.set(-Math.PI / 2, yaw + turn, 0);
      mesh.renderOrder = 1;
      mesh.receiveShadow = true;
      parent.add(mesh);
      return mesh;
    };
    if (s.surface?.conveyor) {
      const [cx, cz] = s.surface.conveyor;
      const speed = Math.hypot(cx, cz);
      const sideways = Math.abs(cx) > Math.abs(cz);
      const wide = (sideways ? s.hz : s.hx) * 2 - 0.5;
      const long = (sideways ? s.hx : s.hz) * 2 - 0.3;
      const tex = canvasTexture(64, 64, (c) => {
        c.strokeStyle = "rgba(29,27,79,0.28)";
        c.lineWidth = 9;
        c.lineCap = "round";
        c.lineJoin = "round";
        c.beginPath();
        c.moveTo(14, 44);
        c.lineTo(32, 22);
        c.lineTo(50, 44);
        c.stroke();
      });
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(Math.max(1, Math.round(wide / 1.6)), Math.max(1, Math.round(long / 1.6)));
      this.keep(tex);
      this.belts.push({ texture: tex, speed: (speed * tex.repeat.y) / long });
      const plane = new THREE.Mesh(
        this.keep(new THREE.PlaneGeometry(wide, long)),
        this.decal(tex)
      );
      add(plane, Math.atan2(-cx, -cz));
    } else if (s.look === "drum") {
      const tex = canvasTexture(128, 128, (c) => {
        c.fillStyle = "#fff8ec";
        c.beginPath();
        c.arc(64, 64, 60, 0, Math.PI * 2);
        c.fill();
        c.strokeStyle = INK;
        c.lineWidth = 5;
        c.stroke();
        c.fillStyle = s.color;
        for (let i = 0; i < 3; i++) {
          const a = (i / 3) * Math.PI * 2;
          c.beginPath();
          c.arc(64 + Math.cos(a) * 15, 64 + Math.sin(a) * 15, 13, 0, Math.PI * 2);
          c.fill();
        }
      });
      this.keep(tex);
      add(new THREE.Mesh(this.keep(new THREE.CircleGeometry(s.hx * 0.92, 32)), this.decal(tex)));
    } else if (s.look === "disc" || (s.look === "plate" && s.hx > 1.2)) {
      const disc = s.look === "disc";
      const tex = canvasTexture(256, 256, (c) => {
        c.translate(128, 128);
        if (disc) {
          for (let i = 0; i < 8; i++) {
            c.fillStyle = i % 2 ? "rgba(255,255,255,0.75)" : "rgba(29,27,79,0.10)";
            c.beginPath();
            c.moveTo(0, 0);
            c.arc(0, 0, 120, (i / 8) * Math.PI * 2, ((i + 1) / 8) * Math.PI * 2);
            c.fill();
          }
        } else {
          c.strokeStyle = PINK;
          c.lineWidth = 14;
          c.beginPath();
          c.arc(0, 0, 104, 0, Math.PI * 2);
          c.stroke();
          c.strokeStyle = "rgba(29,27,79,0.12)";
          c.lineWidth = 4;
          c.beginPath();
          c.arc(0, 0, 70, 0, Math.PI * 2);
          c.stroke();
        }
      });
      this.keep(tex);
      add(new THREE.Mesh(this.keep(new THREE.CircleGeometry(s.hx * 0.96, 36)), this.decal(tex)));
    } else if (s.look === "finish") {
      const tex = canvasTexture(64, 64, (c) => {
        c.fillStyle = WHITE;
        c.fillRect(0, 0, 64, 64);
        c.fillStyle = INK;
        c.fillRect(0, 0, 32, 32);
        c.fillRect(32, 32, 32, 32);
      });
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(s.hx, 1);
      tex.magFilter = THREE.NearestFilter;
      this.keep(tex);
      const strip = new THREE.Mesh(this.keep(new THREE.PlaneGeometry(s.hx * 2 - 0.4, 1.6)), this.keep(new THREE.MeshStandardMaterial({ map: tex, roughness: 0.6, metalness: 0 })));
      strip.position.set(x, top, z + s.hz - 1.3);
      strip.rotation.x = -Math.PI / 2;
      strip.receiveShadow = true;
      parent.add(strip);
    }
  }

  // ─── Things that move, or come and go ───

  private buildMovers() {
    for (const s of this.level.solids) {
      if (!s.motion && !s.active) continue;
      const group = new THREE.Group();
      const timed = !!s.active;
      const material = timed
        ? this.keep(new THREE.MeshStandardMaterial({ color: s.color, roughness: 0.42, metalness: 0, transparent: true }))
        : this.gloss(s.color);
      const body = this.solid(new THREE.Mesh(this.keep(solidGeometry(s, 0)), material));
      const outline = new THREE.Mesh(this.keep(solidGeometry(s, OUTLINE)), this.ink);
      group.add(body, outline);
      this.dress(s, group, 0, 0, 0, 0);
      group.position.set(s.x, s.y, s.z);
      group.rotation.y = s.yaw;
      this.scene.add(group);
      this.movers.push({ solid: s, group, body, outline, timed });
    }
  }

  private buildBalls() {
    for (const ball of this.level.balls) {
      const group = new THREE.Group();
      let map: THREE.Texture | undefined;
      if (ball.look === "mochi") {
        // A face on the mochi, so it can be seen to roll
        map = canvasTexture(256, 128, (c) => {
          c.fillStyle = ball.color;
          c.fillRect(0, 0, 256, 128);
          c.fillStyle = INK;
          for (const x of [108, 148]) {
            c.beginPath();
            c.arc(x, 58, 5, 0, Math.PI * 2);
            c.fill();
          }
          c.strokeStyle = INK;
          c.lineWidth = 3;
          c.beginPath();
          c.arc(128, 62, 8, 0.15 * Math.PI, 0.85 * Math.PI);
          c.stroke();
          c.fillStyle = "rgba(255,122,182,0.45)";
          for (const x of [94, 162]) {
            c.beginPath();
            c.arc(x, 68, 7, 0, Math.PI * 2);
            c.fill();
          }
        });
        this.keep(map);
      }
      const geometry = this.keep(new THREE.SphereGeometry(ball.r, 28, 18));
      const mesh = this.solid(new THREE.Mesh(geometry, map ? this.gloss("#ffffff", { map }) : this.gloss(ball.color)));
      const outline = new THREE.Mesh(this.keep(new THREE.SphereGeometry(ball.r + OUTLINE, 20, 14)), this.ink);
      group.add(mesh, outline);
      let rope: THREE.Mesh | undefined;
      if (ball.look === "lantern" && ball.anchor) {
        mesh.scale.set(1, 1.12, 1);
        outline.scale.set(1, 1.12, 1);
        for (const dy of [ball.r * 1.05, -ball.r * 1.05]) {
          const cap = new THREE.Mesh(this.keep(new THREE.CylinderGeometry(ball.r * 0.45, ball.r * 0.45, 0.22, 16)), this.gloss(INK));
          cap.position.y = dy;
          mesh.add(cap);
        }
        rope = new THREE.Mesh(this.keep(new THREE.CylinderGeometry(0.05, 0.05, 1, 6)), this.keep(new THREE.MeshBasicMaterial({ color: INK })));
        this.scene.add(rope);
        const post = new THREE.Mesh(this.keep(new THREE.BoxGeometry(11, 0.35, 0.35)), this.gloss(this.level.theme.accent));
        post.position.set(ball.anchor.x, ball.anchor.y, ball.anchor.z);
        this.scene.add(post);
      }
      this.scene.add(group);
      this.ballViews.push({ ball, group, mesh, rope, last: new THREE.Vector3(NaN, 0, 0) });
    }
  }

  private buildWinds() {
    const rand = seeded(7);
    for (const zone of this.level.winds) {
      const material = this.keep(new THREE.MeshBasicMaterial({ color: WHITE, transparent: true, opacity: 0.7, depthWrite: false, side: THREE.DoubleSide }));
      const geometry = this.keep(new THREE.PlaneGeometry(1.5, 0.09));
      const count = Math.max(8, Math.min(26, Math.round(((zone.x1 - zone.x0) * (zone.z1 - zone.z0)) / 7)));
      const streaks: THREE.Mesh[] = [];
      const seeds: number[] = [];
      const angle = Math.atan2(-zone.az, zone.ax);
      for (let i = 0; i < count; i++) {
        const m = new THREE.Mesh(geometry, material);
        m.rotation.order = "YXZ";
        m.rotation.set(-Math.PI / 2, angle, 0);
        seeds.push(rand(), rand(), rand());
        this.scene.add(m);
        streaks.push(m);
      }
      this.windViews.push({ zone, streaks, seeds, material });
    }
  }

  private buildMarkers() {
    const theme = this.level.theme;
    const poleGeo = this.keep(new THREE.CylinderGeometry(0.09, 0.09, 2.6, 8));
    const flagShape = new THREE.Shape();
    flagShape.moveTo(0, 0);
    flagShape.lineTo(1.1, -0.38);
    flagShape.lineTo(0, -0.76);
    const flagGeo = this.keep(new THREE.ShapeGeometry(flagShape));
    this.level.checkpoints.forEach((cp, i) => {
      if (i === 0) return;
      for (const side of [-1, 1]) {
        const x = cp.x + side * (cp.width / 2 + 1.1);
        const pole = new THREE.Mesh(poleGeo, this.gloss(INK));
        pole.position.set(x, cp.y + 1.3, cp.z);
        const flag = new THREE.Mesh(flagGeo, this.keep(new THREE.MeshBasicMaterial({ color: side < 0 ? theme.accent : theme.accent2, side: THREE.DoubleSide })));
        flag.position.set(x, cp.y + 2.55, cp.z);
        if (side > 0) flag.scale.x = -1;
        this.scene.add(pole, flag);
      }
    });

    // The finish arch, over the near edge of the last pad
    const f = this.level.finish;
    const z = f.z + f.hz + 1;
    const postGeo = this.keep(new THREE.CylinderGeometry(0.28, 0.28, 5, 14));
    const postHull = this.keep(new THREE.CylinderGeometry(0.28 + OUTLINE, 0.28 + OUTLINE, 5 + OUTLINE * 2, 14));
    for (const side of [-1, 1]) {
      const post = new THREE.Mesh(postGeo, this.gloss(theme.accent));
      post.position.set(f.x + side * (f.hx - 0.2), f.y + 2.5, z);
      post.add(new THREE.Mesh(postHull, this.ink));
      this.scene.add(post);
    }
    const banner = canvasTexture(1024, 192, (c) => {
      c.fillStyle = YELLOW;
      c.fillRect(0, 0, 1024, 192);
      c.fillStyle = INK;
      c.font = `900 130px ${this.font}`;
      c.textAlign = "center";
      c.textBaseline = "middle";
      c.fillText("GOAL!  ゴール!", 512, 104);
    });
    this.keep(banner);
    const w = f.hx * 2;
    const board = new THREE.Mesh(this.keep(new RoundedBoxGeometry(w, w * 0.1875, 0.3, 2, 0.1)), this.gloss(YELLOW));
    board.position.set(f.x, f.y + 5.2, z);
    board.add(new THREE.Mesh(this.keep(new RoundedBoxGeometry(w + OUTLINE * 2, w * 0.1875 + OUTLINE * 2, 0.3 + OUTLINE * 2, 2, 0.1)), this.ink));
    const face = new THREE.Mesh(this.keep(new THREE.PlaneGeometry(w - 0.2, w * 0.1875 - 0.2)), this.keep(new THREE.MeshBasicMaterial({ map: banner })));
    face.position.z = 0.16;
    board.add(face);
    this.scene.add(board);
  }

  private buildDecor() {
    const outlined = (geometry: THREE.BufferGeometry, color: string, hull: THREE.BufferGeometry) => {
      const mesh = new THREE.Mesh(this.keep(geometry), this.gloss(color));
      mesh.add(new THREE.Mesh(this.keep(hull), this.ink));
      return mesh;
    };
    const soft = this.keep(new THREE.MeshStandardMaterial({ color: WHITE, roughness: 1, metalness: 0, emissive: WHITE, emissiveIntensity: 0.16 }));
    for (const d of this.level.decor) {
      const g = new THREE.Group();
      g.position.set(d.x, d.y, d.z);
      g.scale.setScalar(d.s);
      let speed = 0;
      let bob = 0;
      if (d.kind === "cloud") {
        for (const [x, y, r] of [[-0.9, 0, 0.75], [0, 0.25, 1], [0.95, 0, 0.7]]) {
          // No ink round a cloud: it is weather, not a thing on the course
          const puff = new THREE.Mesh(this.keep(new THREE.SphereGeometry(r, 18, 12)), soft);
          puff.position.set(x, y, 0);
          puff.scale.y = 0.72;
          g.add(puff);
        }
        bob = 0.25;
      } else if (d.kind === "lantern") {
        const body = outlined(new THREE.SphereGeometry(0.7, 16, 12), d.color, new THREE.SphereGeometry(0.76, 14, 10));
        body.scale.y = 1.15;
        g.add(body);
        for (const y of [0.78, -0.78]) {
          const cap = new THREE.Mesh(this.keep(new THREE.CylinderGeometry(0.32, 0.32, 0.2, 12)), this.gloss(INK));
          cap.position.y = y;
          g.add(cap);
        }
        bob = 0.18;
      } else if (d.kind === "sushi") {
        const plate = outlined(new THREE.CylinderGeometry(1.1, 0.9, 0.22, 24), WHITE, new THREE.CylinderGeometry(1.16, 0.96, 0.3, 20));
        const rice = outlined(new RoundedBoxGeometry(1.2, 0.5, 0.7, 3, 0.2), WHITE, new RoundedBoxGeometry(1.3, 0.6, 0.8, 2, 0.24));
        rice.position.y = 0.36;
        const fish = outlined(new RoundedBoxGeometry(1.4, 0.28, 0.8, 3, 0.12), d.color, new RoundedBoxGeometry(1.5, 0.38, 0.9, 2, 0.16));
        fish.position.y = 0.68;
        g.add(plate, rice, fish);
        speed = 0.5;
        bob = 0.2;
      } else if (d.kind === "pinwheel") {
        const stick = new THREE.Mesh(this.keep(new THREE.CylinderGeometry(0.07, 0.07, 3, 8)), this.gloss(INK));
        stick.position.y = -1.5;
        const wheel = new THREE.Group();
        for (let i = 0; i < 4; i++) {
          const blade = outlined(new THREE.ConeGeometry(0.42, 1.1, 3), i % 2 ? d.color : WHITE, new THREE.ConeGeometry(0.5, 1.22, 3));
          blade.rotation.z = (i / 4) * Math.PI * 2;
          blade.position.set(Math.cos((i / 4) * Math.PI * 2 + Math.PI / 2) * 0.55, Math.sin((i / 4) * Math.PI * 2 + Math.PI / 2) * 0.55, 0);
          wheel.add(blade);
        }
        g.add(stick, wheel);
        this.spinners.push({ obj: wheel, speed: -3, bob: 0, baseY: 0 });
        g.userData.axis = "z";
      } else if (d.kind === "torii") {
        for (const x of [-4.2, 4.2]) {
          const post = outlined(new THREE.CylinderGeometry(0.3, 0.34, 4.6, 12), d.color, new THREE.CylinderGeometry(0.36, 0.4, 4.7, 12));
          post.position.set(x, 2.3, 0);
          g.add(post);
        }
        const top = outlined(new RoundedBoxGeometry(11, 0.5, 0.6, 2, 0.12), d.color, new RoundedBoxGeometry(11.1, 0.6, 0.7, 2, 0.14));
        top.position.y = 4.7;
        const mid = outlined(new RoundedBoxGeometry(9.2, 0.36, 0.45, 2, 0.1), d.color, new RoundedBoxGeometry(9.3, 0.46, 0.55, 2, 0.12));
        mid.position.y = 3.8;
        g.add(top, mid);
      } else if (d.kind === "plane") {
        const body = outlined(new THREE.ConeGeometry(0.5, 1.6, 3), WHITE, new THREE.ConeGeometry(0.58, 1.75, 3));
        body.rotation.set(Math.PI / 2, 0, Math.PI);
        body.scale.z = 0.35;
        const fold = new THREE.Mesh(this.keep(new THREE.ConeGeometry(0.2, 1.5, 3)), this.gloss(d.color));
        fold.rotation.set(Math.PI / 2, 0, 0);
        fold.position.y = -0.12;
        g.add(body, fold);
        g.rotation.y = d.x > 0 ? Math.PI / 2 : -Math.PI / 2;
        bob = 0.3;
      } else if (d.kind === "star") {
        g.add(outlined(new THREE.OctahedronGeometry(0.7), d.color, new THREE.OctahedronGeometry(0.8)));
        speed = 1.2;
        bob = 0.3;
      }
      this.scene.add(g);
      if (speed || bob) this.spinners.push({ obj: g, speed, bob, baseY: d.y });
    }
  }

  // ─── Racers ───

  addRacer(id: string, avatarId: string, name: string, me: boolean) {
    if (this.racers.has(id)) return;
    const avatar = getAvatarById(avatarId);
    const parts = (this.racerParts ??= {
      foot: this.keep(new THREE.SphereGeometry(0.17, 14, 10)),
      hand: this.keep(new THREE.SphereGeometry(0.125, 12, 8)),
      handHull: this.keep(new THREE.SphereGeometry(0.125 + OUTLINE * 0.8, 10, 8)),
      shoe: this.keep(new THREE.MeshStandardMaterial({ color: INK, roughness: 0.5, metalness: 0 })),
      glove: this.keep(new THREE.MeshStandardMaterial({ color: WHITE, roughness: 0.35, metalness: 0 })),
      unseen: this.keep(new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: false })),
    });

    // The racer is its avatar, given white-gloved hands and a pair of shoes. Built facing down the course (-z)
    const root = new THREE.Group();
    const lean = new THREE.Group();
    lean.position.y = RACER_MIDDLE;
    const hands = [-1, 1].map((side) => {
      const hand = new THREE.Mesh(parts.hand, parts.glove);
      hand.castShadow = true;
      hand.position.set(side * HAND_X, HAND_Y - RACER_MIDDLE, 0);
      hand.add(new THREE.Mesh(parts.handHull, this.ink));
      lean.add(hand);
      return hand;
    });
    const feet = [-1, 1].map((side) => {
      const foot = new THREE.Mesh(parts.foot, parts.shoe);
      foot.castShadow = true;
      foot.scale.set(1, 0.62, 1.45);
      foot.position.set(side * 0.2, 0.1, -0.04);
      root.add(foot);
      return foot;
    });
    // The avatar is a flat picture, which throws no shadow of its own: this unseen ball throws one for it
    const shade = new THREE.Mesh(parts.foot, parts.unseen);
    shade.castShadow = true;
    shade.scale.set(3, 3, 1.6);
    shade.position.y = RACER_HEAD - RACER_MIDDLE;
    lean.add(shade);
    root.add(lean);
    root.visible = false;

    // The avatar, on a white sticker edge
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 256;
    const c = canvas.getContext("2d")!;
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    this.keep(tex);
    const draw = (face?: HTMLImageElement) => {
      c.clearRect(0, 0, 256, 256);
      if (face) {
        c.save();
        c.shadowColor = WHITE;
        c.shadowBlur = 0;
        for (const [ox, oy] of [[-6, 0], [6, 0], [0, -6], [0, 6], [-4, -4], [4, -4], [-4, 4], [4, 4]]) {
          c.shadowOffsetX = ox;
          c.shadowOffsetY = oy;
          c.drawImage(face, 14, 14, 228, 228);
        }
        c.restore();
        c.drawImage(face, 14, 14, 228, 228);
      } else {
        c.fillStyle = avatar.color;
        c.strokeStyle = INK;
        c.lineWidth = 9;
        c.beginPath();
        c.arc(128, 128, 100, 0, Math.PI * 2);
        c.fill();
        c.stroke();
      }
      tex.needsUpdate = true;
    };
    draw();
    const img = new Image();
    img.onload = () => draw(img);
    img.src = avatarIconSrc(avatarId);
    const head = new THREE.Sprite(this.keep(new THREE.SpriteMaterial({ map: tex, transparent: true, alphaTest: 0.08 })));
    head.scale.setScalar(RACER_HEAD_SIZE);
    head.visible = false;

    const label = me ? "▼" : name;
    const tagTex = canvasTexture(384, 96, (t) => {
      t.font = `900 ${me ? 64 : 44}px ${this.font}`;
      t.textAlign = "center";
      t.textBaseline = "middle";
      if (me) {
        t.lineWidth = 12;
        t.lineJoin = "round";
        t.strokeStyle = INK;
        t.strokeText(label, 192, 50);
        t.fillStyle = YELLOW;
        t.fillText(label, 192, 50);
      } else {
        const text = label.length > 10 ? label.slice(0, 9) + "…" : label;
        const w = Math.min(360, t.measureText(text).width + 44);
        t.fillStyle = WHITE;
        t.strokeStyle = INK;
        t.lineWidth = 6;
        t.beginPath();
        t.roundRect(192 - w / 2, 16, w, 64, 32);
        t.fill();
        t.stroke();
        t.fillStyle = INK;
        t.fillText(text, 192, 50);
      }
    });
    this.keep(tagTex);
    const tag = new THREE.Sprite(this.keep(new THREE.SpriteMaterial({ map: tagTex, transparent: true, depthWrite: false })));
    tag.scale.set(me ? 1.5 : 2.2, me ? 0.375 : 0.55, 1);
    tag.visible = false;
    tag.renderOrder = 5;

    const shadow = new THREE.Mesh(
      this.keep(new THREE.CircleGeometry(0.5, 20)),
      this.keep(new THREE.MeshBasicMaterial({ color: INK, transparent: true, opacity: 0.2, depthWrite: false }))
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.visible = false;
    shadow.renderOrder = 2;
    this.scene.add(root, head, tag, shadow);
    this.racers.set(id, { root, lean, feet, hands, head, tag, shadow, me, phase: Math.random() * 6, spin: 0, yaw: 0, lastX: 0, lastY: 0, lastZ: 0, seen: false });
  }

  removeRacer(id: string) {
    const r = this.racers.get(id);
    if (!r) return;
    this.scene.remove(r.root, r.head, r.tag, r.shadow);
    this.racers.delete(id);
  }

  /** Where a racer is now. `t` is the race time it is drawn at, `dt` the seconds since it was last placed */
  placeRacer(id: string, x: number, y: number, z: number, mode: number, grounded: boolean, shield: number, t: number, dt: number) {
    const r = this.racers.get(id);
    if (!r) return;
    if (mode === MODE_RESPAWN) {
      r.root.visible = r.head.visible = r.tag.visible = r.shadow.visible = false;
      r.seen = false;
      return;
    }
    const vx = r.seen && dt > 0 ? (x - r.lastX) / dt : 0;
    const vy = r.seen && dt > 0 ? (y - r.lastY) / dt : 0;
    const vz = r.seen && dt > 0 ? (z - r.lastZ) / dt : 0;
    const first = !r.seen;
    r.lastX = x;
    r.lastY = y;
    r.lastZ = z;
    r.seen = true;
    const speed = Math.hypot(vx, vz);

    // Turns to face where it is going, the short way round. Standing still it keeps facing as it was
    if (first) r.yaw = 0;
    else if (speed > 1) {
      let turn = Math.atan2(-vx, -vz) - r.yaw;
      turn -= Math.round(turn / (Math.PI * 2)) * Math.PI * 2;
      r.yaw += turn * (1 - Math.exp(-dt * 12));
    }

    let pitch = 0; // forward is negative: the top goes down the course
    let roll = 0;
    let lift = 0;
    let tall = 1; // the avatar stretched (over 1) or squashed
    let stride = 0; // feet and hands, -1 to 1
    let reach = 0; // hands up and forward
    let tuck = 0; // feet drawn up
    if (mode === MODE_TUMBLE) {
      r.spin += dt * 13;
      pitch = -r.spin;
      lift = 0.25;
      reach = 0.3;
    } else if (mode === MODE_DIVE) {
      r.spin = 0;
      pitch = -0.5;
      tall = 0.68;
      lift = grounded ? -0.2 : -0.05;
      reach = 1;
    } else if (!grounded) {
      r.spin = 0;
      tall = 1 + Math.max(-0.12, Math.min(0.16, vy * 0.014));
      reach = 0.75;
      tuck = 0.45;
      stride = Math.sin(r.phase) * 0.4;
    } else {
      r.spin = 0;
      if (speed > 0.6) {
        r.phase += dt * (6 + speed * 1.3);
        stride = Math.sin(r.phase);
        roll = Math.sin(r.phase) * 0.09;
        lift = Math.abs(Math.cos(r.phase)) * 0.07;
      } else {
        r.phase += dt * 2.4;
        tall = 1 + Math.sin(r.phase) * 0.025;
      }
    }
    r.root.position.set(x, y, z);
    r.root.rotation.y = r.yaw;
    r.lean.position.y = RACER_MIDDLE + lift;
    r.lean.rotation.set(pitch, 0, roll);
    r.feet.forEach((foot, i) => {
      const side = i ? 1 : -1;
      const swing = stride * side;
      if (mode === MODE_DIVE) {
        // Trailing behind
        foot.position.set(side * 0.2, 0.14 + lift * 0.5, 0.42);
        foot.rotation.x = 1.2;
      } else {
        foot.position.set(side * 0.2, 0.1 + Math.max(0, -swing) * 0.13 + tuck * 0.2, -0.04 - swing * 0.24 + tuck * 0.12);
        foot.rotation.x = swing * 0.5 + tuck * 0.9;
      }
      // Head over heels, the shoes are lost in the blur
      foot.visible = mode !== MODE_TUMBLE;
    });
    r.hands.forEach((hand, i) => {
      const side = i ? 1 : -1;
      const swing = -stride * side;
      hand.position.set(side * (HAND_X + reach * 0.04), HAND_Y - RACER_MIDDLE + reach * 0.26, -swing * 0.22 - reach * 0.16);
    });
    r.root.visible = true;

    // The avatar sits on the racer's middle, wherever a lean or a dive has taken it
    tmpV.set(0, RACER_HEAD - RACER_MIDDLE, 0);
    r.lean.updateWorldMatrix(true, false);
    tmpV.applyMatrix4(r.lean.matrixWorld);
    r.head.position.copy(tmpV);
    r.head.position.y -= (1 - tall) * RACER_HEAD_SIZE * 0.4;
    r.head.scale.set(RACER_HEAD_SIZE / Math.sqrt(tall), RACER_HEAD_SIZE * tall, 1);
    r.head.material.rotation = mode === MODE_TUMBLE ? r.spin : roll * 0.8;
    r.head.visible = true;

    // Just back from a fall: it flickers while it cannot be knocked over
    r.head.material.opacity = shield > 0.3 && Math.floor(t * 12) % 2 === 0 ? 0.45 : 1;

    r.tag.position.set(x, y + RACER_HEAD + RACER_HEAD_SIZE * 0.6 + lift + (r.me ? 0.1 + Math.sin(t * 5) * 0.08 : 0.12), z);
    r.tag.visible = true;
    const ground = groundBelow(this.level, x, y, z, t);
    if (ground > -Infinity) {
      const h = Math.max(0, y - ground);
      const k = Math.max(0.35, 1 - h * 0.12);
      r.shadow.position.set(x, ground + 0.03, z);
      r.shadow.scale.setScalar(k);
      (r.shadow.material as THREE.MeshBasicMaterial).opacity = 0.2 * k;
      r.shadow.visible = true;
    } else {
      r.shadow.visible = false;
    }
  }

  bump(amount = 0.35) {
    this.shake = Math.max(this.shake, amount);
  }

  // ─── A frame ───

  resize(width: number, height: number, dpr: number) {
    this.size = { width, height, dpr };
    this.renderer.setPixelRatio(Math.min(this.economy ? 1.25 : 2, dpr));
    this.renderer.setSize(width, height, false);
    this.portrait = height > width;
    this.camera.aspect = width / Math.max(1, height);
    this.camera.fov = this.portrait ? 72 : 58;
    this.camera.updateProjectionMatrix();
  }

  /**
   * Draws race time `t`. The camera follows `focus` from behind; `swing` (1 to 0) brings it round from the front
   * of the start line as the countdown runs out.
   */
  render(t: number, dt: number, focus: { x: number; y: number; z: number }, swing: number) {
    for (const m of this.movers) {
      const s = m.solid;
      poseOf(s, t, pose);
      m.group.position.set(pose.x, pose.y, pose.z);
      m.group.rotation.y = pose.yaw;
      if (m.timed) {
        const state = s.active!(t);
        const mat = m.body.material as THREE.MeshStandardMaterial;
        m.outline.visible = state !== 0;
        m.body.castShadow = state !== 0;
        mat.opacity = state === 0 ? 0.13 : state === 1 && Math.floor(t * 9) % 2 === 0 ? 0.5 : 1;
        mat.depthWrite = state !== 0;
        m.group.position.y = pose.y - (state === 0 ? 0.25 : 0);
      }
    }
    for (const v of this.ballViews) {
      const b = v.ball;
      const on = !b.active || b.active(t);
      v.group.visible = on;
      if (v.rope) v.rope.visible = on;
      if (!on) continue;
      b.pos(t, pose);
      tmpV.set(pose.x, pose.y, pose.z);
      if (b.look !== "lantern") {
        if (!Number.isNaN(v.last.x)) {
          const dx = tmpV.x - v.last.x;
          const dz = tmpV.z - v.last.z;
          const dist = Math.hypot(dx, dz);
          if (dist > 1e-5 && dist < 2) {
            tmpAxis.set(dz / dist, 0, -dx / dist);
            tmpQ.setFromAxisAngle(tmpAxis, dist / b.r);
            v.mesh.quaternion.premultiply(tmpQ);
          }
        }
      } else if (b.anchor && v.rope) {
        const ax = b.anchor.x - pose.x;
        const ay = b.anchor.y - pose.y;
        const len = Math.hypot(ax, ay);
        v.rope.position.set((b.anchor.x + pose.x) / 2, (b.anchor.y + pose.y) / 2, pose.z);
        v.rope.scale.set(1, len, 1);
        v.rope.quaternion.setFromUnitVectors(UP, tmpAxis.set(ax / len, ay / len, 0));
        v.group.rotation.z = pose.yaw;
      }
      v.last.copy(tmpV);
      v.group.position.copy(tmpV);
    }
    for (const w of this.windViews) {
      const z = w.zone;
      const strength = z.pulse ? z.pulse(t) : 1;
      w.material.opacity = 0.75 * strength;
      const sx = z.x1 - z.x0;
      const sz = z.z1 - z.z0;
      const speed = Math.hypot(z.ax, z.az) * 1.6;
      const dirX = z.ax / (Math.hypot(z.ax, z.az) || 1);
      const dirZ = z.az / (Math.hypot(z.ax, z.az) || 1);
      w.streaks.forEach((m, i) => {
        const a = w.seeds[i * 3];
        const b = w.seeds[i * 3 + 1];
        const c = w.seeds[i * 3 + 2];
        const travel = t * speed * (0.7 + c * 0.6);
        const x = z.x0 + ((((a * sx + dirX * travel) % sx) + sx) % sx);
        const zz = z.z0 + ((((b * sz + dirZ * travel) % sz) + sz) % sz);
        const y = groundBelow(this.level, x, 50, zz, t);
        m.position.set(x, (y > -Infinity ? y : z.y0 + 2) + 0.35 + c * 1.7, zz);
        m.visible = strength > 0.05;
      });
    }
    for (const b of this.belts) b.texture.offset.y = (b.speed * t) % 1;
    for (const s of this.spinners) {
      if (s.speed) {
        if (s.obj.parent?.userData.axis === "z") s.obj.rotation.z = t * s.speed;
        else s.obj.rotation.y = t * s.speed;
      }
      if (s.bob) s.obj.position.y = s.baseY + Math.sin(t * 0.9 + s.obj.position.z) * s.bob;
    }

    // Camera: behind and above, a little ahead of the racer; slower to follow up and down than side to side
    const back = this.portrait ? 9.6 : 8.6;
    const up = this.portrait ? 5.5 : 4.6;
    const a = swing * swing * (3 - 2 * swing) * Math.PI;
    const wantX = focus.x * 0.82 + Math.sin(a) * back;
    const wantZ = focus.z + Math.cos(a) * back;
    const wantY = focus.y + up - swing * 2.2;
    if (!this.camReady) {
      this.camPos.set(wantX, wantY, wantZ);
      this.camLook.set(focus.x * 0.9, focus.y + 1, focus.z - 3.5);
      this.camReady = true;
    }
    const kxz = 1 - Math.exp(-dt * 9);
    const ky = 1 - Math.exp(-dt * 3.2);
    this.camPos.x += (wantX - this.camPos.x) * kxz;
    this.camPos.z += (wantZ - this.camPos.z) * kxz;
    this.camPos.y += (wantY - this.camPos.y) * ky;
    const ahead = 4.5 * (1 - swing);
    this.camLook.x += (focus.x * 0.9 - this.camLook.x) * kxz;
    this.camLook.z += (focus.z - ahead - this.camLook.z) * kxz;
    this.camLook.y += (focus.y + 1 - this.camLook.y) * ky;
    this.camera.position.copy(this.camPos);
    if (this.shake > 0.001) {
      this.camera.position.x += Math.sin(t * 71) * this.shake;
      this.camera.position.y += Math.cos(t * 83) * this.shake * 0.7;
      this.shake *= Math.exp(-dt * 9);
    }
    this.camera.lookAt(this.camLook);
    this.sky.position.copy(this.camera.position);

    // The sun's shadows cover the course round the racer, more of it ahead than behind
    this.sun.target.position.set(focus.x * 0.6, focus.y, focus.z - SHADOW_REACH * 0.45);
    this.sun.position.copy(this.sun.target.position).addScaledVector(SUN, 80);
    this.sun.target.updateMatrixWorld();

    this.renderer.render(this.scene, this.camera);
    this.pace();
  }

  /**
   * Eases off on a device that cannot keep up: first fewer pixels, then no shadows. Judged on frames that came
   * one after another: a gap of a tenth of a second or more is a hidden tab or a pause, not a slow device.
   */
  private pace() {
    const now = performance.now();
    const gap = now - this.frameAt;
    this.frameAt = now;
    if (this.economy >= 2 || gap <= 0 || gap > 100) return;
    this.frameMs += (gap - this.frameMs) * 0.05;
    if (++this.settled < 150) return;
    if (this.frameMs < 27) return;
    this.economy++;
    this.settled = 0;
    this.frameMs = 16;
    if (this.economy === 1) this.resize(this.size.width, this.size.height, this.size.dpr);
    else this.sun.castShadow = false;
  }

  /** Forgets where the camera was, so the next frame starts it at its target (a new round, a respawn far away) */
  cut() {
    this.camReady = false;
  }

  dispose() {
    for (const d of this.disposables) d.dispose();
    this.ink.dispose();
    this.sun.shadow.dispose();
    this.renderer.dispose();
  }
}
