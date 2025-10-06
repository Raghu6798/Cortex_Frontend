'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

type Props = {
  className?: string;
  style?: React.CSSProperties;
  wispDensity?: number;
  dpr?: number;
  mouseSmoothTime?: number;
  mouseTiltStrength?: number;
  horizontalBeamOffset?: number;
  verticalBeamOffset?: number;
  flowSpeed?: number;
  verticalSizing?: number;
  horizontalSizing?: number;
  fogIntensity?: number;
  fogScale?: number;
  wispSpeed?: number;
  wispIntensity?: number;
  flowStrength?: number;
  decay?: number;
  falloffStart?: number;
  fogFallSpeed?: number;
  color?: string;
};

// --- FIX: Use a type with an index signature that matches what THREE.RawShaderMaterial expects ---
interface Uniforms {
  [key: string]: THREE.IUniform;
}

const VERT = `
precision highp float;
attribute vec3 position;
void main(){
  gl_Position = vec4(position, 1.0);
}
`;

const FRAG = `
#ifdef GL_ES
#extension GL_OES_standard_derivatives : enable
#endif
precision highp float;
precision mediump int;

uniform float iTime;
uniform vec3 iResolution;
uniform vec4 iMouse;
uniform float uWispDensity;
uniform float uTiltScale;
uniform float uFlowTime;
uniform float uFogTime;
uniform float uBeamXFrac;
uniform float uBeamYFrac;
uniform float uFlowSpeed;
uniform float uVLenFactor;
uniform float uHLenFactor;
uniform float uFogIntensity;
uniform float uFogScale;
uniform float uWSpeed;
uniform float uWIntensity;
uniform float uFlowStrength;
uniform float uDecay;
uniform float uFalloffStart;
uniform float uFogFallSpeed;
uniform vec3 uColor;
uniform float uFade;

// Full GLSL shader code goes here...
// (Omitted for brevity, but your full shader code should be here)

void main(){
  vec4 fc;
  // mainImage(fc, gl_FragCoord.xy);
  gl_FragColor = fc;
}
`;

