import WebGLBase from "src/lib/webgl/common/main";
import { Texture, Vector2, Vector3 } from "three";
import { ExternalForceManager } from "./externalForceManager";
import RenderTarget from "./renderTarget";
import AdvectionPass from "./passes/advectionPass";
import BoundaryPass from "./passes/boundaryPass";
import CompositionPass from "./passes/compositionPass";
import DivergencePass from "./passes/divergencePass";
import ExternalForcePass from "./passes/externalForcePass";
import PressurePass from "./passes/pressurePass";
import PressureSubtractionPass from "./passes/pressureSubtractionPass";
import VelocityInitPass from "./passes/velocityInitPass";

export default class Main extends WebGLBase {

	public _projectName: string = "fluid2D"
	private _config = {
		scale: 0.5,
		radius: 0.25,
		dt: 1 / 60,
		iteration: 32
	}
	private _externalForceManager?: ExternalForceManager
	private _externalForcePass?: ExternalForcePass
	private _advectionPass?: AdvectionPass
	private _divergencePass?: DivergencePass
	private _pressurePass?: PressurePass
	private _pressureSubPass?: PressureSubtractionPass
	private _boundaryPass?: BoundaryPass
	private _compositionPass?: CompositionPass
	private _velocityTarget?: RenderTarget
	private _divergenceTarget?: RenderTarget
	private _pressureTarget?: RenderTarget
	private _powerAcc: Vector2 = new Vector2(0.0)
	private _powerRot: Vector2 = new Vector2(0.0)

	private get _resolution(): Vector2 {
		return new Vector2(
			innerWidth * this._config.scale,
			innerHeight * this._config.scale
		)
	}

	private get _power(): Vector2 {
		return this._powerAcc.clone().multiplyScalar(2.5).add(this._powerRot).multiplyScalar(3)
	}

	constructor(canvas: HTMLCanvasElement) {
		super(canvas, {
			camera: "orthographic",
			stats: false,
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

	protected _initChild(): void {
		this._renderer!.autoClear = false
		this._renderer!.setSize(innerWidth, innerHeight)
		this._renderer!.setPixelRatio(devicePixelRatio)

		// OES_standard_derivatives
		const gl: WebGL2RenderingContext = this._renderer!.getContext() as WebGL2RenderingContext
		gl.hint(gl.FRAGMENT_SHADER_DERIVATIVE_HINT, gl.DONT_CARE)

		this._externalForceManager = new ExternalForceManager(
			this._renderer!.domElement,
			this._resolution.x / this._resolution.y
		)

		window.addEventListener('deviceorientation', (e: DeviceOrientationEvent) => {
			console.log(e);
			const a = e.alpha
			const b = e.beta
			const g = e.gamma
			this._powerRot = new Vector2(g! / 30, -b! / 60)
		}, true)
		window.addEventListener("devicemotion", (e) => {
			this._powerAcc = new Vector2(e.acceleration!.x!, e.acceleration!.y!)
		})

		this._initRenderTargets()
	}

	protected _deInitChild(): void { }

	protected _resizeChild(): void { }

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

		this._boundaryPass = new BoundaryPass()

		this._divergencePass = new DivergencePass()

		this._pressurePass = new PressurePass()

		this._pressureSubPass = new PressureSubtractionPass()


		// 最終描画用パス
		this._compositionPass = new CompositionPass()

		// 速度保存用ターゲット
		this._velocityTarget = new RenderTarget(this._resolution, 2)
		this._divergenceTarget = new RenderTarget(this._resolution, 1)
		this._pressureTarget = new RenderTarget(this._resolution, 2)
	}

	private _updateRenderTargets(): void {
		let velTex: Texture, divTex: Texture, pressTex: Texture

		// 移流を計算
		this._advectionPass?.update({ timeDelta: this._config.dt })
		velTex = this._velocityTarget!.set(this._renderer!)
		this._renderer!.render(this._advectionPass!.scene!, this._camera!)

		// 外圧を加える
		// if (this._externalForceManager!.inputTouches.length > 0) {
		this._externalForcePass?.update({
			// input: this._externalForceManager?.inputTouches[0].input,
			radius: this._config.radius,
			velocity: velTex,
			// power: new Vector2(Math.sin(this._elapsedTime) * 5, Math.sin(this._elapsedTime) * 5),
			power: this._power,
		})
		velTex = this._velocityTarget!.set(this._renderer!)
		this._renderer!.render(this._externalForcePass!.scene!, this._camera!)
		// }

		// 画面の端に壁を置く
		this._boundaryPass?.update({ velocity: velTex })
		velTex = this._velocityTarget!.set(this._renderer!)
		this._renderer!.render(this._boundaryPass!.scene!, this._camera!)

		// 発散を求める
		this._divergencePass?.update({ velocity: velTex })
		divTex = this._divergenceTarget!.set(this._renderer!)
		this._renderer!.render(this._divergencePass!.scene!, this._camera!)


		this._pressurePass!.update({ divergence: divTex })
		// 粘性の計算 反復法
		for (let i = 0; i < this._config.iteration; i++) {
			pressTex = this._pressureTarget!.set(this._renderer!)
			this._renderer!.render(this._pressurePass!.scene!, this._camera!)
			this._pressurePass!.update({ previousIteration: pressTex })
		}

		// 圧力勾配を抽象化し、発散ゼロの速度ベクトル場を得る
		this._pressureSubPass?.update({
			timeDelta: this._config.dt,
			velocity: velTex,
			pressure: pressTex!
		})
		velTex = this._velocityTarget!.set(this._renderer!)
		this._renderer!.render(this._pressureSubPass!.scene!, this._camera!)

		// 移流を再度計算 上でいろいろ計算された結果を改めて移流パスに書いてる？
		this._advectionPass!.update({
			inputTexture: velTex,
			velocity: velTex
		})

		// 最終描画
		this._renderer!.setRenderTarget(null)
		const visualization = velTex
		this._compositionPass?.update({
			colorBuffer: visualization,
			time: this._elapsedTime
		})
		this._renderer!.render(this._compositionPass!.scene!, this._camera!)
	}

}
