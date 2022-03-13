
import { Mesh, MeshBasicMaterial, PlaneBufferGeometry, Vector2 } from "three";
import WebGLBase from "src/lib/webgl/common/main";
import RaymarchingMaterial from './material';
import { loadTexture } from 'src/lib/webgl/common/utils';

export default class Main extends WebGLBase {

	public _projectName: string = "basic"
	private _material?: RaymarchingMaterial
	private _mouse: Vector2 = new Vector2(0, 0)

	constructor(canvas: HTMLCanvasElement) {
		super(canvas, {
			camera: "orthographic"
		})
	}

	protected async _initChild(): Promise<void> {
		const matcaps = await loadTexture("/images/matcaps/example_1.jpg")
		const geo = new PlaneBufferGeometry(innerWidth, innerHeight, 1, 1)
		const mat = new  RaymarchingMaterial(matcaps)
		const mesh = new Mesh(geo, mat)
		mesh.position.setZ(-100)
		this._scene?.add(mesh)
		this._material = mat

		window.addEventListener("mousemove", this._onMouseMove)
	}

	protected _deInitChild(): void {

	}

	protected _resizeChild(): void {

	}

	protected _updateChild(): void {
		if(this._material) {
			this._material.uniforms.u_time.value = this._elapsedTime
		}
	}

	private _onMouseMove = (e: MouseEvent) => {
		const res = new Vector2(innerWidth, innerHeight)
		const mouse = new Vector2(e.clientX, e.clientY).multiplyScalar(2).sub(res).divideScalar(Math.min(res.x, res.y))
		this._mouse.set(-mouse.x, mouse.y)
		console.log(this._mouse);

		if(this._material) {
			this._material.uniforms.u_mouse.value = this._mouse
		}
	}

}
