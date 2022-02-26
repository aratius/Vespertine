/**
 * zxが呼び出したShellコマンドの標準出力を表示しないようにする。
 * @see https://github.com/google/zx/blob/main/README.md#verbose
 */
$.verbose = false;

// message -----
import { COL_SUCCEED, COL_HAPPY, COL_NORMAL, COL_WARNING, getRandomColor } from "./config.mjs"
import { makeDirectory } from "./makeDirectory.mjs"
import "zx/globals"

const arg = argv._
// check argv
if(arg.length < 1) {
	console.log(chalk.red(" --- ERROR --- "));
	console.log(chalk.red("arguments is not satisfied."));
	throw new Error("error")
}
let ts = false
// ts option
for(const i in arg) if(arg[i].match(/ts/) != null) ts = true

const crrDir = process.cwd()
const pageJS = (await $`cat tasks/templates/page${ts ? "TS" : "JS"}.txt`).stdout
const componentJS = (await $`cat tasks/templates/component${ts ? "TS" : "JS"}.txt`).stdout
const style = (await $`cat tasks/templates/style.txt`).stdout
const project = arg[0]
// 最後の要素（ファイル名）を覗いたディレクトリ
const dir = project.split("/")
const projectName = dir.pop()
const pageJSReplaced = pageJS.replace(/\[PROJECT\]/g, project).replace(/\[PROJECT_NAME\]/g, projectName)
const componentJSReplaced = componentJS.replace(/\[PROJECT\]/g, project).replace(/\[PROJECT_NAME\]/g, projectName)

/**
 *
 * @returns {boolean} isSucceeded
 */
const create = async () => {
	console.log(COL_NORMAL("creating ..."));

	// create next page ------
	cd(`${crrDir}/src/pages/projects`)
	if(dir.length > 0) await makeDirectory(dir.join(""))
	if(!fs.existsSync(`${crrDir}/src/pages/projects/${project}.${ts ? "tsx" : "jsx"}`)) {
		await $`echo ${pageJSReplaced} > ${project}.${ts ? "tsx" : "jsx"}`
	} else return false

	// create webgl component -----
	cd(`${crrDir}/src/components/projects`)
	await makeDirectory(project)
	await $`ls`
	if(!fs.existsSync(`${crrDir}/src/components/projects/${project}/main.${ts ? "ts" : "js"}`)) {
		await $`echo ${componentJSReplaced} >${project}/main.${ts ? "ts" : "js"}`
	} else return false

	// create style -----
	cd(`${crrDir}/src/styles/projects`)
	if(dir.length > 0) await makeDirectory(dir.join(""))
	if(!fs.existsSync(`${crrDir}/src/styles/projects/${project}.module.scss`)) {
		await $`echo ${style} > ${project}.module.scss`
	} else return false

	return true
}
const res = await create()
// result message
if(res) {
	console.log(COL_SUCCEED("\n--- PROJECT SUCCESSFULLY CREATED ---"))
	const aa = await $`asciify "${projectName}" -f nancyj-fancy`
	console.log(getRandomColor()("\n"+aa.stdout))
	console.log(COL_NORMAL("created - ") + `src/pages/projects/${project}.tsx`)
	console.log(COL_NORMAL("created - ") + `src/components/projects/${project}/main.ts`)
	console.log(COL_NORMAL("created - ") + `src/styles/projects/${project}.module.scss`)
} else {
	console.log(COL_WARNING(" --- ERROR ---"))
	console.log(COL_WARNING("err - ") + "same project has already been created.")
}

console.log(COL_HAPPY("ready - ") + `http://localhost:3000/projects/${project}`)
$`npm run dev -p -3000`
setTimeout(() => {
	$`opener http://localhost:3000/projects/${project}`
}, 1000)
