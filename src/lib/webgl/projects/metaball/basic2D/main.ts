import { Mesh, PlaneBufferGeometry } from "three";
import WebGLBase from "src/lib/webgl/common/main";
import MetaballMaterial from "./material";

export default class Main extends WebGLBase {

	public _projectName: string = "basic"
	private _mat?: MetaballMaterial

	constructor(canvas: HTMLCanvasElement) {
		super(canvas, {
			camera: "orthographic",
			stats: true
		})
	}

	protected _initChild(): void {
		this._initPlaceHolderStage()
	}

	protected _deInitChild(): void {

	}

	protected _resizeChild(): void {

	}

	protected _updateChild(): void {
		if (this._mat)
			this._mat.uniforms.u_time.value = this._elapsedTime
	}

	private async _initPlaceHolderStage(): Promise<void> {

		this._renderer!.shadowMap.enabled = true
		this._camera!.position.set(0, 5, 100)
		this._camera!.lookAt(0, 0, 0)

		const geo = new PlaneBufferGeometry(50, 50, 1, 1)
		const mat = new MetaballMaterial()
		this._mat = mat
		const mesh = new Mesh(geo, mat)
		mesh.receiveShadow = true
		mesh.castShadow = true
		this._scene?.add(mesh)

	}

}
