import { BufferAttribute, BufferGeometry, Mesh, RawShaderMaterial, Scene, Texture, Uniform } from "three";
import Pass from "./pass";

interface Uniforms {
	colorBuffer: Texture,
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
			new Float32Array([-1, -1, 1, -1, 1, 1, 1, 1, -1, 1, -1, -1]),
			2
		  )
		);

		this.material = new RawShaderMaterial({
			uniforms: {
				u_color_buffer: new Uniform(Texture.DEFAULT_IMAGE)
			},
			vertexShader: `
				attribute vec2 position;
				varying vec2 v_uv;

				void main() {
					v_uv = position * 0.5 + 0.5;
					gl_Position = vec4(position, 0., 1.);
				}
			`,
			fragmentShader: `
				precision highp float;
				precision highp int;

				varying vec2 v_uv;
				uniform sampler2D u_color_buffer;

				void main() {
					vec4 color = texture2D(u_color_buffer, v_uv);
					gl_FragColor = color;
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