import { Mesh, MeshStandardMaterial, SphereBufferGeometry, Vector3 } from "three";

export default class TreePoint extends Mesh {

	public fixed = false;
	public targetPosition: Vector3 = new Vector3(0, 0, 0);

	/**
	 *
	 * @param geo
	 * @param mat
	 */
	constructor() {
		super(
			new SphereBufferGeometry(1, 30, 20),
			new MeshStandardMaterial({ color: 0xffffff, roughness: .4, metalness: .9 })
		);

		this.castShadow = true;
	}

}