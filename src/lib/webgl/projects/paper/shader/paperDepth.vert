#include <common>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>

#pragma glslify: snoise2 = require(glsl-noise/simplex/2d)

varying vec3 vNormal;
varying vec3 vNormalRaw;
varying vec2 vUv;

uniform float uTime;
uniform float uTwist;

//
float atan2(in float y, in float x){
	return x == 0.0 ? sign(y) * PI / 2. : atan(y, x);
}

//
vec3 getTwistPos(vec3 p, float angleOffset) {
	float angle = atan2(p.x, p.z);
	angle += angleOffset;
	float vecHoriLen = length(p.xz);
	vec2 newPosHori = vec2(sin(angle), cos(angle)) * vecHoriLen;
	vec3 newPos = vec3(newPosHori.x, p.y, newPosHori.y);
	newPos.x += snoise2(vec2(p.y, uTime) * .2) * angleOffset * .02;
	newPos.z += snoise2(vec2(p.y, uTime + 10.) * .2) * angleOffset * .02;
	return newPos;
}

//
float getTwistNoise(float y) {
	return snoise2(vec2(y * .03 - uTime * .03, uTime * 0.05));
}


varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <skinbase_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif

	#include <begin_vertex>

	transformed = getTwistPos(transformed, getTwistNoise(transformed.y) * uTwist);

	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}