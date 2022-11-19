
import { AmbientLight, BoxBufferGeometry, DirectionalLight, DoubleSide, Mesh, MeshBasicMaterial, MeshStandardMaterial, PlaneBufferGeometry, ShaderMaterial, Uniform } from "three";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry";
import WebGLBase from "src/lib/webgl/common/main";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader";
import gsap, { unitize } from "gsap";
import { loadTexture } from "../../common/utils";
import PaperMaterial from "./material";

export default class Main extends WebGLBase {

	public _projectName: string = "paper";
	private _mesh: (Mesh<BoxBufferGeometry, ShaderMaterial> | null) = null;

	constructor(canvas: HTMLCanvasElement) {
		super(canvas, {
			camera: "perspective"
		});
	}

	protected _initChild(): void {
		this._createPaper();

		this._camera?.position.set(0, 0, 10);
	}

	protected _deInitChild(): void {

	}

	protected _resizeChild(): void {

	}

	protected _updateChild(): void {
		if (this._mesh != null) {
			// this._mesh.material.uniforms.uTwist = new Uniform(Math.pow(Math.sin(this._elapsedTime * .5), 5) * 5);
			this._mesh.material.uniforms.uTime = new Uniform(this._elapsedTime);
		}
	}

	/**
	 *
	 */
	private async _createPaper(): Promise<void> {
		const geo = new BoxBufferGeometry(1, 10, .01, 30, 300, 1);
		const tex = await loadTexture("/images/barCode.jpg");
		const mat = new PaperMaterial(tex);
		const mesh = new Mesh(geo, mat);
		this._scene?.add(mesh);
		this._mesh = mesh;
	}

}

