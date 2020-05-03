//app.js
var utils = require('utils/util.js');
App({
  onLaunch: function () {
    wx.removeStorage({
      key: 'notificationList'
    })
    this.checkUserInfo();
    this.getUid();
    this.startWebSocket();
  },
  onHide: function(){
    console.log("hide!");
    wx.closeSocket(); 
  },
  globalData: {
    userInfo: null,
    appid: 'wx855c82787f9fdcbe',
    secret: '357bc128ebb06af91df3a4cbd908fada',
    u_id: '',
    //apiUrl: 'https://www.itearlpickmeup.cn/pickmeup',
    // apiUrl: 'http://192.168.1.102:8080/pickmeup',
    //wsUrl: 'wss://www.itearlpickmeup.cn/pickmeup/getServer/',
    // wsUrl: 'ws://192.168.1.102:8080/pickmeup/getServer/',
    lockReconnect: false,
    socketOpen: false
  },

  //获取当前u_id
  getUid: function () {
    wx.getStorage({
      key: '3rd_session',
      success: res => {
        this.globalData.u_id = res.data;
        console.log(this.globalData.u_id);
      }
    })
  },

  //请求得到用户的u_id
  loginRequest: function () {
    wx.login({
      success: res => {
        wx.request({
          url: this.globalData.apiUrl + '/miniprogram/user/login_by_weixin',
          data: {
            "appid": this.globalData.appid,
            "code": res.code,
            "secret": this.globalData.secret
          },
          method: 'POST',
          header: { "Content-Type": "application/x-www-form-urlencoded" },
          // 在发送请求成功的部分，返回的数据是后台返回的3rd_session
          success: res => {
            console.log(res)
            if (res.data.code === 200) {
              wx.setStorage({
                key: "3rd_session",
                data: res.data.u_id
              })
              this.getUid();
            } else {
              wx.showToast({
                title: res.data.msg,
                icon: "none"
              })
            }
          },
          fail: function (res) {
            utils.statusTip(0);
          }
        })
      }
    })
  },
  checkLogin: function(){
    wx.checkSession({
      success: res => { //session_key 未过期，并且在本生命周期一直有效
        // var timer = setInterval(() => {    //定时器，获取u_id，直到获取到u_id才停下
        //   if(!this.globalData.u_id){
        //     console.log("缓存中没有u_id");
        //     this.loginRequest();
        //   } else {
        //     clearInterval(timer);
        //   }
        // },2000)
      },
      fail: res => {   // session_key 已经失效，需要重新执行登录流程
        this.loginRequest()
      }
    })
  },
  checkUserInfo: function(){
    console.log("不管从哪个页面进入都要checkUserInfo");
    var that = this;
    wx.getSetting({
      success: function (res) {
        if (res.authSetting['scope.userInfo']) {
          console.log("用户已授权");
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称
          wx.getUserInfo({
            success: function (res) {
              console.log(res.userInfo)
              that.globalData.userInfo = res.userInfo;
              that.checkLogin();
              wx.setStorage({
                key: 'nickName',
                data: res.userInfo.nickName
              })
            }
          })
        } else if (!res.authSetting['scope.userInfo']) {
          console.log("用户wei授权");
          wx.redirectTo({
            url: '/pages/index/index',
          })
        }
      }
    })
  },
  formatTime: function (time) {
    //参数time为从后台取到的毫秒数
    var dataTime = new Date(time);
    var y = dataTime.getFullYear();    //显示年
    var m = dataTime.getMonth() + 1;    //显示月
    m = m < 10 ? ('0' + m) : m;
    var d = dataTime.getDate();     //显示日
    d = d < 10 ? ('0' + d) : d;
    var h = dataTime.getHours();    //显示小时
    var minute = dataTime.getMinutes();     //显示分钟
    minute = minute < 10 ? ('0' + minute) : minute;
    return h + ':' + minute;     //返回最终时间y-m-d h-m
  },
  setHeight: function(otherHeight){
    var calc = 0;
    wx.getSystemInfo({
      success: function (res) {
        var clientHeight = res.windowHeight;
        var clientWidth = res.windowWidth;
        var rpxp = 750 / clientWidth;
        calc = clientHeight * rpxp - otherHeight;
      },
    })
    return calc;
  },
  startWebSocket: function () {
    this.WebSocketInit(this.globalData.wsUrl)
  },

  //连接websocket
  WebSocketInit: function (wsUrl) {
    var that = this;
    wsUrl = wsUrl + this.globalData.u_id;
    wx.connectSocket({
      url: wsUrl,
      data: {},
      method: 'GET',
      success: function (res) {
        console.log("connectSocket 成功")
      }
    })
    wx.onSocketOpen(function () {
      that.heartCheck.reset().start();
      that.globalData.socketOpen = true;
      // wx.sendSocketMessage({
      //   data: [],
      // })
      wx.onSocketMessage(function (res) {
        console.log("app.js中的onSocketMessage的res", res)
        utils.answerReceive(res);
        that.heartCheck.reset().start();
      })
    })
    wx.onSocketClose(function (res) {
      console.log("closeListener:webSocket close");
      that.reconnect();
    })
    wx.onSocketError(function (res) {
      console.log("closeListener:webSocket error");
      that.reconnect();
    })
  },

  reconnect: function(){
    var that = this;
    if(this.globalData.lockReconnect)  return;
    this.globalData.lockReconnect = true;
    setTimeout(function () {     //没连接上会一直重连，设置延迟避免请求过多
      that.startWebSocket();
      that.globalData.lockReconnect = false;
    }, 2000);
  },

  heartCheck: {
    timeout: 20000,   //定时发送心跳
    timeoutObj :null,
    serverTimeoutObj: null,
    reset: function(){
      clearTimeout(this.timeoutObj);
      clearTimeout(this.serverTimeoutObj);
      return this;
    },
    start: function(){
      var self = this;
      this.timeoutObj = setTimeout(function(){
        wx.sendSocketMessage({
          data: 'ping',
        })
        self.serverTimeoutObj = setTimeout(function () {  //超过一定时间还没重置(即后端没有返回消息)，说明后端主动断开
          wx.closeSocket()    //wx.closeSocket(),执行reconnect()
        }, self.timeout)
      },this.timeout);
    }
  }
})