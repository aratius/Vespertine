
import { AmbientLight, BoxBufferGeometry, ConeBufferGeometry, DirectionalLight, Group, Mesh, MeshBasicMaterial, MeshStandardMaterial, SphereBufferGeometry, Uniform, Vector3 } from "three";
import WebGLBase from "src/lib/webgl/common/main";
import BoxMaterial from "./material/boxMaterial";
import { GUI } from "lil-gui";
import { EffectComposer, EffectPass, GodRaysEffect, KernelSize, RenderPass, SMAAEffect } from "postprocessing";
import gsap from "gsap";

export default class Main extends WebGLBase {

	public _projectName: string = "box";
	private _composer: EffectComposer | null = null;
	private _box: Mesh<BoxBufferGeometry, BoxMaterial> | null = null;
	private _pointLightPoint: Mesh | null = null;
	private _sunGroup: Group = new Group();

	constructor(canvas: HTMLCanvasElement) {
		super(canvas, {
			camera: "perspective",
			stats: false
		});
	}

	protected _initChild(): void {

		this._renderer?.setPixelRatio(devicePixelRatio);

		this._camera?.position.set(3, 3, 3);
		this._camera?.lookAt(0, 0, 0);

		this._pointLightPoint = new Mesh(
			new SphereBufferGeometry(1, 10, 10),
			new MeshBasicMaterial({ color: 0xffffff })
		);
		this._pointLightPoint.scale.multiplyScalar(.05);

		const l = new DirectionalLight(0xffffff, .5);
		l.position.set(1, 1, 1);
		l.lookAt(0, 0, 0);
		this._scene?.add(this._pointLightPoint, new AmbientLight(0xffffff, .4), l);

		this._createBox();

		const obj = {
			amp: 0,
			height: 1,
			box: 0
		};
		const gui = new GUI();
		gui.add(obj, "amp", 0, 1).onChange((v: number) => {
			gsap.to(this._box!.material.uniforms.uAmp, { value: v, duration: 1 });
		});
		gui.add(obj, "height", 0, 1).onChange((v: number) => {
			gsap.to(this._box!.material.uniforms.uHeight, { value: v, duration: 1 });
		});
		gui.add(obj, "box", 0, 1).onChange((v: number) => {
			gsap.to(this._box!.material.uniforms.uBoxAmount, { value: v, duration: 1 });
		});

		const sunMaterial = new MeshBasicMaterial({
			color: 0xffeeee,
			transparent: true,
			fog: false
		});

		const sunGeometry = new SphereBufferGeometry(.7, 32, 32);
		const sun = new Mesh(sunGeometry, sunMaterial);
		sun.frustumCulled = false;
		sun.matrixAutoUpdate = false;
		// g.position.setZ(-2);
		this._sunGroup.add(sun);
		// this._scene?.add(g);

		this._composer = new EffectComposer(this._renderer!);
		this._composer.addPass(new RenderPass(this._scene!, this._camera!));
		const smaaEffect = new SMAAEffect();
		smaaEffect.edgeDetectionMaterial.setEdgeDetectionThreshold(.01);
		const godRaysEffect = new GodRaysEffect(this._camera!, sun, {
			height: 480,
			kernelSize: KernelSize.SMALL,
			density: 0.96,
			decay: 0.92,
			weight: 0.3,
			exposure: 0.54,
			samples: 60,
			clampMax: 1.0
		});
		this._composer.addPass(new EffectPass(this._camera!, smaaEffect, godRaysEffect));
	}

	protected _deInitChild(): void {

	}

	protected _resizeChild(): void {

	}

	protected _updateChild(): void {
		if (this._box)
			this._box!.material.setTime(this._elapsedTime);

		const t = this._elapsedTime * .01;
		this._box?.rotateY(.01);

		const t3 = this._elapsedTime * 2;
		this._pointLightPoint?.position.set(Math.sin(t3) * .8, Math.sin(t3) * .8, Math.cos(t3) * .8);
		this._box!.material.uniforms.uPointLightPos = new Uniform(this._pointLightPoint?.position);

		this._composer?.render();
	}

	/**
	 * create box
	 */
	private _createBox(): void {
		const geo = new BoxBufferGeometry(1, 1, 1, 200, 200, 200);
		const mat = new BoxMaterial();
		this._box = new Mesh(geo, mat);
		this._scene?.add(this._box);
	}

}

