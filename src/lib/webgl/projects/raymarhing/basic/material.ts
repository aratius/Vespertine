import { ShaderMaterial, Texture, Uniform } from 'three';
import fragmentShader from "./shader/ray.frag";
import vertexShader from "./shader/ray.vert"

export default class RaymarchingMaterial extends ShaderMaterial {

	constructor(matcaps: Texture) {
		super({
			fragmentShader,
			vertexShader,
			uniforms: {
				u_time: new Uniform(1.),
				u_matcaps: new Uniform(matcaps)
			}
		})
	}

}