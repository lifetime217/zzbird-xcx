// miniprogram/pages/owner/enterpriseTea/enterpriseTea.js
var app = getApp();
var http = require('../../../util/request/request.js');
var roleType = app.globalData.roleType; //角色的id 
var domainUrl = app.globalData.domainUrl;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    teaList: [], //企业老师
    page: 1, //当前页数
    pageSize: 20, //每页个数
    isMore: false, //判断是否有后续数据
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
    var teaList = this.data.teaList;
    var courseList = teaList[index].courseList
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
  // removeRepeat: function(data) {
  //   var hash = {};
  //   var data1 = data.reduce(function(item, next, currentIndex, arr) {
  //     if (hash[next.user_id]) {
  //       if (next.isRelationCourse) {
  //         item[hash[next.user_id] - 1].courseName.push({
  //           courseId: next.courseId,
  //           courseName: next.courseName.substring(0, 1)
  //         });
  //       }
  //     } else {
  //       if (next.isRelationCourse) {
  //         next.courseName = [{
  //           courseId: next.courseId,
  //           courseName: next.courseName.substring(0, 1)
  //         }];
  //       }
  //       hash[next.user_id] ? '' : hash[next.user_id] = true && item.push(next);
  //     }
  //     return item
  //   }, [])
  //   return data1;
  // },
  /**
   *  把数组分为两个
   */
  // divideList: function(arr) {
  //   var teaList1 = [];
  //   var teaList2 = [];
  //   for (var i = 0; i < arr.length / 2; i++) {
  //     teaList1[i] = arr[i * 2];
  //     if (arr[i * 2 + 1] != undefined) {
  //       teaList2[i] = arr[i * 2 + 1];
  //     }
  //   }
  //   return {
  //     teaList1: teaList1,
  //     teaList2: teaList2
  //   }
  // },
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
   * 删除老师
   */
  deleteTea: function(e) {
    var that = this;
    var openId = e.currentTarget.dataset.userid;
    wx.showModal({
      title: '提示',
      content: '确定要删除该老师吗？',
      success: function(res) {
        if (res.confirm) {
          http.httpPost(domainUrl + "/company/deleteUser", {
            "openId": openId,
            "companyId": that.data.companyId,
            "roleType": 1
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
    that.showLoad();
    var companyId = app.globalData.companyId;
    var openId = app.globalData.openid;
    that.queryEnterpriseTea(that.data.page, that.data.pageSize, companyId, openId, 1);
    // that.queryEnterpriseTea(companyId).then(function(teaList) {
    //   var newTeaList = that.removeRepeat(teaList);
    //   if (newTeaList.length > 1) {
    //     var divideList = that.divideList(newTeaList);
    //     that.setData({
    //       teaList1: divideList.teaList1,
    //       teaList2: divideList.teaList2,
    //     });
    //   } else {
    //     that.setData({
    //       teaList1: newTeaList
    //     });
    //   }

    that.hideTime();
    // });
  },
  /**
   * 查询企业旗下的老师
   */
  queryEnterpriseTea: function(page, pageSize, companyId, openId, roleType) {
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
        var newTeaList = message.data.rows;
        // var arr = that.divideList(message.data.rows);
        var hasData = true;
        if (that.data.isFirstRequest) {
          hasData = message.data.rows.length != 0;
          console.log(hasData);
          // 重新赋值不是第一次请求方法
          that.setData({
            isFirstRequest: false,
            hasData: hasData
          });
        }
        var myHasMore = (pageObjec.page * pageObjec.pageSize) < pageObjec.records
        if (page > 1 && newTeaList.length != 0) {
          //加载第一以后的页面
          var oldList = that.data.teaList;
          for (var i = 0; i < newTeaList.length; i++) {
            oldList.push(newTeaList[i]);
          }
          that.setData({
            teaList: oldList,
            page: page,
            isMore: myHasMore,
            openId: openId,
            companyId: companyId
          });
        } else if (newTeaList.length == 0 && page == 1) {
          //没有数据不加载
          that.setData({
            teaList: [],
            page: page,
            isMore: myHasMore,
            openId: openId,
            companyId: companyId
          });
        } else {
          //首次加载数据
          that.setData({
            teaList: newTeaList,
            page: page,
            isMore: myHasMore,
            openId: openId,
            companyId: companyId
          });
        }

       
        that.hideTime();
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
    });
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
    that.queryEnterpriseTea(1, 20, companyId, openId, 1);
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function(options) {
    this.moreCourseToast = this.selectComponent("#moreCourseToast");
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    var that = this;
    if (that.data.isMore) {
      var page = that.data.page + 1;
      var openId = that.data.openId;
      var companyId = that.data.companyId;
      that.queryEnterpriseTea(page, 20, companyId, openId, 1);
    }
  },
})