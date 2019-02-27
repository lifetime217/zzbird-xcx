// miniprogram/pages/owner/updateNameAndPhoto/updateNameAndPhoto.js
var app = getApp();
var domainUrl = app.globalData.domainUrl;
var http = require("../../../util/request/request.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // isEditName: false,
    nickName: "", //用户名
    avatarUrl: "", //用户头像
    openId: "", //openid
    picId: "", //图片id
    flag: false, //判断是否已经上传过图片,用户点击返回按钮的时候删除已经上传的图片
    companyId: "" //公司id
  },
  /**
   * 保存输入的姓名
   */
  inputName: function(e) {
    var input = e.detail.value;
    if (input.length < 10) {
      this.setData({
        nickName: input
      });
    }
  },
  /**
   * 上传图片
   */
  uploadImg: function(e) {
    var that = this;
    // 选择图片
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'], //使用的压缩图还是原图片
      sourceType: ['album', 'camera'], //使用相册和相机
      success: function(res) {
        var imgUrls = that.data.imgUrls; //图片集合
        var imgUrlId = that.data.imgUrlId; //图片id集合
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片  
        var tempFilePaths = res.tempFilePaths;
        var uploadUrl = domainUrl + '/company/simple/upload?_t=' + new Date().getTime();
        if (res.tempFiles[0].size <= 5242880) {
          wx.showLoading({
            title: '上传中',
          })
          wx.uploadFile({
            url: uploadUrl,
            filePath: tempFilePaths[0],
            name: "img",
            header: {
              "Content-Type": "multipart/form-data",
              'accept': 'application/json'
            },
            //成功时执行函数
            success: function(res) {
              var data = JSON.parse(res.data);
              if (data.flag) {
                that.setData({
                  avatarUrl: data.src,
                  picId: data.picId
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

        } else { //图片大于2M，弹出一个提示框
          wx.showToast({
            title: '上传图片不能大于3M!',
            icon: 'none'
          })
        }
      },
      fail: e => {}
    })
  },
  /**
   * 保存设置
   */
  finish: function() {
    //缓存返回上一页标识，当为runBackFlag时，才需执行onshow方法，否则不执行
    app.globalData.isOwnerShow = true;
    var that = this;
    var openId = that.data.openId;
    var nickName = that.data.nickName;
    var avatarUrl = that.data.avatarUrl;
    var companyId = that.data.companyId;
    var roleType = app.globalData.roleType;
    http.httpPost(domainUrl + "/api/auth/update/user", {
      "userOpenid": openId,
      "userImg": avatarUrl,
      "userName": nickName,
      "companyId": companyId,
      "roletype": roleType
    }).then((res) => {
      if (res.data.success) {
        that.setData({
          flag: true
        });
        let pages = getCurrentPages(); //当前页面
        let prevPage = pages[pages.length - 2]; //上一页面  
        prevPage.setData({ //直接给上移页面赋值
          success: true
        });
        wx.navigateBack({ //返回
          delta: 1
        })
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
    var nickName = options.nickName;
    var avatarUrl = options.avatarUrl;
    var openId = options.openId;
    var companyId = options.companyId;
    this.setData({
      nickName: nickName,
      avatarUrl: avatarUrl,
      openId: openId,
      companyId: companyId
    });
    // var isEditName = options.isEditName;
    // console.log(isEditName);
    // if (isEditName) {
    //   this.setData({
    //     isEditName: isEditName,
    //     name: options.name,
    //     img: options.img
    //   });
    // } else {
    //   this.setData({
    //     isEditName: isEditName
    //   });
    // }
  },


  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {
    var that = this;
    var picId = that.data.picId;
    if (picId != "" && !that.data.flag) {
      http.httpPost(domainUrl + "/pic/delete", {
        "id": picId
      }).then((res) => {}).catch((errMsg) => {
        wx.showModal({
          content: '网络异常',
          showCancel: false,
        })
      });
    }

  }

})