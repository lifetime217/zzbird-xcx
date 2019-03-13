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
  },
  /**
   * 新建课程
   */
  addCourse:function(){
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
  punchRecord: function() {

  },
  /**
   * 跳转课程详情
   */
  navCourseDetail: function(e) {
    var id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '../courseDetail/courseDetail?courseId=' + id,
    })
  },
  /**
   * 查询课程列表
   */
  queryCouse: function() {
    var that = this;
    that.showLoad();
    http.httpPost(domainUrl + "/api/companycourseuser/queryCourseByUser", {}).then((res) => {
      if (res.data.statusCode == 200) {
        var data = res.data.data;
        that.setData({
          courseList: data.courseList,
          roleVal: app.globalData.roleVal
        });
      } else {
        wx.showModal({
          content: '网络异常',
          showCancel: false,
        })
      }
      that.hideTime();
    }).catch((errMsg) => {
      console.log(errMsg);
      wx.showModal({
        content: '网络异常',
        showCancel: false,
      })
      that.hideTime();
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // 隐藏右上角分享按钮
    wx.hideShareMenu()
    this.queryCouse();
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
   *  用户点击右上角分享
   */
  onShareAppMessage: function(res) {
    if (res.from == "button") {
      var invite = res.target.dataset.invite;
      var id = res.target.dataset.id;
      var companyName = res.target.dataset.companyname;
      var companyId = res.target.dataset.companyid;
      var courseName = res.target.dataset.coursename;
       // 企业邀请老师
      if (invite == "inviteTea") {
        return {
          title: companyName + '邀请你成为此课程的老师',
          path: '/pages/course/courseDetail/courseDetail?type=inviteTea&companyId=' + companyId + '&courseId=' + id + '&companyName=' + companyName + '&courseName=' + courseName + '&inviteSessionKey=' + app.globalData.sessionKey 
        }
      }
      // 老师邀请学生
      else if (invite == "inviteStu") {
        return {
          title: '邀请你加入' + courseName,
          path: '/pages/course/courseDetail/courseDetail?type=inviteStu&companyId=' + companyId + '&courseId=' + id + '&courseName=' + courseName + '&inviteSessionKey=' + app.globalData.sessionKey 
        }
      }
     
    }
  },
})