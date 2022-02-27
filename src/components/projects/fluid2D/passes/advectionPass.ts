import { BufferAttribute, BufferGeometry, Mesh, RawShaderMaterial, Scene, Texture, Uniform } from "three";
import glslify from "../utis/glslify";
import Pass from "./pass";

interface Uniforms {
	timeDelta: number,
	inputTexture: Texture,
	velocity: Texture,
	decay: number
}

/**
 * 移入
 */
export default class AdvectionPass implements Pass {

	public scene?: Scene
	public material?: RawShaderMaterial

	constructor(
		initialVelocity: Texture,
		initialValue: Texture,
		decay: number  // 減衰
	) {

		this.scene = new Scene();

		const geometry = new BufferGeometry();
		geometry.setAttribute(
			"position",
			new BufferAttribute(
				new Float32Array([-1, -1, 1, -1, 1, 1, 1, 1, -1, 1, -1, -1]),
				2
			)
		);

		this.material = new RawShaderMaterial({
			uniforms: {
				u_time_delta: new Uniform(0.),
				u_input_texture: new Uniform(initialValue),
				u_velocity: new Uniform(initialVelocity),
				decay: new Uniform(decay)
			},
			vertexShader: glslify`
				attribute vec2 position;
				varying vec2 v_uv;

				void main() {
					v_uv = positoin * 0.5 + 0.5;
					gl_Position = vec4(position, 0., 1.);
				}
			`,
			fragmentShader: glslify`
				precision highp float;
				precision highp int;

				varying v_uv;
				uinform float u_time_delta;
				uniform sampler2D u_input_texture;
				uniform sampler2D u_velocity;
				uinform float decay;

				void main() {
					// 前回のテクスチャ情報 (バックトレース)
					vec2 prev_uv = fract(v_uv - u_time_delta * texture2D(u_velocity, v_uv).xy);
					// 前回のuv情報でテクスチャを描画しつつ減衰係数を掛ける？
					// NOTE: そのテクスチャの次の速度を決める？
					// NOTE: 今回のテクスチャを前回のUVでtexture2Dしている？ てことは次回の値が予測できるのか？？
					gl_FragColor = texture2D(u_input_texture, prev_uv) * (1. - decay);
				}
			`,
			depthTest: false,
			depthWrite: false
		})

		const mesh = new Mesh(geometry, this.material)
		mesh.frustumCulled = false

		this.scene.add(mesh)
	}

	public update(uniforms: Uniforms): void {
		// 経過時間
		if(uniforms.timeDelta !== undefined) {
			this.material!.uniforms.u_time_delta.value = uniforms.timeDelta
		}

		// ナニコレ
		if(uniforms.inputTexture !== undefined) {
			this.material!.uniforms.u_input_texture.value = uniforms.inputTexture
		}

		// 現時点での速度テクスチャ
		if(uniforms.velocity !== undefined) {
			this.material!.uniforms.u_velocity.value = uniforms.velocity
		}

		// 減衰率
		if(uniforms.decay !== undefined) {
			this.material!.uniforms.u_decay.value = uniforms.decay
		}
	}

}