import { DoubleSide, ShaderMaterial, Texture, Uniform } from "three";
import fragmentShader from "./shader/paper.frag";
import vertexShader from "./shader/paper.vert";

export default class PaperMaterial extends ShaderMaterial {

	constructor(tex: Texture) {
		super({
			fragmentShader,
			vertexShader,
			uniforms: {
				uTwist: new Uniform(0),
				uBarCode: new Uniform(tex)
			},
			side: DoubleSide,
			transparent: true
		});
	}

}