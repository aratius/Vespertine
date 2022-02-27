import WebGLBase from "src/components/lib/webgl/main";
import { Texture, Vector2 } from "three";
import { ExternalForceManager } from "./ExternalForceManager";
import ExternalForcePass from "./passes/externalForcePass";
import Pass from "./passes/pass";
import VelocityInitPass from "./passes/velocityInitPass";
import RenderTarget from "./renderTarget";

export default class Main extends WebGLBase {

	public _projectName: string = "fluid2D"
	private _config = {
		scale: 0.5,
		radius: 0.25
	}
	private _externalForceManager?: ExternalForceManager
	private _externalForceTarget?: RenderTarget
	private _externalForcePass?: Pass

	private get _resolution(): Vector2 {
		return new Vector2(this._config.scale * innerWidth, this._config.scale * innerHeight)
	}

	constructor(canvas: HTMLCanvasElement) {
		super(canvas, {
			camera: "orthographic",
			stats: true,
			fillScreen: false,
			cameraSettings: {
				left: 0,
				right: 0,
				top: 0,
				bottom: 0,
				near: 0,
				far: 0,
			}
		})
	}

	protected  _initChild(): void {
		this._renderer!.autoClear = false
		this._renderer!.setSize(innerWidth, innerHeight)
		this._renderer!.setPixelRatio(devicePixelRatio)

		this._externalForceManager = new ExternalForceManager(this._renderer!.domElement, this._resolution)

		this._initRenderTargets()
	}

	protected _deInitChild(): void {

	}

	protected _resizeChild(): void {

	}

	protected _updateChild(): void {
		this._updateRenderTargets()
	}

	private _initRenderTargets(): void {
		// 外圧パス
		this._externalForceTarget = new RenderTarget(this._resolution)
		this._externalForcePass = new ExternalForcePass(this._resolution.x / this._resolution.y, this._config.radius)

		// 速度初期化用パス
		const velInitTarget = new RenderTarget(this._resolution)
		const velInitPass = new VelocityInitPass()
		velInitTarget.set(this._renderer!)
		this._renderer?.render(velInitPass.scene!, this._camera!)

		// 移流パス
	}

	private _updateRenderTargets(): void {

		this._externalForcePass?.update({
			input: this._externalForceManager?.inputTouches,
			radius: this._config.radius,
			velocity: new Texture()
		})
		this._preview(this._externalForcePass!)
	}

	/**
	 * パスをプレビューする
	 * @param pass
	 */
	private _preview(pass: Pass) {
		this._renderer?.setRenderTarget(null)
		this._renderer?.render(pass.scene!, this._camera!)
	}

}
