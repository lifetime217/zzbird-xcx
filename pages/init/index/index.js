// miniprogram/pages/init/enterprise/Enterprise.js
var http = require('../../../util/request/request.js');
var app = getApp();
var domainUrl = app.globalData.domainUrl;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    indicatorDots: false, // 是否显示面板指示点 
    autoplay: true, // 是否自动切换
    interval: 5000, // 自动切换时间间隔
    duration: 1000, // 滑动动画时长
    isNew: false, //是否是新用户
    pointUser: [], // 重点用户列表
    ordinaryUser: [], //普通用户列表
    bannerList: [], //头部轮播图
    hasMore: false, // 判断下一次是否可以继续上拉刷新
    // roleType: 0,
    search: "",
    searchText: "输入关键字搜索",
    page: 1, //页数
    // userObj: {}, //用户信息
    hasData: true, //是否有数据 true为有数据 false是没有数据的  用来是否展示无数据图片
    isFirstRequest: true // 是否是第一次请求数据(page为1时)
  },
  // onTabItemTap:function(){
  //   console.log("");
  // },
  // 点击卡片详情
  navCompanyDetail: function(e) {
    const id = e.currentTarget.dataset.id;
    console.log(id);
    // wx.navigateTo({
    //   url: '../../cardCase/enterpriseCard/enterpriseCard?companyId=' + id,
    // })
  },
  // 开通企业
  openEnterprise: function(e) {
    //开通企业，只是新增了企业表数据，并没有新增企业用户数据
    // wx.navigateTo({
    //   url: '../../cardCase/addEnterpriseCard/addEnterpriseCard?status=add'
    // })
    var that = this;
    if (e.detail.userInfo) {
      //用户按了允许授权按钮
      var userinfo = e.detail.userInfo;
      app.globalData.user = userinfo;
      var openid = app.globalData.openid;
      // http.httpPost(domainUrl + "/api/auth/updateUser", {
      //   "openId": openid,
      //   "city": userinfo.city,
      //   "country": userinfo.country,
      //   "gender": userinfo.gender,
      //   "language": userinfo.language,
      //   "province": userinfo.province,
      //   "avatarUrl": userinfo.avatarUrl,
      //   "nickName": userinfo.nickName,
      //   //"isEdit": 0
      // }).then((res) => {
      //   var user = res.data.userInfo;
      //   user.nickName = userinfo.nickName;
      //   user.avatarUrl = userinfo.avatarUrl;
      //   that.setData({
      //     userObj: user
      //   });
      //   wx.navigateTo({
      //     url: '../../cardCase/addEnterpriseCard/addEnterpriseCard?status=add&nickName=' + user.nickName + '&avatarUrl=' + user.avatarUrl + '&openId=' + user.openId
      //   })
      // }).catch((errMsg) => {
      //   wx.showModal({
      //     content: '网络异常',
      //     showCancel: false,
      //   })
      //   that.hideTime();
      //   wx.stopPullDownRefresh();
      // });
    }
  },

  callPhone: function(e) {
    var phone = e.currentTarget.dataset.phone;
    this.setData({
      clickPhone: phone
    });
    // this.callPhoneModal.show();
  },
  // 确定拨打电话
  confirmPhone: function() {
    var clickPhone = this.data.clickPhone;
    wx.makePhoneCall({
      phoneNumber: clickPhone
    })
    // this.callPhoneModal.hide();
  },
  // 取消电话
  cancelPhone: function() {
    // this.callPhoneModal.hide();
  },
  /**
   * 判断两个经纬度地址的距离
   */
  // getDistance: function(la1, lo1, la2, lo2) {
  //   var La1 = la1 * Math.PI / 180.0;
  //   var La2 = la2 * Math.PI / 180.0;
  //   var La3 = La1 - La2;
  //   var Lb3 = lo1 * Math.PI / 180.0 - lo2 * Math.PI / 180.0;
  //   var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(La3 / 2), 2) + Math.cos(La1) * Math.cos(La2) * Math.pow(Math.sin(Lb3 / 2), 2)));
  //   s = s * 6378.137; //地球半径
  //   s = Math.round(s * 10000) / 10000;
  //   return s;
  // },
  /**
   * 比较数组当中的大小
   */
  compare: function(property) {
    return function(a, b) {
      var value1 = a[property];
      var value2 = b[property];
      return value1 - value2;
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
   * 区分是否授权地址
   */
  authAddress: function(page, search) {
    var that = this;
    var params = {};
    params.page = page;
    params.search = search;
    wx.getLocation({
      type: 'wgs84',
      success: function(res) {
        params.latitude = res.latitude;
        params.longitude = res.longitude;
        that.queryEnterprise(params, search);
      },
      fail: function() {
        that.queryEnterprise(params, search);
      }
    })

  },
  /**
   * 查询企业
   */
  queryEnterprise: function(params, search) {
    var that = this;
    that.showLoad();
    // var roleType = app.globalData.roleType;
    http.httpPost(domainUrl + "/company/queryCompanyPage", params).then((res) => {
      var data = res.data.data;
      // 查询成功
      if (res.data.statusCode == 200) {
        // 查询的用户列表
        var ordinaryUser = data.ordinaryUser.list;
        var page = params.page;
        var list;
        var hasMore = true; //判断下一次是否可以继续上拉刷新
        var hasData = true; //是否有数据

        if (that.data.isFirstRequest) {
          hasData = ordinaryUser.length != 0;
          // 赋值isFirstRequest为false
          that.setData({
            isFirstRequest: false,
            hasData: hasData
          });
        }

        if (page > 1) {
          //查询第一页以后的数据
          var oldList = that.data.ordinaryUser;
          if (ordinaryUser.length != 0) {
            for (var i = 0; i < ordinaryUser.length; i++) {
              oldList.push(ordinaryUser[i]);
            }
          } else {
            hasMore = false;
          }
          list = oldList;
        } else {
          //第一次查询数据
          if (ordinaryUser.length == 0) {
            hasMore = false;
          }
          list = ordinaryUser;

        }
        that.setData({
          ordinaryUser: list,
          hasMore: hasMore,
          page: page,
          search: search,
          pointUser: data.pointUser,
          bannerList: data.bannerList
        });

      } else {
        wx.showModal({
          content: res.data.msg,
          showCancel: false,
        })
      }
      wx.stopPullDownRefresh();
      that.hideTime();
      // that.handleAddress(enterPirseList, myHasMore, roleType, pageObjec.page, search);
    }).catch((errMsg) => {
      console.log(errMsg);
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
    //设置首页可执行onshow方法
    // app.globalData.isCompanyShow = true;
    var that = this;

    that.authAddress(1, "");
    var isNew = app.globalData.isNew;
    that.setData({
      isNew: isNew
    })
    if (isNew) {
      wx.hideTabBar({
        aniamtion: true
      })
    } else {
      wx.showTabBar({
        aniamtion: true
      })
    }
    // 携带的参数，scene
    // if (JSON.stringify(options) == "{}" && options.scene != undefined && options.scene) {
    //   var scene = decodeURIComponent(options.scene);
    // } else {}
    if (app.globalData.openid && app.globalData.openid != "") {
      var isNew = app.globalData.isNew;
      that.setData({
        isNew: isNew
      })
      // if (isNew) {
      //   wx.hideTabBar({
      //     aniamtion: true
      //   })
      // } else {
      //   wx.showTabBar({
      //     aniamtion: true
      //   })
      // }
      // that.distinguishAddress(1, "");
    } else {
      // 由于请求是网络请求，可能会在 Page.onLoad执行 之后才返回
      // 所以此处加入 callback 以防止这种情况
      // app.openIdCallback = openid => {
      //   var isNew = app.globalData.isNew;
      //   that.setData({
      //     isNew: isNew
      //   })
      //   if (isNew) {
      //     wx.hideTabBar({
      //       aniamtion: true
      //     })
      //   }
      //   if (openid != '') {
      //     that.distinguishAddress(1, "");
      //   }
      // }
    }
  },
  // 新增企业按钮
  addEnterprise: function() {
    var that = this;
    wx.navigateTo({
      url: '../../cardCase/addEnterpriseCard/addEnterpriseCard?status=add'
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    // this.callPhoneModal = this.selectComponent("#callPhoneModal");
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    var that = this;

    let pages = getCurrentPages();
    let currPage = pages[pages.length - 1];
    // 判断搜索的内容是否为空
    if (currPage.data.search != "") {
      that.setData({
        isFirstRequest: true,
        hasData: true
      });
      this.authAddress(1, currPage.data.search);
    } else if (!that.data.isFirstRequest) {
      // search为空时查询所有的数据
      that.setData({
        isFirstRequest: true,
        hasData: true
      });
      this.authAddress(1, "");
    }

  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    var that = this;
    that.setData({
      isFirstRequest: true,
      hasData: true
    })
    this.authAddress(1, '');
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    var that = this;
    if (that.data.hasMore) { //判断是否还有更多
      var myPage = that.data.page + 1;
      var mySearch = that.data.search;
      this.authAddress(myPage, mySearch);
    }
  },

})