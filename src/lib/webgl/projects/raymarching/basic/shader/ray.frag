varying vec2 v_uv;
uniform float u_time;
uniform sampler2D u_matcaps;
uniform vec2 u_mouse;
uniform vec2 u_res;

vec2 get_matcap(vec3 eye, vec3 normal) {
  vec3 reflected = reflect(eye, normal);
  float m = 2.8284271247461903 * sqrt( reflected.z+1.0 );
  return reflected.xy / m + 0.5;
}

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

// 回転
vec3 rotate(vec3 v, vec3 axis, float angle) {
	mat4 m = rotation3d(axis, angle);
	return (m * vec4(v, 1.)).xyz;
}

// スムーズに合体する
float smin( float a, float b, float k )
{
    float h = clamp( 0.5+0.5*(b-a)/k, 0.0, 1.0 );
    return mix( b, a, h ) - k*h*(1.0-h);
}


float random (vec2 st) {
    return fract(sin(dot(st.xy,
                         vec2(12.9898,78.233)))*
        43758.5453123);
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

	float o = 0.;
	float box = smin(sdBox(p_box, vec3(0.5)), sdSphere(p, 0.3), 0.5);
	float sphere = sdSphere(p + vec3(0.), 0.7);
	o = mix(box, sphere, sin(u_time)*0.5+0.5);

	for(float i = 0.; i < 10.; i++) {
		float randOff = random(vec2(i));
		vec3 b_pos = p + vec3(sin(randOff * 6.28), cos(randOff * 6.28), 0.) * sin(u_time + randOff) * 2.;
		float bullet = sdSphere(b_pos, 0.2);
		o = smin(o, bullet, 0.5);
	}

	float mouse_sphere = sdSphere(p + vec3(u_mouse*2., 0.), 0.5);
	o = smin(o, mouse_sphere , 0.4);
	return o;
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
	// 正規化
	vec2 uv = (gl_FragCoord.xy * 2.0 - u_res) / min(u_res.x, u_res.y);
	vec3 cam_pos = vec3(0., 0., 2.);

	// 各ピクセルにRayを投げる？ z-1はカメラ位置が正の値であるため
	vec3 ray = normalize(vec3(uv, -1.));

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

	float dist = length(uv);
	vec3 bg = mix(vec3(0.), vec3(0.3), 1. - dist);

	vec3 color = bg;
	if(t < t_max) {
		vec3 pos = cam_pos + t * ray;
		color = vec3(1.);
		vec3 normal = calc_normal(pos);
		color = normal;
		vec3 dir_light = vec3(1.);
		float diff = dot(dir_light, normal);

		// matcap 環境マップ的なこと
		vec2 matcap_uv = get_matcap(ray, normal);
		color = texture2D(u_matcaps, matcap_uv).rgb;

		float fresnel = pow(1. + dot(ray, normal), 3.);
		color = mix(color, bg, fresnel);

		color.rgb *= diff;
	}

	gl_FragColor = vec4(color, 1.);
}