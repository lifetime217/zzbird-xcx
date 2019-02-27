// miniprogram/pages/cardCase/addEnterpriseCard/addEnterpriseCard.js
var http = require('../../../util/request/request.js');
const app = getApp()
var domainUrl = app.globalData.domainUrl;
Page({
  /**
   * 页面的初始数据
   */
  data: {
    imgUrls: [], // 图片集合
    imgUrlId: [], // 图片id集合
    indicatorDots: false, //是否显示面板指示点
    autoplay: true, // 是否自动切换
    interval: 5000, // 自动切换时间间隔
    duration: 1000, // 滑动动画时长
    current: 0, //滑块下标
    mapName: "", //地图展示名称
    latitude: "", //纬度
    longitude: "", //经度
    address: "", //公司详细地址
    type: [], //产业类型
    index: "",
    // primarySize: 'mini',
    id: "", // 企业id
    // isdelete: 0,
    // addtime: "",
    // companyId: "", //编辑传过来的id
    companyName: "",
    phone: "",
    companyDesc: '',
    status: '', //是编辑还是新增
    // enterprise: [], //企业
    // isshow: 0, //是否显示编辑
    imgCount: 4, //图片添加的张数
    deleteImges: [], //用于售价删除的图片
    nickName:"",//用户昵称
    avatarUrl:""//用户头像
  },
  /**
   * 输入公司名字
   */
  companyInput: function(e) {
    var input = e.detail.value;
    if (input.length < 22) {
      this.setData({
        companyName: input
      })
    }
  },
  /**
   * 输入电话号码
   */
  phoneInput: function(e) {
    this.setData({
      phone: e.detail.value
    })
  },
  /**
   * 选择产业类型
   */
  industryType: function() {
    wx.navigateTo({
      url: '../industryType/industryType?instury=' + JSON.stringify(this.data.type)
    })
  },
  /**
   * 验证电话号码
   */
  validatePhone: function(phone) {
    var regMobile = /^0?1[2|3|4|5|6|7|8|9][0 -9]\d{8}$/;
    var content = "";
    if (phone.length < 13) {
      content = "请输入11位的手机号码";
    } else if (isNaN(phone) || !regMobile.test(phone)) {
      content = "请输入正确的手机号码"
    } else {
      content = "";
    }
    return content;
  },

  /**
   * 完成按钮
   */
  finish: function(e) {
    //设置首页可执行onshow方法,设置是否有其他情况
    app.globalData.isCompanyShow = true;
    app.globalData.isOtherShow = true;
    var that = this;
    that.showLoad();
    var companyName = that.data.companyName; //公司名字
    var imgUrlId = that.data.imgUrlId; // 图片id数组
    var mapName = that.data.mapName; //地图名字
    var address = that.data.address; //地图名字
    var latitude = that.data.latitude; //经度
    var longitude = that.data.longitude; //维度
    var phone = that.data.phone; //电话号码
    var type = that.data.type; //行业类型标签
    var companyDesc = e.detail.content; // 企业简介
    var openid = app.globalData.openid; // openid
    var nickName = that.data.nickName;//用户昵称
    var avatarUrl = that.data.avatarUrl;//用户头像
    if (imgUrlId.length == 0) {
      // that.data.imgUrls.push({
      //   "url": "http://111.231.78.102:71/kaka/865eb8efb915406592dfa5642cbd2814.jpg",
      //   "id": "b8c4f729c8d541f3ac9793ed3188f200"
      // });
      // imgUrlId.push("b8c4f729c8d541f3ac9793ed3188f200");
    }
    if (companyName == "") {
      wx.showToast({
        icon: 'none',
        title: '公司名字不能为空！',
      })
      return;
    }
    if (mapName == "") {
      wx.showToast({
        icon: 'none',
        title: '请选择公司地址！',
      })
      return;
    }
    if (phone == "") {
      wx.showToast({
        icon: 'none',
        title: '请选择公司联系方式！',
      })
      return;
    }
    if (type.length == 0) {
      wx.showToast({
        icon: 'none',
        title: '请选择行业标签！',
      })
      return;
    }
    if (companyDesc == "") {
      wx.showToast({
        icon: 'none',
        title: '公司简介不能为空！',
      })
      return;
    }
    // 验证电话号码
    // var content = that.validatePhone(phone);
    // if (content != "") {
    //   wx.showToast({
    //     icon: 'none',
    //     title: content,
    //   })
    //   return;
    // }
    var typeId = []; //把标签的id拿到
    for (var i = 0; i < type.length; i++) {
      typeId.push(type[i].id);
    }
    var status = that.data.status;
    var url = "";
    var params = {};
    params.companyName = companyName;
    params.imgs = imgUrlId;
    params.mapName = mapName;
    params.companyAddress = address;
    params.latitude = latitude;
    params.longitude = longitude;
    params.telephoneNumber = phone;
    params.companyDesc = companyDesc;
    params.wxOpenId = openid;
    params.tag = typeId;
    that.setData({
      deleteImges: [],
    })
    if (status == 'edit') {
      url = domainUrl + "/company/update";
      params.id = that.data.id;
    } else {
      url = domainUrl + "/company/insert";
      params.nickName = nickName;
      params.avatarUrl = avatarUrl;
    }
    http.httpPost(url, params).then((res) => {
      if (res.data.success) {
        app.globalData.isCreateCom = "yes";
        var companyId = res.data.data.companyId;
        that.hideTime();
        if (status == 'add') {
          app.globalData.companyId = res.data.data.companyId;
          app.globalData.companyName = companyName;
          app.globalData.roleType = 2;
          app.globalData.isNew = false;
          app.globalData.companyRoleList.push({
            companyId: res.data.data.companyId,
            companyName: companyName,
            isdelete: 0,
            roletype: 2,
            userOpenid: openid,
          });
          // app.globalData.companyRoleList = [{
          //   companyId : res.data.data.companyId,
          //   companyName : companyName,
          //   isdelete : 0,
          //   roletype : 2,
          //   userOpenid : openid,
          //   //userImg = imgUrlId,
          //  //userName = 
          // }]
          wx.navigateTo({
            url: '../enterpriseCard/enterpriseCard?type=add&companyId=' + companyId
          })
        } else {
          var selected = that.data.selected;
          let pages = getCurrentPages(); //当前页面
          let prevPage = pages[pages.length - 2]; //上一页面  
          prevPage.setData({ //直接给上移页面赋值
            companyId: companyId
          });
          wx.navigateBack({ //返回
            delta: 1
          })
        }
      } else {
        wx.showToast({
          icon: 'none',
          title: res.data.msg,
        })
        that.hideTime();
      }
    }).catch((errMsg) => {
      wx.showModal({
        content: 网络异常,
        showCancel: false,
      })
      that.hideTime();
    });

  },
  /**
   * 选择地址
   */
  cardDetail: function() {
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
                      //返回首页时，刷新首页的数据
                      app.globalData.isCreateCom = "yes";
                      //授权成功之后，再调用chooseLocation选择地方
                      wx.chooseLocation({
                        success: function(location) {
                          that.setData({
                            mapName: location.name,
                            address: location.address,
                            latitude: location.latitude, //纬度
                            longitude: location.longitude, //经度
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
                mapName: location.name,
                address: location.address,
                latitude: location.latitude, //纬度
                longitude: location.longitude, //经度
              })
            }
          })
        }

      }
    })

  },

  // 上传图片
  doUpload: function() {
    var that = this;
    var imgUrls = that.data.imgUrls; //图片集合
    var imgCount = that.data.imgCount;
    if (imgUrls.length < 4) {
      // 选择图片
      wx.chooseImage({
        count: that.data.imgCount,
        sizeType: ['compressed'], //使用的压缩图还是原图片
        sourceType: ['album', 'camera'], //使用相册和相机
        success: function(res) {
          var imgUrlId = that.data.imgUrlId; //图片id集合
          // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片  
          var tempFilePaths = res.tempFilePaths;
          var uploadUrl = domainUrl + '/company/simple/upload?_t=' + new Date().getTime();
          if (res.tempFiles[0].size >= 5242880) {
            wx.showToast({
              title: '上传图片不能大于5M!',
              icon: 'none'
            })
          }
          wx.showLoading({
            title: '上传中',
          })

          for (var i = 0; tempFilePaths.length > i; i++) {
            wx.uploadFile({
              url: uploadUrl,
              filePath: tempFilePaths[i],
              name: "img",
              header: {
                "Content-Type": "multipart/form-data",
                'accept': 'application/json'
              },
              //成功时执行函数
              success: function(res) {
                var data = JSON.parse(res.data);
                if (data.flag) {
                  // 存入图片数组
                  imgUrls.push({
                    "url": data.src,
                    "id": data.picId
                  });
                  // 存入图片id数组
                  imgUrlId.push(data.picId)
                  that.setData({
                    imgUrls: imgUrls,
                    current: imgUrls.length - 1,
                    imgUrlId: imgUrlId,
                    imgCount: 4 - imgUrls.length,
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




        },
        fail: e => {}
      })
    } else {
      wx.showToast({
        icon: 'none',
        title: '最多可上传四张照片',
      })
    }


  },
  /**
   * 删除图片
   */
  deleteImage: function(e) {
    var that = this;
    var index = e.currentTarget.dataset.index; //获取当前长按图片下标
    var pid = e.currentTarget.dataset.id; //圖片id
    var middleid = e.currentTarget.dataset.middleid;
    wx.showModal({
      title: '提示',
      content: '确定要删除此图片吗？',
      success: function(res) {
        if (res.confirm) {
          http.httpPost(domainUrl + "/pic/delete", {
            "id": pid
          }).then((res) => {
            var imgs = that.data.imgUrls; //图片数组
            var imgId = that.data.imgUrlId; //图片id
            imgs.splice(index, 1);
            imgId.splice(index, 1);
            that.setData({
              imgUrls: imgs,
              imgUrlId: imgId,
              current: (index - 1) < 0 ? 0 : index - 1, // 删除的前一张图片展示
              imgCount: that.data.imgCount + 1
            });
          }).catch((errMsg) => {
            wx.showModal({
              content: 网络异常,
              showCancel: false,
            })
          });
        } else if (res.cancel) {
          return false;
        }

      }
    })
    that.data.deleteImges.push(middleid);
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
   * 根据公司id查询公司详情
   */
  queryCompany: function(companyId) {
    var that = this;
    that.showLoad();
    http.httpPost(domainUrl + "/company/queryCompanyDetail", {
      "companyId": companyId
    }).then((res) => {
      if (res.statusCode == 200 && res.data.success) {
        var data = res.data.data.companyInfo;
        var imgUrlId = [] // 图片id集合
        var picture = data.picture;
        for (var i = 0; i < picture.length; i++) {
          imgUrlId.push(picture[i].id);
        }
        that.setData({
          imgUrls: picture, //图片集合
          imgUrlId: imgUrlId, //图片id
          mapName: data.mapName, //地图展示名称
          latitude: data.latitude, //纬度
          longitude: data.longitude, //经度
          address: data.companyAddress, //公司详细地址
          type: data.industryTag, //产业类型
          id: companyId, // 企业id
          companyName: data.companyName,
          phone: data.telephoneNumber,
          companyDesc: data.companyDesc,
          status: 'edit', //是编辑还是新增
          imgCount: 4 - picture.length,
        })
      } else {
        wx.showModal({
          content: 网络异常,
          showCancel: false,
        })
      }
      that.hideTime();
    }).catch((errMsg) => {
      wx.showModal({
        content: 网络异常,
        showCancel: false,
      })
      that.hideTime();
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;
    var user = app.globalData.user;
    if (options.status == 'edit') {
      wx.setNavigationBarTitle({
        title: '企业编辑'
      })
      var companyId = options.id;
      //var companyId = "05d333d0c01c46f4a7367484abb83843";
      this.queryCompany(companyId);
    }
    that.setData({
      status: options.status,
      nickName:user.nickName,
      avatarUrl:user.avatarUrl
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    var that = this;
    let pages = getCurrentPages();
    let currPage = pages[pages.length - 1];
    if (currPage.data.instury != null) {
      that.setData({
        type: currPage.data.instury
      })
    }

  },


  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {
    var deleteImges = this.data.deleteImges;
    if (this.data.status == "edit" && this.data.deleteImges.length > 0) {

      http.httpPost(domainUrl + "/company/deleteMiddleid", {
        "ids": deleteImges
      }).then((res) => {

      }).catch((errMsg) => {
        wx.showModal({
          content: 网络异常,
          showCancel: false,
        })
      });

    }
  },
})