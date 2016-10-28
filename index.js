/*
* @Author: zoujie.wzj
* @Date:   2016-02-04 19:32:03
* @Last Modified by:   zoujie.wzj
* @Last Modified time: 2016-09-27 18:00:55
*/

'use strict'

const capture = require('intercept-stdout')
const co = require('co')

const DEFAULT_OPTIONS = {
  errorOutput: true
}

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

/**
 * keep console silent
 *
 * @param  {Function} callback
 * @param  {Object}   opts
 *  - errorOutput: show output when error occurs
 * @return {Mixed}
 *  - {Promise} if callback is generator/promise function
 *  - {String} if callback is normal function
 */
function silent (callback, opts) {
  opts = Object.assign({}, DEFAULT_OPTIONS, opts)

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
      if (!error) {
        try {
          yield result
        } catch (e) {
          error = e
        }
      }
    }).then(() => {
      return fallback(error)
    })
  } else {
    return fallback(error)
  }

  function fallback (error) {
    uncapture()
    log.clear()

    let output = cache.join('')

    if (error) {
      if (opts.errorOutput) {
        // print log when error
        console.log('Output:\n-------------------\n%s\n-------------------', output)
      }

      throw error
    }

    return output
  }
}

module.exports = silent
