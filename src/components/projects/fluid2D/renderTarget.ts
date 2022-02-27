import {
	HalfFloatType,
	LinearFilter,
	NearestFilter,
	RGBAFormat,
	Texture,
	Vector2,
	WebGLRenderer,
	WebGLRenderTarget
} from "three";

interface IBuffer {
	target: WebGLRenderTarget;
	needsResize: boolean;
}

/**
 * オフスクリーンレンダリングのターゲットになるテクスチャ
 * あくまで使われるテクスチャでしかないのでこの中でSceneとかMaterialを持つことはしない
 * 参考にしたプログラムではbufferをいくつか作るみたいなことをしているけど、よく理解していないので飛ばす
 */
export default class RenderTarget {

	private _buffers: IBuffer[] = []
	private _index: number = 0

	constructor(
		readonly resolution: Vector2,
		readonly nBuffers: number = 1,  // テクスチャを交互に入れ替えるための数
		readonly format: number = RGBAFormat,
		readonly type: number = HalfFloatType
	) {
		this._buffers = [
			{
				target: new WebGLRenderTarget(resolution.x, resolution.y, {
					format,
					type,
					depthBuffer: false,
					stencilBuffer: false
				}),
				needsResize: false
			}
		]

		// 指定の個数分複製
		for(let i = 1; i < nBuffers; ++i) {
			this._buffers[i] = {
				target: this._buffers[0].target.clone(),
				needsResize: false
			}
		}
	}

	/**
	 * レンダリング
	 * @param renderer
	 */
	public set(renderer: WebGLRenderer): Texture {
		const buffer = this._buffers[this._index]
		renderer.setRenderTarget(buffer.target)
		this._index %= this._buffers.length
		return buffer.target.texture
	}

	public resize(size: Vector2): void {
		// NOTE: リサイズ処理は最低限実装できてから
	}

}