import { BufferAttribute, BufferGeometry, Mesh, RawShaderMaterial, Scene, Texture, Uniform } from "three";
import { glslify } from "../utis/glsl";
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

				float dot(vec2 p, float rad) {
					return step(length(p - 0.5), rad);
				}

				void main() {

					float seg = 50.;

					vec2 p = floor(v_uv * seg)/seg;
					vec2 vel = texture2D(u_color_buffer, p).xy;
					float len = length(vel);

					const vec3 c1 = vec3(38./255., 38./255., 38./255.);
					const vec3 c2 = vec3(242./255., 5./255., 5./255.);
					const vec3 c3 = vec3(140./255., 3./255., 3./255.);
					const vec3 c4 = vec3(48./255., 242./255., 223./255.);

					vec3 col1 = mix(c1, c2, vel.x);
					vec3 col2 = mix(c3, c4, vel.y);
					vec3 col = mix(col1, col2, len);

					float dots = dot(mod(v_uv * seg, 1.), len);

					gl_FragColor = vec4(col * vec3(dots), 1.0);
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
		if (uniforms.colorBuffer !== undefined) {
			this.material!.uniforms.u_color_buffer.value = uniforms.colorBuffer
		}
	}

}