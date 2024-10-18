
import { Component } from "react";
import WebGLMain from "src/lib/webgl/projects/scroll/main";
import styles from "src/styles/projects/scroll.module.scss";
import Head from "src/components/common/head";
import Info from "src/components/common/info";

export default class Index extends Component {

	state = {};
	constructor(props) {
		super(props);
		this.state = {};
	}

	componentDidMount() {
	}

	_onRefCanvas(node) {
		if (!node) return;
		const webgl = new WebGLMain(node);
		webgl.init();
	}

	render() {
		return (
			<div className={styles.container}>
				<Head
					title="scroll"
					ogImgPath=""
					ogUrl=""
					description=""
					twitterId=""
				/>

				<canvas ref={this._onRefCanvas}></canvas>

				<div style={{ height: "100vh" }}></div>

				<div>
					<h2>WORKS</h2>
					<ul>
						{new Array(100).fill(null).map((_, i) => {
							return <li key={i}>HELLO{i}</li>;
						})}
					</ul>
				</div>
				<br />
				<div>
					<h2>こんにちは！</h2>
					<ul>
						{new Array(100).fill(null).map((_, i) => {
							return <li key={i}>沖田真実だよ{i}</li>;
						})}
					</ul>
				</div>
			</div>
		);
	}
}

