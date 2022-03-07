import { AmbientLight, DirectionalLight, Mesh, MeshBasicMaterial, MeshStandardMaterial, PlaneBufferGeometry, SphereBufferGeometry } from "three";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry"
import WebGLBase from "src/components/lib/webgl/main";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader";
import gsap from "gsap";
import MetaballMaterial from "./material";

export default class Main extends WebGLBase {

	public _projectName: string = "basic"

	constructor(canvas: HTMLCanvasElement) {
		super(canvas, {
			camera: "orthographic"
		})
	}

	protected _initChild(): void {
		this._initPlaceHolderStage()
	}

	protected _deInitChild(): void {

	}

	protected _resizeChild(): void {

	}

	protected _updateChild(): void {
	}

	private async _initPlaceHolderStage(): Promise<void> {

		this._renderer!.shadowMap.enabled = true
		this._camera!.position.set(0, 5, 100)
		this._camera!.lookAt(0, 0, 0)

		const floorGeometry = new PlaneBufferGeometry(100, 100, 1, 1)
		const floorMaterial = new MetaballMaterial()
		const floorMesh = new Mesh(floorGeometry, floorMaterial)
		floorMesh.receiveShadow = true
		floorMesh.castShadow = true
		this._scene?.add(floorMesh)

	}

}
