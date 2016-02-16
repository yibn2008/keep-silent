/*
* @Author: zoujie.wzj
* @Date:   2016-02-16 13:21:47
* @Last Modified by:   zoujie.wzj
* @Last Modified time: 2016-02-16 13:35:04
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
    }, 100)
  })
}

describe('Keep silent unit test', function () {
  it('should capture sync console', function () {
    let output = silent(function () {
      outputSync()
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
})
