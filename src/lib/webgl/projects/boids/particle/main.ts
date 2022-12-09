
import { BufferAttribute, BufferGeometry, DataTexture, Points, Vector2 } from "three";
import { GPUComputationRenderer, Variable } from "three/examples/jsm/misc/GPUComputationRenderer";
import WebGLBase from "src/lib/webgl/common/main";
import ParticlePlaneMaterial from "./material/particlePlaneMat";
import computeShaderPosition from "./material/shader/computeShaderPosition.frag";
import computeShaderVelocity from "./material/shader/computeShaderVelocity.frag";
import { EffectComposer, DepthOfFieldEffect, EffectPass, RenderPass, BloomEffect, SelectiveBloomEffect, BlendFunction } from "postprocessing";

export default class Main extends WebGLBase {

	private readonly size: Vector2 = new Vector2(50, 50);
	private readonly particleNum: number = this.size.x * this.size.y;
	private particlePlane: (Points | null) = null;
	private gpuCompute: (GPUComputationRenderer | null) = null;
	private positionVariable: (Variable | null) = null;
	private velocityVariable: (Variable | null) = null;
	private _composer: EffectComposer | null = null;

	constructor(canvas: HTMLCanvasElement) {
		super(canvas, {
			camera: "perspective"
		});
	}

	protected _initChild(): void {
		this._renderer!.setClearColor(0x000000);

		this.initComputationRenderer();
		this.initParticle();

		// this._composer!.addPass(new AfterimagePass(0.995))
		// this._composer!.addPass(new UnrealBloomPass(new Vector2(window.innerWidth, window.innerHeight), 1, 0.8, 0.5))

		this._camera!.position.setZ(500);

		this._composer = new EffectComposer(this._renderer!);
		this._composer.addPass(new RenderPass(this._scene!, this._camera!));
		const dofEffect = new DepthOfFieldEffect(this._camera!, {
			focusDistance: 100,
			focalLength: 100,
			bokehScale: 10,
			height: 1024
		});
		const bloomEffect = new SelectiveBloomEffect(this._scene!, this._camera!, {
			blendFunction: BlendFunction.ADD,
			mipmapBlur: true,
			luminanceThreshold: 0.7,
			luminanceSmoothing: 0.3,
			intensity: 30.0
		});
		this._composer.addPass(
			new EffectPass(this._camera!, dofEffect, bloomEffect)
		);
	}

	protected _deInitChild(): void {

	}

	protected _resizeChild(): void {

	}

	protected _updateChild(): void {
		this.velocityVariable!.material.uniforms.u_time = { value: this._elapsedTime };
		// this.velocityVariable!.material.uniforms.u_mouse_position = {value: this.mouse.basedCenterPosition}

		// // 計算
		this.gpuCompute!.compute();

		// // pointsの頂点シェーダーに頂点位置計算テクスチャを渡す (速度テクスチャは位置計算テクスチャの中で消費されているのでここでは使用する必要なし)
		(<ParticlePlaneMaterial>this.particlePlane!.material).uniforms.u_texture_position.value = (<any>this.gpuCompute!.getCurrentRenderTarget(this.positionVariable!)).texture;

		this._composer?.render();
	}

	/**
	 * テクスチャをfillする
	 * NOTE: 最初の一回だけ？
	 * @param texturePosition
	 */
	private fillTexture(texturePosition: DataTexture, textureVelocity: DataTexture): void {
		// テクスチャのイメージデータを一旦取り出す
		const posArray: Uint8ClampedArray = texturePosition.image.data;
		const velArray: Uint8ClampedArray = textureVelocity.image.data;

		for (let k = 0, kl = posArray.length; k < kl; k += 4) {
			let x, y, z;
			x = Math.sin(Math.random() * 10) * 300;
			y = Math.cos(Math.random() * 10) * 300;
			z = Math.sin(Math.random() * 10) * 300;

			// posArrayの形式=一次元配列に変換
			posArray[k + 0] = x;
			posArray[k + 1] = y;
			posArray[k + 2] = z;
			posArray[k + 3] = 0;

			// 移動する方向はとりあえずランダムに決めてみる。
			// これでランダムな方向にとぶパーティクルが出来上がるはず。
			velArray[k + 0] = (Math.random() - 0.5) * 100;
			velArray[k + 1] = (Math.random() - 0.5) * 100;
			velArray[k + 2] = (Math.random() - 0.5) * 100;
			velArray[k + 3] = 0;

		}
	}

	/**
	 * GPUCompute用のテクスチャを初期化
	 */
	private initComputationRenderer(): void {
		this.gpuCompute = new GPUComputationRenderer(this.size.x, this.size.y, this._renderer!);

		// 移動方向を保存するテクスチャ
		const dtPosition: DataTexture = this.gpuCompute.createTexture();
		const dtVelocity: DataTexture = this.gpuCompute.createTexture();

		this.fillTexture(dtPosition, dtVelocity);

		// shaderプログラムのアタッチ
		this.positionVariable = this.gpuCompute.addVariable("texturePosition", computeShaderPosition, dtPosition);
		this.velocityVariable = this.gpuCompute.addVariable("textureVelocity", computeShaderVelocity, dtVelocity);

		// 依存関係を構築する 依存し指定した変数はシェーダー内から参照可能
		this.gpuCompute.setVariableDependencies(this.positionVariable, [this.positionVariable, this.velocityVariable]);
		this.gpuCompute.setVariableDependencies(this.velocityVariable, [this.velocityVariable, this.positionVariable]);

		this.gpuCompute.init();
	}

	/**
	 * パーティクル初期化
	 */
	private initParticle(): void {
		const geometry: BufferGeometry = new BufferGeometry();
		const positions: Float32Array = new Float32Array(this.particleNum * 3);
		const indices: Float32Array = new Float32Array(this.particleNum);
		let p: number = 0;
		// 位置情報はShader側で決定するので、とりあえず適当に値を埋める
		for (let i = 0; i < this.particleNum; i++) {
			positions[p++] = 0;
			positions[p++] = 0;
			positions[p++] = 0;
			indices[i] = i;
		}

		// uv情報 テクスチャから情報を取り出すときに必要
		const uvs: Float32Array = new Float32Array(this.particleNum * 2);
		p = 0;
		for (let i = 0; i < this.size.x; i++) {
			for (let j = 0; j < this.size.x; j++) {
				uvs[p++] = j / (this.size.x - 1);
				uvs[p++] = i / (this.size.x - 1);
			}
		}

		// attribute登録
		geometry.setAttribute("position", new BufferAttribute(positions, 3));
		geometry.setAttribute("uv", new BufferAttribute(uvs, 2));
		geometry.setAttribute("index", new BufferAttribute(indices, 1));

		const material: ParticlePlaneMaterial = new ParticlePlaneMaterial();
		material.extensions.drawBuffers = true;
		this.particlePlane = new Points(geometry, material);
		this.particlePlane.matrixAutoUpdate = false;
		this.particlePlane.updateMatrix();

		this._scene!.add(this.particlePlane);
	}

}

