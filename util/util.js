

/**
 * 转换时间为  YY-MM-DD  hh:mm:ss
 */
function formatTime(date) {
  var time = new Date(date);
  var year = time.getFullYear()
  var month = time.getMonth() + 1
  var day = time.getDate()
  var hour = time.getHours()
  var minute = time.getMinutes()
  var second = time.getSeconds()
  
  return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

/**
 * 获取当前日期
 */
function getDate() {
  var timestamp = Date.parse(new Date());
  var date = new Date(timestamp);
  let nowDate = date.toJSON().substring(0, 10);
  return nowDate;
}

/**
 * 获取指定时间戳
 */
function getTimestamp(date) {
  return Date.parse(new Date(date))/1000;
}

/**
 *  去掉所有空格
 * 去掉前后空格   str.replace(/(^\s*)|(\s*$)/g, "")
 */
function trim(str) {
  return str.replace(/\s+/g, "");
}



module.exports = {
  getDate: getDate,
  getTimestamp: getTimestamp,
  formatTime: formatTime,
  trim: trim
}