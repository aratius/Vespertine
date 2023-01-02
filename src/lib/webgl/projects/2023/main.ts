
import WebGLBase from "src/lib/webgl/common/main";
import { AmbientLight, DirectionalLight, Mesh, MeshBasicMaterial, MeshStandardMaterial } from "three";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";

export default class Main extends WebGLBase {

	public _projectName: string = "2023";

	constructor(canvas: HTMLCanvasElement) {
		super(canvas, {
			camera: "perspective"
		});
	}

	protected _initChild(): void {
		this._camera?.position.set(0, .5, 1);
		this._camera?.lookAt(0, 0.1, 0);

		const ambientLight = new AmbientLight(0xffffff, 1);
		const directionalLight = new DirectionalLight(0xffffff, 1);
		directionalLight.position.set(1, 1, 1);
		directionalLight.lookAt(0, 0, 0);
		this._scene?.add(ambientLight, directionalLight);

		this._loadModel();
	}

	protected _deInitChild(): void {

	}

	protected _resizeChild(): void {

	}

	protected _updateChild(): void {
	}

	private async _loadModel(): Promise<void> {
		// Configure and create Draco decoder.
		const dracoLoader = new DRACOLoader();
		dracoLoader.setDecoderPath('https://unpkg.com/three@0.137.0/examples/js/libs/draco/');
		dracoLoader.setDecoderConfig({ type: 'js' });

		return new Promise((res, rej) => {

			dracoLoader.load('/models/bunny.drc', (geometry) => {

				geometry.computeVertexNormals();

				const material = new MeshStandardMaterial({ color: 0x606060 });
				const mesh = new Mesh(geometry, material);
				mesh.castShadow = true;
				mesh.receiveShadow = true;
				this._scene!.add(mesh);


				// Release decoder resources.
				dracoLoader.dispose();

			});
		});
	}

}

