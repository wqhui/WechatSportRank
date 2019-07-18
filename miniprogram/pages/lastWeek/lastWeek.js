// miniprogram/pages/custom/item.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    rankList:[]
  },
  onLoad: function () {
    let _rankList= app.globalData.rankList || []
    let newRankList = _rankList.sort((a,b)=>{
      return b.lastWeekStep > a.lastWeekStep
    })
    this.setData({
      rankList: newRankList
    })
  },
})