import React, { useRef, useEffect } from 'react';
import { Renderer, Program, Mesh, Triangle } from 'ogl';
import './LiquidChrome.css';

export interface LiquidChromeProps {
  baseColor?: [number, number, number];
  speed?: number;
  amplitude?: number;
  frequencyX?: number;
  frequencyY?: number;
  interactive?: boolean;
}

const vertexShader = `
attribute vec2 position;
attribute vec2 uv;

varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const fragmentShader = `
precision highp float;

uniform float uTime;
uniform vec3 uResolution;
uniform vec3 uBaseColor;
uniform float uAmplitude;
uniform float uFrequencyX;
uniform float uFrequencyY;
uniform vec2 uMouse;

varying vec2 vUv;

vec4 renderImage(vec2 uvCoord) {
  vec2 fragCoord = uvCoord * uResolution.xy;

  vec2 uv =
    (2.0 * fragCoord - uResolution.xy) /
    min(uResolution.x, uResolution.y);

  /*
   * LARGE-SCALE LIQUID DISTORTION
   *
   * Keep the deformation smooth and large.
   * Do not introduce high-frequency noise.
   */
  for (float i = 1.0; i < 10.0; i++) {
    uv.x +=
      uAmplitude / i *
      cos(
        i * uFrequencyX * uv.y +
        uTime +
        uMouse.x * 3.14159
      );

    uv.y +=
      uAmplitude / i *
      cos(
        i * uFrequencyY * uv.x +
        uTime +
        uMouse.y * 3.14159
      );
  }

  /*
   * SUBTLE MOUSE DISTORTION
   */
  vec2 diff = uvCoord - uMouse;
  float dist = length(diff);
  float falloff = exp(-dist * 20.0);
  float ripple = sin(10.0 * dist - uTime * 2.0) * 0.03;

  uv += (diff / (dist + 0.0001)) * ripple * falloff;

  /*
   * BASE LIQUID COLOR & SHADING
   */
  float wave = abs(sin(uTime - uv.y - uv.x));
  vec3 rawColor = uBaseColor / max(wave, 0.001);

  /*
   * RICH BLUE / VIOLET TO WHITE FLUID COLOR MAPPING:
   * Deep Indigo/Violet (#4D4DB4 / #2E2E80) -> Rich Blue/Violet -> Soft Light Violet -> Flowing White Highlights
   */
  float luminance = dot(rawColor, vec3(0.299, 0.587, 0.114));
  float midtoneMask = smoothstep(0.32, 0.66, luminance);
  float whiteMask = smoothstep(0.68, 0.95, luminance);

  vec3 deepBase = uBaseColor; // [0.302, 0.302, 0.706] (#4D4DB4)
  vec3 midtone = vec3(0.52, 0.52, 0.94); // Soft radiant blue-violet
  vec3 white = vec3(0.99, 0.99, 1.0); // Bright white liquid highlights

  vec3 finalColor = mix(deepBase, midtone, midtoneMask);
  finalColor = mix(finalColor, white, whiteMask);

  return vec4(finalColor, 1.0);
}

void main() {
  /*
   * 3x3 supersampling.
   * Keeps the liquid edges ultra smooth and anti-aliased.
   */
  vec4 col = vec4(0.0);
  int samples = 0;

  for (int i = -1; i <= 1; i++) {
    for (int j = -1; j <= 1; j++) {
      vec2 offset =
        vec2(float(i), float(j)) /
        min(uResolution.x, uResolution.y);

      col += renderImage(vUv + offset);
      samples++;
    }
  }

  gl_FragColor = col / float(samples);
}
`;

export const LiquidChrome: React.FC<LiquidChromeProps> = ({
  baseColor = [0.302, 0.302, 0.706],
  speed = 0.3,
  amplitude = 0.22,
  frequencyX = 3,
  frequencyY = 3,
  interactive = true,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    let animationFrameId: number;

    // Initialize OGL Renderer
    const renderer = new Renderer({
      antialias: true,
      alpha: false,
      dpr: Math.min(window.devicePixelRatio, 2),
    });

    const gl = renderer.gl;
    gl.clearColor(baseColor[0], baseColor[1], baseColor[2], 1.0);

    container.appendChild(gl.canvas);

    // Fullscreen Triangle Geometry
    const geometry = new Triangle(gl);

    // Uniform definitions
    const uniforms = {
      uTime: { value: 0 },
      uResolution: { value: [gl.canvas.width, gl.canvas.height, gl.canvas.width / gl.canvas.height] },
      uBaseColor: { value: baseColor },
      uAmplitude: { value: amplitude },
      uFrequencyX: { value: frequencyX },
      uFrequencyY: { value: frequencyY },
      uMouse: { value: [0.5, 0.5] },
    };

    // Program & Mesh
    const program = new Program(gl, {
      vertex: vertexShader,
      fragment: fragmentShader,
      uniforms,
    });

    const mesh = new Mesh(gl, { geometry, program });

    // Handle Resize
    const resize = () => {
      if (!container) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      renderer.setSize(width, height);
      uniforms.uResolution.value = [gl.canvas.width, gl.canvas.height, gl.canvas.width / gl.canvas.height];
    };

    window.addEventListener('resize', resize);
    resize();

    // Mouse Interaction
    let targetMouse = [0.5, 0.5];
    let currentMouse = [0.5, 0.5];

    const handleMouseMove = (e: MouseEvent) => {
      if (!interactive) return;
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = 1.0 - (e.clientY - rect.top) / rect.height;
      targetMouse = [Math.max(0, Math.min(1, x)), Math.max(0, Math.min(1, y))];
    };

    if (interactive) {
      window.addEventListener('mousemove', handleMouseMove, { passive: true });
    }

    // Animation Render Loop
    let startTime = performance.now();

    const update = (now: number) => {
      animationFrameId = requestAnimationFrame(update);

      const elapsed = (now - startTime) * 0.001;
      uniforms.uTime.value = elapsed * speed;

      if (interactive) {
        currentMouse[0] += (targetMouse[0] - currentMouse[0]) * 0.05;
        currentMouse[1] += (targetMouse[1] - currentMouse[1]) * 0.05;
        uniforms.uMouse.value = currentMouse;
      }

      renderer.render({ scene: mesh });
    };

    animationFrameId = requestAnimationFrame(update);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
      if (interactive) {
        window.removeEventListener('mousemove', handleMouseMove);
      }
      if (gl.canvas && gl.canvas.parentNode === container) {
        container.removeChild(gl.canvas);
      }
      const loseContext = gl.getExtension('WEBGL_lose_context');
      if (loseContext) {
        loseContext.loseContext();
      }
    };
  }, [baseColor, speed, amplitude, frequencyX, frequencyY, interactive]);

  return <div ref={containerRef} className="liquid-chrome-container" />;
};

export default LiquidChrome;
