import Koa from 'koa'
import Router from 'koa-router'
import config, { configObj } from './config/config'
import _ from 'lodash'
import path from 'path'
import bilibiliLiveAPI from './bilibiliAPI/bilibiliLiveAPI'

const app = new Koa()
const router = new Router()

const defaultConfigPath = path.join(__dirname, 'config.json')
let GlobalConfigData: configObj
// console.log(GlobalRoomDdata.roomList, __dirname)
// app.use(async (ctx) => {
//   ctx.body = 'hello koa2'
// })
async function configInit(): Promise<void> {
  console.log(defaultConfigPath)
  try {
    GlobalConfigData = await config.readConfig(defaultConfigPath)
  } catch (e) {
    console.log('test')
    console.log(defaultConfigPath)

    console.log(e)
  }
  // 初始化数组
  if (!_.has(GlobalConfigData, 'roomList')) {
    GlobalConfigData.roomList = []
  }
  if (!_.has(GlobalConfigData, 'fullRoomData')) {
    GlobalConfigData.fullRoomData = []
  }
}
async function addRoom(roomIDParam: string[] | string) {
  const roomIDs = []
  if (typeof roomIDParam === 'string') {
    roomIDs.push(roomIDParam)
  } else if (roomIDParam instanceof Array) {
    roomIDs.push(...roomIDParam)
  } else {
    throw new Error('invalid roomIDParam')
  }
  console.log(`parse new live room ${roomIDs}`)
  // await roomIDs.forEach(async function (value) {
  for (let i = 0; i < roomIDs.length; i++) {
    const currentValue = roomIDs[i]
    if (currentValue.match(/^\d+$/)) {
      // 如果是已经在列表中的roomID就不进行操作了。
      if (config.hasRoomID(GlobalConfigData, currentValue)) {
        console.log(`this roomid is already in list,roomid:${currentValue}`)
        continue
      }
      const roomExist = await bilibiliLiveAPI.roomIsExist(currentValue)
      if (roomExist) {
        GlobalConfigData.roomList.push({ roomID: currentValue })
        const roomData = await bilibiliLiveAPI.collectRoomData(currentValue)
        GlobalConfigData.fullRoomData.push(roomData)
        config.saveConfig(defaultConfigPath, GlobalConfigData)
      } else {
        console.log(`this roomID is not exist,roomID:${currentValue}`)
      }
    } else {
      console.log(
        `invalid room id format,roomid should be a number,currentID:,${currentValue}`
      )
    }
  }
}
// 检查配置文件能读取到roomList属性，如果不能说明需要重新创建配置文件
function checkRoomData(): boolean {
  return Object.prototype.hasOwnProperty.call(GlobalConfigData, 'roomList')
}
async function deleteRoom(roomIDParam: string[] | string) {
  const roomIDs = []
  if (typeof roomIDParam === 'string') {
    roomIDs.push(roomIDParam)
  } else if (roomIDParam instanceof Array) {
    roomIDs.push(...roomIDParam)
  } else {
    throw new Error('invalid roomIDParam')
  }
  console.log(`parse new live room to delete: ${roomIDs}`)

  for (let i = 0; i < roomIDs.length; i++) {
    const currentValue = roomIDs[i]
    if (currentValue.match(/^\d+$/)) {
      // 如果是不在列表中的roomID就不进行操作了。
      console.log(GlobalConfigData)
      if (!config.hasRoomID(GlobalConfigData, currentValue)) {
        console.log(
          `delete failed ,this roomid is not in list,roomid:${currentValue}`
        )
        continue
      }
      // 遍历两个列表，删除对应的数据
      GlobalConfigData.roomList.forEach(function (item, index) {
        if (item.roomID === currentValue) {
          GlobalConfigData.roomList.splice(index, 1)
        }
      })
      GlobalConfigData.fullRoomData.forEach(function (item, index) {
        if (item.roomID === parseInt(currentValue)) {
          GlobalConfigData.fullRoomData.splice(index, 1)
        }
      })
      console.log(`delete room ${currentValue} succeed`)
    } else {
      console.log(
        `invalid room id format,roomid should be a number,currentID:,${currentValue}`
      )
    }
  }
}
;(async () => {
  await configInit()
  router.get('/hello', async (ctx, next) => {
    ctx.body = 'hello koa,nihao1'
    await next()
  })
  router.get('/addroom', async (ctx, next) => {
    if (_.has(ctx.query, 'roomID')) {
      // 处理query字符串解析的两种情况
      await addRoom(ctx.query.roomID)
    } else {
      console.error('invalid get param')
    }
    await next()
  })
  router.get('/getroomdata', async (ctx, next) => {
    if (checkRoomData()) {
      ctx.body = JSON.stringify(GlobalConfigData)
    } else {
      ctx.body = JSON.stringify({})
    }
    await next()
  })
  router.get('/deleteroom', async (ctx, next) => {
    if (_.has(ctx.query, 'roomID')) {
      // 处理query字符串解析的两种情况
      await deleteRoom(ctx.query.roomID)
    } else {
      console.error('invalid get param')
    }
    await next()
  })
  app.use(router.routes()).use(router.allowedMethods())

  app.listen(3000)
  console.log('[demo] start-quick is starting at port 3000')
})()
