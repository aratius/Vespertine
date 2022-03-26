
import { AmbientLight, DirectionalLight, Material, Mesh, MeshBasicMaterial, MeshStandardMaterial, PlaneBufferGeometry, Texture, Vector2, Vector3, VideoTexture } from "three";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry"
import WebGLBase from "src/lib/webgl/common/main";
import FeedbackRT from './feedbackTarget';
import GUI from './gui';
import SlitScanMaterial from './material/slitScanMaterial';
import CombinedMaterial from './material/combinedMaterial';
import CopiedMaterial from './material/copiedMaterial';
import TimeMapMaterial from './material/timeMapMaterial';
import gsap from 'gsap';
const BASE_SIZE = new Vector2(1000, 720)

export default class Main extends WebGLBase {

	public _projectName: string = "sea"

	private _displays: Mesh[] = [];
	private _videoTexture: Texture |null = null;
	private _combinedTarget: FeedbackRT |null = null;
	private _copiedTarget: FeedbackRT |null = null;
	private _timeMapTarget: FeedbackRT |null = null;
	private _slideTimeline: GSAPTimeline |null = null;
	private _size: Vector2 = this._BASESIZE.multiplyScalar(3);
	private _gui: GUI|null = null

	/**
 * ディスプレイを作る
 * @param mat
 * @param size
 * @param pos
 * @returns
 */
	private static _createDisplay(mat: Material, size: Vector2, pos: Vector3): Mesh {
		const geo = new PlaneBufferGeometry(1, 1, 1, 1);

		const display = new Mesh(geo, mat);
		display.position.set(pos.x, pos.y, pos.z);
		display.scale.set(size.x, size.y, 1);
		return display;
	}

	constructor(canvas: HTMLCanvasElement) {
		super(canvas, {
			camera: "perspective"
		})
		this._gui = new GUI();
		this._gui.on(GUI.SLIDE, this._slideUI);
		this._gui.on(GUI.CHANGE_RES, this._changeRes);
		this._gui.on(GUI.CHANGE_MAP, this._changeMap)
	}

	protected _initChild(): void {
		this._size = this._BASESIZE.multiplyScalar(this._gui?.config.timeslice_resolution as number);

		window.addEventListener("click", async () => {
			this._videoTexture = await this._initVideo();
			this._initRenderTargets();
			this._initDisplays();

			this._renderer?.setClearColor(0x000);
			this._camera?.position.setZ(600)
		}, {once: true})
	}

	protected _deInitChild(): void {
		this._displays.forEach((display: Mesh) => {
			(display.material as Material).dispose();
			this._scene?.remove(display);
		});
		this._displays = [];

		this._combinedTarget?.deInit();
		this._copiedTarget?.deInit();
		this._timeMapTarget?.deInit();

		this._videoTexture = null;
	}

	protected _resizeChild(): void {

	}

	protected _updateChild(): void {
		this._updateRenderTargets();
	}
	private get _BASESIZE(): Vector2 {
		return BASE_SIZE.clone();
	}

	/**
	 * ディスプレイをスライド
	 */
	private _slideUI = (): void => {
		const positoins = this._displays.map(d => d.position);
		const scales = this._displays.map(d => d.scale);

		if (this._slideTimeline != null && this._slideTimeline.isActive()) return;

		this._slideTimeline = gsap.timeline();

		this._displays.forEach((display: Mesh, i: number, arr: Mesh[]) => {
			const nextIndex = i + 1 > arr.length - 1 ? 0 : i + 1;
			const p = positoins[nextIndex];
			const s = scales[nextIndex];
			display.renderOrder = p.z;
			this._slideTimeline?.to(display.position, { x: p.x, y: p.y, z: p.z, onUpdate: () => console.log(display.position.z) }, 0);
			this._slideTimeline?.to(display.scale, { x: s.x, y: s.y }, 0);
		});
	};

	/**
	 * デカテクスチャの解像度変更
	 * @param res
	 */
	private _changeRes = (res: number): void => {
		this._size = this._BASESIZE.multiplyScalar(res);
		this._deInit();
		this.init();
	};

	/**
	 * タイムマップの種類切り替え
	 * @param mapType
	 */
	private _changeMap = (mapType: number): void => {
		this._timeMapTarget?.setUniform("u_map_type", mapType);
	};

