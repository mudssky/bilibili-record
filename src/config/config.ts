import path from 'path'
import fs from 'fs'
import { promisify } from 'util'
const defaultConfigPath = path.join(__dirname, 'config.json')

interface roomData {
  roomID?: number
}
export interface configObj {
  roomList?: Array<roomData>
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
    // return {}
  }
  return jsonObj
}

export default {
  readConfig,
  defaultConfigPath,
  //   RoomList,
}
