// miniprogram/pages/rankList/rankList.js
Component({

  /**
   * 页面的初始数据
   */
  data: {

  }, 
  properties: {
    rankList: {
      type: Array,//类型
      value: []
    },
    isLastWeek:{
      type:Boolean,
      value:false
    }
  },
})