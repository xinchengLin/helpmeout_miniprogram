var app = getApp();
var utils = require("../../utils/util.js");
Page({
  data: {
    detailIndex:0,
    navbar: ['车主', '乘客'],
    date: ["今天","明天"],
    currentTab: 0,
    loading: false,
    color: true,
    delect: false,
    hiddenmodalput: true,
    cancelReason: '请选择取消原因',
    reasonList: ["临时有其他事情","长时无人接单", "不小心接到的", "觉得好玩","其他"],
    cancelOrderId: '',
    dataMess: [
      // {
      //   "j_id": 1,
      //   "u_id": 'e179261978404e2699561462b5dd5cf8',
      //   "u_name": "caicai",
      //   "u_phone": "13234322212",
      //   "start_time": "13:33",
      //   "price": 10,
      //   "to_place": "海妙1",
      //   "from_place": "就业楼",
      //   "status": ' 1',
      //   "overTime": '已接单',
      //   "note":"啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊"
      // }
    ],
    timeArray: [],//车主
    timeArray1: [],//个人
    person: [
      // {
      //   "j_id": 1,
      //   "u_id": 'e179261978404e2699561462b5dd5cf8',
      //   "u_name": "caicai",
      //   "u_phone": "13234322212",
      //   "start_time": "13:33",
      //   "price": 10,
      //   "to_place": "海妙1",
      //   "from_place": "就业楼",
      //   "status":'1',
      //   "msg":'已接单',
      //   "note": "111111111111111",
      //   "date": '1'
      // }
    ],
    isNullOrder: false,
    isNullOrder1: false,
    index: 0,
    id: 0,
    hiddenDetail:true
  },
  navbarTap: function (e) {
    console.log(e.currentTarget.dataset.idx);
    console.log('测试');
    this.setData({
      currentTab: e.currentTarget.dataset.idx
    })
    this.getbycar();
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    this.getbycar();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.dialog = this.selectComponent("#dialog");
    console.log("yayay");

  },
  showDialog(e) {
    this.dialog.showDialog();
    console.log(e);
    var index1 = e.currentTarget.dataset.index;
    var id1 = e.currentTarget.id;
    console.log(e.currentTarget.dataset.index);
    this.setData({
      index: index1,
      id: id1
    })

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.getbycar();
    wx.stopPullDownRefresh();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  /*车主
  取消 */
  cancelchezhu: function (e) {
    var that = this;
    var index = e.currentTarget.dataset.index;
    if (that.data.currentTab == 0) {
      var a = that.data.dataMess;
      var status = 'dataMess[' + index + '].status';
    } else {
      var a = that.data.person;
      var status = 'person[' + index + '].status';

    }
    console.log(e);
    console.log(e.currentTarget);
    this.setData({
      hiddenmodalput: false,
      cancelOrderId: e.currentTarget.id,
      status: status
    })
  },
  
  /*
    车主
  */
  getbycar: function () {
    console.log("12");
    var that = this;
    if (that.data.currentTab == 0) {
      var a = 'dataMess';
      var b = app.globalData.apiUrl + '/user/driverOrder';

    } else {
      var a = 'person';
      var b = app.globalData.apiUrl + '/user/userOrder'
    }
    wx.request({
      url: b,
      data: { "u_id": app.globalData.u_id },
      header: { "Content-Type": "application/json" },
      method: 'GET',
      dataType: 'json',
      responseType: 'text',
      success: function (res) {
        console.log(res);

        that.setData({
          [a]: res.data.data
        });

        console.log("1");
        console.log(that.data.a);
        var timeArray = new Array();
        if (res.data.msg !== '无订单') {
          if (that.data.currentTab == 0) {
            for (var i = 0; i < that.data.dataMess.length; i++) {
              timeArray.push(app.formatTime(that.data.dataMess[i].start_time));
            }
          } else {
            for (var i = 0; i < that.data.person.length; i++) {
              timeArray.push(app.formatTime(that.data.person[i].start_time));
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



  isNullShowchezhu: function () {
    var that = this;
    console.log('11yay111');
    if (that.data.currentTab == 0) {
      if (that.data.dataMess == null || that.data.dataMess.length == 0) {
        console.log(1111222221);
        that.setData({
          isNullOrder: true
        })
      } else {
        that.setData({
          isNullOrder: false
        })
      }
    } else {
      if (that.data.person == null || that.data.person.length == 0) {
        console.log(1111222221);
        console.log(this.data.person)
        that.setData({
          isNullOrder1: true
        })
      } else {
        that.setData({
          isNullOrder1: false
        })
      }
    }

  },

  orderComplete: function () {

  },

  chezhuFinally: function (e) {
    var that = this;
    console.log(e);
    console.log(e.currentTarget);
    var id = e.currentTarget.id;
    console.log(e.currentTarget.dataset);
    var index = e.currentTarget.dataset.index;
    console.log(index);
    if (that.data.currentTab == 0) {
      var status = 'dataMess[' + index + '].status';
    } else {
      var status = 'person[' + index + '].status';
    }
    console.log(status);
    /* that.setData({
        [status]:'0'
      });*/
    wx.showModal({
      title: '提示',
      content: '是否已完成',
      showCancel: true,
      cancelText: '取消',
      confirmText: '确定',
      success: function (res) {
        if (res.confirm) {
          wx.request({
            url: app.globalData.apiUrl + '/user/finishOrder',
            data: { 'j_id': id },
            header: { 'content-type': 'application/x-www-form-urlencoded' },
            method: 'GET',
            dataType: 'json',
            responseType: 'text',
            success: function (res) {
              if (res.data.code == 200) {
                that.setData({
                  [status]: '0'
                });
                if (that.data.currentTab == 0) {
                  if (that.data.dataMess.length == 0) {
                    that.setData({
                      isNullOrder: true
                    })
                  } else {
                    if (that.data.person.length == 0) {
                      that.setData({
                        isNullOrder1: true
                      })
                    }
                  }
                }
                wx.showToast({
                  title: res.data.data,
                  icon: 'none'
                })
              } else if (res.data.code == 400) {
                wx.showToast({
                  title: res.data.data,
                  icon: 'none'
                })
              }
            },
            fail: res => { },
            complete: function (res) {
            },
          })
        } else if (res.cancel) {
        }
      },
      fail: function (res) { },
    })
  },
  //打电话
  phoneCall: function (e) {
    console.log(e.target.dataset.phoneNum);
    wx.makePhoneCall({
      phoneNumber: e.target.dataset.phoneNum
    })
  },
  /*  
   *  带输入框的模态框   点击取消订单之后出现
   */
  modalinput: function (e) {
    console.log(e.currentTarget.id)
    this.setData({
      hiddenmodalput: true
    })
  },
  //取消按钮  
  cancelMsg: function () {
    this.setData({
      hiddenmodalput: true,
      cancelOrderId: ''
    });
  },
  //确认  
  confirmMsg: function () {
    var that = this;
    var id = this.data.cancelOrderId;
    var status = this.data.status;
    if(this.data.cancelReason !== "请选择取消原因"){
      if (this.data.currentTab === 1) {
        this.setData({
          hiddenmodalput: true
        });
        wx.request({
          url: app.globalData.apiUrl + '/user/userDeleteOrder',
          data: {
            'j_id': id,
            'cancelReason': this.data.cancelReason
          },
          header: { 'content-type': 'application/x-www-form-urlencoded' },
          method: 'GET',
          dataType: 'json',
          responseType: 'text',
          success: function (res) {
            if(res.data.code == 200){
              that.setData({
                [status]: '0'
              });
              if (that.data.person.length == 0) {
                that.setData({
                  isNullOrder1: true
                })
              }
              utils.statusTip(200);
            }
            that.getbycar();
          },
          fail: res => { },
          complete: function (res) {
            that.isNullShowperson();
            that.setData({
              cancelReason: '请选择取消原因',
              cancelOrderId: ''
            })
          },
        })
      } else if (this.data.currentTab === 0) {
        wx.request({
          url: app.globalData.apiUrl + '/user/driverDeleteOrder',
          data: {
            'j_id': id,
            'cancelReason': this.data.cancelReason
          },
          header: { 'content-type': 'application/x-www-form-urlencoded' },
          method: 'GET',
          dataType: 'json',
          responseType: 'text',
          success: function (res) {
            that.setData({
              [status]: '0',
            });
            console.log(that.data.dataMess.length);
            if (that.data.dataMess.length == 0) {
              that.setData({
                isNullOrder: true
              })
            }
            utils.statusTip(200);
            that.getbycar();
          },
          fail: function (res) { },
          complete: function (res) {
            that.isNullShowchezhu();
            that.setData({
              cancelReason: '请选择取消原因',
              cancelOrderId: '',
              hiddenmodalput: true
            })
          },
        })
      }
    }
  },
  reasonChange: function(e){
    this.setData({
      cancelReason: this.data.reasonList[e.detail.value]
    })
  },
  bindDetail:function(e){
   console.log(e)
   var that = this;
   that.setData({
     detailIndex:e.currentTarget.dataset.index,
     hiddenDetail:false
   })
  },
  preventTouchMove: function () { 

  },
  confirmDetail:function (){
    var that = this;
    that.setData({
      hiddenDetail:true
    })
    if (this.data.currentTab == 0){
      wx.navigateTo({
        url: "../chatPage/chatPage?userId="+that.data.dataMess[that.data.detailIndex].u_id+"&userName="+that.data.dataMess[that.data.detailIndex].u_name+"&journeyId="+that.data.dataMess[that.data.detailIndex].j_id
      })
    } else if (this.data.currentTab == 1){
      wx.navigateTo({
        url: "../chatPage/chatPage?userId=" + that.data.person[that.data.detailIndex].u_id + "&userName=" + that.data.person[that.data.detailIndex].u_name + "&journeyId=" + that.data.person[that.data.detailIndex].j_id
      })
    }
  },
  cancelDetail: function(){
    this.setData({
      hiddenDetail: true
    })
  }
})