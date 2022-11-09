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
		for (let i = 0; i < this._points.length; i++) {
			const p = this._points[i];
			const dist = p.targetPosition.distanceTo(point.position);
			if (dist == 0) break;
			if (dist < nearestDist) {
				nearestDist = dist;
				nearest = p;
			}
		}

		if (nearest != null) {
			const toNearestVec = nearest.targetPosition.clone().sub(point.position);
			toNearestVec.sub(toNearestVec.clone().normalize().multiplyScalar(point.scale.x + nearest.scale.x));
			const newPos = point.position.clone().add(toNearestVec);
			point.targetPosition = newPos;
			const { x, y, z } = newPos;
			const randomEase = () => {
				const eases = [
					"expo.in",
					"sine.in",
					"quad.in",
					"circ.in",
					// "back.in",
				];
				return eases[Math.floor(Math.random() * eases.length)];
			};
			gsap.timeline()
				.fromTo(point.scale, { x: 0, y: 0, z: 0 }, { x: point.scale.x, y: point.scale.y, z: point.scale.z, duration: 1, ease: "elastic.out" })
				// .to(point.position, { x, y, z, duration: 1, ease: "expo.in" });
				.add(
					gsap.timeline().to(point.position, { x, duration: 1, ease: randomEase() }, 0)
						.to(point.position, { y, duration: 1, ease: randomEase() }, 0)
						.to(point.position, { z, duration: 1, ease: randomEase() }, 0)
				);
		}
	}

	/**
	 *
	 */
	public update(): void {

	}

}