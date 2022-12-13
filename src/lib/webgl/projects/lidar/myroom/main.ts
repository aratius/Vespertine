
import { AmbientLight, DirectionalLight, Mesh, MeshStandardMaterial, PlaneBufferGeometry } from "three";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry";
import WebGLBase from "src/lib/webgl/common/main";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader";
import gsap from "gsap";
import { loadGLTF } from "../../../common/utils";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

export default class Main extends WebGLBase {

	public _projectName: string = "myroom";

	constructor(canvas: HTMLCanvasElement) {
		super(canvas, {
			camera: "perspective"
		});
	}

	protected _initChild(): void {
		this._loadModel();
		const light = new AmbientLight(0xffffff, 1);
		this._scene?.add(light);
		this._camera?.position.set(-2, 2, 0);
		this._camera?.lookAt(0, 2, 0);
		new OrbitControls(this._camera!, this._canvas!);
	}

	protected _deInitChild(): void {

	}

	protected _resizeChild(): void {

	}

	protected _updateChild(): void {
	}

	private async _loadModel(): Promise<void> {
		const model = await loadGLTF("/models/myroom.glb");
		console.log(model);

		this._scene?.add(model);
	}

}

