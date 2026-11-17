import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RotateCcw, Package, Sparkles, Play, Pause, ArrowUpFromLine } from 'lucide-react';
import {
  createBrushedMetalRoughnessTexture,
  createContactShadowTexture,
  createFlorisBoxTextures,
  createFlorisLabelTexture,
  createTravertineTexture,
} from './florisBottleTextures';

export interface Bottle3DLayer {
  key: string;
  label: string;
  emoji: string;
  pct: number;
  subText: string;
  color: string;
  tierLabel: string;
}

interface FlorisBottle3DProps {
  layers: Bottle3DLayer[];
  totalVolume: number;
  concentrationPercent: number;
  perfumeName?: string;
  hoveredId: string | null;
  onHoverLayer: (key: string | null) => void;
  onSelectLayer: (key: string | null) => void;
  compact?: boolean;
}

function detectSoftwareWebGL(): boolean {
  try {
    const probeCanvas = document.createElement('canvas');
    const gl =
      (probeCanvas.getContext('webgl2') as WebGL2RenderingContext | null) ||
      (probeCanvas.getContext('webgl') as WebGLRenderingContext | null);
    if (!gl) return false;

    const dbgInfo = gl.getExtension('WEBGL_debug_renderer_info');
    let rendererStr = '';
    if (dbgInfo) {
      rendererStr = String(gl.getParameter(dbgInfo.UNMASKED_RENDERER_WEBGL) || '');
    } else {
      rendererStr = String(gl.getParameter(gl.RENDERER) || '');
    }

    const loseCtx = gl.getExtension('WEBGL_lose_context');
    if (loseCtx) {
      loseCtx.loseContext();
    }

    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(rendererStr);
  } catch {
    return false;
  }
}

