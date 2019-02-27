// pages/owner/changeRole/changeRole.js
var app = getApp();
var domainUrl = app.globalData.domainUrl;
var http = require("../../../util/request/request.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    companyAndUser: [], //公司用户表

  },
  /**
   * 添加企业
   */
  addCompany:function(){
    wx.navigateTo({
      url: '../../cardCase/addEnterpriseCard/addEnterpriseCard?status=add'
    })
  },
  /**
   * 选择账号切换
   */
  checkCompany: function(e) {
    var that = this;
    var companyId = e.currentTarget.dataset.companyid;
    var companyName = e.currentTarget.dataset.companyname;
    var openId = app.globalData.openid;
    // var openId = "o4yrj5KMLmD3xkmRdZcdj7rFzrhA";
    var roleType = e.currentTarget.dataset.roletype;
    // //修改上次登录的次数
    that.updateLastLogin(companyId, roleType, openId).then(function(res) {
      app.globalData.companyId = companyId;
      app.globalData.companyName = companyName;
      app.globalData.roleType = roleType;
      // that.swichCompany.hide();
      that.hideTime();
      // 返回上一页并刷新数据
      //设置页面可执行onshow方法
      app.globalData.isCompanyShow = true;
      app.globalData.isCourseShow = true;
      app.globalData.isOwnerShow = true;
      let pages = getCurrentPages();
      let prevPage = pages[pages.length - 2];
      prevPage.setData({
        flag: true
      })
      wx.navigateBack({
        delta: 1
      })
    });
  },
  /**
   * 修改用户最后一次登录的次数
   */
  updateLastLogin: function(companyId, roleType, openId) {
    var that = this;
    that.showLoad();
    return new Promise((resolve, reject) => {
      http.httpPost(domainUrl + "/company/updateLastLogin", {
        "companyId": companyId,
        "userOpenid": openId,
        "roletype": roleType
      }).then((res) => {
        resolve(res);
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
   * 查询用户对应的公司和角色
   */
  queryCompanyAndUser: function(openId) {
    var that = this;
    that.showLoad();
    http.httpPost(domainUrl + "/company/queryUserCompany", {
      "openId": openId
    }).then((res) => {
      var companyAndUser = res.data.data.companyAndUser;
      var companyId = app.globalData.companyId;
      var roleType = app.globalData.roleType;
      // 找出当前用户对应的公司角色
      for (var item in companyAndUser) {
        if (companyId == companyAndUser[item].companyId && roleType == companyAndUser[item].roleType) {
          companyAndUser[item].ischeck = true;
          // break;
        } else {
          companyAndUser[item].ischeck = false;
        }
      }
      that.setData({
        companyAndUser: companyAndUser
      });
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
    var openId = app.globalData.openid;
    // var openId = "o4yrj5KMLmD3xkmRdZcdj7rFzrhA";
    // 查询用户所对应的所有头像
    this.queryCompanyAndUser(openId);
  },
})