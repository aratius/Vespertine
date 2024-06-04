import { ShaderMaterial, TextureLoader, Uniform, Vector2 } from "three";
import fragmentShader from "./scroll.frag";
import vertexShader from "./scroll.vert";
import GUI from "lil-gui";

export default class ScrollMaterial extends ShaderMaterial {

	constructor() {
		super({
			transparent: true,
			fragmentShader,
			vertexShader,
			uniforms: {
				uResolution: new Uniform(new Vector2(innerWidth, innerHeight)),  //
				uSampler: new Uniform(new TextureLoader().load("/images/okita.png")),
				uScrollPos: new Uniform(0), // 0-1
				uWidthGap: new Uniform(30),  // px
				uTransparency: new Uniform(0.5)
			}
		});

		let timer;
		window.addEventListener("resize", () => {
			if (timer) clearTimeout(timer);
			timer = setTimeout(() => {
				this.uniforms.uResolution = new Uniform(new Vector2(innerWidth, innerHeight));
			}, 200);
		});

		window.addEventListener("scroll", () => {
			const scrollPos = window.scrollY / innerHeight;
			this.uniforms.uScrollPos = new Uniform(Math.max(Math.min(scrollPos, 1), 0));
			console.log(this.uniforms.uScrollPos);

		});

		const gui = new GUI({ autoPlace: false, width: 200 });
		const customContainer = document.createElement('div');
		customContainer.style.position = "fixed";
		customContainer.style.bottom = "0";
		customContainer.style.right = "0";
		document.body.appendChild(customContainer);
		customContainer.appendChild(gui.domElement);

		// オブジェクトのプロパティ値を設定
		const params = {
			widthgap: 30,       // 例として50を初期値に
			transparency: 0.5  // 初期値は不透明
		};

		// widthgapとtransparentのコントロールを追加
		gui.add(params, 'widthgap', 0, 100).name('Width Gap'); //b 0から100の範囲
		gui.add(params, 'transparency', 0, 1).name('Transparency'); // 0から100の範囲

		// パラメータが変更された際の処理（任意）
		gui.onChange(function (value) {
			console.log('New Value:', value);
			const widthGap = value.object.widthgap;
			this.uniforms.uWidthGap = new Uniform(widthGap);
			const transparency = value.object.transparency;
			this.uniforms.uTransparency = new Uniform(transparency);
		});
	}

}