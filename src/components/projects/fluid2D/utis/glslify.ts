// https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Template_literals#tagged_templates
const glslify = (code: TemplateStringsArray, ...values: (string)[]): string => {
	return values.map((value: string, i: number) => {
		return code[i] + value
	}).concat(code.slice(values.length)).join("")
}
export default glslify