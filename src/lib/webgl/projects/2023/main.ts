
import gsap from "gsap";
import WebGLBase from "src/lib/webgl/common/main";
import { AmbientLight, BoxBufferGeometry, DirectionalLight, Group, Mesh, MeshBasicMaterial, MeshStandardMaterial, PlaneBufferGeometry, PointLight, SphereBufferGeometry, SpotLight, Texture, TextureLoader, Vector3 } from "three";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import _PerspectiveCamera from "../../common/perspectiveCamera";
import { loadTexture } from "../../common/utils";
import PointLightMeshMaterial from "./material/pointLightMeshMaterial";

export default class Main extends WebGLBase {

	public _projectName: string = "2023";
	private _pointLight: Group = new Group();
	private _textPlaneNewYear?: Mesh;
	private _textPlaneRabit?: Mesh;
	private _focusEffectTimeline?: GSAPTimeline;

	constructor(canvas: HTMLCanvasElement) {
		super(canvas, {
			camera: "perspective"
		});
	}

	protected _initChild(): void {
		this._renderer!.shadowMap.enabled = true;

		this._camera?.position.set(0, .5, 1);
		this._camera?.lookAt(0, .2, -.5);

		const ambientLight = new AmbientLight(0xffffff, .7);
		const spotLight = new SpotLight(0xffffff, .1, 10, Math.PI / 4, 1, 3);
		spotLight.castShadow = true;
		spotLight.shadow.blurSamples = 16;
		spotLight.shadow.radius = 10;
		spotLight.shadow.mapSize.width = 2048 / 2;
		spotLight.shadow.mapSize.height = 2048 / 2;
		spotLight.shadow.camera.near = .1;
		spotLight.shadow.camera.far = 10;
		const dirLight1 = spotLight.clone();
		dirLight1.position.set(.2, .4, -.2);
		dirLight1.lookAt(0, 0, 0);
		const dirLight2 = spotLight.clone();
		dirLight2.position.set(-.2, .4, -.2);
		dirLight2.lookAt(0, 0, 0);
		this._scene?.add(ambientLight, dirLight1, dirLight2);

		const pointLight = new PointLight(0xffffff, .5);
		pointLight.castShadow = true;
		pointLight.shadow.blurSamples = 16;
		pointLight.shadow.radius = 20;
		pointLight.shadow.mapSize.width = 2048 / 2;
		pointLight.shadow.mapSize.height = 2048 / 2;
		pointLight.shadow.camera.near = .1;
		pointLight.shadow.camera.far = 10;
		const pointLightMesh = new Mesh(
			new SphereBufferGeometry(1, 30, 20),
			new PointLightMeshMaterial()
		);
		pointLightMesh.scale.multiplyScalar(.03);
		this._pointLight.add(pointLight, pointLightMesh);
		this._pointLight.position.set(0, .1, .3);
		this._scene?.add(this._pointLight);

		const plate = new Mesh(
			new BoxBufferGeometry(3, 1, 1),
			new MeshStandardMaterial({ color: 0xcccccc })
		);
		const floor = plate.clone();
		floor.rotateX(Math.PI);
		floor.position.setY(-.47);
		floor.receiveShadow = true;
		floor.castShadow = true;
		const backWall = plate.clone();
		backWall.position.set(0, .5, -1);
		backWall.receiveShadow = true;
		backWall.castShadow = true;
		this._scene?.add(floor, backWall);

		this._loadTextPlane();
		this._loadModel();

		setTimeout(this._focusEffect.bind(this), 2000);
	}

	protected _deInitChild(): void {

	}

	protected _resizeChild(): void {

	}

	protected _updateChild(): void {
		this._pointLight.position.setX(Math.sin(this._elapsedTime) * .1);
	}

	private _focusEffect() {
		if (!this._textPlaneNewYear || !this._textPlaneRabit) return;
		if (this._focusEffectTimeline) this._focusEffectTimeline.kill();
		this._focusEffectTimeline = gsap.timeline();
		this._focusEffectTimeline.add(
			gsap.timeline({
				defaults: { ease: "expo.out", duration: .8 },
				onUpdate: () => {
					this._camera?.fillScreen();
					this._camera?.lookAt(0, .2, -.5);
				}
			})
				.to(this._camera!.position, { x: 0, y: .1, z: .25 }, 0)
				.to(_PerspectiveCamera, { perspective: 350 }, 0)
		);
		this._focusEffectTimeline.add(
			gsap.timeline({ defaults: { duration: .5, ease: "elastic.out" } })
				.to(this._textPlaneRabit.material, { opacity: 1, ease: "expo.out" }, 0)
				.from(this._textPlaneRabit.position, { y: "-=.1" }, 0)
				.from(this._textPlaneRabit.scale, { y: "*=.7" }, 0)
		);
		this._focusEffectTimeline.add(
			gsap.timeline()
				.add(
					gsap.timeline({ defaults: { duration: .2, ease: "expo.out" } })
						.to(this._textPlaneRabit.material, { opacity: 0, ease: "circ.out" }, 0)
						.to(this._textPlaneRabit.position, { x: "-=.13", y: "+=.05", }, 0)
						.to(this._textPlaneRabit.scale, { x: "*=.8", y: "*=.8", z: "*=.8", }, 0)
					, 0).add(
						gsap.timeline({ defaults: { duration: .5, ease: "elastic.out", delay: .05 } })
							.to(this._textPlaneNewYear.material, { opacity: 1, ease: "expo.out", }, 0)
							.from(this._textPlaneNewYear.position, { y: "-=.1", }, 0)
							.from(this._textPlaneNewYear.scale, { y: "*=.7", }, 0)
						, 0)
		);
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
			const scaleEx = .6;
			mesh.scale.multiply(new Vector3(width / height, height / height, 1).multiplyScalar(scaleEx));
			mesh.position.setY(.5 * scaleEx);
			return mesh;
		};

		const textPlaneNewYear = getTextPlane(textureNewYear);
		const textPlaneRabit = getTextPlane(textureRabit);
		textPlaneNewYear.position.setZ(-.31);
		textPlaneRabit.position.setZ(-.3);

		this._scene?.add(textPlaneNewYear, textPlaneRabit);
		this._textPlaneNewYear = textPlaneNewYear;
		this._textPlaneRabit = textPlaneRabit;
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

