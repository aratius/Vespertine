
import gsap from "gsap";
import { AmbientLight, BackSide, BoxBufferGeometry, Group, LinearFilter, Material, Mesh, MeshBasicMaterial, MeshStandardMaterial, PlaneBufferGeometry, PointLight, ShaderMaterial, SphereBufferGeometry, SpotLight, Texture, TextureLoader, Uniform, Vector2, Vector3, WebGLRenderTarget } from "three";
import { EffectComposer, Pass } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass";
import { SavePass } from "three/examples/jsm/postprocessing/SavePass";
import { BlendShader } from "three/examples/jsm/shaders/BlendShader";
import { CopyShader } from "three/examples/jsm/shaders/CopyShader";
import { FXAAShader } from "three/examples/jsm/shaders/FXAAShader";
import { RenderPixelatedPass } from "./RenderPixelatedPass";
import WebGLBase from "src/lib/webgl/common/main";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import _PerspectiveCamera from "../../common/perspectiveCamera";
import { loadTexture } from "../../common/utils";
import PointLightMeshMaterial from "./material/pointLightMeshMaterial";
import RabitDistanceMaterial from "./material/rabitDistanceMaterial";
import { DisplayShader, displayShader } from "./material/displayShader";

export default class Main extends WebGLBase {

	public _projectName: string = "2023";
	private _rabit?: Mesh;
	private _pointLight: Group = new Group();
	private _textPlaneNewYear?: Mesh;
	private _textPlaneRabit?: Mesh;
	private _textPlaneNewYearRig: Group = new Group();
	private _textPlaneRabitRig: Group = new Group();
	private _focusEffectTimeline?: GSAPTimeline;
	private _composer?: EffectComposer;
	private _mousePosition: Vector2 = new Vector2(0, 0);
	private _cameraPosition: Vector3 = new Vector3(0, 0, 0);
	private _rabitEffectTimeline?: GSAPTimeline;
	private _customShaderPass?: ShaderPass;

	constructor(canvas: HTMLCanvasElement) {
		super(canvas, {
			camera: "perspective",
			autoRender: false
		});
	}

	protected _initChild(): void {
		this._renderer!.shadowMap.enabled = true;

		this._cameraPosition = new Vector3(0, .2, .5);
		_PerspectiveCamera.perspective = 500;
		this._camera?.position.set(this._cameraPosition.x, this._cameraPosition.y, this._cameraPosition.z);
		this._camera?.lookAt(0, .2, -.5);
		this._camera?.fillScreen();

		this._composer = new EffectComposer(this._renderer!);
		const savePass = new SavePass(
			new WebGLRenderTarget(
				innerWidth,
				innerHeight,
				{
					minFilter: LinearFilter,
					magFilter: LinearFilter,
					stencilBuffer: false
				}
			)
		);

		const blendPass = new ShaderPass(BlendShader, "tDiffuse1");
		blendPass.uniforms["tDiffuse2"] = new Uniform(savePass.renderTarget.texture);
		blendPass.uniforms["mixRatio"] = new Uniform(.8);

		const outputPass = new ShaderPass(CopyShader);
		outputPass.renderToScreen = true;

		const fxaaPass = new ShaderPass(FXAAShader);
		fxaaPass.material.uniforms["resolution"].value.x = 1 / innerWidth * this._renderer!.getPixelRatio();
		fxaaPass.material.uniforms["resolution"].value.y = 1 / innerHeight * this._renderer!.getPixelRatio();

		const customShaderPass = new ShaderPass(displayShader);
		this._customShaderPass = customShaderPass;

		const renderPass = new RenderPass(this._scene!, this._camera!);

		this._composer.addPass(renderPass);
		this._composer.addPass(blendPass);
		this._composer.addPass(savePass);
		this._composer.addPass(outputPass);
		this._composer.addPass(fxaaPass);
		this._composer.addPass(customShaderPass);

		const ambientLight = new AmbientLight(0xffffff, .7);
		const spotLight = new SpotLight(0xffffff, .3, 10, Math.PI / 4, 1, 3);
		spotLight.castShadow = true;
		spotLight.shadow.blurSamples = 16;
		spotLight.shadow.radius = 10;
		spotLight.shadow.mapSize.width = 2048 / 2;
		spotLight.shadow.mapSize.height = 2048 / 2;
		spotLight.shadow.camera.near = .1;
		spotLight.shadow.camera.far = 10;
		const spotLight1 = spotLight.clone();
		spotLight1.position.set(.2, .4, -.2);
		spotLight1.lookAt(0, 0, 0);
		const spotLight2 = spotLight.clone();
		spotLight2.position.set(-.2, .4, -.2);
		spotLight2.lookAt(0, 0, 0);
		const spotLight3 = spotLight.clone();
		spotLight3.intensity = .35;
		spotLight3.position.set(0, .3, .25);
		spotLight3.lookAt(0, 0, 0);
		this._scene?.add(ambientLight, spotLight1, spotLight2, spotLight3);

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
		this._pointLight.add(pointLight);
		this._pointLight.position.set(0, .1, .3);
		this._scene?.add(this._pointLight);

		const floor = new Mesh(
			new BoxBufferGeometry(3, 1, 3),
			new MeshStandardMaterial({ color: 0xF4B600, metalness: .8, roughness: .55 })
		);
		floor.position.setY(-.47);
		floor.receiveShadow = true;
		// floor.castShadow = true;
		const backWall = new Mesh(
			new SphereBufferGeometry(2, 30, 20),
			new MeshStandardMaterial({ color: 0xDD2720, side: BackSide, metalness: .5, roughness: .5 })
		);
		backWall.position.setZ(1);
		backWall.receiveShadow = true;
		// backWall.castShadow = true;
		this._scene?.add(floor, backWall);

		this._loadTextPlane();
		this._loadModel();

		window.addEventListener("mousemove", e => {
			this._mousePosition = new Vector2(e.clientX / innerWidth, e.clientY / innerHeight);
		});

	}

