import { DoubleSide, ShaderMaterial, Uniform, Vector2, Vector3 } from "three";
import fragmentShader from "./shader/box.frag";
import vertexShader from "./shader/box.vert";

export default class BoxMaterial extends ShaderMaterial {

	constructor() {
		super({
			fragmentShader,
			vertexShader,
			uniforms: {
				uTime: new Uniform(0),
				uLightVec: new Uniform(new Vector3(-1, -1, -1))
			},
			transparent: true,
			side: DoubleSide
		});
	}

	/**
	 *
	 * @param time
	 */
	public setTime(time: number): void {
		this.uniforms.uTime = new Uniform(time);
	}

}