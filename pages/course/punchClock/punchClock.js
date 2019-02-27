// miniprogram/pages/home/punchClock/punchClock.js
var app = getApp();
var domainUrl = app.globalData.domainUrl;
var http = require("../../../util/request/request.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    roleType: 0,
    teacher: "王老师",
    courseId: "", //课程id
    // stuList: [], //学生
    // course: [], //课程
    // teaList: [], //老师
    // clock: [], //打卡信息
    clickList: [],
    // isClock: false,//是否打卡
    stuClok: [],
    punchIn: [], //已经打卡学员
    punchUp: [] //未打卡学员
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

  //存储打卡学生数组
  clockCase: function(e) {
    var id = e.currentTarget.dataset.id;
    var name = e.currentTarget.dataset.name;
    var img = e.currentTarget.dataset.img;
    var clickList = this.data.clickList;
    // 数组中有数据，做判断是否有数据。有数据就删除
    if (clickList.length != 0) {
      var index = this.validateId(clickList, 'id', id);
      if (index != -1) {
        clickList.splice(index, 1);
      } else {
        var obj = {
          "name": name,
          "img": img,
          "id": id
        };
        clickList.push(obj);
      }
      this.setData({
        clickList: clickList
      })
    } else {
      var obj = {
        "name": name,
        "img": img,
        "id": id
      };
      clickList.push(obj);
      this.setData({
        clickList: clickList
      })
    }
  },
  // 打卡
  punchClock: function(e) {
    var that = this;
    var clickList = this.data.clickList;
    var courseId = this.data.courseId;
    var openid = app.globalData.openid;
    if (clickList.length != 0) {
      that.showLoad();
      http.httpPost(domainUrl + "/punch/punchIn", {
        "courseId": courseId,             //课程id
        "teaOpenid": openid,              //老师的openid
        "sendOpenid": that.data.openId1,  //发送人openid
        "isdelete": 0,                    //是否删除
        "acceptOpenid": openid,           //接受人openid
        "type": 2,                        //类型2为打卡消息
        "companyId": app.globalData.companyId, //公司id
        "level": 0,                       //是否置顶
        "isAccept": 1,                    //是否接受
        "userlist": JSON.stringify(clickList),//学生openid
        
      }).then((res) => {
        if (res.data.code == 200 && res.data.success) {
          var data = res.data;
          // 提交成功之后清空集合
          that.setData({
            clickList: []
          });
          that.queryPlockStuList(courseId);
        }
        that.hideTime();
      }).catch((errMsg) => {
        wx.showModal({
          content: '网络异常',
          showCancel: false,
        })
        that.hideTime();
      });
    } else {
      wx.showToast({
        icon: 'none',
        title: '请选择学员',
      })
    }
    this.setData({
      clickList: [],
    })
  },
  //刷新打卡人员
  // display: function() {
  //   var punchIn = this.data.punchIn;
  // },
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
   * 查询打卡和未打卡的成员
   */
  queryPlockStuList: function(courseId) {
    var that = this;
    that.showLoad();
    console.log("进来了");
    console.log(courseId);
    http.httpPost(domainUrl + "/punch/queryGrouping", {
      "id": courseId
    }).then((res) => {
      var data = res.data;
      if (data.success) {
        that.setData({
          courseId: courseId,
          punchIn: data.data.punchIn,
          punchUp: data.data.punchUp
        });
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
    var that = this;
    var courseId = options.id; //课程id
    // var courseId = "3a38ab892ed544ea9cd86af828ac8bd8";
    this.queryPlockStuList(courseId);
  },
})