	/**
	 * initialize web camera
	 * @returns {Promise<void>}
	 */
	private async _initVideo(): Promise<Texture> {
		try {
			// const localMediaStream: MediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
			const video = document.createElement("video");
			// video.srcObject = localMediaStream;
			video.src = "/movies/sea_01.mp4";
			// video.autoplay = true
			video.volume = 0
			video.loop = true
			video.playbackRate = 0.5

			video.addEventListener("loadeddata", () => {
				video.play();
			});
			return new VideoTexture(video);
		} catch (err) {
			throw err
		}
	}

	/**
	 * 各種裏側の処理の確認用のディスプレイを初期化
	 */
	private _initDisplays(): void {
		const basicMat = (map: Texture) => new MeshBasicMaterial({ map, depthTest: true });

		let posScaleList = [
			{
				s: this._BASESIZE.multiplyScalar(0.5 / 3.1),
				p: new Vector3(280, 122, 0.3)
			},
			{
				s: this._BASESIZE.multiplyScalar(0.5 / 3.1),
				p: new Vector3(280, 0, 0.2)
			},
			{
				s: this._BASESIZE.multiplyScalar(0.5 / 3.1),
				p: new Vector3(280, -122, 0.1)
			},
			{
				s: this._BASESIZE.multiplyScalar(0.5),
				p: new Vector3(-100, 0, 0.4)
			}
		];

		if (window.innerWidth < 800) {
			const sizeMin = this._BASESIZE.divideScalar(Math.max(this._BASESIZE.x, this._BASESIZE.y)).multiplyScalar(window.innerWidth * 0.7 / 3.1);
			const sizeMax = this._BASESIZE.divideScalar(Math.max(this._BASESIZE.x, this._BASESIZE.y)).multiplyScalar(window.innerWidth * 0.7);
			posScaleList = [
				{
					s: sizeMin,
					p: new Vector3(-sizeMin.x * 1.05, -sizeMax.y / 2 - sizeMin.y / 2 + 40, 0.3)
				},
				{
					s: sizeMin,
					p: new Vector3(0, -sizeMax.y / 2 - sizeMin.y / 2 + 40, 0.2)
				},
				{
					s: sizeMin,
					p: new Vector3(sizeMin.x * 1.05, -sizeMax.y / 2 - sizeMin.y / 2 + 40, 0.1)
				},
				{
					s: sizeMax,
					p: new Vector3(0, 50, 0.4)
				}
			];
		}

		const realTimeDisplay = Main._createDisplay(
			basicMat(this._videoTexture!),
			posScaleList[0].s,
			posScaleList[0].p
		);

		const timeslicedDisplay = Main._createDisplay(
			basicMat(this._combinedTarget!.texture!),
			posScaleList[1].s,
			posScaleList[1].p
		);

		const timeMapDisplay = Main._createDisplay(
			basicMat(this._timeMapTarget!.texture!),
			posScaleList[2].s,
			posScaleList[2].p
		);

		const slitScanResult = Main._createDisplay(
			new SlitScanMaterial(this._combinedTarget!.texture, this._timeMapTarget!.texture),
			posScaleList[3].s,
			posScaleList[3].p
		);

		this._scene?.add(realTimeDisplay, timeslicedDisplay, timeMapDisplay, slitScanResult);
		this._displays.push(realTimeDisplay, timeslicedDisplay, timeMapDisplay, slitScanResult);
	}

	/**
	 * レンダーターゲット系を初期化
	 */
	private _initRenderTargets(): void {
		this._combinedTarget = new FeedbackRT(this._size, new CombinedMaterial());
		this._combinedTarget.setUniform("u_current_texture", this._videoTexture);
		this._copiedTarget = new FeedbackRT(this._size, new CopiedMaterial());
		this._timeMapTarget = new FeedbackRT(this._BASESIZE, new TimeMapMaterial());
		this._timeMapTarget.setUniform("u_map_type", this._gui?.config.time_map_type);

	}

	/**
	 * レンダーターゲットを更新
	 */
	private _updateRenderTargets(): void {
		if (this._combinedTarget != null && this._copiedTarget != null && this._timeMapTarget != null) {
			// TODO: oldを受ける
			this._combinedTarget.setUniform("u_old_texture", this._copiedTarget.texture);
			this._combinedTarget.render(this._renderer!);

			// TODO: newを受ける
			this._copiedTarget.setUniform("u_copied_texture", this._combinedTarget.texture);
			this._copiedTarget.render(this._renderer!);

			this._timeMapTarget.render(this._renderer!);
			this._timeMapTarget.setTime(this._elapsedTime);
		}
		this._renderer!.render(this._scene!, this._camera!);
	}



}