// pages/owner/updateUser/updateUser.js
var app = getApp();
var util = require('../../../util/util.js');
var domainUrl = app.globalData.domainUrl;
var http = require("../../../util/request/request.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgUrl: '', // 图片的url
    nickName: '' // 昵称
  },

  // 显示加载框
  showLoad: function() {
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
  },
  // 隐藏加载框
  hideTime: function() {
    setTimeout(function() {
      wx.hideLoading();
    }, 1000);
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;
    that.queryUserRole();
  },

  /**
   * 保存输入的姓名
   */
  inputName: function(e) {
    var input = e.detail.value;
    if (input.length < 15) {
      this.setData({
        nickName: input
      });
    }
  },


  /**
   * 选择图片
   */
  checkpicture: function() {
    var that = this;
    var imgUrl = that.data.imgUrl;
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'], //使用的压缩图还是原图片
      sourceType: ['album', 'camera'], //使用相册和相机
      success: function(res) {
        if (res.errMsg == "chooseImage:ok") {
          wx.showLoading({
            title: '上传中',
          })
          var tempFiles = res.tempFiles;
          // 判断选择多张图片时图片的大小

          if (tempFiles[0].size >= 5242880) {
            wx.showToast({
              title: '上传图片不能大于5M!',
              icon: 'none'
            })
            return;
          }
          wx.uploadFile({
            url: domainUrl + '/upload/pic?_t=' + new Date().getTime(),
            filePath: tempFiles[0].path,
            name: "img",
            header: {
              "Content-Type": "multipart/form-data",
              'accept': 'application/json'
            },
            //成功时执行函数
            success: function(res) {
              var data = JSON.parse(res.data);
              if (data.data.flag) {
                // 存入访问图片集合
                that.setData({
                  imgUrl: data.data.url
                });
              } else {
                wx.showModal({
                  content: '网络异常，上传失败，请重试！',
                  showCancel: false
                })
              }
            },
            //失败时执行函数
            fail: function(res) {
              wx.showModal({
                content: '网络异常，图片上传失败',
                showCancel: false
              })
            },
            //不管成功或失败都会执行
            complete: function() {
              wx.hideLoading();
            }
          })

        }
      },
      fail: e => {}
    })
  },


  /**
   * 查询用户信息
   */
  queryUserRole() {
    var that = this;
    that.showLoad();
    return new Promise((resolve, reject) => {
      var that = this;
      http.httpPost(domainUrl + "/api/xcxuserrole/selectUserRole", {

      }).then((res) => {
        var data = res.data;
        //查询成功
        if (data.statusCode == 200) {
          that.setData({
            imgUrl: data.data.headImg,
            nickName: data.data.roleName,
          })
        }
        that.hideTime();
      }).catch((errMsg) => {
        wx.showModal({
          content: '网络异常',
          showCancel: false,
        })
        that.hideTime();
      });
    })
  },

  /**
   * 更新信息
   */
  finish() {
    var that = this;
    if (that.data.nickName.length == '') {
      wx.showModal({
        content: '名称不能为空',
        showCancel: false,
      })
    }
    that.showLoad();
    return new Promise((resolve, reject) => {
      http.httpPost(domainUrl + "/api/xcxuserrole/updataUserRole", {
        imgUrl: that.data.imgUrl,
        nickName: that.data.nickName
      }).then((res) => {
        var data = res.data;
        //修改成功
        if (data.statusCode == 200) {
          wx.showToast({
            title: '修改成功',
            icon: "success",
            success: function() {
              setTimeout(function(){
                wx.navigateBack({ //返回
                  delta: 1
                })
                
              },500)
              app.globalData.ownerReload = false;
            }
          })

        }
        that.hideTime();
      }).catch((errMsg) => {
        wx.showModal({
          content: '网络异常',
          showCancel: false,
        })
        that.hideTime();
      });
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})