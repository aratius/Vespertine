varying vec2 v_uv;
uniform float u_time;

// 回転
mat4 rotation3d(vec3 axis, float angle) {
  axis = normalize(axis);
  float s = sin(angle);
  float c = cos(angle);
  float oc = 1.0 - c;

  return mat4(
		oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,
    oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,
    oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,
		0.0,                                0.0,                                0.0,                                1.0
	);
}

// スムーズに合体する
float smin( float a, float b, float k )
{
    float h = clamp( 0.5+0.5*(b-a)/k, 0.0, 1.0 );
    return mix( b, a, h ) - k*h*(1.0-h);
}

// 回転
vec3 rotate(vec3 v, vec3 axis, float angle) {
	mat4 m = rotation3d(axis, angle);
	return (m * vec4(v, 1.)).xyz;
}

// pos, size
float sdSphere( vec3 p, float s )
{
  return length(p)-s;
}

float sdBox( vec3 p, vec3 b )
{
  vec3 q = abs(p) - b;
  return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0);
}

float sdf(vec3 p) {
	vec3 p_box = rotate(p, vec3(1.), 1. + u_time/5.);

	float box = sdBox(p_box, vec3(0.35));
	float sphere = sdSphere(p, 0.5);
	return smin(box, sphere , 0.1);
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