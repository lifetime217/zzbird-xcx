// pages/owner/message/message.js
var app = getApp();
var util = require('../../../util/util.js');
var domainUrl = app.globalData.domainUrl;
var http = require("../../../util/request/request.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    hasMore: true, //判断是否还有跟多
    messageList: [], //学生的集合
    page: '', //分页的页数
    hasData: true, //是否页面有数据
    index:-1,
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
    that.setData({
      page: 1,
      fastload: true,
    })
    that.queryMessageList(that.data.page);
  },
  /**
   * 判断日期是否是今天
   */
  isToday: function(str) {
    var d = new Date(str.replace(/-/g, "/"));
    var todaysDate = new Date();
    var dd = d.setHours(0, 0, 0, 0);
    var t = todaysDate.setHours(0, 0, 0, 0)
    if (dd == t) {
      return true;
    } else {
      return false;
    }
  },
  /**
   * 变更日期格式
   */
  changeDate: function(list) {
    var that = this;
    if (list.length != 0) {
      for (var i = 0; i < list.length; i++) {
        if (that.isToday(list[i].addTime)) {
          var l = list[i].addTime.length
          var time = list[i].addTime.substring(11, l)
          list[i].addTime = time;
          list[i].isToday = true;
        } else {
          list[i].isToday = false;
        }

      }
    }
  },

  /**
   * 查看消息详情
   */
  lookMsg: function(e) {
    var that = this;
    var id = e.currentTarget.dataset.id;
    var index = e.currentTarget.dataset.index;
    http.httpPost(domainUrl + "/api/message/updateRead", {
      "id": id
    }).then((res) => {
      if (res.data.statusCode = 200) {
        wx.navigateTo({
          url: '../messageDetails/messageDetails?id=' + id
        })
        that.setData({
          index:index,
        })

      } else {
        wx.showModal({
          content: '网络异常',
          showCancel: false,
        })
      }
    }).catch((errMsg) => {
      wx.showModal({
        content: '网络异常',
        showCancel: false,
      })
    });

  },
  /**
   * 查询消息列表
   */
  queryMessageList: function(page) {
    var that = this;
    that.showLoad();
    return new Promise((resolve, reject) => {
      var that = this;
      http.httpPost(domainUrl + "/api/message/getMessageList", {
        "page": page
      }).then((res) => {
        var data = res.data;
        //查询成功
        if (data.statusCode == 200) {
          var messageList = data.data;
          var oldList = that.data.messageList;
          var myHasMore = (data.page * data.pageSize) < data.totalRow;
          that.changeDate(messageList);
          //分页的叠加数据
          if (data.page > 1 && oldList.length > 0) {
            for (var i = 0; i < messageList.length; i++) {
              oldList.push(messageList[i])
            }
            //封装数据
            that.setData({
              page: data.page,
              messageList: oldList,
              hasMore: myHasMore,
              hasData: true,
            })
            //判断没有查询到数据
          } else if (messageList.length == 0 && data.page == 1) {
            //封装数据
            that.setData({
              page: data.page,
              messageList: [],
              hasMore: myHasMore,
              hasData: false,
            })
          } else {
            //首次加载数据
            that.setData({
              page: data.page,
              messageList: messageList,
              hasMore: myHasMore,
              hasData: true,
            })
          }
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
    var that = this;
    if(that.data.index >-1){
      var messageList = that.data.messageList;
      messageList[that.data.index].read = 1
      that.setData({
        messageList: messageList
      })
    }
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
    var that = this;
    that.queryMessageList(1);
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    var that = this;
    var page = that.data.page + 1;
    var hasMore = that.data.hasMore;
    if (hasMore) {
      that.queryMessageList(page);
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})