/**
 * 生成随机的uuid
 */
function uuid() {
  var s = [];
  var hexDigits = "0123456789abcdef";
  for (var i = 0; i < 36; i++) {
    s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
  }
  s[14] = "4"; // bits 12-15 of the time_hi_and_version field to 0010
  s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
  s[8] = s[13] = s[18] = s[23] = "-";

  var uuid = s.join("");
  return uuid;
}

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
  uuid: uuid,
  getDate: getDate,
  getTimestamp: getTimestamp,
  formatTime: formatTime,
  trim: trim
}