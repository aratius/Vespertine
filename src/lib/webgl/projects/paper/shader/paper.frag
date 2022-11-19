varying vec3 vNormal;
varying vec3 vNormalRaw;
varying vec2 vUv;

uniform sampler2D uBarCode;
uniform float uTime;

const vec3 lightVec = - vec3(1., 1., 1.);

void main() {
	vec2 coord = vUv;
	const float interval = 1.3;
	coord = fract(coord * vec2(1., 30. + uTime) / interval + vec2(0., uTime * -10.)) * interval;
	vec4 color = texture2D(uBarCode, coord);
	if(coord.y > .97 || coord.y < .03) color.rgb = vec3(1.);
	if(vNormalRaw.z == -1.) color.rgb = vec3(1.);  // 裏面
	if(vNormalRaw.x == 1. || vNormalRaw.x == -1.) color.rgb = vec3(1.);  // 側面

	float amount = dot(vNormal, normalize(lightVec));
	amount += 1.;
	amount *= .5;
	color.rgb *= amount;
	gl_FragColor = color;
}