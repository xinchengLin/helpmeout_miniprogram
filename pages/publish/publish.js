// pages/publish/publish.js
var app = getApp();
var utils = require("../../utils/util.js");

const values = []

for (let i = 1; i <= 60; i++) {
  values.push(i)
}

Page({
  /**
   * 页面的初始数据
   */
  data: {
    value: 10,
    goTime: 0,
    submitLoading: false,
    timeStart: "06:00",
    timeEnd: "22:30",
    date: "0",
    dateList: ['今天', '明天'],
    nickName: '正在获取用户名...'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    /*手机*/
    wx.getStorage({
      key: 'phone',
      success: function (res) {
        if (res.data) {
          that.setData({
            phone: res.data,
            phoneStatus: true
          })
        }
      },
    })
    this.getNowTime();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  /*
   * 页面显示
   */
  onShow: function () {
    if(this.data.date==="0"){
      this.setData({
        timeStart: this.getNowTime()
      })
    }
    //获取用户名
    if(this.data.nickName == "正在获取用户名..."){
      var timer = setInterval(()=>{
        this.setData({
          nickName: app.globalData.userInfo.nickName
        })
        if (this.data.nickName != "正在获取用户名..."){
          clearInterval(timer);
        }
      }, 1000);
    }
  },

  bindTimeChange: function (e) {
    this.setData({
      goTime: e.detail.value
    });
  },

  formSubmit: function (e) {
    var that = this;
    var check = this.data.phoneStatus && this.data.fromPosStatus && this.data.toPosStatus && this.data.priceStatus;
    console.log(check + ":"  + this.data.phoneStatus + this.data.fromPosStatus + this.data.toPosStatus + this.data.priceStatus)
    if (check && this.data.nickName !== '正在获取用户名...') {
      const myDate = new Date();//获取系统当前时间
      var hour = that.addZero(myDate.getHours());   //21
      var minute = that.addZero(myDate.getMinutes());  //16
      var nowTime = hour + ':' + minute;
      if (that.compareDate(e.detail.value.goTime, "22:30") === false && that.compareDate(e.detail.value.goTime, "05:59") === true) {
        if (that.data.date === "0" && that.compareDate(e.detail.value.goTime, nowTime) === true) {
          this.submitRequest(e);
        } else if (that.data.date === "1") {
          this.submitRequest(e);
        } else {
          wx.showToast({
            title: '这个时间已经是过去式啦~',
            icon: "none"
          })
        }
      } else {
        wx.showToast({
          title: '为了安全起见，只允许在6:00-22:30这个时间段发单哦',
          icon: "none"
        })
      }
    } else if(!check){
      utils.statusTip(1);
    } else if (this.data.nickName == '正在获取用户名...'){
      wx.showToast({
        title: '网络错误，获取用户名失败',
        icon: 'none'
      })
    }
  },
  //如果时间是一位数，在前面添加0
  addZero: function (obj) {
    if (obj < 10) {
      return "0" + obj;
    } else {
      return obj;
    }
  },
  //获取当前时间
  getNowTime: function () {
    const myDate = new Date();//获取系统当前时间
    var hour = myDate.getHours();   //21
    var minute = myDate.getMinutes();  //16
    var myHour = '';
    var myMin = '';
    if (minute >= 55) {
      myMin = this.addZero(minute + 5 - 60);
      myHour = this.addZero(hour + 1);
    } else if (minute < 55) {
      myMin = this.addZero(minute + 5);
      myHour = this.addZero(hour);
    }
    var lateTime = this.compareDate(myHour + ':' + myMin, "22:30");
    var earlyTime = !this.compareDate(myHour + ':' + myMin, "06:00")
    if (lateTime) {
      this.setData({
        goTime: "22:30"
      })
    } else if (earlyTime) {
      this.setData({
        goTime: "06:00"
      })
    } else if(this.data.date === "0"){
      this.setData({
        goTime: myHour + ":" + myMin
      })
    }
    return myHour + ":" + myMin;
  },
  //比较两个时间
  compareDate: function (t1, t2) {
    var date = new Date();
    var a = t1.split(':');    //a[0]是t1的小时，a[1]是t1的分钟
    var b = t2.split(':');
    return date.setHours(a[0], a[1]) > date.setHours(b[0], b[1]);
  },
  submitRequest: function (e) {
    //缓存手机号码
    wx.setStorage({
      key: 'phone',
      data: e.detail.value.phoneNum,
    })
    var that = this;
    this.setData({
      submitLoading: true
    })
    //验证用户授权是否过期
    console.log("用户的u_id:" + app.globalData.u_id)
    if (app.globalData.u_id) {
      wx.request({
        url: app.globalData.apiUrl + '/journey/addJourney',
        data: {
          "u_id": app.globalData.u_id,
          "u_name": this.data.nickName,
          "phone": e.detail.value.phoneNum,
          "from_place": e.detail.value.goPos,
          "to_place": e.detail.value.arrivePos,
          "price": e.detail.value.price,
          "start_time": e.detail.value.goTime,
          "note": e.detail.value.note,
          "date": that.data.date,
          "identity": e.detail.value.identity
        },
        method: "POST",
        header: { "Content-Type": "application/x-www-form-urlencoded" },
        success: function (res) {
          console.log(res);
          that.setData({
            submitLoading: false
          })
          if (res.data.code === 200) {
            wx.showModal({
              title: '发布成功',
              content: '请在“我的—>行程”中查看详情',
              showCancel: false,
              success: function (res) {
                if (res.confirm) {
                  wx.reLaunch({
                    url: '/pages/discovery/discovery',
                  })
                }
              }
            })
          } else if (res.data.code === 400){
            utils.statusTip(400,res);
          }else{
            utils.statusTip(500);
          }
        },
        fail: function (res) {
          console.log(res)
          that.setData({
            submitLoading: false
          })
          utils.statusTip(500);
        }
      })
    } else {
      console.log("用户的u_id：" + app.globalData.u_id);
      this.setData({
        submitLoading: false
      })
      utils.statusTip(0);
    }
  },
  dateChange: function(e){
    this.setData({
      date: e.detail.value
    })
    if (e.detail.value === "1"){
      this.setData({
        timeStart: "06:00",
      })
    }else{
      this.setData({
        timeStart: this.getNowTime()
      })
    }
    this.setData({
      goTime: this.data.timeStart
    })
  },
  checkValue: function (e) {
    var i = e.currentTarget.id;
    var regex = '';
    switch(i){
      case "0": {
        regex = /^[\u4E00-\u9FA5]{2,4}$/;
        if (regex.test(e.detail.value)) {
          this.setData({
            nameStatus: true,
          })
        } else {
          this.setData({
            nameStatus: false
          })
        }
        break;
      }
      case "1": {
        regex = /0?(13|14|15|16|17|18|19)[0-9]{9}/;     //验证电话号码
        if (regex.test(e.detail.value)) {
          this.setData({
            phoneStatus: true
          })
        } else {
          this.setData({
            phoneStatus: false
          })
        }
        break;
      }
      case "2": {
        regex = /^.{2,8}$/;    //验证地点的字符串长度是否2-8位
        if (regex.test(e.detail.value)) {
          this.setData({
            fromPosStatus: true
          })
        } else {
          this.setData({
            fromPosStatus: false
          })
        }
        break;
      }
      case "3": {
        regex = /^.{2,8}$/;    //验证地点的字符串长度是否2-8位
        if (regex.test(e.detail.value)) {
          this.setData({
            toPosStatus: true
          })
        } else {
          this.setData({
            toPosStatus: false
          })
        }
        break;
      }
      case "4": {
        regex = /(^[0-9]([.][0-9]{1,2})?$)|(^1[0-9]([.][0-9]{1,2})?$)|(^20([.]0{1,2})?$)/;
        //验证价格是否为0-20，可保留两位小数
        if (regex.test(e.detail.value)) {
          this.setData({
            priceStatus: true
          })
        } else {
          this.setData({
            priceStatus: false
          })
        }
        break;
      }
    }
  }
})