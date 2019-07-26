// index.js
const app = getApp()
var util = require('../../utils/time.js');
Page({
  data: {
    avatarUrl: '/pages/index/user-unlogin.png',
    userInfo: {},
    logged: true,
    takeSession: false,
    requestResult: '',
    todayStep: 0,
    thisWeekStepSum: 0,
    lastWeekStepSum: 0,
    openid: '',
    rankList: [],
    stepRank: 0,
    activeIndex: 0,
    titleNames: ['本周', '上周'],
    orderFields: ['thisWeekStep', 'lastWeekStep'],
    openGId: ''
  },
  onLoad: function (option) {
    // wx.showLoading({
    //   title: '加载中...',
    // })
    wx.updateShareMenu({
      withShareTicket: true,
    })
    //this.onGetGroupOpenid()  //group id
    const cb = () => {
      //获取用户信息
      // wx.getUserInfo({
      //   success: res => {
      //     this.setData({
      //       avatarUrl: res.userInfo.avatarUrl,
      //       userInfo: res.userInfo,
      //       logged: true
      //     })
      //     this.onGetUserMsg()
      //   },
      //   fail: err => {
      //     this.setData({
      //       logged: false
      //     })
      //     this.onQueryOrderBy('', orderFields[activeIndex], 'desc')
      //   }
      // })
    }
    this.onGetOpenid(cb)
    let { activeIndex, orderFields } = this.data
  },

  onPullDownRefresh: function () {
    if (this.data.logged) {
      this.onGetUserMsg()
      return
    }
    // 获取用户信息
    let stopCb = () => wx.stopPullDownRefresh()
    wx.getUserInfo({
      success: res => {
        this.setData({
          avatarUrl: res.userInfo.avatarUrl,
          userInfo: res.userInfo,
          logged: true
        })
        this.onGetUserMsg(stopCb)
      },
      fail: err => {
        this.setData({
          logged: false
        })
      }
    })
  },

  onShareAppMessage: function () {
    return {
      title: '在群里你本周步数排名这么高！？',
      path: '/pages/index/index'
    }
  },

  onGetUserMsg: function (stopCb) {
    var that = this
    wx.login({
      success(res) {
        if (res.code) {
          wx.getWeRunData({
            success: function (res) {
              that.onGetRunData(res, stopCb)
            },
            fail: function (res) { }
          })
        } else {
          console.log('登录失败！' + res.errMsg)
        }
      }
    })
  },

  onChangeTab: function (e) {
    let newIndex = e.currentTarget.dataset.index
    let { orderFields, activeIndex } = this.data
    newIndex = Number(newIndex)
    if (newIndex !== activeIndex) {
      wx.showLoading({
        title: '加载中...',
      })
      this.setData({
        activeIndex: newIndex
      })
      this.onQueryOrderBy('', orderFields[newIndex], 'desc')
    }
  },

  onGetUserInfo: function (e) {
    if (!this.logged && e.detail.userInfo) {
      wx.showLoading({
        title: '加载中...',
      })
      this.setData({
        logged: true,
        avatarUrl: e.detail.userInfo.avatarUrl,
        userInfo: e.detail.userInfo
      })
      this.onGetUserMsg()
    }
  },

  onGetRunData: function (param, stopCb) {
    // 云函数获得当天微信运动步数
    let cloudId = wx.cloud.CloudID(param.cloudID)
    let now = new Date() // 当前日期
    let nowDayOfWeek = now.getDay() // 今天本周的第几天
    let {
      userInfo,
      avatarUrl,
      openid
    } = this.data
    let that = this
    wx.cloud.callFunction({
      name: 'weRun',
      data: {
        weRunData: cloudId
      },
      success: res => {
        let {
          result = {}
        } = res
        let {
          event
        } = result
        let weRunData = event && event.weRunData
        let stepInfoList = weRunData && weRunData.data.stepInfoList
        let todayStepInfo = stepInfoList[stepInfoList.length - 1]
        let thisWeekStepSum = 0
        let lastWeekStepSum = 0

        let thisWeekIndex = stepInfoList.length - nowDayOfWeek
        let thisWeekStepList
        if (thisWeekIndex >= 0) { // 有这周的所有数据
          thisWeekStepList = stepInfoList.slice(thisWeekIndex)
        }
        if (thisWeekStepList) { // 取得到这周数据
          thisWeekStepList.forEach((item) => {
            thisWeekStepSum += item.step
          })

          // 尝试取上周数据
          let lastWeekIndex = thisWeekIndex - 7
          let lastWeekStepList
          if (lastWeekIndex >= 0) { // 取得到上周7天数据
            lastWeekStepList = stepInfoList.slice(lastWeekIndex, thisWeekIndex)
          } else if (thisWeekIndex > 0) { // 上周能取不到整个7天，取一部分
            lastWeekStepList = stepInfoList.slice(0, thisWeekIndex)
          }

          lastWeekStepList && lastWeekStepList.forEach((item) => {
            lastWeekStepSum += item.step
          })
        } else { // 数据不足，直接把所有数据加上就是本周的
          stepInfoList.forEach((item) => {
            thisWeekStepSum += item.step
          })
        }

        this.setData({
          todayStep: todayStepInfo.step,
          thisWeekStepSum: thisWeekStepSum,
          lastWeekStepSum: lastWeekStepSum
        })

        let dataInfo = {
          todayStep: todayStepInfo.step,
          thisWeekStep: thisWeekStepSum,
          lastWeekStep: lastWeekStepSum,
          nickName: userInfo.nickName || '',
          avatarUrl: avatarUrl,
          lastUpdateTime: todayStepInfo.timestamp
        }
        that.onAddOrUpdateById(dataInfo, openid, '', stopCb)

        app.globalData.lastWeekStepSum = lastWeekStepSum
      },
      fail: err => { }
    })
  },

  onGetOpenidByClound: function (cb) {
    let that = this
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
        cb && cb()
        wx.setStorage({
          key: 'openid',
          data: res.result.openid
        })
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)
        wx.showToast({
          icon: 'none',
          title: '获取 openid 失败，请重试'
        })
      }
    })
  },

  onGetOpenid: function (cb) {
    try {
      var value = wx.getStorageSync('openid')
      if (value) {
        app.globalData.openid = value
        this.setData({
          openid: value
        })
        cb && cb()
        return
      } else {
        if (this.data.openid) {
          cb && cb()
          return
        }
        this.onGetOpenidByClound(cb)
      }
    } catch (e) {
      console.log(e)
      this.onGetOpenidByClound(cb)
    }
  },

  onAddNewInfo: function (stepInfo, openid) {
    // let scb = (res) => {
    //   let { data } = res
    //   if (data && data.length === 0) { //代表是新用户
    //     this.onAdd(stepInfo)//id和opendId都会自己生成
    //   }else{//这里修改
    //     this.onAddOrUpdateById(openid,{step:3333,a:1})
    //     // wx.cloud.callFunction({
    //     //   name: 'updateStep',
    //     //   data: {
    //     //     openid: openid,
    //     //     stepInfo: stepInfo
    //     //   },
    //     //   success: res => {
    //     //     console.log('[云函数] [updateStep] 调用成功: ', res)
    //     //   },
    //     //   fail: err => {
    //     //     console.error('[云函数] [updateStep] 调用失败', err)
    //     //   }
    //     // })
    //   }
    // }
    // this.onQuery({ _openid: openid }, scb)
  },

  onAddOrUpdateById: function (data, id, env, cb) {
    if (!id) {
      console.error('id error:' + id)
      return
    }
    let that = this
    let { activeIndex, orderFields } = this.data
    let key = orderFields[activeIndex]
    let db = wx.cloud.database()
    db.collection('user').doc(id).get({
      success: function (res) {
        // res.data 包含该记录的数据
        let {
          _id,
          _openid,
          ...ohters
        } = res.data
        let newData = Object.assign(ohters, data)
        //let isReload = data.todayStep !== ohters.todayStep || data[key] !== ohters[key] || 
        db.collection('user').doc(id).set({
          data: newData,
          success: () => { // 更新成功就刷新排名
            that.onQueryOrderBy('', key, 'desc')
          },
          fail: function (err) {
            console.log('onAddOrUpdateById', err)
          }
        })
        cb && cb()
      },
      fail: function (err) {
        // doc.set({
        //   data: data, //会自动生成id和openid
        //   success: () => { //新增成功就刷新排名
        //     that.onQueryOrderBy('', orderFields[activeIndex], 'desc')
        //   },
        //   fail: function (err) {
        //     console.error('onAddOrUpdateById', err)
        //   }
        // })
        data['_id'] = id
        that.onAdd(data, '', () => that.onQueryOrderBy('', key, 'desc'))
        cb && cb()
      }
    })
  },

  // 查询排名
  onQueryOrderBy: function (con, orderField, orderType, env) {
    if (!orderField || !orderType) return
    let that = this
    // let db = wx.cloud.database()
    // db.collection('user').orderBy(orderField, orderType).limit(100).get({
    //   success: function (res) {
    //     // res.data 包含该记录的数据
    //     console.log(' [orderList] 调用成功: ', res)
    //     let {
    //       data
    //     } = res
    //     let index = data.findIndex((item) => item._openid === that.data.openid)
    //     index += 1
    //     that.setData({
    //       stepRank: index,
    //       rankList: data
    //     })
    //     wx.showToast({
    //       title: '加载成功',
    //     })
    //   },
    //   fail: function (err) {
    //     console.error(' [orderList] 调用失败', err)
    //     wx.showToast({
    //       icon: 'none',
    //       title: '获取排名失败，请重试'
    //     })
    //   }
    // })

    // 调用云函数
    wx.cloud.callFunction({
      name: 'orderList',
      data: {
        con: con,
        orderField: orderField,
        orderType: orderType
      },
      success: res => {
        console.log('[云函数] [orderList] 调用成功: ', res)
        let {
          result
        } = res
        let data = result.data

        let index = data.findIndex((item) => item._openid === that.data.openid)
        index = index === -1 ? '100+':index+1
        that.setData({
          stepRank: index,
          rankList: data
        })
        wx.showToast({
          title: '加载成功',
        })
      },
      fail: err => {
        console.error(' [orderList] 调用失败', err)
        wx.showToast({
          icon: 'none',
          title: '获取排名失败，请重试'
        })
      }
    })
  },

  // 新增一条记录
  onAdd: function (data, env, cb) {
    let db = wx.cloud.database()
    let _env = env || 'user'
    db.collection(_env).add({
      data: data,
      success: res => {
        // 在返回结果中会包含新创建的记录的 _id
        console.log('[数据库] [新增记录] ', res)
        cb && cb()
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '新增记录失败'
        })
        console.error('[数据库] [新增记录] 失败：', err)
      }
    })
  },
  //获得群组openid
  onGetGroupOpenid: function (shareTicket) {
    let _shareTicket = shareTicket || app.globalData.shareTicket
    if (!_shareTicket) return
    let that = this
    wx.getShareInfo({
      shareTicket: _shareTicket,
      success: function (res) {
        let cloudId = wx.cloud.CloudID(res.cloudID)
        wx.cloud.callFunction({
          name: 'weRun',
          data: {
            groupData: cloudId
          },
          success: function (res) {
            let { result } = res
            let openGId = result.event.groupData.data.openGId
            that.setData({
              openGId: openGId
            })
            let exsitCb = (data)=>{
              let obj = data[0]
              let {_id, openids=[]} = obj
              let openid = that.data.openid
              let index = openids.findIndex((item) => item === openid)
              console.log(index)
              if (index > -1) {//已经存在就不用管了
                return
              }
              openids.push(openid)
              that.onUpdateById(_id, { openids: openids}, 'group')
            }
            that.onSearchGroupById({ openGId: openGId }, 'group', exsitCb)
          },
          fail: function (err) {
            console.error(err)
          }
        })
      },
      fail: function (err) {
        console.error(err)
      }
    })
  },
  //查询群组
  onSearchGroupById: function (con, env, exsitCb) {
    let db = wx.cloud.database()
    let _env = env || user
    db.collection(_env).where(con).get({
      success: (res) => {
        let { data } = res
        console.log(data)
        if (data.length > 0) {//证明已经存在
          exsitCb && exsitCb(res.data)
          return
        }
        let newData = Object.assign(con, { openids: [this.data.openid] })
        this.onAdd(con, _env)
      },
      fail: (err) => {
        console.error(err)
      }
    })
  },

  onUpdateById: function (id, data, env) {
    if (id) {
      return
    }
    let _env = env || 'user'
    db.collection(_env).doc(id).update({
      data: data,
      success: () => {

      }
    })
  }
})
