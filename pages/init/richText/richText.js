// pages/init/richText/richText.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    detailInfo: "",
    type: "" //来源，（公司，课程）
  },

  /**
   * 保存富文本
   */
  save: function(e) {
    let pages = getCurrentPages(); //当前页面
    let prevPage = pages[pages.length - 2]; //上一页面  
    if (this.data.type == "company") {
      prevPage.setData({ //给添加公司页面赋值
        companyDetailInfo: e.detail.content
      });
    } else {
      prevPage.setData({ //给添加课程页面赋值
        courseDetailInfo: e.detail.content
      });
    }
    wx.navigateBack({ //返回
      delta: 1
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    if (options.companyDetailInfo != undefined) {
      // 公司的详情
      this.setData({
        detailInfo: unescape(options.companyDetailInfo),
        type: options.type
      });
    } else if (options.courseDetailInfo != undefined) {
      // 课程的详情
      this.setData({
        detailInfo: unescape(options.courseDetailInfo),
        type: options.type
      });
    } else {
      this.setData({
        type: options.type
      });
    }
  }

})