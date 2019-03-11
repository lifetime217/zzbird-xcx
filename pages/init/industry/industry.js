// pages/init/industry/industry.js
var http = require('../../../util/request/request.js');
var app = getApp();
var domainUrl = app.globalData.domainUrl;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    industry: [], //所有的标签
    parentIndustry: [], //父标签
    industryTagList: [], //选择的父标签所对应的子标签
    selected: [], //选中的子标签
    currentName: "", //选中的父标签
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
   * 查询标签的下标 arrayToSearch数组 attr字段  val 查询的值
   */
  findIndustryIndex: function(arrayToSearch, attr, val) {
    for (var i = 0; i < arrayToSearch.length; i++) {
      if (arrayToSearch[i][attr] == val) {
        return i;
      }
    }
    return -1;
  },
  /**
   * 获取第一个标签对象
   */
  getFirstObj: function(data) {
    for (var key in data)
      return data[key];
  },
  /**
   * 获取第一个父标签
   */
  getFirstKey: function(data) {
    for (var key in data)
      return key;
  },
  /**
   * 选择子标签
   */
  checkTag: function(e) {
    var selected = this.data.selected; //选择的
    var tagName = e.currentTarget.dataset.tagname;
    var id = e.currentTarget.dataset.id;
    var industryIndex = this.findIndustryIndex(selected, "id", id);
    // 判断是否存在数组中 如不是添加，如是移除
    if (industryIndex == -1) {
      if (selected.length >= 3) {
        wx.showToast({
          icon: 'none',
          title: '只能选择3个类型！',
        })
      } else {
        selected.push({
          "id": id,
          "tagName": tagName
        });
      }
    } else {
      selected.splice(industryIndex, 1);
    }
    this.setData({
      selected: selected
    });
  },
  /**
   * 切换父标签
   */
  swichNav: function(e) {
    var that = this;
    var currentName = e.currentTarget.dataset.currentname;
    if (this.data.curentName === currentName) {
      return false;
    } else {
      var industryTagList = []; // 选择的行业标签所对应的子标签
      var industry = that.data.industry; //所有的标签
      for (var item in industry) {
        if (item == currentName) {
          industryTagList = industry[item];
          break;
        }
      }
      that.setData({
        industryTagList: industryTagList,
        currentName: currentName
      })
    }
  },
  /**
   * 确定按钮
   */
  confim: function() {
    var selected = this.data.selected;
    let pages = getCurrentPages(); //当前页面
    let prevPage = pages[pages.length - 2]; //上一页面  
    prevPage.setData({ //直接给上移页面赋值
      industry: selected
    });
    wx.navigateBack({ //返回
      delta: 1
    })
  },
  /**
   * 查询标签页
   */
  queryInstryType: function() {
    var that = this;
    var selected = that.data.selected;
    http.httpPost(domainUrl + "/api/industry/queryIndustry", {}).then((res) => {
      if (res.data.statusCode == 200) {
        var data = res.data.data;
        var parentIndustry = []; //父标签
        var industry = data.industry;
        var currentName = ""; //找到第一个存在集合中的
        for (var item in industry) {
          parentIndustry.push(item);
          // 如果找到了第一个就不再去循环
          if (currentName == "") {
            for (var j = 0; j < selected.length; j++) {
              // 找到selected中第一个存在的标签下表
              var index = that.findIndustryIndex(industry[item], 'id', selected[j].id);
              if (index != -1) {
                currentName = item;
                break;
              }
            }
          }
        }
        if (currentName == "") {
          that.setData({
            industry: industry,
            currentName: that.getFirstKey(industry),
            parentIndustry: parentIndustry,
            industryTagList: that.getFirstObj(industry)
          });
        } else {
          that.setData({
            industry: industry,
            parentIndustry: parentIndustry,
            currentName: currentName,
            industryTagList: industry[currentName]
          });
        }
      }
      that.hideTime();
    }).catch((errMsg) => {
      console.log(errMsg);
      wx.showModal({
        content: '网络异常',
        showCancel: false,
      })
      that.hideTime();
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    if (options.industry != undefined) {
      this.setData({
        selected: JSON.parse(options.industry)
      });
    }
    // 请求行业标签
    this.queryInstryType();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

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


})