#pragma glslify: snoise4 = require(glsl-noise/simplex/4d)

varying vec2 vUv;
varying vec3 vNormalRaw;
varying vec3 vNormal;

uniform float uTime;

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
	return normal * (snoise4(vec4(pos * 5., uTime)) + 1.) * fixVert * .2;
}

void main() {
	vec3 pos = position;

	vec3 tangent = cross(normal, vec3(1., 1., 1.));
	vec3 binormal = cross(tangent, normal);

	vec3 posT = pos + tangent;
	vec3 posB = pos + binormal;

	pos += getOffset(pos);
	posT += getOffset(posT);
	posB += getOffset(posB);

	vec3 modifiedTangent = posT - pos;
	vec3 modifiedBinormal = posB - pos;

	vNormalRaw = normal;
	vec3 newNormal = normalize(cross(modifiedTangent, modifiedBinormal));
	vNormal = newNormal;

	vUv = uv;

	gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.);
}