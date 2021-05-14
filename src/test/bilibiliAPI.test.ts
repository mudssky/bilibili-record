import { describe, it } from 'mocha'
import { expect } from 'chai'
import bilibiliLiveAPI from '../bilibiliAPI/bilibiliLiveAPI'

describe('bilibiliAPI', function () {
  describe('#getInitRoomData', function () {
    it('room data should have live_status ', async function () {
      const jsonData = await bilibiliLiveAPI.getRoomInitData('23010785')
      // console.log(jsonData)
      expect(jsonData)
        .to.be.an('object')
        .has.property('data')
        .has.property('live_status')
    })
  })

  describe('#getLiveStatus', function () {
    it('live_status should be 0,1,2', async function () {
      const liveStatus = await bilibiliLiveAPI.getLiveStatus('23089693')
      expect(liveStatus).to.be.within(0, 2)
    })
  })

  describe('#getRoomVideoData', function () {
    it('get room video data should get success code 0', async function () {
      const roomVideoDataJSON = await bilibiliLiveAPI.getRoomVideoData('870004')
      expect(roomVideoDataJSON).has.property('code', 0)
    })
  })

  describe('#parseRoomID', function () {
    it('test parse room url', async function () {
      const testList = [
        'https://live.bilibili.com/573893?hotRank=0&session_id=ed9c0aa80713d216_E1903362-B1C0-4BD2-AAC1-F2B37AF21212',
        '12345678',
      ]
      for (const roomURL of testList) {
        const roomID = await bilibiliLiveAPI.parseRoomID(roomURL)
        expect(roomID).match(/^\d+$/)
      }
    })
  })

  describe('parseFilenameTemplate', function () {
    it('validate parse filename template', async function () {
      const testTemplateList = [
        '{roomID}-{uname}/{date}-{time} {title} 自录.flv',
        '{hello},world',
      ]
      const roomData = await bilibiliLiveAPI.collectRoomData('21706862')
      for (const testTemplate of testTemplateList) {
        bilibiliLiveAPI.parseFilenameTemplate(testTemplate, roomData)
      }
    })
  })

  describe('collectRoomData', function () {
    it('collect room data validate', async function () {
      const roomData = await bilibiliLiveAPI.collectRoomData('21706862')
      console.log(roomData)
      const keyList = [
        'roomID',
        'uid',
        'liveTime',
        'roomStatus',
        'liveStatus',
        'spaceURL',
        'title',
        'cover',
        'online',
        'roomURL',
        'uname',
        'face',
        'followerNum',
        'date',
        'time',
      ]
      expect(roomData).has.keys(keyList)
      keyList.forEach(function (item) {
        expect(roomData[item]).not.to.be.an(
          'undefined',
          `${item} expected not to be undefined`
        )
      })
    })
  })
})
