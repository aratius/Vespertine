import { Component, ReactElement } from "react";
import WebGLMain from "../components/projects/template/main";

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
		new WebGLMain(node)
	}

    public render(): ReactElement {
        return (
            <>
                <canvas ref={this._onRefCanvas}></canvas>
            </>
        )
    }
}