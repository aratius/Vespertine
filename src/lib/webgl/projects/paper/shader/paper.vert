#pragma glslify: snoise2 = require(glsl-noise/simplex/2d)
#define PI 3.14159265

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

//
void main() {
	vec3 pos = position;

	vec3 tangent = cross(normal, vec3(0., 1., 0.));
	vec3 binormal = cross(tangent, normal);

	vec3 posT = pos + tangent;
	vec3 posB = pos + binormal;

	pos = getTwistPos(pos, getTwistNoise(pos.y) * uTwist);

	posT = getTwistPos(posT, getTwistNoise(posT.y) * uTwist);
	posB = getTwistPos(posB, getTwistNoise(posB.y) * uTwist);

	vec3 modifiedTangent = posT - pos;
	vec3 modifiedBinormal = posB - pos;

	vNormalRaw = normal;
	vec3 newNormal = normalize(cross(modifiedTangent, modifiedBinormal));
	vNormal = newNormal;
	vUv = uv;

	gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.);
}