# serverless-plugin-extrinsic-functions

Introduces additional `Fn::` functions such as `Fn::StartsWith`.

## Install

Run npm install in your Serverless project.

```yml
$ npm install --save-dev serverless-plugin-extrinsic-functions
```

Add the plugin to your `serverless.yml` file

```yml
plugins:
  - serverless-plugin-extrinsic-functions
```

## How to use

This plugin lets you use a number of custom `Fn::` functions in the `serverless.yml` file. For example, you can use it as part of CloudFormation Conditions:

```yml
resources:
  Conditions:
    StartsWithDev:
      Fn::StartsWith: [ ${opt:stage}, dev ]
```

You can also use it elsewhere in your `serverless.yml` as well, such as in the `custom` clause many plugins rely on, or as part of your function definitions:

```yml
functions:
  hello:
    handler: handler.hello
    environment:
      STARTS_WITH_DEV:
        Fn::StartsWith: [ ${opt:stage}, dev ]  # use in functions
```

These are the functions that are current supported, and the javascript functions they map to:

- `Fn::StartsWith`: `([ input, prefix ]) => input.startsWith(prefix)`
- `Fn::EndsWith`: `([ input, suffix ]) => input.endsWith(suffix)`
- `Fn::Substr`: `([ input, from, length ]) => input.substr(from, length)`
- `Fn::Substring`: `([ input, start, end ]) => input.substring(start, end)`
- `Fn::RandomNumber`: `([ min, max ]) => Math.random() * (max - min) + min`
- `Fn::GreaterThan`: `([ x, y ]) => x > y`
- `Fn::LessThan`: `([ x, y ]) => x < y`
- `Fn::Max`: `([ x, y ]) => Math.max(x, y)`
- `Fn::Min`: `([ x, y ]) => Math.min(x, y)`
