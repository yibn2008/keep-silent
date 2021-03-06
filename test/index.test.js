/*
* @Author: zoujie.wzj
* @Date:   2016-02-16 13:21:47
* @Last Modified by:   zoujie.wzj
* @Last Modified time: 2016-09-27 18:03:03
*/

'use strict'

const assert = require('assert')
const chalk = require('chalk')
const stripAnsi = require('strip-ansi')
const silent = require('..')

function outputSync () {
  console.log('hello')
}

function outputAsync () {
  return new Promise(resolve => {
    setTimeout(_ => {
      console.log('world')
      resolve()
    }, 10)
  })
}

describe('Keep silent unit test', function () {
  it('should capture sync console', function () {
    // capture will replace stdout.write
    let oldWrite = process.stdout.write

    let output = silent(function () {
      outputSync()

      assert.notEqual(process.stdout.write, oldWrite)
    })

    assert.equal(output, 'hello\n')
  })

  it('should capture async console', function () {
    return silent(function () {
      return outputAsync()
    }).then(output => {
      assert.equal(output, 'world\n')
    })
  })

  it('should parameter `log` work', function () {
    let output = silent(function (log) {
      // log.flush
      console.log('aaa')
      assert.equal(log.value, 'aaa\n')
      assert.equal(log.flush(), 'aaa\n')
      assert(!log.value)

      // log.contains
      console.log('biu biu ...')
      assert(!log.contains('aaa'))
      assert(log.contains('biu'))

      // log.contains with strip ansi
      console.log('a' + chalk.red('b') + 'c')
      assert(!log.contains('abc'))
      assert(log.contains('abc', true))

      // log.clear
      log.clear()
      assert(!log.value)
    })

    assert.equal(stripAnsi(output), 'aaa\nbiu biu ...\nabc\n')
  })

  it('should able to capture log when execute exception', function () {
    return silent(function * (log) {
      let oldWrite = process.stdout.write
      let error

      try {
        yield silent(function * () {
          console.log('lalala')
          throw new Error('test')
        })
      } catch (e) {
        error = e
      }

      assert(process.stdout.write, oldWrite)
      assert(log.contains('lalala'))
      assert(error instanceof Error)
    }, { errorOutput: false })
  })
})
