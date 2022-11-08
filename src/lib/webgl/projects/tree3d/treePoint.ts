import { Mesh, MeshStandardMaterial, SphereBufferGeometry } from "three";

export default class TreePoint extends Mesh {

	public fixed = false;

	/**
	 *
	 * @param geo
	 * @param mat
	 */
	constructor() {
		const geo = new SphereBufferGeometry(1, 30, 20);
		const mat = new MeshStandardMaterial({ color: 0xffffff });
		super(geo, mat);
	}

}