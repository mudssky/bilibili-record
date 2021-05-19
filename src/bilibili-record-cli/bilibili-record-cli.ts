import { Command } from 'commander'
import bilibiliLiveAPI from '../bilibiliAPI/bilibiliLiveAPI'
import download from '../download/download'
import { retryOnError } from '../util/exception'
import fs from 'fs'
import path from 'path'
import { promisify } from 'util'
const program = new Command()
program.version('0.0.1')

program
  .option('-d, --debug', 'output extra debugging')
  .requiredOption(
    '-r, --roomID <roomID>',
    '主播的房间号，或者房间url',
    bilibiliLiveAPI.parseRoomID
  ) // 解析房间号的函数可以解析url为房间号，如果解析失败会抛出错误
  .option('-o, --output-filename <filename>', '文件名,如果不指定会自动生成')
  .option(
    '-t --filename-template <template>',
    '下载文件名的模板,使用{}方式来替换参数，可选参数有roomID,uid,liveTime,title,online,uname,followerNum,date,time',
    '{date}-{time} {title}.flv'
  )
  .option(
    '-dir --download-dir <path>',
    '下载直播流存放的目录',
    '{roomID}-{uname}'
  )
  .option(
    '-rt --retry-times <number>',
    '下载中出现错误后重试的次数',
    cliParseInt,
    100
  )
  .option(
    '-ri --retry-interval <millisseconds>',
    '下载出错重试的时间间隔',
    cliParseInt,
    100
  )
  .option(
    '-w --watch',
    '开启监视模式,每隔一段时间检测看是否开播，开播了就启动录制',
    true
  )
  .option(
    '-wi --watch-interval <milliseconds>',
    '监听时请求的时间间隔,单位时毫秒,默认是6分钟',
    cliParseInt,
    1000 * 60 * 6
  )
function cliParseInt(value: string) {
  return parseInt(value)
}
// 全局变量，存放监控的房间是否处于开播状态
const roomMap: { [x: string]: boolean } = {}
program.parse(process.argv)
const options = program.opts()
if (options.debug) {
  console.log(options)
}
// 避免await顶层调用
async function main() {
  const [liveOptions, durlObj] = await Promise.all([
    bilibiliLiveAPI.collectRoomData(options.roomID),
    bilibiliLiveAPI.getRoomVideoData(options.roomID),
  ])
  if (options.debug) {
    console.log('live options:')
    console.dir(liveOptions)
    console.log('durl:')
    console.dir(durlObj.data.durl)
  }
  if (durlObj.code === 0) {
    const durl = durlObj.data.durl
    const downloadFN = async function () {
      const filename = await bilibiliLiveAPI.parseFilenameTemplate(
        options.filenameTemplate,
        liveOptions
      )
      const downloadDir = await bilibiliLiveAPI.parseFilenameTemplate(
        options.downloadDir,
        liveOptions
      )
      const mkdirPromise = promisify(fs.mkdir)
      try {
        await mkdirPromise(downloadDir)
      } catch (e) {
        console.log(e)
      }
      const filePath = path.join(downloadDir, filename)
      await download.downloadFlvStream(
        {
          streamURL: durl[0].url,
          roomID: options.roomID,
        },
        filePath
      )
    }

    if (durl) {
      await retryOnError(downloadFN, options.retryTimes, 100)
    } else {
      console.error(`请求失败，durl${durl}`)
    }
  } else {
    console.error('请求durl失败')
  }
}

;(async () => {
  await bilibiliLiveAPI.wacthRoom(
    { roomID: options.roomID, interval: options.watchInterval },
    roomMap,
    main
  )
})()

// console.log(typeof main)
