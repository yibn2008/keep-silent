/*
* @Author: zoujie.wzj
* @Date:   2016-02-04 19:32:03
* @Last Modified by:   zoujie.wzj
* @Last Modified time: 2016-02-16 14:18:31
*/

'use strict'

const capture = require('intercept-stdout')
const co = require('co')

class Log {
  constructor (cache) {
    this._cache = cache
    this._value = ''
  }

  _record (t) {
    this._value += t
  }

  get value () {
    return this._value
  }

  contains (part) {
    if (part instanceof RegExp) {
      return !!this._value.match(part)
    } else {
      return this._value.indexOf(part) >= 0
    }
  }

  flush () {
    let value = this._value

    this._value = ''
    this._cache.push(value)

    return value
  }

  clear () {
    this._cache.push(this._value)
    this._value = ''
  }
}

function silent (callback) {
  let cache = []
  let log = new Log(cache)

  let uncapture = capture(t => {
    log._record(t)
    return ''
  })

  let result, error

  try {
    result = callback(log)
  } catch (e) {
    error = e
  }

  if (callback.constructor.name === 'GeneratorFunction' || (result && result.then)) {
    return co(function * () {
      if (error) {
        uncapture()
        throw error
      }

      try {
        yield result
      } finally {
        uncapture()
        log.clear() // trigger cache.push
      }

      return cache.join('')
    })
  } else {
    uncapture()

    if (error) {
      throw error
    } else {
      log.clear() // trigger cache.push

      return cache.join('')
    }
  }
}

module.exports = silent
