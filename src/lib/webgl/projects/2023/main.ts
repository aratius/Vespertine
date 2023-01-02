
import WebGLBase from "src/lib/webgl/common/main";
import { AmbientLight, BoxBufferGeometry, DirectionalLight, Group, Mesh, MeshBasicMaterial, MeshStandardMaterial, PlaneBufferGeometry, PointLight, SphereBufferGeometry, Texture, TextureLoader, Vector3 } from "three";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { loadTexture } from "../../common/utils";

export default class Main extends WebGLBase {

	public _projectName: string = "2023";
	private _pointLight: Group = new Group();

	constructor(canvas: HTMLCanvasElement) {
		super(canvas, {
			camera: "perspective"
		});
	}

	protected _initChild(): void {
		this._renderer!.shadowMap.enabled = true;

		this._camera?.position.set(0, .5, 1);
		this._camera?.lookAt(0, 0.1, 0);

		const ambientLight = new AmbientLight(0xffffff, .7);
		this._scene?.add(ambientLight);

		const pointLight = new PointLight(0xffffff, .5);
		pointLight.castShadow = true;
		pointLight.shadow.blurSamples = 16;
		pointLight.shadow.radius = 20;
		pointLight.shadow.mapSize.width = 2048 / 2;
		pointLight.shadow.mapSize.height = 2048 / 2;
		pointLight.shadow.camera.near = .1;
		pointLight.shadow.camera.far = 10;
		const pointLightMesh = new Mesh(
			new SphereBufferGeometry(1, 10, 10),
			new MeshBasicMaterial({ color: 0xff0000 })
		);
		pointLightMesh.scale.multiplyScalar(.01);
		this._pointLight.add(pointLight, pointLightMesh);
		this._pointLight.position.set(0, .1, .2);
		this._scene?.add(this._pointLight);

		const plate = new Mesh(
			new BoxBufferGeometry(1, 1, 1),
			new MeshStandardMaterial({ color: 0xcccccc })
		);
		const floor = plate.clone();
		floor.rotateX(Math.PI);
		floor.position.setY(-.5);
		floor.receiveShadow = true;
		floor.castShadow = true;
		const backWall = plate.clone();
		backWall.position.set(0, .5, -1);
		backWall.receiveShadow = true;
		backWall.castShadow = true;
		this._scene?.add(floor, backWall);

		this._loadTextPlane();


		this._loadModel();
	}

	protected _deInitChild(): void {

	}

	protected _resizeChild(): void {

	}

	protected _updateChild(): void {
	}

	private async _loadTextPlane(): Promise<void> {
		const [textureNewYear, textureRabit] = await Promise.all([loadTexture("/images/2023/newyear.png"), loadTexture("/images/2023/rabit.png")]);
		const textPlane = new Mesh(
			new PlaneBufferGeometry(1, 1, 1),
			new MeshBasicMaterial({ transparent: true, opacity: 0 })
		);

		const getTextPlane = (texture: Texture): Mesh => {
			const mesh = textPlane.clone();
			mesh.material = mesh.material.clone();
			mesh.material.map = texture;
			let { width, height } = texture.image;
			const scaleEx = .2;
			mesh.scale.multiply(new Vector3(width / height, height / height, 1).multiplyScalar(scaleEx));
			mesh.position.setY(.5 * scaleEx);
			return mesh;
		};

		const textPlaneNewYear = getTextPlane(textureNewYear);
		const textPlaneRabit = getTextPlane(textureRabit);
		textPlaneNewYear.position.setZ(-.2);
		textPlaneRabit.position.setZ(-.2);

		this._scene?.add(textPlaneNewYear, textPlaneRabit);
	}

	private async _loadModel(): Promise<void> {
		// Configure and create Draco decoder.
		const dracoLoader = new DRACOLoader();
		dracoLoader.setDecoderPath('https://unpkg.com/three@0.137.0/examples/js/libs/draco/');
		dracoLoader.setDecoderConfig({ type: 'js' });

		return new Promise<void>((res, rej) => {

			dracoLoader.load('/models/bunny.drc', (geometry) => {

				geometry.computeVertexNormals();

				const material = new MeshStandardMaterial({ color: 0xaaaaaa });
				const mesh = new Mesh(geometry, material);
				mesh.castShadow = true;
				mesh.receiveShadow = true;
				this._scene!.add(mesh);

				// Release decoder resources.
				dracoLoader.dispose();
				res();
			});
		});
	}

}

