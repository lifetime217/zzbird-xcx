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

module.exports = {
  httpPost: httpPost,
  httpGet: httpGet
}