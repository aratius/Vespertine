#include <common>
varying highp vec2 vUv;
uniform sampler2D tDiffuse;
uniform float uTime;
uniform float uNoise;

void main(){

	vec2 uv = vUv;

	vec4 color = texture2D(tDiffuse, uv);
	color.r += rand(uv + vec2(uTime)) * .3;
	color.g += rand(uv + vec2(1.)) * .1;
	color.b += rand(uv + vec2(2.)) * .1;

	float amount = length(uv - vec2(.5)) * 2.;
	amount = clamp(amount, 0., 1.);
	amount = amount - 1. + uNoise;
	amount = pow(amount,  2.);
	color.r += (rand(uv + vec2(uTime)) -.9) * .3 * amount;
	color.g += (rand(uv + vec2(1. + uTime)) -.9) * .15 * amount;
	color.b += (rand(uv + vec2(2. + uTime)) -.9) * .15 * amount;

	gl_FragColor = color;
}