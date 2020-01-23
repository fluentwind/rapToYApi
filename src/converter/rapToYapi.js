const RequestMap = {
  1: 'GET',
  2: 'POST',
  3: 'PUT',
  4: 'DELETE'
}

class Converter {
  constructor(data) {
    return this.convert(data)
  }

  processParams(parameterList) {
    const property = {}
    if (Array.isArray(parameterList)) {
      parameterList.forEach((param) => {
        let remark = ''
        if (param.remark && !param.remark.startsWith('@mock=')) {
          remark = '[remark]' + param.remark
        }
        const yapiParam = {
          description: param.name + remark
        }
        // 提取mock
        if (param.remark.startsWith('@mock=')) {
          const mockString = param.remark.substring('@mock='.length, param.remark.length)
          if (mockString) {
            yapiParam.mock = {
              mock: mockString
            }
          }
        }
        if (['string', 'number', 'boolean'].includes(param.dataType)) {
          yapiParam.type = param.dataType
        } else if (param.dataType === 'array<string>') {
          yapiParam.type = 'array'
          yapiParam.items = {
            type: 'string'
          }
        } else if (param.dataType === 'array<number>') {
          yapiParam.type = 'array'
          yapiParam.items = {
            type: 'number'
          }
        } else if (param.dataType === 'array<boolean>') {
          yapiParam.type = 'array'
          yapiParam.items = {
            type: 'boolean'
          }
        } else if (param.dataType === 'array<object>') {
          yapiParam.type = 'array'
          yapiParam.items = {
            type: 'object',
            properties: this.processParams(param.parameterList)
          }
        } else if (param.dataType === 'object') {
          yapiParam.type = 'object'
          yapiParam.properties = this.processParams(param.parameterList)
        }
        // 处理mock
        const hasMock = param.identifier.indexOf('|')
        let filedName = param.identifier

        if (hasMock > -1) {
          filedName = filedName.substring(0, hasMock)
        }
        property[filedName] = yapiParam
      })
    }
    return property
  }

  convert(data) {
    const categoryList = []
    data.moduleList.forEach((module) => {
      module.pageList.forEach((page) => {
        const list = page.actionList.map((action) => {
          const reqParams = {
            "$schema": "http://json-schema.org/draft-04/schema#",
            "type": "object",
            "title": "empty object",
            "properties": this.processParams(action.requestParameterList),
            "required": []
          }
          const res_body = {
            "type": "object",
            "title": "empty object",
            "properties": this.processParams(action.responseParameterList),
            "required": []
          }
          const isRapGet = RequestMap[action.requestType] === 'GET'
          return {
            "query_path": {
              "path": action.requestUrl,
              "params": []
            },
            "edit_uid": 0,
            "status": "undone",
            "type": "static",
            "req_body_is_json_schema": true,
            "res_body_is_json_schema": true,
            "api_opened": false,
            "index": 0,
            "tag": [],
            // "_id": 672,
            "method": isRapGet ? 'POST' : RequestMap[action.requestType],
            // "catid": 11,
            "title": action.name,
            "path": action.requestUrl,
            // "project_id": 25,
            "req_params": [],
            "res_body_type": "json",
            // "uid": 31,
            "add_time": new Date().getTime(),
            "up_time": new Date().getTime(),
            "req_query": [],
            "req_headers": [],
            "req_body_form": [],
            "__v": 0,
            "desc": "<p>" + (isRapGet ? '[原来是GET] ' : '') + action.description + "</p>",
            "markdown": (isRapGet ? '[原来是GET] ' : '') + action.description,
            "req_body_type": "json",
            "req_body_other": JSON.stringify(reqParams),
            "res_body": JSON.stringify(res_body)
          }
        })
        categoryList.push({
          name: module.name + '-' + page.name,
          desc: module.introduction + page.introduction,
          list
        })
      })
    })

    return categoryList
  }
}

module.exports = Converter
