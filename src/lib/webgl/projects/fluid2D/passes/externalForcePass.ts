import { BufferAttribute, BufferGeometry, Mesh, RawShaderMaterial, Scene, Texture, Uniform, Vector2, Vector3, Vector4 } from "three";
import { glslify } from "../utis/glsl";
import Pass from "./pass";

interface Uniforms {
	velocity?: Texture
	input?: Vector4,
	aspect?: number,
	radius?: number,
	power?: Vector2
}

/**
 * 外圧パス
 * とりあえずマウスに一点のみにする
 * NOTE: 後々余裕があればマルチタッチに対応すればインスタレーションとかに幅広がりそうでよい
 */
export default class ExternalForcePass implements Pass {

	public scene?: Scene
	public material?: RawShaderMaterial

	constructor(readonly aspect: number, readonly radius: number) {

		this.scene = new Scene()

		const geometry = new BufferGeometry();
		geometry.setAttribute(
			"position",
			new BufferAttribute(
				// NOTE: 対角線上に頂点が二個ある四角形のposition もしかしてこれでデフォルトでindexがうまく設定される？
				new Float32Array([
					-1, -1,  // 左下(1)
					1, -1,  // 右下
					1, 1,  // 右上(1)
					1, 1,  // 右上(2)
					-1, 1,  // 左上
					-1, -1  // 左下(2)
				]),
				2
			)
		);
		this.material = new RawShaderMaterial({
			uniforms: {
				// アスペクト比
				u_aspect: new Uniform(new Vector2(aspect, 1.)),
				// マウスによる外圧 NOTE: x, yは単に位置だから z.wに速度か何かが格納されている？
				// NOTE: 調べた結果 z = vx, w = vy
				u_input: new Uniform(new Vector4()),
				u_radius: new Uniform(radius),
				u_velocity: new Uniform(Texture.DEFAULT_IMAGE),
				u_power: new Uniform(new Vector3())
			},
			vertexShader: glslify`
				attribute vec2 position;
				varying vec2 v_uv;
				varying vec2 v_scaled_uv;
				uniform vec2 u_aspect;

				void main() {
					v_uv = position * 0.5 + 0.5;
					// タッチ位置の判別用のアスペクトによってスケールしたUV
					v_scaled_uv = position * u_aspect * 0.5 + u_aspect * 0.5;
					gl_Position = vec4(position, 0., 1.);
				}
			`,
			fragmentShader: glslify`
				precision highp float;
				precision highp int;

				varying vec2 v_uv;
				varying vec2 v_scaled_uv;
				uniform vec4 u_input;
				uniform float u_radius;
				uniform sampler2D u_velocity;
				uniform vec2 u_power;

				vec3 mod289(vec3 x) {
				return x - floor(x * (1.0 / 289.0)) * 289.0;
				}

				vec4 mod289(vec4 x) {
				return x - floor(x * (1.0 / 289.0)) * 289.0;
				}

				vec4 permute(vec4 x) {
					return mod289(((x*34.0)+1.0)*x);
				}

				vec4 taylorInvSqrt(vec4 r)
				{
				return 1.79284291400159 - 0.85373472095314 * r;
				}

				float snoise(vec3 v)
				{
				const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
				const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

				// First corner
				vec3 i  = floor(v + dot(v, C.yyy) );
				vec3 x0 =   v - i + dot(i, C.xxx) ;

				// Other corners
				vec3 g = step(x0.yzx, x0.xyz);
				vec3 l = 1.0 - g;
				vec3 i1 = min( g.xyz, l.zxy );
				vec3 i2 = max( g.xyz, l.zxy );

				//   x0 = x0 - 0.0 + 0.0 * C.xxx;
				//   x1 = x0 - i1  + 1.0 * C.xxx;
				//   x2 = x0 - i2  + 2.0 * C.xxx;
				//   x3 = x0 - 1.0 + 3.0 * C.xxx;
				vec3 x1 = x0 - i1 + C.xxx;
				vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y
				vec3 x3 = x0 - D.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y

				// Permutations
				i = mod289(i);
				vec4 p = permute( permute( permute(
							i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
							+ i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
							+ i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

				// Gradients: 7x7 points over a square, mapped onto an octahedron.
				// The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)
				float n_ = 0.142857142857; // 1.0/7.0
				vec3  ns = n_ * D.wyz - D.xzx;

				vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)

				vec4 x_ = floor(j * ns.z);
				vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)

				vec4 x = x_ *ns.x + ns.yyyy;
				vec4 y = y_ *ns.x + ns.yyyy;
				vec4 h = 1.0 - abs(x) - abs(y);

				vec4 b0 = vec4( x.xy, y.xy );
				vec4 b1 = vec4( x.zw, y.zw );

				//vec4 s0 = vec4(lessThan(b0,0.0))*2.0 - 1.0;
				//vec4 s1 = vec4(lessThan(b1,0.0))*2.0 - 1.0;
				vec4 s0 = floor(b0)*2.0 + 1.0;
				vec4 s1 = floor(b1)*2.0 + 1.0;
				vec4 sh = -step(h, vec4(0.0));

				vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
				vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

				vec3 p0 = vec3(a0.xy,h.x);
				vec3 p1 = vec3(a0.zw,h.y);
				vec3 p2 = vec3(a1.xy,h.z);
				vec3 p3 = vec3(a1.zw,h.w);

				//Normalise gradients
				vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
				p0 *= norm.x;
				p1 *= norm.y;
				p2 *= norm.z;
				p3 *= norm.w;

				// Mix final noise value
				vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
				m = m * m;
				return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),
												dot(p2,x2), dot(p3,x3) ) );
				}

				vec2 get_force(vec4 input_vec) {
					float d = distance(v_scaled_uv, input_vec.xy) / u_radius;
					// 距離が近いほど力が強くなる
					float strength = 1. / max(d * d, 0.01);

					// ちなみにこの行消してもあまり違いがわからなかった
					strength *= clamp(
						// なんの内積？ ナニコレ input_vecのzwが何かによる
						dot(
							normalize(v_scaled_uv - input_vec.xy),
							normalize(input_vec.zw)
						), 0., 1.
					);
					return strength * input_vec.zw * u_radius;
				}

				void main() {
					// vec4 external_force = vec4(0.);
					// external_force.xy += get_force(u_input);
					vec4 base = vec4(u_power, 0., 0.);
					base.r *= (snoise(vec3(v_uv*5., 0.))*0.5+0.5) * 0.4;
					base.g *= (snoise(vec3(v_uv*5., 0.))*0.5+0.5) * 0.4;
					gl_FragColor = texture2D(u_velocity, v_uv) + base * 0.1;
				}

			`,
			depthTest: false,
			depthWrite: false
		})

		const mesh = new Mesh(geometry, this.material)
		mesh.frustumCulled = false
		this.scene.add(mesh)
	}

	update(uniforms: Uniforms): void {
		// アスペクト比
		if (uniforms.aspect !== undefined) {
			this.material!.uniforms.u_aspect.value = uniforms.aspect
		}

		// 外圧（マウス）
		if (uniforms.input !== undefined) {
			this.material!.uniforms.u_input.value = uniforms.input
		}

		// マウス半径
		if (uniforms.radius !== undefined) {
			this.material!.uniforms.u_radius.value = uniforms.radius
		}

		// 速度テクスチャ
		if (uniforms.velocity !== undefined) {
			this.material!.uniforms.u_velocity.value = uniforms.velocity
		}

		if (uniforms.power !== undefined) {
			this.material!.uniforms.u_power.value = uniforms.power
		}
	}

}