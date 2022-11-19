
import { BoxBufferGeometry, Mesh, Uniform } from "three";
import WebGLBase from "src/lib/webgl/common/main";
import { loadTexture } from "../../common/utils";
import PaperMaterial from "./material";
import gsap from "gsap";

const PAPER_NUM = 20;

export default class Main extends WebGLBase {

	public _projectName: string = "paper";
	private _meshes: Mesh<BoxBufferGeometry, PaperMaterial>[] = [];
	private _timeline: (GSAPTimeline | null) = null;

	constructor(canvas: HTMLCanvasElement) {
		super(canvas, {
			camera: "perspective"
		});
	}

	protected async _initChild(): Promise<void> {
		const num = 21;
		for (let x = 0; x < PAPER_NUM; x++) {
			for (let z = 0; z < 1; z++) {
				const mesh = await this._createPaper();
				mesh.position.setX((x - PAPER_NUM / 2) * 1);
				mesh.position.setZ(-(z + 1) * 1);
				this._meshes.push(mesh);
				this._scene?.add(mesh);
			}
		}

		this._renderer?.setClearColor(0x333333);
		this._camera?.position.set(0, 0, 10);

		window.addEventListener("click", () => {
			this._spread();
		});

		const setRandom = () => {
			this._camera?.position.setZ(Math.random() * 9 + 1);
			if (Math.random() < .1) {
				this._camera?.rotateZ(Math.PI);
			} else {
				this._camera?.rotateZ(0);
			}
		};
		setInterval(setRandom, 1000);
	}

	protected _deInitChild(): void {

	}

	protected _resizeChild(): void {

	}

	protected _updateChild(): void {
		this._meshes.forEach((mesh, i) => {
			mesh.material.uniforms.uTime = new Uniform(this._elapsedTime + i * 100);
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
			this._timeline!.to(mesh.material.uniforms.uTwist, { value: 10, duration: 1, ease: "sine.out" }, 0);
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
		this._scene?.add(mesh);
		return mesh;
	}

}

