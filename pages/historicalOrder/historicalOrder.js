// pages/historicalOrder/historicalOrder.js
var app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentTab: 0,
    winHeight: '',
    hiddenModal: true,
    detail: '',
    Passenger: [
      // {
      //   "j_id": 1,
      //   "u_id":"11",
      //   "u_name": "caicai",
      //   "u_phone": "13234322212",
      //   "start_time": "13:33",
      //   "price": 10,
      //   "to_place": "海妙1",
      //   "from_place": "就业楼",
      //   "status": ' 1',
      //   "overTime": '已完成',
      // }
    ],
    carMess: [
      //   {
      //     "j_id": 1,
      //     "u_id": "1",

      //     "u_name": "caicai",
      //     "u_phone": "13234322212",
      //     "start_time": "13:33",
      //     "price": 10,
      //     "to_place": "海妙1",
      //     "from_place": "就业楼",
      //     "status": ' 1',
      //     "overTime": '已完成',
      //   }
    ],
    isNullOrder: false,
    isNullOrder1: false,
    index: 0,
    id: 0,
    status1: '',
    timeArray: [],//车主
    timeArray1: [],//个人
    statusImg: ['/images/finish.png', '/images/ing.png', '/images/cancel.png','/images/overTime.png'],
    imgArray1: [],
    imgArray2: [],
    count:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    //高度自适应
    var height = app.setHeight(170);
    this.setData({
      winHeight: height
    })
    this.getbycar();
    this.getPassenger();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  switchNav: function (e) {
    var that = this;
    console.log(e);
    if (e.target.dataset.current == this.data.currentTab){
      return false
    }else{
      if (this.data.count == 0) {
        that.setData({
          currentTab: e.target.dataset.current,
          count: that.data.count + 1
        });
      } else {
        setTimeout(() => {
          that.setData({
            currentTab: e.target.dataset.current,
            count: that.data.count + 1
          });
        }, 550)
      }
    }
  },
  changePage: function (e) {
    this.getbycar();
    this.getPassenger();
    var a = e.detail.current;
    if (this.data.currentTab == a) {
      return false;
    } else {
      this.setData({
        currentTab: a
      })
    }
  },
  Report: function (e) {
    var that = this;
    console.log(e);
    console.log(e.currentTarget);
    var id = e.currentTarget.id;
    console.log(e.currentTarget.dataset);
    var index = e.currentTarget.dataset.index;
    console.log(index);
    var status = 'carMess[' + index + '].status';
    console.log(status);
    /* that.setData({
        [status]:'0'
      });*/
    that.setData({
      hiddenModal: false,
      status1: status,
      index: index
    })
  },
  Report1: function (e) {
    var that = this;
    console.log(e);
    console.log(e.currentTarget);
    var id = e.currentTarget.id;
    console.log(e.currentTarget.dataset);
    var index = e.currentTarget.dataset.index;
    console.log(index);
    var status = 'Passenger[' + index + '].status';
    console.log(status);
    /* that.setData({
        [status]:'0'
      });*/
    that.setData({
      hiddenModal: false,
      status1: status,
      index: index
    })
  },
  getbycar: function () {
    console.log("12");
    var that = this;
    wx.request({
      url: app.globalData.apiUrl + '/journey/historyJourney',
      data: {
        "u_id": app.globalData.u_id,
        "code": 1

      },
      header: { "Content-Type": "application/json" },
      method: 'GET',
      dataType: 'json',
      responseType: 'text',
      success: function (res) {
        console.log(res);

        that.setData({
          carMess: res.data.data
        });

        console.log("1");
        console.log(that.data.carMess);
        var timeArray = new Array();
        if (res.data.msg !== '无订单') {
          if (that.data.currentTab == 0) {
            for (var i = 0; i < that.data.carMess.length; i++) {
              timeArray.push(app.formatTime(that.data.carMess[i].start_time));
            }
          } else {
            for (var i = 0; i < that.data.Passenger.length; i++) {
              timeArray.push(app.formatTime(that.data.Passenger[i].start_time));
            }
          }

          that.setData({
            timeArray: timeArray
          })
        } else {
          that.isNullShowchezhu();
        }
      },
      fail: function (res) {
        console.log("123");

      },
      complete: res => {
        console.log("1234");
        that.isNullShowchezhu();
      },
    })
  },
  getPassenger: function () {
    console.log("12");
    var that = this;
    wx.request({
      url: app.globalData.apiUrl + '/journey/historyJourney',
      data: {
        "u_id": app.globalData.u_id,
        "code": 0
      },
      header: { "Content-Type": "application/json" },
      method: 'GET',
      dataType: 'json',
      responseType: 'text',
      success: function (res) {
        console.log(res);

        that.setData({
          Passenger: res.data.data
        });
        console.log("1");
        console.log(that.data.Passenger);
        var timeArray = new Array();
        if (res.data.msg !== '无订单') {
          if (that.data.currentTab == 0) {
            var imgArray1 = [];
            for (var i = 0; i < that.data.carMess.length; i++) {
              timeArray.push(app.formatTime(that.data.carMess[i].start_time));
              that.setData({
                timeArray: timeArray
              })
              if (that.data.carMess[i].overTime == false && that.data.carMess[i].finish == true) {
                imgArray1.push('0');
              } else if (that.data.carMess[i].overTime == false && that.data.carMess[i].finish == false) {
                imgArray1.push('1');
              } else if (that.data.carMess[i].overTime == true && that.data.carMess[i].finish == false && that.data.carMess[i].c_id != null && that.data.carMess[i].u_id != null) {
                imgArray1.push('2');
              } else if (that.data.carMess[i].overTime == true && that.data.carMess[i].identity == '0' && that.data.carMess[i].c_id == null) {
                imgArray1.push('3')
              } else if (that.data.carMess[i].overTime == true && that.data.carMess[i].identity == '1' && that.data.carMess[i].u_id == null) {
                imgArray1.push('3')
              }
            }
            that.setData({
              imgArray1: imgArray1   //车主页的印章数组
            })
          } else {
            var imgArray2 = [];
            for (var i = 0; i < that.data.Passenger.length; i++) {
              timeArray.push(app.formatTime(that.data.Passenger[i].start_time));
              that.setData({
                timeArray1: timeArray
              })
              if (that.data.Passenger[i].overTime == false && that.data.Passenger[i].finish == true) {
                imgArray2.push('0');
              } else if (that.data.Passenger[i].overTime == false && that.data.Passenger[i].finish == false) {
                imgArray2.push('1');
              } else if (that.data.Passenger[i].overTime == true && that.data.Passenger[i].finish == false && that.data.Passenger[i].c_id != null && that.data.Passenger[i].u_id != null) {
                imgArray2.push('2');
              } else if (that.data.Passenger[i].overTime == true && that.data.Passenger[i].identity == '0' && that.data.Passenger[i].c_id == null) {
                imgArray2.push('3')
              } else if (that.data.Passenger[i].overTime == true && that.data.Passenger[i].identity == '1' && that.data.Passenger[i].u_id == null) {
                imgArray2.push('3')
              }
            }
            that.setData({
              imgArray2: imgArray2    //乘客页的印章数组
            })
          }

          that.setData({
            timeArray: timeArray
          })
        } else {
          that.isNullShowchezhu();
        }
      },
      fail: function (res) {
        console.log("123");

      },
      complete: res => {
        console.log("1234");
        that.isNullShowchezhu1();
      },
    })
  },
  isNullShowchezhu: function () {
    console.log('11yay111');
    if (this.data.carMess == null || this.data.carMess.length == 0) {
      this.setData({
        isNullOrder: true
      })
    } else {
      this.setData({
        isNullOrder: false
      })
    }
  },
  isNullShowchezhu1: function () {
    console.log('11yay111');
    if (this.data.Passenger == null || this.data.Passenger.length == 0) {
      this.setData({
        isNullOrder1: true
      })
    } else {
      this.setData({
        isNullOrder1: false
      })
    }
  },
  bindconfirm: function (e) {
    var that = this;
    console.log(that.data.detail);
    if (that.data.detail.length == 0) {
      wx.showToast({
        title: '信息填写错误',
        image: '/images/miskate.png',
        duration: 1500,
        mask: true
      });
      return false;
    }
    var that = this;
    var status1 = this.data.status1;
    /* that.setData({
        [status1]:'0',
        hiddenModal:true
      });*/
    var index = that.data.index;
    if (that.data.currentTab == 0) {
      var a = that.data.carMess;
      var accusationToUserId = a[index].u_id;
      console.log(accusationToUserId)
    } else {
      var a = that.data.Passenger;
      var accusationToUserId = a[index].c_id;
      console.log(accusationToUserId)
    }
    var accusationToUserName = a[index].u_name;
    var accusationFromUserId = app.globalData.u_id;
    var accusationFromUserName = app.globalData.userInfo.nickName;
    var accusationNote = that.data.detail;
    console.log(accusationNote);
    wx.request({
      url: app.globalData.apiUrl + '/accusation/addAccusation',
      data: {
        "accusationToUserId": accusationToUserId,
        "accusationToUserName": accusationToUserName,
        "accusationFromUserId": accusationFromUserId,
        "accusationFromUserName": accusationFromUserName,
        "accusationNote": accusationNote
      },
      header: { "Content-Type": "application/x-www-form-urlencoded" },
      method: 'POST',
      dataType: 'json',
      responseType: 'text',
      success: function (res) {
        console.log(res);

        wx.showToast({
          title: res.data.msg,
          duration: 1500,
          icon: "none"
        })
      },
      fail: function (res) {
        wx.showToast({
          title: '举报失败',
          image: '/images/miskate.png',
          duration: 0,
          mask: true,
        })
      },
      complete: function (res) {
        that.setData({
          detail: '',
          hiddenModal: true
        });     
      },
    })
  },
  listenerCancel: function (e) {
    console.log(e);
    this.setData({
      hiddenModal: true,
      detail: '',
    })
  },
  detailMess: function (event) {
    this.setData({
      detail: event.detail.value
    })
  },
  preventTouchMove: function () {
  }
})