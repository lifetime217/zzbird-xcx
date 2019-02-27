/**
 * 封装post请求
 */
function httpPost(url, params) {
  var promise = new Promise((resolve, reject) => {
    //网络请求
    wx.request({
      url: url,
      data: params,
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: (res) => resolve(res),
      fail: (res) => reject(res)
    })
  });
  return promise;
}

/**
 * 封装post请求
 */
function httpPostJson(url, params) {
  var promise = new Promise((resolve, reject) => {
    //网络请求
    wx.request({
      url: url,
      data: params,
      method: 'POST',
      header: {
        'dataType':'json',
        'content-type': 'application/json'
      },
      success: (res) => resolve(res),
      fail: (res) => reject(res)
    })
  });
  return promise;
}

/**
 * 封装get请求
 */
function httpGet(url, params) {
  var promise = new Promise((resolve, reject) => {
    //网络请求
    wx.request({
      url: url,
      data: params,
      method: 'GET',
      success: (res) => resolve(res),
      fail: (res) => reject(res)
    })
  });
  return promise;
}

/**
 * 调用自定义提示框
 */
function toastShow(that, str, icon) {
  that.setData({
    isShow: true,
    txt: str,
    iconClass: icon
  });
  setTimeout(function() {
    that.setData({
      isShow: false
    });
  }, 1500);
}




module.exports = {
  httpPost: httpPost,
  httpGet: httpGet,
  toastShow: toastShow,
  httpPostJson: httpPostJson
}