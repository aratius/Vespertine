import { BufferAttribute, BufferGeometry, Mesh, PlaneBufferGeometry, RawShaderMaterial, Scene, Texture, Uniform, Vector2 } from "three";
import glslify from "../utis/glslify";
import Pass from "./pass";

/**
 * 速度初期化用パス
 */
export default class VelocityInitPass implements Pass {

	public scene?: Scene;
	public material?: RawShaderMaterial;

	constructor() {

		this.scene = new Scene()

		// 一番シンプルなPlane?
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
		this.material = new RawShaderMaterial({
			uniforms: {},
			vertexShader: glslify`
				attribute vec2 position;

				void main() {
					gl_Position = vec4(position, 0.0, 1.0);
				}
			`,
			fragmentShader: glslify`
				// 精度修飾子
				#define PI 3.1415926535897932384626433832795
				precision highp float;
				precision highp int;

				void main() {
					gl_FragColor = vec4(1., 0., 0., 1.);
				}
			`,
			depthTest: false,
			depthWrite: false,
		})

		const mesh = new Mesh(geometry, this.material)
		mesh.frustumCulled = false  // NOTE: これなんだっけ
		this.scene.add(mesh)
	}

	update(uniforms: any): void {
		// nothing to do
	}

}