	protected _deInitChild(): void {

	}

	protected _resizeChild(): void {

	}

	protected _updateChild(): void {
		this._pointLight.position.setX((this._mousePosition.x - .5) * .2);
		this._pointLight.position.setY(-(this._mousePosition.y - .5) * .05 + .1);

		this._camera?.position.set(this._cameraPosition.x - (this._mousePosition.x - .5) * .02, this._cameraPosition.y + (this._mousePosition.y - .5) * .02, this._cameraPosition.z);
		this._camera?.lookAt(0, .2, -.5);

		if (this._rabit) (this._rabit?.customDistanceMaterial as ShaderMaterial).uniforms.uTime = new Uniform(this._elapsedTime);
		if (this._customShaderPass) this._customShaderPass.uniforms.uTime = new Uniform(this._elapsedTime);

		this._composer?.render();
	}

	public focusEffect(): void {
		if (!this._textPlaneNewYear || !this._textPlaneRabit) return;

		(this._textPlaneRabit.material as Material).opacity = 0;
		(this._textPlaneNewYear.material as Material).opacity = 0;
		this._textPlaneNewYearRig.scale.set(1, 1, 1);
		this._textPlaneNewYearRig.position.set(0, 0, 0);
		this._textPlaneRabitRig.scale.set(1, 1, 1);
		this._textPlaneRabitRig.position.set(0, 0, 0);

		if (this._focusEffectTimeline) this._focusEffectTimeline.kill();
		this._focusEffectTimeline = gsap.timeline({ onStart: this._startRabitEffect.bind(this) });
		this._focusEffectTimeline.add(
			gsap.timeline()
				.add(
					gsap.timeline({
						defaults: { ease: "expo.out", duration: .8 },
						onUpdate: () => {
							this._camera?.fillScreen();
							this._camera?.lookAt(0, .2, -.5);
						}
					})
						.to(this._cameraPosition, { x: 0, y: .1, z: .2 }, 0)
						.to(_PerspectiveCamera, { perspective: 350 }, 0)
						.to(this._pointLight.position, { z: .1 }, 0)
					, 0)
				.add(
					gsap.timeline({ defaults: { duration: .5, ease: "elastic.out" }, delay: .25 })
						.to(this._textPlaneRabit.material, { opacity: 1, ease: "expo.out" }, 0)
						.from(this._textPlaneRabitRig.position, { y: "-=.1" }, 0)
						.from(this._textPlaneRabitRig.scale, { y: "*=.7" }, 0)
					, 0)
		);
		this._focusEffectTimeline.add(
			gsap.timeline()
				.add(
					gsap.timeline({ defaults: { duration: .2, ease: "expo.out" } })
						.to(this._textPlaneRabit.material, { opacity: 0, ease: "sine.out" }, 0)
						.to(this._textPlaneRabitRig.position, { x: -.25, y: .15, }, 0)
						.to(this._textPlaneRabitRig.scale, { x: .6, y: .6, z: .6, }, 0)
					, 0)
				.add(
					gsap.timeline({ defaults: { duration: .5, ease: "elastic.out" }, delay: .05 })
						.to(this._textPlaneNewYear.material, { opacity: 1, ease: "expo.out", }, 0)
						.from(this._textPlaneNewYearRig.position, { y: -.1, }, 0)
						.from(this._textPlaneNewYearRig.scale, { y: .7, }, 0)
					, 0)
		);
	}

	public blurEffect(): void {
		if (!this._textPlaneNewYear || !this._textPlaneRabit) return;
		if (this._focusEffectTimeline) this._focusEffectTimeline.kill();
		this._focusEffectTimeline = gsap.timeline({ onStart: this._stopRabitEffect.bind(this) });
		this._focusEffectTimeline.add(
			gsap.timeline({
				defaults: { ease: "expo.out", duration: .8 },
				onUpdate: () => {
					this._camera?.fillScreen();
					this._camera?.lookAt(0, .2, -.5);
				}
			})
				.to(this._cameraPosition, { x: 0, y: .2, z: .5 }, 0)
				.to(_PerspectiveCamera, { perspective: 500 }, 0)
				.to(this._pointLight.position, { z: .3 }, 0)
			, 0);
		this._focusEffectTimeline.add(
			gsap.timeline({ defaults: { duration: .5, ease: "elastic.out" } })
				.to(this._textPlaneRabit.material, { opacity: 0, ease: "expo.out" }, 0)
				.to(this._textPlaneNewYear.material, { opacity: 0, ease: "expo.out", }, 0)
			, 0);
	}

