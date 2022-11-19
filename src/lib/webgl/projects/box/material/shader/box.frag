
varying vec3 vNormal;

const vec3 dirLightVec = vec3(-1., -1., 0.);

void main() {
	float receiveLight = 1. - dot(normalize(dirLightVec), vNormal);
	vec4 color = vec4(.5, .4, .7, 1.);
	color.rgb *= receiveLight;
	gl_FragColor = color;
}