var app = getApp()
Page({
  data: {
    //判断小程序的API，回调，参数，组件等是否在当前版本可用。
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    isCheck: '',
    isDisable: true
  },
  onLoad: function () {
    // 查看是否授权
    wx.getSetting({
      success: function (res) {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称
          wx.getUserInfo({
            success: function (res) {
              console.log(res.userInfo)
              app.globalData.userInfo = res.userInfo;
              app.checkLogin();
              if (app.globalData.u_id && app.globalData.agreeItem){
                wx.switchTab({
                  url: '../discovery/discovery',
                })
              }
            }
          })
        }
      }
    })
  },
  bindGetUserInfo: function (e) {
    console.log(e.detail.userInfo)
    app.globalData.userInfo = e.detail.userInfo;
    if (e.detail.userInfo){
      app.checkLogin();
      wx.switchTab({
        url: '../discovery/discovery',
      })
    } else {
      wx.showModal({
        title: '温馨提示',
        content: '不授权无法使用哦:(',
        showCancel: false
      })
    }
  },
  checkChange: function(e){
    if (e.detail.value[0] == 'true') {
      this.setData({
        isDisable: false
      })
    }else{
      this.setData({
        isDisable: true
      })
    }
  }
})