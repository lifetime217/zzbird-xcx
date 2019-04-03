// pages/owner/company/classBill/classBill.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    classBill: {
      "2019-4": {
        "张老师": [{
          "courseId": "123456789",
          "courseName": "架子鼓",
          "dakaNum": 62
        }, {
          "courseId": "4567891",
          "courseName": "钢琴课",
          "dakaNum": 78
        }],
        "李老师": [{
          "courseId": "123456789",
          "courseName": "美术",
          "dakaNum": 51
        }, {
          "courseId": "4567891",
          "courseName": "幼教",
          "dakaNum": 38
        }]
      },
      "2019-3": {
        "王老师": [{
          "courseId": "123456789",
          "courseName": "架子鼓",
          "dakaNum": 62
        }, {
          "courseId": "4567891",
          "courseName": "钢琴课",
          "dakaNum": 78
        }, {
          "courseId": "4567891",
          "courseName": "幼教",
          "dakaNum": 78
        }],
        "李老师": [{
          "courseId": "123456789",
          "courseName": "美术",
          "dakaNum": 51
        }, {
          "courseId": "4567891",
          "courseName": "幼教",
          "dakaNum": 38
        }]
      }
    },
    hasData:true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    
  }
})