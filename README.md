# keep-silent

Keep console silent.

The output `console.log` may disturb normal testing log when you test some code which contains console output, **keep-silent** will help you to solve it.

Example usage:

```javascript
const silent = require('keep-silent')
const assert = require('assert')

function output() {
  console.log('output some console logs for user')
  console.log('CATCH ME!')
}

silent(function (log) {
  output()

  assert(log.contains('CATCH ME'))
})
```

The silent function will capture console logs of it's callback, you can access caputred logs by param `log`.

## Synopsis

```
Promise<String>|String silent(callback)
```

**Arguments**

The `callback` can be a normal function or a generator function, you can return a `Promise` when your callback is async. Callback contains one parameter `log`, which has methods (see next section) for processing logs.

For async useage, we suggest use generator in slient callback just like co does:

```
slient(function * (log) {
  yield async1()
  assert(log.flush() === 'foo')

  yield async2()
  assert(log.flush() === 'bar')
})
```

**Return**

If callback is *sync*, the return value will be full captured logs `String`. If callback is *async* (return Promise or Generator function), the return value will be a Promise with full captured logs `String`.

The captured logs will NOT lose even if you have called `log.clear()` or `log.flush()`.

### `log`

The methods and props of callback parameter `log`:

**log.clear()**

Clear captured logs, the *log.value* will be a empty `String`.

**log.contains(part)**

Whether logs contain specified string, the *part* can be a `String` or `RegExp` object.

**log.flush()**

Clear captured logs and return it, the *log.value* will be a empty `String`.

**log.value**

Current captured logs.

## Example

Keep some function slient:

```
const silent = require('keep-silent')

// keep silent (sync case)
silent(function () {
  outputSync('bla bla bla ....')
})

// keep silent (async)
silent(function () {
  return outputPromise('do some async work ...')
}).then(function (captured) {
  // do what you like
})

// keep silent (generator)
silent(function * () {
  yield outputAsync('do some async work ...')
}).then(function (captured) {
  // do what you like
})
```

Capture logs for unit test (with mocha):

```
const assert = require('assert')
const silent = require('keep-silent')

function outputSync() {
  console.log('hello')
}

function outputAsync() {
  return new Promise(resolve => {
    setTimeout(_ => {
      console.log('world')
      resolve()
    }, 100)
  })
}

function dump() {
  console.log('just dump annoyed text .... HAHAHA LALALA')
}

describe('Testing for demo', function () {
  it('should output hello', function () {
    silent(function (log) {
      outputSync()
      assert(log.flush() === 'hello\n')

      dump()
      assert(log.contains('HAHAHA'))
    })
  })

  it('should output world', function () {
    return silent(function * (log) {
      yield outputAsync()
      assert(log.value === 'world\n')
    })
  })
})
```

## License

[MIT](LICENSE)
