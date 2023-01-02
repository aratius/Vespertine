import { RGBADepthPacking, ShaderLib, ShaderMaterial, Uniform } from "three";
import depthVertexShader from "./shader/rabitrDepth.vert";

export default class RabitDistanceMaterial extends ShaderMaterial {

	constructor() {
		super({
			vertexShader: depthVertexShader,
			fragmentShader: ShaderLib["distanceRGBA"].fragmentShader,
			uniforms: {
				...ShaderLib["distanceRGBA"].uniforms,
				uAmp: new Uniform(1),
				uPower: new Uniform(0),
				uProgress: new Uniform(0),
			},
			defines: {
				// "DISTANCE": 1
			}
		});
	}

}