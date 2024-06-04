#pragma glslify: snoise3 = require(glsl-noise/simplex/3d)
#pragma glslify: snoise4 = require(glsl-noise/simplex/4d)
#include <common>

varying vec2 vUv;

void main() {

	vUv = uv;

	vec4 worldPosition = viewMatrix * vec4( position, 1.0 );

	gl_Position = vec4( position.xy * 2., 0., 1.0 );
}