import { DoubleSide, ShaderMaterial, Texture, Uniform } from "three";
import fragmentShader from "./shader/paper.frag";
import vertexShader from "./shader/paper.vert";

export default class PaperMaterial extends ShaderMaterial {

	constructor(tex: Texture) {
		super({
			fragmentShader,
			vertexShader,
			uniforms: {
				uTime: new Uniform(0),
				uTwist: new Uniform(10),
				uBarCode: new Uniform(tex)
			},
			transparent: true
		});
	}

}