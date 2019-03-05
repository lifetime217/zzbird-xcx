// pages/owner/student/punchClockRecord/punchClockRecord.js
var app = getApp();
var util = require('../../../../util/util.js');
var domainUrl = app.globalData.domainUrl;
var http = require("../../../../util/request/request.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    page: 0,
    pageSize: 20,
    channel: false,
    statDate: 0,
    endDate: 0,
    punchList:[],
  },

  // 显示加载框
  showLoad: function () {
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
  },
  // 隐藏加载框
  hideTime: function () {
    setTimeout(function () {
      wx.hideLoading();
    }, 1000);
  },

  choiceItem: function(e) {
    var item = e.currentTarget.dataset.item;
    if (item == 1) {

    }
    if (item == 2) {
      if (this.data.channel) {
        this.setData({
          channel: false
        });
      } else {
        this.setData({
          channel: true
        });
      }
    }
  },
  chiceIndex: function(e) {
    var item = e.currentTarget.dataset.item;
  },

  //变更开始日期和结束日期，传入下标
  changeDateType: function(index) {
    var that = this;
    let now = new Date();
    let year = now.getFullYear();
    let month = now.getMonth();
    //按当月查询
    if (index == 0) {
      var statDate = util.getTimestamp(new Date(year + "-" + (month + 1) + "-1"));
      var endDate = util.getTimestamp(new Date());
      that.data.statDate = statDate;
      that.data.endDate = endDate;
      //按最近一个季度
    }
    if (index == 1) {
      var statDate = util.getTimestamp(new Date(year, that.getQuarterStartMonth(), 1));
      var endDate = util.getTimestamp(new Date());
      that.data.statDate = statDate;
      that.data.endDate = endDate;
      //最近一年
    }
    if (index == 2) {
      var statDate = util.getTimestamp(new Date(year, 0, 1));
      var endDate = util.getTimestamp(new Date());
      that.data.statDate = statDate;
      that.data.endDate = endDate;
    }
  },

  getQuarterStartMonth: function () {
    let now = new Date();
    let nowMonth = now.getMonth();
    var quarterStartMonth = 0;
    if (nowMonth < 3) {
      quarterStartMonth = 0;
    }
    if (2 < nowMonth && nowMonth < 6) {
      quarterStartMonth = 3;
    }
    if (5 < nowMonth && nowMonth < 9) {
      quarterStartMonth = 6;
    }
    if (nowMonth > 8) {
      quarterStartMonth = 9;
    }
    return quarterStartMonth;
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;
    var openid = app.globalData.openid;
    var roleType = app.globalData.roleType;
    var companyid = app.globalData.companyid;
    var statDate = that.data.statDate;
    var endDate = that.data.endDate;
    that.changeDateType(0);
  },
  /**
   * 查询打卡记录按时间查询
   */
  queryPunchClockList: function (page, pageSize, openId, companyId, statDate, endDate){
    var that = this;
    that.showLoad();
    return new Promise((resolve, reject) => {
      var that = this;
      http.httpPost(domainUrl + "", {
        "page": page,
        "openId": openId,
        "companyId": companyId,
        "statDate": statDate,
        "endDate": endDate,
        "pageSize": pageSize
      }).then((res) => {
        
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