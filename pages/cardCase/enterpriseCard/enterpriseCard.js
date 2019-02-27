// miniprogram/pages/cardCase/enterpriseCard/enterpriseCard.js
const app = getApp();
var domainUrl = app.globalData.domainUrl;
var WxParse = require('../../../util/wxParse/wxParse.js');
var http = require('../../../util/request/request.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    indicatorDots: true, // 是否显示面板指示点 
    autoplay: true, // 是否自动切换
    interval: 5000, // 自动切换时间间隔
    duration: 1000, // 滑动动画时长

    primarySize: 'mini',
    companyId: "", // 企业id
    teaList: [], //企业老师
    enterprise: {}, //企业
    isdelete: "", //是否已删除
    roleType: app.globalData.roleType, //身份 0用户 1老师 2企业
    html: '', //富文本

    type: "", // 区别是分享还是跳转   add 添加企业  share 分享企业
    status: "edit", //区分是编辑 新增
    share: '', //分享次数
    examine: '', //查看次数
    clickPhone: '', //电话
    isCourseMax: false, //判断是否获取到全部的课程 true获取到所有
    isTeacherMax: false, //判断是否获取了所有的老师  true获取到所有
    isHaveTea: false, //判断是否有老师，如果没有就不展示老师一列
    isHaveCour: false, //判读那是否有课程，如果没有就不展示客户才能一列
    course: [], //课程
    industryTag: [], //标签
    teacher: [], //老师
    picture: [], //企业图片
    isOwn: false, //是否是自己的企业
    fastLoad:false ,//是否是第一次启动
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
   * 添加课程
   */
  addCourse: function() {
    console.log("添加课程")
    wx.navigateTo({
      url: '../addCourseCard/addCourseCard?type=companyToAdd'
    })
  },
  /**
   * 返回首頁
   */
  backIndex: function(e) {
    //设置页面可执行onshow方法
    app.globalData.isCompanyShow = true;
    app.globalData.isCourseShow = true;
    app.globalData.isOwnerShow = true;
    var dis = e.currentTarget.dataset.dis;
    // 分享用户进来
    if (dis == "share") {
      if (e.detail.userInfo) {
        var userinfo = e.detail.userInfo;
        var openid = app.globalData.openid;
        http.httpPost(domainUrl + "/api/auth/updateUser", {
          "openId": openid,
          "avatarUrl": userinfo.avatarUrl,
          "city": userinfo.city,
          "country": userinfo.country,
          "gender": userinfo.gender,
          "language": userinfo.language,
          "nickName": userinfo.nickName,
          "province": userinfo.province
        }).then((res) => {
          if (res.data.flag) {
            wx.switchTab({
              url: '../../init/enterprise/Enterprise'
            })
          }
        }).catch((errMsg) => {
          wx.showModal({
            content: '网络异常',
            showCancel: false,
          })
          that.hideTime();
        });
      }
    }
    // 添加企业进来
    else if (dis == "add") {
      wx.switchTab({
        url: '../../init/enterprise/Enterprise'
      })

    }
  },
  /**
   * 收藏名片夹
   */
  keep: function(e) {
    var phone = e.currentTarget.dataset.phone;
    var name = e.currentTarget.dataset.name;
    wx.addPhoneContact({
      firstName: name,
      mobilePhoneNumber: phone
    })
  },
  /**
   * 地图导航
   */
  selectMap: function(e) {
    var enterprise = this.data.enterprise;
    wx.openLocation({
      latitude: enterprise.latitude,
      longitude: enterprise.longitude,
      scale: 16,
      name: enterprise.mapName,
      address: enterprise.companyAddress,
    })
  },

  /**
   * 跳转课程
   */
  toCourse: function(e) {
    var id = e.currentTarget.dataset.courseid;
    wx.navigateTo({
      url: '../../course/courseDetail/courseDetail?id=' + id
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
   * 查询企业名片
   */
  queryEnterpriseCard: function(companyId) {
    var that = this;
    var openid = app.globalData.openid;
    that.showLoad();
    http.httpPost(domainUrl + "/company/queryCompanyInfo", {
      "companyId": companyId
    }).then((res) => {
      if (res.statusCode == 200 && res.data.success) {
        var data = res.data.data;
        var companyInfo = data.companyInfo;
        var course = data.course; //课程集合
        var teacherArr = data.teacher; //老师集合
        var teacher = this.teacherDuplicateRemoval(teacherArr);//老师集合去重复
        var industryTag = companyInfo.industryTag; //企业下的标签
        var companyOpenid = companyInfo.openId; //企业的创建者的openid
        var picture = companyInfo.picture; //企业的图片
        var isHaveTea = teacher.length > 0 ? true : false; //判断是否有老师
        var isHaveCour = course.length > 0 ? true : false; //判断是否有课程
        var isOwn = openid == companyOpenid ? true : false; //判断是否是自己创建的企业
        var enterprise = {};
       
        enterprise.companyName = companyInfo.companyName;
        enterprise.companyAddress = companyInfo.companyAddress;
        // enterprise.companyDesc = companyInfo.companyDesc;
        enterprise.id = companyInfo.id;
        enterprise.latitude = companyInfo.latitude;
        enterprise.level = companyInfo.level;
        enterprise.longitude = companyInfo.longitude;
        enterprise.mapName = companyInfo.mapName;
        enterprise.telephoneNumber = companyInfo.telephoneNumber;
        WxParse.wxParse("article", "html", companyInfo.companyDesc, this, 0)
        that.setData({
          enterprise: enterprise,
          isCourseMax: data.isCourseMax, //判断是否获取到全部的课程 true为所有
          isTeacherMax: data.isTeacherMax, //判断是否获取了所有的老师  true为所有
          isHaveTea: isHaveTea,
          isHaveCour: isHaveCour,
          course: course,
          industryTag: industryTag,
          teacher: teacher,
          picture: picture,
          companyId: companyId,
          isOwn: isOwn
        });
        that.hideTime();
      } else {
        wx.showModal({
          content: '网络异常',
          showCancel: false,
        })
      }

    }).catch((errMsg) => {
      wx.showModal({
        content: '网络异常',
        showCancel: false,
      })
      that.hideTime();
    });
  },
  teacherDuplicateRemoval:function(data){
    var newArr = [];
    for(var i = 0; i<data.length; i++){
      if (newArr.indexOf(data[i])<0){
        newArr.push(data[i])
      }
    }
    return newArr;
  },
  /**
   * 预览图片
   */
  previewImg: function(e) {
    var img = e.currentTarget.dataset.img;
    var picture = this.data.picture;
    var urls = [];
    for (var i = 0; i < picture.length; i++) {
      urls.push(picture[i].url);
    }
    wx.previewImage({
      current: img, // 当前显示图片的http链接
      urls: urls // 需要预览的图片http链接列表
    })
  },
  /**
   * 修改查看次数和分享次数
   */
  updateLookAndShare: function(companyId, dis) {
    var that = this;
    var params = {};
    params.companyId = companyId;
    if (dis == 'share') {
      params.src = '';
    } else {
      params.src = '1';
    }
    http.httpPost(domainUrl + "/company/view/sele", params).then((res) => {
    }).catch((errMsg) => {
      wx.showModal({
        content: '网络异常',
        showCancel: false,
      })
    });
  },
  /**
   * 生命周期函数--监听页面加载 options跳转传过来的id
   */
  onLoad: function(options) {
    //设置首页可执行onshow方法
    app.globalData.isIndexShow = true;
    var that = this;
    var companyId = options.companyId;
    that.setData({
      companyId: companyId,
    })
    if (options.type != undefined) {
      if (options.type == 'share') {
        that.setData({
          // type: options.type
          type: "share"
        });
      } else if (options.type == 'add') {
        that.setData({
          // type: options.type
          type: "add"
        });
      } else if (options.type == 'edit') {
        that.setData({
          // type: options.type
          type: "edit"
        });
      }
    }
    // var companyId = "05d333d0c01c46f4a7367484abb83843";
    that.queryEnterpriseCard(companyId);
    that.updateLookAndShare(companyId, "look");
    //老师
  },
  // 确定拨打电话
  confirmPhone: function() {
    var clickPhone = this.data.clickPhone;
    wx.makePhoneCall({
      phoneNumber: clickPhone
    })
    this.callPhoneModal.hide();
  },
  /**
   * 关闭电话
   */
  cancelPhone: function() {
    this.callPhoneModal.hide();
  },
  //电话
  callPhone: function(e) {
    var phone = e.currentTarget.dataset.phone;
    this.setData({
      clickPhone: phone
    });
    this.callPhoneModal.show();
  },
  edit: function(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '../addEnterpriseCard/addEnterpriseCard?status=edit&id=' + id,
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function(options) {
    this.callPhoneModal = this.selectComponent("#callPhoneModal");
    this.moreTeacherToast = this.selectComponent("#moreTeacherToast");
    this.moreCourseToast = this.selectComponent("#moreCourseToast");
    this.moreIndustryToast = this.selectComponent("#moreIndustryToast");
    this.moreCompanyNameToast = this.selectComponent("#moreCompanyNameToast");
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    //判断页面是否可执行onshow方法
    if (app.globalData.isCompanyShow) {
      var that = this;
      let pages = getCurrentPages();
      let currPage = pages[pages.length - 1];
      if (currPage.data.companyId != "") {
        that.queryEnterpriseCard(currPage.data.companyId);
        wx.pageScrollTo({
          scrollTop: 0,
          duration: 0,
        })
      }
      if(that.data.fastLoad && app.globalData.roleType == "2"){
        that.queryEnterpriseCard(that.data.companyId);
      }
      that.setData({
        fastLoad: true,
      })
      //判断是否有奇他情况,若是，则只将其他情况置为false；若否，则将页面是否刷新置为false
      if (app.globalData.isOtherShow){
        app.globalData.isOtherShow = false;
      }else{
        app.globalData.isCompanyShow = false;
      }
    }
  },


  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function(res) {
    // 修改分享次数
    var companyId = this.data.companyId;
    // 按钮分享
    if (res.from == "button") {
      this.updateLookAndShare(companyId, "share");
    }
    //分享类型中右上角的分享
    else {
      this.updateLookAndShare(companyId, "share");
      return {
        title: '企业详情',
        path: '/pages/cardCase/enterpriseCard/enterpriseCard?type=share&companyId=' + companyId
      }
    }
    // //分享次数
    // this.setData({
    //   examine: this.data.share + 1
    // })
    // var that = this;
    // //分享的类型为按键类型
    // if (res.from == "button") {
    //   //分享为按键中的求助即id=1
    //   if (res.target.id == 1) {
    //     return {
    //       title: '按键1要分享的标题',
    //           path: '/pages/index/index',
    //           success: function(res) {  }  
    //     }
    //   }
    //   //分享为按键中的分享即id=2
    //   if (res.target.id == 2) {
    //     return {
    //       title: '按键2要分享的标题',
    //           path: '/pages/index/index',
    //           success: function(res) {

    //           }  
    //     }
    //   }
    // }
    // //分享类型中右上角的分享
    // else {
    //   return {
    //     title: '点击右上角要分享的标题',
    //         path: '/pages/index/index',
    //         success: function(res) {

    //         }  
    //   }

    // }
  },
  /**
 * 更多teacher
 */
  moreTeacher: function () {
    this.moreTeacherToast.show();
  },
/**
 * 更多课程
 */
  moreCourse: function () {
    this.moreCourseToast.show();
  },
  /**
 * 更多企业标签
 */
  moreIndustryTag: function () {
    console.log("moreIndustryTag")
    // console.log(this.moreTag);
    this.moreIndustryToast.show();
  },
  moreCompanyName: function () {
    console.log("moreCompanyName")
    // console.log(this.moreTag);
    this.moreCompanyNameToast.show();
  },

  /**
  * 生命周期函数--监听页面卸载
  */
  onUnload: function () {
    //监听是否是添加
    if (this.data.type == 'add') {
      wx.switchTab({
        url: '../../init/enterprise/Enterprise'
      })
    }
  },
  

})