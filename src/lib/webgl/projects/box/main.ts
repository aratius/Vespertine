
import { AmbientLight, BoxBufferGeometry, ConeBufferGeometry, DirectionalLight, Mesh, MeshBasicMaterial, MeshStandardMaterial, SphereBufferGeometry, Uniform, Vector3 } from "three";
import WebGLBase from "src/lib/webgl/common/main";
import BoxMaterial from "./material/boxMaterial";

export default class Main extends WebGLBase {

	public _projectName: string = "box";
	private _box: Mesh<BoxBufferGeometry, BoxMaterial> | null = null;
	private _directionalLightPoint: Mesh | null = null;
	private _pointLightPoint: Mesh | null = null;

	constructor(canvas: HTMLCanvasElement) {
		super(canvas, {
			camera: "perspective",
			stats: true
		});
	}

	protected _initChild(): void {

		this._renderer?.setPixelRatio(devicePixelRatio);

		this._camera?.position.set(3, 3, 3);
		this._camera?.lookAt(0, 0, 0);

		this._directionalLightPoint = new Mesh(
			new ConeBufferGeometry(1, 2, 10, 1, false),
			new MeshStandardMaterial({ color: 0xffffff })
		);
		this._directionalLightPoint.scale.multiplyScalar(.1);
		this._directionalLightPoint.lookAt(0, 0, 0);
		this._directionalLightPoint.rotateX(-Math.PI / 2);

		this._pointLightPoint = new Mesh(
			new SphereBufferGeometry(1, 10, 10),
			new MeshBasicMaterial({ color: 0xffffff })
		);
		this._pointLightPoint.scale.multiplyScalar(.05);

		const l = new DirectionalLight(0xffffff, .5);
		l.position.set(1, 1, 1);
		l.lookAt(0, 0, 0);
		this._scene?.add(this._directionalLightPoint, this._pointLightPoint, new AmbientLight(0xffffff, .4), l);

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
		this._camera?.position.set(Math.sin(t) * 2, 2, Math.cos(t) * 2);
		this._camera?.lookAt(0, 0, 0);

		const t2 = this._elapsedTime * 1;
		this._directionalLightPoint?.position.set(Math.sin(t2), 1, Math.cos(t2));
		this._directionalLightPoint?.lookAt(0, 0, 0);
		this._directionalLightPoint?.rotateX(-Math.PI / 2);

		this._box!.material.uniforms.uDirectionalLightVec = new Uniform(new Vector3(0, 0, 0).sub(this._directionalLightPoint!.position));

		const t3 = this._elapsedTime * 2;
		this._pointLightPoint?.position.set(Math.sin(t3) * .4, .5, Math.cos(t3) * .4);
		this._box!.material.uniforms.uPointLightPos = new Uniform(this._pointLightPoint?.position);
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