	private _startRabitEffect(): void {
		if (this._rabitEffectTimeline) this._rabitEffectTimeline.kill();
		const distMat: ShaderMaterial = this._rabit?.customDistanceMaterial as ShaderMaterial;
		this._rabitEffectTimeline = gsap.timeline({ repeat: -1 });

		this._rabitEffectTimeline.add(
			gsap.timeline({ defaults: { ease: "sine.inOut" } })
				.to(distMat.uniforms.uProgress, { value: 40, duration: 5 }, 0)
				.to(distMat.uniforms.uPower, { value: 1, duration: .5 }, 0)
				.to(distMat.uniforms.uAmp, { value: 30, duration: .5 }, 0)
		);
		this._rabitEffectTimeline.add(
			gsap.timeline({ defaults: { ease: "sine.inOut" } })
				.to(distMat.uniforms.uProgress, { value: 43, duration: 3 }, 0)
				.to(distMat.uniforms.uPower, { value: 1, duration: .5 }, 0)
				.to(distMat.uniforms.uAmp, { value: 5, duration: .5 }, 0)
		);
		this._rabitEffectTimeline.add(
			gsap.timeline({ defaults: { ease: "sine.inOut" } })
				.to(distMat.uniforms.uProgress, { value: 43.3, duration: 1, ease: "linear" }, 0)
				.to(distMat.uniforms.uPower, { value: 5, duration: 1, ease: "elastic.out" }, 0)
				.to(distMat.uniforms.uAmp, { value: 10, duration: .1 }, 0)
		);
		this._rabitEffectTimeline.add(
			gsap.timeline({ defaults: { ease: "sine.out" } })
				.to(distMat.uniforms.uProgress, { value: 44, duration: 3 }, 0)
				.to(distMat.uniforms.uPower, { value: 0, duration: 3 }, 0)
				.to(distMat.uniforms.uAmp, { value: 1, duration: 2 }, 0)
		);
		this._rabitEffectTimeline.add(
			gsap.timeline({ defaults: { ease: "sine.inOut" } })
				.to(distMat.uniforms.uProgress, { value: 0, duration: 1 }, 0)
		);
	}

	private _stopRabitEffect(): void {
		if (this._rabitEffectTimeline) this._rabitEffectTimeline.kill();
		const distMat: ShaderMaterial = this._rabit?.customDistanceMaterial as ShaderMaterial;
		this._rabitEffectTimeline = gsap.timeline({});
		this._rabitEffectTimeline.add(
			gsap.timeline({ defaults: { ease: "sine.inOut" } })
				.to(distMat.uniforms.uProgress, { value: 0, duration: 1 }, 0)
				.to(distMat.uniforms.uPower, { value: 0, duration: .5 }, 0)
				.to(distMat.uniforms.uAmp, { value: 1, duration: .5 }, 0)
		);
	}

	private async _loadTextPlane(): Promise<void> {
		const [textureNewYear, textureRabit] = await Promise.all([loadTexture("/images/2023/newYear.png"), loadTexture("/images/2023/rabit.png")]);
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
		textPlaneNewYear.position.setZ(-.41);
		textPlaneRabit.position.setZ(-.4);

		this._textPlaneNewYear = textPlaneNewYear;
		this._textPlaneNewYearRig?.add(this._textPlaneNewYear);
		this._textPlaneRabit = textPlaneRabit;
		this._textPlaneRabitRig?.add(this._textPlaneRabit);
		this._scene?.add(this._textPlaneNewYearRig, this._textPlaneRabitRig);
	}

	private async _loadModel(): Promise<void> {
		// Configure and create Draco decoder.
		const dracoLoader = new DRACOLoader();
		dracoLoader.setDecoderPath('https://unpkg.com/three@0.137.0/examples/js/libs/draco/');
		dracoLoader.setDecoderConfig({ type: 'js' });

		return new Promise<void>((res, rej) => {

			dracoLoader.load('/models/bunny.drc', (geometry) => {

				geometry.computeVertexNormals();

				const material = new MeshStandardMaterial({ color: 0xcccccc });
				const mesh = new Mesh(geometry, material);
				mesh.customDistanceMaterial = new RabitDistanceMaterial();
				mesh.castShadow = true;
				mesh.receiveShadow = true;
				this._scene!.add(mesh);

				this._rabit = mesh;

				// Release decoder resources.
				dracoLoader.dispose();
				res();
			});
		});
	}

}

