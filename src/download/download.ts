import fetch from 'node-fetch'
import { createWriteStream } from 'fs'
import { pipeline } from 'stream'
import { promisify } from 'util'

const streamPipeline = promisify(pipeline)

async function downloadFlvStream(streamURL: string, fileName: string) {
  const response = await fetch(streamURL)
  console.log(response)
  if (!response.ok) {
    throw new Error(`flv stream :unexpected response ${response.statusText}`)
  }
  await streamPipeline(response.body, createWriteStream(fileName))
}

async function liveProgress() {}

export default {
  downloadFlvStream,
  liveProgress,
}
