
import { Mesh, MeshBasicMaterial, PlaneBufferGeometry } from "three";
import WebGLBase from "src/lib/webgl/common/main";
import RaymarchingMaterial from './material';

export default class Main extends WebGLBase {

	public _projectName: string = "basic"

	constructor(canvas: HTMLCanvasElement) {
		super(canvas, {
			camera: "orthographic"
		})
	}

	protected _initChild(): void {
		const geo = new PlaneBufferGeometry(500, 500, 1, 1)
		const mat = new  RaymarchingMaterial()
		const mesh = new Mesh(geo, mat)
		mesh.position.setZ(-100)
		this._scene?.add(mesh)
	}

	protected _deInitChild(): void {

	}

	protected _resizeChild(): void {

	}

	protected _updateChild(): void {
	}


}
