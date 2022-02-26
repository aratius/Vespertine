import "zx/globals"

export const COL_SUCCEED = chalk.hex("#0BE081")
export const COL_HAPPY = chalk.hex("#0BC9E0")
export const COL_NORMAL = chalk.hex("#A49BCC")
export const COL_WARNING = chalk.hex("#E24756")
const COLORS = [
	"#9EF8EE",
	"#F24405",
	"#FFEC5C",
	"#FF5F5D",
	"#BDA523",
	"#8C1F28"
]
export const getRandomColor = () => {
	return chalk.hex(COLORS[Math.floor(Math.random()*COLORS.length)])
}