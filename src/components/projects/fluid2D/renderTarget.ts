import {
	LinearFilter,
	NearestFilter,
	RGBAFormat,
	Texture,
	Vector2,
	WebGLRenderer,
	WebGLRenderTarget
} from "three";

/**
 * オフスクリーンレンダリングのターゲットになるテクスチャ
 * あくまで使われるテクスチャでしかないのでこの中でSceneとかMaterialを持つことはしない
 * 参考にしたプログラムではbufferをいくつか作るみたいなことをしているけど、よく理解していないので飛ばす
 */
export default class RenderTarget {

	private _renderTarget: WebGLRenderTarget | null = null

	constructor(size: Vector2) {
		this._renderTarget = new WebGLRenderTarget(size.x, size.y, {
			minFilter: LinearFilter,
			magFilter: NearestFilter,
			format: RGBAFormat
		})
	}

	/**
	 * テクスチャ
	 */
	public get texture(): Texture {
		return this._renderTarget!.texture
	}

	public deInit(): void {
	}

	/**
	 * レンダリング
	 * @param renderer
	 */
	public set(renderer: WebGLRenderer): void {
		renderer.setRenderTarget(this._renderTarget)
	}

	public resize(size: Vector2): void {
		this._renderTarget!.setSize(size.x, size.y)
	}

}