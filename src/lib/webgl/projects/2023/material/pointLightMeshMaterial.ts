import { ShaderMaterial } from "three";

export default class PointLightMeshMaterial extends ShaderMaterial {

	constructor() {
		super({
			fragmentShader: `
			varying float vAlpha;
			float easeOut(float x) {
				return 1. - sqrt(1. - pow(x, 2.));
			}
			void main() {
				gl_FragColor = vec4(vec3(1.), pow(vAlpha*1.01, 10.));
			}
			`,
			vertexShader: `
			varying float vAlpha;

			void main() {
				vec4 worldPosition = modelMatrix * vec4( position, 1.0 );
				vAlpha = -dot(normal, normalize(worldPosition.xyz - cameraPosition));
				vec4 mvPosition = viewMatrix * worldPosition;
				gl_Position = projectionMatrix * mvPosition;
			}
			`,
			transparent: true
		});
	}

}