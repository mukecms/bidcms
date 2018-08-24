var config = require('../../config.js')
var http = require('../..//utils/httpHelper.js')
//index.js
//获取应用实例
var app = getApp()
var sta = require("../../utils/statistics.js");
Page({
  data: {
    allAddress: [],//地址列表
	urltype:""
  },
  onLoad: function (options) {
    var that = this;
    var shopInfo = wx.getStorageSync('shopInfo');
     wx.setNavigationBarColor({
      frontColor: '#' + (shopInfo.nav_color && shopInfo.nav_color != '' ? shopInfo.nav_color : '000000').toLowerCase(),
      backgroundColor: '#' + (shopInfo.nav_bgcolor && shopInfo.nav_bgcolor != '' ? shopInfo.nav_bgcolor : 'ffffff').toLowerCase(),
    })
	  this.setData({urltype:options.type});
  },
  onShow:function(){
      sta();
      this.getAllAddressList();
      
  },
  getAllAddressList:function(){
        var that = this;
        http.httpPost("?con=customer&act=getAddrList" ,{},function(res){
          if(res.code == '200' && res.msg == 'success'){
            that.setData({allAddress:res.data.list});
          }
        });
  },
  radioChange:function(e){
      var id = e.detail.value;
      var that=this;
	  var data = {id:id,isfirst:1}
	  http.httpPost("?con=customer&act=editAddress" ,data,function(res){
		 if(res.code == '200' && res.msg == 'success'){
			 console.log(that.data.urltype);
			 if(that.data.urltype=="select"){
				wx.navigateBack();
			 }
			 console.log("设置默认地址成功");
		 }else{
			 console.log("设置默认地址失败");
		 }
	  });
  },
  addrss:function (e){
        wx.navigateTo({url:"/pages/address/addto/index?id="})
  },
  addto:function (e){
        var id = e.currentTarget.dataset.id;
        console.log(id);
        wx.navigateTo({url:"/pages/address/addto/index?id="+id})
  }
})
