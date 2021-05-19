import fetch from 'node-fetch'
import { createWriteStream } from 'fs'
import { pipeline } from 'stream'
import { promisify } from 'util'
import Progress from 'node-fetch-progress'
const streamPipeline = promisify(pipeline)
interface downloadOptions {
  streamURL: string
  roomID: string
}

async function downloadFlvStream(
  downloadOptions: downloadOptions,
  fileName: string
): Promise<void> {
  const response = await fetch(downloadOptions.streamURL)
  console.log(response)
  if (!response.ok) {
    throw new Error(`flv stream :unexpected response ${response.statusText}`)
  }
  response.body.on('error', function () {
    throw new Error('readable stream error')
  })
  const progress = new Progress(response, { throttle: 100 })
  progress.on('progress', (p) => {
    process.stdout.write(
      `downloaded ${p.doneh},elapesd time: ${Math.round(
        p.elapsed / 60
      )}min,download speed:${p.rateh}\r`
    )
    if (p.rateh === 0) {
      throw new Error('download speed is 0 ,retry...')
    }
  })
  progress.on('finish', function () {
    console.log('\ndownload finished')
  })
  await streamPipeline(response.body, createWriteStream(fileName))
}

export default {
  downloadFlvStream,
}
// console.log(
//   // p.total,直播流没有总大小
//   // p.done,已下载的内容 字节数
//   // p.totalh,总大小的带单位，
//   p.doneh,
//   // p.startedAt, 开始的时间戳
//   // 经过的时间,是当前时间减开始时间除1000,单位是秒
//   p.elapsed,
//   // p.rate,
//   p.rateh
//   // p.estimated,估计下载总时间,直播流估计不了
//   // p.progress 下载进度,在直播流下载中是没用的
//   // p.eta,估计剩余时间
//   // p.etah
//   // p.etaDate
// )
