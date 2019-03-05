// pages/init/addCompany/addCompany.js
var http = require('../../../util/request/request.js');
var app = getApp();
var domainUrl = app.globalData.domainUrl;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgUrls: [], // 访问图片集合
    imgUrlName: [], // 图片名字集合
    instury: [], //选择的标签
    companyName: "", //输入的企业名称
    telphone: "", //输入的企业电话
    companyAddress: "", //公司地址
    companySimpleAddress: "", //公司的简称
    lat: "", //纬度
    lng: "", //经度
    companyDetaiInfo: "", //描述信息
  },
  /**
   * 跳转富文本
   */
  checkRichtext: function() {
    wx.navigateTo({
      url: '../richText/richText'
    })
  },
  /**
   * 输入公司名字
   */
  companyNameInput: function(e) {
    var input = e.detail.value;
    if (input.length < 20) {
      this.setData({
        companyName: input
      })
    }
  },
  /**
   * 输入的电话号码
   */
  telphoneInput: function(e) {
    var input = e.detail.value;
    if (input.length < 20) {
      this.setData({
        telphone: input
      })
    }
  },
  /**
   * 选择地址
   */
  checkCompanyAddress: function() {
    var that = this;
    wx.getSetting({
      success: function(res) {
        var statu = res.authSetting;
        // 没有授权的
        if (!statu['scope.userLocation']) {
          wx.showModal({
            title: '是否授权当前位置',
            content: '需要获取您的地理位置，请确认授权，否则地图功能将无法使用',
            success: function(tip) {
              if (tip.confirm) {
                wx.openSetting({
                  success: function(data) {
                    if (data.authSetting["scope.userLocation"] === true) {
                      wx.showToast({
                        title: '授权成功',
                        icon: 'none',
                        duration: 1000
                      })
                      //授权成功之后，再调用chooseLocation选择地方
                      wx.chooseLocation({
                        success: function(location) {
                          that.setData({
                            companySimpleAddress: location.name,
                            companyAddress: location.address,
                            lat: location.latitude, //纬度
                            lng: location.longitude, //经度
                          })
                        }
                      })
                    } else {
                      wx.showToast({
                        title: '授权失败',
                        icon: 'none',
                        duration: 1000
                      })
                    }
                  }
                })
              }
            }
          })
        }
        // 授权过后的
        else {
          wx.chooseLocation({
            success: function(location) {
              that.setData({
                companySimpleAddress: location.name,
                companyAddress: location.address,
                lat: location.latitude, //纬度
                lng: location.longitude, //经度
              })
            }
          })
        }

      }
    })
  },
  /**
   * 选择产业类型
   */
  checkindustry: function() {
    wx.navigateTo({
      url: '../industry/industry'
    })
  },
  /**
   * 长按删除图片   没有删除储存图片
   */
  deletImg: function(e) {
    var that = this;
    var name = e.currentTarget.dataset.name;
    var imgUrlName = that.data.imgUrlName;
    var imgUrls = that.data.imgUrls;
    wx.showModal({
      title: '提示',
      content: '是否删除图片',
      showCancel: true,
      success(res) {
        if (res.confirm) {
          for (var i = 0; i < imgUrlName.length; i++) {
            if (imgUrlName[i] == name) {
              imgUrlName.splice(i, 1);
              imgUrls.splice(i, 1);
              break;
            }
          }
          that.setData({
            imgUrlName: imgUrlName,
            imgUrls: imgUrls
          });
        }
      }
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
   * 选择照片
   */
  checkpicture: function() {
    var that = this;
    var imgUrlName = that.data.imgUrlName;
    var imgUrls = that.data.imgUrls;
    if (imgUrlName.length >= 4) {
      wx.showToast({
        title: '最多上传四张图片',
        icon: 'none'
      })
      return;
    }
    console.log(imgUrlName.length);
    wx.chooseImage({
      count: 4 - imgUrlName.length,
      sizeType: ['compressed'], //使用的压缩图还是原图片
      sourceType: ['album', 'camera'], //使用相册和相机
      success: function(res) {
        if (res.errMsg == "chooseImage:ok") {

          wx.showLoading({
            title: '上传中',
          })
          var tempFiles = res.tempFiles;
          // 判断选择多张图片时图片的大小
          for (var i = 0; i < tempFiles.length; i++) {
            if (tempFiles[i].size >= 5242880) {
              wx.showToast({
                title: '上传图片不能大于5M!',
                icon: 'none'
              })
              return;
            }
            wx.uploadFile({
              url: domainUrl + '/upload/pic?_t=' + new Date().getTime(),
              filePath: tempFiles[i].path,
              name: "img",
              header: {
                "Content-Type": "multipart/form-data",
                'accept': 'application/json'
              },
              //成功时执行函数
              success: function(res) {
                var data = JSON.parse(res.data);
                if (data.data.flag) {
                  // 存入访问图片集合
                  imgUrls.push({
                    "url": data.data.url,
                    "name": data.data.name
                  });
                  // 存入图片名字集合
                  imgUrlName.push(data.data.name);
                  that.setData({
                    imgUrls: imgUrls,
                    imgUrlName: imgUrlName
                  });
                } else {
                  wx.showModal({
                    content: '网络异常，上传失败，请重试！',
                    showCancel: false
                  })
                }
              },
              //失败时执行函数
              fail: function(res) {
                wx.showModal({
                  content: '网络异常，图片上传失败',
                  showCancel: false
                })
              },
              //不管成功或失败都会执行
              complete: function() {
                wx.hideLoading();
              }
            })
          }

        }
      },
      fail: e => {}
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

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
    var that = this;
    let pages = getCurrentPages();
    let currPage = pages[pages.length - 1];
    // 获取选择标签返回的标签
    if (currPage.data.instury != null) {
      that.setData({
        instury: currPage.data.instury
      })
    }
    // 编辑文本返回获取
    if (currPage.data.companyDetaiInfo != null) {
      that.setData({
        companyDetaiInfo: currPage.data.companyDetaiInfo
      })
    }
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