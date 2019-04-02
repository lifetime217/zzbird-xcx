// pages/owner/messageDetails/messageDetails.js
var app = getApp();
var util = require('../../../util/util.js');
var domainUrl = app.globalData.domainUrl;
var http = require("../../../util/request/request.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    msg: {}, //消息对象
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
    var id = options.id;
    this.queryMessageDetails(id);
  },
  /**
   * 查询消息详情
   */
  queryMessageDetails: function(id) {
    var that = this;
    that.showLoad();
    return new Promise((resolve, reject) => {
      var that = this;
      http.httpPost(domainUrl + "/api/message/selectMessageDetails", {
        "id": id
      }).then((res) => {
        var data = res.data;
        //查询成功
        if (data.statusCode == 200) {
          var msg = data.data;
          var date = msg.addTime;
          var year = date.substring(0, 4);
          var month = date.substring(5, 7);
          var day = date.substring(8, 10);
          var time = date.substring(11, date.length-3);

          var newDate = year + "年" + month + "月" + day + "日 " + time
          msg.addTime = newDate;
          that.setData({
            msg: msg,
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
  }
})