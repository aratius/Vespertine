import { Component, ReactElement } from "react";
import WebGLMain from "src/components/projects/template/main";
import styles from "src/styles/projects/template.module.scss"
import Head from "src/components/lib/next/head";
import Info from "src/components/lib/next/info";

export default class Index extends Component {

    state = {}
    constructor(props) {
        super(props)
        this.state = {}
    }

    componentDidMount() {
    }

	_onRefCanvas(node) {
		if(!node) return
		const webgl = new WebGLMain(node)
		webgl.init()
	}

    render() {
        return (
            <div className={styles.container}>
				<Info
					title="[PROJECT_NAME]"
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
					title="[PROJECT_NAME]"
					ogImgPath=""
					ogUrl=""
					description=""
				/>
                <canvas ref={this._onRefCanvas}></canvas>
            </div>
        )
    }
}