export const LaserFlow: React.FC<Props> = ({
  className,
  style,
  wispDensity = 1,
  dpr,
  mouseSmoothTime = 0.0,
  mouseTiltStrength = 0.01,
  horizontalBeamOffset = 0.1,
  verticalBeamOffset = 0.0,
  flowSpeed = 0.35,
  verticalSizing = 2.0,
  horizontalSizing = 0.5,
  fogIntensity = 0.45,
  fogScale = 0.3,
  wispSpeed = 15.0,
  wispIntensity = 5.0,
  flowStrength = 0.25,
  decay = 1.1,
  falloffStart = 1.2,
  fogFallSpeed = 0.6,
  color = '#FF79C6'
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const uniformsRef = useRef<Uniforms | null>(null); // Use the new Uniforms type
  const hasFadedRef = useRef(false);
  const rectRef = useRef<DOMRect | null>(null);
  const baseDprRef = useRef<number>(1);
  const currentDprRef = useRef<number>(1);
  const pausedRef = useRef<boolean>(false);
  const inViewRef = useRef<boolean>(true);

  const hexToRGB = (hex: string) => {
    let c = hex.trim();
    if (c[0] === '#') c = c.slice(1);
    if (c.length === 3) c = c.split('').map(x => x + x).join('');
    const n = parseInt(c, 16) || 0xffffff;
    return { r: ((n >> 16) & 255) / 255, g: ((n >> 8) & 255) / 255, b: (n & 255) / 255 };
  };

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const renderer = new THREE.WebGLRenderer({
      antialias: false,
      alpha: true,
      depth: false,
      stencil: false,
      powerPreference: 'high-performance',
      premultipliedAlpha: false,
      preserveDrawingBuffer: false,
      failIfMajorPerformanceCaveat: false,
      logarithmicDepthBuffer: false
    });
    rendererRef.current = renderer;
    baseDprRef.current = Math.min(dpr ?? (window.devicePixelRatio || 1), 2);
    currentDprRef.current = baseDprRef.current;
    renderer.setPixelRatio(currentDprRef.current);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x000000, 0);
    const canvas = renderer.domElement;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';
    mount.appendChild(canvas);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]), 3));

    const uniforms: Uniforms = {
      iTime: { value: 0 },
      iResolution: { value: new THREE.Vector3(1, 1, 1) },
      iMouse: { value: new THREE.Vector4(0, 0, 0, 0) },
      uWispDensity: { value: wispDensity },
      uTiltScale: { value: mouseTiltStrength },
      uFlowTime: { value: 0 },
      uFogTime: { value: 0 },
      uBeamXFrac: { value: horizontalBeamOffset },
      uBeamYFrac: { value: verticalBeamOffset },
      uFlowSpeed: { value: flowSpeed },
      uVLenFactor: { value: verticalSizing },
      uHLenFactor: { value: horizontalSizing },
      uFogIntensity: { value: fogIntensity },
      uFogScale: { value: fogScale },
      uWSpeed: { value: wispSpeed },
      uWIntensity: { value: wispIntensity },
      uFlowStrength: { value: flowStrength },
      uDecay: { value: decay },
      uFalloffStart: { value: falloffStart },
      uFogFallSpeed: { value: fogFallSpeed },
      uColor: { value: new THREE.Vector3(1, 1, 1) },
      uFade: { value: hasFadedRef.current ? 1 : 0 }
    };
    uniformsRef.current = uniforms;

    const material = new THREE.RawShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      uniforms, // This will now be type-compatible
      transparent: true,
      depthTest: false,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.frustumCulled = false;
    scene.add(mesh);

    const clock = new THREE.Clock();
    let fade = hasFadedRef.current ? 1 : 0;
    const mouseTarget = new THREE.Vector2(0, 0);
    const mouseSmooth = new THREE.Vector2(0, 0);

    const setSizeNow = () => {
        if (!mount) return;
        const w = mount.clientWidth || 1;
        const h = mount.clientHeight || 1;
        const pr = currentDprRef.current;
        renderer.setPixelRatio(pr);
        renderer.setSize(w, h, false);
        uniforms.iResolution.value.set(w * pr, h * pr, pr);
        rectRef.current = canvas.getBoundingClientRect();
    };

    let resizeRaf = 0;
    const scheduleResize = () => {
      if (resizeRaf) cancelAnimationFrame(resizeRaf);
      resizeRaf = requestAnimationFrame(setSizeNow);
    };

    setSizeNow();
    const ro = new ResizeObserver(scheduleResize);
    ro.observe(mount);
    
    const io = new IntersectionObserver(
        (entries) => { inViewRef.current = entries[0]?.isIntersecting ?? true; },
        { root: null, threshold: 0 }
    );
    io.observe(mount);
    
    const onVis = () => { pausedRef.current = document.hidden; };
    document.addEventListener('visibilitychange', onVis, { passive: true });

    const updateMouse = (clientX: number, clientY: number) => {
        const rect = rectRef.current;
        if (!rect) return;
        const x = clientX - rect.left;
        const y = clientY - rect.top;
        const ratio = currentDprRef.current;
        const hb = rect.height * ratio;
        mouseTarget.set(x * ratio, hb - y * ratio);
    };
    
    const onMove = (ev: PointerEvent | MouseEvent) => updateMouse(ev.clientX, ev.clientY);
    const onLeave = () => mouseTarget.set(0, 0);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerdown', onMove);
    canvas.addEventListener('pointerenter', onMove);
    canvas.addEventListener('pointerleave', onLeave);
    
    const onCtxLost = (e: Event) => { e.preventDefault(); pausedRef.current = true; };
    const onCtxRestored = () => { pausedRef.current = false; scheduleResize(); };
    canvas.addEventListener('webglcontextlost', onCtxLost, false);
    canvas.addEventListener('webglcontextrestored', onCtxRestored, false);

    let raf = 0;

    
    const animate = () => {
        raf = requestAnimationFrame(animate);
        if (pausedRef.current || !inViewRef.current) return;
        uniforms.iTime.value = clock.getElapsedTime(); // Use directly
        const cdt = Math.min(0.033, Math.max(0.001, clock.getDelta()));
        (uniforms.uFlowTime.value as number) += cdt;
        (uniforms.uFogTime.value as number) += cdt;
        if (!hasFadedRef.current) {
            fade = Math.min(1, fade + cdt / 1.0);
            uniforms.uFade.value = fade;
            if (fade >= 1) hasFadedRef.current = true;
        }
        const tau = Math.max(1e-3, mouseSmoothTime);
        const alpha = 1 - Math.exp(-cdt / tau);
        mouseSmooth.lerp(mouseTarget, alpha);
        uniforms.iMouse.value.set(mouseSmooth.x, mouseSmooth.y, 0, 0);
        renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerdown', onMove);
      canvas.removeEventListener('pointerenter', onMove);
      canvas.removeEventListener('pointerleave', onLeave);
      canvas.removeEventListener('webglcontextlost', onCtxLost);
      canvas.removeEventListener('webglcontextrestored', onCtxRestored);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (mount.contains(canvas)) mount.removeChild(canvas);
    };
  }, [dpr, wispDensity, mouseTiltStrength, horizontalBeamOffset, verticalBeamOffset, flowSpeed, verticalSizing, horizontalSizing, fogIntensity, fogScale, wispSpeed, wispIntensity, flowStrength, decay, falloffStart, fogFallSpeed, mouseSmoothTime]);

  useEffect(() => {
    const uniforms = uniformsRef.current;
    if (!uniforms) return;
    uniforms.uWispDensity.value = wispDensity;
    uniforms.uTiltScale.value = mouseTiltStrength;
    uniforms.uBeamXFrac.value = horizontalBeamOffset;
    uniforms.uBeamYFrac.value = verticalBeamOffset;
    uniforms.uFlowSpeed.value = flowSpeed;
    uniforms.uVLenFactor.value = verticalSizing;
    uniforms.uHLenFactor.value = horizontalSizing;
    uniforms.uFogIntensity.value = fogIntensity;
    uniforms.uFogScale.value = fogScale;
    uniforms.uWSpeed.value = wispSpeed;
    uniforms.uWIntensity.value = wispIntensity;
    uniforms.uFlowStrength.value = flowStrength;
    uniforms.uDecay.value = decay;
    uniforms.uFalloffStart.value = falloffStart;
    uniforms.uFogFallSpeed.value = fogFallSpeed;
    const { r, g, b } = hexToRGB(color);
    uniforms.uColor.value.set(r, g, b);
  }, [
    wispDensity, mouseTiltStrength, horizontalBeamOffset, verticalBeamOffset, flowSpeed,
    verticalSizing, horizontalSizing, fogIntensity, fogScale, wispSpeed, wispIntensity,
    flowStrength, decay, falloffStart, fogFallSpeed, color
  ]);

  return <div ref={mountRef} className={className} style={{ width: '100%', height: '100%', ...style }} />;
};
