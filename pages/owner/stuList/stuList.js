// miniprogram/pages/owner/stuList/stuList.js
var app = getApp();
var domainUrl = app.globalData.domainUrl;
var http = require("../../../util/request/request.js");
Page({
  /**
   * 页面的初始数据
   */
  data: {
    stuList: [],
    page: 1,
    pageSize: 20,
    hasMore: true,
    openId: '',
    companyId: '',
    courseList: [], //课程集合
    hasData: true, //是否有数据 true为有数据 false是没有数据的
    isFirstRequest: true // 是否是第一次请求数据
  },
  /**
   * 更多课程
   */
  moreCourse: function(e) {
    var index = e.currentTarget.dataset.index;
    var stuList = this.data.stuList;
    var courseList = stuList[index].courseList
    this.setData({
      courseList: courseList
    });
    this.moreCourseToast.show();
  },
  // 显示加载框
  showLoad: function() {
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
  },

  /**
   * 跳转课程
   */
  navCourse: function(e) {
    var courseId = e.currentTarget.dataset.courseid;
    wx.navigateTo({
      url: '../../course/courseDetail/courseDetail?id=' + courseId
    })
  },
  /**
   * 跳转公司
   */
  navCompany: function(e) {
    var companyid = e.currentTarget.dataset.companyid;
    wx.navigateTo({
      url: '../../cardCase/enterpriseCard/enterpriseCard?companyId=' + companyid
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
    var openid = app.globalData.openid;
    var companyid = app.globalData.companyId;
    var roleType = app.globalData.roleType;
    that.setData({
      openId: openid,
      companyId: companyid,
    })
    that.showLoad();
    if (roleType == 0) {

    } else if (roleType == 1) {
      var page = that.data.page;
      that.queryStu(page, openid, companyid)
      that.hideTime();
    }
  },
  /**
   * 查询学生列表
   */
  queryStu: function(page, openId, companyId) {
    return new Promise((resolve, reject) => {
      var that = this;
      http.httpPost(domainUrl + "/course/getTeacherSpupil", {
        "page": page,
        "openId": openId,
        "companyId": companyId
      }).then((res) => {
        var data = res.data;
        if (res.code = 200 && data.success) {
          if (data.data != null) {
            var newStuList = data.data.rows;
            var pageObject = data.data;
            var myHasMore = (pageObject.page * pageObject.pageSize) < data.count
            var hasData = true;
            if (that.data.isFirstRequest) {
              hasData = newStuList.length != 0;
              // 重新赋值不是第一次请求方法
              that.setData({
                isFirstRequest: false,
                hasData: hasData
              });
            }
            if (pageObject.page > 1 && newStuList.length != 0) {
              var oldList = that.data.stuList;
              for (var i = 0; i < newStuList.length; i++) {
                oldList.push(newStuList[i])
              }
              that.setData({
                stuList: oldList,
                hasMore: myHasMore,
                page: pageObject.page,
              })
            } else(
              that.setData({
                stuList: newStuList,
                hasMore: myHasMore,
                page: pageObject.page,
              })
            )
          }
        } else {
          that.hideTime();
          wx.showModal({
            content: data.msg,
            showCancel: false,
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
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    var openid = app.globalData.openid;
    var companyid = app.globalData.companyId;
    this.setData({
      isFirstRequest: true,
      hasData: true
    })
    this.queryStu(1, openid, companyid)
    wx.stopPullDownRefresh();
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function(options) {
    this.moreCourseToast = this.selectComponent("#moreCourseToast");
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    if (this.data.hasMore) { //判断是否还有更多
      // this.showLoad();
      var myPage = this.data.page + 1;
      var openId = this.data.openId;
      var companyId = this.data.companyId;
      this.queryStu(myPage, openId, companyId);
    }

  },
})