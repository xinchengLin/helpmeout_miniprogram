// pages/chatPage/chatPage.js
var app = getApp();
var utils = require('../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    height: 0,
    scrollTop: 0,
    hisId: '',   //用his泛指聊天对象
    hisName: '',
    myMsg: [
    // {
    //   speakerId: '1',
    //   speakerName: 'caicai',
    //   identity: 0,
    //   msg: 'eee',
    //   time: "2018/6/12 21:46"
    // }, {
    //   speakerId: '1',
    //   speakerName: 'caicai',
    //   identity: 1,
    //   msg: 'aaa',
    //   time: "2018/6/12 21:46"
    // }
    ],
    inputText: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options);  //{'userId': '123','userName': 'caicai'}
    //设置页面高度
    var height = app.setHeight(120);
    this.setData({
      height: height
    })
    this.setData({
      journeyId: options.journeyId,
      hisId: options.userId,
      hisName: options.userName
    })
    utils.getChattingRecord(null, this);   //这里要放在上述setData后面，否则this.data.journeyId为undefined
    wx.setNavigationBarTitle({
      title: options.userName
    })
  },

  /*
  *完成消息输入
  */
  inputFinish: function(e){
    this.setData({
      inputText: e.detail.value
    })
  },

  /*
  *发送消息
  */
  sendMsg: function (e) {
    var msg = e.detail.value.inputText;
    if (msg != '') {
      utils.sendMessage({ 
        "journeyId": this.data.journeyId, 
        "hisId": this.data.hisId, 
        "myName": app.globalData.userInfo.nickName, 
        "content": msg 
      },this);
    }
  },

  /*
  *获取聊天记录
  */
  chattingRecord: function(res){    //utils中传过来的聊天记录
    console.log(res);
    var top = res.length-1;
    var journeyId = this.data.journeyId;
    while(top>=0){
      if (res[top].journeyId !== journeyId){
        top--;
      }else{
        this.setData({
          myMsg: res[top].chattingContent
        })
        this.getScrollHeight();
        break;
      }
    }
  },

  /*
  *获取聊天内容高度，保持置底
  */
  getScrollHeight: function(){
    var query = wx.createSelectorQuery();
    query.select('#scrollSelector').boundingClientRect();
    query.exec( (res)=> {
      console.log("scroll节点信息");
      console.log(res);
      this.setData({
        scrollTop: res[0].height
      })
    })
  },
  /**
   * 发送信息时的几个状态处理
   */
  handle: {
    sendSuccess: (page) => {
      //将我发送的消息存到缓存
      utils.getChattingRecord({
        journeyId: page.data.journeyId,
        chattingContent: {
          speakerId: app.globalData.u_id,
          speakerName: app.globalData.userInfo.nickName,
          identity: 0,
          msg: page.data.inputText,
          time: utils.formatTime(new Date())
        }
      }, page);
    },
    sendFail: (page) => {
      wx.showToast({
        title: '发送失败，请检查网络是否正常',
        icon: 'none'
      })
    },
    clearContent: (page) => {
      page.setData({
        inputText: ''
      })
    }
  }
})