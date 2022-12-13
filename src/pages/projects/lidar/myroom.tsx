
import { Component, ReactElement } from "react";
import WebGLMain from "src/lib/webgl/projects/lidar/myroom/main";
import styles from "src/styles/projects/lidar/myroom.module.scss"
import Head from "src/components/common/head";
import Info from "src/components/common/info";

interface Props {}
interface State {}

export default class Index extends Component {

    public state: State = {}
    constructor(props: Props) {
        super(props)
        this.state = {}
    }

    public componentDidMount(): void {
    }

	private _onRefCanvas(node: HTMLCanvasElement): void {
		if(!node) return
		const webgl = new WebGLMain(node)
		webgl.init()
	}

    public render(): ReactElement {
        return (
            <div className={styles.container}>
				<Info
					title="myroom"
					shareText=""
					shareUrl=""
					twitterId=""
					cc={`© 2022 | quick-sand`}
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
					title="myroom"
					ogImgPath=""
					ogUrl=""
					description=""
					twitterId=""
				/>
                <canvas ref={this._onRefCanvas}></canvas>
            </div>
        )
    }
}

