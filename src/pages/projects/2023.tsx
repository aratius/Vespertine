
import { Component, ReactElement } from "react";
import WebGLMain from "src/lib/webgl/projects/2023/main";
import styles from "src/styles/projects/2023.module.scss"
import Head from "src/components/common/head";
import Info from "src/components/common/info";
import gsap from "gsap";
import Main from "src/lib/webgl/projects/2023/main";

interface Props {}
interface State {}

export default class Index extends Component {

    public state: State = {}
	private _cursor?: HTMLSpanElement;
	private _cursorMoveTween?: GSAPTween;
	private _cursorSizeTween?: GSAPTween;
	private _webgl?: Main;

    constructor(props: Props) {
        super(props)
        this.state = {}
    }

    public componentDidMount(): void {
		window.addEventListener("mousemove", e => {
			if(this._cursor) {
				if(this._cursorMoveTween) this._cursorMoveTween.kill()
				this._cursorMoveTween = gsap.to(this._cursor, {left: e.clientX-8, top: e.clientY-8, duration: .15, ease: "expo.out"})
			}
			if(this._webgl) this._webgl.setMousePosition(e.clientX, e.clientY)
		})
		window.addEventListener("mousedown", e => {
			if(this._cursor) {
				if(this._cursorSizeTween) this._cursorSizeTween.kill()
				this._cursorSizeTween = gsap.to(this._cursor, {width: 20, height: 20, borderRadius: 10, duration: .3, ease: "expo.out"})
			}
			if(this._webgl) this._webgl.focusEffect()
		})
		window.addEventListener("mouseup", e => {
			if(this._cursor) {
				if(this._cursorSizeTween) this._cursorSizeTween.kill()
				this._cursorSizeTween = gsap.to(this._cursor, {width: 16, height: 16, borderRadius: 8, duration: .3, ease: "expo.out"})
			}
			if(this._webgl) this._webgl.blurEffect()
		})
		window.addEventListener("touchstart", e => {
			if(e.touches.length > 0) {
				if(this._webgl) this._webgl.focusEffect()
			}
		})
		window.addEventListener("touchmove", e => {
			if(e.touches.length > 0) if(this._webgl) this._webgl.setMousePosition(e.touches[0].clientX, e.touches[0].clientY)
		})
		window.addEventListener("touchend", e => {
			if(e.touches.length == 0) {
				if(this._webgl) this._webgl.blurEffect()
			}
		})
    }

	private _onRefCanvas = (node: HTMLCanvasElement): void => {
		if(!node) return
		const webgl = new WebGLMain(node)
		webgl.init()
		this._webgl = webgl;
	}

	private _onRefCursor = (node: HTMLSpanElement): void => {
		if(!node) return
		this._cursor = node
	}

    public render(): ReactElement {
        return (
            <div className={styles.container}>
				<Info
					title="2023"
					shareText=""
					shareUrl=""
					twitterId=""
					cc={`© 2023 | quick-sand`}
					details={[
						[
							{
								type: "text",
								text: "template engine: "
							},
							{
								type: "link",
								text: "quick-sand",
								link: "https://github.com/aratius/quick-sand"
							}
						]
					]}
				/>
				<Head
					title="2023"
					ogImgPath="https://vesp.aualrxse.com/2023/og.png"
					ogUrl="https://vesp.aualrxse.com/projects/2023/"
					description="Happy New Year | 2023"
					twitterId="aualrxse"
				/>
				<span className={`${styles.cursor} ${styles.pc}`} ref={this._onRefCursor}></span>
                <canvas ref={this._onRefCanvas}></canvas>
            </div>
        )
    }
}

