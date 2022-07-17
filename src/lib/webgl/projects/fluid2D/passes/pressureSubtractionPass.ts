import { BufferAttribute, BufferGeometry, Mesh, RawShaderMaterial, Scene, Texture, Uniform } from "three";
import { glslify } from "../utis/glsl";
import Pass from "./pass";

interface Uniforms {
	timeDelta?: number;
	velocity?: Texture;
	pressure?: Texture;
}

/**
 * 圧力勾配を抽象化(非圧縮条件を満たすように補正するってこと？)し、
 * 発散ゼロ（流出入がおなじ）の速度ベクトル場を得る
 * 圧力のスカラー場の偏微分？
 */
export default class PressureSubtractionPass implements Pass {

	public scene?: Scene
	public material?: RawShaderMaterial

	constructor() {

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
				u_time_delta: new Uniform(0.),
				u_velocity: new Uniform(Texture.DEFAULT_IMAGE),
				u_pressure: new Uniform(Texture.DEFAULT_IMAGE)  // 圧力
			},
			vertexShader: glslify`#version 300 es
				in vec2 position;
				out vec2 v_uv;

				void main() {
					v_uv = position * 0.5 + 0.5;
					gl_Position = vec4(position, 0., 1.);
				}
			`,
			fragmentShader: glslify`#version 300 es
				precision highp float;
				precision highp int;
				in vec2 v_uv;
				out vec4 glC;
				uniform float u_time_delta;
				uniform sampler2D u_velocity;
				uniform sampler2D u_pressure;

				void main() {
					vec2 texel_size = vec2(dFdx(v_uv.x), dFdy(v_uv.y));

					// 圧力のスカラー場の偏微分

					// 周囲ピクセルの圧力を求める
					float x0 = texture(u_pressure, v_uv - vec2(texel_size.x, 0.)).r;
					float x1 = texture(u_pressure, v_uv + vec2(texel_size.x, 0.)).r;
					float y0 = texture(u_pressure, v_uv - vec2(0., texel_size.y)).r;
					float y1 = texture(u_pressure, v_uv + vec2(0., texel_size.y)).r;

					// 現在の速度から周りのピクセルの圧力の微分をもとめる
					vec2 v = texture(u_velocity, v_uv).xy;
					v -= 0.5 * vec2(x1 - x0, y1 - y0);

					glC = vec4(v, 0., 1.);
				}
			`,
			depthTest: false,
			depthWrite: false,
			extensions: { derivatives: true }
		})

		const mesh = new Mesh(geometry, this.material)
		mesh.frustumCulled = false

		this.scene.add(mesh)
	}

	public update(uniforms: Uniforms): void {
		if (uniforms.timeDelta !== undefined) {
			this.material!.uniforms.u_time_delta.value = uniforms.timeDelta
		}

		// 速度ベクトル場のテクスチャ
		if (uniforms.velocity !== undefined) {
			this.material!.uniforms.u_velocity.value = uniforms.velocity
		}

		// 圧力勾配のテクスチャ （スカラー場だっけ？）
		if (uniforms.pressure !== undefined) {
			this.material!.uniforms.u_pressure.value = uniforms.pressure
		}
	}

}