import { Command } from 'commander'
import bilibiliLiveAPI from '../bilibiliAPI/bilibiliLiveAPI'
import download from '../download/download'

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

program.parse(process.argv)
const options = program.opts()
if (options.debug) {
  console.log(options)
}
// 避免await顶层调用
;(async function () {
  console.log('roomid:', options.roomID)
  const [liveOptions, durlObj] = await Promise.all([
    bilibiliLiveAPI.collectRoomData(options.roomID),
    bilibiliLiveAPI.getRoomVideoData(options.roomID),
  ])
  console.log(liveOptions)
  console.log(durlObj.data.durl)
  if (durlObj.code === 0) {
    const durl = durlObj.data.durl
    if (durl) {
      download.downloadFlvStream(
        durl[0].url,
        bilibiliLiveAPI.parseFilenameTemplate(
          options.filenameTemplate,
          liveOptions
        )
      )
    }
  }
})()
