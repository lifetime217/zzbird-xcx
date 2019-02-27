// pages/search/search.js
var app = getApp();
// const db = wx.cloud.database();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    search: "",
    searchHistory: [],
    isDelete: true,
    content: "" //弹框
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var searchHistory = this.removeRepeat(app.globalData.searchHistory);
    this.setData({
      searchHistory: searchHistory
    });
    new app.ToastPannel();
  },
  // 输入框的值
  input: function(e) {
    this.setData({
      search: e.detail.value
    })
  },
  //删除
  chlickDelete: function(e) {
  },
  // 搜索按钮
  search: function() {
    //缓存返回上一页标识，当为runBackFlag时，才需执行onshow方法，否则不执行
    app.globalData.isCompanyShow = true;
    var that = this;
    const search = that.data.search;
    console.log(search);
    // if (search == "") {
    //   that.setData({
    //     content: "请输入您想寻找的！"
    //   });
    //   that.show(that.data.content);
    //   return;
    // }
    app.globalData.searchHistory.push(search);
    let pages = getCurrentPages(); //当前页面
    let prevPage = pages[pages.length - 2]; //上一页面
    prevPage.setData({ //直接给上移页面赋值
      search: search
    });

    wx.navigateBack({ //返回
      delta: 1
    })
  },

  historySearch: function (e) {
    var that = this;
    const search = e.currentTarget.dataset.search;
    let pages = getCurrentPages(); //当前页面
    let prevPage = pages[pages.length - 2]; //上一页面
    prevPage.setData({ //直接给上移页面赋值
      search: search
    });

    wx.navigateBack({ //返回
      delta: 1
    })
  },

  // 去重复
  removeRepeat: function (data) {
    var hash = {};
    var data1 = data.reduce(function (item, next) {
      hash[next] ? '' : hash[next] = true && item.push(next);
      return item
    }, [])
    return data1;
  },
})