import pico from "picocolors"
import format from "./format.js"

export default function functionCallLitral(func, ...params) {
  return (
    pico.blue(func) +
    pico.yellow("(") +
    pico.white(format("\"")(params, { colors: true }).slice(2, -2)) +
    pico.yellow(")")
  )
}
