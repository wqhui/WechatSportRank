//index.js
const app = getApp()

Page({
  data: {
    avatarUrl: './user-unlogin.png',
    userInfo: {},
    logged: false,
    takeSession: false,
    requestResult: '',
    dataFieldB:2,
    todayStep:{ step: 4635, timestamp: 1562688000 },
    thisWeekStepSum:0,
    openid:'o6bld5TqZD9y-PEVYCQdV5ZqDnNI'
  },

  onLoad: function() {
    this.onGetUserMsg()//获得步数
    this.onGetOpenid()
    if (!wx.cloud) {
      wx.redirectTo({
        url: '../chooseLib/chooseLib',
      })
      return
    }

    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              console.log(res)
              this.setData({
                avatarUrl: res.userInfo.avatarUrl,
                userInfo: res.userInfo
              })
            }
          })
        }
      }
    })
  },

  onGetUserMsg:function(){
    var that = this
    wx.login({
      success(res) {
        if (res.code) {
          wx.getWeRunData({
            success: function (res) {
              that.onGetRunData(res)
            },
            fail: function (res) { },
          })
        } else {
          console.log('登录失败！' + res.errMsg)
        }
      }
    })

  },

  onGetRunData:function(param){
    //云函数获得当天微信运动步数
    let cloudId = wx.cloud.CloudID(param.cloudID)
    let now = new Date(); //当前日期
    let nowDayOfWeek = now.getDay(); //今天本周的第几天

    // wx.cloud.callFunction({
    //   name: 'weRun',
    //   data: {
    //     weRunData: cloudId
    //   },
    //   success: res => {
    //     let { result={} } = res
    //     let {event} = result
    //     let weRunData  = event && event.weRunData
    //     let stepInfoList = weRunData && weRunData.data.stepInfoList
    //     let todayStepInfo = stepInfoList[stepInfoList.length-1]
    //     let thisWeekStepList = stepInfoList.slice(stepInfoList.length - nowDayOfWeek)
    //     let thisWeekStepSum = 0
    //     thisWeekStepList.forEach((item)=>{
    //       thisWeekStepSum+=item.step
    //     })
    //     this.setData({
    //       todayStep: todayStepInfo,
    //       thisWeekStepSum: thisWeekStepSum
    //     })
    //   },
    //   fail: err => {
    //   }
    // })
  },

  onGetUserInfo: function(e) {
    if (!this.logged && e.detail.userInfo) {
      this.setData({
        logged: true,
        avatarUrl: e.detail.userInfo.avatarUrl,
        userInfo: e.detail.userInfo
      })
    }
  },

  onGetOpenid: function() {
    if (this.data.openid) return
    let that=this
    // 调用云函数
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        console.log('[云函数] [login] user openid: ', res.result.openid)
        app.globalData.openid = res.result.openid
        that.setData({
          openid: res.result.openid
        })
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)
        wx.showToast({
          icon: 'none',
          title: '获取 openid 失败，请重试',
        })
      }
    })
  },

  onQuery: function (enumType) {
    enumType = enumType != null ? enumType:0
    console.log(app.getStepType(enumType))
    // 查询当前用户所有的
    const dbc = app.getDataBaseCollect()
    dbc.where({
      _openid: this.data.openid
    }).get({
      success: res => {
        console.log('[数据库] [查询记录] 成功: ', res)
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '查询记录失败'
        })
      }
    })
  },
  

})
