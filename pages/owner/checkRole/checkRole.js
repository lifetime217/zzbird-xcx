// pages/owner/checkRole/checkRole.js
var app = getApp();
var domainUrl = app.globalData.domainUrl;
var http = require("../../../util/request/request.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    roleUser: [], //公司用户表
  },
  /**
   * 添加企业
   */
  addCompany: function() {
    wx.navigateTo({
      url: '../../init/addCompany/addCompany'
    })
  },
  /**
   * 选择账号切换
   */
  checkCompany: function(e) {
    var that = this;
    var id = e.currentTarget.dataset.id;
    that.showLoad();
    http.httpPost(domainUrl + "/api/xcxuserrole/updateActive", {
      "id": id
    }).then((res) => {
      console.log(res);
      if (res.data.statusCode == 200) {
        app.globalData.roleval = res.data.data.roleVal;
        app.globalData.courseReload = true;
        app.globalData.ownerReload = true;
        console.log(app.globalData.roleval);
        wx.navigateBack({
          delta: 1,
        })
      } else {
        wx.showModal({
          content: '网络异常',
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
  },
  /**
   * 查询用户对应的公司和角色
   */
  queryRole: function() {
    var that = this;
    that.showLoad();
    http.httpPost(domainUrl + "/api/xcxuserrole/queryRole", {}).then((res) => {
      if (res.data.statusCode == 200) {
        that.setData({
          roleUser: res.data.data.RoleUser
        });
      } else {
        wx.showModal({
          content: '网络异常',
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
  },
  /**
   * 显示加载框
   */
  showLoad: function() {
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
  },
  /**
   *  隐藏加载框
   */
  hideTime: function() {
    setTimeout(function() {
      wx.hideLoading();
    }, 1000);
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.queryRole();
  },
})