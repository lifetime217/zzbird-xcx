//miniprogram/pages/owner/courseList/courseList.js
var app = getApp();
var domainUrl = app.globalData.domainUrl;
var http = require("../../../util/request/request.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 课程 普通用户
    courseList: [],
    roleType: 0, //角色类型
    showAll: -1, //点击展示详情
    page: 1, //分页
    hasMore: false, //是否有更多的数据
    hasData: true, //是否有数据 true为有数据 false是没有数据的
    isFirstRequest: true // 是否是第一次请求数据
  },
  /**
   * 跳转到公司详情
   */
  navCompany: function(e) {
    const companyid = e.currentTarget.dataset.companyid;
    wx.navigateTo({
      url: '../../cardCase/enterpriseCard/enterpriseCard?companyId=' + companyid
    })

  },
  /**
   * 展示简介所有
   */
  showAll: function(e) {
    var type = e.currentTarget.dataset.type;
    if (type == 0) {
      this.setData({
        showAll: -1
      });
    } else {
      var index = e.currentTarget.dataset.index;
      this.setData({
        showAll: index
      });
    }
  },
  /**
   *   课程详情
   */
  courseDetail: function(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '../../course/courseDetail/courseDetail?id=' + id
    })
  },
  /**
   *  课程统计标签跳转
   */
  swichNav: function(e) {
    this.showLoad();
    this.setData({
      currentTab: e.currentTarget.dataset.currenttab
    });
    this.hideTime();
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
   * 查询课程列表信息
   */
  queryMyCourse: function(openid, companyId, page) {
    var that = this;
    that.showLoad();
    http.httpPost(domainUrl + "/course/queryTeaCourse", {
      "userOpenid": openid,
      "distinguish": 1,
      "page": page,
      "companyId": companyId
    }).then((res) => {
      var data = res.data;
      var pageObjec = res.data.data;
      var courseList = data.data.rows;
      if (data.success) {
        //是否有更多的数据
        var hasMore = data.count > courseList.length;
           var hasData = true;
        if (that.data.isFirstRequest) {
          hasData = data.data.length != 0;
          // 重新赋值不是第一次请求方法
          that.setData({
            isFirstRequest: false,
            hasData: hasData
          });
        }
        var myHasMore = (pageObjec.page * pageObjec.pageSize) < pageObjec.records
        if (page > 1 && courseList.length != 0) {
          //加载第一以后的页面
          var oldList = that.data.courseList;
          for (var i = 0; i < courseList.length; i++) {
            oldList.push(courseList[i]);
          }
          that.setData({
            courseList: oldList,
            hasMore: myHasMore,
            page: page
          });
        } else if (courseList.length == 0 && page == 1) {
           //没有数据不加载
          that.setData({
            courseList: [],
            hasMore: myHasMore,
            page: page
          });
        }else{
          that.setData({
            courseList: courseList,
            hasMore: myHasMore,
            page: page
          });
        }
        
        
      } else {
        wx.showModal({
          content: data.msg,
          showCancel: false,
        })
      }
      that.hideTime();
      wx.stopPullDownRefresh();
    }).catch((errMsg) => {
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
    var that = this;

    var openid = app.globalData.openid;
    var companyId = app.globalData.companyId;
    that.queryMyCourse(openid, companyId, 1);
    // if (openid && openid!=""){
    // that.queryMyCourse(roleType, openid, companyId).then(function (courseList) {
    //   that.setData({
    //     courseList: courseList,
    //     roleType: roleType
    //   });
    //   that.hideTime();
    // });
    // }
    // else{
    //   app.openIdCallback = openid => {
    //     if (openid != '') {
    //       that.queryMyCourse(roleType, openid).then(function (courseList) {
    //         that.setData({
    //           courseList: courseList
    //         });
    //         that.hideTime();
    //       });
    //     }
    //   }
    // }
  },


  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    var that = this;
    var openid = app.globalData.openid;
    var companyId = app.globalData.companyId;
    this.setData({
      isFirstRequest: true,
      hasData: true
    })
    that.queryMyCourse(openid, companyId, 1);
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    var that = this;
    if (that.data.hasMore) { //判断是否还有更多
      var openid = app.globalData.openid;
      var companyId = app.globalData.companyId;
      var page = that.data.page + 1;
      that.queryMyCourse(openid, companyId, page);
    }
  },


})