function createRoundedSquareShape(halfSize: number, radius: number): THREE.Shape {
  const s = new THREE.Shape();
  const x = -halfSize;
  const y = -halfSize;
  const w = halfSize * 2;
  const h = halfSize * 2;
  const r = Math.min(radius, halfSize * 0.48);

  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

function createSakuraPetalGeometry(): THREE.ShapeGeometry {
  const shape = new THREE.Shape();
  shape.moveTo(0, -0.14);
  shape.bezierCurveTo(0.11, -0.06, 0.14, 0.08, 0.05, 0.17);
  shape.lineTo(0, 0.13);
  shape.lineTo(-0.05, 0.17);
  shape.bezierCurveTo(-0.14, 0.08, -0.11, -0.06, 0, -0.14);
  return new THREE.ShapeGeometry(shape, 10);
}

export const FlorisBottle3D: React.FC<FlorisBottle3DProps> = ({
  layers,
  totalVolume,
  concentrationPercent,
  perfumeName = 'Floris',
  hoveredId,
  onHoverLayer,
  onSelectLayer,
  compact = false,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [isCapOpen, setIsCapOpen] = useState(false);
  const [showGiftBox, setShowGiftBox] = useState(false);
  const [isAutoSpin, setIsAutoSpin] = useState(false);
  const [webglError, setWebglError] = useState<string | null>(null);
  const [isWebglReady, setIsWebglReady] = useState(false);

  // Refs synced to Three.js scene loop without tearing down WebGLRenderer on UI state toggles
  const stateRef = useRef({
    isCapOpen: false,
    showGiftBox: false,
    isAutoSpin: false,
    hoveredId: hoveredId as string | null,
    resetCameraRequested: false,
  });

  const callbacksRef = useRef({ onHoverLayer, onSelectLayer });
  callbacksRef.current = { onHoverLayer, onSelectLayer };

  const requestRenderRef = useRef<() => void>(() => {});
  const rebuildLiquidsRef = useRef<(nextLayers: Bottle3DLayer[]) => void>(() => {});
  const updateLabelRef = useRef<(vol: number, conc: number) => void>(() => {});
  const updateHoverHighlightRef = useRef<(hid: string | null) => void>(() => {});

  useEffect(() => {
    stateRef.current.isCapOpen = isCapOpen;
    requestRenderRef.current();
  }, [isCapOpen]);

  useEffect(() => {
    stateRef.current.showGiftBox = showGiftBox;
    requestRenderRef.current();
  }, [showGiftBox]);

  useEffect(() => {
    stateRef.current.isAutoSpin = isAutoSpin;
    requestRenderRef.current();
  }, [isAutoSpin]);

  useEffect(() => {
    stateRef.current.hoveredId = hoveredId;
    updateHoverHighlightRef.current(hoveredId);
    requestRenderRef.current();
  }, [hoveredId]);

  useEffect(() => {
    rebuildLiquidsRef.current(layers);
    requestRenderRef.current();
  }, [layers]);

  useEffect(() => {
    updateLabelRef.current(totalVolume, concentrationPercent);
    requestRenderRef.current();
  }, [totalVolume, concentrationPercent]);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const isSoftwareGl = detectSoftwareWebGL();
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: !isSoftwareGl,
        alpha: false,
        powerPreference: 'high-performance',
      });
    } catch {
      setWebglError('Trình duyệt hiện chưa hỗ trợ WebGL 3D.');
      return;
    }

    const maxAniso = isSoftwareGl ? 1 : Math.min(8, renderer.capabilities.getMaxAnisotropy() || 4);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.94;
    renderer.shadowMap.enabled = !isSoftwareGl;
    if (!isSoftwareGl) {
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#F3DCE6');
    scene.fog = new THREE.Fog('#F3DCE6', 24, 52);

    const width = Math.max(container.clientWidth, 260);
    const height = Math.max(container.clientHeight, compact ? 280 : 340);
    renderer.setSize(width, height, false);

    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 120);
    const defaultCamPos = new THREE.Vector3(4.6, 2.2, 20.4);
    const defaultTarget = new THREE.Vector3(0, 0.55, 0);
    camera.position.copy(defaultCamPos);

    const controls = new OrbitControls(camera, canvas);
    controls.target.copy(defaultTarget);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.07;
    controls.enablePan = false;
    controls.minDistance = 10.5;
    controls.maxDistance = 32;
    controls.minPolarAngle = Math.PI * 0.16;
    controls.maxPolarAngle = Math.PI * 0.56;
    controls.update();

    // Environment & Calibrated Studio Lights (avoids pastel washout!)
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const roomEnv = new RoomEnvironment();
    const envRT = pmremGenerator.fromScene(roomEnv, 0.04);
    scene.environment = envRT.texture;
    scene.environmentIntensity = 0.62;
    roomEnv.dispose();
    pmremGenerator.dispose();

    const hemiLight = new THREE.HemisphereLight('#FFF8F0', '#D8A8B8', 0.52);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight('#FFF5EB', 1.25);
    keyLight.position.set(5.5, 9.5, 6.5);
    if (!isSoftwareGl) {
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.set(1024, 1024);
      keyLight.shadow.camera.near = 2;
      keyLight.shadow.camera.far = 24;
      keyLight.shadow.camera.left = -5;
      keyLight.shadow.camera.right = 5;
      keyLight.shadow.camera.top = 7;
      keyLight.shadow.camera.bottom = -6;
      keyLight.shadow.bias = -0.0008;
    }
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight('#EC4899', 0.45);
    rimLight.position.set(-5.5, 4.0, -5.0);
    scene.add(rimLight);

    // Track disposable objects
    const disposables: { dispose: () => void }[] = [envRT];
    const track = <T extends { dispose: () => void }>(item: T): T => {
      disposables.push(item);
      return item;
    };

    // Procedural Textures
    const brushedRoughTex = track(createBrushedMetalRoughnessTexture());
    const travertineTex = track(createTravertineTexture(maxAniso));
    const contactShadowTex = track(createContactShadowTexture());
    let currentLabelTex = createFlorisLabelTexture(totalVolume, concentrationPercent, maxAniso);
    const boxTextures = createFlorisBoxTextures(totalVolume, maxAniso);
    disposables.push(boxTextures.front, boxTextures.side, boxTextures.top);

    // Master showcase root centered around pedestal
    const stageGroup = new THREE.Group();
    scene.add(stageGroup);

    // 1. Sculpted Travertine Stone Pedestal (y top = -4.25)
    const pedestalYTop = -4.25;
    const plinthPoints = [
      new THREE.Vector2(0, 0),
      new THREE.Vector2(2.65, 0),
      new THREE.Vector2(2.74, 0.24),
      new THREE.Vector2(2.68, 0.56),
      new THREE.Vector2(2.58, 0.74),
      new THREE.Vector2(2.42, 0.8),
      new THREE.Vector2(0, 0.8),
    ];
    const plinthGeo = track(new THREE.LatheGeometry(plinthPoints, 56));
    // Add gentle organic chiseled rock variation on perimeter vertices
    const posAttr = plinthGeo.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      const vx = posAttr.getX(i);
      const vy = posAttr.getY(i);
      const vz = posAttr.getZ(i);
      const r = Math.hypot(vx, vz);
      if (r > 1.8 && vy < 0.76) {
        const angle = Math.atan2(vz, vx);
        const ripple = 1 + 0.024 * Math.sin(angle * 7 + vy * 4) + 0.014 * Math.cos(angle * 13);
        posAttr.setX(i, vx * ripple);
        posAttr.setZ(i, vz * ripple);
      }
    }
    plinthGeo.computeVertexNormals();
    const plinthMat = track(
      new THREE.MeshStandardMaterial({
        map: travertineTex,
        roughness: 0.85,
        metalness: 0.02,
        color: '#E5CEC4',
      })
    );
    const plinthMesh = new THREE.Mesh(plinthGeo, plinthMat);
    plinthMesh.position.y = pedestalYTop - 0.8;
    plinthMesh.receiveShadow = !isSoftwareGl;
    stageGroup.add(plinthMesh);

    // Contact shadow disc right under bottle & pedestal
    const plinthShadowMat = track(
      new THREE.MeshBasicMaterial({
        map: contactShadowTex,
        transparent: true,
        depthWrite: false,
        opacity: 0.6,
      })
    );
    const plinthShadowGeo = track(new THREE.PlaneGeometry(7.6, 7.6));
    const plinthShadowMesh = new THREE.Mesh(plinthShadowGeo, plinthShadowMat);
    plinthShadowMesh.rotation.x = -Math.PI / 2;
    plinthShadowMesh.position.y = pedestalYTop - 0.81;
    stageGroup.add(plinthShadowMesh);

    // 2. Floris Tall Slender Square Bottle Group (1.5 x 1.5 x 11.58 cm proportions)
    const bottleGroup = new THREE.Group();
    bottleGroup.position.set(0, pedestalYTop, 0);
    stageGroup.add(bottleGroup);

    const glassShadowGeo = track(new THREE.PlaneGeometry(2.5, 2.5));
    const glassShadowMesh = new THREE.Mesh(glassShadowGeo, plinthShadowMat);
    glassShadowMesh.rotation.x = -Math.PI / 2;
    glassShadowMesh.position.y = 0.006;
    bottleGroup.add(glassShadowMesh);

    // 2a. Outer Crystal Glass Body (height 6.52 from y=0.05 to y=6.57)
    const outerHalfW = 0.62;
    const outerGlassShape = createRoundedSquareShape(outerHalfW, 0.13);
    const glassBodyGeo = track(
      new THREE.ExtrudeGeometry(outerGlassShape, {
        depth: 6.44,
        bevelEnabled: true,
        bevelThickness: 0.045,
        bevelSize: 0.045,
        bevelSegments: 4,
        curveSegments: 8,
      })
    );
    glassBodyGeo.rotateX(-Math.PI / 2);

    const glassMat = track(
      new THREE.MeshPhysicalMaterial({
        color: '#EAF4FA',
        metalness: 0.02,
        roughness: 0.05,
        ior: 1.52,
        reflectivity: 0.94,
        clearcoat: 1.0,
        clearcoatRoughness: 0.04,
        transparent: true,
        opacity: isSoftwareGl ? 0.24 : 0.18,
        depthWrite: false,
        envMapIntensity: 1.4,
        side: THREE.DoubleSide,
      })
    );
    const glassBodyMesh = new THREE.Mesh(glassBodyGeo, glassMat);
    glassBodyMesh.position.y = 0.055;
    glassBodyMesh.renderOrder = 5;
    glassBodyMesh.castShadow = !isSoftwareGl;
    bottleGroup.add(glassBodyMesh);

    // Subtle crisp glass chamfer contour lines
    const glassEdgesGeo = track(new THREE.EdgesGeometry(glassBodyGeo, 26));
    const glassEdgesMat = track(
      new THREE.LineBasicMaterial({
        color: '#B8CBD6',
        transparent: true,
        opacity: 0.45,
      })
    );
    const glassEdgesLines = new THREE.LineSegments(glassEdgesGeo, glassEdgesMat);
    glassEdgesLines.position.copy(glassBodyMesh.position);
    glassEdgesLines.renderOrder = 5;
    bottleGroup.add(glassEdgesLines);

    // 2b. Thick Solid Crystal Bottom Floor Pad (heavy glass base detail)
    const basePlugShape = createRoundedSquareShape(0.57, 0.11);
    const basePlugGeo = track(
      new THREE.ExtrudeGeometry(basePlugShape, {
        depth: 0.56,
        bevelEnabled: true,
        bevelThickness: 0.03,
        bevelSize: 0.03,
        bevelSegments: 3,
      })
    );
    basePlugGeo.rotateX(-Math.PI / 2);
    const basePlugMat = track(
      new THREE.MeshPhysicalMaterial({
        color: '#FFFDF9',
        metalness: 0.02,
        roughness: 0.08,
        clearcoat: 1.0,
        transparent: true,
        opacity: 0.42,
        depthWrite: false,
        envMapIntensity: 1.4,
      })
    );
    const basePlugMesh = new THREE.Mesh(basePlugGeo, basePlugMat);
    basePlugMesh.position.y = 0.05;
    basePlugMesh.renderOrder = 4;
    bottleGroup.add(basePlugMesh);

    // 2c. Dynamic Liquid Stack Container (y from 0.68 to 5.98 inside glass walls)
    const liquidGroup = new THREE.Group();
    bottleGroup.add(liquidGroup);
    let liquidMeshes: THREE.Mesh[] = [];
    let meniscusMesh: THREE.Mesh | null = null;

    const rebuildLiquidLayers = (nextLayers: Bottle3DLayer[]) => {
      liquidMeshes.forEach((m) => {
        m.geometry.dispose();
        (m.material as THREE.Material).dispose();
        liquidGroup.remove(m);
      });
      liquidMeshes = [];
      if (meniscusMesh) {
        meniscusMesh.geometry.dispose();
        (meniscusMesh.material as THREE.Material).dispose();
        liquidGroup.remove(meniscusMesh);
        meniscusMesh = null;
      }

      const active = nextLayers.filter((l) => l.pct > 0);
      const sumPct = active.reduce((acc, l) => acc + l.pct, 0) || 100;
      const liquidBaseY = 0.68;
      const totalLiquidH = 5.24;
      let cursorY = liquidBaseY;

      const liquidShape = createRoundedSquareShape(0.505, 0.09);

      active.forEach((layer, idx) => {
        const segH = Math.max(0.08, (layer.pct / sumPct) * totalLiquidH);
        const segGeo = new THREE.ExtrudeGeometry(liquidShape, {
          depth: Math.max(0.05, segH - 0.015),
          bevelEnabled: true,
          bevelThickness: 0.008,
          bevelSize: 0.008,
          bevelSegments: 2,
          curveSegments: 6,
        });
        segGeo.rotateX(-Math.PI / 2);

        const baseColor = new THREE.Color(layer.color || '#F9A8D4');
        const segMat = new THREE.MeshStandardMaterial({
          color: baseColor,
          roughness: 0.16,
          metalness: 0.03,
          transparent: true,
          opacity: 0.9,
          emissive: baseColor,
          emissiveIntensity: 0.08,
          envMapIntensity: 0.7,
        });

        const mesh = new THREE.Mesh(segGeo, segMat);
        mesh.position.y = cursorY + (idx === 0 ? 0 : 0.006);
        mesh.renderOrder = 2;
        mesh.userData = { layerKey: layer.key };
        liquidGroup.add(mesh);
        liquidMeshes.push(mesh);

        cursorY += segH;
      });

      // Top glossy meniscus highlight disc
      const topColor = active.length > 0 ? active[active.length - 1].color : '#FCE7F3';
      const menShape = createRoundedSquareShape(0.49, 0.08);
      const menGeo = new THREE.ShapeGeometry(menShape, 6);
      menGeo.rotateX(-Math.PI / 2);
      const menMat = new THREE.MeshStandardMaterial({
        color: topColor,
        roughness: 0.08,
        metalness: 0.12,
        transparent: true,
        opacity: 0.75,
        emissive: '#FFFFFF',
        emissiveIntensity: 0.15,
      });
      meniscusMesh = new THREE.Mesh(menGeo, menMat);
      meniscusMesh.position.y = cursorY + 0.005;
      meniscusMesh.renderOrder = 4;
      liquidGroup.add(meniscusMesh);

      applyHoverState(stateRef.current.hoveredId);
    };

    const applyHoverState = (hid: string | null) => {
      liquidMeshes.forEach((m) => {
        const mat = m.material as THREE.MeshStandardMaterial;
        const isHit = hid !== null && m.userData.layerKey === hid;
        const isDimmed = hid !== null && !isHit;
        mat.opacity = isDimmed ? 0.56 : 0.92;
        mat.emissiveIntensity = isHit ? 0.34 : 0.08;
        const s = isHit ? 1.032 : 1.0;
        m.scale.set(s, 1, s);
      });
    };

    rebuildLiquidsRef.current = rebuildLiquidLayers;
    updateHoverHighlightRef.current = applyHoverState;
    rebuildLiquidLayers(layers);

    // 2d. Delicate Internal Dip Tube
    const dipTubeGeo = track(new THREE.CylinderGeometry(0.025, 0.025, 5.82, 16));
    const dipTubeMat = track(
      new THREE.MeshPhysicalMaterial({
        color: '#FFFFFF',
        roughness: 0.1,
        metalness: 0.0,
        transparent: true,
        opacity: 0.55,
        depthWrite: false,
      })
    );
    const dipTubeMesh = new THREE.Mesh(dipTubeGeo, dipTubeMat);
    dipTubeMesh.position.set(0.02, 3.62, 0.01);
    dipTubeMesh.rotation.z = -0.022;
    dipTubeMesh.renderOrder = 3;
    bottleGroup.add(dipTubeMesh);

    // 2e. Silver Machined Crimp Collar + Spray Pump Actuator (y: 6.53 -> 7.42)
    const silverChromeMat = track(
      new THREE.MeshStandardMaterial({
        color: '#D5DCE4',
        metalness: 0.94,
        roughness: 0.18,
        roughnessMap: brushedRoughTex,
        envMapIntensity: 1.35,
      })
    );

    const collarProfile = [
      new THREE.Vector2(0.0, 0.0),
      new THREE.Vector2(0.46, 0.0),
      new THREE.Vector2(0.49, 0.05),
      new THREE.Vector2(0.49, 0.32),
      new THREE.Vector2(0.44, 0.36),
      new THREE.Vector2(0.44, 0.42),
      new THREE.Vector2(0.0, 0.42),
    ];
    const collarGeo = track(new THREE.LatheGeometry(collarProfile, 40));
    const collarMesh = new THREE.Mesh(collarGeo, silverChromeMat);
    collarMesh.position.y = 6.52;
    collarMesh.castShadow = !isSoftwareGl;
    bottleGroup.add(collarMesh);

    const nozzleGeo = track(new THREE.CylinderGeometry(0.24, 0.25, 0.52, 32));
    const nozzleMesh = new THREE.Mesh(nozzleGeo, silverChromeMat);
    nozzleMesh.position.y = 7.18;
    bottleGroup.add(nozzleMesh);

    const sprayDotGeo = track(new THREE.CylinderGeometry(0.055, 0.055, 0.03, 16));
    sprayDotGeo.rotateX(Math.PI / 2);
    const sprayDotMat = track(
      new THREE.MeshStandardMaterial({ color: '#374151', roughness: 0.4, metalness: 0.3 })
    );
    const sprayDotMesh = new THREE.Mesh(sprayDotGeo, sprayDotMat);
    sprayDotMesh.position.set(0, 7.26, 0.245);
    bottleGroup.add(sprayDotMesh);

    // 2f. Tall Brushed Chrome Cylindrical Cap (11.58 cm total silhouette!)
    const capGroup = new THREE.Group();
    const closedCapY = 6.62;
    capGroup.position.set(0, closedCapY, 0);
    bottleGroup.add(capGroup);

    const capProfile = [
      new THREE.Vector2(0.0, 0.0),
      new THREE.Vector2(0.515, 0.0),
      new THREE.Vector2(0.53, 0.04),
      new THREE.Vector2(0.53, 2.58),
      new THREE.Vector2(0.505, 2.66),
      new THREE.Vector2(0.45, 2.7),
      new THREE.Vector2(0.0, 2.7),
    ];
    const capGeo = track(new THREE.LatheGeometry(capProfile, 48));
    const capMesh = new THREE.Mesh(capGeo, silverChromeMat);
    capMesh.castShadow = !isSoftwareGl;
    capGroup.add(capMesh);

    // Subtle decorative engraved cap band
    const capBandGeo = track(new THREE.TorusGeometry(0.532, 0.01, 10, 48));
    capBandGeo.rotateX(Math.PI / 2);
    const capBandMesh = new THREE.Mesh(capBandGeo, silverChromeMat);
    capBandMesh.position.y = 0.14;
    capGroup.add(capBandMesh);

    // 2g. Front Scalloped Floris Ogee Label Decal
    const labelMat = track(
      new THREE.MeshStandardMaterial({
        map: currentLabelTex,
        transparent: true,
        alphaTest: 0.35,
        roughness: 0.72,
        metalness: 0.03,
        polygonOffset: true,
        polygonOffsetFactor: -2,
        polygonOffsetUnits: -2,
      })
    );
    const labelGeo = track(new THREE.PlaneGeometry(1.12, 2.86));
    const labelMesh = new THREE.Mesh(labelGeo, labelMat);
    labelMesh.position.set(0, 3.36, outerHalfW + 0.048);
    labelMesh.renderOrder = 6;
    bottleGroup.add(labelMesh);

    updateLabelRef.current = (vol: number, conc: number) => {
      const nextTex = createFlorisLabelTexture(vol, conc, maxAniso);
      labelMat.map = nextTex;
      labelMat.needsUpdate = true;
      currentLabelTex.dispose();
      currentLabelTex = nextTex;
    };

    // 3. Matching Pink Botanical Gift Box (1.8 x 1.8 x 12.18 cm proportion)
    const boxGroup = new THREE.Group();
    boxGroup.position.set(-1.16, pedestalYTop, -0.1);
    boxGroup.scale.setScalar(0.001);
    boxGroup.visible = false;
    stageGroup.add(boxGroup);

    const boxGeo = track(new THREE.BoxGeometry(1.52, 9.76, 1.52));
    const boxSideMat = track(
      new THREE.MeshStandardMaterial({
        map: boxTextures.side,
        roughness: 0.62,
        metalness: 0.08,
      })
    );
    const boxFrontMat = track(
      new THREE.MeshStandardMaterial({
        map: boxTextures.front,
        roughness: 0.62,
        metalness: 0.08,
      })
    );
    const boxTopMat = track(
      new THREE.MeshStandardMaterial({
        map: boxTextures.top,
        roughness: 0.65,
        metalness: 0.06,
      })
    );
    const boxMesh = new THREE.Mesh(boxGeo, [
      boxSideMat,
      boxSideMat,
      boxTopMat,
      boxTopMat,
      boxFrontMat,
      boxSideMat,
    ]);
    boxMesh.position.y = 4.88;
    boxMesh.rotation.y = 0.22;
    boxMesh.castShadow = !isSoftwareGl;
    boxMesh.receiveShadow = !isSoftwareGl;
    boxGroup.add(boxMesh);

    // 4. Subtle 3D Floating Sakura Petals around base & mid-bottle
    const petalsGroup = new THREE.Group();
    stageGroup.add(petalsGroup);
    const petalGeo = track(createSakuraPetalGeometry());
    const petalMatLight = track(
      new THREE.MeshStandardMaterial({
        color: '#FBCFE8',
        roughness: 0.45,
        metalness: 0.02,
        side: THREE.DoubleSide,
      })
    );
    const petalMatDeep = track(
      new THREE.MeshStandardMaterial({
        color: '#F9A8D4',
        roughness: 0.45,
        metalness: 0.02,
        side: THREE.DoubleSide,
      })
    );

    const petalConfigs = [
      { x: -1.45, y: -3.98, z: 1.25, rx: 1.3, ry: 0.4, rz: 0.3, s: 1.25 },
      { x: 1.62, y: -4.05, z: 0.85, rx: 1.45, ry: -0.5, rz: 0.2, s: 1.15 },
      { x: 1.12, y: -4.12, z: -1.35, rx: 1.5, ry: 0.9, rz: -0.2, s: 1.1 },
      { x: -1.85, y: -1.25, z: 0.72, rx: 0.6, ry: 0.7, rz: 0.4, s: 0.9 },
      { x: 1.92, y: 1.15, z: 0.45, rx: 0.5, ry: -0.6, rz: -0.5, s: 0.85 },
      { x: -1.55, y: 3.1, z: -0.55, rx: 0.4, ry: 0.9, rz: 0.3, s: 0.95 },
      { x: 1.45, y: 3.85, z: -0.68, rx: 0.7, ry: -0.4, rz: 0.6, s: 0.85 },
    ];
    petalConfigs.forEach((cfg, idx) => {
      const pMesh = new THREE.Mesh(petalGeo, idx % 2 === 0 ? petalMatLight : petalMatDeep);
      pMesh.position.set(cfg.x, cfg.y, cfg.z);
      pMesh.rotation.set(cfg.rx, cfg.ry, cfg.rz);
      pMesh.scale.setScalar(cfg.s);
      petalsGroup.add(pMesh);
    });

    // Raycasting for interactive 3D liquid layer inspection
    const raycaster = new THREE.Raycaster();
    const pointerNdc = new THREE.Vector2();
    let pointerDownPos = { x: 0, y: 0 };

    const pickLiquidLayer = (clientX: number, clientY: number): string | null => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return null;
      pointerNdc.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      pointerNdc.y = -((clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointerNdc, camera);
      const hits = raycaster.intersectObjects(liquidMeshes, false);
      if (hits.length > 0 && hits[0].object.userData?.layerKey) {
        return String(hits[0].object.userData.layerKey);
      }
      return null;
    };

    const handlePointerMove = (e: PointerEvent) => {
      const hitKey = pickLiquidLayer(e.clientX, e.clientY);
      canvas.style.cursor = hitKey ? 'pointer' : 'grab';
      if (hitKey !== stateRef.current.hoveredId) {
        callbacksRef.current.onHoverLayer(hitKey);
      }
    };

    const handlePointerDown = (e: PointerEvent) => {
      pointerDownPos = { x: e.clientX, y: e.clientY };
    };

    const handlePointerUp = (e: PointerEvent) => {
      const dist = Math.hypot(e.clientX - pointerDownPos.x, e.clientY - pointerDownPos.y);
      if (dist > 6) return; // Was orbit drag, not tap/click
      const hitKey = pickLiquidLayer(e.clientX, e.clientY);
      if (hitKey) {
        callbacksRef.current.onSelectLayer(
          stateRef.current.hoveredId === hitKey ? null : hitKey
        );
      }
    };

    const handlePointerLeave = () => {
      canvas.style.cursor = 'grab';
      if (stateRef.current.hoveredId !== null) {
        callbacksRef.current.onHoverLayer(null);
      }
    };

    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointerup', handlePointerUp);
    canvas.addEventListener('pointerleave', handlePointerLeave);

    // Coalesced On-Demand Render Loop + Software WebGL Fence Pacing
    let rafId: number | null = null;
    let fenceTimerId: number | null = null;
    let pendingRender = false;
    let disposed = false;
    let lastTickMs = performance.now();

    const glContext = renderer.getContext();
    const isWebGL2 =
      typeof WebGL2RenderingContext !== 'undefined' && glContext instanceof WebGL2RenderingContext;

    const afterDraw = (callback: () => void) => {
      if (disposed) return;
      if (!isSoftwareGl || !isWebGL2) {
        rafId = window.requestAnimationFrame(callback);
        return;
      }
      const gl2 = glContext as WebGL2RenderingContext;
      const sync = gl2.fenceSync(gl2.SYNC_GPU_COMMANDS_COMPLETE, 0);
      if (!sync) {
        fenceTimerId = window.setTimeout(callback, 40);
        return;
      }
      gl2.flush();
      const pollFence = () => {
        if (disposed) {
          gl2.deleteSync(sync);
          return;
        }
        const status = gl2.getSyncParameter(sync, gl2.SYNC_STATUS);
        if (status === gl2.SIGNALED || status === gl2.WAIT_FAILED) {
          gl2.deleteSync(sync);
          fenceTimerId = window.setTimeout(callback, 20);
        } else {
          fenceTimerId = window.setTimeout(pollFence, 16);
        }
      };
      fenceTimerId = window.setTimeout(pollFence, 16);
    };

    const tick = (nowMs: number = performance.now()) => {
      pendingRender = false;
      if (disposed) return;

      const dt = Math.min((nowMs - lastTickMs) / 1000, isSoftwareGl ? 0.12 : 0.05);
      lastTickMs = nowMs;

      let needsMoreFrames = false;

      // Damped Cap Open/Close transition
      const targetCapY = stateRef.current.isCapOpen ? closedCapY + 1.85 : closedCapY;
      const targetCapRotZ = stateRef.current.isCapOpen ? -0.18 : 0;
      const targetCapX = stateRef.current.isCapOpen ? 0.28 : 0;
      capGroup.position.y = THREE.MathUtils.damp(capGroup.position.y, targetCapY, 8, dt);
      capGroup.position.x = THREE.MathUtils.damp(capGroup.position.x, targetCapX, 8, dt);
      capGroup.rotation.z = THREE.MathUtils.damp(capGroup.rotation.z, targetCapRotZ, 8, dt);
      if (
        Math.abs(capGroup.position.y - targetCapY) > 0.004 ||
        Math.abs(capGroup.rotation.z - targetCapRotZ) > 0.004
      ) {
        needsMoreFrames = true;
      }

      // Damped Gift Box visibility & symmetrical shift
      const targetBottleX = stateRef.current.showGiftBox ? 1.08 : 0;
      const targetBoxScale = stateRef.current.showGiftBox ? 1 : 0.001;
      bottleGroup.position.x = THREE.MathUtils.damp(bottleGroup.position.x, targetBottleX, 7.5, dt);
      const nextBoxS = THREE.MathUtils.damp(boxGroup.scale.y, targetBoxScale, 8, dt);
      boxGroup.scale.setScalar(nextBoxS);
      boxGroup.visible = nextBoxS > 0.02;
      if (
        Math.abs(bottleGroup.position.x - targetBottleX) > 0.004 ||
        Math.abs(nextBoxS - targetBoxScale) > 0.008
      ) {
        needsMoreFrames = true;
      }

      // Camera Reset Preset Smooth Glide
      if (stateRef.current.resetCameraRequested) {
        camera.position.lerp(defaultCamPos, isSoftwareGl ? 1 : 0.16);
        controls.target.lerp(defaultTarget, isSoftwareGl ? 1 : 0.16);
        if (camera.position.distanceTo(defaultCamPos) < 0.02) {
          camera.position.copy(defaultCamPos);
          controls.target.copy(defaultTarget);
          stateRef.current.resetCameraRequested = false;
        } else {
          needsMoreFrames = true;
        }
      }

      // Auto-spin turntable when explicitly active
      if (stateRef.current.isAutoSpin) {
        stageGroup.rotation.y += dt * 0.55;
        needsMoreFrames = true;
      }

      if (controls.update()) {
        needsMoreFrames = true;
      }

      renderer.render(scene, camera);

      if (needsMoreFrames && !pendingRender) {
        pendingRender = true;
        afterDraw(() => tick(performance.now()));
      }
    };

    const scheduleRender = () => {
      if (disposed || pendingRender) return;
      pendingRender = true;
      lastTickMs = performance.now();
      rafId = window.requestAnimationFrame(() => tick(performance.now()));
    };

    requestRenderRef.current = scheduleRender;
    controls.addEventListener('change', scheduleRender);

    // ResizeObserver for crisp responsive scaling
    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry || disposed) return;
      const nextW = Math.max(Math.floor(entry.contentRect.width), 240);
      const nextH = Math.max(Math.floor(entry.contentRect.height), compact ? 260 : 320);
      camera.aspect = nextW / nextH;
      camera.updateProjectionMatrix();
      renderer.setSize(nextW, nextH, false);
      scheduleRender();
    });
    resizeObserver.observe(container);

    // Initial synchronous draw so WebGL scene is immediately visible
    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }
    renderer.render(scene, camera);
    setIsWebglReady(true);

    return () => {
      disposed = true;
      if (rafId !== null) window.cancelAnimationFrame(rafId);
      if (fenceTimerId !== null) window.clearTimeout(fenceTimerId);
      resizeObserver.disconnect();
      controls.removeEventListener('change', scheduleRender);
      controls.dispose();

      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerdown', handlePointerDown);
      canvas.removeEventListener('pointerup', handlePointerUp);
      canvas.removeEventListener('pointerleave', handlePointerLeave);

      liquidMeshes.forEach((m) => {
        m.geometry.dispose();
        (m.material as THREE.Material).dispose();
      });
      if (meniscusMesh) {
        meniscusMesh.geometry.dispose();
        (meniscusMesh.material as THREE.Material).dispose();
      }
      currentLabelTex.dispose();
      disposables.forEach((d) => {
        try {
          d.dispose();
        } catch {
          // ignore already-disposed
        }
      });
      renderer.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleResetView = () => {
    stateRef.current.resetCameraRequested = true;
    setIsAutoSpin(false);
    requestRenderRef.current();
  };

  if (webglError) {
    return (
      <div className="w-full h-72 rounded-3xl bg-[#FFF5F8] border border-[#FBCFE8] flex flex-col items-center justify-center p-6 text-center gap-2">
        <Sparkles className="w-6 h-6 text-[#DB2777]" />
        <p className="text-xs font-bold text-[#9D174D]">{webglError}</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      data-webgl-ready={isWebglReady ? 'true' : 'false'}
      aria-label={`Mô hình 3D chai nước hoa ${perfumeName} ${totalVolume} mL`}
      className={`relative w-full ${
        compact ? 'h-[300px] sm:h-[320px]' : 'h-[340px] sm:h-[370px]'
      } rounded-3xl overflow-hidden border border-[#F3D5E0] bg-[#FFF5F8] select-none`}
    >
      <canvas ref={canvasRef} className="w-full h-full block touch-none" />

      {/* Top-left subtle cue pill (solid cream, no backdrop-filter over WebGL) */}
      <div className="absolute top-2.5 left-2.5 pointer-events-none">
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/95 border border-[#FBCFE8] text-[10px] font-bold text-[#9D174D] shadow-xs">
          <span>✨ 3D</span>
          <span className="text-[#5C6B5F] font-semibold">· Kéo xoay</span>
        </span>
      </div>

      {/* Bottom-center interactive capsule toolbar (solid light surfaces, zero blur over canvas) */}
      <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex flex-wrap items-center justify-center gap-1 p-1 rounded-2xl bg-white/95 border border-[#F3D5E0] shadow-md w-max max-w-[95%]">
        <button
          type="button"
          onClick={() => setIsCapOpen((v) => !v)}
          className={`px-2 py-1 rounded-xl text-[10px] sm:text-[11px] font-bold flex items-center gap-1 whitespace-nowrap transition-colors ${
            isCapOpen
              ? 'bg-[#FCE7F3] text-[#BE185D]'
              : 'text-[#4A4D48] hover:bg-[#FFF5F8]'
          }`}
          title="Mở hoặc đóng nắp chai 3D"
        >
          <ArrowUpFromLine className="w-3 h-3 shrink-0" />
          <span>{isCapOpen ? 'Đóng nắp' : 'Mở nắp'}</span>
        </button>

        <button
          type="button"
          onClick={() => setShowGiftBox((v) => !v)}
          className={`px-2 py-1 rounded-xl text-[10px] sm:text-[11px] font-bold flex items-center gap-1 whitespace-nowrap transition-colors ${
            showGiftBox
              ? 'bg-[#DCFCE7] text-[#15803D]'
              : 'text-[#4A4D48] hover:bg-[#F2FDF5]'
          }`}
          title="Hiện hoặc ẩn hộp giấy Floris"
        >
          <Package className="w-3 h-3 shrink-0" />
          <span>{showGiftBox ? 'Ẩn hộp' : 'Hộp'}</span>
        </button>

        <button
          type="button"
          onClick={() => setIsAutoSpin((v) => !v)}
          className={`px-2 py-1 rounded-xl text-[10px] sm:text-[11px] font-bold flex items-center gap-1 whitespace-nowrap transition-colors ${
            isAutoSpin
              ? 'bg-[#FEF3C7] text-[#92400E]'
              : 'text-[#4A4D48] hover:bg-[#FFFDF0]'
          }`}
          title="Tự xoay mô hình 3D"
        >
          {isAutoSpin ? <Pause className="w-3 h-3 shrink-0" /> : <Play className="w-3 h-3 shrink-0" />}
          <span>Xoay</span>
        </button>

        <button
          type="button"
          onClick={handleResetView}
          className="px-2 py-1 rounded-xl text-[10px] sm:text-[11px] font-bold text-[#5C6B5F] hover:text-[#2B342D] hover:bg-[#FFF5F8] flex items-center gap-1 whitespace-nowrap transition-colors"
          title="Đưa về góc nhìn chuẩn"
        >
          <RotateCcw className="w-3 h-3 shrink-0" />
          <span>Đặt lại</span>
        </button>
      </div>
    </div>
  );
};
