#include <common>
#pragma glslify: snoise2 = require(glsl-noise/simplex/2d)

varying vec2 vUv;
varying vec3 vNormalRaw;
varying vec3 vNormal;
varying float vReceiveLight;
varying float vSea;

uniform float uTime;
uniform float uBoxAmount;

// TODO: point lightの実装
void main() {

	vec3 glass = vec3(.4, .4, .7);
	vec3 sea = vec3(.02, .02, .1);
	vec4 color = vec4(mix(glass, sea, vSea), 1.);
	if(vSea < .03) color = vec4(.6, .95, .85, 1.);
	color = mix(color, vec4(1.), uBoxAmount);
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

	color.a *= step(fract(line * 50.), uBoxAmount * .5 + .5 + vSea);

	gl_FragColor = color;
}