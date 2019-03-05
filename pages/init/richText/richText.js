// pages/init/richText/richText.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    companyDetaiInfo: ""
  },

  /**
   * 保存富文本
   */
  save: function(e) {
    let pages = getCurrentPages(); //当前页面
    let prevPage = pages[pages.length - 2]; //上一页面  
    prevPage.setData({ //直接给上移页面赋值
      companyDetaiInfo: e.detail.content
    });
    wx.navigateBack({ //返回
      delta: 1
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    if (options.companyDetaiInfo != undefined) {
      this.setData({
        companyDetaiInfo: options.companyDetaiInfo
      });
    }
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

})