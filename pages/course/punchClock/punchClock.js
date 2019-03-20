// pages/course/punchClock/punchClock.js

var app = getApp();
var util = require('../../../util/util.js');
var domainUrl = app.globalData.domainUrl;
var http = require("../../../util/request/request.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    clickList: [], //选择要打卡的id集合
    courseId: '', //课程的id
    yiDaka: [], //已打卡集合
    weiDaka: [], //未打卡集合
    teaName: '', //老师的名字
    teaImg: '', //老师的头像
    teaDakaDays: 0, //老师打打卡天数
    fastload: false, //判断是否是第一次登陆
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
   * 存储学生打卡的数组
   */
  clockCase: function(e) {
    var that = this;
    var clickList = this.data.clickList;
    var id = e.currentTarget.dataset.id;
    var index = that.validateId(clickList, 'id', id);
    if (index != -1) {
      clickList.splice(index, 1);
    } else {
      var obj = {
        "id": id
      };
      clickList.push(obj);
    }
    that.setData({
      clickList: clickList,
    })
  },

  /**
   * 验证数据是否在数组中
   */
  validateId: function(arrayToSearch, attr, val) {
    for (var i = 0; i < arrayToSearch.length; i++) {
      if (arrayToSearch[i][attr] == val) {
        return i;
      }
    }
    return -1;
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;
    var courseId = options.id;
    that.setData({
      courseId: courseId,
      fastload: true,
    })
    that.queryYidakaWeidakaList(courseId);
  },
  /**
   * 
   * 查询老师的信息和打卡天数
   */
  queryYidakaWeidakaList: function(courseId) {
    var that = this;
    that.showLoad();
    return new Promise((resolve, reject) => {
      var that = this;
      http.httpPost(domainUrl + "/api/dakarecord/queryYidakaWeidakaAndTeaInfo", {
        courseId: courseId
      }).then((res) => {
        var data = res.data;
        //查询成功
        if (data.statusCode == 200) {
          that.setData({
            yiDaka: data.data.yiDaka,
            weiDaka: data.data.weiDaka,
            teaDakaDays: data.data.days,
            teaImg: data.data.roleHeadimg,
            teaName: data.data.roleName,
            clickList: [],
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
   * 打卡
   */
  punchClock: function() {
    var that = this;
    var clickList = that.data.clickList;
    var courseId = that.data.courseId;
    if (clickList.length != 0) {
      http.httpPost(domainUrl + "/api/dakarecord/daka", {
        clickList: JSON.stringify(clickList),
        courseId: courseId,
      }).then((res) => {
        var data = res.data;
        //打卡成功
        if (data.statusCode == 200) {
          that.onShow();
        } else {
          that.onShow();
          wx.showModal({
            content: '打卡失败',
            showCancel: false,
          })
        }
        app.globalData.ownerReload = true;
      }).catch((errMsg) => {
        wx.showModal({
          content: '网络异常',
          showCancel: false,
        })
      });
    }
  },

  /**
   * deleteStu
   *  删除打卡记录
   */
  deleteStu: function(e) {
    var that = this;
    var id = e.currentTarget.dataset.id;
    if (id != "") {
      wx.showModal({
        title: '取消打卡',
        content: '是否取消打卡',
        showCancel: true,
        success: function(res) {
          if (res.cancel) {
            //点击取消,默认隐藏弹框
          } else {
            //点击确定
            http.httpPost(domainUrl + "/api/dakarecord/quXiaoDaka", {
              id: id,
            }).then((res) => {
              var data = res.data;
              //删除成功
              if (data.statusCode == 200) {
                that.onShow();
                app.globalData.ownerReload = true;
              } else {
                that.onShow();
                wx.showModal({
                  content: '取消打卡失败',
                  showCancel: false,
                })
              }
            }).catch((errMsg) => {
              wx.showModal({
                content: '网络异常',
                showCancel: false,
              })
            });
          }
        }
      })

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
    var that = this;
    if (!that.data.fastload) {
      that.queryYidakaWeidakaList(that.data.courseId);
    }
    that.setData({
      fastload: false,
    })

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