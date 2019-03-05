// pages/init/companyDetail/companyDetail.js
var http = require('../../../util/request/request.js');
var WxParse = require('../../../util/wxParse/wxParse.js');
var app = getApp();
var domainUrl = app.globalData.domainUrl;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    bannerList: [], //头部图片
    companyDetail: {}, //公司详情
    teaList: [], //教师列表
    industry: [], //标签集合

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
   * 打电话
   */
  callphone: function(e) {
    var phone = e.currentTarget.dataset.phone;
    console.log(phone);
    wx.makePhoneCall({
      phoneNumber: phone // 仅为示例，并非真实的电话号码
    })
  },
  /**
   * 查询公司详情
   */
  queryCompanyDetail: function(companyId) {
    var that = this;
    that.showLoad();
    var params = {
      "companyId": companyId
    }
    // var roleType = app.globalData.roleType;
    http.httpPost(domainUrl + "/company/queryCompanyDetail", params).then((res) => {
      // 查询成功
      if (res.data.statusCode == 200) {
        var data = res.data.data;
        WxParse.wxParse("article", "html", data.companyDetail.companyDetailInfo, this, 0)
        that.setData({
          industry: data.industry,
          bannerList: data.bannerList,
          companyDetail: data.companyDetail,
          teaList: data.companyTeacher
        });
      } else {
        wx.showModal({
          content: res.data.msg,
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
    var companyId = options.companyId;
    // var companyId = "f06f6cccc4b34543bddb9568a86495e9";
    this.queryCompanyDetail(companyId);

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

  },

})