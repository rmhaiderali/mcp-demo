import boxen from "boxen"
import format from "./format.js"

export default function (items, opts = {}) {
  const text = items
    .map((item) => format("\"")(item, { colors: true, depth: null }))
    .join("\n")

  return boxen(text, { padding: { left: 1, right: 1 }, ...opts })
}
