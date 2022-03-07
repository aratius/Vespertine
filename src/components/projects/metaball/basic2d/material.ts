import { ShaderMaterial } from "three";
import fragmentShader from "./shader/meta.frag"
import vertexShader from "./shader/meta.vert"

export default class MetaballMaterial extends ShaderMaterial {

	constructor() {
		super({
			uniforms: {

			},
			fragmentShader,
			vertexShader
		})
	}

}