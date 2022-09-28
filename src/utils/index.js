export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}


export function hideStr(str, startLen, endLen) {
  if (!str || !str.length) return ''
  if (str.length < startLen + endLen) return str
  return (
    str.substring(0, startLen) + '****' + str.substring(str.length - endLen)
  )
}