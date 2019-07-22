//app.js
const STEP_TYPE=['today','thisWeek','lastWeek']
App({
  onLaunch: function (options) {
    
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        traceUser: true,
      })
    }
    console.log(options.shareTicket)
    this.globalData = {
      shareTicket: options.shareTicket
    }
  },
  onShow:function(options) {
    if (options.shareTicket){
      this.globalData = {
        shareTicket: options.shareTicket
      }
    }
  },
  getStepType:function(emu){//传 0 1 2,取不到则返回所有
    return STEP_TYPE[emu] || STEP_TYPE
  }
})
