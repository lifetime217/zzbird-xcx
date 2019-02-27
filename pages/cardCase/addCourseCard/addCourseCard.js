// miniprogram/pages/cardCase/addEnterpriseCard/addEnterpriseCard.js
var util = require('../../../util/util.js');
var http = require('../../../util/request/request.js');
var app = getApp();
var domainUrl = app.globalData.domainUrl;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    autoplay: true, // 是否自动切换
    interval: 3000, // 自动切换时间间隔 
    duration: 1000, // 滑动动画时长
    current: 0, // 展示图片的下标
    scopea: true, // 是否选择年龄
    isShow: false, // 控制年龄范围的伸缩
    triangle: false, // 年龄三角旋转
    ages: ['1-8', '8-14', '14-18', '18以上'], // 年龄范围的选项
    classHour: [{ // 课时集合
        value: '1课时',
        checked: true
      },
      {
        value: '2课时'
      }
    ],
    ageRange: "1-8", // 年龄选择名称
    ageShow: 0, // 年龄范围索引
    companyId: "", // 公司id
    // companyName: "",                         // 公司名字
    time1: [], // 上课开始时间集合
    time2: [], // 上课结束时间集合
    timeSize: [], // 记录上课时间数组长度
    imgUrls: [], // 图片集合
    imgUrlId: [], // 图片id集合
    courseName: "", // 课程名称
    introduce: "", // 课程简介
    courseId: '', // 课程id
    status: 'add', // 编辑还是新增
    imgCount: 4, //图片添加的张数
    deleteImges: [], //用于售价删除的图片
    type:"" //记录上一个跳转界面
  },
  /**
   *  选择的年龄下标
   */
  kindAge: function(e) {
    var index = e.currentTarget.dataset.index;
    var val = e.currentTarget.dataset.val;
    this.setData({
      scopea: true,
      triangle: !this.data.triangle,
      isShow: !this.data.isShow,
      ageRange: val,
      ageShow: index
    });
  },
  /**
   * 年龄范围 弹出
   */
  kindToggle: function(e) {
    this.setData({
      isShow: !this.data.isShow,
      triangle: !this.data.triangle
    });
  },
  /**
   * 课时选择
   */
  checkboxChange: function(e) {
    this.setclassHour(e.currentTarget.dataset.val)
  },
  /**
   * 课程名称 填写
   */
  courseInput: function(e) {
    var input = e.detail.value;
    if (input.length < 12) {
      this.setData({
        courseName: input
      })
    }
  },
  /**
   * 课程简介 填写
   */
  introduceInput: function(e) {
    this.setData({
      introduce: e.detail.value
    })
  },
  /**
   * 保存课程
   */
  onSave: function(e) {
    //设置页面可执行onshow方法
    app.globalData.isCourseShow = true;
    app.globalData.isOtherShow = true;

    var that = this;
    var time1 = that.data.time1; //开始时间
    var time2 = that.data.time2; //结束时间
    var ageRange = that.data.ageRange; //年龄范围名字
    var ageShow = that.data.ageShow; //年龄范围索引
    var introduce = that.data.introduce; //简介
    var imgUrls = that.data.imgUrls; //图片集合
    var imgUrlId = that.setImgUrlId(imgUrls); //图片id
    var courseName = that.data.courseName; //课程名字
    var classHourName = that.getClassHour().hourNA; //课时名称
    var classHourIndex = that.getClassHour().hourIN; //课时下标
    var courseId = that.data.courseId; //课程ID
    var companyId = app.globalData.companyId; //公司ID
    // var companyName = this.data.companyName;         //公司名称
    var openId = app.globalData.openid; //openid
    //校验页面内容，若为空则不允许保存
    if (courseName == "") {
      wx.showToast({
        icon: 'none',
        title: '请填写课程名称',
      })
      return;
    }
    if (ageRange == "") {
      wx.showToast({
        icon: 'none',
        title: '请选择年龄范围',
      })
      return;
    }
    if (introduce == "") {
      wx.showToast({
        icon: 'none',
        title: '请填写课程简介',
      })
      return;
    }
    if (time1.length != time2.length) {
      wx.showToast({
        icon: 'none',
        title: '上课时间需填写完整',
      })
      return;
    }

    if (imgUrlId == "") {

    }

    //定义保存的内容
    var param = {
      statrdate: time1, //开始时间
      enddate: time2, //结束时间
      ageRange: ageRange, //年龄范围名字
      ageShow: ageShow, //年龄范围索引
      introduce: introduce, //简介
      imgs: imgUrlId, //图片
      courseName: courseName, //课程名字
      classHourName: classHourName, //课时名称
      classHourIndex: classHourIndex, //课时下标
      courseId: courseId, //课程ID
      companyId: companyId, //公司ID
      // companyName: companyName,       //公司名称
      openId: openId, //openid
    }
    //根据页面状态调用新增跟修改方法,如果是修改，则在param中添加id属性
    var htmlStatus = that.data.status;
    var url = "";
    if (htmlStatus == "add" || htmlStatus == "addMore") {
      url = domainUrl + "/course/new/curriculum";
    }
    if (htmlStatus == "edit") {
      url = domainUrl + "/course/update/curriculum";
      param.id = courseId;
    }
    http.httpPost(url, param).then((res) => {
      if (res.data.success) {
        // 课程列表跳转进来
        if (htmlStatus == "addMore") {
          let pages = getCurrentPages();
          let prePage = pages[pages.length - 2]; //上一页面  
          prePage.onLoad()
          wx.navigateBack({
            delta: 1,
          })
        } else {
          if (that.data.type == "companyToAdd"){
            wx.navigateTo({
              url: '../../course/courseDetail/courseDetail?isBack=true&type=companyToAdd&id=' + res.data.data
            })
          }else{
            wx.navigateTo({
              url: '../../course/courseDetail/courseDetail?isBack=true&type=add&id=' + res.data.data
            })
          }
        }
      } else {
        wx.showToast({
          icon: 'none',
          title: res.data.msg,
        })
      }
    }).catch((errMsg) => {
      wx.showModal({
        content: '网络异常',
        showCancel: false,
      })
      //that.hideTime();
    });
  },

  // 上传图片
  doUpload: function() {
    var that = this;
    var imgUrls = that.data.imgUrls; //图片集合
    var imgCount = that.data.imgCount;
    if (imgUrls.length < 4) {
      // 选择图片
      wx.chooseImage({
        count: this.data.imgCount,
        sizeType: ['compressed'], //使用的压缩图还是原图片
        sourceType: ['album', 'camera'], //使用相册和相机
        success: function(res) {
          if (res.errMsg == "chooseImage:ok") {

            var imgUrlId = that.setImgUrlId(imgUrls); //图片id集合
            // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片  
            var tempFilePaths = res.tempFilePaths;
            if (res.tempFiles[0].size >= 5242880) {
              wx.showToast({
                title: '上传图片不能大于5M!',
                icon: 'none'
              })
              return;
            }
            wx.showLoading({
              title: '上传中',
            })
            for (var i = 0; tempFilePaths.length > i; i++) {
              wx.uploadFile({
                url: domainUrl + '/company/simple/upload?_t=' + new Date().getTime(),
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




          }
        },
        fail: e => {}
      })
    } else {
      wx.showToast({
        title: '最多可上传四张照片!',
        icon: 'none'
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
            var imgId = that.setImgUrlId(imgs); //图片id
            imgs.splice(index, 1);
            imgId.splice(index, 1);
            that.setData({
              imgUrls: imgs,
              imgUrlId: imgId,
              current: (index - 1) < 0 ? 0 : index - 1, // 删除的前一张图片展示
              imgCount: that.data.imgCount + 1,
            });
          }).catch((errMsg) => {
            wx.showModal({
              content: '网络异常',
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

  /**
   * 修改
   */
  onEdit: function(courseId, roleType) {
    var that = this;
    var openid = app.globalData.openid;
    var companyId = app.globalData.companyId;
    http.httpPost(domainUrl + "/course/getCourseInfo", {
      "courseId": courseId,
      "distinguish": roleType,
      "openId": openid,
      "companyId": companyId
    }).then((res) => {
      if (res.statusCode == 200 && res.data.success) {
        var data = res.data.data.course.courseInfo;
        var timeArr = [];
        if (data.courseTime != null) {
          timeArr = that.getCourseTime(data.courseTime);
        }
        that.setclassHour(data.classHourName); //选中课时
        that.setData({
          companyId: data.companyId, //公司id
          companyName: data.companyName, //公司名字
          courseId: data.id, //课程id
          courseName: data.courseName, //公司名字
          imgUrls: data.picture, //图片集合
          imgUrlId: that.setImgUrlId(data.picture), //图片ID
          time1: timeArr.arr1, //上课开始时间集合
          time2: timeArr.arr2, //上课结束时间集合
          timeSize: timeArr.arr1, //记录上课时间数组长度
          ageRange: data.ageRange, //年龄选择名称
          ageShow: that.getAges(data.ageRange), //年龄范围索引
          introduce: data.introduce, //课程简介
          status: "edit", //编辑还是新增
          imgCount: 4 - data.picture.length, //编辑时候控制图片选择
        });
      } else {
        wx.showModal({
          content: '请求错误，请重试！',
          showCancel: false,
        })
        that.hideTime();
        //wx.stopPullDownRefresh();
      }
    }).catch((errMsg) => {
      wx.showModal({
        content: '网络异常',
        showCancel: false,
      })
    });
  },

  /**
   * 拼接课程的时间
   */
  getCourseTime(courseTimeArr) {
    var arr1 = new Array(courseTimeArr.length);
    var arr2 = new Array(courseTimeArr.length);
    for (let i = 0; i < courseTimeArr.length; ++i) {
      arr1[i] = courseTimeArr[i].schoolTime;
      arr2[i] = courseTimeArr[i].quittingTime;
    }
    return {
      arr1: arr1,
      arr2: arr2
    };
  },

  /**
   * 获取年龄段对应年龄索引
   */
  getAges(age) {
    var ageArr = this.data.ages;
    for (let i = 0; i < ageArr.length; ++i) {
      if (age == ageArr[i]) {
        return i;
      }
    }
  },

  /**
   * 设置课程课时选中
   */
  setclassHour(hour) {
    var hours = this.data.classHour;
    if (hour == "2课时") {
      this.setData({
        classHour: [{
            value: '1课时',
            checked: false
          },
          {
            value: '2课时',
            checked: true
          }
        ]
      })
    } else {
      this.setData({
        classHour: [{
            value: '1课时',
            checked: true
          },
          {
            value: '2课时',
            checked: false
          }
        ]
      })
    }
  },

  /**
   * 获取选中的课时
   */
  getClassHour() {
    var hours = this.data.classHour;
    if (hours[0].checked) {
      return {
        hourNA: hours[0].value,
        hourIN: 0
      }
    } else {
      return {
        hourNA: hours[1].value,
        hourIN: 1
      }
    }
  },

  /**
   * 设置图片的id数组
   */
  setImgUrlId(imgArr) {
    var imgIds = [];
    for (let i = 0; i < imgArr.length; ++i) {
      imgIds.push(imgArr[i].id);
    }
    return imgIds;
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;
    // 编辑
    if (options.status != undefined && options.status == 'edit') {
      wx.setNavigationBarTitle({
        title: '编辑课程'
      })
      var courseId = options.id;
      var roleType = options.roleType;
      this.setData({
        status: options.status
      })
      that.onEdit(courseId, roleType);
    }
    // 课程列表页面跳转进来
    else if (options.status != undefined && options.status == "addMore") {
      this.setData({
        status: options.status
      })
    }
    // 新增
    else {
      this.setData({
        type: options.type
      })
    }
    if (options.id != undefined) {
      this.setData({
        courseId: options.id
      });
    }
  },

  //时间段
  addTime: function(e) {
    var that = this;
    var time1 = that.data.time1;
    var time2 = that.data.time2;
    var timeSize = that.data.timeSize
    //当页面状态为edit时，上课时间time1的长度需等于上课时间数量timeSize的长度
    //当页面状态为其他时，上课时间time1的长度需等于上课时间数量timeSize的长度+1
    var size = "";
    if (that.data.status == "edit"){
      size = timeSize.length
    }else{
      size = timeSize.length + 1
    }
    //判断新增的上课开始时间与结束时间是否有值，若有继续，若无，则提示
    if (time1.length == size && time2.length == size
      //判断第一行时间是否有值，若有继续，若无，则提示
      &&
      time1.length > 0 && time2.length > 0) {
      timeSize.push(1);
      this.setData({
        timeSize: timeSize
      });
    } else {
      wx.showToast({
        icon: 'none',
        title: '请先填写上课时间'
      })
    }
  },
  /**
   * 移除时间段
   */
  subtract: function(e) {
    var index = e.currentTarget.dataset.index + 1;
    var time1 = this.data.time1;
    var time2 = this.data.time2;
    time1.splice(index, 1);
    time2.splice(index, 1);
    var timeSize = this.data.timeSize;
    timeSize.splice(e.target.id, 1);
    this.setData({
      timeSize: timeSize,
      time1: time1,
      time2: time2,
    });
  },
  /**
   * 上课时间，时间段
   */
  bindTimeChange(e) {
    var that = this;
    var time1 = that.data.time1;
    var time2 = that.data.time2;
    var startTime = e.detail.value;
    var type = e.currentTarget.dataset.type;
    if (type == 0) {
      if (time2[0] != null) {
        if (startTime < time2[0]) {
          time1.splice(0, 1);
          time1.splice(0, 0, startTime);
        } else {
          wx.showToast({
            icon: 'none',
            title: '上课时间要小于下课时间'
          })
        }
      } else {
        time1.splice(0, 1);
        time1.splice(0, 0, startTime);
      }
    } else if (startTime > time1[0]) {
      if (time1[1] != null) {
        for (var i = 1; i < time1.length; i++) {
          if (startTime < time1[i]) {
            time2.splice(0, 1);
            time2.splice(0, 0, startTime);
          } else {
            wx.showToast({
              icon: 'none',
              title: '时间段不能交叉'
            })
          }
        }
      } else {
        time2.splice(0, 1);
        time2.splice(0, 0, startTime);
      }
    } else {
      wx.showToast({
        icon: 'none',
        title: '下课时间要大于上课时间'
      })
    }
    that.setData({
      time1: time1,
      time2: time2,
    })
  },
  bindTimeChange2(e) {
    var that = this;
    var time1 = that.data.time1;
    var time2 = that.data.time2;
    var startTime = e.detail.value;
    var type = e.currentTarget.dataset.type;
    var index = e.currentTarget.dataset.index + 1;
    if (type == 0) {
      if (startTime >= time2[index - 1]) {
        if (time2[index] != null) {
          if (startTime < time2[index]) {
            time1.splice(index, 1);
            time1.splice(index, 0, startTime);
          } else {
            wx.showToast({
              icon: 'none',
              title: '需大于上次下课时间'
            })
          }
        } else {
          time1.splice(index, 1);
          time1.splice(index, 0, startTime);
        }
      } else {
        wx.showToast({
          icon: 'none',
          title: '需大于上次下课时间'
        })
      }
    } else if (startTime > time1[index]) {
      if (time1[index + 1] != null) {
        for (var i = index + 1; i < time1.length; i++) {
          if (startTime < time1[i]) {
            time2.splice(index, 1);
            time2.splice(index, 0, startTime);
          } else {
            wx.showToast({
              icon: 'none',
              title: '时间段不能交叉'
            })
          }
        }
      } else {
        time2.splice(index, 1);
        time2.splice(index, 0, startTime);
      }
    } else {
      wx.showToast({
        icon: 'none',
        title: '下课时间需大于上课时间'
      })
    }
    that.setData({
      time1: time1,
      time2: time2,
      inde: index,
    })
  },
  //监听页面卸载
  onUnload: function() {
    var deleteImges = this.data.deleteImges;
    if (this.data.status == "edit" && this.data.deleteImges.length > 0) {

      http.httpPost(domainUrl + "/course/deleteMiddleid", {
        "ids": deleteImges
      }).then((res) => {

      }).catch((errMsg) => {
        wx.showModal({
          content: '网络异常',
          showCancel: false,
        })
      });

    }

  },
})