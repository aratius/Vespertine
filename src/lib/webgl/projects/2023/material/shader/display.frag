#include <common>
varying highp vec2 vUv;
uniform sampler2D tDiffuse;
uniform float uTime;

void main(){

	vec4 color = texture2D(tDiffuse, vUv);
	color.r += rand(vUv + vec2(uTime)) * .3;
	color.g += rand(vUv + vec2(1.)) * .1;
	color.b += rand(vUv + vec2(2.)) * .1;

	gl_FragColor = color;
}