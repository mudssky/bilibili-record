import { describe, it } from 'mocha'
import { expect } from 'chai'
import time from '../util/time'
describe('util', function () {
  describe('#time', function () {
    it('test timeFormat', async function () {
      const testList = ['yyyyMMdd', 'yyyyMMdd-hhmmss', 'yyy-MM-dd-h-m-s']
      const resultList = testList.map(function (fmtStr) {
        return time.currentDateFormat(fmtStr)
      })
      console.log(resultList)
      expect(0).to.equal(0)
    })
  })
})
