var http = require('httpHelper.js')
function formatTime(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()


  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}
function formatDate (strTime) {
    var date = new Date(strTime);
    return date.getFullYear()+"年"+(date.getMonth()+1)+"月"+date.getDate()+"日";
}
function htmlEncode(t) {
  var e = "";
  return 0 == t.length ? "" : (e = t.replace(/&/g, "&amp;"), e = e.replace(/</g, "&lt;"), e = e.replace(/>/g, "&gt;"), e = e.replace(/ /g, "&nbsp;"), e = e.replace(/\'/g, "&#39;"), e = e.replace(/\"/g, "&quot;"))
}
function htmlDecode(t) {
  var e = "";
  return 0 == t.length ? "" : (e = t.replace(/&amp;/g, "&"), e = e.replace(/&lt;/g, "<"), e = e.replace(/&gt;/g, ">"), e = e.replace(/&nbsp;/g, " "), e = e.replace(/&#39;/g, "'"), e = e.replace(/&quot;/g, '"'))
}
function accMul(a, b) {
    var c = 0,
        d = a.toString(),
        e = b.toString();
    try {
        c += d.split(".")[1].length;
    } catch (f) {}
    try {
        c += e.split(".")[1].length;
    } catch (f) {}
    return Number(d.replace(".", "")) * Number(e.replace(".", "")) / Math.pow(10, c); 
} 
//加法运算中级解决办法
function accAdd(a, b) {   
    var c, d, e;
    try {
        c = a.toString().split(".")[1].length;
    } catch (f) {
        c = 0;
    }
    try {
        d = b.toString().split(".")[1].length;
    } catch (f) {
        d = 0;
    }
    return e = Math.pow(10, Math.max(c, d)), (a * e + b * e) / e; 
} 
//返回值：arg1减上arg2的精确结果   
function accSub(a,b){      
   var c, d, e;
    try {
        c = a.toString().split(".")[1].length;
    } catch (f) {
        c = 0;
    }
    try {
        d = b.toString().split(".")[1].length;
    } catch (f) {
        d = 0;
    }
    return e = Math.pow(10, Math.max(c, d)), (a * e - b * e) / e;
}
//返回值：arg1除以arg2的精确结果
function accDiv(a, b) {
    var c, d, e = 0,
        f = 0;
    try {
        e = a.toString().split(".")[1].length;
    } catch (g) {}
    try {
        f = b.toString().split(".")[1].length;
    } catch (g) {}
    return c = Number(a.toString().replace(".", "")), d = Number(b.toString().replace(".", "")), c / d * Math.pow(10, f - e);
}
function goUrl(url,type){
	var app = getApp();
	//替换url
	var is_app=false;
	var mini_app=[];
	var appurl=url;
	if(url.indexOf('/pages')==0 || url.indexOf('pages')==0){
		is_app=true;
	} else if(url.indexOf('&wxapp=')>0){
		var pattern=/.*?wxapp=([^&]*)(&|$)/i;
		var t=pattern.exec(url);
		if(t.length>1){
			appurl=decodeURIComponent(t[1]);
			is_app=true;
		}
	} else if(url.substring(0,9)=='bidcms://'){
		mini_app=[url.substring(9,27),url.substring(27)];
		is_app=true;
	}
	if(is_app){
		if(mini_app.length>1){
			wx.navigateToMiniProgram({
			  appId: mini_app[0],
			  path:mini_app[1],
			  extraData: wx.getStorageSync('userInfo'),
			  success(res) {
				// 打开成功
				console.log(res);
			  },
		      fail(res){
				  wx.showToast({
					  title: res.errMsg,
					  icon: 'success',
					  duration: 2000
				  })
			  }
			})
		} else {
			switch(type){
				case 'reLaunch':
					wxreLaunch({
						url:appurl
					});
					break;
				case 'redirectTo':
					wx.redirectTo({
						url:appurl
					});
					break;
				default:
					wx.navigateTo({
					  url:appurl
					});
					break;
			}
			
		}
	} else {
		url='?con=wxapp&act=url&link='+encodeURIComponent(url);
		http.httpPost(url, {}, function (res) {
		  if (res.code == '200' && res.msg == 'success') {
			if(res.type=='wxapp'){
				if(res.ext && res.ext.type=="wxapp"){
					wx.navigateToMiniProgram({
						appid:res.ext.appid,
						path:res.url,
						extraData:res.ext.extraData,
						envVersion:res.ext.envVersion
					})
				} else if(res.ext && res.ext.type=="redirect"){
					wx.redirectTo({
						url: res.url
					})
				} else if(res.ext && res.ext.type=="switch"){
					wx.switchTab({
						url: res.url
					})
				} else if(res.ext && res.ext.type=="back"){
					wx.navigateBack({
						delta: res.ext.delta
					})
				} else {
					wx.navigateTo({
						url: res.url,
					})
				}
			} else if (res.type=='web') {
				wx.navigateTo({
					url: '/pages/web/web?url=' +encodeURIComponent(res.url),
				})
			}
		  } else {
			  wx.showToast('网络错误');
		  }
		});
	}
}
function goPhone(phone){
	wx.makePhoneCall({
	  phoneNumber: phone //仅为示例，并非真实的电话号码
	})
}
function goAddress(res){
	wx.openLocation({
	  latitude: res.position.lat,
	  longitude: res.position.lng,
	  scale: 18,
	  name: res.name,
	  address: res.address
	})
}
function getLocalTime(now) {
  var now = new Date(parseInt(now));
  var year = now.getFullYear();
  var month = now.getMonth() + 1;
  var date = now.getDate();
  var hour = now.getHours();
  var minute = now.getMinutes();
  var second = now.getSeconds();
  return year + "-" + month + "-" + date + " " + hour + ":" + minute //+ ":" + second; 
}
function pointLine(points, rate) {
  var pointA, pointB, pointDistance, xDistance, yDistance, tan, radian, tmpPointDistance;
  var ret = [];
  pointA = points[0];//点击
  pointB = points[1];//中间
  xDistance = pointB.x - pointA.x;
  yDistance = pointB.y - pointA.y;
  pointDistance = Math.pow(Math.pow(xDistance, 2) + Math.pow(yDistance, 2), 1 / 2);
  tan = yDistance / xDistance;
  radian = Math.atan(tan);
  tmpPointDistance = pointDistance * rate;
  ret = {
	x: pointA.x + tmpPointDistance * Math.cos(radian),
	y: pointA.y + tmpPointDistance * Math.sin(radian)
  };
  return ret;
}
function bezier(pots, amount) {
	var pot;
	var lines;
	var ret = [];
	var points;
	for (var i = 0; i <= amount; i++) {
	  points = pots.slice(0);
	  lines = [];
	  while (pot = points.shift()) {
		if (points.length) {
		  lines.push(pointLine([pot, points[0]], i / amount));
		} else if (lines.length > 1) {
		  points = lines;
		  lines = [];
		} else {
		  break;
		}
	  }
	  ret.push(lines[0]);
	}
	return {
	  'bezier_points': ret
	};
}
module.exports = {
  formatTime: formatTime,
  formatDate:formatDate,
  getLocalTime: getLocalTime,
  accMul: accMul,
  accAdd:accAdd,
  accDiv:accDiv,
  accSub:accSub,
  htmlDecode: htmlDecode,
  htmlEncode: htmlEncode,
  goUrl:goUrl,
  goPhone:goPhone,
  goAddress:goAddress,
  bezier:bezier
}
