#pragma glslify: snoise3 = require(glsl-noise/simplex/3d)
#pragma glslify: snoise4 = require(glsl-noise/simplex/4d)
#include <common>

varying vec2 vUv;
varying vec3 vNormalRaw;
varying vec3 vNormal;
varying float vReceiveLight;
varying float vSea;

uniform float uTime;
uniform vec3 uPointLightPos;
uniform float uPointLightDist;
uniform float uBoxAmount;
uniform float uAmp;
uniform float uHeight;

float easeInOutExpo(float x) {
	return x == 0.
	? 0.
	: x == 1.
	? 1.
	: x < .5 ? pow(2., 20. * x - 10.) / 2.
	: (2. - pow(2., -20. * x + 10.)) / 2.;
}

float sea(vec3 pos) {
	return easeInOutExpo((snoise3(pos * 10. * (1. - uAmp) + vec3(uTime * .1)) + 1.) * .5);
}

vec3 getOffset(vec3 pos) {
	vec2 face = vec2(0.);
	if(normal.x == 1. || normal.x == -1.) {
		face = pos.zy;
	} else if (normal.y == 1. || normal.y == -1.) {
		face = pos.xz;
	} if(normal.z == 1. || normal.z == -1.) {
		face = pos.xy;
	}
	float fixVert = (2. * (.5 - abs(face.x))) * (2. * (.5 - abs(face.y)));
	vec3 sphere = length(pos) * - pos * (1.41421356/2.) * (1. - uBoxAmount);
	vec3 sphereNorm = uBoxAmount == 1. ? vec3(0.) : normalize(sphere);
	vec3 glass = vec3(
		snoise3(vec3(pos.yz * 150., uTime * .3)),
		snoise3(vec3(pos.xz * 150., uTime * .3 + 10.)),
		snoise3(vec3(pos.xy * 150., uTime * .3 + 20.))
	) * .03 * (1. - uBoxAmount);
	return sphere + (glass - sphereNorm * (1. - uBoxAmount) * .5 * uHeight) * (1. - sea(pos));
}

vec3 orthogonal(vec3 v) {
  return normalize(abs(v.x) > abs(v.z) ? vec3(-v.y, v.x, 0.0) : vec3(0.0, -v.z, v.y));
}

void main() {
	vec3 pos = position;
	vSea = sea(pos);

	vec3 tangent = orthogonal(normal);
	vec3 binormal = cross(tangent, normal);

	vec3 posT = pos + tangent * .0001;
	vec3 posB = pos + binormal * .0001;

	pos += getOffset(pos);
	posT += getOffset(posT);
	posB += getOffset(posB);

	vec3 modifiedTangent = posT - pos;
	vec3 modifiedBinormal = posB - pos;

	vec3 newNormal = normalize(cross(modifiedTangent, modifiedBinormal));

	vec4 worldPosition = modelMatrix * vec4( pos, 1.0 );

	float receiveLight = 0.3;

	float pLightDist = distance(worldPosition.xyz, uPointLightPos);
	float distNorm = clamp(uPointLightDist - pLightDist, 0., 1.) / uPointLightDist;
	float distDot = 1. - dot(newNormal, normalize(uPointLightPos - worldPosition.xyz));
	receiveLight += distNorm * distDot;

	float cameraDot = dot(newNormal, normalize(worldPosition.xyz - cameraPosition));
	receiveLight += clamp((1. - abs(cameraDot * 1.2)), 0., 1.);

	vUv = uv;
	vNormalRaw = normal;
	vNormal = newNormal;
	vReceiveLight = receiveLight;

	vec4 mvPosition =  viewMatrix * worldPosition;
	gl_Position = projectionMatrix * mvPosition;
}