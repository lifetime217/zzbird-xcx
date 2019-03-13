//app.js
var util = require("util/request/request.js");
App({
  onLaunch: function() {
    var that = this;
    // 获取sessionKey
    that.queryUserRole().then(function(sessionKey) {
      if (that.sessionKeyCallback) {
        that.sessionKeyCallback(sessionKey);
      }
    });
  },
  onShow: function() {
    // 如果sesionkey为空重新获取sessionkay
    if (this.globalData.sessionKey == "" && this.globalData.isFirstRequest != 0) {
      this.queryUserRole();
    }
  },
  globalData: {
    sessionKey: "A86AF68596912C7E8E4E204F19F16133", // 与后台交互的标识  代替了openid
    searchHistory: [], //搜索历史
    roleVal: "10", //用户角色
    domainUrl: "http://192.168.1.101", //本机
    flagback: 0, //搜索页面返回首页 0左上角返回 1按钮返回或者历史返回
    // domainUrl:  "http://192.168.0.105/", //本机
    // domainUrl: "https://zzn.luoran.net/zzn/",
    isFirstRequest: 0, //判断请求后台是否是第一次请求 0是第一次 
  },
  /**
   * 判断用户是否是新老用户 如老用户则查询用户的角色和公司
   */
  queryUserRole: function() {
    var that = this;
    return new Promise((resolve, reject) => {
      wx.login({
        success: function(res) {
          if (res.code) {
            util.httpGet(that.globalData.domainUrl + "/login/getXcxUserOpenid/" + res.code, {
              "zzbird_XcxSessionKey": "loginCode"
            }).then((res) => {
              var data = res.data.data;
              if (res.data.statusCode == 200) {
                that.globalData.sessionKey = data.sessionKey;
                //方便onshow方法判断(第一次不执行)
                that.globalData.isFirstRequest = 1;
                if (data.roleVal != undefined) {
                  that.globalData.roleVal = data.roleVal;
                }
                resolve(data.sessionKey);
              } else {
                wx.showModal({
                  title: "提示",
                  content: "获取不到用户的信息",
                  showCancel: false,
                  confirmColor: "#50ACFF"
                })
              }
            }).catch((errMsg) => {
              console.log(errMsg); //错误提示信息
              wx.showModal({
                content: '网络异常',
                showCancel: false,
              })
            });
          }
        },
        fail: function(res) {},
        complete: function(res) {},
      })
    });
  }
})