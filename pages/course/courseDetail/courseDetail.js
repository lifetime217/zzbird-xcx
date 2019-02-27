// miniprogram/pages/home/courseDetail/courseDetail.js
var app = getApp();
var domainUrl = app.globalData.domainUrl;
var http = require("../../../util/request/request.js");
import {
  base64src
} from '../../../util/request/baseData.js';
Page({
  /**
   * 页面的初始数据
   */
  data: {
    roleType: 0, //角色
    type: "", // 区别是分享还是跳过来的
    teacher: [], //老师名字
    courseName: "", //课程名称
    ageRange: "", //课程适合的年龄范围
    classHourName: "", //选择的课时
    companyName: "", //公司名字
    companyId: "", //公司id
    courseNum: "", //课程人数
    invitationMessage: '', //邀请内容
    shareTitle: "", //邀请的标题
    courseId: '', //课程id
    picture: [], //图片集合
    time: [], //课开始时间
    endTime: [], //课程结束时间
    openId: app.globalData.openid,
    user: [], //用户集合信息
    dis: 0, //区分是老师还是学生受邀请进来
    courseDays: "", //用戶累计天数学习
    totalHours: "", //用户累计课时学习
    courseTime: [], //课程时间
    isHideEditBtn: false, //是否显示修改和邀请老师按钮
    isOwnCourseCompany: false, //是否是用户自己的课程(公司方面）
    isOwnCourseTea: false, //是否老师是老师任职的课程
    hidden: true, //画布显示与否
    userName: '', //用户名字
    prurl: "",
    openId1: "", //邀请人的openid
    userName1: "", //邀请人名字
    roleType1: "", //邀请人角色
    isback: false, //邀请显示返回首页
    options: {}, //储存进入onload方法 中的数据
    modalHide: true
  },
  /**
   * 保存到相册
   */
  saveImageToPhoto: function() {
    var that = this
    wx.saveImageToPhotosAlbum({
      filePath: that.data.prurl,
      success(res) {
        wx.showModal({
          content: '图片已保存到相册，赶紧晒一下吧~',
          showCancel: false,
          confirmText: '好哒',
          confirmColor: '#72B9C3',
          success: function(res) {
            if (res.confirm) {
              that.setData({
                hidden: true
              })
            }
          }
        })
      },
      // 用户拒绝了授权之后重新调用
      fail() {
        wx.getSetting({
          success: function(res) {
            var statu = res.authSetting;
            // 没有授权的
            if (!statu['scope.writePhotosAlbum']) {
              wx.showModal({
                title: '是否授权保存相册',
                content: '需要保存在相册中，请确认授权，否则无法保存相册',
                success: function(tip) {
                  if (tip.confirm) {
                    wx.openSetting({
                      success: function(data) {
                        if (data.authSetting["scope.writePhotosAlbum"] === true) {
                          wx.showToast({
                            title: '授权成功',
                            icon: 'none',
                            duration: 1000
                          })
                          //生产环境时 记得这里要加入获取相册授权的代码
                          wx.saveImageToPhotosAlbum({
                            filePath: that.data.prurl,
                            success(res) {
                              wx.showModal({
                                content: '图片已保存到相册，赶紧晒一下吧~',
                                showCancel: false,
                                confirmText: '好哒',
                                confirmColor: '#72B9C3',
                                success: function(res) {
                                  if (res.confirm) {
                                    that.setData({
                                      hidden: true
                                    })
                                  }
                                }
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
          }
        })
      }
    })
  },
  /**
   * 生成海报
   */
  share: function() {
    var that = this
    wx.showLoading({
      title: '努力生成中...'
    })
    wx.canvasToTempFilePath({
      x: 0,
      y: 0,
      width: 545,
      height: 771,
      destWidth: 545 * 2,
      destHeight: 771 * 2,
      canvasId: 'shareImg',
      success: function(res) {
        that.setData({
          prurl: res.tempFilePath,
          hidden: false
        })
        wx.hideLoading()
      }
    })
  },
  /**
   * 返回首页
   */
  backIndex: function() {
    //设置页面可执行onshow方法
    app.globalData.isCompanyShow = true;
    app.globalData.isCourseShow = true;
    app.globalData.isOwnerShow = true;
    wx.switchTab({
      url: '../../init/enterprise/Enterprise'
    })
  },
  // 打卡
  punchClock: function(e) {
    // this.sharemodal.show();
    wx.navigateTo({
      url: '../punchClock/punchClock?id=' + this.data.courseId,
    })
  },

  /**
   * 显示加载框
   */
  showLoad: function() {
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
  },
  /**
   *  隐藏加载框
   */
  hideTime: function() {
    setTimeout(function() {
      wx.hideLoading();
    }, 1000);
  },
  /**
   * 查询课程详情
   */
  queryCourseDetail: function(roleType, courseId, openId, companyId, htmlFlag) {
    var that = this;
    that.showLoad();
    return new Promise(function(resolve, reject) {
      http.httpPost(domainUrl + "/course/getCourseInfo", {
        "courseId": courseId,
        "distinguish": roleType,
        "openId": openId,
        "companyId": companyId
      }).then((res) => {
        if (res.statusCode == 200 && res.data.success) {
          var courseInfo = res.data.data.course.courseInfo;
          var params = {
            openId: openId,
            ageRange: courseInfo.ageRange, //课程适合的年龄范围
            classHourName: courseInfo.classHourName, //选择的课时
            companyId: courseInfo.companyId, //公司id
            companyName: courseInfo.companyName, //公司名字
            courseId: courseInfo.id, //课程id
            courseName: courseInfo.courseName, //公司名字
            courseNum: courseInfo.courseNum, //课程人数
            picture: courseInfo.picture, //图片集合
            roleType: roleType, //角色     
            courseTime: that.getCourseTime(courseInfo.courseTime), //课程课时时间
            teacher: that.getTeacherArr(courseInfo.courseUser)
          }
          // 如果是用户的话就添加名字
          if (roleType == 0) {
            params.userName = res.data.data.userName; //用户名字
          }
          //设置公共属性
          that.setData(params);
          //判断是正常进入还是受邀请（0，正常；1，受邀请）
          if (htmlFlag == 0) {
            var courseTime = res.data.data.course.courseTime;
            var isHideEditBtn = false;
            var isOwnCourseTea = false;
            var courseDays = "";
            var totalHours = "";
            //如果是学生，并且回调的参数有值，设置用户累计学习天数跟时间，
            //如果是否，置为空
            if (roleType == 2) {
              isHideEditBtn = res.data.data.isRoleType; //是否是企业
            }
            if (roleType == 1) {
              isOwnCourseTea = res.data.data.isCourse == 1; //查询邀请进来的人是否与课程有关联
            } else {
              if (courseTime != null) {
                courseDays = courseTime.courseDays; //用戶累计天数学习
                totalHours = courseTime.totalHours; //用户累计课时学习
              }
            }
            that.setData({
              courseDays: courseDays, //用戶累计天数学习
              totalHours: totalHours, //用户累计课时学习
              isHideEditBtn: isHideEditBtn, //是否是企业
              isOwnCourseTea: isOwnCourseTea //查询邀请进来的人是否与课程有关联
            });
          }
          that.hideTime();
          // 执行成功的回调
          resolve(res.data.data.isCourse);
        } else {
          wx.showModal({
            content: '请求错误，请重试！',
            showCancel: false,
          })
          that.hideTime();
          reject('error');
        }

      }).catch((errMsg) => {
        wx.showModal({
          content: '网络异常',
          showCancel: false,
        })
        that.hideTime();
      });
    })
  },
  /**
   * 更多teacher
   */
  moreTeacher: function() {
    this.moreTeacherToast.show();
  },

  /**
   * 更多时间
   */
  moreTime: function() {
    this.moreTimeToast.show();
  },
  /**
   * 拼接课程的时间
   */
  getCourseTime(courseTimeArr) {
    var arr = new Array(courseTimeArr.length);
    for (let i = 0; i < courseTimeArr.length; ++i) {
      arr[i] = courseTimeArr[i].schoolTime + " ~ " + courseTimeArr[i].quittingTime;
    }
    return arr;
  },
  /**
   * 拼接老师名称数组
   */
  getTeacherArr(courseUser) {
    var arr = new Array(courseUser.length);
    for (let i = 0; i < courseUser.length; ++i) {
      arr[i] = courseUser[i].userName;
    }
    return arr;
  },
  /**
   * 查询二维码
   */
  queryQrCode: function() {
    var that = this;
    that.showLoad();
    http.httpPost(domainUrl + "/api/auth/getCodeunlimit").then((res) => {
      var baseCode = res.data.data.code; //二维码的base64
      var backgroundBase = res.data.data.backgroundBase; //背景图的base64
      var sharePoster = res.data.data.sharePoster; //文字和图片的位置
      var imgWidth = res.data.data.imgWidth; //背景图（海报）的宽度
      var imgHeight = res.data.data.imgHeight; //背景图（海报）的高度
      base64src("data:image/jpg;base64," + baseCode, "codeunlimit").then((filePath) => {
        var userName = that.data.userName; //用户名
        var companyName = that.data.companyName; //公司名
        var courseName = that.data.courseName; //课程名
        var courseNum = that.data.courseNum; //课程人数
        var courseDays = that.data.courseDays; //学习天数
        var totalHours = that.data.totalHours; //学习课时
        base64src("data:image/jpg;base64," + backgroundBase, "backGroundImg").then((filePath1) => {
          const ctx = wx.createCanvasContext('shareImg')
          ctx.drawImage(filePath1, 0, 0, imgWidth, imgHeight)
          // 循环遍历变量距离信息
          for (var item in sharePoster) {
            var data = sharePoster[item];
            if (data.type == 2) {
              ctx.drawImage(filePath, data.distanceX, data.distanceY, data.imgWidth, data.imgHeight)
            }
            if (data.type == 1) {
              // 文字是否居中
              if (data.isCenter == 1) {
                ctx.setTextAlign('center')
              }
              // 文字的颜色
              ctx.setFillStyle(data.color);
              // 文字的大小
              ctx.setFontSize(data.fontSize)
              // 变量名
              var variableName;
              if (data.variableName == "userName") {
                variableName = userName;
              } else if (data.variableName == "companyName") {
                variableName = companyName;
              } else if (data.variableName == "courseName") {
                variableName = courseName;
              } else if (data.variableName == "courseDays") {
                variableName = courseDays;
              } else if (data.variableName == "totalHours") {
                variableName = totalHours;
              } else if (data.variableName == "courseNum") {
                variableName = courseNum - 1; //需要减去自己
              }
              ctx.fillText(variableName, data.distanceX, data.distanceY)
            }
            // 暂无图片，如果有图片需根据具体业务修改
            // if (data.type == 0) {
            // }
          }
          ctx.stroke()
          ctx.draw()
        }).catch((errMsg) => {
          that.hideTime();
        });
      })

    }).catch((errMsg) => {
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
    console.log(options);
    //设置页面可执行onshow方法
    app.globalData.isCourseShow = true;
    var that = this;
    // that.sharemodal = that.selectComponent("#sharemodal");
    // var courseId = "ed634805ece443aa89c27b989277aef9";
    if (options.type == 'shareTea' || options.type == 'shareStu') {
      console.log(options)
      this.setData({
        type: options.type,
        openId1: options.openId, //邀请的openid
        roleType1: options.roleType, //邀请的角色
        options: options
      });
    }
    // 企业新建名片跳转过来
    else if (options.type == "companyToAdd" || options.type == "add") {
      this.setData({
        type: options.type,
        options: options
      });
    } else {
      this.setData({
        // type: options.type,
        options: options
      });
    }
  },

  /**
   * onshow执行的刷新方法，因app.js只执行一次，并且，openid需要同步赋值，
   * 所以，将onshow的方法抽出为一个方法，方便调用
   */
  doOnLoad: function(options, openId, companyId, courseId, courseName, companyName) {
    var that = this;
    // that.sharemodal = that.selectComponent("#sharemodal");
    return new Promise(function(resolve, reject) {
      var companyId1 = app.globalData.companyId; //当前登陆人的公司id
      var roleType1 = app.globalData.roleType; //当前登陆人的角色
      // 受邀请进来
      if (options.type == 'shareTea' || options.type == 'shareStu') {
        var invitationMessage = ""; //邀请弹框信息
        var dis = ""; //老师或者学生：0学生，1老师
        // 受邀请进来：0学生，1老师
        if (options.type == "shareTea") {
          invitationMessage = companyName + "邀请你成为" + courseName + "的老师";
          dis = 1;
        } else if (options.type == "shareStu") {
          invitationMessage = "是否成为" + courseName + "学生";
          dis = 0;
        }
        that.queryCourseDetail(2, courseId, openId, companyId, 1).then(function(res) {
          if (res == 0) {
            wx.showModal({
              content: "该用户已被邀请为学生",
              showCancel: false,
            })
          } else if (res == 1) {
            wx.showModal({
              content: "该用户已被邀请为老师",
              showCancel: false,
            })
          } else {
            res = -1; //可以邀请为学生或者老师
            that.setData({
              shareTitle: "知吱鸟",
              invitationMessage: invitationMessage,
              dis: dis,
            });
          }
          that.setData({
            isback: true
          });
          // 执行成功的回调
          resolve(res)

        });
      }
      // 正常进来
      else {
        // 新增课程跳转过来显示返回按钮
        if (options.isBack) {
          that.setData({
            isback: true,
          });
        }
        that.queryCourseDetail(roleType1, courseId, openId, companyId1, 0).then(function(res) { // 执行成功的回调
          resolve(res)
        });
      }
      //用户请求画布
      if (roleType1 == 0) {
        that.queryQrCode();
      }
    })
  },
  /**
   * 跳转修改课程 
   */
  editCourse: function(e) {
    var that = this;
    wx.navigateTo({
      url: '../../cardCase/addCourseCard/addCourseCard?status=edit&id=' + that.data.courseId + '&roleType=' + that.data.roleType
    })
  },

  /**
   * 用户受邀请取消
   */
  cancelModal: function(e) {
    var that = this;
    var dis = that.data.dis;
    http.httpPost(domainUrl + "/msg/insert", {
      "sendOpenid": that.data.openId1,
      //"content":"1",
      "isdelete": 0,
      "acceptOpenid": that.data.openId,
      "type": 1,
      "companyId": that.data.companyId,
      "courseId": that.data.courseId,
      "level": 0,
      "isAccept": 0,
      "isTeaOrStu": dis,
      "acceptRoleType": dis, //接受人角色
      "sendRoleType": that.data.roleType1 //发送人角色
    }).then((res) => {
      //this.sharemodal.hide();
      that.setData({
        modalHide: true
      })
      wx.showModal({
        content: "拒绝邀请成功",
        showCancel: false,
      })
    })
  },
  /**
   * 查询元素是否存在数据中
   */
  findElem: function(arrayToSearch, attr, val) {
    for (var i = 0; i < arrayToSearch.length; i++) {
      if (arrayToSearch[i][attr] == val) {
        return i;
      }
    }
    return -1;
  },
  /**
   * 用户受邀请进来确定
   */
  confirmModal: function(e) {
    var that = this;
    // 用户点击了确定
    if (e.detail.userInfo) {
      var userinfo = e.detail.userInfo;
      var openId = app.globalData.openid;
      var dis = that.data.dis;
      //添加信息
      http.httpPost(domainUrl + "/course/addCourseUser", {
        "openId": openId,
        "avatarUrl": userinfo.avatarUrl,
        "city": userinfo.city,
        "country": userinfo.country,
        "gender": userinfo.gender,
        "language": userinfo.language,
        "nickName": userinfo.nickName,
        "province": userinfo.province,
        "distinguish": that.data.dis,
        "companyId": that.data.companyId,
        "companyName": that.data.companyName,
        "courseName": that.data.courseName,
        "courseId": that.data.courseId,
        "isEdit": 0,
        "sendOpenid": that.data.openId1, //发送人openid
        //"content":"1", 
        "isdelete": 0, //是否删除
        "acceptOpenid": openId, //接受人openid
        "type": 1, //类型1为邀请消息
        "level": 0, //是否置顶
        "isAccept": 1, //是否接受
        "isTeaOrStu": dis, //邀请老师还是学生
        "acceptRoleType": dis, //接受人角色
        "sendRoleType": that.data.roleType1 //发送人角色
      }).then((res) => {
        if (res.statusCode == 200 && res.data.success) {
          app.globalData.user = userinfo;
          //若接收邀请的是老师，则在课程详情界面添加老师名称，并回到首页后，将该用户角色默认为老师
          if (dis == 1) {
            that.data.teacher.push(userinfo.nickName);
            app.globalData.roleType = 1;
            that.setData({
              teacher: that.data.teacher
            })
          }
          //若接收邀请的是学生，并回到首页后，将该用户角色默认为学生
          if (dis == 0) {
            app.globalData.roleType = 0;
          }
          wx.showModal({
            content: "接受邀请成功",
            showCancel: false,
          })
          var companyRoleList = app.globalData.companyRoleList;
          // 检查公司id是否存在
          var flag = that.findElem(companyRoleList, "companyId", that.data.companyId);
          app.globalData.companyId = that.data.companyId;
          app.globalData.companyName = that.data.companyName;
          app.globalData.isNew = false;
          // 如果是-1的话就添加
          if (flag == -1) {
            app.globalData.companyRoleList.push({
              companyId: that.data.companyId,
              companyName: that.data.companyName,
              isdelete: 0,
              roletype: 2,
              userOpenid: openId,
            });
          }
          //this.sharemodal.hide();
          that.setData({
            modalHide: true
          })
          //})
        } else {
          wx.showModal({
            content: res.data.msg,
            showCancel: false,
          })
        }
        that.hideTime();
      }).catch((errMsg) => {
        wx.showModal({
          content: errMsg.message,
          showCancel: false,
        })
        that.hideTime();
      });
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function(options) {
    this.moreTimeToast = this.selectComponent("#moreTimeToast");
    this.moreTeacherToast = this.selectComponent("#moreTeacherToast");
  },
  /**
   * 查询成功之后的弹框
   */
  shareToast: function(options, openId, companyId, courseId, courseName, companyName) {
    var that = this;
    that.doOnLoad(options, openId, options.companyId, options.id, options.courseName, options.companyName).then(res => {
      if (options.type) {
        if (res == -1) {
          if (options.type == "shareStu" || options.type == "shareTea") {
            // that.sharemodal = that.selectComponent("#sharemodal");
            that.setData({
              modalHide: false
            })
          }
        }
      }
    });
  },
  /**
   *  生命周期函数--监听页面显示
   */
  onShow: function() {
    //判断页面是否可执行onshow方法
    if (app.globalData.isCourseShow) {
      var that = this;
      wx.hideShareMenu();
      var options = that.data.options; //拿到传入的参数
      var openId = app.globalData.openid //被邀请的openid
      // that.sharemodal = that.selectComponent("#sharemodal");
      if (openId != null && openId != '') {
        that.shareToast(options, openId);
      } else {
        // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
        // 所以此处加入 callback 以防止这种情况
        app.openIdCallback = openId => {
          that.shareToast(options, openId);
        }
      }
      //判断是否有奇他情况,若是，则只将其他情况置为false；若否，则将页面是否刷新置为false
      if (app.globalData.isOtherShow) {
        app.globalData.isOtherShow = false;
      } else {
        app.globalData.isCourseShow = false;
      }
    }
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function(res) {
    // 按钮分享
    if (res.from == "button") {
      var courseId = this.data.courseId; //课程id
      var companyName = this.data.companyName; //公司名字
      var companyId = this.data.companyId; //公司id 
      var courseName = this.data.courseName; //课程名字
      var openId = this.data.openId;
      var roleType = this.data.roleType;
      // 企业邀请老师
      if (res.target.dataset.dis == "shareTea") {
        return {
          title: companyName + '邀请你成为此课程老师',
          path: '/pages/course/courseDetail/courseDetail?type=shareTea&companyId=' + companyId + '&id=' + courseId + '&companyName=' + companyName + '&courseName=' + courseName + '&openId=' + openId + "&roleType=" + roleType
        }
      }
      // 老师邀请学生
      else if (res.target.dataset.dis == "shareStu") {
        var companyId = this.data.companyId; //公司id
        var courseName = this.data.courseName; //课程名字
        return {
          title: '邀请你加入' + courseName,
          path: '/pages/course/courseDetail/courseDetail?type=shareStu&companyId=' + companyId + '&id=' + courseId + '&courseName=' + courseName + '&openId=' + openId + "&roleType=" + roleType
        }
      }
    }
    //分享类型中右上角的分享
    else {
      // return {
      //   title: '企业详情',
      //   path: '/pages/cardCase/enterpriseCard/enterpriseCard?type=share&companyId=' + companyId
      // }
    }
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {
    //监听是否是添加
    if (this.data.type == 'add' || this.data.type == "companyToAdd") {
      wx.switchTab({
        url: '../../course/index/index'
      })
    }
  },

})