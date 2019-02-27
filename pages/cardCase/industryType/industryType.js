var app = getApp();
var domainUrl = app.globalData.domainUrl;
var http = require("../../../util/request/request.js");
Page({
  /**
   * 页面的初始数据
   */
  data: {
    currentTab: 0,
    winwidth: 0,
    insturyList: [], //所有的标签

    instury: [], //行业类型标签
    insturyTagList: [], //选择的行业所对应标签
    key: 0,
    selected: [], //选中的id
  },
  /**
   * 选择行业标签
   */
  swichNav: function(e) {
    var that = this;
    if (this.data.currentTab === e.target.dataset.current) {
      return false;
    } else {
      var current = e.target.dataset.current;
      var insturyTagList = []; // 选择的行业标签所对应的子标签
      var insturyList = that.data.insturyList; //所有的标签
      for (var i = 0; i < insturyList.length; i++) {
        if (i == current) {
          insturyTagList = insturyList[i].tagList;
          break;
        }
      }
      that.setData({
        insturyTagList: insturyTagList,
        currentTab: e.target.dataset.current
      })
    }
  },
  /**
   * 检测选择的是否在数组中 arrayToSearch数组 attr字段  val 查询的值
   */
  validateInstury: function(arrayToSearch, attr, val) {
    for (var i = 0; i < arrayToSearch.length; i++) {
      if (arrayToSearch[i][attr] == val) {
        return i;
      }
    }
    return -1;
  },
  /**
   * 选择标签
   */
  clickRegion: function(e) {
    var selected = this.data.selected; //选择的
    var id = e.target.dataset.id;
    var tagname = e.target.dataset.tagname;
    var validateIndex = this.validateInstury(selected, "id", id);
    // 判断是否存在数组中 如不是添加，如是移除
    if (validateIndex == -1) {
      if (selected.length + 1 > 3) {
        wx.showToast({
          icon: 'none',
          title: '只能选择3个类型！',
        })
      } else {
        selected.push({
          "id": id,
          "tagName": tagname
        });
      }
    } else {
      selected.splice(validateIndex, 1);
    }
    this.setData({
      selected: selected
    });
  },

  /**
   * 确定返回
   */
  instury: function() {
    var selected = this.data.selected;
    let pages = getCurrentPages(); //当前页面
    let prevPage = pages[pages.length - 2]; //上一页面  
    prevPage.setData({ //直接给上移页面赋值
      instury: selected
    });
    wx.navigateBack({ //返回
      delta: 1
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
   * 请求标签
   */
  queryInstryType: function() {
    var that = this;
    that.showLoad();
    var selected = that.data.selected;
    http.httpPost(domainUrl + "/industry/selectAll", "").then((res) => {
      // 请求成功
      if (res.data.success) {
        var data = res.data.data;
        var instury = [];
        var curentIndex = -1;//找到第一个存在集合中的下表
        for (var i = 0; i < data.length; i++) {
          instury.push(data[i].industryName);
          if (selected.length != 0 && curentIndex == -1) {
            for (var j = 0; j < selected.length; j++) {
              // 找到selected中第一个存在的标签下表
              var index = that.validateInstury(data[i].tagList, 'id', selected[j].id);
              if (index != -1) {
                curentIndex = i;
                break;
              }
            }
          }
        }
        if (curentIndex == -1) {
          that.setData({
            instury: instury,
            insturyList: data,
            insturyTagList: data[0].tagList
          });
        } else {
          that.setData({
            instury: instury,
            insturyList: data,
            currentTab: curentIndex,
            insturyTagList: data[curentIndex].tagList
          });
        }
      } else {
        wx.showModal({
          content: '请求失败！',
          showCancel: false,
        })
      }
      that.hideTime();
    }).catch((errMsg) => {
      that.hideTime();
      wx.showModal({
        content: '网络异常',
        showCancel: false,
      })
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    if (options.instury != undefined) {
      this.setData({
        selected: JSON.parse(options.instury)
      });
    }
    // 请求行业标签
    this.queryInstryType();
  }
})