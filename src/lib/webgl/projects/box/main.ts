
import { AmbientLight, BoxBufferGeometry, BufferGeometry, DirectionalLight, Mesh, MeshBasicMaterial, MeshStandardMaterial, PlaneBufferGeometry } from "three";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry";
import WebGLBase from "src/lib/webgl/common/main";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader";
import gsap from "gsap";
import BoxMaterial from "./material/boxMaterial";

export default class Main extends WebGLBase {

	public _projectName: string = "box";
	private _box: Mesh<BoxBufferGeometry, BoxMaterial> | null = null;

	constructor(canvas: HTMLCanvasElement) {
		super(canvas, {
			camera: "perspective"
		});
	}

	protected _initChild(): void {

		this._camera?.position.setZ(10);

		this._createBox();
	}

	protected _deInitChild(): void {

	}

	protected _resizeChild(): void {

	}

	protected _updateChild(): void {
		if (this._box)
			this._box!.material.setTime(this._elapsedTime);
	}

	/**
	 * create box
	 */
	private _createBox(): void {
		const geo = new BoxBufferGeometry(1, 1, 1, 300, 300, 300);
		const mat = new BoxMaterial();
		this._box = new Mesh(geo, mat);
		this._box.rotateX(Math.PI / 4);
		this._box.rotateY(Math.PI / 4);
		this._scene?.add(this._box);
	}

}

