#include <common>
#pragma glslify: snoise2 = require(glsl-noise/simplex/2d)

varying vec2 vUv;
varying vec3 vNormalRaw;
varying vec3 vNormal;
varying float vReceiveLight;

uniform float uTime;

// TODO: point lightの実装
void main() {

	vec4 color = vec4(.2, .6, .3, 1.);
	// vec4 color = vec4(1.);
	color.rgb *= vReceiveLight;

	float line = 0.;
	if(vNormalRaw.x == 1. || vNormalRaw.x == -1.) {
		line = vUv.x;
	} else if (vNormalRaw.y == 1. || vNormalRaw.y == -1.) {
		if(
			(vUv.y > vUv.x && vUv.y > 1. - vUv.x) ||
			(vUv.y < vUv.x && vUv.y < 1. - vUv.x)
		) {
			line = vUv.x;
		} else {
			line = vUv.y;
		}
	} else {
		line = vUv.x;
	}

	color.a *= step(fract(line * 40.), .8);

	gl_FragColor = color;
}