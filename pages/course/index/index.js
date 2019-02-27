// miniprogram/pages/home/index/index.js
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
    hasMore: true, //是否还有更多的数据
    page: 1, //页数
    companyId: "", //企业id
    openid: "",
    isShow: false, //是否展示新增课程
    isFirst: false, // 是否是第一次进入
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
      url: '../courseDetail/courseDetail?id=' + id
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
   * 跳转新增课程按钮
   */
  addCourse: function() {
    var that = this;
    wx.navigateTo({
      url: '../../cardCase/addCourseCard/addCourseCard?status=addMore'
    })
  },

  /**
   * 查询课程详细信息
   */
  queryCourse: function(roleType, openid, companyId, page) {
    var that = this;
    that.showLoad();
    var param = {};
    param.userOpenid = openid;
    param.distinguish = roleType;
    param.page = page;

    param.companyId = companyId;

    http.httpPost(domainUrl + "/course/user/sele", param).then((res) => {
      var data = res.data;
      var pageObjec = res.data.data;
      if (data.code == 200) {
        var courseList = data.data.rows; //课程集合
        var hasMore = true;
        // 是否有数据展示
        // var hasData = courseList.length == 0;
        //判断是否有数据展示  先判断原来是否有数据 只判断列表为空的时候
        var hasData = true;
        if (that.data.isFirstRequest) {
          hasData = courseList.length != 0;
          // 重新赋值不是第一次请求方法
          that.setData({
            isFirstRequest: false,
            hasData: hasData
          });
        }
        // 判断是否还有数据
        if (data.count >= courseList.length) {
          hasMore = false;
        }

        var myHasMore = (pageObjec.page * pageObjec.pageSize) < pageObjec.records


        if (page > 1 && courseList.length != 0) {
          //加载第一以后的页面
          var oldList = that.data.courseList;
          for (var i = 0; i < courseList.length; i++) {
            oldList.push(courseList[i]);
          }
          that.setData({
            hasMore: myHasMore,
            courseList: oldList,
            roleType: roleType,
            page: page,
            openid: openid,
            companyId: companyId,
            hasData: hasData
          });
        } else if (courseList.length == 0 && page == 1) {
          //没有数据不加载
          that.setData({
            hasMore: myHasMore,
            courseList: [],
            roleType: roleType,
            page: page,
            openid: openid,
            companyId: companyId,
            hasData: hasData
          });
        } else {
          //首次加载数据
          that.setData({
            hasMore: myHasMore,
            courseList: courseList,
            roleType: roleType,
            page: page,
            openid: openid,
            companyId: companyId,
            hasData: hasData
          });
        }


        that.hideTime();
        wx.stopPullDownRefresh();
      } else {
        wx.showModal({
          content: '请求错误，请重试！',
          showCancel: false,
        })
        that.hideTime();
        wx.stopPullDownRefresh();
      }
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
    //设置页面可执行onshow方法
    app.globalData.isCourseShow = true;
    var that = this;
    var roleType = app.globalData.roleType;
    var openid = app.globalData.openid;
    var companyId = app.globalData.companyId;
    that.queryCourse(roleType, openid, companyId, 1);
    http.httpPost(domainUrl + "/company/isRoleType", {
      "openId": openid,
      "companyId": companyId,
      "roleType": 2,
    }).then((res) => {
      if (res.statusCode == 200 && res.data.success) {
        that.setData({
          isShow: true
        })
      }
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
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    // 切换了企业之后重新刷新课程列表
    // var data_roleType = this.data.roleType;
    // var data_companyId = this.data.companyId;
    // var app_roleType = app.globalData.roleType;
    // var app_companyId = app.globalData.companyId;
    // if (data_companyId != "") {
    //   if (data_roleType != app_roleType || data_companyId != app_companyId) {
    //     this.onLoad();
    //   }
    // }
    //判断页面是否可执行onshow方法
    if (app.globalData.isCourseShow) {

      // 第二次进入就刷新数据
      var isFirst = this.data.isFirst;
      if (isFirst) {
        this.setData({
          isFirstRequest: true,
          hasData: true
        })
        this.onLoad();
      }
      this.setData({
        isFirst: true
      });
      //重新将标志置为false
      app.globalData.isCourseShow = false;
      app.globalData.isOtherShow = false;
    }

  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    var roleType = this.data.roleType;
    var openid = this.data.openid;
    var companyId = this.data.companyId;
    this.setData({
      isFirstRequest: true,
      hasData: true
    })
    this.queryCourse(roleType, openid, companyId, 1);
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    if (this.data.hasMore) { //判断是否还有更多
      var myPage = this.data.page + 1;
      var roleType = this.data.roleType;
      var openid = this.data.openid;
      var companyId = this.data.companyId;
      this.queryCourse(roleType, openid, companyId, myPage);
    }
  },
})