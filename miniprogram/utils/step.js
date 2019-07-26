var time = require('./time.js');

function getSteps(stepInfoList){
  let today = time.getThisDate()//时间凑
  today = today / 100

  let now = new Date() // 当前日期
  let nowDayOfWeek = now.getDay() // 今天本周的第几天

  let thisWeekDay = today - 60 * 60 * 24 * nowDayOfWeek
  let lastWeekDay = today - 60 * 60 * 24 * (nowDayOfWeek+7)






  dddsdsdsd

}