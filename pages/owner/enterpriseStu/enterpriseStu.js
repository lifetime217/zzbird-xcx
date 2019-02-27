// miniprogram/pages/owner/enterpriseStu/enterpriseStu.js
var app = getApp();
var roleType = app.globalData.roleType; //角色的id 
var domainUrl = app.globalData.domainUrl;
var http = require("../../../util/request/request.js");

Page({
  /**
   * 页面的初始数据
   */
  data: {
    stuList: [], //  企业学生数据
    isMore: false, //  判断是否有后续数据
    page: 1, //  当前页数
    pageSize: 20, //  每页个数
    openId: "", //  微信openId
    companyId: "", //  公司Id
    courseList: [], //课程集合
    hasData: true, //是否有数据 true为有数据 false是没有数据的
    isFirstRequest: true // 是否是第一次请求数据
  },
  /**
   * 更多课程
   */
  moreCourse: function(e) {
    var index = e.currentTarget.dataset.index;
    var stuList = this.data.stuList;
    var courseList = stuList[index].courseList
    this.setData({
      courseList: courseList
    });
    this.moreCourseToast.show();
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
  // 去重复
  removeRepeat: function(data) {
    var hash = {};
    var data1 = data.reduce(function(item, next, currentIndex, arr) {
      if (hash[next.user_id]) {
        if (next.isRelationCourse) {
          item[hash[next.user_id] - 1].courseName = item[hash[next.user_id] - 1].courseName + "," + next.courseName;
        }
      }
      hash[next.user_id] ? '' : hash[next.user_id] = true && item.push(next);
      return item
    }, [])
    return data1;
  },


  /**
   * 跳转课程
   */
  navCourse: function(e) {
    var courseId = e.currentTarget.dataset.courseid;
    wx.navigateTo({
      url: '../../course/courseDetail/courseDetail?id=' + courseId
    })
  },

  /**
   * 跳转企业
   */
  navCompany: function(e) {
    var companyId = e.currentTarget.dataset.companyid;
    wx.navigateTo({
      url: '../../cardCase/enterpriseCard/enterpriseCard?companyId=' + companyId
    })
  },

  /**
   * 删除学生
   */
  deleteStu: function(e) {
    var that = this;
    var openId = e.currentTarget.dataset.userid;
    wx.showModal({
      title: '提示',
      content: '确定要删除该学生吗？',
      success: function(res) {
        if (res.confirm) {
          http.httpPost(domainUrl + "/company/deleteUser", {
            "openId": openId,
            "companyId": that.data.companyId,
            "roleType": 0
          }).then((res) => {
            var data = res.data;
            wx.showModal({
              content: data.msg,
              showCancel: false,
            })
            that.hideTime();
            that.onPullDownRefresh();
          }).catch((errMsg) => {
            wx.showModal({
              content: '网络异常',
              showCancel: false,
            })
            that.hideTime();
          });
        } else if (res.cancel) {
          return false;
        }
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;
    var openId = app.globalData.openid;
    var companyId = app.globalData.companyId;
    var msesg = that.queryEnterpriseStu(that.data.page, that.data.pageSize, companyId, openId, 0);
  },

  /**
   * 查询企业下学生
   */
  queryEnterpriseStu: function(page, pageSize, companyId, openId, roleType) {
    return new Promise((resolve, reject) => {
      var that = this;
      that.showLoad();
      http.httpPost(domainUrl + "/company/queryUsers", {
        "openId": openId,
        "companyId": companyId,
        "roleType": roleType,
        "page": page,
        "pageSize": pageSize
      }).then((res) => {
        if (res.statusCode == 200 && res.data.success) {
          var message = res.data;
          var pageObjec = res.data.data;
          //判断是否有多余数据
          var newStuList = message.data.rows
          var myHasMore = (pageObjec.page * pageObjec.pageSize) < pageObjec.records
          var hasData = true;
          if (that.data.isFirstRequest) {
            hasData = newStuList.length != 0;
            // 重新赋值不是第一次请求方法
            that.setData({
              isFirstRequest: false,
              hasData: hasData
            });
          }
          if (page > 1 && newStuList.length != 0) {
            //加载第一以后的页面
            var oldList = that.data.stuList;
            for (var i = 0; i < newStuList.length; i++) {
              oldList.push(newStuList[i]);
            }
            that.setData({
              stuList: oldList,
              page: page,
              isMore: myHasMore,
              openId: openId,
              companyId: companyId
            });

          } else if (newStuList.length == 0 && page == 1) {
            //没有数据不加载
            that.setData({
              stuList: [],
              page: page,
              isMore: myHasMore,
              openId: openId,
              companyId: companyId
            });
          } else {
            //首次加载数据
            that.setData({
              stuList: newStuList,
              page: page,
              isMore: myHasMore,
              openId: openId,
              companyId: companyId
            });
          }




        } else {
          that.setData({
            teaList1: "",
            teaList2: ""
          });
        }
        that.hideTime();
        wx.stopPullDownRefresh()
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
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    var that = this;
    var openId = that.data.openId;
    var companyId = that.data.companyId;
    this.setData({
      isFirstRequest: true,
      hasData: true
    })
    that.queryEnterpriseStu(1, 20, companyId, openId, 0);
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function(options) {
    this.moreCourseToast = this.selectComponent("#moreCourseToast");
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    var that = this;
    var openId = that.data.openId;
    var companyId = that.data.companyId;
    this.setData({
      isFirstRequest: true,
      hasData: true
    })
    this.queryEnterpriseStu(1, 20, companyId, openId, 0);
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    var that = this;
    if (that.data.isMore) {
      //if(1 != 1){
      var page = that.data.page + 1;
      var openId = that.data.openId;
      var companyId = that.data.companyId;
      that.queryEnterpriseStu(page, 20, companyId, openId, 0);
    }
  },
})