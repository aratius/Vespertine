
import { AmbientLight, DirectionalLight, DoubleSide, Mesh, MeshBasicMaterial, MeshStandardMaterial, PlaneBufferGeometry, ShaderMaterial, Uniform } from "three";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry";
import WebGLBase from "src/lib/webgl/common/main";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader";
import gsap, { unitize } from "gsap";

export default class Main extends WebGLBase {

	public _projectName: string = "paper";

	constructor(canvas: HTMLCanvasElement) {
		super(canvas, {
			camera: "perspective"
		});
	}

	protected _initChild(): void {
		this._createPaper();

		this._camera?.position.set(0, 0, 10);
	}

	protected _deInitChild(): void {

	}

	protected _resizeChild(): void {

	}

	protected _updateChild(): void {

	}

	/**
	 *
	 */
	private _createPaper(): void {
		const geo = new PlaneBufferGeometry(1, 10, 10, 100);
		const mat = new ShaderMaterial({
			vertexShader: `
				#define PI 3.14159265

				float atan2(in float y, in float x){
					return x == 0.0 ? sign(y) * PI / 2. : atan(y, x);
				}

				void main() {
					vec3 pos = position;
					float angle = atan2(pos.x, pos.z);
					angle += pos.y * 1.;
					float vecHoriLen = length(pos.xz);
					vec2 newPosHori = vec2(sin(angle), cos(angle)) * vecHoriLen;
					pos = vec3(newPosHori.x, pos.y, newPosHori.y);
					gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.);
				}
			`,
			fragmentShader: `
				void main() {
					gl_FragColor = vec4(1.);
				}
			`,
			uniforms: {

			},
			side: DoubleSide
		});
		const mesh = new Mesh(geo, mat);
		this._scene?.add(mesh);
	}

}

