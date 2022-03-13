import { ShaderMaterial } from 'three';
import fragmentShader from "./shader/ray.frag";
import vertexShader from "./shader/ray.vert"

export default class RaymarchingMaterial extends ShaderMaterial {

	constructor() {
		super({
			fragmentShader,
			vertexShader
		})
	}

}