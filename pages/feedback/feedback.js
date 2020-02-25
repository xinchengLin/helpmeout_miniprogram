// page/feedback/feedback
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    feedBackText: ""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  },

  formSubmit: function(e){
    console.log(e.detail.value.feedback.length);
    if (e.detail.value.feedback.length >= 10){
      wx.request({
        url: app.globalData.apiUrl +'/user/feedback',
        data: {
          "contact": app.globalData.u_id,
          "details": e.detail.value.feedback
        },
        method: "GET",
        success: res => {
          console.log(res);
          wx.showToast({
            title: res.data.msg
          })
          var feedBackText1 = '';
          this.setData({
            feedBackText: feedBackText1
          })
        },
        fail: res => {}
      })
    }else{
      wx.showToast({
        title: '反馈要求十字以上:)',
        icon: "none"
      })
    }
  }
})