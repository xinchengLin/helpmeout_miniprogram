// pages/myCode/myCode.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    codeUrl: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getFile();
  },
  chooseCode: function(){
    var that = this;
    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        console.log(res)
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        var tempFilePath = res.tempFilePaths[0];
        wx.getSavedFileList({
          success: function(res) {
            if(res.fileList.length>0){
              for (var i = 0; i < res.fileList.length;i++){
                wx.removeSavedFile({
                  filePath: res.fileList[i].filePath
                })
              }
              wx.saveFile({
                tempFilePath: tempFilePath,
                success: function (res) {
                  that.getFile();
                }
              })
            }else{
              wx.saveFile({
                tempFilePath: tempFilePath,
                success: function (res) {
                  that.getFile();
                }
              })
            }
          }
        })
      }
    })
  },
  previewCode: function(){
    wx.previewImage({
      current: '', // 当前显示图片的http链接
      urls: [this.data.codeUrl] // 需要预览的图片http链接列表
    })
  },
  getFile: function(){
    var that = this;
    wx.getSavedFileList({
      success: function(res) {
        console.log("当前保存的图片数"+res.fileList.length);
        if(res.fileList.length>0){
          that.setData({
            codeUrl: res.fileList[res.fileList.length - 1].filePath
          })
        }
      }
    })
  }
})