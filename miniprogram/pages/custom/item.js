// miniprogram/pages/custom/item.js
Component({

  /**
   * 页面的初始数据
   */
  data: {
  },

  properties: {
    item: {
      type: Object,//类型
      value:{}
    },
    step:{
      type:Number,
    },
    index:{
      type: String,//类型
    },
    minValue:{
      type:Number,
      value:50000
    },
    defaultAvatarUrl:{
      type: String,//类型,
      value:'../../images/user-unlogin.png'
    }
  },
})