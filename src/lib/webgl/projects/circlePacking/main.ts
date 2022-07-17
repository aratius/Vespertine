
import { Mesh, MeshBasicMaterial, PlaneBufferGeometry, SphereGeometry, Vector2, Vector3 } from "three";
import WebGLBase from "src/lib/webgl/common/main";
import { loadTexture } from "../../common/utils";

interface Circles {
	scl: Vector2;
	pos: Vector2,
}

export default class Main extends WebGLBase {

	public _projectName: string = "circlePacking";

	private _dishes: Mesh[] = [];

	constructor(canvas: HTMLCanvasElement) {
		super(canvas, {
			camera: "orthographic"
		});
	}

	protected _initChild(): void {
		this._createPlane();
		this._createDishes();
		this._camera?.position.setZ(100);
		this._camera?.lookAt(0, 0, 0);

	}

	protected _deInitChild(): void {

	}

	protected _resizeChild(): void {

	}

	protected _updateChild(): void {

	}

	private async _createPlane(): Promise<void> {
		const geo = new PlaneBufferGeometry(1, 1, 1, 1);
		const map = await loadTexture("/images/digitalEffect/floor.png");
		const mat = new MeshBasicMaterial({ color: 0xffffff, map });
		const mesh = new Mesh(geo, mat);
		const scl = 0.5;
		mesh.scale.set(1464, 742, 100).multiplyScalar(scl);
		this._scene?.add(mesh);
	}

	private _createDishes(): void {
		const geo = new SphereGeometry(1, 100, 100, 100);
		const mat = new MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.4 });
		const dish = new Mesh(geo, mat);

		// 左
		this._setDish(dish, new Vector2(30, 30), new Vector2(-268, 83));
		this._setDish(dish, new Vector2(30, 30), new Vector2(-188, 83));
		this._setDish(dish, new Vector2(30, 40), new Vector2(-267, -10));  // 楕円

		// 右
		this._setDish(dish, new Vector2(30, 30), new Vector2(270, -83));
		this._setDish(dish, new Vector2(30, 30), new Vector2(190, -83));
		this._setDish(dish, new Vector2(30, 40), new Vector2(270, 10));  // 楕円

	}

	private _setDish(dish: Mesh, scl: Vector2, pos: Vector2) {
		const mesh = dish.clone();
		mesh.scale.set(scl.x, scl.y, mesh.scale.z);
		mesh.position.set(pos.x, pos.y, mesh.position.z);
		this._scene?.add(mesh);
		this._dishes.push(mesh);
	}

}

