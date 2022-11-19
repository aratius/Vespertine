import { DoubleSide, RGBADepthPacking, ShaderLib, ShaderMaterial, Texture, Uniform } from "three";
import fragmentShader from "./shader/paper.frag";
import vertexShader from "./shader/paper.vert";
import depthVertexShader from "./shader/paperDepth.vert";

export default class PaperMaterial extends ShaderMaterial {

	constructor(tex: Texture) {
		super({
			fragmentShader,
			vertexShader,
			uniforms: {
				uTime: new Uniform(0),
				uTwist: new Uniform(0),
				uBarCode: new Uniform(tex)
			},
			transparent: true
		});
	}

	public getDepthMaterial(): ShaderMaterial {
		return new ShaderMaterial({
			vertexShader: depthVertexShader,
			fragmentShader: ShaderLib["depth"].fragmentShader,
			uniforms: {
				...ShaderLib["depth"].uniforms,
				uTime: new Uniform(0),
				uTwist: new Uniform(0),
			},
			defines: {
				"DEPTH_PACKING": RGBADepthPacking
			}
		});
	}

}