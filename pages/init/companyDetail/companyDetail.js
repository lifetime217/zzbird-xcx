// pages/init/companyDetail/companyDetail.js
var http = require('../../../util/request/request.js');
var WxParse = require('../../../util/wxParse/wxParse.js');
var app = getApp();
var domainUrl = app.globalData.domainUrl;
let touchDotX = 0; //X按下时坐标
let touchDotY = 0; //y按下时坐标
let interval; //计时器
let time = 0; //从按下到松开共多少时间*100
Page({

  /**
   * 页面的初始数据
   */
  data: {
    type: "", // 来源（判断页面的来源）
    bannerList: [], //头部图片
    companyDetail: {}, //公司详情
    teaList: [], //教师列表
    industry: [], //标签集合
    imgLeft: "", //图片左
    imgCenter: "", //图片中
    imgRight: "", //图片右
  },
  /**
   * 图片滑动开始监听
   */
  touchStart: function(e) {
    touchDotX = e.touches[0].pageX; // 获取触摸时的原点
    touchDotY = e.touches[0].pageY;
    // 使用js计时器记录时间    
    interval = setInterval(function() {
      time++;
    }, 100);
    1
  },
  /**
   * 图片滑动结束监听
   */
  touchEnd: function(e) {
    let touchMoveX = e.changedTouches[0].pageX;
    let touchMoveY = e.changedTouches[0].pageY;
    let tmX = touchMoveX - touchDotX;
    let tmY = touchMoveY - touchDotY;
    if (time < 20) {
      console.log(this.data.bannerList.length);
      if (this.data.bannerList.length == 1) {
        this.clearInterval();
        return;
      }
      let absX = Math.abs(tmX);
      let absY = Math.abs(tmY);
      if (absX > 2 * absY) {
        var imgLeft = parseInt(this.data.imgLeft); //图片左
        var imgCenter = parseInt(this.data.imgCenter); //图片中
        var imgRight = parseInt(this.data.imgRight); //图片右
        if (tmX < 0) {
          if (imgRight == this.data.bannerList.length) {
            this.clearInterval();
            return;
          }
          this.setData({
            imgLeft: imgCenter,
            imgCenter: imgRight,
            imgRight: imgRight + 1
          });
        } else {
          if (imgLeft == -1) {
            this.clearInterval();
            return;
          }
          this.setData({
            imgLeft: imgLeft - 1,
            imgCenter: imgLeft,
            imgRight: imgCenter
          });
        }
      }
      if (absY > absX * 2 && tmY < 0) {
        console.log("上滑动=====")
      }
    }
    this.clearInterval();
  },
  /**
   * 清楚计时器
   */
  clearInterval: function() {
    clearInterval(interval); // 清除setInterval
    time = 0;
  },

  /**
   * 预览图片
   */
  previewImg: function(e) {
    var img = e.currentTarget.dataset.url;

    wx.previewImage({
      current: img, // 当前显示图片的http链接
      urls: this.data.bannerList // 需要预览的图片http链接列表
    })
  },
  /**
   * 切换图片
   */
  switchImg: function(e) {
    var bannerList = this.data.bannerList;
    var index = e.currentTarget.dataset.index;
    var type = e.currentTarget.dataset.type;
    var imgLeft = ""; //图片左
    var imgCenter = ""; //图片中
    var imgRight = ""; //图片右
    if (type != "center") {
      imgLeft = index - 1;
      imgCenter = index;
      imgRight = index + 1;
      this.setData({
        imgLeft,
        imgCenter,
        imgRight
      });
    }
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
    http.httpPost(domainUrl + "/api/company/queryCompanyDetail", params).then((res) => {
      // 查询成功
      if (res.data.statusCode == 200) {
        var data = res.data.data;
        WxParse.wxParse("article", "html", data.companyDetail.companyDetailInfo, this, 0)
        var bannerList = data.bannerList;
        var imgLeft = "";
        var imgCenter = "";
        var imgRight = "";
        if (bannerList.length == 1) {
          imgCenter = 0;
        } else if (bannerList.length == 2) {
          imgLeft = 0;
          imgCenter = 1;
        } else {
          imgLeft = 0;
          imgCenter = 1;
          imgRight = 2;
        }
        that.setData({
          industry: data.industry,
          bannerList,
          companyDetail: data.companyDetail,
          teaList: data.companyTeacher,
          imgLeft,
          imgCenter,
          imgRight
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
   * 地图导航
   */
  selectMap: function(e) {
    var companyDetail = this.data.companyDetail;
    wx.openLocation({
      latitude: companyDetail.lat,
      longitude: companyDetail.lng,
      scale: 16,
      name: companyDetail.companySimpleAddress,
      address: companyDetail.companyAddress,
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;
    if (options.type != undefined) {
      that.setData({
        type: options.type
      });
    }
    var companyId = options.companyId;
    if (app.globalData.sessionKey && app.globalData.sessionKey != "") {
      that.queryCompanyDetail(companyId);
    } else {
      // 由于请求是网络请求，可能会在 Page.onLoad执行 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.sessionKeyCallback = sessionKey => {
        if (sessionKey != '') {
          that.queryCompanyDetail(companyId);
        }
      }
    }
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
   * 更新分享数据
   * 
   */
  updateShareCount: function(companyId) {
    var that = this;
    http.httpPost(
      domainUrl + "/api/company/updateShareCount", {
        companyId: companyId
      }).then((res) => {
      var data = res.data;
      if (data.statusCode == 200) {
        console.log('分享次数累加成功')
      } else {
        console.log('分享次数累加失败')
      }
    }).catch((errMsg) => {
      wx.showModal({
        content: '网络异常',
        showCancel: false,
      })
    });
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function(res) {
    var that = this;
    var companyId = that.data.companyDetail.id;
    console.log('分享成功了');
    that.updateShareCount(companyId);
    return {
      title: '企业详情',
      path: '/pages/init/companyDetail/companyDetail?companyId=' + companyId
    }
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {
    if (this.data.type == "editCompany") {
      wx.switchTab({
        url: '../../owner/index/index'
      })
    }
  }



})