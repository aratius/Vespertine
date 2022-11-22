import gsap from "gsap";
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
				uDirectionalLightVec: new Uniform(new Vector3(-1, -1, -1)),
				uPointLightPos: new Uniform(new Vector3(.5, .5, .5)),
				uPointLightDist: new Uniform(.5),
				uBoxAmount: new Uniform(1)
			},
			transparent: true,
			side: DoubleSide
		});

		// gsap.to(this.uniforms.uBoxAmount, { value: 0, duration: .5, ease: "elastic.out", delay: 4 });
	}

	/**
	 *
	 * @param time
	 */
	public setTime(time: number): void {
		this.uniforms.uTime = new Uniform(time);
	}

}