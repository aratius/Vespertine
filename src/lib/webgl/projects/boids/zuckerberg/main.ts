
import WebGLBase from "src/lib/webgl/common/main";
import { loadGLTFWithAnimation } from 'src/lib/webgl/common/utils';
import { AmbientLight, AnimationMixer } from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"

export default class Main extends WebGLBase {

	public _projectName: string = "zuckerberg"
	private _mixer?: AnimationMixer

	constructor(canvas: HTMLCanvasElement) {
		super(canvas, {
			camera: "perspective"
		})
	}

	protected _initChild(): void {

		this._camera?.position.set(0, 50, 100)
		this._camera?.lookAt(0,0,0)

		const ambLight = new AmbientLight(0xffffff, 1.)
		this._scene?.add(ambLight)

		const controls = new OrbitControls(this._camera!, this._renderer!.domElement)
		controls.enableDamping = true
		controls.update()

		this._initZuckerberg()
	}

	protected _deInitChild(): void {

	}

	protected _resizeChild(): void {

	}

	protected _updateChild(): void {
		if(this._mixer) this._mixer.update(1/60)
	}

	private async _initZuckerberg(): Promise<void> {
		const [model, mixer] = await loadGLTFWithAnimation("/models/mark_zuckerberg_running/scene.gltf", Infinity)
		model.scale.multiplyScalar(10)
		this._mixer = mixer

		this._scene?.add(model)
	}

}
