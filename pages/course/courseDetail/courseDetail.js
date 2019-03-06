// pages/course/courseDetail/courseDetail.js
var http = require('../../../util/request/request.js');
var app = getApp();
var domainUrl = app.globalData.domainUrl;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    type: "", // 判断来源   （编辑课程详情页面）
    courseId: "", //课程id
    imgUrls: [], //图片路劲集合
    courseName: "", //课程名字
    startTime: "", //开始时间
    endTime: "", //结束时间
    personNumber: "", //学生人数
    classTimeSelect: "", // 课时选择
    ageRange: "", //年龄范围选择
    courseDetailInfo: "", //课程介绍
    companyName:"",// 公司名称
  },
  /**
   * 查询课程
   */
  queryCouse: function(courseId) {
    var that = this;
    that.showLoad();
    http.httpGet(domainUrl + "/companycourse/queryCourseAndCompany/" + courseId, {}).then((res) => {
      console.log(res);
      if (res.data.statusCode == 200) {
        var data = res.data.data;
        var course = data.course;
        that.setData({
          imgUrls: data.courseImgsUrl,
          courseName: course.courseName,
          startTime: course.startTime,
          endTime: course.endTime,
          personNumber: course.personNumber,
          classTimeSelect: course.courseHour,
          ageRange: course.ageRange,
          courseDetailInfo: course.courseDesc,
          companyName:data.companyName
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
    if (options.type != undefined) {
      this.setData({
        type: options.type
      });
    }
    this.setData({
      courseId: options.courseId
    });
    this.queryCouse(options.courseId);
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
    var type = this.data.type;
    if (type == "courseEdit") {
      // 如果是编辑课程页面过来返回就返回课程列表页面
      wx.switchTab({
        url: '/pages/course/index/index'
      })
    }
  },

})