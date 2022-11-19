#define PI 3.14159265

varying vec3 vNormal;
varying vec3 vNormalRaw;
varying vec2 vUv;

uniform float uTwist;

//
float atan2(in float y, in float x){
	return x == 0.0 ? sign(y) * PI / 2. : atan(y, x);
}

//
vec3 getTwistPos(vec3 p) {
	float angle = atan2(p.x, p.z);
	angle += (p.y - 5.) * uTwist;
	float vecHoriLen = length(p.xz);
	vec2 newPosHori = vec2(sin(angle), cos(angle)) * vecHoriLen;
	return vec3(newPosHori.x, p.y, newPosHori.y);
}

//
void main() {
	vec3 pos = position;

	vec3 tangent = cross(normal, vec3(0., 1., 0.));
	vec3 binormal = cross(tangent, normal);

	vec3 posT = pos + tangent;
	vec3 posB = pos + binormal;

	pos = getTwistPos(pos);

	posT = getTwistPos(posT);
	posB = getTwistPos(posB);

	vec3 modifiedTangent = posT - pos;
	vec3 modifiedBinormal = posB - pos;

	vNormalRaw = normal;
	vNormal = normalize(cross(modifiedTangent, modifiedBinormal));
	vUv = uv;
	gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.);
}