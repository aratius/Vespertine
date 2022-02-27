import { BufferAttribute, BufferGeometry, Mesh, RawShaderMaterial, Scene, Texture, Uniform, Vector2, Vector4 } from "three";
import glslify from "../utis/glslify";
import Pass from "./pass";

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
				u_velocity: new Uniform(Texture.DEFAULT_IMAGE)
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

				vec2 get_force(vec4 input_vec) {
					float d = distance(v_scaled_uv, input_vec.xy) / radius;
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
					return strength * input_vec.zw * radius;
				}

				void main() {
					vec4 external_force = vec4(0.);
					external_force.xy += get_force(u_input);
					gl_FragColor = texture2D(u_velocity, v_uv) + external_force;
				}

			`,
			depthTest: false,
			depthWrite: false
		})

		const mesh = new Mesh(geometry, this.material)
		mesh.frustumCulled = false
		this.scene.add(mesh)
	}

	update(uniforms: any): void {
		// アスペクト比
		if(uniforms.u_aspect !== undefined) {
			this.material!.uniforms.u_aspect.value = uniforms.u_aspect
		}

		// 外圧（マウス）
		if(uniforms.u_input !== undefined) {
			this.material!.uniforms.u_input.value = uniforms.u_input
		}

		// マウス半径
		if(uniforms.u_radius !== undefined) {
			this.material!.uniforms.u_radius.value = uniforms.u_radius
		}

		// 速度テクスチャ
		if(uniforms.u_velocity !== undefined) {
			this.material!.uniforms.u_velocity.value = uniforms.u_velocity
		}
	}

}