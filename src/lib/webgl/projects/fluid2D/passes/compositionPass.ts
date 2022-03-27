import { BufferAttribute, BufferGeometry, Mesh, RawShaderMaterial, Scene, Texture, Uniform } from "three";
import { glslify } from "../utis/glsl";
import Pass from "./pass";

interface Uniforms {
	colorBuffer?: Texture,
	time: number
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
				u_color_buffer: new Uniform(Texture.DEFAULT_IMAGE),
				u_time: new Uniform(0)
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
				uniform float u_time;

				float dot(vec2 p, float rad) {
					return step(length(p - 0.5), rad);
				}

				vec2 rotate(vec2 v, float a) {
					float s = sin(a);
					float c = cos(a);
					mat2 m = mat2(c, -s, s, c);
					return m * v;
				}

				void main() {

					float seg = 50.;

					vec2 p = v_uv;
					vec2 vel = texture2D(u_color_buffer, p).xy;
					vel = abs(vel);
					vel = sin(vel*1.);
					vel.x = length(vel.x);
					vel.y = length(vel.y);

					vec3 col = vec3(0.);
					vec3 c1 = vec3(242. / 255., 236. / 255., 228. / 255.);
					vec3 c2 = vec3(115. / 255., 94. / 255., 81. / 255.);
					vec3 c3 = vec3(166. / 255., 138. / 255., 128. / 255.);
					vec3 c4 = vec3(242. / 255., 113. / 255., 102. / 255.);

					vec3 c5 = mix(c1, c4, vel.x);
					vec3 c6 = mix(c2, c3, vel.y);

					col += (c5 + c6 - 0.7) * 2.;

					gl_FragColor = vec4(col, 1.0);
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
		if (uniforms.time != undefined) {
			this.material!.uniforms.u_time.value = uniforms.time
		}
	}

}