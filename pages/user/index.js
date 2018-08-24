//index.js
//获取应用实例
var app = getApp()
var sta = require("../../utils/statistics.js");
var http = require("../../utils/httpHelper.js");
var util = require("../../utils/util.js");
Page({
  data: {
	contents:{},
	isShow:1
  },
  onShow:function (){
    sta();
  },
  onLoad: function () {
    var that = this;
    var shopInfo = wx.getStorageSync('shopInfo');
    
    wx.setNavigationBarColor({
      frontColor: '#' + (shopInfo.nav_color && shopInfo.nav_color != '' ? shopInfo.nav_color : '000000').toLowerCase(),
      backgroundColor: '#' + (shopInfo.nav_bgcolor && shopInfo.nav_bgcolor != '' ? shopInfo.nav_bgcolor : 'ffffff').toLowerCase(),
    })
	http.getUserInfo(function(userinfo){
		that.setData({
		  userInfo: userinfo
		});
	});
	http.httpPost("?con=customer&act=index", {}, function (res) {
	  if (res.code == '200') {
		  wx.setNavigationBarTitle({
			title: res.data.page.title,
		  })
		  that.setData({
			pages: res.data
		  });
	  }
	});
	http.httpPost("?con=banner&act=getFooter" ,{},function(res){
		if(res.code == '200' && res.msg == 'success'){
		  that.setData({footerNav:res.data});
		}
	});
  },
  showTab:function(event){
	  var v=parseInt(event.currentTarget.dataset.val);
	  this.setData({
		  isShow:v
	  });
  },
  goUrl:function(event){
    var url = event ? event.currentTarget.dataset.url : '';
	if(url.indexOf('pages/user/index')>0){
		return false;
	}
    util.goUrl(url,this);
  },
  userdata:function (){
      wx.navigateTo({url: "/pages/userdata/index"})
  },
  address: function (){
      wx.navigateTo({url:"/pages/address/index"});
  },
  
  order:function (){
    //订单
    wx.navigateTo({url: "/pages/order/index"})
  },
  keep:function () {
    //收藏
  },
  share:function (){
    //分享
  }
})
