/*
* @Author: zoujie.wzj
* @Date:   2016-02-16 13:21:47
* @Last Modified by:   zoujie.wzj
* @Last Modified time: 2016-02-16 14:35:25
*/

'use strict'

const assert = require('assert')
const silent = require('.')

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

      // log.clear
      log.clear()
      assert(!log.value)
    })

    assert.equal(output, 'aaa\nbiu biu ...\n')
  })

  it('should able to capture log when execute exception', function () {
    let oldWrite = process.stdout.write

    return silent(function * () {
      console.log('lalala')
      throw new Error('test')
    }).catch(function () {
      assert(process.stdout.write, oldWrite)
    })
  })
})
