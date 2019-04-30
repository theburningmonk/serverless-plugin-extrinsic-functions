# serverless-plugin-extrinsic-functions

Introduces additional Fn:: functions such as `Fn::StartsWith`.

For example, you can use it as part of CloudFormation Conditions:

```yml
resources:
  Conditions:
    StartsWithDev:
      Fn::StartsWith: [ dev-yan, dev ]
```

You can also use it elsewhere in your `serverless.yml` as well, such as in the `custom` clause many plugins rely on, or as part of your function definitions:

```yml
functions:
  hello:
    handler: handler.hello
    environment:
      STARTS_WITH_DEV:
        Fn::StartsWith: [ dev-yan, dev ]  # use in functions
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
