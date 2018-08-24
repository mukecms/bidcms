var config = require('../config.js')
function getExtConfig(cb){
  if (wx.getExtConfig) {
	  wx.getExtConfig({
		success: function (res) {
			if(res.extConfig){
			  typeof cb == "function" && cb(res.extConfig);
			}
		}
	  })
  }
}
function getUserInfo(cb){
	try {
	  var userInfo = wx.getStorageSync('userInfo');
	  typeof cb == "function" && cb(userInfo);
	} catch (e) {
	  console.log(e);
	}
	
}
function extend() {
	var o={};
	var i =0,len=arguments.length;
	for(;i<len;i++){
		var source = arguments[i];
		for(var prop in source){
			o[prop] = source[prop];
		}
	}
	return o;
}
function Get (url, extdata, cb ){
	wx.showNavigationBarLoading();
	if (url.substring(0, 4).toLowerCase()!='http') {
		url = config.HTTP_BASE_URL +url;
	}
	url = url.replace('http:', 'https:');
	getExtConfig(function(extconfig){
		try {
			var data={appid: extconfig.appid, pid: extconfig.pid,shopid:extconfig.pid};
			getUserInfo(function(userInfo){
				if (userInfo) {
					data=extend(data,{token: userInfo.uid});
				}
			});
			data=extend(data,extdata);
			wx.request({
				method:'GET',
				url: url,
				data: data,
				success: (res) => {
					typeof cb == "function" && cb(res.data,"");
					wx.hideNavigationBarLoading();
				},
				fail:(err) => {
					typeof cb == "function" && cb(null,err.errMsg);
					wx.hideNavigationBarLoading();
				}
			});
		} catch (e) {
		}
	});
};
function Post (url,extdata, cb ){
	if (url.substring(0, 4).toLowerCase()!='http') {
		url = config.HTTP_BASE_URL +url;
	}
	url = url.replace('http:', 'https:');
	getExtConfig(function(extconfig){
		try {
      var data = { appid: extconfig.appid, pid: extconfig.pid, shopid: extconfig.pid};
			getUserInfo(function(userInfo){
				if (userInfo) {
					data=extend(data,{token: userInfo.uid});
				}
			});
			data=extend(data,extdata);
			wx.request({
				method:'POST',
				url:  url,
				data: data,
				success: (res) => {
				if (res.statusCode==200){
					typeof cb == "function" && cb(res.data, "");
				} else {
					wx.showToast({
					  title: '网络请求失败',
					})
				}
					
				},
				fail:(err) => {
					typeof cb == "function" && cb(null,err.errMsg);
					console.log("http请求:"+config.HTTP_url);
					console.log(err)
				}
			});
		} catch (e) {
		}
	});
};

function Upload (url ,file ,data, cb ){
  if (url.substring(0, 4).toLowerCase()!='http') {
    url = config.HTTP_BASE_URL + url;
  }
  url = url.replace('http://', 'https://');
	wx.uploadFile({
		url:  url,
		filePath: file,
		name:"file",
		formData:data,
		success: (res) => {
			if( typeof(res.data)=="string"  ){
				typeof cb == "function" && cb( JSON.parse(res.data),"");
			}else{
				typeof cb == "function" && cb(res.data,"");	
			}
			
		},
		fail:(err) => {
			typeof cb == "function" && cb(null,err.errMsg);
		}
	});
};


module.exports ={
    httpGet:Get,
    httpPost:Post,
	getUserInfo:getUserInfo,
    getExtConfig:getExtConfig,
	httpUpload:Upload
};