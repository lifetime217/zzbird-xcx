// pages/course/courseDetail/courseDetail.js
var http = require('../../../util/request/request.js');
var WxParse = require('../../../util/wxParse/wxParse.js');
var app = getApp();
var domainUrl = app.globalData.domainUrl;
import {
  base64src
} from '../../../util/request/baseData.js';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    type: "", // 判断来源   （编辑课程详情页面）
    courseId: "", //课程id
    imgUrls: [], //图片路劲集合
    courseName: "", //课程名字
    companyId: "", //公司id
    startTime: "", //开始时间
    endTime: "", //结束时间
    teacher: [], //老师列表
    personNumber: "", //学生人数
    classTimeSelect: "", // 课时选择
    ageRange: "", //年龄范围选择
    courseDetailInfo: "", //课程介绍
    companyName: "", // 公司名称
    inviteSessionKey: "", //邀请人的sesionKey
    inviteRoleVal: "", //邀请人的角色id
    classHour: "", //学生上课的课时
    studyWeek: "", //上课周数
    roleVal: "", //用户角色
    invitationMessage: "", //邀请消息
    inviteHide: true, //显示邀请框
    canvasHidden: true, //分享图片
    isback: false, //受邀请展示返回首页
    prurl: "", //保存相册使用的路劲
    exist: false, // 受邀請進來已經是否是該課程的老師或者學生
    isEdit: false, //判断该用户是否是该课程的企业创建者
    isFollow: true, //判断用户是否关注了公众号
    openGzhCode: false, //公众号二维码遮罩层
  },
  hideCanvas: function() {
    this.setData({
      canvasHidden: true
    });
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
          canvasHidden: false
        })
        wx.hideLoading()
      }
    })
  },


  /**
   * 跳转编辑课程
   * 
   */

  jumpEdit: function() {
    var that = this;
    wx.navigateTo({
      url: '/pages/init/addCourse/addCourse?type=edit&courseId=' + that.data.courseId,
    })
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
   * 返回首页
   */
  backIndex: function() {
    wx.switchTab({
      url: '../../init/index/index'
    })
  },
  /**
   * 用户受邀请进来确定
   */
  confirmModal: function(e) {
    var that = this;

    // 用户点击了确定
    if (e.detail.userInfo) {
      that.showLoad();
      var userinfo = e.detail.userInfo;
      var inviteRoleVal = that.data.inviteRoleVal;
      //添加信息
      http.httpPost(domainUrl + "/api/companycourseuser/addCourseUser", {
        "avatarUrl": userinfo.avatarUrl,
        "city": userinfo.city,
        "country": userinfo.country,
        "gender": userinfo.gender,
        "language": userinfo.language,
        "nickName": userinfo.nickName,
        "province": userinfo.province,
        "inviteSessionKey": that.data.inviteSessionKey,
        "inviteRoleVal": inviteRoleVal,
        "companyId": that.data.companyId,
        "companyName": that.data.companyName,
        "courseName": that.data.courseName,
        "courseId": that.data.courseId,
      }).then((res) => {
        console.log(res);
        if (res.data.statusCode == 200) {
          // 给app.js重新赋值 邀请人如是10 app.js为20
          // 如邀请人是20 app.js为30
          app.globalData.roleVal = inviteRoleVal == '10' ? '20' : '30';
          //邀请弹框隐藏
          that.setData({
            inviteHide: true
          });
          wx.showModal({
            content: "接受邀请成功",
            showCancel: false,
          })
        } else {
          wx.showModal({
            content: "添加失败",
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
   * 用户受邀请取消
   */
  cancelModal: function(e) {
    var that = this;
    that.setData({
      inviteHide: true
    })
  },
  /**
   * 查询课程
   */
  queryCouse: function(courseId, type) {
    var that = this;
    that.showLoad();
    return new Promise(function(resolve, reject) {
      http.httpGet(domainUrl + "/api/companycourse/queryCourseAndCompany/" + courseId, {
        "type": type
      }).then((res) => {
        if (res.data.statusCode == 200) {
          var data = res.data.data;
          var course = data.course;
          var roleVal = app.globalData.roleVal;
          console.log(course.courseDesc);
          WxParse.wxParse("article", "html", course.courseDesc, that, 0)

          var companyName = data.companyName;
          var courseName = course.courseName;
          var userName = data.userName;
          var personNumber = course.personNumber;
          var sharePoster = data.sharePoster; //背景图字段展示数据
          var imgWidth = data.imgWidth; //背景图（海报）的宽度
          var imgHeight = data.imgHeight; //背景图（海报）的高度
          var classHour = "";
          var studyWeek = "";
          //判断收邀请进来的用户是否已经是老师或者是学生
          if (data.exist != undefined) {
            that.setData({
              exist: true
            });
          }
          // 用户的课程和周数  二维码分享 图
          if (roleVal == '30' && type != 'inviteStu' && type != 'inviteTea') {
            classHour = data.classHour;
            studyWeek = data.studyWeek;
            // 海报拼接
            base64src("data:image/jpg;base64," + data.codeunlimit, "codeunlimit").then((filePath) => {
              base64src("data:image/jpg;base64," + data.backgroundBase, "backGroundImg").then((filePath1) => {
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
                    } else if (data.variableName == "studyWeek") {
                      variableName = studyWeek;
                    } else if (data.variableName == "classHour") {
                      variableName = classHour;
                    } else if (data.variableName == "personNumber") {
                      variableName = personNumber == 0 ? 0 : personNumber - 1; //需要减去自己
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
          }
          that.setData({
            courseId,
            imgUrls: data.courseImgsUrl,
            courseName,
            startTime: course.startTime,
            endTime: course.endTime,
            teacher: data.teacher,
            personNumber,
            classTimeSelect: course.courseHour,
            ageRange: course.ageRange,
            courseDetailInfo: course.courseDesc,
            companyName,
            roleVal: app.globalData.roleVal,
            studyWeek,
            classHour,
            type,
            isEdit: data.isEdit,
            isFollow: data.isFollow,
          });
          resolve();
        } else {
          reject();
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
   *  处理邀请
   */
  handleInvite: function(options) {
    var that = this;
    if (options.type != undefined) {
      var type = options.type;

      if (type == 'inviteTea' || type == 'inviteStu') {
        var companyId = options.companyId;
        var inviteSessionKey = options.inviteSessionKey;
        var invitationMessage = "";
        var companyName = options.companyName;
        var courseName = options.courseName;
        var inviteRoleVal = options.roleVal;
        //老师或者学生不存在该课程中
        var exist = that.data.exist;
        if (exist) {
          wx.showModal({
            content: '您已经是该课程的老师或者学生了',
            showCancel: false,
          })
          that.setData({
            inviteSessionKey,
            companyId,
            isback: true
          });
          return;
        }
        if (type == 'inviteTea') {
          //老师
          invitationMessage = companyName + "邀请你成为" + courseName + "的老师";
        } else if (type == 'inviteStu') {
          //学生
          invitationMessage = "是否成为" + courseName + "学生";
        }
        that.setData({
          inviteSessionKey,
          companyId,
          invitationMessage,
          inviteRoleVal,
          inviteHide: false,
          isback: true
        });
      }
    }
  },


  /**
   * 打卡公众号二维码
   */
  openGzhCode: function() {
    var that = this;
    that.setData({
      openGzhCode: true,
    })
  },

  /**
   * 关闭二维码窗口
   */
  hideCode: function() {
    var that = this;
    that.setData({
      openGzhCode: false,
    })
  },


  /**
   * 保存公众号二维码
   */
  saveGzhCode: function() {
    var that = this;
    wx.downloadFile({
      url: "http://111.231.78.102:71/kaka/GzhCode.jpg",
      success:function(res){
        var tempFilePath = res.tempFilePath
        wx.saveImageToPhotosAlbum({
          filePath: tempFilePath,
          success(res) {
            wx.showToast({
              title: '保存成功',
            })
          },
          fail(res) {
            wx.getSetting({
              success: function (res) {
                var statu = res.authSetting;
                // 没有授权的
                if (!statu['scope.writePhotosAlbum']) {
                  wx.showModal({
                    title: '是否授权保存相册',
                    content: '需要保存在相册中，请确认授权，否则无法保存相册',
                    success: function (tip) {
                      if (tip.confirm) {
                        wx.openSetting({
                          success: function (data) {
                            if (data.authSetting["scope.writePhotosAlbum"] === true) {
                              wx.showToast({
                                title: '授权成功',
                                icon: 'none',
                                duration: 1000
                              })
                              //生产环境时 记得这里要加入获取相册授权的代码
                              wx.saveImageToPhotosAlbum({
                                filePath: tempFilePath,
                                success(res) {
                                  wx.showToast({
                                    title: '保存成功',
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
      fail:function(res){
        console.log(res)
        wx.showToast({
          title: '图片下载失败',
          icon: 'none',
          duration: 1000
        })
        return;
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;
    if (app.globalData.sessionKey && app.globalData.sessionKey != "") {
      that.queryCouse(options.courseId, options.type).then(res => {
        that.handleInvite(options);
      });
    } else {
      // 由于请求是网络请求，可能会在 Page.onLoad执行 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.sessionKeyCallback = sessionKey => {
        if (sessionKey != '') {
          that.queryCouse(options.courseId, options.type).then(res => {
            that.handleInvite(options);
          });
        }
      }
    }

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {
    var type = this.data.type;
    if (type == "courseEdit") {
      // 如果是编辑课程页面过来返回就返回课程列表页面
      wx.switchTab({
        url: '/pages/course/index/index',
        success: function() {
          var page = getCurrentPages().pop();
          if (page == undefined || page == null) return;
          page.onLoad();
        }
      })
    }
  },


})