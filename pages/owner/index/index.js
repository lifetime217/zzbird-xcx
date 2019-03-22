// pages/owner/index/index.js
var app = getApp();
var util = require('../../../util/util.js');
var domainUrl = app.globalData.domainUrl;
var http = require("../../../util/request/request.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    layout: 0, //角色的布局
    role: [], //角色信息
    numberOne: 0, //界面第二行第一个模块
    numberTow: 0, //界面第二行第二个模块
    numberThree: 0, //界面第二行第三个模块
    numberFour: 0, //企业平均每周课时
    messageCount: 0, //未读消息的数量
    isFirstRequest:true,//是否是第一次请求
    menuitems_com: {
      course: {
        text: '课程列表',
        type: 'course',
        url: '',
        icon: 'icon-kechengliebiao'

      },
      enterPriseToTea: {
        text: '企业老师',
        type: 'enterPriseToTea',
        url: '/pages/owner/company/companyTea/companyTea',
        icon: 'icon-qiyelaoshi'
      },
      enterpriseToStu: {
        text: '企业学生',
        type: 'enterpriseToStu',
        url: '/pages/owner/company/companyStu/companyStu',
        icon: 'icon-xueshengliebiao'
      },

      messageToEnter: {
        text: '消息列表',
        type: 'messageToEnter',
        url: '/pages/owner/message/message',
        icon: 'icon-xiaoxiliebiao'
      },
      switchIdentity: {
        text: '切换身份',
        type: 'switchIdentity',
        url: '/pages/owner/checkRole/checkRole',
        icon: 'icon-icon-qihuan'
      },
      updateCompany: {
        text: '编辑企业',
        type: 'updateCompany',
        url: '/pages/init/addCompany/addCompany?type=edit',
        icon: 'icon-xiugai'
      }
    },
    menuitems_tea: {
      course: {
        text: '课程列表',
        type: 'course',
        url: '/pages/owner/teacher/courseList/courseList',
        icon: 'icon-kechengliebiao'
      },
      stuList: {
        text: '学生列表',
        type: 'stuList',
        url: '/pages/owner/teacher/stuList/stuList',
        icon: 'icon-xueshengliebiao'
      },
      messageToTea: {
        text: '消息列表',
        type: 'messageToTea',
        url: '/pages/owner/message/message',
        icon: 'icon-xiaoxiliebiao'
      },
      switchIdentity: {
        text: '切换身份',
        type: 'switchIdentity',
        url: '/pages/owner/checkRole/checkRole',
        icon: 'icon-icon-qihuan'
      }
    },
    menuitems_par: {
      punchClock: {
        text: '课时账单',
        type: 'punchClock',
        url: '../student/punchClockRecord/punchClockRecord',
        icon: 'icon-keshizhangdan'
      },
      messageToStu: {
        text: '消息列表',
        type: 'messageToStu',
        url: '/pages/owner/message/message',
        icon: 'icon-xiaoxiliebiao'
      },
      switchIdentity: {
        text: '切换身份',
        type: 'switchIdentity',
        url: '/pages/owner/checkRole/checkRole',
        icon: 'icon-icon-qihuan'
      }
    }
  },
  /**
   * 跳转页面
   */
  jumpPage: function(e) {
    var type = e.currentTarget.dataset.type;
    var url = type.url;
    wx.navigateTo({
      url: url,
    })
  },

  /**
   * 跳转修改个人信息
   * 
   */

  editUser: function() {
    wx.navigateTo({
      url: "/pages/owner/updateUser/updateUser",
    })
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
      layout: app.globalData.roleVal,
    })
    that.selectUserInfo();
  },

  selectUserInfo: function() {
    var that = this;
    var roleVal = app.globalData.roleVal;
    // 企业个人中心
    if (roleVal == 10) {
      that.queryCompanyInfo();
    }
    // 老师个人中心
    if (roleVal == 20) {
      that.queryTeacherInfo();
    }
    // 学员个人中心
    if (roleVal == 30) {
      that.queryStudentInfo();
    }

  },
  /**
   * 企业个人中心
   */
  queryCompanyInfo: function() {
    var that = this;
    return new Promise((resolve, reject) => {
      var that = this;
      http.httpPost(domainUrl + "/api/company/selectCompany", {}).then((res) => {
        var data = res.data;
        var statuscode = data.statusCode;
        //查询成功
        if (data.statusCode == 200) {
          that.setData({
            role: data.data.role,
            numberOne: data.data.lookCount,
            numberTow: data.data.shareCount,
            numberThree: data.data.courseCount,
            numberFour: data.data.average,
            messageCount: data.data.messageCount,
            isFirstRequest: false
          })
        }
      }).catch((errMsg) => {
        wx.showModal({
          content: '网络异常',
          showCancel: false,
        })
      });
    })
  },
  /**
   * 老师个人中心
   */
  queryTeacherInfo: function() {
    var that = this;
    return new Promise((resolve, reject) => {
      var that = this;
      http.httpPost(domainUrl + "/api/companycourseuser/selectTeacher", {}).then((res) => {
        var data = res.data;
        var statuscode = data.statusCode;
        //查询成功
        if (data.statusCode == 200) {
          that.setData({
            role: data.data.role,
            numberOne: data.data.courseCount,
            numberTow: data.data.stuCount,
            numberThree: data.data.totalClassHour,
            messageCount: data.data.messageCount,
            isFirstRequest: false
          })
        }
      }).catch((errMsg) => {
        wx.showModal({
          content: '网络异常',
          showCancel: false,
        })
      });
    })
  },
  /**
   * 学员个人中心
   */
  queryStudentInfo: function() {
    var that = this;
    return new Promise((resolve, reject) => {
      var that = this;
      http.httpPost(domainUrl + "/api/companycourseuser/selectStudent", {}).then((res) => {
        var data = res.data;
        var statuscode = data.statusCode;
        //查询成功
        if (data.statusCode == 200) {
          that.setData({
            role: data.data.role,
            numberOne: data.data.courseCount,
            numberTow: data.data.monthClassHourt,
            numberThree: data.data.totalClassHour,
            messageCount: data.data.messageCount,
            isFirstRequest:false
          })
        }
      }).catch((errMsg) => {
        wx.showModal({
          content: '网络异常',
          showCancel: false,
        })
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
    if(!this.data.isFirstRequest){
      if (getCurrentPages().length != 0) {
        //刷新当前页面的数据
        getCurrentPages()[getCurrentPages().length - 1].onLoad();
        app.globalData.ownerReload = false;
      }
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

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  }
})