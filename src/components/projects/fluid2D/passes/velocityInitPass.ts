import { BufferAttribute, BufferGeometry, Mesh, PlaneBufferGeometry, RawShaderMaterial, Scene, Texture, Uniform, Vector2 } from "three";
import Pass from "./pass";

export default class VelocityInitPass implements Pass {

	public scene?: Scene;
	public material?: RawShaderMaterial;
	private _mesh?: Mesh

	constructor() {

		this.scene = new Scene()

		// 一番シンプルなPlane?
		const geometry = new BufferGeometry()
		geometry.setAttribute(
			"position",
			new BufferAttribute(
			  new Float32Array([-1, -1, 1, -1, 1, 1, 1, 1, -1, 1, -1, -1]),
			  2
			)
		);
		this.material = new RawShaderMaterial({
			uniforms: {
				scale: new Uniform(
					innerWidth > innerHeight
					? new Vector2(innerWidth / innerHeight, 1.)
					: new Vector2(1., innerHeight / innerWidth)
				)
			},
			vertexShader: `
				attribute vec2 position;

				void main() {
					clipPos = position;
					gl_Position = vec4(position, 0.0, 1.0);
				}
			`,
			fragmentShader: `
				// 精度修飾子
				#define PI 3.1415926535897932384626433832795
				precision highp float;
				precision highp int;

				void main() {
					gl_FragColor = vec4(1.);
				}
			`,
			depthTest: false,
			depthWrite: false,
		})

		this._mesh = new Mesh(geometry, this.material)
		this._mesh.frustumCulled = false  // NOTE: これなんだっけ
		this.scene.add(this._mesh)
	}

	update(uniforms: any): void {
		// nothing to do
	}

}