import { Component, ReactElement } from "react";
import WebGLMain from "src/components/projects/aualrxse/main";
import styles from "src/styles/projects/aualrxse.module.scss"
import Head from "src/components/lib/next/head";
import Info from "src/components/lib/next/info";

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
					title="aualrxse"
					shareText=""
					shareUrl=""
					details={[
						[
							{
								type: "text",
								text: "source: "
							},
							{
								type: "link",
								text: "https://github.com/aratius/QuickSand",
								link: "https://github.com/aratius/QuickSand"
							}
						]
					]}
				/>
				<Head
					title="aualrxse"
					ogImgPath=""
					ogUrl=""
					description=""
				/>
                <canvas ref={this._onRefCanvas}></canvas>
            </div>
        )
    }
}
