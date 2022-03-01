import { BufferAttribute, BufferGeometry, Mesh, RawShaderMaterial, Scene, Texture, Uniform } from "three";
import { glslify } from "../utis/glsl";
import Pass from "./pass";

interface Uniforms {
	previousIteration?: Texture,
	divergence?: Texture
}

/**
 * 粘性計算（ヤコビ法）
 * NOTE: 後日ちゃんと理解する
 */
export default class PressurePass implements Pass {

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
				u_alpha: new Uniform(-1.),
				u_beta: new Uniform(0.25),
				u_previous_iteration: new Uniform(Texture.DEFAULT_IMAGE),
				u_divergence: new Uniform(Texture.DEFAULT_IMAGE)
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
				uniform float u_alpha;
				uniform float u_beta;
				uniform sampler2D u_previous_iteration;
				uniform sampler2D u_divergence;

				void main() {
					vec2 texel_size = vec2(dFdx(v_uv.x), dFdy(v_uv.y));

					vec4 x0 = texture(u_previous_iteration, v_uv - vec2(texel_size.x, 0.));
					vec4 x1 = texture(u_previous_iteration, v_uv + vec2(texel_size.x, 0.));
					vec4 y0 = texture(u_previous_iteration, v_uv - vec2(0., texel_size.y));
					vec4 y1 = texture(u_previous_iteration, v_uv + vec2(0., texel_size.y));

					vec4 d = texture(u_divergence, v_uv);

					glC = (x0 + x1 + y0 + y1 + u_alpha * d) * u_beta;
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
		if (uniforms.previousIteration !== undefined) {
			this.material!.uniforms.u_previous_iteration.value = uniforms.previousIteration
		}

		if (uniforms.divergence !== undefined) {
			this.material!.uniforms.u_divergence.value = uniforms.divergence
		}
	}

}