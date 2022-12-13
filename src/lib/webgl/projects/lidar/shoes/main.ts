
import { AmbientLight, DirectionalLight, Material, Mesh, MeshStandardMaterial, PlaneBufferGeometry, Points, ShaderMaterial, Texture, Uniform } from "three";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry";
import WebGLBase from "src/lib/webgl/common/main";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader";
import gsap from "gsap";
import { loadGLTF } from "../../../common/utils";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

export default class Main extends WebGLBase {

	public _projectName: string = "myroom";

	constructor(canvas: HTMLCanvasElement) {
		super(canvas, {
			camera: "perspective"
		});
	}

	protected _initChild(): void {
		this._loadModel();
		const light = new AmbientLight(0xffffff, .8);
		const dlight = new DirectionalLight(0xffffff, .5);
		dlight.position.set(0, 3, 1);
		dlight.lookAt(0, 0, 0);
		this._scene?.add(light, dlight);
		this._camera?.position.set(-2, 2, 0);
		this._camera?.lookAt(0, 2, 0);
		new OrbitControls(this._camera!, this._canvas!);
	}

	protected _deInitChild(): void {

	}

	protected _resizeChild(): void {

	}

	protected _updateChild(): void {
	}

	private async _loadModel(): Promise<void> {
		const model = await loadGLTF("/models/shoes.glb");
		console.log(model);
		const mesh = model.children[0].children[0] as Mesh;
		const p = new Points(mesh.geometry, new ShaderMaterial({
			uniforms: {
				uTex: new Uniform((mesh.material as MeshStandardMaterial).map),
				uAmount: new Uniform(0)
			},
			vertexShader: `
			#include <common>
			varying vec2 vUv;
			uniform float uAmount;
			void main() {
				vUv = uv;
				vec3 offset = vec3(rand(uv)-.5, rand(uv + vec2(1.))-.5, rand(uv + vec2(2.))-.5) * uAmount;
				gl_Position = projectionMatrix * modelViewMatrix * vec4(position + offset, 1.);
				gl_PointSize = 20.;
			}
			`,
			fragmentShader: `
			varying vec2 vUv;
			uniform sampler2D uTex;
			void main() {
				float f = length( gl_PointCoord - vec2( 0.5, 0.5 ) );
				if ( f > 0.1 ) {
					discard;
				}
				gl_FragColor = texture2D(uTex, vUv);
			}
			`
		}));
		this._scene?.add(p);
		gsap.timeline({ repeat: -1 })
			.to(p.material.uniforms.uAmount, { value: 1, duration: 5, ease: "expo.out" })
			.to(p.material.uniforms.uAmount, { value: 0, duration: 2, ease: "elastic.out" });
	}

}

