#include <common>

varying vec2 vUv;
varying vec3 vNormalRaw;
varying vec3 vNormal;

uniform float uTime;
uniform vec3 uLightVec;

// TODO: point lightの実装
void main() {
	float receiveLight = dot(vNormal, normalize(uLightVec));
	receiveLight += 1.;
	receiveLight *= .5;
	// vec4 color = vec4(.7, .55, .85, 1.);
	vec4 color = vec4(1.);
	color.rgb *= pow(receiveLight + .1, 3.);

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
	color.a *= step(fract(line * 30.), .1);

	gl_FragColor = color;
}