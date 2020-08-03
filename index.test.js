const Serverless = require('serverless/lib/Serverless')
const AwsProvider = require('serverless/lib/plugins/aws/provider/awsProvider')
const CLI = require('serverless/lib/classes/CLI')
const ExtrinsicFunctionsPlugin = require('./index')

let serverless
let extrinsicFunctions
let hook = 'after:package:initialize'

beforeEach(() => {
  serverless = new Serverless()
  serverless.service.service = 'hello-world'
  const options = {
    stage: 'dev',
    region: 'us-east-1'
  }
  serverless.setProvider('aws', new AwsProvider(serverless))
  serverless.cli = new CLI(serverless)
  extrinsicFunctions = new ExtrinsicFunctionsPlugin(serverless, options)
})

test('it can be used in custom', () => {
  const json = JSON.stringify({
    nested: {
      field: 42
    }
  })
  serverless.service.custom = {
    StartsWithDev: {
      'Fn::StartsWith': [ 'dev-yan', 'dev' ]
    },
    JsonNestedField: {
      'Fn::JsonPath': [ json, 'nested.field' ]
    }
  }
  extrinsicFunctions.hooks[hook]()
  expect(serverless.service.custom.StartsWithDev).toBe(true)
  expect(serverless.service.custom.JsonNestedField).toBe(42)
})

test('it can be used in function', () => {
  serverless.service.functions = {
    hello: {
      handler: 'handler.hello',
      environment: {
        StartsWithDev: {
          'Fn::StartsWith': [ 'dev-yan', 'dev' ]
        }
      }
    }
  }
  extrinsicFunctions.hooks[hook]()
  expect(serverless.service.functions.hello.environment.StartsWithDev).toBe(true)
})

test('it can be used in resources.Conditions', () => {
  serverless.service.resources.Conditions = {
    StartsWithDev: {
      'Fn::StartsWith': [ 'dev-yan', 'dev' ]
    }
  }
  extrinsicFunctions.hooks[hook]()
  expect(serverless.service.resources.Conditions.StartsWithDev).toEqual({
    'Fn::Equals': [ 'true', 'true' ]
  })
})

test('it can be used in an array', () => {
  const json = JSON.stringify({
    nested: {
      field: 42
    }
  })
  serverless.service.custom = {
    array: [
      { 'Fn::StartsWith': [ 'dev-yan', 'yan' ] },
      { 'Fn::EndsWith': [ 'dev-yan', 'yan' ] },
      { 'Fn::Substr': [ 'dev-yan', 0, 3 ] },
      { 'Fn::Substring': [ 'dev-yan', 4, 7 ] },
      { 'Fn::GreaterThan': [ 4, 7 ] },
      { 'Fn::LessThan': [ 4, 7 ] },
      { 'Fn::Max': [ 4, 7 ] },
      { 'Fn::Min': [ 4, 7 ] },
      { 'Fn::JsonPath': [ json, 'nested.field' ] },
      { 'Fn::JsonPath': [ json, 'this.path.does.not.exist', 'defaultValue' ] }
    ]
  }
  extrinsicFunctions.hooks[hook]()
  expect(serverless.service.custom).toEqual({
    array: [
      false,
      true,
      'dev',
      'yan',
      false,
      true,
      7,
      4,
      42,
      'defaultValue'
    ]
  })
})
