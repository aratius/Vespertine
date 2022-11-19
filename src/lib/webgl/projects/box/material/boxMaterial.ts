import { ShaderMaterial, Uniform } from "three";
import fragmentShader from "./shader/box.frag";
import vertexShader from "./shader/box.vert";

export default class BoxMaterial extends ShaderMaterial {

	constructor() {
		super({
			fragmentShader,
			vertexShader,
			uniforms: {
				uTime: new Uniform(0)
			}
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