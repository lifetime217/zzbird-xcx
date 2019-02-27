// miniprogram/pages/owner/punchClockSituation/punchClockSituation.js
var app = getApp();
var util = require('../../../util/util.js');
var domainUrl = app.globalData.domainUrl;
var http = require("../../../util/request/request.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    dateToolStatDate: '', //选择时间使用的开始日期
    dateToolEndDate: '', //选择时间使用的结束日期
    toDayDate: '', //初始化选择时间工具的今天的日期
    dateGroup: ["当月", "最近一个季度", "最近一年", "自定义时间","请选择"], //搜索时间类型组合
    dateIndex: 0, //时间类型的下标
    punchClockList: [], //打卡记录
    date: ['日', '一', '二', '三', '四', '五', '六'],//初始日历抬头
    dateArr: [],//日历数组
    year: "",//日历的年
    month: "",//日历的月
    today: 0,//日历的日
    courseName: "",
    tea_name: "",
    punch_date: "",
    punchList: [],//查看日历当天打卡详情的数组
    punchListing: [], //查看自定义事件打卡详情的数组
    punchCount: 0, //累计打卡次数
    layout: 0, //0 代表列表查询  1代表日历
    channel: false,//选择下摆的列表开启和关闭
    checkIndex: 0, //选择的下标
    content: "当月", //选择的搜索方式
    page: 0,//分页的page
    isView: 1,//控制日历年月日抬头的显示与隐藏
    hasMore: true,//判断按事件查询打卡详情是否还有跟多页数
    statDate: 0,//用于请求的开始日期全局参数
    endDate: 0,//用于请求的结束日期全局参数
    cuorseGroup: false,//控制按课程查询过的显示与否
    courseList: [],//用于接收按课程查询的集合
    entryList: [],//应用于接收按课程查询打卡详情的集合
    coursListPage: 0,//按课程查询的page
    coursListHasMore: true,//判断是否还有跟多的按课程查询
    endStartDate:'',//接收开始日期选择的日期传入选择结束日期的可选择开始日期

  },
  /**
   * 跳转课程
   */
  navCourse:function(e){
    wx.navigateTo({
      url: '../../course/courseDetail/courseDetail?id=' + e.currentTarget.dataset.courseid
    })
  },

  /**
   *跳转企业
   */
  navCompany:function(e){
    wx.navigateTo({
      url: '../../cardCase/enterpriseCard/enterpriseCard?companyId=' + e.currentTarget.dataset.companyid
    })
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
   * 开始时间
   */
  bindTimeChange: function(e) {

  },
  /**
   * 选择下标
   */
  chiceIndex: function(e) {
    var that = this;
    var index = e.currentTarget.dataset.index;
    var str = that.data.dateGroup[index];
    that.showLoad();
    var openid = app.globalData.openid;
    that.changeDateType(index);
    var statDate = that.data.statDate;
    var endDate = that.data.endDate;
    var cuorseGroup = that.data.cuorseGroup;
    var companyId = app.globalData.companyId;
    //判断日过查询当月，pagesize按20，如果查询当月，pagesize设为1000
    if (index > 0) {
      that.queryPunchClockList(1, openid, companyId, 20,statDate, endDate);
      var oldList = that.data.punchClockList;
      var newPunchDateList = that.changePunchDateStyle(oldList);
      that.setData({
        layout: 1,
        checkIndex: index,
        content: str,
        punchListing: newPunchDateList,
        isView: 0,
        cuorseGroup: false,
      });
    } else {
      that.queryPunchClockList(1, openid, companyId,1000, statDate, endDate);
      that.setData({
        layout: 0,
        checkIndex: index,
        content: str,
        isView: 1,
        cuorseGroup: false,
      });
    }



    that.setData({
      channel: false
    });
    that.hideTime();
  },
  /**
   * 选择时间的按钮
   */
  radioChange: function(e) {
  },
  /**
   * 点击按课程分组查询，打开关闭当月或自定义时间查询的选择下标
   */
  choiceItem: function(e) {
    var item = e.currentTarget.dataset.item;
    if (item == 1) {
      if (this.data.channel) {
        this.setData({
          channel: false
        });
      } else {
        this.setData({
          channel: true
        });
      }
    } else {
      this.setData({
        channel: false
      });
    }
    //按课程查询
    if (item == 2) {
      var index = this.data.checkIndex;
      this.changeDateType(index);
      var isView = this.data.isView;
      var layout = this.data.layout;
      var statDate = this.data.statDate;
      var endDate = this.data.endDate;
      var openId = app.globalData.openid;
      var dataGroup = this.data.dateGroup;
      var companyId = app.globalData.companyId;
      if(!this.data.cuorseGroup){
        this.setData({
          cuorseGroup: true,
          isView: 0,
          layout: 3,
          checkIndex: 4,
          content: dataGroup[4],
          dateToolStatDate:'',
          dateToolEndDate:'',
        });
        this.queryPunchByCourse(1, openId, companyId);
      }
       
      
    }

  },

  /**
   * 布局选择
   */
  layout: function(e) {
    var that = this;
    var type = e.currentTarget.dataset.type;
    var oldList = that.data.punchClockList;
    var newPunchDateList = that.changePunchDateStyle(oldList);
    if (type != 1) {

      this.setData({
        punchListing: newPunchDateList,
        layout: 1,
      });
    } else {
      this.setData({
        layout: 0
      });
    }

  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;
    //that.showLoad();
    wx.stopPullDownRefresh;
    that.initAtDate();
    var openid = app.globalData.openid;
    that.changeDateType(0);
    var statDate = that.data.statDate;
    var endDate = that.data.endDate;
    var companyId = app.globalData.companyId;
    that.queryPunchClockList(1, openid, companyId ,1000,statDate, endDate);
    that.hideTime();

  },
  //变更开始日期和结束日期，传入下标
  changeDateType: function(index) {
    var that = this;
    let now = new Date();
    let year = now.getFullYear();
    let month = now.getMonth();
    //按当月查询
    if (index == 0) {
      var statDate = util.getTimestamp(new Date(year + "-" + (month + 1) + "-1"));
      var endDate = util.getTimestamp(new Date());
      that.data.statDate = statDate;
      that.data.endDate = endDate;
      //按最近一个季度
    } else if (index == 1) {
      var statDate = util.getTimestamp(new Date(year, that.getQuarterStartMonth(), 1));
      var endDate = util.getTimestamp(new Date());
      that.data.statDate = statDate;
      that.data.endDate = endDate;
      //最近一年
    } else if (index == 2) {
      var statDate = util.getTimestamp(new Date(year, 0, 1));
      var endDate = util.getTimestamp(new Date());
      that.data.statDate = statDate;
      that.data.endDate = endDate;
      //自定义时间查询
    } else if (index == 3) {
      var dateToolStatDate = that.data.dateToolStatDate;
      var dateToolEndDate = that.data.dateToolEndDate;
      var newStatDate = that.dataTypeTool(dateToolStatDate + ' 00:00:00');
      var newEndDate = that.dataTypeTool(dateToolEndDate + ' 23:59:59');
      that.data.statDate = newStatDate;
      that.data.endDate = newEndDate;
    }
  },
  //传入时间格式的转换成时间粗
  dataTypeTool: function(str) {
    str = str.replace(/-/g, '/');
    var timestamp = new Date(str).getTime() / 1000;
    return timestamp;
  },


  getQuarterStartMonth: function() {
    let now = new Date();
    let nowMonth = now.getMonth();
    var quarterStartMonth = 0;
    if (nowMonth < 3) {
      quarterStartMonth = 0;
    }
    if (2 < nowMonth && nowMonth < 6) {
      quarterStartMonth = 3;
    }
    if (5 < nowMonth && nowMonth < 9) {
      quarterStartMonth = 6;
    }
    if (nowMonth > 8) {
      quarterStartMonth = 9;
    }
    return quarterStartMonth;
  },


  /**
   * 找到符合当前日期的数组元素的下标
   */
  findElem: function(arrayToSearch, existIndex, date) {
    var findIndexList = [];
    for (var i = 0; i < arrayToSearch.length; i++) {
      var identifier = true; //控制是否存在数组中，如没有就添加
      // 判断数组下标是否已经存在existIndex中
      for (var j = 0; j < existIndex.length; j++) {
        if (existIndex[j].indexOf(i) != -1) {
          identifier = false;
          break;
        }
      }
      if (identifier) {
        // 打卡时间戳
        var punch_clock_timestamp = arrayToSearch[i].punchClockDate;
        // 打卡日期

        var punch_clock_date = util.formatTime(punch_clock_timestamp).substring(0, 10);
        var atDate = date;

        if (punch_clock_date == atDate) {
          findIndexList.push(i);
        }
      }
    }
    if (findIndexList.length > 0) {
      return findIndexList;
    } else {
      return -1;
    }
  },
  /**
   * 初始化日期
   */
  dateInit: function(punchClockList) {
    let dateArr = []; //需要遍历的日历数组数据
    let arrLen = 0; //dateArr的数组长度
    let now = new Date();
    var today = now.getDate();
    let year = now.getFullYear();
    let month = now.getMonth(); //没有+1方便后面计算当月总天数
    var lastNums; //上个月的天数
    if (month == 0) {
      lastNums = new Date(year - 1, 12, 0).getDate();
    } else {
      lastNums = new Date(year, month, 0).getDate();
    }
    var startWeek = new Date('' + year + ',' + (month + 1) + ',1').getDay(); //目标月1号对应的星期
    var dayNums = new Date(year, (month + 1), 0).getDate(); //获取目标月有多少天
    var finalWeek = new Date('' + year + ',' + (month + 1) + ',' + dayNums + '').getDay(); //最后一天的星期下标
    arrLen = startWeek + dayNums;
    var j = startWeek;
    var existIndex = []; //已存在元素的下标
    var existLength = 0; //已存在的元素的长度
    var flag = false; //控制existLength长度添加
    for (let i = 0; i < arrLen; i++) {
      let obj = {};
      if (i >= startWeek) {
        obj.day = i - startWeek + 1;
        obj.isLast = false;
        if (today >= i - startWeek + 1) {
          if (punchClockList.length != 0) {
            // 如果已经找完了就不需要再找
            if (flag) {
              for (var j = 0; j < existIndex.length; j++) {
                existLength = existLength + existIndex[j].length;
              }
            }
            if (existLength == punchClockList.length) {
              obj.isPunch = false;
            } else {
              // 找到符合日期的元素下标
              var findIndex;
              var newMonth;
              if ((month + 1) < 10) {
                newMonth = '0' + (month + 1);
              }
              if (i - startWeek + 1 < 10) {
                findIndex = this.findElem(punchClockList, existIndex, year + "-" + newMonth + "-0" + (i - startWeek + 1));
              } else {
                findIndex = this.findElem(punchClockList, existIndex, year + "-" + newMonth + "-" + (i - startWeek + 1));
              }
              if (findIndex != -1) {
                obj.isPunch = true; //返回一个给页面判断可以点击的下标
                obj.clickPunchIndex = findIndex;
                flag = true;
                existIndex.concat(findIndex);
              } else {
                flag = false;
                obj.isPunch = false;
              }
            }
          } else {
            obj.isPunch = false;
          }
        } else {
          obj.isPunch = false;
        }
      } else {
        obj.day = lastNums - (--j);
        obj.isLast = true;
      }
      dateArr[i] = obj;
    }
    var dateArrlength = dateArr.length;
    for (var i = 0; i < 6 - finalWeek; i++) {
      let obj = {};
      obj.day = i + 1;
      obj.isLast = true;
      dateArr[dateArrlength + i] = obj;
    }

    this.setData({
      dateArr: dateArr,
      year: year,
      today: today,
      month: month + 1
    })
  },
  // 查看打卡记录
  seeRecord: function(e) {
    var clickpunchindex = e.currentTarget.dataset.clickpunchindex;
    var punchClockList = this.data.punchClockList;
    var punchList = [];

    for (var i = 0; i < clickpunchindex.length; i++) {
      var punchObj = punchClockList[clickpunchindex[i]];
      // 判断是否是number类型
      //if (typeof(punchObj.punch_clock_date) == "number") {
      var oldDate = punchObj.punchClockDate;
      var newDate = util.formatTime(oldDate);
      punchObj.punchClockDate = newDate;
      //punchObj.punch_clock_date = util.formatTime(punchObj.punch_clock_date);
      // }
      punchList.push(punchObj);
    }
    this.setData({
      punchList: punchList
    });
    this.showRecordToastModal.show();
    
   
  },
  //更改打卡日期格式
  changePunchDateStyle: function(oldList) {
    var that = this;
    var newPunchList = [];
    for (var i = 0; i < oldList.length; i++) {
      oldList[i].punchClockDate = util.formatTime(oldList[i].punchClockDate);
      newPunchList.push(oldList[i]);
    }
    return newPunchList;
  },
  /**
   * 查询学生记录
   */
  queryPunchClockList: function (page, openId, companyId,pageSize,statDate, endDate) {
    this.showLoad();
    return new Promise((resolve, reject) => {
      var that = this;
      http.httpPost(domainUrl + "/punch/bill/select", {
        "page": page,
        "openId": openId,
        "companyId":companyId,
        "statDate": statDate,
        "endDate": endDate,
        "pageSize": pageSize
      }).then((res) => {
        var data = res.data;
        var punchClock = res.data.data.rows;
        var pageObject = res.data.data;
        var page = pageObject.page


        //判断是否还有跟多记录条数
        var myHasMore = (pageObject.page * pageObject.pageSize) < data.count
        //加载第一页以后的数据
        if (pageObject.page > 1 && punchClock.length != 0) {
          var oldList = that.data.punchClockList;
          for (var i = 0; i < punchClock.length; i++) {
            oldList.push(punchClock[i])
          }

          var newPunchDateList = this.changePunchDateStyle(oldList);

          that.setData({
            punchClockList: oldList,
            hasMore: myHasMore,
            page: page,
            punchListing: newPunchDateList,
            punchCount: data.count,
          })
          that.dateInit(oldList);
          //判断如果没有数据
        } else if (punchClock.length == 0 && page == 1) {
          that.setData({
            punchClockList: punchClock,
            hasMore: myHasMore,
            page: page,
            punchListing: [],
            punchCount: data.count,
          })
          that.dateInit([]);
          //首次加载数据
        } else {
          var newPunchDateList = this.changePunchDateStyle(punchClock);
          that.setData({
            punchClockList: punchClock,
            hasMore: myHasMore,
            page: page,
            punchListing: newPunchDateList,
            punchCount: data.count,
          })
          that.dateInit(that.data.punchClockList);

        }


        that.hideTime();
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
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    //当月日历的弹出框
    this.showRecordToastModal = this.selectComponent("#showRecordToastModal");
    //按课程查询的弹出框
    this.showRecordToastModal2 = this.selectComponent("#showRecordToastModal2")
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
    var cuorseGroup = this.data.cuorseGroup;
    var openid = app.globalData.openid;
    var index = this.data.checkIndex;
    var companyId = app.globalData.companyId;
    if (!cuorseGroup) {
      if (index>0){
        this.queryPunchClockList(1, openid, companyId, 20,this.data.statDate, this.data.endDate);
      }else{
        this.queryPunchClockList(1, openid, companyId,1000, this.data.statDate, this.data.endDate);
      }
     

    } else {
      this.queryPunchByCourse(1, openid, companyId);

    }
    
    wx.stopPullDownRefresh();
    this.showRecordToastModal.hide();
   
  },
 

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    var coursListPage = this.data.coursListPage;
    var cuorseGroup = this.data.cuorseGroup;
    var openid = app.globalData.openid;
    var myPage = this.data.page + 1;
    var openId = this.data.openId;
    var index = this.data.checkIndex;
    var companyId = app.globalData.companyId;
    if (!cuorseGroup) {
        //判断不是按当月时间查询和不是日历状态
      if (this.data.layout != 0 || this.data.checkIndex != 0) {
        if (index >0&&this.data.hasMore) { //判断是否还有更多
          // this.showLoad();
          this.queryPunchClockList(myPage, openid, companyId,20,this.data.statDate, this.data.endDate);
          var oldList = this.data.punchClockList;
          var newPunchDateList = this.changePunchDateStyle(oldList);
          this.setData({
            punchListing: newPunchDateList,
          })
        }
      }
    } else {
      this.queryPunchByCourse(coursListPage, openid, companyId);
    }

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },
  queryPunchByCourse: function(page, openId,companyId) {
    this.showLoad();
    new Promise((resolve, reject) => {
      var that = this;
      http.httpPost(domainUrl + "/punch/bill/groupByCourse", {
        "page": page,
        "openId": openId,
        "companyId": companyId,
      }).then((res) => {
        var data = res.data;
        var rows = res.data.data.rows;
        var pageObject = res.data.data;
        var page = pageObject.page
        var newList = that.changePunchDateStyle2(rows);
        var oldList = that.data.courseList

        var myHasMore = (pageObject.page * pageObject.pageSize) < pageObject.records;
        if (pageObject.page > 1 && rows.length != 0) {
          for (var i = 0; i < newList.length; i++) {
            oldList.push(newList[i]);
          }

          that.setData({
            coursListPage: page,
            courseList: oldList,
            coursListHasMore: myHasMore,
          })
        } else {
          that.setData({
            coursListPage: page,
            courseList: newList,
            coursListHasMore: myHasMore,
          })
        }


        that.hideTime();
      }).catch((errMsg) => {
        wx.showModal({
          content: '网络异常',
          showCancel: false,
        })
        that.hideTime();
      });
    })
  },
  //转换打卡时间的样式
  changePunchDateStyle2: function(oldList) {
    var that = this;
    for (var i = 0; i < oldList.length; i++) {
      var entryList = oldList[i].entryList;
      for (var j = 0; j < entryList.length; j++) {
        entryList[j].punchClockDate = util.formatTime(entryList[j].punchClockDate);
      }
    }
    return oldList;

  },
  stopDrag:function(){
    return false;
  },
  //查看按课程查询打卡明细
  lookKunchClock: function(e) {
    var list = e.currentTarget.dataset.list;
    var courseName = e.currentTarget.dataset.coursename;
    for (var i = 0; i < list.length; i++) {
      list[i].courseName = courseName;
    }
    this.setData({
      entryList: list,
    })

    this.showRecordToastModal2.show();
  },


  bindStatDateChange(e) {
    this.setData({
      dateToolStatDate: e.detail.value,
      endStartDate: e.detail.value,
    })
  },
  bindEnedDateChange(e) {
    this.setData({
      dateToolEndDate: e.detail.value
    })
  },
  //初始化今天的日期
  initAtDate: function() {
    var date = util.formatTime(new Date()).substring(0, 10);
    this.setData({
    
      toDayDate: date,
    })
  },
})