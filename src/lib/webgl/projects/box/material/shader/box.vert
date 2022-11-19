#pragma glslify: snoise3 = require(glsl-noise/simplex/3d)

varying vec2 vUv;
varying vec3 vNormal;

uniform float uTime;

void main() {
	vUv = uv;
	vNormal = normal;
	vec3 pos = position;
	// float fixVert = (1. - 2. * abs(.5 - vUv.x));
	// float fixVert = (1. - 2. * abs(.5 - vUv.y));
	float fixVert = (1. - 2. * abs(.5 - vUv.x)) * (1. - 2. * abs(.5 - vUv.y));
	pos += normal * fixVert * .1;
	pos += (snoise3(vec3(uv * 3., uTime)) + .5) * normal * fixVert * 1.;

	gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.);
}