
function getRole(){
  var obj = wx.getStroge('sessionObj');
  if (obj != null && obj.role){
    return obj.role;
  }
}



/**
 * 封装post请求
 */
function httpPost(url, params) {
  /*
  if(!checkSessionKey()){
    post('/auth',function(res){
      if(res.statusCode == 200){
        var obj = {key:sessionKey,role:10,userRoleId:''};
        wx.setStroge('sessionObj',obj);
      }
    });
  }
  */
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