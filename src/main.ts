import Koa from 'koa'
import Router from 'koa-router'
import config, { configObj } from './config/config'
import _ from 'lodash'
const app = new Koa()
const router = new Router()
let GlobalRoomDdata: configObj
// console.log(GlobalRoomDdata.roomList, __dirname)
// app.use(async (ctx) => {
//   ctx.body = 'hello koa2'
// })
async function configInit() {
  GlobalRoomDdata = await config.readConfig(config.defaultConfigPath)
}
// 检查配置文件能读取到roomList属性，如果不能说明需要重新创建配置文件
function checkRoomData(): boolean {
  return Object.prototype.hasOwnProperty.call(GlobalRoomDdata, 'roomList')
}
;(async () => {
  await configInit()
  router.get('/hello', async (ctx, next) => {
    ctx.body = 'hello koa,nihao1'
    await next()
  })
  router.get('/addroom', async (ctx, next) => {
    // console.log(ctx.query)
    if (_.has(ctx.query, 'roomID')) {
      // if (checkRoomData()) {
      //   for (let item of GlobalRoomDdata.roomList) {
      //   if (item.roomID === parseInt(ctx.query.roomID)) {
      //   }
      //   }
      // }
      console.dir(ctx.query)
      console.log(`add new live room ${ctx.query.roomID}`)
    } else {
      console.error('invalid get param')
    }
    await next()
  })
  router.get('/getroomdata', async (ctx, next) => {
    if (checkRoomData()) {
      ctx.body = JSON.stringify(GlobalRoomDdata)
    } else {
      ctx.body = JSON.stringify({})
    }
    await next()
  })
  app.use(router.routes()).use(router.allowedMethods())

  app.listen(3000)
  console.log('[demo] start-quick is starting at port 3000')
})()
