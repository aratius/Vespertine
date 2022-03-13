varying vec2 v_uv;

// pos, size
float sdSphere( vec3 p, float s )
{
  return length(p)-s;
}

float sdf(vec3 p) {
	return sdSphere(p, 0.5);
}

// 法線を求める
vec3 calc_normal(vec3 p) {
	vec2 eps = vec2(0.001, 0.);
	// 偏微分っぽい見た目
	return normalize(vec3(
		sdf(p + eps.xyy) - sdf(p - eps.xyy),
		sdf(p + eps.yxy) - sdf(p - eps.yxy),
		sdf(p + eps.yyx) - sdf(p - eps.yyx)
	));
}

void main() {
	vec3 cam_pos = vec3(0., 0., 2.);

	// 各ピクセルにRayを投げる？ z-1はカメラ位置が正の値であるため
	vec3 ray = normalize(vec3(v_uv - vec2(0.5), -1.));

	// Rayの位置初期化
	vec3 ray_pos = cam_pos;
	float t = 0.;
	float t_max = 5.;
	for(int i = 0; i < 256; i++) {
		vec3 pos = cam_pos + t * ray;
		float h = sdf(pos);
		// rayが衝突した
		if(h < 0.0001 || t > t_max) break;

		t += h;
	}

	vec3 color = vec3(0.);
	if(t < t_max) {
		vec3 pos = cam_pos + t * ray;
		color = vec3(1.);
		vec3 normal = calc_normal(pos);
		color = normal;
		vec3 dir_light = vec3(1.);
		float diff = dot(dir_light, normal);
		color = vec3(diff);
	}

	gl_FragColor = vec4(color, 1.);
}