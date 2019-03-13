// pages/init/addCourse/addCourse.js
var http = require('../../../util/request/request.js');
var app = getApp();
var domainUrl = app.globalData.domainUrl;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    type: "", //来源判断页面是从哪里跳转过来的 新建企业跳转过来，编辑课程过来
    imgUrls: [], // 访问图片集合
    imgUrlName: [], // 图片名字集合
    courseName: "", //输入的课程名称
    startTime: "", //开始时间
    endTime: "", //结束时间
    classTime: [{ // 课时集合
        value: '1课时',
        checked: true
      },
      {
        value: '2课时',
        checked: false
      }
    ],
    classTimeSelect: "1课时", //课时选择名称
    isShow: false, // 控制年龄范围的伸缩
    ages: ['1-8', '8-14', '14-18', '18以上'], // 年龄范围的选项
    ageRange: "1-8", // 年龄选择名称
    ageIndex: 0, // 年龄范围索引
    courseDetailInfo: "", //课程介绍
    courseId: "", //编辑课程
  },
  /**
   * 选择图片
   */
  checkpicture: function() {
    var that = this;
    var imgUrlName = that.data.imgUrlName;
    var imgUrls = that.data.imgUrls;
    if (imgUrlName.length >= 1) {
      wx.showToast({
        title: '最多上传一张图片',
        icon: 'none'
      })
      return;
    }
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'], //使用的压缩图还是原图片
      sourceType: ['album', 'camera'], //使用相册和相机
      success: function(res) {
        if (res.errMsg == "chooseImage:ok") {
          wx.showLoading({
            title: '上传中',
          })
          var tempFiles = res.tempFiles;
          // 判断选择多张图片时图片的大小

          if (tempFiles[0].size >= 5242880) {
            wx.showToast({
              title: '上传图片不能大于5M!',
              icon: 'none'
            })
            return;
          }
          wx.uploadFile({
            url: domainUrl + '/upload/pic?_t=' + new Date().getTime(),
            filePath: tempFiles[0].path,
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
      },
      fail: e => {}
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
  /**
   * 课程名称
   */
  courseNameInput: function(e) {
    var input = e.detail.value;
    if (input.length < 20) {
      this.setData({
        courseName: input
      })
    }
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
   * 富文本编辑
   */
  checkRichtext: function() {
    var courseDetailInfo = this.data.courseDetailInfo;
    wx.navigateTo({
      url: '../richText/richText?type=course&courseDetailInfo=' + escape(courseDetailInfo)
    })
  },
  /**
   * 选择年龄
   */
  checkAge: function(e) {
    var index = e.currentTarget.dataset.index;
    var type = e.currentTarget.dataset.type;
    this.setData({
      isShow: !this.data.isShow,
      ageRange: type,
      ageIndex: index
    });
  },

  /**
   * 年龄选择
   */
  kindToggle: function() {
    this.setData({
      isShow: !this.data.isShow
    });
  },
  /**
   * 课时选择
   */
  checkClassTimeChange: function(e) {
    var type = e.currentTarget.dataset.type;
    var classTime = this.data.classTime;
    for (var i = 0; i < classTime.length; i++) {
      if (type == classTime[i].value) {
        classTime[i].checked = true;
      } else {
        classTime[i].checked = false;
      }
    }
    this.setData({
      classTime: classTime,
      classTimeSelect: type
    })
  },
  /**
   * 时间选择
   */
  bindTimeChange: function(e) {
    var type = e.currentTarget.dataset.type;
    var time = e.detail.value; //选择的时间
    var startTime = this.data.startTime; //已选的开始时间
    var endTime = this.data.endTime; //已选的结束时间
    if (type == 0) {
      if (endTime != "" && time > endTime) {
        this.setData({
          startTime: time,
          endTime: time
        });
      } else {
        this.setData({
          startTime: time
        });
      }
    } else {
      this.setData({
        endTime: time
      });
    }
  },
  /**
   * 编辑课程查询课程的信息
   */
  queryCourse: function(courseId) {
    var that = this;
    that.showLoad();
    var classTime = that.data.classTime; //课时选择数组
    var ages = that.data.ages; //年龄选择数组
    http.httpGet(domainUrl + "/api/companycourse/queryCourseDetailByCourseId/" + courseId, {}).then((res) => {
      if (res.data.statusCode == 200) {
        var data = res.data.data;
        var course = data.course;
        // 修改课时选择的默认值
        var courseHour = course.courseHour;
        for (var i = 0; i < classTime.length; i++) {
          if (courseHour == classTime[i].value) {
            classTime[i].checked = true;
          } else {
            classTime[i].checked = false;
          }
        }
        //拿到年龄选择的下标
        var ageIndex = 0;
        var ageRange = course.ageRange;
        for (var i = 0; i < ages.length; i++) {
          if (ages[i] == ageRange) {
            ageIndex = i;
          }
        }
        that.setData({
          imgUrlName: data.courseImgsName,
          imgUrls: data.courseImgsUrl,
          courseName: course.courseName,
          startTime: course.startTime,
          endTime: course.endTime,
          ageIndex: ageIndex,
          classTime: classTime,
          classTimeSelect: courseHour,
          ageRange: ageRange,
          courseDetailInfo: course.courseDesc
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
      // 编辑课程
      if (options.courseId != undefined) {
        wx.setNavigationBarTitle({
          title: '编辑课程'
        })
        this.setData({
          courseId: options.courseId
        });
        this.queryCourse(options.courseId);
      }
      this.setData({
        type: options.type
      });
    }
  },
  /**
   * 完成按钮
   */
  onFinish: function() {
    var that = this;
    that.showLoad();
    var imgUrlName = that.data.imgUrlName;
    var courseName = that.data.courseName;
    var startTime = that.data.startTime;
    var endTime = that.data.endTime;
    var ageRange = that.data.ageRange;
    var classTimeSelect = that.data.classTimeSelect;
    var courseDetailInfo = that.data.courseDetailInfo;
    var type = that.data.type;
    if (imgUrlName.length == 0) {
      wx.showToast({
        title: '请上传图片',
        icon: 'none'
      })
      return;
    }
    if (courseName == "") {
      wx.showToast({
        title: '请输入课程名字',
        icon: 'none'
      })
      return;
    }
    if (startTime == "" || endTime == "") {
      wx.showToast({
        title: '请完善上课时间',
        icon: 'none'
      })
      return;
    }
    var imgUrlNameStr = imgUrlName.join(",");
    var params = {
      "courseName": courseName,
      "courseHour": classTimeSelect,
      "ageRange": ageRange,
      "startTime": startTime,
      "endTime": endTime,
      "courseDesc": courseDetailInfo,
      "courseImg": imgUrlNameStr
    }
    var url;
    if (type == "edit") {
      params.id = that.data.courseId;
      url = domainUrl + "/api/companycourse/updateCourse";
    } else {
      url = domainUrl + "/api/companycourse/addCourse"
    }
    http.httpPost(url, params).then((res) => {
      if (res.data.statusCode == 200) {
        var data = res.data.data;
        var content, courseId;
        if (type == "edit") {
          courseId = that.data.courseId;
          content = "编辑成功";
        } else {
          courseId = data.courseId;
          content = "新建成功";
        }
        //修改
        wx.showModal({
          content: content,
          showCancel: false,
          success: function(res) {
            if (res.confirm) {
              // 重新赋值type 当跳转页面之后卸载了页面，回触发onUnload的方法
              that.setData({
                type: ""
              });
              // 用户点击确定 返回详情展示 
              wx.navigateTo({
                url: '../../course/courseDetail/courseDetail?type=courseEdit&courseId=' + courseId
              })
            }
          }
        })
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
    // 编辑文本返回获取
    if (currPage.data.courseDetailInfo != null) {
      that.setData({
        courseDetailInfo: currPage.data.courseDetailInfo
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
    var type = this.data.type;
    // 判断如果是从新建企业过来的就直接返回首页
    if (type == "addCompany") {
      wx.switchTab({
        url: '/pages/init/index/index',
      })
    }
  },
})