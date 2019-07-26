function getThisDate () {
  let date = new Date()
  let year = date.getFullYear()
  let month = date.getMonth() + 1
  let day = date.getDate()
  console.log(formatDateToTimestap(year + '-' + month + '-' + 21))
  console.log(formatDateToTimestap(year + '-' + month + '-' + day))
  return formatDateToTimestap(year + '-' + month + '-' + day)
}

function formatDateToTimestap (time) {
  return Date.parse(time)
}
getThisDate()
module.exports = {
  getThisDate: getThisDate
}
