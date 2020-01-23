class Parser {
  constructor(json) {
    const data = Parser.parseData(json)
    return data.modelJSON
  }
  static parseData(json) {
    const data = JSON.parse(json)
    const modelJSONString = data.modelJSON

    const modelData = eval("("+modelJSONString+")")

    return Object.assign({}, data, { modelJSON: modelData })
  }
}
module.exports = Parser
