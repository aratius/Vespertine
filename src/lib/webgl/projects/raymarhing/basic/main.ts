
import { Mesh, MeshBasicMaterial, PlaneBufferGeometry } from "three";
import WebGLBase from "src/lib/webgl/common/main";
import RaymarchingMaterial from './material';
import { loadTexture } from 'src/lib/webgl/common/utils';

export default class Main extends WebGLBase {

	public _projectName: string = "basic"
	private _material?: RaymarchingMaterial

	constructor(canvas: HTMLCanvasElement) {
		super(canvas, {
			camera: "orthographic"
		})
	}

	protected async _initChild(): Promise<void> {
		const matcaps = await loadTexture("/images/matcaps/example_1.jpg")
		const geo = new PlaneBufferGeometry(500, 500, 1, 1)
		const mat = new  RaymarchingMaterial(matcaps)
		const mesh = new Mesh(geo, mat)
		mesh.position.setZ(-100)
		this._scene?.add(mesh)
		this._material = mat
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


}
