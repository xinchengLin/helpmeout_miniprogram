// pages/discovery/discovery.js
var app = getApp();
var utils = require("../../utils/util.js");

Page({
  /**
   * 页面的初始数据
   */
  data: {
    name: '',
    phone: '',
    hiddenmodalput: true,
    winHeight: '',
    notice: '交易线下完成，本程序仅提供平台，感谢使用~',
    nickName: '正在获取用户名...',
    modalTitle: ['如有意愿接单，请输入您的信息','如有意愿坐车，请输入您的信息'],
    orderList: [
      // {
      //   "j_id": "1",
      //   "u_name": "caicai",
      //   "phone": "13234322212",
      //   "start_time": "13:33",
      //   "price": 10,
      //   "from_place": "海妙海妙海妙海妙",
      //   "to_place": "就业楼就业楼就业",
      //   "date": "1",
      //   "note": "两个好好发挥好烦好烦好",
      //   "identity": "0"
      // },
      // {
      //   "j_id": "1",
      //   "u_name": "caicai",
      //   "phone": "13234322212",
      //   "start_time": "13:33",
      //   "price": 1,
      //   "from_place": "海妙",
      //   "to_place": "就业楼",
      //   "date": "1",
      //   "note": "",
      //   "identity": "1"
      // }
    ],
    driverNum: '',
    pay_number: '',
    orderIndex: 0,
    timeArray: [],
    isNullOrder1: false,
    isNullOrder2: false,
    onloaded: false,
    currentTab: 0,
    flag: 0,
    count: 0    //计算当前切换的次数
  },

  //车主输入号码时触发
  inputNum: function (event) {
    this.setData({
      driverNum: event.detail.value
    });
  },
  //车主输入支付宝时调用
  pay_number: function (event) {
    this.setData({
      pay_number: event.detail.value
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    wx.showNavigationBarLoading()    //显示正在加载数据，等下面的request完成后隐藏
    console.log("discovery.js中的u_id"+app.globalData.u_id)
    //请求订单列表
    this.requestData();
    /*手机*/
    wx.getStorage({
      key: 'phone',
      success: function (res) {
        that.setData({
          phone: res.data,
          driverNum: res.data
        })
      },
    });
    /*支付宝 */
    wx.getStorage({
      key: 'pay_number',
      success: function (res) {
        that.setData({
          pay_number: res.data,
        })
      },
    })
  },
  /*
   * 页面显示
   */
  onShow: function () {
    //设置页面高度
    var height = app.setHeight(160);
    this.setData({
      winHeight: height
    })
    if (this.data.currentTab == 1) {
      this.switchNav({ target: { id: 0 } });
    }
    if (this.data.onloaded) this.requestData();    //首页打开时，onloaded为false，则不请求数据
    this.setData({
      onloaded: true
    })
    //拉取首页小公告
    wx.request({
      url: app.globalData.apiUrl + '/notice/showHeadingNotice',
      success: res => {
        console.log(res);
        if (res.data.code === 200 && res.data.data != null && res.data.data != ''){
          this.setData({
            notice: res.data.data
          })
          wx.setStorage({
            key: 'noticeHeading',
            data: res.data.data,
          })
        }else{
          wx.getStorage({
            key: 'noticeHeading',
            success: res => {
              if (res.data != null && res.data != ''){
                this.setData({
                  notice: res.data
                })
              }
            }
          })
        }
      },
      fail: ()=>{
        wx.getStorage({
          key: 'noticeHeading',
          success: res => {
            this.setData({
              notice: res.data
            })
          }
        })
      }
    })
  },

  /*  
   *  带输入框的模态框   车主点击订单之后出现
   */
  modalinput: function (e) {
    //获取用户名
    if (this.data.nickName == "正在获取用户名...") {
      var timer = setInterval(() => {
        this.setData({
          nickName: app.globalData.userInfo.nickName
        })
        if (this.data.nickName != "正在获取用户名...") {
          clearInterval(timer);
        }
      }, 1000);
    }
    console.log(e.currentTarget.id)
    this.setData({
      orderIndex: e.currentTarget.id,
      hiddenmodalput: !this.data.hiddenmodalput
    })
  },
  //取消按钮  
  cancelMsg: function () {
    this.setData({
      hiddenmodalput: true
    });
  },
  //确认  
  confirmMsg: function () {
    var that = this;
    var resNum = /0?(13|14|15|17|18|19)[0-9]{9}/;
    var rsNum = resNum.test(this.data.driverNum);
    if (rsNum && this.data.nickName !== '正在获取用户名...') {
      //缓存手机号码和支付宝
      wx.setStorage({
        key: 'phone',
        data: that.data.driverNum,
      })
      wx.setStorage({
        key: 'pay_number',
        data: that.data.pay_number,
      })
      /*
     *接口2   提交车主姓名及号码
     */
      console.log(app.globalData.agreeItem && app.globalData.userInfo)
      if (app.globalData.u_id) {
        //传递的数据
        wx.request({
          url: app.globalData.apiUrl + '/Discovery/TakeOrder',
          method: "GET",
          data: {
            "u_id": app.globalData.u_id,
            "j_id": this.data.orderList[this.data.orderIndex].j_id,
            "identity": this.data.orderList[this.data.orderIndex].identity,
            'c_name': this.data.nickName,
            'c_phone': this.data.driverNum,
            'pay_number': this.data.pay_number
          },
          header: {
            'content-type': 'application/json' // 默认值
          },
          success: function (res) {
            console.log(res)
            that.setData({
              hiddenmodalput: true
            });
            //假设code=0代表成功接单   提示车主到我的->行程查看客户信息
            if (res.data.code === 200) {
              wx.showModal({
                title: '接单成功',
                content: '请在“我的—>行程”中查看详情',
                showCancel: false,
                success: function (res) {
                  if (res.confirm) {
                    wx.navigateTo({
                      url: '/pages/trip/trip',
                    })
                  }
                }
              })
            }
            else if (res.data.code === 400) {  //接单失败的提示
              utils.statusTip(400,res);
            }else{                            //其他未知错误
              utils.statusTip(500);
            }
          },
          fail: function () {
            utils.statusTip(0);
          },
          complete: function(){
            that.requestData();
          }
        })
      } else {
        utils.statusTip(0);
      }
    } else {
      utils.statusTip(1);
    }
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    wx.showNavigationBarLoading();
    this.requestData();
  },
  //请求订单列表
  requestData: function () {
    wx.request({
      url: app.globalData.apiUrl + '/Discovery/findAll',
      success: res => {
        console.log(res)
        //取消加载
        wx.hideNavigationBarLoading()
        wx.stopPullDownRefresh();
        if (res.data.code === 200) {
          this.setData({
            orderList: res.data.data
          })
          this.isNullShow();
          //转化“毫秒”为“时：分”
          var timeArray = new Array();
          for (var i = 0; i < this.data.orderList.length; i++) {
            console.log(app.formatTime(this.data.orderList[i].start_time))
            timeArray.push(app.formatTime(this.data.orderList[i].start_time));
          }
          this.setData({
            timeArray: timeArray
          })
        } else {
          //取消加载
          wx.hideNavigationBarLoading()
          wx.stopPullDownRefresh();
          wx.showToast({
            title: res.data.msg,
            icon: "none"
          })
          this.isNullShow();
        }
      },
      fail: res => {
        console.log(res);
        //取消加载
        wx.hideNavigationBarLoading()
        wx.stopPullDownRefresh();
        this.isNullShow(); 
        utils.statusTip(0);
      }
    })
  },
  //判断两个页面是否分别有数据
  isNullShow: function () {
    var noNullOne = false;
    var noNullTwo = false;
    for (var i = 0; i < this.data.orderList.length; i++) {
      if (this.data.orderList[i].identity === "0") noNullOne = true;
      if (this.data.orderList[i].identity === "1") noNullTwo = true;
    }
    if (!noNullOne) {   //即无订单
      this.setData({
        isNullOrder1: true
      })
    }else{
      this.setData({
        isNullOrder1: false
      })
    }
    if (!noNullTwo) {
      this.setData({
        isNullOrder2: true
      })
    }else{
      this.setData({
        isNullOrder2: false
      })
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () { },

  //切换导航
  switchNav: function (e) {
    var id = e.target.id;
    if (this.data.currentTab == id) {
      return false;
    } else{
      if(this.data.count == 0){
        this.setData({
          currentTab: id,
          flag: id,
          count: this.data.count+1
        })
      }else{
        setTimeout(()=>{
          this.setData({
            currentTab: id,
            flag: id,
            count: this.data.count+1
          })
        },550);
      }
    }
  },
  //滑动页面
  swiperChange: function (e) {
    this.requestData();
    this.setData({
      currentTab: e.detail.current,
      flag: e.detail.current
    })
  },
  onMessage: function (res) {
    this.setData({ data: res.data });
    console.log(res);
  },
  preventTouchMove: function(){}
})