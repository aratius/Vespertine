import { ShaderMaterial, Uniform } from "three";
import fragmentShader from "./shader/meta.frag"
import vertexShader from "./shader/meta.vert"

export default class MetaballMaterial extends ShaderMaterial {

	constructor() {
		super({
			uniforms: {
				u_time: new Uniform(0.)
			},
			fragmentShader,
			vertexShader,
			transparent: true
		})
	}

}