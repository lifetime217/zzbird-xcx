// pages/owner/company/classBill/classBill.js
var app = getApp();
var util = require('../../../../util/util.js');
var domainUrl = app.globalData.domainUrl;
var http = require("../../../../util/request/request.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    hasMore: true, //判断是否还有跟多
    hasData:true,//判断是否有数据
    monthList: [], //月份集合
    page:'',//月分页参数的页数
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

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;
    that.queryClassBill(1);
  },
  /**
   * 查询课时账单
   */
  queryClassBill: function(page){
    var that = this;
    that.showLoad();
    return new Promise((resolve, reject) => {
      var that = this;
      http.httpPost(domainUrl + "/api/dakarecord/queryCompanyToClassBill", {
        "page": page
      }).then((res) => {
        var data = res.data;
        //查询成功
        if (data.statusCode == 200) {
          var monthList = data.data;
          var oldList = that.data.monthList;
          var myHasMore = (data.page * data.pageSize) < data.totalRow;
          //分页的叠加数据
          if (data.page > 1 && oldList.length > 0) {
            for (var i = 0; i < monthList.length; i++) {
              oldList.push(monthList[i])
            }
            //封装数据
            that.setData({
              page: data.page,
              monthList: oldList,
              hasMore: myHasMore,
              hasData: true,
            })
            //判断没有查询到数据
          } else if (monthList.length == 0 && data.page == 1) {
            //封装数据
            that.setData({
              page: data.page,
              monthList: [],
              hasMore: myHasMore,
              hasData: false,
            })
          } else {
            //首次加载数据
            that.setData({
              page: data.page,
              monthList: monthList,
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
  * 页面相关事件处理函数--监听用户下拉动作
  */
  onPullDownRefresh: function () {
    var that = this;
    that.queryClassBill(1);
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    var that = this;
    var page = that.data.page + 1;
    var hasMore = that.data.hasMore;
    if (hasMore) {
      that.queryClassBill(page);
    }
  }
})