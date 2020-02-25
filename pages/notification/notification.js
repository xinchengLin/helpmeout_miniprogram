// pages/notification/notification.js
var app = getApp();
var utils = require('../../utils/util.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    flag: 0,
    currentTab: 0,
    count: 0,
    noNotice: false,
    winHeight: '',
    receiveTime: ["2018/1/1 22:00"],
    titleArray: ["订单接受通知","乘客取消通知","车主取消通知","行程过期通知","新聊天窗口","官方通知"],
    myMsg: [],
    inputText: '',
    data: [
      // {
      //   "code":4,
      //   "journeyId":"20180529215759",
      //   "msg":"行程订单已被接受💓  请在我的行程中查看",
      //   "time":"May 29, 2018 10:04:27 PM",
      //   "fromUserId":"3512f18737804d8b9f6068ce9858f193",
      //   "fromUserName":"hisName",
      //   "content": '对方发来的消息内容'
      // }
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //设置页面高度
    var height = app.setHeight(80);
    this.setData({
      winHeight: height,
      currentTab: 0
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getFromStorage();
    if (this.data.currentTab == 1) {
      this.switchNav({ target: { id: 0 } });
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  },
  //切换导航
  switchNav: function (e) {
    var id = e.target.id;
    if (this.data.currentTab == id) {
      return false;
    } else {
      if (this.data.count == 0) {
        this.setData({
          currentTab: id,
          flag: id,
          count: this.data.count + 1
        })
      } else {
        setTimeout(() => {
          this.setData({
            currentTab: id,
            flag: id,
            count: this.data.count + 1
          })
        }, 550);
      }
    }
  },
  //滑动页面
  swiperChange: function (e) {
    this.setData({
      currentTab: e.detail.current,
      flag: e.detail.current
    })
  },
  /*
  * 获取webSocket中的消息
  */
  getFromStorage: function(){
    wx.getStorage({
      key: 'notificationList',
      success: res => {
        this.setData({
          data: res.data.reverse()
        })
        var receiveTime = new Array();
        for (var i = 0; i < this.data.data.length; i++) {
          var time = utils.formatTime(new Date(this.data.data[i].time))
          receiveTime.push(time);
        }
        this.setData({
          receiveTime: receiveTime,
          noNotice: false
        })
      },
      fail: res => {    //缓存中没有这个key的时候fail
        this.setData({
          noNotice: true
        })
      }
    })
  }
})
