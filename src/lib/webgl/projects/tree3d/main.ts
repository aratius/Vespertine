
import WebGLBase from "src/lib/webgl/common/main";
import { AmbientLight, Camera, DirectionalLight, PerspectiveCamera, Vector3 } from "three";
import Tree from "./tree";
import { EffectComposer, DepthOfFieldEffect, EffectPass, RenderPass } from "postprocessing";

export default class Main extends WebGLBase {

	public _projectName: string = "tree3d";
	private _tree: (Tree | null) = null;
	private _composer: EffectComposer | null = null;

	constructor(canvas: HTMLCanvasElement) {
		super(canvas, {
			camera: "perspective"
		});
	}

	protected _initChild(): void {

		const dirLight = new DirectionalLight(0xffaafb, .7);
		dirLight.position.set(10, 20, 10);
		dirLight.lookAt(0, 0, 0);
		const ambLight = new AmbientLight(0xbaffff, .5);
		this._scene?.add(dirLight, ambLight);

		this._camera?.position.set(0, 10, 10);
		this._camera?.lookAt(0, 3, 0);

		this._composer = new EffectComposer(this._renderer!);
		this._composer.addPass(new RenderPass(this._scene!, this._camera!));
		const dof = new DepthOfFieldEffect(this._camera!, {
			focusDistance: 2,
			focalLength: 1,
			bokehScale: 2,
			height: 480
		});
		this._composer.addPass(
			new EffectPass(this._camera!, dof)
		);


		this._tree = new Tree();
		this._tree.init();
		this._scene?.add(this._tree);

		let cnt = 0;
		let timer = setInterval(() => {
			this._tree?.create(new Vector3((Math.random() - .5) * 5, Math.random() * 5, (Math.random() - .5) * 5), Math.random() * .05);
			cnt++;
			if (cnt > 3000) clearInterval(timer);
		}, 1);
	}

	protected _deInitChild(): void {

	}

	protected _resizeChild(): void {

	}

	protected _updateChild(): void {
		this._tree?.update();
		const t = this._elapsedTime * .3;
		this._camera?.position.set(Math.sin(t) * 5, 5, Math.cos(t) * 5);
		this._camera?.lookAt(0, 2, 0);
		this._composer?.render();
	}

}

