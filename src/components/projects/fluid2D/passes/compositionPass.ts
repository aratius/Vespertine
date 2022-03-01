import { BufferAttribute, BufferGeometry, Mesh, RawShaderMaterial, Scene, Texture, Uniform } from "three";
import glslify from "../utis/glslify";
import Pass from "./pass";

interface Uniforms {
	colorBuffer?: Texture,
}

export default class CompositionPass implements Pass {

	public scene?: Scene
	public material?: RawShaderMaterial

	constructor() {
		this.scene = new Scene();

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
				u_color_buffer: new Uniform(Texture.DEFAULT_IMAGE)
			},
			vertexShader: glslify`
				attribute vec2 position;
				varying vec2 v_uv;

				void main() {
					v_uv = position * 0.5 + 0.5;
					gl_Position = vec4(position, 0., 1.);
				}
			`,
			fragmentShader: glslify`
				precision highp float;
				precision highp int;

				varying vec2 v_uv;
				uniform sampler2D u_color_buffer;

				void main() {
					vec2 vel = texture2D(u_color_buffer, v_uv).xy;
					float len = length(vel);
					vel = vel * 0.5 + 0.5;

					vec3 color = vec3(vel.x, vel.y, 1.0);
					color = mix(vec3(1.0), color, len);

					gl_FragColor = vec4(color,  1.0);
				}
			`,
			depthTest: false,
			depthWrite: false,
			transparent: true
		})

		const mesh = new Mesh(geometry, this.material)
		mesh.frustumCulled = false

		this.scene.add(mesh)
	}

	public update(uniforms: Uniforms): void {
		if(uniforms.colorBuffer !== undefined) {
			this.material!.uniforms.u_color_buffer.value = uniforms.colorBuffer
		}
	}

}