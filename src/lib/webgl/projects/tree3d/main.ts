
import WebGLBase from "src/lib/webgl/common/main";
import { AmbientLight, BackSide, BoxBufferGeometry, Camera, DirectionalLight, Mesh, MeshStandardMaterial, PerspectiveCamera, PointLight, SphereBufferGeometry, Vector3 } from "three";
import Tree from "./tree";
import { EffectComposer, DepthOfFieldEffect, EffectPass, RenderPass, BloomEffect, SelectiveBloomEffect, BlendFunction } from "postprocessing";

export default class Main extends WebGLBase {

	public _projectName: string = "tree3d";
	private _tree: (Tree | null) = null;
	private _composer: EffectComposer | null = null;

	constructor(canvas: HTMLCanvasElement) {
		super(canvas, {
			camera: "perspective",
			cameraSettings: {
				perspective: 500
			}
		});
	}

	protected _initChild(): void {

		const dirLight = new DirectionalLight(0xffaabb, .5);
		dirLight.position.set(10, 10, 10);
		dirLight.lookAt(0, 0, 0);
		dirLight.castShadow = true;
		dirLight.shadow.mapSize.width = 2048;
		dirLight.shadow.mapSize.height = 2048;
		dirLight.shadow.radius = 10;
		dirLight.shadow.blurSamples = 25;
		const dirLight2 = new DirectionalLight(0xaaffbb, .5);
		dirLight2.position.set(-10, 10, 10);
		dirLight2.lookAt(0, 0, 0);
		dirLight2.castShadow = true;
		dirLight2.castShadow = true;
		dirLight2.shadow.mapSize.width = 2048;
		dirLight2.shadow.mapSize.height = 2048;
		dirLight2.shadow.radius = 10;
		dirLight2.shadow.blurSamples = 25;
		const backLight = new PointLight(0xaabbff, .5, 10, .1);
		backLight.position.set(0, 1, -1);
		const ambLight = new AmbientLight(0xbaffff, .2);
		this._scene?.add(dirLight, dirLight2, backLight, ambLight);

		this._camera?.position.set(0, 2.5, 6);
		this._camera?.lookAt(0, 2.5, 0);

		this._renderer!.shadowMap.enabled = true;

		this._composer = new EffectComposer(this._renderer!);
		this._composer.addPass(new RenderPass(this._scene!, this._camera!));
		const dofEffect = new DepthOfFieldEffect(this._camera!, {
			focusDistance: 3,
			focalLength: 1,
			bokehScale: 5,
			height: 480
		});
		const bloomEffect = new SelectiveBloomEffect(this._scene!, this._camera!, {
			blendFunction: BlendFunction.ADD,
			mipmapBlur: true,
			luminanceThreshold: 0.7,
			luminanceSmoothing: 0.3,
			intensity: 30.0
		});
		// this._composer.addPass(
		// 	new EffectPass(this._camera!, dofEffect, bloomEffect)
		// );



		const room = new Mesh(
			new BoxBufferGeometry(1, 1, 1),
			new MeshStandardMaterial({ color: 0xffffff, side: BackSide })
		);
		room.scale.multiplyScalar(5);
		room.position.y += 2.5;
		room.receiveShadow = true;
		this._scene?.add(room);

		const tree1 = new Tree();
		tree1.position.set(-2.5, 0, -2.5);
		const tree2 = new Tree();
		tree2.position.set(2.5, 0, -2.5);
		const tree3 = new Tree();
		tree3.position.set(-2.5, 0, 2.5);
		const tree4 = new Tree();
		tree4.position.set(2.5, 0, 2.5);
		const tree5 = new Tree();
		tree5.position.set(-2.5, 5, -2.5);
		const tree6 = new Tree();
		tree6.position.set(2.5, 5, -2.5);
		const tree7 = new Tree();
		tree7.position.set(-2.5, 5, 2.5);
		const tree8 = new Tree();
		tree8.position.set(2.5, 5, 2.5);
		const trees = [tree1, tree2, tree3, tree4, tree5, tree6, tree7, tree8];
		trees.forEach(t => this._scene?.add(t));

		let cnt = 0;
		let size = .1;
		let timer = setInterval(() => {
			trees.forEach(tree => {
				tree.create(
					new Vector3(
						(Math.random() - .5) * 2 * 4,
						Math.random() * 4,
						(Math.random() - .5) * 2 * 4
					).sub(tree.position.clone()),
					Math.random() * size + .01
				);
			});
			cnt++;
			size -= .0001;
			if (cnt > 200) clearInterval(timer);
		}, 10);
	}

	protected _deInitChild(): void {

	}

	protected _resizeChild(): void {

	}

	protected _updateChild(): void {
		this._tree?.update();
		const t = this._elapsedTime * .3;
		this._camera?.position.setX(Math.sin(t) * 6);
		this._camera?.position.setZ(Math.cos(t) * 6);
		this._camera?.lookAt(0, 3, 0);
		this._composer?.render();
	}

}

