import WebGLBase from "src/components/lib/webgl/main";
import { Texture, Vector2 } from "three";
import { ExternalForceManager } from "./externalForceManager";
import AdvectionPass from "./passes/advectionPass";
import CompositionPass from "./passes/compositionPass";
import ExternalForcePass from "./passes/externalForcePass";
import Pass from "./passes/pass";
import VelocityInitPass from "./passes/velocityInitPass";
import RenderTarget from "./renderTarget";

export default class Main extends WebGLBase {

	public _projectName: string = "fluid2D"
	private _config = {
		scale: 0.5,
		radius: 0.25,
		dt: 1/60
	}
	private _externalForceManager?: ExternalForceManager
	private _externalForcePass?: Pass
	private _advectionPass?: Pass
	private _compositionPass?: Pass
	private _velocityTarget?: RenderTarget

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

		this._externalForceManager = new ExternalForceManager(
			this._renderer!.domElement,
			this._resolution.x / this._resolution.y
		)

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
		this._externalForcePass = new ExternalForcePass(
			this._resolution.x / this._resolution.y,
			this._config.radius
		)

		// 速度初期化用パス
		const velInitTarget = new RenderTarget(this._resolution)
		const velInitPass = new VelocityInitPass()
		const initialVelTexture = velInitTarget.set(this._renderer!)
		this._renderer?.render(velInitPass.scene!, this._camera!)

		// 移流パス
		this._advectionPass = new AdvectionPass(initialVelTexture, initialVelTexture, 0)

		// 最終描画用パス
		this._compositionPass = new CompositionPass()

		// 速度保存用ターゲット
		this._velocityTarget = new RenderTarget(this._resolution, 2)
	}

	private _updateRenderTargets(): void {
		// 移流を計算
		this._advectionPass?.update({timeDelta: this._config.dt})
		let velTex = this._velocityTarget!.set(this._renderer!)
		this._renderer!.render(this._advectionPass!.scene!, this._camera!)

		// 外圧を加える
		if(this._externalForceManager!.inputTouches.length > 0) {
			this._externalForcePass?.update({
				input: this._externalForceManager?.inputTouches[0].input,
				radius: this._config.radius,
				velocity: velTex
			})
			velTex = this._velocityTarget!.set(this._renderer!)
			this._renderer!.render(this._externalForcePass!.scene!, this._camera!)
		}

		// 移流を再度計算 上でいろいろ計算された結果を改めて移流パスに書いてる？
		this._advectionPass!.update({
			inputTexture: velTex,
			velocity: velTex
		})

		// 最終描画
		this._renderer!.setRenderTarget(null)
		const visualization = velTex
		this._compositionPass?.update({
			colorBuffer: visualization
		})
		this._renderer!.render(this._compositionPass!.scene!, this._camera!)
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
