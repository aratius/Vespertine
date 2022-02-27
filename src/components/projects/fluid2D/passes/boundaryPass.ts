import { RawShaderMaterial, Scene } from "three";
import Pass from "./pass";

interface Uniforms {

}

export default class BoundaryPass implements Pass {

	public scene?: Scene
	public material?: RawShaderMaterial

	constructor() {

	}

	public update(uniforms: Uniforms): void {

	}

}