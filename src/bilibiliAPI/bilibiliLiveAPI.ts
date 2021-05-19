import _ from 'lodash'
import myFetch from '../myFetch/myFetch'
import time from '../util/time'
/* eslint-disable camelcase */
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
interface roomData {
  roomID?: number
  uid?: number
  liveStatus?: number
  liveTime?: number
  roomStatus?: string
  spaceURL?: string
  title?: string
  cover?: string
  online?: number
  uname?: string
  face?: string
  followerNum?: number
  roomURL?: string
  date?: string
  time?: string
}
interface roomInfo {
  data?: {
    room_status?: string
    live_status?: number
    live_time?: number
    title?: string
    online?: number
    url?: string
    cover?: string
    link?: string
  }
}
interface roomInit {
  data?: {
    room_id: number
    uid?: number
    live_status?: number
    live_time?: number
  }
}

// interface userInfo {}
// 判断直播间是否处于直播状态，是否已经开播
async function isLiving(roomID: string): Promise<boolean> {
  const roomInitDataJSON = await getRoomInitData(roomID)
  if (_.has(roomInitDataJSON, 'data.live_status')) {
    if (roomInitDataJSON.data.live_status === liveStatus.直播中) {
      return true
    }
  }
  return false
}
// 获取直播间状态信息，一共有3种状态，详见 liveStatus枚举类型
async function getLiveStatus(roomID: string): Promise<liveStatus | void> {
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
async function getRoomInitData(roomID: string): Promise<roomInit> {
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
): Promise<any> {
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
    throw new Error(`parse room id failed,invalid roomURL:${roomURL}`)
  }
  // console.log(roomID)
  return roomID
}
// 这里用 {} 语法来显示提供的参数，将把{title}和里面的变量替换为实际的参数
function parseFilenameTemplate(
  templateStr: string,
  roomData: roomData
): string {
  let resFilename = templateStr
  const matchList = templateStr.matchAll(/{\s*([a-zA-Z]+)\s*}/g)
  for (const matchItem of matchList) {
    const roomOption = matchItem[1]
    // 判断是否存在对应的键值,如果存在直接替换
    if (Object.prototype.hasOwnProperty.call(roomData, roomOption)) {
      const replacePattern = new RegExp(`{s*${roomOption}s*}`)
      resFilename = resFilename.replace(replacePattern, roomData[roomOption])
    }
  }
  // console.log(resFilename)
  return resFilename
}

async function getRoomInfoByUID(uid: number): Promise<roomInfo> {
  const apiURL = `http://api.live.bilibili.com/room/v1/Room/getRoomInfoOld?mid=${uid}`
  const response = await myFetch(apiURL)
  const roomInfoObj = await response.json()
  return roomInfoObj
}
async function getUserInfo(uid: number): Promise<any> {
  const apiURL = `http://api.live.bilibili.com/live_user/v1/Master/info?uid=${uid}`
  const response = await myFetch(apiURL)
  const userInfo = await response.json()
  return userInfo
}
// 收集房间需要使用的各种信息，包括下载链接，房间标题以及各种文件名解析要用的信息
async function collectRoomData(
  roomID: string
  // qn: qualityCodePC = qualityCodePC.原画
): Promise<roomData> {
  const roomDataObj: roomData = {}
  const roomInitData = await getRoomInitData(roomID)
  const uid = roomInitData.data.uid
  const [roomInfoObj, userInfoObj] = await Promise.all([
    getRoomInfoByUID(uid),
    getUserInfo(uid),
  ])
  // 设置下载链接信息
  // 设置房间初始化信息
  roomDataObj.roomID = roomInitData.data.room_id
  roomDataObj.uid = roomInitData.data.uid
  roomDataObj.liveTime = roomInitData.data.live_time
  // 通过用户uid获取房间标题，封面等
  roomDataObj.roomStatus = roomInfoObj.data.room_status
  roomDataObj.liveStatus = roomInfoObj.data.live_status
  roomDataObj.spaceURL = roomInfoObj.data.url
  roomDataObj.title = roomInfoObj.data.title
  roomDataObj.cover = roomInfoObj.data.cover
  roomDataObj.online = roomInfoObj.data.online
  roomDataObj.roomURL = roomInfoObj.data.link
  // 设置用户相关信息
  roomDataObj.uname = userInfoObj.data.info.uname
  roomDataObj.face = userInfoObj.data.info.face
  roomDataObj.followerNum = userInfoObj.data.follower_num
  // 设置时间
  roomDataObj.date = time.currentDateFormat('yyyyMMdd')
  roomDataObj.time = time.currentDateFormat('hhmmss')
  return roomDataObj
}

async function wacthRoom(
  options: {
    roomID: string
    interval: number
  },
  roomMap: { [x: string]: boolean },
  callback: { (): Promise<void> }
): Promise<void> {
  // 用一个map存放当前房间的录制状况，初始值是false，也就是没开始录制
  // 之后开始录制会把这个值设置成true，录制完成时会设置这个值为false，
  // 所以当这个值为true的时候时录制中，这时不进行检查
  // 默认值是6分钟检测一次

  // 初次检测，如果是直播状态就执行下载，反之进入定时器轮询
  const fn = async function () {
    if (roomMap[options.roomID]) {
      console.log('\nrecording... skip check ')
      return
    }
    // 如果，roomMap已经不是true了，此时再次检测房间状态
    if (isLiving(options.roomID)) {
      console.log('\nstart recording...')
      roomMap[options.roomID] = true
      await callback()
      roomMap[options.roomID] = false
      console.log('\nfinish recoring, watching...')
    } else {
      console.log('not on living, keep watching...')
    }
  }
  setInterval(fn, options.interval)
  // 第一次直接执行,setInterval默认第一次会先延迟
  await fn()
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
  wacthRoom,
}
// export { getRoomInitData }
// testsdadas
