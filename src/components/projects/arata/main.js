import { AmbientLight, DirectionalLight, Mesh, MeshStandardMaterial, PlaneBufferGeometry } from "three";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry"
import WebGLBase from "src/components/lib/webgl/main";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader";
import gsap from "gsap";

export default class Main extends WebGLBase {

	_projectName = "arata"

	constructor(canvas) {
		super(canvas, {
			camera: "orthographic"
		})
	}

	_initChild() {
		this._initPlaceHolderStage()
	}

	_deInitChild() {

	}

	_resizeChild() {

	}

	_updateChild() {
	}

	async _initPlaceHolderStage() {

		this._renderer.shadowMap.enabled = true
		this._camera.position.set(0, 5, 100)
		this._camera.lookAt(0 ,0, 0)

		const light = new DirectionalLight(0xffffff, 0.6)
		light.castShadow = true
		light.position.set(10, 10, 20)
		light.lookAt(0, 0, 0)
		light.shadow.mapSize.width = 2048
		light.shadow.mapSize.height = 2048
		light.shadow.camera.left = -128
		light.shadow.camera.right = 128
		light.shadow.camera.top = 128
		light.shadow.camera.bottom = -128
		light.shadow.blurSamples = 4
		light.shadow.radius = 2
		this._scene?.add(light)
		const ambLight = new AmbientLight(0xffffff, 0.5)
		this._scene?.add(ambLight)

		const font = await new FontLoader().loadAsync("/fonts/hue.json")
		const textGeometry = new TextGeometry(this._projectName, { font, size: 5, height: 3 })
		const textMaterial = new MeshStandardMaterial({color: 0xffffff, metalness: 0.2, roughness: 0.1})
		const textMesh =  new Mesh(textGeometry, textMaterial)
		textMesh.castShadow = true
		textMesh.receiveShadow = true
		textGeometry.computeBoundingBox();
		const xOffset = ( textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x );
		const yOffset = ( textGeometry.boundingBox.max.y - textGeometry.boundingBox.min.y );
		// TODO: 必ず画面がうまるような計算 Groupで囲んで画面幅によって拡縮するのがよいかな
		const xSeg = Math.ceil(innerWidth / xOffset)
		const ySeg = Math.ceil(innerHeight / yOffset)
		for(let x = -xSeg/2; x < xSeg/2; x++) {
			for(let y = -ySeg/2; y < ySeg/2; y++) {
				const text = textMesh.clone()
				text.position.setX(xOffset*x + 3*x)
				text.position.setY(yOffset*y + 1.5*y)
				this._scene?.add(text)
			}
		}

		const floorGeometry = new PlaneBufferGeometry(100, 100, 1, 1)
		const floorMaterial = new MeshStandardMaterial({color: 0x777777, metalness: 0.7, roughness: 0.1})
		const floorMesh = new Mesh(floorGeometry, floorMaterial)
		floorMesh.receiveShadow = true
		floorMesh.castShadow = true
		this._scene?.add(floorMesh)

		gsap.to(this, {duration: 1, ease: "linear", repeat: -1, onUpdate: () => {
			const time = Date.now() / 5000
			const x = Math.sin(time) * 10
			const y = Math.cos(time) * 10
			light.position.setX(x)
			light.position.setY(y)
		}})
	}

}
