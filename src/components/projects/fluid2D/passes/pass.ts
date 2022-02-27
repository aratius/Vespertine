import { RawShaderMaterial, Scene } from "three";

export default interface Pass {

	scene?: Scene
	material?: RawShaderMaterial
	update(uniforms: Object): void

}