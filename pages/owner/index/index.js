// miniprogram/pages/owner/index/index.js
var app = getApp();
var domainUrl = app.globalData.domainUrl;
var http = require("../../../util/request/request.js");
Page({
  /**
   * 页面的初始数据
   */
  data: {
    menuitems_com: [{
        text: '企业老师',
        type: 'enterPriseToTea',
        url: '../enterpriseTea/enterpriseTea',
        icon: 'icon-qiyelaoshi',
        ismore: true
      },
      {
        text: '企业学生',
        type: 'enterpriseToStu',
        url: '../enterpriseStu/enterpriseStu',
        icon: 'icon-qiyexuesheng',
        ismore: true
      },
      {
        text: '修改企业',
        type: 'updateCompany',
        url: '../../cardCase/addEnterpriseCard/addEnterpriseCard',
        icon: 'icon-xiugai',
        ismore: true
      },
      {
        text: '消息列表',
        type: 'messageToEnter',
        url: '../../message/index/index',
        icon: 'icon-xiaoxiliebiao',
        ismore: true
      }
    ],
    menuitems_tea: [{
        text: '课程列表',
        type: 'course',
        url: '../courseList/courseList',
        icon: 'icon-kechengliebiao',
        ismore: true
      },
      {
        text: '学生列表',
        type: 'stuList',
        url: '../stuList/stuList',
        icon: 'icon-xueshengliebiao',
        ismore: true
      },
      {
        text: '消息列表',
        type: 'messageToTea',
        url: '../../message/index/index',
        icon: 'icon-xiaoxiliebiao',
        ismore: true
      }
    ],
    menuitems_par: [{
        text: '课时账单',
        type: 'punchClock',
        url: '../punchClockSituation/punchClockSituation',
        icon: 'icon-keshizhangdan',
        ismore: true
      },
      {
        text: '消息列表',
        type: 'messageToStu',
        url: '../../message/index/index',
        icon: 'icon-xiaoxiliebiao',
        ismore: true
      }
    ],
    // company: [], //用户的企业
    companyId: "", //公司id
    roleType: 0, //用户角色
    lookNum: 0, //查看次数
    shareCount: 0, //分享次数
    stuCount: 0, //企业学生人数
    cumulativeClassHour: 0, //累计课时
    avgClassHour: 0, //平均课时
    courseCount: 0, //课程数量
    stuCount: 0, //学生数量
    monthClassHour: 0, //本月多少课时
    isEdit: 0, // 0代表没有默认名字的  1代表编辑之后的   2代表 有默认名字的
    userinfo: {}, //用户的信息
    userObj: {}, //查询的用户信息
    isShow: false, //判断是否是第一次进入个人中心界面
  },
  /**
   * 编辑姓名和图片
   */
  updateName: function(e) {
    var that = this;
    var userObj = that.data.userObj;
    wx.navigateTo({
      url: '../updateNameAndPhoto/updateNameAndPhoto?openId=' + userObj.openId + '&nickName=' + userObj.newName + '&avatarUrl=' + userObj.newUrl + '&companyId=' + that.data.companyId
    })
  },
  // 显示加载框
  showLoad: function() {
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
  },
  // 隐藏加载框f
  hideTime: function() {
    setTimeout(function() {
      wx.hideLoading();
    }, 1000);
  },
  // 授权获取
  confirmModal: function(e) {
    var that = this;
    if (e.target.dataset.userinfo) {
      //用户按了允许授权按钮
      var userinfo = e.target.dataset.userinfo;
      var openid = app.globalData.openid;
      var companyId = that.data.companyId;
      http.httpPost(domainUrl + "/api/auth/updateUser", {
        "openId": openid,
        "avatarUrl": userinfo.avatarUrl,
        "city": userinfo.city,
        "country": userinfo.country,
        "gender": userinfo.gender,
        "language": userinfo.language,
        "nickName": userinfo.nickName,
        "province": userinfo.province
      }).then((res) => {
        var user = res.data.userInfo;
        user.nickName = userinfo.nickName;
        user.avatarUrl = userinfo.avatarUrl;
        that.setData({
          userObj: user
        });
        wx.navigateTo({
          url: '../updateNameAndPhoto/updateNameAndPhoto?nickName=' + user.nickName + '&avatarUrl=' + user.avatarUrl + '&openId=' + user.openId + '&companyId=' + companyId
        })
      }).catch((errMsg) => {
        wx.showModal({
          content: '网络异常',
          showCancel: false,
        })
        that.hideTime();
        wx.stopPullDownRefresh();
      });
    }
  },
  /**
   * 列表跳转页面
   */
  clickOwner: function(e) {
    const url = e.currentTarget.dataset.url;
    const ismore = e.currentTarget.dataset.ismore;
    if (ismore) {
      const type = e.currentTarget.dataset.type;
      if (type == 'updateCompany') {
        var companyId = app.globalData.companyId; //默认的公司
        wx.navigateTo({
          url: url + "?status=edit&id=" + companyId
        })
      }else{
        wx.navigateTo({
          url: url
        })
      }
     
    }
  },

  /**
   * 查询个人中心的数据
   */
  queryOwnerUer: function(openid, roleType, companyId) {
    var that = this;
    that.showLoad();
    var url = "";
    var params = {};
    // 用户
    if (roleType == 0) {
      url = domainUrl + "/course/home/select"
      params.openId = openid;
      params.role = roleType;
      params.companyId = companyId;
    }
    // 老师
    else if (roleType == 1) {
      url = domainUrl + "/course/user/select"
      params.companyId = companyId;
      params.userOpenid = openid;
    }
    // 企业
    else {
      url = domainUrl + "/company/user/sele";
      params.id = companyId;
      params.wxOpenId = openid;
    }
    http.httpPost(url, params).then((res) => {
      // 查询用户的头像和名字
      that.queryUser(openid, companyId, roleType).then(function(res1) {
        var data_user = res1.data.user;
        // 查询出有公司的信息
        if (res.data.success) {
          var data = res.data.data;
          // 用户
          if (roleType == 0) {
            that.setData({
              roleType: roleType,
              courseCount: data.number,
              monthClassHour: data.month,
              cumulativeClassHour: data.cumulative,
              userObj: data_user
            });
          }
          // 老师
          else if (roleType == 1) {
            that.setData({
              roleType: roleType,
              courseCount: data.courseNumber,
              stuCount: data.Number,
              cumulativeClassHour: data.conCount,
              userObj: data_user
            });
          }
          // 企业
          else {
            that.setData({
              roleType: roleType,
              lookNum: data.ViewCount,
              stuCount: data.Number,
              avgClassHour: data.average,
              shareCount: data.shareCount,
              cumulativeClassHour: data.conCount,
              userObj: data_user
            });
          }
        }
        // 没有公司的信息
        else {
          if (roleType == 0) {
            that.setData({
              roleType: roleType,
              userObj: data_user
            });
          }
          // 老师
          else if (roleType == 1) {
            that.setData({
              roleType: roleType,
              userObj: data_user
            });
          }
          // 企业
          else {
            that.setData({
              roleType: roleType,
              userObj: data_user
            });
          }
        }

        that.hideTime();
      });
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
   * 查询用户的头像和名字
   */
  queryUser: function(openId, companyId, roleType) {
    var that = this;
    return new Promise((resolve, reject) => {
      http.httpPost(domainUrl + "/api/auth/getUserInfo", {
        "openId": openId,
        "companyId": companyId,
        "roleType": roleType
      }).then((res) => {
        resolve(res);
      }).catch((errMsg) => {
        wx.showModal({
          content: '网络异常',
          showCancel: false,
        })
        that.hideTime();
      });;
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

    //设置页面可执行onshow方法
    app.globalData.isOwnerShow = true;
    var that = this;
    var openid = app.globalData.openid;
    var roleType = app.globalData.roleType;
    var companyId = app.globalData.companyId; //默认的公司
    // var temp = this.data.menuitems_com;
    // temp[0].url = '../../cardCase/addEnterpriseCard/addEnterpriseCard?status=edit&id=' + companyId
    // console.log(temp)
    that.setData({
      companyId: companyId,
      // menuitems_com: temp
    })

    // 先查询出了角色及数据，然后 再查询用户的头像和名字
    that.queryOwnerUer(openid, roleType, companyId);
  },

  /**
   * 选择公司
   */
  // checkCompany: function(e) {
  //   var that = this;
  //   var companyid = e.currentTarget.dataset.companyid;
  //   var companyname = e.currentTarget.dataset.companyname;
  //   var roleType = that.data.roleType;
  //   //修改上次登录的次数
  //   that.updateLastLogin(companyid, roleType).then(function(res) {
  //     app.globalData.companyId = companyid;
  //     app.globalData.companyName = companyname;
  //     that.swichCompany.hide();
  //     that.hideTime();
  //     // 重新赋值，否则数据不清空
  //     that.setData({
  //       companyId: app.globalData.companyId, //公司id
  //       lookNum: 0, //查看次数
  //       shareCount: 0, //分享次数
  //       stuCount: 0, //企业学生人数
  //       cumulativeClassHour: 0, //累计课时
  //       avgClassHour: 0, //平均课时
  //       courseCount: 0, //课程数量
  //       stuCount: 0, //学生数量
  //       monthClassHour: 0, //本月多少课时
  //     });
  //     that.onLoad();
  //   });
  // },
  /**
   * 修改用户最后一次登录的次数
   */
  // updateLastLogin: function(companyId, roleType) {
  //   var that = this;
  //   that.showLoad();
  //   return new Promise((resolve, reject) => {
  //     http.httpPost(domainUrl + "/company/updateLastLogin", {
  //       "companyId": companyId,
  //       "userOpenid": app.globalData.openid,
  //       "roletype": roleType
  //     }).then((res) => {
  //       resolve(res);
  //     }).catch((errMsg) => {
  //       wx.showModal({
  //         content: '网络异常',
  //         showCancel: false,
  //       })
  //       that.hideTime();
  //     });
  //   })
  // },
  /**
   * 选择的角色下标
   */
  // changeRadio: function(e) {
  //   var that = this;
  //   this.swichRoleToast.hide();
  //   var roleType = e.currentTarget.dataset.roletype;
  //   var companyId = that.data.companyId;
  //   //修改上次登录的次数
  //   that.updateLastLogin(companyId, roleType).then(function(res) {
  //     app.globalData.roleType = roleType;
  //     that.swichCompany.hide();
  //     // 重新赋值，否则数据不清空
  //     that.setData({
  //       roleType: roleType,
  //       lookNum: 0, //查看次数
  //       shareCount: 0, //分享次数
  //       stuCount: 0, //企业学生人数
  //       cumulativeClassHour: 0, //累计课时
  //       avgClassHour: 0, //平均课时
  //       courseCount: 0, //课程数量
  //       stuCount: 0, //学生数量
  //       monthClassHour: 0, //本月多少课时
  //     });
  //     that.hideTime();
  //     that.onLoad();
  //   });
  // },
  /**
   * 切换账号
   */
  changeStatus: function() {
    // this.swichRoleToast.show();

    wx.navigateTo({
      url: '../changeRole/changeRole'
    })
  },
  /**
   * 切换公司按钮
   */
  // changeCompany: function() {
  //   var company = this.data.company;
  //   if (company.length == 0) {
  //     wx.showToast({
  //       icon: 'none',
  //       title: '暂无公司',
  //     })
  //   } else {
  //     this.swichCompany.show();
  //   }
  // },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    // this.swichRoleToast = this.selectComponent("#swichRoleToast");
    // this.swichCompany = this.selectComponent("#swichCompany");
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    //判断页面是否可执行onshow方法
    if (app.globalData.isOwnerShow) {
      var that = this;
      var openid = app.globalData.openid;
      var roleType = app.globalData.roleType;
      var companyId = app.globalData.companyId; //默认的公司
      this.setData({
        // company: app.globalData.companyRoleList,
        companyId: companyId,
        roleType: roleType
      });
      // 修改了名字之后重新请求一下
      let pages = getCurrentPages();
      let currPage = pages[pages.length - 1];
      if (currPage.data.success != null) {
        if (currPage.data.success) {
          that.onLoad();
        }
      } else if (currPage.data.flag != null) {
        if (currPage.data.flag) {
          that.onLoad();
        }
      }
      //判断是否有奇他情况,若是，则只将其他情况置为false；若否，则将页面是否刷新置为false
      if (app.globalData.isOtherShow) {
        app.globalData.isOtherShow = false;
      } else {
        app.globalData.isOwnerShow = false;
      }
    }
    // //第一次就不进入查询用户和信息
    // if (that.data.isShow) {
    //   that.queryOwnerUer(openid, roleType, companyId);
    // }
    // that.setData({
    //   isShow: true,
    // })


  },

  // }
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {
    // this.swichRoleToast.hide();
    // this.swichCompany.hide();
  },
})