// pages/search/search.js
var app = getApp();
// const db = wx.cloud.database();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    search: "", //搜索内容
    searchHistory: [], //搜索历史
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // 标识 0 做上角的返回 1 输入内容搜索或者历史搜索
    app.globalData.flagback = 0;
    var searchHistory = this.removeRepeat(app.globalData.searchHistory);
    this.setData({
      searchHistory: searchHistory
    });
  },
  // 输入框的值
  input: function(e) {
    this.setData({
      search: e.detail.value
    })
  },
  //删除
  chlickDelete: function(e) {},
  // 搜索按钮
  search: function() {
    //缓存返回上一页标识，当为runBackFlag时，才需执行onshow方法，否则不执行
    app.globalData.isCompanyShow = true;
    var that = this;
    const search = that.data.search;
    app.globalData.searchHistory.push(search);
    let pages = getCurrentPages(); //当前页面
    let prevPage = pages[pages.length - 2]; //上一页面
    app.globalData.flagback = 1;
    prevPage.setData({ //直接给上移页面赋值
      search: search
    });
    wx.navigateBack({ //返回
      delta: 1
    })
  },

  historySearch: function(e) {
    var that = this;
    const search = e.currentTarget.dataset.search;
    let pages = getCurrentPages(); //当前页面
    let prevPage = pages[pages.length - 2]; //上一页面
    app.globalData.flagback = 1;
    prevPage.setData({ //直接给上移页面赋值
      search: search,
      flag: 1
    });

    wx.navigateBack({ //返回
      delta: 1
    })
  },

  // 去重复
  removeRepeat: function(data) {
    var hash = {};
    var data1 = data.reduce(function(item, next) {
      hash[next] ? '' : hash[next] = true && item.push(next);
      return item
    }, [])
    return data1;
  }
})