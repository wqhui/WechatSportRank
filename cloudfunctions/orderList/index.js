const cloud = require('wx-server-sdk')
cloud.init()

const db = cloud.database()

exports.main = async (event, context) => {
  let { con, orderField, orderType} =event
  const dbc = db.collection('user')
  let orderDbc = dbc
  if (con) {
    orderDbc = dbc.where(
      con
    )
  }

  return await orderDbc.orderBy(orderField, orderType).limit(100).get()
}