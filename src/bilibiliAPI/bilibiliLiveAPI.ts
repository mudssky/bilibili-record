import _ from 'lodash'
import myFetch from '../myFetch/myFetch'
import time from '../util/time'
enum liveStatus {
  '直播中' = 1,
  '轮播中' = 2,
  '未开播' = 0,
}
enum qualityCodePC {
  '原画' = 10000,
  '蓝光' = 400,
  '超清' = 250,
  '高清' = 150,
  '流畅' = 80,
}
// 判断直播间是否处于直播状态，是否已经开播
async function isLiving(roomID: string) {
  const roomInitDataJSON = await getRoomInitData(roomID)
  if (_.has(roomInitDataJSON, 'data.live_status')) {
    if (roomInitDataJSON.data.live_status === liveStatus.直播中) {
      return true
    }
  }
  return false
}
// 获取直播间状态信息，一共有3种状态，详见 liveStatus枚举类型
async function getLiveStatus(roomID: string) {
  const roomInitDataJSON = await getRoomInitData(roomID)
  if (_.has(roomInitDataJSON, 'data.live_status')) {
    const curLiveStatus = roomInitDataJSON.data.live_status
    if (curLiveStatus in liveStatus) {
      return curLiveStatus
    }
    throw new Error('invalid live status')
  }
  throw new Error('live status not found')
}

// 获取房间页面初始化信息
async function getRoomInitData(roomID: string, fetchConfig: object = {}) {
  const apiURL = `http://api.live.bilibili.com/room/v1/Room/room_init?id=${roomID}`
  const response = await myFetch(apiURL)
  const resJSON = await response.json()
  if (resJSON.code === 0) {
    return resJSON
  } else {
    throw new Error('live room not found')
  }
}

// 获取视频下载地址相关信息
async function getRoomVideoData(
  roomID: string,
  qn: qualityCodePC = qualityCodePC.原画
) {
  const apiURL = `http://api.live.bilibili.com/room/v1/Room/playUrl?cid=${roomID}&qn=${qn}&platform=web`
  const response = await myFetch(apiURL)
  const responseJSON = await response.json()
  return responseJSON
}

// 从输入字符串中解析出房间号 https://live.bilibili.com/23043489?hotRank=0&session_id=ed9c0aa80713d216_23BB76B8-ABF3-4A94-94E4-7519D261A621
function parseRoomID(roomURL: string): string {
  const roomIDPattern = /^(\d+)$/
  const roomURLPattern = /live.bilibili.com\/(\d+)/
  let roomID = ''
  if (roomIDPattern.test(roomURL)) {
    roomID = roomURL.match(roomIDPattern)[1]
  } else if (roomURLPattern.test(roomURL)) {
    roomID = roomURL.match(roomURLPattern)[1]
  } else {
    throw new Error('parse room id failed,invalid roomURL')
  }
  // console.log(roomID)
  return roomID
}
//这里用 {} 语法来显示提供的参数，将把{title}和里面的变量替换为实际的参数
function parseFilenameTemplate(templateStr: string, roomData: object) {
  let resFilename = templateStr
  const matchList = templateStr.matchAll(/{\s*([a-zA-Z]+)\s*}/g)
  for (const matchItem of matchList) {
    const roomOption = matchItem[1]
    // 判断是否存在对应的键值,如果存在直接替换
    if (roomData.hasOwnProperty(roomOption)) {
      const replacePattern = new RegExp(`{s*${roomOption}s*}`)
      resFilename = resFilename.replace(replacePattern, roomData[roomOption])
    }
  }
  // console.log(resFilename)
  return resFilename
}

async function getRoomInfoByUID(uid: string): Promise<object> {
  const apiURL = `http://api.live.bilibili.com/room/v1/Room/getRoomInfoOld?mid=${uid}`
  const response = await myFetch(apiURL)
  const roomInfoObj = await response.json()
  return roomInfoObj
}
async function getUserInfo(uid: string) {
  const apiURL = `http://api.live.bilibili.com/live_user/v1/Master/info?uid=${uid}`
  const response = await myFetch(apiURL)
  const userInfo = await response.json()
  return userInfo
}
// 收集房间需要使用的各种信息，包括下载链接，房间标题以及各种文件名解析要用的信息
async function collectRoomData(
  roomID: string,
  qn: qualityCodePC = qualityCodePC.原画
): Promise<object> {
  const roomDataObj = {}
  const roomInitData = await getRoomInitData(roomID)
  const uid = roomInitData['data']['uid']
  const [roomInfoObj, userInfoObj] = await Promise.all([
    getRoomInfoByUID(uid),
    getUserInfo(uid),
  ])
  // 设置下载链接信息
  // 设置房间初始化信息
  roomDataObj['roomID'] = roomInitData['data']['room_id']
  roomDataObj['uid'] = roomInitData['data']['uid']
  roomDataObj['liveTime'] = roomInitData['data']['live_time']
  //通过用户uid获取房间标题，封面等
  roomDataObj['roomStatus'] = roomInfoObj['data']['roomStatus']
  roomDataObj['liveStatus'] = roomInfoObj['data']['liveStatus']
  roomDataObj['spaceURL'] = roomInfoObj['data']['url']
  roomDataObj['title'] = roomInfoObj['data']['title']
  roomDataObj['cover'] = roomInfoObj['data']['cover']
  roomDataObj['online'] = roomInfoObj['data']['online']
  roomDataObj['roomURL'] = roomInfoObj['data']['link']
  // 设置用户相关信息
  roomDataObj['uname'] = userInfoObj['data']['info']['uname']
  roomDataObj['face'] = userInfoObj['data']['info']['face']
  roomDataObj['followerNum'] = userInfoObj['data']['follower_num']
  // 设置时间
  roomDataObj['date'] = time.currentDateFormat('yyyyMMdd')
  roomDataObj['time'] = time.currentDateFormat('hhmmss')
  return roomDataObj
}

export default {
  getLiveStatus,
  getRoomInitData,
  getRoomVideoData,
  getUserInfo,
  collectRoomData,
  parseRoomID,
  isLiving,
  parseFilenameTemplate,
  liveStatus,
  qualityCodePC,
}
// export { getRoomInitData }
