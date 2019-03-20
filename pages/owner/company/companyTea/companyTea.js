// pages/owner/company/companyTea/companyTea.js
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
    userList: [], //学生的集合
    page: '', //分页的页数
    hasData: true,//是否页面有数据
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
  onLoad: function (options) {
    var that = this;
    that.setData({
      page: 1
    })
    that.queryUserList(that.data.page);
  },
  queryUserList: function (page) {
    var that = this;
    that.showLoad();
    return new Promise((resolve, reject) => {
      var that = this;
      http.httpPost(domainUrl + "/api/companycourseuser/queryCompanyUser", {
        "page": page,
        "roleType": 20
      }).then((res) => {
        var data = res.data;
        //查询成功
        if (data.statusCode == 200) {
          var userList = data.data;
          var oldList = that.data.userList;
          var myHasMore = (data.page * data.pageSize) < data.totalRow;
          //分页的叠加数据
          if (data.page > 1 && oldList.length > 0) {
            for (var i = 0; i < userList.length; i++) {
              oldList.push(userList[i])
            }
            //封装数据
            that.setData({
              page: data.page,
              userList: oldList,
              hasMore: myHasMore,
              hasData: true,
            })
            //判断没有查询到数据
          } else if (userList.length == 0 && data.page == 1) {
            //封装数据
            that.setData({
              page: data.page,
              userList: [],
              hasMore: myHasMore,
              hasData: false,
            })
          } else {
            //首次加载数据
            that.setData({
              page: data.page,
              userList: userList,
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
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    var that = this;
    that.queryUserList(1);
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
      that.queryUserList(page);
    }

  }


})