
import { BoxBufferGeometry, ConeBufferGeometry, Mesh, MeshBasicMaterial, Uniform, Vector3 } from "three";
import WebGLBase from "src/lib/webgl/common/main";
import BoxMaterial from "./material/boxMaterial";

export default class Main extends WebGLBase {

	public _projectName: string = "box";
	private _box: Mesh<BoxBufferGeometry, BoxMaterial> | null = null;
	private _lightPoint: Mesh | null = null;

	constructor(canvas: HTMLCanvasElement) {
		super(canvas, {
			camera: "perspective",
			stats: true
		});
	}

	protected _initChild(): void {

		this._camera?.position.set(3, 3, 3);
		this._camera?.lookAt(0, 0, 0);

		this._lightPoint = new Mesh(
			new ConeBufferGeometry(1, 2, 10, 1, true),
			new MeshBasicMaterial({ color: 0xff0000 })
		);
		this._lightPoint.scale.multiplyScalar(.1);
		this._lightPoint.position.set(1, 1, 1);
		this._lightPoint.lookAt(0, 0, 0);
		this._lightPoint.rotateX(-Math.PI / 2);
		this._scene?.add(this._lightPoint);

		this._createBox();
	}

	protected _deInitChild(): void {

	}

	protected _resizeChild(): void {

	}

	protected _updateChild(): void {
		if (this._box)
			this._box!.material.setTime(this._elapsedTime);
		const t = this._elapsedTime * .1;
		this._camera?.position.set(Math.sin(t) * 3, 3, Math.cos(t) * 3);
		this._camera?.lookAt(0, 0, 0);

		const t2 = this._elapsedTime * 1;
		this._lightPoint?.position.set(Math.sin(t2), 1, Math.cos(t2));
		this._lightPoint?.lookAt(0, 0, 0);
		this._lightPoint?.rotateX(-Math.PI / 2);

		this._box!.material.uniforms.uLightVec = new Uniform(new Vector3(0, 0, 0).sub(this._lightPoint!.position));
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

