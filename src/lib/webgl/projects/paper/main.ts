
import { AmbientLight, BoxBufferGeometry, DirectionalLight, DoubleSide, Mesh, MeshBasicMaterial, MeshStandardMaterial, PlaneBufferGeometry, ShaderMaterial, Uniform } from "three";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry";
import WebGLBase from "src/lib/webgl/common/main";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader";
import gsap, { unitize } from "gsap";
import { loadTexture } from "../../common/utils";

export default class Main extends WebGLBase {

	public _projectName: string = "paper";
	private _mesh: (Mesh<BoxBufferGeometry, ShaderMaterial> | null) = null;

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
		if (this._mesh != null) {
			this._mesh.material.uniforms.uTwist = new Uniform(Math.pow(Math.sin(this._elapsedTime * .5), 5) * 2);
		}
	}

	/**
	 *
	 */
	private async _createPaper(): Promise<void> {
		// const geo = new PlaneBufferGeometry(1, 10, 10, 100);
		const geo = new BoxBufferGeometry(1, 10, .01, 30, 300, 1);
		const tex = await loadTexture("/images/barCode.jpg");
		const mat = new ShaderMaterial({
			vertexShader: `
				#define PI 3.14159265

				varying vec3 vNormal;
				varying vec3 vNormalRaw;
				varying vec2 vUv;

				uniform float uTwist;

				//
				float atan2(in float y, in float x){
					return x == 0.0 ? sign(y) * PI / 2. : atan(y, x);
				}

				//
				vec3 getTwistPos(vec3 p) {
					float angle = atan2(p.x, p.z);
					angle += (p.y - 5.) * uTwist;
					float vecHoriLen = length(p.xz);
					vec2 newPosHori = vec2(sin(angle), cos(angle)) * vecHoriLen;
					return vec3(newPosHori.x, p.y, newPosHori.y);
				}

				//
				void main() {
					vec3 pos = position;

					vec3 tangent = cross(normal, vec3(0., 1., 0.));
					vec3 binormal = cross(tangent, normal);

					vec3 posT = pos + tangent;
					vec3 posB = pos + binormal;

					pos = getTwistPos(pos);

					posT = getTwistPos(posT);
					posB = getTwistPos(posB);

					vec3 modifiedTangent = posT - pos;
					vec3 modifiedBinormal = posB - pos;

					vNormalRaw = normal;
					vNormal = normalize(cross(modifiedTangent, modifiedBinormal));
					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.);
				}
			`,
			fragmentShader: `

				varying vec3 vNormal;
				varying vec3 vNormalRaw;
				varying vec2 vUv;

				uniform sampler2D uBarCode;

				const vec3 lightVec = - vec3(1., 1., 1.);

				void main() {
					vec2 coord = vUv;
					const float interval = 1.3;
					coord = fract(coord * vec2(1., 30.) / interval) * interval;
					vec4 color = texture2D(uBarCode, coord);
					if(coord.y > .97 || coord.y < .03) color.rgb = vec3(1.);
					if(vNormalRaw.z < 0.) color.rgb = vec3(1.);

					float amount = dot(vNormal, normalize(lightVec));
					amount += 1.;
					amount *= .5;
					color.rgb *= amount;
					gl_FragColor = color;
				}
			`,
			uniforms: {
				uTwist: new Uniform(0),
				uBarCode: new Uniform(tex)
			},
			side: DoubleSide,
			transparent: true
		});
		const mesh = new Mesh(geo, mat);
		this._scene?.add(mesh);
		this._mesh = mesh;
	}

}

