//app.js
const STEP_TYPE=['today','thisWeek','lastWeek']
App({
  onLaunch: function () {
    
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        traceUser: true,
      })
    }

    this.globalData = {}
  },
  getStepType:function(emu){//传 0 1 2,取不到则返回所有
    return STEP_TYPE[emu] || STEP_TYPE
  },
  getDataBaseCollect: function (env='steps'){
    const db = wx.cloud.database()
    return db.collection('steps')
  }
})
