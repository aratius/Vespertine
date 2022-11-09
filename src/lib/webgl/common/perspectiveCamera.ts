import { PerspectiveCamera } from "three";
import Camera from "./camera";

export interface PerspectiveCameraOptions {
	perspective?: number,
	fov?: number,
	aspect?: number,
	near?: number,
	far?: number;
}

export default class _PerspectiveCamera extends PerspectiveCamera implements Camera {

	public static perspective: number = 500;
	public static get defaultOptions(): Required<PerspectiveCameraOptions> {
		return {
			perspective: 1000,
			fov: (180 * (2 * Math.atan(innerHeight / 2 / _PerspectiveCamera.perspective))) / Math.PI,
			aspect: innerWidth / innerHeight,
			near: 0.001,
			far: 2000,
		};
	}

	private _userOptions: PerspectiveCameraOptions = {};

	constructor(options: PerspectiveCameraOptions) {
		super(
			options?.fov || _PerspectiveCamera.defaultOptions.fov,
			options?.aspect || _PerspectiveCamera.defaultOptions.aspect,
			options?.near || _PerspectiveCamera.defaultOptions.near,
			options?.far || _PerspectiveCamera.defaultOptions.far
		);
		_PerspectiveCamera.perspective = options?.perspective || _PerspectiveCamera.defaultOptions.perspective;
		this._userOptions = options;
		this.fillScreen();

	}

	public fillScreen(): void {
		this.fov = _PerspectiveCamera.defaultOptions.fov!;
		this.aspect = _PerspectiveCamera.defaultOptions.aspect!;
		this.updateProjectionMatrix();
	}

}