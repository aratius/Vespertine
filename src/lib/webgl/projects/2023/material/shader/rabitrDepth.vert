#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>

#pragma glslify: snoise3 = require(glsl-noise/simplex/3d)

uniform float uAmp;
uniform float uPower;
uniform float uProgress;

void main() {
	#include <uv_vertex>
	#include <skinbase_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif

	#include <begin_vertex>

	transformed.xyz += (
		normalize(normal) * vec3(0., 0., 0.) +
		normalize(normal) * vec3(0.1, 0.15, 0.1) * snoise3(vec3(transformed.x * uAmp, transformed.z * uAmp, uProgress))
	) * uPower * transformed.y;

	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}