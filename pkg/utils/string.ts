export function strToTitleCase(str: string) {
  return str.replace(/\w\S*/g, (txt) => {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  })
}

export function strSpaceToUnderscore(str: string) {
  return str.replace (/ /g, '_')
}
