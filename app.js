//app.js
var util = require("util/request/request.js");
App({
  onLaunch: function() {
    var that = this;
    // 请求后台获取用户openid信息，判断是否存在数据库
    // wx.login({
    //   success: function(res) {
    //     if (res.code) {
    //       util.httpGet(that.globalData.domainUrl + "/xcx/getXcxUserOpenid/" + res.code, {}).then((res) => {
    //         var data = res.data.data;
    //         if (data.flag) {
    //           that.globalData.sessionKey = data.data.sessionKey;
    //         } else {
    //           wx.showModal({
    //             title: "提示",
    //             content: "获取不到用户的信息",
    //             showCancel: false,
    //             confirmColor: "#50ACFF"
    //           })
    //         }
    //         console.log(res);
    //         // // 没有获取到code，有网络错误 错误信息查看 https://developers.weixin.qq.com/miniprogram/dev/api/code2Session.html
    //         // 获取失败
    //         // if (!data.flag) {
    //         //   wx.showModal({
    //         //     title: "提示",
    //         //     content: data.msg,
    //         //     showCancel: false,
    //         //     confirmColor: "#50ACFF"
    //         //   })
    //         // } else {
    //         // that.globalData.isNew = data.isNew;  //是否是新用户
    //         // that.globalData.openid = data.user.openId;//openid
    //         // that.globalData.user = data.user;
    //         // if (!data.isNew){
    //         //   var companyAndRoleType = data.companyAndRoleType;
    //         //   if (companyAndRoleType.length > 0) {
    //         //     for (var i = 0; i < companyAndRoleType.length; i++) {
    //         //       if (companyAndRoleType[i].lastLogin == 1) {
    //         //         that.globalData.companyId = companyAndRoleType[i].companyId;
    //         //         that.globalData.companyName = companyAndRoleType[i].companyName;
    //         //         that.globalData.roleType = companyAndRoleType[i].roletype;
    //         //       }
    //         //     }
    //         //     // 如果没有上次登录的公司，就默认第一个公司
    //         //     if (that.globalData.companyId == "") {
    //         //       that.globalData.companyId = companyAndRoleType[0].companyId;
    //         //       that.globalData.companyName = companyAndRoleType[0].companyName;
    //         //       that.globalData.roleType = companyAndRoleType[0].roletype;
    //         //     }
    //         //   }
    //         //   that.globalData.companyRoleList = that.removeRepeat(companyAndRoleType); //去重复，所有的公司名字和id集合
    //         // }
    //         // 小程序进来首先执行的是app.js。但是请求方法的话，不是同步的，会直接跳到企业首页，添加callback变成同步
    //         // if (that.openIdCallback) {
    //         //   that.openIdCallback(data.openId);
    //         // }
    //         // }
    //       }).catch((errMsg) => {
    //         console.log(errMsg); //错误提示信息
    //         wx.showModal({
    //           content: '网络异常',
    //           showCancel: false,
    //         })
    //       });
    //     }
    //   },
    //   fail: function(res) {},
    //   complete: function(res) {},
    // })
  },
  onShow: function() {
    console.log("onshow");
  },
  globalData: {
    openid: "", //用户的openid
    roleType: 2, //角色类型，0代表普通用户(家长，孩子)   1代表老师   2代表企业 
    companyid: "530f3c1c0f494e319c9d87b4213bfe6d",
    searchHistory: [], //搜索历史
    isNew: true, //判断是否是新老用户
    domainUrl: "http://192.168.1.100", //本机
    flagback: 0, //搜索页面返回首页 0左上角返回 1按钮返回或者历史返回
    // domainUrl: "http://192.168.0.105/", //本机
    // domainUrl: "https://zzn.luoran.net/zzn/",
    sessionKey: "", // 与后台交互的标识
  },

  // 去重复
  // removeRepeat: function (data) {
  //   var hash = {};
  //   var data1 = data.reduce(function (item, next) {
  //     hash[next.companyId] ? '' : hash[next.companyId] = true && item.push(next);
  //     return item
  //   }, [])
  //   return data1;
  // },

})