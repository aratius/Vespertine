#pragma glslify: snoise3 = require(glsl-noise/simplex/3d)
varying vec2 v_uv;
uniform float u_time;

float easeInCubic(float x) {
	return x*x*x;
}

void main() {
	vec4 color = vec4(vec3(0.), 1.);
	vec2 p = v_uv;
	p.x += snoise3(vec3(p, u_time*0.1)) * 0.1;
	p.y += snoise3(vec3(p + 1., u_time*0.1)) * 0.1;

	for(int i = 0; i < 20; i++) {
		float x = snoise3(vec3(float(i), 1., u_time * 0.1));
		float y = snoise3(vec3(float(i+1), 1., u_time * 0.1));
		x = x*0.5+0.5;
		y = y*0.5+0.5;
		float d = length(p - vec2(x, y));

		const float _max = 0.2;
		d = (_max - d);
		float c = clamp(d, 0.,  _max) * 1./_max;
		c = easeInCubic(c);
		color.rgb += c;
	}

	const float size = 0.5;
	color.r = step(color.r, size);
	color.g = step(color.g, size);
	color.b = step(color.b, size);

	gl_FragColor = color;
}