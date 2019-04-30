const functions = {
  'Fn::StartsWith': ([ input, prefix ]) => input.startsWith(prefix),
  'Fn::EndsWith': ([ input, suffix ]) => input.endsWith(suffix),
  'Fn::Substr': ([ input, from, length ]) => input.substr(from, length),
  'Fn::Substring': ([ input, start, end ]) => input.substring(start, end),
  'Fn::RandomNumber': ([ min, max ]) => Math.random() * (max - min) + min,
  'Fn::GreaterThan': ([ x, y ]) => x > y,
  'Fn::LessThan': ([ x, y ]) => x < y,
  'Fn::Max': ([ x, y ]) => Math.max(x, y),
  'Fn::Min': ([ x, y ]) => Math.min(x, y)
}

class ExtrinsicFunctionsPlugin {
  constructor (serverless, options) {
    this.serverless = serverless
    this.log = (msg, ...args) => serverless.cli.consoleLog(`serverless-plugin-extrinsic-functions: ${msg}`, ...args)

    // see https://gist.github.com/HyperBrain/50d38027a8f57778d5b0f135d80ea406
    // for available lifecycle hooks
    this.hooks = {
      'after:package:initialize': this.executeExtrinsicFunctions.bind(this)
    }
  }

  executeExtrinsicFunctions () {
    this.findAndExecuteFunction(this.serverless, this.log)
  }

  isCircularRef (key, path) {
    return path.split('.').includes(key)
  }

  isCondition (path) {
    return path.includes('resources.Conditions')
  }

  findAndExecuteFunction (obj, log, path = 'serverless', update) {
    if (typeof obj !== 'object') {
      return
    }

    for (let key in obj) {
      const newPath = `${path}.${key}`

      if (this.isCircularRef(key, path)) {
        continue
      }

      const value = obj[key]

      // depth-first
      if (Array.isArray(value)) {
        for (let idx in value) {
          this.findAndExecuteFunction(
            value[idx],
            log,
            newPath + `.${idx}`,
            (newValue) => { value[idx] = newValue })
        }
      } else if (typeof value === 'object') {
        this.findAndExecuteFunction(
          value,
          log,
          newPath,
          (newValue) => { obj[key] = newValue })
      }

      if (key.startsWith('Fn::') && functions[key]) {
        const fn = functions[key]
        log(`executing function [${key}]...
    path: ${newPath}
    function: [${fn}]
    input: [${value}]`)
        const newValue = fn(value)

        // is this function part of a Condition? if so, we need to wrap it...
        // because unfortunately CFN only allows conditions to be expressed with its
        // condition functions, hence wrapping with Fn::Equals
        if (this.isCondition(path)) {
          update({
            'Fn::Equals': [ 'true', `${newValue}` ]
          })
        } else {
          update(newValue)
        }
      }
    }
  }
}

module.exports = ExtrinsicFunctionsPlugin
