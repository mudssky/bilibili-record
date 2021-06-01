import fs from 'fs'
import { promisify } from 'util'
import { collectedRoomData } from '../bilibiliAPI/bilibiliLiveAPI'

interface roomData {
  roomID?: string
}
export interface configObj {
  roomList?: Array<roomData>
  fullRoomData?: Array<collectedRoomData>
}

// class RoomList  {
//     roomList:Array<roomData>
//     empty(): boolean {
//       if
//   }
// }
async function readConfig(configPath: string): Promise<configObj> {
  const readFilePromise = promisify(fs.readFile)
  let jsonData
  let jsonObj = {}
  try {
    jsonData = await readFilePromise(configPath)
  } catch (e) {
    console.log(e)
    // process.exit(1)
    return {}
  }
  // 解析json
  try {
    jsonObj = JSON.parse(jsonData)
  } catch (error) {
    console.log(`parse json failed,${error}`)
    process.exit(1)
  }
  return jsonObj
}
// 把全局的配置对象保存为json，每次修改全局配置文件的时候执行一次
async function saveConfig(path: string, configJSON: configObj): Promise<void> {
  const jsonStr = JSON.stringify(configJSON)
  const writeFilePromise = promisify(fs.writeFile)
  await writeFilePromise(path, jsonStr)
}
// 判断当前配置中是否已经有roomID，防止加入重复的roomID
function hasRoomID(configJSON: configObj, roomID: string): boolean {
  configJSON.roomList.forEach(function (item) {
    if (item.roomID === roomID) {
      return true
    }
  })
  return false
}
export default {
  readConfig,
  //   RoomList,
  saveConfig,
  hasRoomID,
}
