const cloud = require('wx-server-sdk')
cloud.init()

const db = cloud.database()
const $ = db.command.aggregate
const _ = db.command

exports.main = async (event, context) => {
  let { con, orderField, orderType, isDebug, thisWeekFirstDay, lastWeekFirstDay } = event
  const dbc = db.collection('user')
  let orderDbc = dbc
  if (con) {
    orderDbc = dbc.where(
      con
    )
  }

  thisWeekFirstDay = 1563638400000 / 1000

  // _.and($.lt(['$$item.timestap', thisWeekFistDay ]), $.gte(['$$item.timestap', lastWeekFirstDay ]))

  return await orderDbc.limit(100).aggregate().project({
    steps: $.filter({
      input: '$steps',
      as: 'item',
      cond: $.gte(['$$item.timestap', thisWeekFistDay ])
    })
  }).project({
    total: $.sum('$steps')
  })
    .end()
    .orderBy('total', orderType).get()
}
