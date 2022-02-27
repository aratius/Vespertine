import WebGLBase from "src/components/lib/webgl/main";

export default class Main extends WebGLBase {

	public _projectName: string = "fluid2D"

	constructor(canvas: HTMLCanvasElement) {
		super(canvas, {
			camera: "orthographic",
			stats: true
		})
	}

	protected  _initChild(): void {

	}

	protected _deInitChild(): void {

	}

	protected _resizeChild(): void {

	}

	protected _updateChild(): void {
	}

}
