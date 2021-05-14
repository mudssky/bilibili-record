function currentDateFormat(fmtStr: string) {
  const currentDate = new Date()
  const opt = {
    yyyy: currentDate.getFullYear(), // 年
    MM:
      currentDate.getMonth() + 1 < 10
        ? '0' + (currentDate.getMonth() + 1)
        : currentDate.getMonth() + 1, //
    dd:
      currentDate.getDate() < 10
        ? '0' + currentDate.getDate()
        : currentDate.getDate(), // 日
    hh:
      currentDate.getHours() < 10
        ? '0' + currentDate.getHours()
        : currentDate.getHours(), // 时
    mm:
      currentDate.getMinutes() < 10
        ? '0' + currentDate.getMinutes()
        : currentDate.getMinutes(), // 分
    ss:
      currentDate.getSeconds() < 10
        ? '0' + currentDate.getSeconds()
        : currentDate.getSeconds(), // 秒
    // 有其他格式化字符需求可以继续添加，
  }
  for (const key in opt) {
    const pattern = new RegExp(`${key}`, 'g')
    if (pattern.test(fmtStr)) {
      fmtStr = fmtStr.replace(pattern, opt[key] + '')
    }
  }
  //   console.log(opt)
  return fmtStr
}

export default { currentDateFormat }
