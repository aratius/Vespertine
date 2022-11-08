import gsap from "gsap";
import { Group, Vector3 } from "three";
import TreePoint from "./treePoint";

export default class Tree extends Group {

	/**
	 *
	 */
	private _points: TreePoint[] = [];

	/**
	 *
	 */
	constructor() {
		super();
	}

	/**
	 *
	 */
	public init(): void {
		this.create(new Vector3(0, 0, 0), 0.1);
	}

	/**
	 *
	 */
	public create(pos: Vector3, scale: number): void {
		const point = new TreePoint();
		point.position.set(pos.x, pos.y, pos.z);
		point.scale.multiplyScalar(scale);
		this.add(point);
		this._points.push(point);

		let nearest: TreePoint = this._points[0];
		let nearestDist = 9999;
		this._points.forEach((p, i) => {
			const dist = p.position.distanceTo(point.position);
			if (dist == 0) return;
			if (dist < nearestDist) {
				nearestDist = dist;
				nearest = p;
			}
		});

		if (nearest != null) {
			const toNearestVec = nearest.position.clone().sub(point.position);
			toNearestVec.sub(toNearestVec.clone().normalize().multiplyScalar(point.scale.x + nearest.scale.x));
			const newPos = point.position.clone().add(toNearestVec);
			// point.position.set(newPos.x, newPos.y, newPos.z);
			const { x, y, z } = newPos;
			gsap.to(point.position, { x, y, z, duration: 0, ease: "expo.out" });
		}
	}

	/**
	 *
	 */
	public update(): void {

	}

}