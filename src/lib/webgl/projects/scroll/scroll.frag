#include <common>

varying vec2 vUv;
uniform vec2 uResolution;
uniform float uScrollPos;
uniform float uWidthGap;
uniform float uTransparency;
uniform sampler2D uSampler;

float scale(float v, float from1, float from2, float to1, float to2) {
  return (v - from1) * (to2 - to1) / (from2 - from1) + to1;
}

float arcQuarterY(float x) {
    return sqrt(1.0 - x * x);
}

// TODO: point lightの実装
void main() {
	vec2 uv = vUv;
	vec2 frontUv = uv;
	vec2 backUv = uv;
	// vec4 color = vec4(uv.x, fract(uv.y * 20.), 1., 1.);
	vec4 color = vec4(0.);

	// 上に向かって萎んでいく
	float widthScaleFront = 1.;
	float widthGap = uWidthGap;
	float thresholdY = 1. - widthGap / uResolution.y;
	float thresholdX = 1. - (widthGap * 2.) / uResolution.x;
	if(frontUv.y > thresholdY) {
		float ratio = scale(frontUv.y, thresholdY, 1., 0., 1.);
		widthScaleFront *= arcQuarterY(ratio);
		widthScaleFront = scale(widthScaleFront, 1., 0., 1., thresholdX);

		frontUv.x -= 0.5;
		frontUv.x /= widthScaleFront;
		frontUv.x += 0.5;
	}

	frontUv.y -= uScrollPos;
	if(frontUv.x >= 0. && frontUv.x <= 1. && frontUv.y >= 0. && frontUv.y <= 1.) {
		color += texture2D(uSampler, frontUv);
	}

	// 裏側
	float widthScaleBackMax = thresholdX - (1. - thresholdX);
	float widthScaleBack = 1.;
	if(backUv.y > thresholdY) {
		float ratio = scale(backUv.y, thresholdY, 1., 0., 1.);
		widthScaleBack *= arcQuarterY(ratio);
		// widthScaleBack *= ratio;
		widthScaleBack = scale(widthScaleBack, 0., 1., thresholdX, widthScaleBackMax);
	} else {
		widthScaleBack = widthScaleBackMax;
	}
	backUv.x -= 0.5;
	backUv.x /= widthScaleBack;
	backUv.x += 0.5;
	backUv.y = 1. - backUv.y;
	backUv.y -= uScrollPos - 1.;
	if(backUv.x >= 0. && backUv.x <= 1. && backUv.y >= 0. && backUv.y <= 1.) {
		vec4 backColor = texture2D(uSampler, backUv);
		backColor.a *= uTransparency;
		color += backColor * step(color.a, 0.);
	}

	// 縁つけてみた
	float edgeWidth = 2.;
	float edgethresholdX = (edgeWidth * 2.) / uResolution.x;
	if(
		(frontUv.x < edgethresholdX && frontUv.x > 0.) ||
		(frontUv.x > (1. - edgethresholdX) && frontUv.x < 1.)
	) {
		// color.a = 1.;
		// color.rgb = vec3(0.);
	}
	if(
		(backUv.x < edgethresholdX && backUv.x > 0.) ||
		(backUv.x > (1. - edgethresholdX) && backUv.x < 1.)
	) {
		// if(color.a <= 0.) color = vec4(vec3(0.), uTransparency * scale(backUv.y, 1., 0., 0., 1.));
	}

	gl_FragColor = color;
}