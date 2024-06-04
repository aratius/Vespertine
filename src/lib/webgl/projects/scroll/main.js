
import { AmbientLight, Color, DirectionalLight, Mesh, MeshBasicMaterial, MeshStandardMaterial, PlaneBufferGeometry, TextureLoader } from "three";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry";
import WebGLBase from "src/lib/webgl/common/main";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader";
import gsap from "gsap";
import ScrollMaterial from "./material";

export default class Main extends WebGLBase {

	_projectName = "scroll";

	constructor(canvas) {
		super(canvas, {
			camera: "perspective"
		});
	}

	_initChild() {
		this._initPlaceHolderStage();
	}

	_deInitChild() {

	}

	_resizeChild() {

	}

	_updateChild() {
	}

	async _initPlaceHolderStage() {

		this._renderer.shadowMap.enabled = true;
		// this._renderer.setClearColor(0x4342c);
		this._renderer.setClearColor(0xffffff);
		this._camera.position.set(0, 5, 100);
		this._camera.lookAt(0, 0, 0);

		const floorGeometry = new PlaneBufferGeometry(1, 1, 1, 1);
		const floorMaterial = new ScrollMaterial();
		const floorMesh = new Mesh(floorGeometry, floorMaterial);
		floorMesh.receiveShadow = true;
		floorMesh.castShadow = true;
		this._scene?.add(floorMesh);


	}

}

