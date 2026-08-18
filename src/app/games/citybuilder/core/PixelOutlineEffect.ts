import { Effect, EffectAttribute } from 'postprocessing';
import { Uniform, Color } from 'three';

const fragmentShader = /* glsl */ `
  uniform float depthThreshold;
  uniform float outlineThickness;
  uniform vec3 outlineColor;

  void mainImage(const in vec4 inputColor, const in vec2 uv, const in float depth, out vec4 outputColor) {
    vec2 texel = (1.0 / resolution.xy) * outlineThickness;

    // 4 arah lurus (atas-bawah-kiri-kanan) — sudah ada sebelumnya
    float d0 = readDepth(uv + vec2(texel.x, 0.0));
    float d1 = readDepth(uv - vec2(texel.x, 0.0));
    float d2 = readDepth(uv + vec2(0.0, texel.y));
    float d3 = readDepth(uv - vec2(0.0, texel.y));

    // 👇 INI BAGIAN BARU (poin #2) — 4 arah diagonal, taruh persis di sini
    float d4 = readDepth(uv + vec2(texel.x, texel.y));
    float d5 = readDepth(uv - vec2(texel.x, texel.y));
    float d6 = readDepth(uv + vec2(texel.x, -texel.y));
    float d7 = readDepth(uv - vec2(texel.x, -texel.y));

    // Gabungkan SEMUA 8 sample (lurus + diagonal) ke depthDiff
    float depthDiff = abs(depth - d0) + abs(depth - d1) + abs(depth - d2) + abs(depth - d3)
                     + abs(depth - d4) + abs(depth - d5) + abs(depth - d6) + abs(depth - d7);

    float edge = step(depthThreshold, depthDiff);

    outputColor = mix(inputColor, vec4(outlineColor, inputColor.a), edge);
  }
`;

export class PixelOutlineEffect extends Effect {
  constructor({
    depthThreshold = 0.0004,
    outlineThickness = 1.0,
    outlineColor = new Color('black'),
  }: { depthThreshold?: number; outlineThickness?: number; outlineColor?: Color } = {}) {
    super('PixelOutlineEffect', fragmentShader, {
      attributes: EffectAttribute.DEPTH,
      uniforms: new Map<string, Uniform>([
        ['depthThreshold', new Uniform(depthThreshold)],
        ['outlineThickness', new Uniform(outlineThickness)],
        ['outlineColor', new Uniform(outlineColor)],
      ]),
    });
  }
}