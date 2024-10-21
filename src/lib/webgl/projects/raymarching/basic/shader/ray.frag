varying vec2 v_uv;
uniform float u_time;
uniform sampler2D u_matcaps;
uniform vec2 u_mouse;
uniform vec2 u_res;

float remap(float v, float x1, float x2, float y1, float y2) {
    return y1 + (v - x1) * (y2 - y1) / (x2 - x1);
}

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

float sd_cylinder(vec3 p, vec3 u) {
  // 円柱の半径を1、長さを1としたときの、点pからの距離を計算して返す
  return length(vec2(dot(p, u), length(p - dot(p, u) * u))) - .3;
}

float sd_box(vec3 p, vec3 b) {
  // 立方体の一辺の長さをbとしたときの、点pからの距離を計算して返す
  return length(max(abs(p) - b, 0.0));
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
float sdSphere(vec3 p, float s) {
    return length(p) - s;
}

float sdBox( vec3 p, vec3 b )
{
  vec3 q = abs(p) - b;
  return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0);
}

float opTwistBox(vec3 p, vec3 b)
{
    const float k = 1.0; // or some other amount
    float c = cos(k*p.y);
    float s = sin(k*p.y);
    mat2  m = mat2(c,-s,s,c);
    vec3  q = vec3(m*p.xz,p.y);
	return sdBox(q, b);
}

float sdf(vec3 p, float offsetScale) {
	vec3 p_box_sphere = p;
	p_box_sphere = rotate(p_box_sphere, vec3(1., sin(u_time), sin(u_time*0.9)), 1. + u_time*10.);

	float o = 0.;
	float box = smin(opTwistBox(p_box_sphere, vec3(0.5)), sdSphere(p, 0.3), 0.5 * offsetScale);
	float sphere = sdSphere(p_box_sphere + vec3(0.), 0.7 * offsetScale);
	float spherebox = mix(box, sphere, sin(u_time)*0.4+0.4);
	o += spherebox;

	for(float i = 0.; i < 10.; i++) {
		float randOff = random(vec2(i));
		float x = sin(randOff * 6.28 + u_time * 3.) * 0.1 + sin(randOff * 4.28 + u_time * 1.) * .5;
		float y = fract(randOff + u_time*3. * remap(randOff, 0., 1., 0.9, 1.)) * 2.;
		float z = cos(randOff * 6.28 + u_time * 3.) * 0.1 + cos(randOff * 4.28 + u_time * 1.) * .5;
		vec3 b_pos = p + vec3(x, -y, z);
		float size = y < 0.2 ? remap(y, 0., .2, 0., 0.1) : remap(y, 0.2, 2., 0.1, 0.);
		float bullet = sdSphere(b_pos, size * offsetScale);
		if(size > 0.) o = smin(o, bullet, 0.5);
	}
	return o;
}

float sdf(vec3 p) {
	return sdf(p, 1.);
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

float raymarching(vec3 cam_pos, vec3 ray, float t_max, float offsetScale){
	// Rayの位置初期化
	vec3 ray_pos = cam_pos;
	float t = 0.;
	for(int i = 0; i < 256; i++) {
		vec3 pos = cam_pos + t * ray;
		float h = sdf(pos, offsetScale);
		// rayが衝突した
		if(h < 0.0001 || t > t_max) break;

		t += h;
	}
	return t;
}

float raymarching(vec3 cam_pos, vec3 ray, float t_max){
	return raymarching(cam_pos, ray, t_max, 1.);
}

void main() {
	// 正規化
	vec2 uv = (gl_FragCoord.xy * 2.0 - u_res) / min(u_res.x, u_res.y);
	vec3 cam_pos = vec3(0., (sin(u_time*3.)+sin(u_time*0.9))*0.2, 2.);

	// 各ピクセルにRayを投げる？ z-1はカメラ位置が正の値であるため
	float t_max = 5.;
	vec3 ray = normalize(vec3(uv, -1.));
	float t = raymarching(cam_pos, ray, t_max);
	vec3 rayMosaic = normalize(vec3(round(uv * 20.) / 20., -1.));
	float tMosaic = raymarching(cam_pos, rayMosaic, t_max, 1.1);

	vec3 color = vec3(1.);
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
	}

	float alpha = tMosaic > t_max ? mod(floor(u_time / 5.), 2.) + 0. : 1.;
	gl_FragColor = vec4(color, 1.) * alpha;
}