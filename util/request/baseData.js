const fsm = wx.getFileSystemManager();

const base64src = function(base64data, FILE_BASE_NAME) {
  return new Promise((resolve, reject) => {
    // const [, format, bodyData] = /data:image\/(\w+);base64,(.*)/.exec(base64data) || [];
    const bodyData = base64data.replace(/^data:image\/\w+;base64,/, "")
    // if (!format) {
    //   reject(new Error('ERROR_BASE64SRC_PARSE'));
    // }
    const filePath = `${wx.env.USER_DATA_PATH}/${FILE_BASE_NAME}.jpg`;
    const buffer = wx.base64ToArrayBuffer(bodyData);
    fsm.writeFile({
      filePath: filePath,
      data: buffer,
      encoding: 'binary',
      success() {
        resolve(filePath);
      },
      fail() {
        reject(new Error('ERROR_BASE64SRC_WRITE'));
      },
    });
  });
};
// export default base64src;

module.exports.base64src = base64src;