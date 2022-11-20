
import { BoxBufferGeometry, Mesh } from "three";
import WebGLBase from "src/lib/webgl/common/main";
import BoxMaterial from "./material/boxMaterial";

export default class Main extends WebGLBase {

	public _projectName: string = "box";
	private _box: Mesh<BoxBufferGeometry, BoxMaterial> | null = null;

	constructor(canvas: HTMLCanvasElement) {
		super(canvas, {
			camera: "perspective",
			stats: true
		});
	}

	protected _initChild(): void {

		this._camera?.position.set(3, 3, 3);
		this._camera?.lookAt(0, 0, 0);

		this._createBox();
	}

	protected _deInitChild(): void {

	}

	protected _resizeChild(): void {

	}

	protected _updateChild(): void {
		if (this._box)
			this._box!.material.setTime(this._elapsedTime);
		const t = this._elapsedTime * .4;
		this._camera?.position.set(Math.sin(t) * 3, 3, Math.cos(t) * 3);
		this._camera?.lookAt(0, 0, 0);
	}

	/**
	 * create box
	 */
	private _createBox(): void {
		const geo = new BoxBufferGeometry(1, 1, 1, 300, 300, 300);
		const mat = new BoxMaterial();
		this._box = new Mesh(geo, mat);
		this._scene?.add(this._box);
	}

}

