import vertShader from "./shader/display.vert";
import fragShader from "./shader/display.frag";

export interface DisplayShader {
	uniforms: {
		[key: string]: {
			value: any;
		};
	},
	vertexShader: string,
	fragmentShader: string;
}

/**
 * レンダリング前にスクリーンに直接かけるシェーダー
 */
export const displayShader: DisplayShader = {
	uniforms: {
		// tDiffuseという名前はShaderPass組み込み
		'tDiffuse': { value: null },
		'uTime': { value: 0 },
	},
	vertexShader: vertShader,
	fragmentShader: fragShader
};