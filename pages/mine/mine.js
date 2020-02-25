// pages/mine/mine.js
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (!this.data.userInfo) {
      var timer = setInterval(() => {
        this.setData({
          userInfo: app.globalData.userInfo
        })
        if (this.data.nickName) {
          clearInterval(timer);
        }
      }, 1000);
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.setData({
      userInfo: app.globalData.userInfo
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  },
  //行程跳转
  trip:function(){
    wx.navigateTo({
      url: '../trip/trip',

    })
  },
  feedback:function(){
    wx.navigateTo({
      url: '../feedback/feedback',
    })
  },
  /**
   * 清除聊天缓存
   */
  clearChattingStorage: function () {
    wx.showLoading({})
    wx.removeStorage({
      key: 'chattingArray',
      success: function (res) {
        wx.hideLoading()
        wx.showToast({
          title: '清除成功'
        })
      }
    })
  }
})