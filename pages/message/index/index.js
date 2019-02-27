// miniprogram/pages/message/index/index.js
var app = getApp();
var util = require('../../../util/util.js');
var http = require('../../../util/request/request.js');
var domainUrl = app.globalData.domainUrl;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentTab: 0,
    messageList: [],
    page: 1,
    isType: 0, //消息类型：0系统，1邀请，2打卡
    hasData: false, //是否有数据 true为有数据 false是没有数据的
    hasMore: true, //分页判断是否有下一页
    isFirstRequest: true, // 是否是第一次请求数据
  },
  /**
   * 判断是否是今天的数据 是显示为红色，不是显示的日期
   */
  convertTime: function(data) {
    var date = util.getDate(); // 获取当前的日期
    for (var i = 0; i < data.length; i++) {
      var convertTime = data[i].createtime.substring(0, 10); //转换时间
      if (convertTime.substring(0, 10) == date) {
        data[i].isDay = true; // 数据是今天的
        data[i].createtime = util.formatTime(data[i].createtime).substring(11, 16);

      } else {
        data[i].isDay = false; // 数据不是今天的
        data[i].createtime = convertTime.substring(0, 10);
      }
    }
    return data;
  },
  /**
   * 请求消息列表
   * 根据每个用户的openid查询消息列表
   */
  requestMessage: function(page) {
    var that = this;
    that.showLoad();
    var openid = app.globalData.openid; //获取当前登录人的openid
    var roleType = app.globalData.roleType; //获取当前登录人的roleType
    var companyId = app.globalData.companyId; //获取当前登录人的公司Id
    http.httpPost(domainUrl + "/msg/selectAll", {
      "acceptOpenid": openid,
      "companyId": companyId,
      "role": roleType,
      "page": page
    }).then((res) => {
      var pageObjec = res.data.data;
      console.log(res)
      var data = res.data;
      var httpList = data.data.rows;
      var convertData = that.convertTime(httpList);
      // 是否有展示数据
      var hasData = true;
      if (that.data.isFirstRequest) {
        hasData = convertData.length != 0;
        // 重新赋值不是第一次请求方法
        that.setData({
          isFirstRequest: false,
          hasData: hasData
        });
      }
      var myHasMore = (pageObjec.page * pageObjec.pageSize) < pageObjec.records
      if (page > 1 && httpList.length != 0) {
        //加载第一页之后的页面
        var oldList = that.data.messageList;
        for (var i = 0; i < convertData.length; i++) {
          oldList.push(convertData[i]);
        }
        that.setData({
          messageList: oldList,
          hasData: hasData,
          hasMore: myHasMore,
          page: pageObjec.page,
        });
      } else if (httpList.length == 0 && page == 1) {
        //没有数据加载
        that.setData({
          messageList: [],
          hasData: hasData,
          hasMore: myHasMore,
          page: pageObjec.page,
        });

      } else {
        //加载第一页
        that.setData({
          messageList: convertData,
          hasData: hasData,
          hasMore: myHasMore,
          page: pageObjec.page,
        });
      }

      console.log(convertData)
      that.hideTime();
    }).catch((errMsg) => {
      wx.showModal({
        content: '网络异常',
        showCancel: false,
      })
    });


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
    that.requestMessage(1);
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
  // 删除消息
  deleteMessage: function(e) {
    var that = this;
    var id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '提示',
      content: '是否删除该消息',
      success: function(res) {
        if (res.confirm) {
          that.showLoad();
          http.httpPost(domainUrl + "/msg/delete", {
            "id": id
          }).then((res) => {
            if (res.data.success) {
              that.onLoad();
            }
            that.hideTime();
          }).catch((errMsg) => {
            that.hideTime();
            wx.showModal({
              content: '网络异常',
              showCancel: false,
            })
          });
        } else if (res.cancel) {}
      }
    })
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function(e) {
    this.setData({
      isFirstRequest: true,
      hasData: true
    })
    this.requestMessage(1);
    wx.stopPullDownRefresh();
  },
  onReachBottom: function(e) {
    if (this.data.hasMore) {
      var myPage = this.data.page + 1;
      this.requestMessage(myPage);
    }
  },

})