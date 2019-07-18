// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
const db = cloud.database()

exports.main = async (event, context) => {
  console.log(event)

  let { con, data } = event
  try {
    return await db.collection('user').where(
      { _openid: openid}
    ).update({
      data: data
    })
  } catch (e) {
    console.error(e)
  }
}

