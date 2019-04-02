// pages/init/addCompany/addCompany.js
var http = require('../../../util/request/request.js');
var app = getApp();
var domainUrl = app.globalData.domainUrl;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    type: "", // 来源 判断是从哪里跳转过过来的
    imgUrls: [], // 访问图片集合
    imgUrlName: [], // 图片名字集合
    industry: [], //选择的标签
    companyName: "", //输入的企业名称
    telphone: "", //输入的企业电话
    companyAddress: "", //公司地址
    companySimpleAddress: "", //公司的简称
    lat: "", //纬度
    lng: "", //经度
    companyDetailInfo: "", //描述信息
    deleteImg: [], //保存删除的图片名字
  },
  /**
   * 跳转富文本
   */
  checkRichtext: function() {
    var companyDetailInfo = this.data.companyDetailInfo;
    wx.navigateTo({
      url: '../richText/richText?type=company&companyDetailInfo=' + escape(companyDetailInfo)
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
   * 编辑企业
   */
  onFinish: function() {
    var that = this;
    that.showLoad();
    var type = that.data.type;
    var imgUrlName = that.data.imgUrlName;
    var industry = that.data.industry;
    var companyName = that.data.companyName;
    var telphone = that.data.telphone;
    var companyAddress = that.data.companyAddress;
    var companySimpleAddress = that.data.companySimpleAddress;
    var lat = that.data.lat;
    var lng = that.data.lng;
    var companyDetailInfo = that.data.companyDetailInfo;
    var deleteImg = that.data.deleteImg;
    if (imgUrlName.length == 0) {
      wx.showToast({
        title: '请上传图片',
        icon: 'none'
      })
      return;
    }
    if (companyName == "") {
      wx.showToast({
        title: '请输入公司名字',
        icon: 'none'
      })
      return;
    }
    if (industry.length == 0) {
      wx.showToast({
        title: '请选择标签',
        icon: 'none'
      })
      return;
    }
    if (telphone == "") {
      wx.showToast({
        title: '请输入电话',
        icon: 'none'
      })
      return;
    }
    if (companyAddress == "") {
      wx.showToast({
        title: '请选择地址',
        icon: 'none'
      })
      return;
    }
    var industryStr = ""
    var industryId = "";
    // 拼接标签的id和标签的名字的数组
    for (var i = 0; i < industry.length; i++) {
      if (i == industry.length - 1) {
        industryId += industry[i].id;
        industryStr += industry[i].tagName;
      } else {
        industryId += industry[i].id + ",";
        industryStr += industry[i].tagName + ",";
      }
    }
    // 拼接图片名字的id
    var imgUrlNameStr = imgUrlName.join(",");
    var params = {
      "companyName": companyName,
      "companyAddress": companyAddress,
      "telphone": telphone,
      "industryListName": industryStr,
      "industryListId": industryId,
      "companySimpleAddress": companySimpleAddress,
      "lat": lat,
      "lng": lng,
      "bannerImgs": imgUrlNameStr,
      "companyDetailInfo": companyDetailInfo,
      "deleteImg": deleteImg.join(",")
    }
    var url;
    if (type == "edit") {
      url = domainUrl + "/api/company/updateCompany";
    } else {
      url = domainUrl + "/api/company/addCompany"
    }
    http.httpPost(url, params).then((res) => {
      if (res.data.statusCode == 200) {
        var data = res.data.data;
        if (type == "edit") {
          //修改
          wx.showModal({
            content: '修改成功',
            showCancel: false,
            success: function(res) {
              if (res.confirm) {
                // 用户点击确定 返回企业详情展示 
                wx.navigateTo({
                  url: '../companyDetail/companyDetail?type=editCompany&companyId=' + data.companyId
                })
              }
            }
          })
        } else {
          // 新增
          // 新建公司成功更新app.js的公司id和判断是否是新老用户
          app.globalData.isNew = false;
          wx.showModal({
            title: '新建成功',
            content: '是否继续添加课程',
            showCancel: true,
            success: function(res) {
              app.globalData.roleVal = 10;
              app.globalData.companyReload = true;
              if (res.confirm) {
                // 用户点击确定  跳转新建课程页面
                wx.navigateTo({
                  url: '../addCourse/addCourse?type=addCompany'
                })
              } else if (res.cancel) {
                // 用户点击取消
                wx.switchTab({
                  url: '../index/index'
                })
              }
            }
          })
        }

      } else {
        wx.showModal({
          content: '网络异常',
          showCancel: false,
        })
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
   * 选择产业类型
   */
  checkindustry: function() {
    var industry = this.data.industry;
    wx.navigateTo({
      url: '../industry/industry?industry=' + JSON.stringify(industry)
    })
  },
  /**
   * 长按删除图片   没有删除 储存在本地的图片
   */
  deleteImg: function(e) {
    var that = this;
    var name = e.currentTarget.dataset.name;
    var imgUrlName = that.data.imgUrlName;
    var imgUrls = that.data.imgUrls;
    var deleteImg = that.data.deleteImg;
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
          deleteImg.push(name);
          that.setData({
            imgUrlName,
            imgUrls,
            deleteImg
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
              url: domainUrl + '/upload/pic?_t=' + new Date().getTime() + "&zzbird_XcxSessionKey=" + app.globalData.sessionKey,
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
   * 编辑企业查询公司的信息
   */
  queryCompany: function() {
    var that = this;
    that.showLoad();
    http.httpGet(domainUrl + "/api/company/queryCompanyByCompanyId", {}).then((res) => {
      if (res.data.statusCode == 200) {
        var data = res.data.data;
        var company = data.company;
        that.setData({
          industry: data.industry,
          imgUrlName: data.bannerImgsName,
          imgUrls: data.banner,
          lat: company.lat,
          lng: company.lng,
          companyName: company.companyName,
          companyAddress: company.companyAddress,
          telphone: company.telphone,
          companySimpleAddress: company.companySimpleAddress,
          companyDetailInfo: company.companyDetailInfo
        });
      } else {
        wx.showModal({
          content: '网络异常',
          showCancel: false,
        })
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
    if (options.type != undefined) {
      this.setData({
        type: options.type
      });
      if (options.type == "edit") {
        wx.setNavigationBarTitle({
          title: '编辑企业'
        })
        // 如是编辑企业就根据公司id查询信息
        this.queryCompany();
      }
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
    var that = this;
    let pages = getCurrentPages();
    let currPage = pages[pages.length - 1];
    // 获取选择标签返回的标签
    if (currPage.data.industry != null) {
      that.setData({
        industry: currPage.data.industry
      })
    }
    // 编辑文本返回获取
    if (currPage.data.companyDetailInfo != null) {
      that.setData({
        companyDetailInfo: currPage.data.companyDetailInfo
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