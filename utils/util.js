const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

const statusTip = (i,res) => {   //i状态，res传递返回的提示信息
  //0:缓存中没有u_id的情况；1:
  switch(i){
    case 0: {
      wx.showToast({
        title: '请求出错，检查网络状况是否正常或重启小程序试试吧:)',
        icon: "none"
      })
      break;
    }
    case 1: {
      wx.showToast({
        title: '请确认信息无误后再发布哦',
        icon: "none"
      })
      break;
    }
    case 200: {
      wx.showToast({
        title: '取消成功',
      })
      break;
    }
    case 400: {
      wx.showToast({
        title: res.data.msg,
        icon: 'none'
      })
      break;
    }
    case 500: {
      wx.showToast({
        title: '请求出现错误啦~可以试试重启小程序',
        icon: 'none'
      })
      break;
    }
  }
}

//发送信息
function sendMessage(sendMsg,page) {
  var sendMsg = sendMsg;     //{ "hisId": "", "content": "" }
  wx.sendSocketMessage({
    data: JSON.stringify(sendMsg),
    success: function (res) {
      console.log("发送成功,您发送的内容为");
      console.log(sendMsg);
      page.handle.sendSuccess(page);
    },
    fail: function (res) {
      page.handle.sendFail(page);
    },
    complete: function(){
      page.handle.clearContent(page);
    }
  })
}

const answerReceive = res => {
  if (res.data !== "会话已连接" && res.data !== 'Got your msg !ping' && res.data != 'Got your msg !') {
    var resArray = JSON.parse(res.data);
    if(resArray.length>0){
      wx.setStorage({
        key: 'notificationList',
        data: resArray,
      })
      var pages = getCurrentPages();
      var currentPage = pages[pages.length-1];
      var url = currentPage.route;
      console.log("当前页面为：" + url);
      if (resArray.length == 1){
        if(url == "pages/chatPage/chatPage" && resArray[0].code == 4){
          var hisMsg = {
            journeyId: resArray[0].journeyId,
            chattingContent: {
              speakerId: resArray[0].fromUserId,
              speakerName: resArray[0].fromUserName,
              identity: 1,
              time: formatTime(new Date(resArray[0].time)),
              msg: resArray[0].content
            }
          }
          getChattingRecord(hisMsg, currentPage);
        }else{
          wx.showModal({
            title: '新消息通知',
            content: '您有新的消息啦~快去查看吧',
            showCancel: false,
            success: function (res) {
              if (res.confirm) {
                wx.reLaunch({
                  url: '/pages/notification/notification',
                })
              }
            }
          })
          var hisMsg = {
            journeyId: resArray[0].journeyId,
            chattingContent: {
              speakerId: resArray[0].fromUserId,
              speakerName: resArray[0].fromUserName,
              identity: 1,
              time: formatTime(new Date(resArray[0].time)),
              msg: resArray[0].content
            }
          }
          getChattingRecord(hisMsg);
        }
      }else if (resArray.length>1){
        wx.showModal({
          title: '新消息通知',
          content: '您有新的消息啦~快去查看吧',
          showCancel: false,
          success: function (res) {
            if (res.confirm) {
              wx.reLaunch({
                url: '/pages/notification/notification',
              })
            }
          }
        })
        for (var i = 0; i < resArray.length; i++) {
          var hisMsg = null;
          if(resArray[i].code == 4){
            hisMsg = {
              journeyId: resArray[i].journeyId,
              chattingContent:{
                speakerId: resArray[i].fromUserId,
                speakerName: resArray[i].fromUserName,
                identity: 1,
                time: formatTime(new Date(resArray[i].time)),
                msg: resArray[i].content
              }
            }
            getChattingRecord(hisMsg);
          }
        }
      }
      return resArray;
    }
  }
}

const getChattingRecord = (record,page) => {  //record:{journeyId:'',chattingContent:{}}
console.log("page为：");
console.log(page);
  var chattingArray = new Array();
  var isJourneyId = false;
  try {
    var value = wx.getStorageSync('chattingArray')
    if (value) {    //缓存中存在该条数据
      chattingArray = value;
      if (record != null) {
        for (var i = 0; i < chattingArray.length; i++) {
          if (record.journeyId == chattingArray[i].journeyId) {
            console.log("将会被push的记录");
            console.log(record.chattingContent); 
            chattingArray[i].chattingContent.push(record.chattingContent);
            isJourneyId = true;
            break;
          }
        }
        if (isJourneyId !== true) {
          chattingArray.push({ journeyId: '', chattingContent: [] });
          chattingArray[chattingArray.length - 1].journeyId = record.journeyId;
          chattingArray[chattingArray.length - 1].chattingContent.push(record.chattingContent)
        }
        console.log("success里打印chattingArray[chattingArray.length - 1]");
        console.log(chattingArray[chattingArray.length - 1]);
        try {
          wx.setStorageSync('chattingArray', chattingArray)
        } catch (e) {
          console.log("setStorageSync catch error");
        }
      }
    }else{         //缓存中不存在该条数据
      if (record != null) {
        console.log("缓存中不存在该j_id的数据");
        chattingArray[chattingArray.length] = { journeyId: '', chattingContent: [] };
        chattingArray[chattingArray.length - 1].journeyId = record.journeyId;
        chattingArray[chattingArray.length - 1].chattingContent.push(record.chattingContent)
        console.log("fail里打印chattingArray[chattingArray.length - 1]");
        console.log(chattingArray[chattingArray.length - 1]);
        try {
          wx.setStorageSync('chattingArray', chattingArray)
        } catch (e) {
          console.log("setStorageSync catch error");
        }
      }
    }
    if (page != null) {
      page.chattingRecord(chattingArray);
    }
  } catch (e) {
    console.log("getStorageSync catch error");
  }
}

module.exports = {
  formatTime: formatTime,
  sendMessage: sendMessage, 
  answerReceive: answerReceive,
  statusTip: statusTip,
  getChattingRecord: getChattingRecord
}
