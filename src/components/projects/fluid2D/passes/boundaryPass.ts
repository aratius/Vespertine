import { BufferAttribute, BufferGeometry, Mesh, RawShaderMaterial, Scene, Texture, Uniform } from "three";
import glslify from "../utis/glslify";
import Pass from "./pass";

interface Uniforms {
	velocity: Texture
}

export default class BoundaryPass implements Pass {

	public scene?: Scene
	public material?: RawShaderMaterial

	constructor() {

		this.scene = new Scene()

		const geometry = new BufferGeometry()
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

		// GLSL3.0で書いている
		// https://qiita.com/73_ch/items/afc9ac7956bb21f76517
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
					// dFdx(y): スクリーンの偏微分（画素値の差分）
					// このばあい特になんの特徴もないuvに掛けているのでただテクセルのサイズを取得したことになる
					vec2 texel_size = vec2(dFdx(v_uv.x), dFdy(v_uv.y));

					float left_edge_mask = ceil(texel_size.x - v_uv.x);
					float right_edge_mask = ceil(v_uv.x - (1. - texel_size.x));
					float top_edge_mask = ceil(v_uv.y - (1. - texel_size.y));
					float bottom_edge_mask = ceil(texel_size.y - v_uv.y);

					float mask = clamp(left_edge_mask + right_edge_mask + top_edge_mask + bottom_edge_mask, 0., 1.);
					float direction = mix(1., -1., mask);

					glC = texture(u_velocity, v_uv) * direction;

				}
			`,
			depthTest: false,
			depthWrite: false,
			extensions: { derivatives: true }  // dFdxを使うため？？
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