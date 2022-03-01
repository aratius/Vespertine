import { BufferAttribute, BufferGeometry, Mesh, RawShaderMaterial, Scene, Texture, Uniform } from "three";
import glslify from "../utis/glslify";
import Pass from "./pass";

interface Uniforms {
	velocity?: Texture
}

export default class DivergencePass implements Pass {

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
				u_velocity: new Uniform(Texture.DEFAULT_IMAGE)
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
				uniform sampler2D u_velocity;

				void main() {
					vec2 texel_size = vec2(dFdx(v_uv.x), dFdy(v_uv.y));

					// 左右隣
					float x0 = texture(u_velocity, v_uv - vec2(texel_size.x, 0.)).x;
					float x1 = texture(u_velocity, v_uv + vec2(texel_size.x, 0.)).x;
					// 上下隣
					float y0 = texture(u_velocity, v_uv - vec2(0., texel_size.y)).y;
					float y1 = texture(u_velocity, v_uv + vec2(0., texel_size.y)).y;

					// ベクトルの偏微分 vec4にする必要は多分なくてスカラーで良いはずだがフラグメントシェーダーの特性上vec4にする
					float divergence = (x1 - x0 + y1 - y0) * 0.5;

					glC = vec4(divergence);
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
		if(uniforms.velocity !== undefined) {
			this.material!.uniforms.u_velocity.value = uniforms.velocity
		}
	}

}