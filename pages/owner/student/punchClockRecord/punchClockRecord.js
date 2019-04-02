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
    channel: false, //选择时间列表
    statDate: 0, //开始日期
    endDate: 0, //结束日期
    monthList: [], //按月查的集合
    checkIndex: 0, //选择时间的下标索引
    layout: 0, //布局切换索引
    courseList: [], //按课程查询的聚合
    hasData: true, //判断是否有数据
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

  choiceItem: function(e) {
    var that = this;
    var item = e.currentTarget.dataset.item;
    var roleId = app.globalData.roleId;
    //按课程查询
    if (item == 1) {
      that.queryPunchClockListByCourse(roleId);
      that.setData({
        layout: 1,
        channel: false
      });
    }
    //按时间查询
    if (item == 2) {
      if (that.data.channel) {
        that.setData({
          channel: false,
        });
      } else {
        that.setData({
          channel: true
        });
      }
    }
  },
  chiceIndex: function(e) {
    var that = this;
    var item = e.currentTarget.dataset.index;
    that.changeDateType(item);
    var roleId = app.globalData.roleId;
    var statDate = that.data.statDate;
    var endDate = that.data.endDate;
    //当月
    if (item == 0) {
      that.queryPunchClockListByMonth(roleId, statDate, endDate);
      that.setData({
        checkIndex: item,
      });
    }
    //最近一个季度
    if (item == 1) {
      that.queryPunchClockListByMonth(roleId, statDate, endDate);
      that.setData({
        checkIndex: item,
      });
    }
    //最近一年
    if (item == 2) {
      that.queryPunchClockListByMonth(roleId, statDate, endDate);
      that.setData({
        checkIndex: item,
      });
    }
    that.setData({
      channel: false,
      layout: 0,
    });
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
  /**
   * 获取最近一个季度的函数
   */
  getQuarterStartMonth: function() {
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
    that.changeDateType(2);
    var roleId = app.globalData.roleId;
    var statDate = that.data.statDate;
    var endDate = that.data.endDate;
    endDate = "1577668188";
    that.queryPunchClockListByMonth(roleId, statDate, endDate);
  },
  /**
   * 查询打卡记录按时间查询
   */
  queryPunchClockListByMonth: function(roleId, statDate, endDate) {
    var that = this;
    that.showLoad();
    return new Promise((resolve, reject) => {
      var that = this;
      http.httpPost(domainUrl + "/api/dakarecord/queryPunchListByMonth", {
        "statDate": statDate,
        "endDate": endDate,
      }).then((res) => {
        var data = res.data;
        //查询成功
        if (data.statusCode == 200) {
          var monthList = res.data.data;
          if (monthList.length != 0) {
            //算出星期几
            for (var i = 0; i < monthList.length; i++) {
              var punchList = monthList[i].punchList;
              for (var j = 0; j < punchList.length; j++) {
                var date = that.getTime(punchList[j].dakaTime);
                var week = that.getWeek(date);
                punchList[j].week = week;
              }
            }
            //封装数据
            that.setData({
              monthList: monthList,
              hasData: true,
            })
          } else {
            that.setData({
              monthList: monthList,
              hasData: false,
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
   * 跟据日期算出是星期几
   */
  getWeek: function(time) {
    var weekArray = new Array("日", "一", "二", "三", "四", "五", "六");
    var week = time.getDay();
    return "星期" + weekArray[week];
  },
  /**
   * 字符串转为时间格式
   */
  getTime: function(timeStr) {
    var dateStr = timeStr.replace(/-/g, "/");
    return new Date(dateStr);
  },

  queryPunchClockListByCourse: function(roleId) {
    var that = this;
    that.showLoad();
    return new Promise((resolve, reject) => {
      var that = this;
      http.httpPost(domainUrl + "/api/dakarecord/queryPunchListByCourse", {
      }).then((res) => {
        var data = res.data;
        //查询成功
        if (data.statusCode == 200) {
          var courseList = res.data.data;
          if (courseList.length != 0) {
            //算出星期几
            for (var i = 0; i < courseList.length; i++) {
              var punchList = courseList[i].punchList;
              for (var j = 0; j < punchList.length; j++) {
                var date = that.getTime(punchList[j].dakaTime);
                var week = that.getWeek(date);
                punchList[j].week = week;
              }
            }
            //封装数据
            that.setData({
              courseList: courseList,
              hasData: true,
            })
          } else {
            that.setData({
              courseList: courseList,
              hasData: false,
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
  onPullDownRefresh: function() {
    var that = this;
    var layout = that.data.layout;
    var statDate = that.data.statDate;
    var enddate = that.data.endDate;
    var roleId = app.globalData.roleId;
    if (layout == 0) {
      that.queryPunchClockListByMonth(roleId, statDate, enddate);
    }
    if (layout == 1) {
      that.queryPunchClockListByCourse(roleId);
    }
    wx.stopPullDownRefresh();
  },

})