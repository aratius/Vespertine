import { Mesh, MeshBasicMaterial, MeshDepthMaterial, MeshLambertMaterial, MeshNormalMaterial, MeshPhongMaterial, MeshStandardMaterial, SphereBufferGeometry, Vector3 } from "three";

export default class TreePoint extends Mesh {

	public fixed = false;
	public targetPosition: Vector3 = new Vector3(0, 0, 0);

	/**
	 *
	 * @param geo
	 * @param mat
	 */
	constructor() {
		const geo = new SphereBufferGeometry(1, 30, 20);
		const mat = new MeshStandardMaterial({ color: 0xffffff, roughness: .4, metalness: .9 });
		super(geo, mat);

		this.castShadow = true;
	}

}