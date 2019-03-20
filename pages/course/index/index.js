// pages/course/index/index.js
var http = require('../../../util/request/request.js');
var app = getApp();
var domainUrl = app.globalData.domainUrl;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    courseList: [], //课程列表
    roleVal: 0, //角色  10 企业 20 老师 30 用户
    page: 1, //分页查询数据
    hasMore: false, //是否还有更多数据
    hasData: true, //是否有数据 true为有数据 false是没有数据的  用来是否展示无数据图片
    isFirstRequest: true, // 是否是第一次请求数据(page为1时)
  },
  /**
   * 新建课程
   */
  addCourse: function() {
    var that = this;
    wx.navigateTo({
      url: '../../init/addCourse/addCourse?type=addMoreCourse'
    })
  },
  /**
   * 阻止冒泡
   */
  stopBubbles: function() {
    console.log("阻止冒泡");
  },
  /**
   * 跳转到打卡页面
   */
  punchRecord: function(e) {
    var that = this;
    var id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '../punchClock/punchClock?id=' + id
    })
  },
  /**
   * 跳转课程详情
   */
  navCourseDetail: function(e) {
    var id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: "../courseDetail/courseDetail?type='nav'&courseId=" + id,
    })
  },
  /**
   * 查询课程列表
   */
  queryCouse: function(page) {
    var that = this;
    that.showLoad();
    http.httpPost(domainUrl + "/api/companycourseuser/queryCourseByUser", {
      "page": page
    }).then((res) => {
      if (res.data.statusCode == 200) {
        var data = res.data.data;
        var hasData = true; //是否有数据
        var courseList = data.courseList;
        //判断下一次是否可以继续上拉刷新
        var pageNumber = data.pageNumber;
        var totalRow = data.totalRow;
        var pageSize = data.pageSize;
        var hasMore = pageNumber * pageSize < totalRow;
        if (that.data.isFirstRequest) {
          hasData = courseList.length != 0;
          // 赋值isFirstRequest为false
          that.setData({
            isFirstRequest: false,
            hasData: hasData
          });
        }
        //合并数组
        var list;
        if (page > 1) {
          //查询第一页以后的数据
          var oldList = that.data.courseList;
          if (courseList.length != 0) {
            for (var i = 0; i < courseList.length; i++) {
              oldList.push(courseList[i]);
            }
          }
          list = oldList;
        } else {
          list = courseList;
        }

        that.setData({
          courseList: list,
          roleVal: app.globalData.roleVal,
          page: page,
          hasMore: hasMore
        });
      } else {
        wx.showModal({
          content: '网络异常',
          showCancel: false,
        })
      }
      that.hideTime();
      wx.stopPullDownRefresh();
    }).catch((errMsg) => {
      console.log(errMsg);
      wx.showModal({
        content: '网络异常',
        showCancel: false,
      })
      that.hideTime();
      wx.stopPullDownRefresh();
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // 隐藏右上角分享按钮
    wx.hideShareMenu()
    wx.showTabBar({
      aniamtion: true
    })
    this.queryCouse(1);
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
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    if (app.globalData.courseReload) {
      this.queryCouse(1);
      app.globalData.courseReload = false;
    }
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    this.queryCouse(1);
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    if (this.data.hasMore) {
      this.queryCouse(this.data.page);
    }
  },
  /**
   *  用户点击右上角分享
   */
  onShareAppMessage: function(res) {
    if (res.from == "button") {
      var invite = res.target.dataset.invite;
      var id = res.target.dataset.id;
      var companyName = res.target.dataset.companyname;
      var companyId = res.target.dataset.companyid;
      var courseName = res.target.dataset.coursename;
      var roleVal = this.data.roleVal;
      // 企业邀请老师
      if (invite == "inviteTea") {
        return {
          title: companyName + '邀请你成为此课程的老师',
          path: '/pages/course/courseDetail/courseDetail?type=inviteTea&companyId=' + companyId + '&courseId=' + id + '&companyName=' + companyName + '&courseName=' + courseName + '&inviteSessionKey=' + app.globalData.sessionKey + "&roleVal=" + roleVal
        }
      }
      // 老师邀请学生
      else if (invite == "inviteStu") {
        return {
          title: '邀请你加入' + courseName,
          path: '/pages/course/courseDetail/courseDetail?type=inviteStu&companyId=' + companyId + '&courseId=' + id + '&companyName=' + companyName + '&courseName=' + courseName + '&inviteSessionKey=' + app.globalData.sessionKey + "&roleVal=" + roleVal
        }
      }

    }
  },
})