import utils from "node:util"
import boxen from "boxen"

export default function (items, opts = {}) {
  const text = items
    .map((item) => utils.inspect(item, { colors: true, depth: null }))
    .join("\n")

  return boxen(text, { padding: { left: 1, right: 1 }, ...opts })
}
