var config = require("../config.js");
var http = require('httpHelper.js'); 

var setUv = function (data){
    var url = "?con=customer&act=writeLog"
    http.httpGet(url,data,function(req){
        console.log(req);
		wx.setStorageSync('sessionid',req.data.data.sessionid);
    });
}


function statistics(date) {
	var timestamp=new Date().getTime();
    var time = Math.round(new Date().getTime()/1000);
    var gettime = wx.getStorageSync('statiTime');
    var sessionid = wx.getStorageSync('sessionid');
    if(sessionid){
		//过时则执行
        if(!gettime || time > gettime){
			setUv({sessionid:sessionid,uv:1});
            wx.setStorageSync('statiTime',time + 86400);
        }
	}else {
        //初始化
		setUv({award:1,share:1,uv:1,pv:1,ext1:1,ext2:1,ext3:1,ext4:1,});
	}
}




module.exports = statistics;