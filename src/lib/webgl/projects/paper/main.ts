
import { BoxBufferGeometry, DirectionalLight, LinearFilter, Mesh, MeshBasicMaterial, MeshStandardMaterial, PlaneBufferGeometry, ShaderMaterial, Uniform, WebGLRenderTarget } from "three";
import WebGLBase from "src/lib/webgl/common/main";
import { loadTexture } from "../../common/utils";
import PaperMaterial from "./material";
import gsap from "gsap";

import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass";
import { SavePass } from "three/examples/jsm/postprocessing/SavePass";
import { BlendShader } from "three/examples/jsm/shaders/BlendShader";
import { CopyShader } from "three/examples/jsm/shaders/CopyShader";

const PAPER_NUM = 20;

export default class Main extends WebGLBase {

	public _projectName: string = "paper";
	private _composer: EffectComposer | null = null;
	private _meshes: Mesh<BoxBufferGeometry, PaperMaterial>[] = [];
	private _timeline: (GSAPTimeline | null) = null;

	constructor(canvas: HTMLCanvasElement) {
		super(canvas, {
			camera: "perspective"
		});
	}

	protected async _initChild(): Promise<void> {
		for (let x = 0; x < PAPER_NUM; x++) {
			for (let z = 0; z < 1; z++) {
				const mesh = await this._createPaper();
				mesh.position.setX((x - PAPER_NUM / 2) * 1);
				mesh.position.setZ(-(z + 1) * 1);
				this._meshes.push(mesh);
				this._scene?.add(mesh);
			}
		}

		const bgGeo = new BoxBufferGeometry(1, 1, .001);
		const bgMat = new MeshStandardMaterial({ color: 0xaaaaaa, metalness: .9, roughness: .4 });
		const bg = new Mesh(bgGeo, bgMat);
		bg.scale.multiplyScalar(100);
		bg.position.setZ(-2);
		bg.receiveShadow = true;
		this._scene?.add(bg);

		const dirLight = new DirectionalLight(0xffffff, .1);
		dirLight.position.set(0, 3, 10);
		dirLight.lookAt(0, 0, 0);
		dirLight.castShadow = true;
		dirLight.shadow.mapSize.width = 2048;
		dirLight.shadow.mapSize.height = 2048;
		dirLight.shadow.radius = 20;
		dirLight.shadow.blurSamples = 24;
		dirLight.shadow.camera.top = 10;
		dirLight.shadow.camera.bottom = -10;

		this._scene?.add(dirLight);

		this._renderer!.shadowMap.enabled = true;
		this._camera?.position.set(0, 0, 10);

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
		blendPass.uniforms["mixRatio"] = new Uniform(.5);

		const outputPass = new ShaderPass(CopyShader);
		outputPass.renderToScreen = true;

		this._composer.addPass(new RenderPass(this._scene!, this._camera!));
		this._composer.addPass(blendPass);
		this._composer.addPass(savePass);
		this._composer.addPass(outputPass);

		window.addEventListener("click", () => {
			this._spread();
		});
	}

	protected _deInitChild(): void {

	}

	protected _resizeChild(): void {

	}

	protected _updateChild(): void {
		this._composer?.render();
		this._meshes.forEach((mesh, i) => {
			mesh.material.uniforms.uTime = new Uniform(this._elapsedTime + i * 100);
			(mesh.customDepthMaterial as ShaderMaterial).uniforms.uTime = new Uniform(this._elapsedTime + i * 100);
		});
	}

	/**
	 *
	 */
	private _spread(): void {
		if (this._timeline != null) this._timeline.kill();
		this._timeline = gsap.timeline();
		this._meshes.forEach((mesh, i) => {
			this._timeline!.to(mesh.position, { x: (i - PAPER_NUM / 2) * 2, z: 0, duration: 1, ease: "expo.out" }, 0);
			this._timeline!.to(mesh.material.uniforms.uTwist, { value: 5, duration: 1, ease: "sine.out" }, 0);
			this._timeline!.to((mesh.customDepthMaterial as ShaderMaterial).uniforms.uTwist, { value: 5, duration: 1, ease: "sine.out" }, 0);
		});
	}

	/**
	 *
	 */
	private async _createPaper(): Promise<Mesh<BoxBufferGeometry, PaperMaterial>> {
		const geo = new BoxBufferGeometry(1, 30, .01, 30, 300, 1);
		const tex = await loadTexture("/images/barCode.jpg");
		const mat = new PaperMaterial(tex);
		const mesh = new Mesh(geo, mat);
		mesh.customDepthMaterial = mat.getDepthMaterial();
		mesh.castShadow = true;
		this._scene?.add(mesh);
		return mesh;
	}

}

