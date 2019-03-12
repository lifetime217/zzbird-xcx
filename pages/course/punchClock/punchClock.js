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
    deleteList: [], //选择要取消打卡的集合
  },
  /**
   * 存储学生打卡的数组
   */
  clockCase: function(e) {
   var that = this;
    var clickList = this.data.clickList;
    var id = e.currentTarget.dataset.id;
    var index = that.validateId(clickList, 'id', id);
    if (index != -1){
      clickList.splice(index, 1);
    }else{
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
  * 存储学生打卡的数组
  */
  deleteCase: function (e) {
    var that = this;
    var deleteList = this.data.deleteList;
    var id = e.currentTarget.dataset.id;
    var index = that.validateId(deleteList, 'id', id);
    if (index != -1) {
      deleteList.splice(index, 1);
    } else {
      var obj = {
        "id": id
      };
      deleteList.push(obj);
    }
    that.setData({
      deleteList: deleteList,
    })
  },

  /**
   * 验证数据是否在数组中
   */
  validateId: function (arrayToSearch, attr, val) {
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
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})