// pages/notice/notice.js
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    notice: 
    {
      "title": "正在获取数据...",
      "content": ''
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.request({
      url: app.globalData.apiUrl+'/notice/showNotice',
      success: res => {
        console.log(res);
        if(res.data.code == 200){
          this.setData({
            notice: res.data.data
          })
          wx.setStorage({
            key: 'notice',
            data: res.data.data,
          })
        }else{
          wx.getStorage({
            key: 'notice',
            success: res => {
              this.setData({
                notice: res.data
              })
            }
          })
        }
      },
      fail: () => {
        wx.getStorage({
          key: 'notice',
          success: res => {
            this.setData({
              notice: res.data
            })
          }
        })
      }
    })
  },
  onShow: function(){
  }
})