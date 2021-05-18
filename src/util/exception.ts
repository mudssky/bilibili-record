// 重试函数，可以指定重试函数和重试的间隔时间,时间单位是毫秒
async function retryOnError(
  func,
  retryTimes: number = Infinity,
  interval: number = 0
) {
  let retryCount = 0
  try {
    await func()
  } catch (e) {
    retryCount += 1
    if (retryCount > retryTimes) {
      console.error(
        `exceed retry times，retry count is ${retryCount},error : ${e}`
      )
      return
    }
    if (interval !== 0) {
      setTimeout(async function () {
        console.error(`retryCount:${retryCount},${e}`)
        await retryOnError(func, retryTimes - 1, interval)
      }, interval)
    } else {
      console.error(`retryCount:${retryCount},${e}`)
      await retryOnError(func, retryTimes - 1, 0)
    }
  }
}

export { retryOnError }
