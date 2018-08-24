var config = require('../../../config.js')
var http = require('../../../utils/httpHelper.js')
//index.js
//获取应用实例
var app = getApp()
var sta = require("../../../utils/statistics.js");
Page({
  data: {
      address:'',
	  region: ['省', '市', '区/县']
  },
  //事件处理函数
  onLoad: function (options) {
    var that = this;
    
    //添加地址
    var id = options.id;
    //var openid = this.data.userInfo.openid;
    if(id != ''){
		 var data = {id:id};
		 http.httpPost("?con=customer&act=getAddrInfo" ,data,function(res){
			if(res.code == '200' && res.msg == 'success'){
				var address = res.data;
				that.setData({address:{id:id,name:address.name,address:address.address,tel:address.mobile},region:[address.province,address.city,address.area]})
			}
		 });
    }
  },
  onShow:function (){
      sta();
  },
  bindRegionChange: function (e) {
    this.setData({
      region: e.detail.value
    })
  },
  formSubmit: function (e){
	  var that=this;
      //提交表单
      wx.showToast({
        title: '加载中',
        icon: 'loading',
        duration: 1000
      });
      var val = e.detail.value;
      if(this.data.address != ''){
		  var data = {
			  id:that.data.address.id,
			  username:val.name, 
			  mobile:val.tel,
			  address:val.address,
			  region:that.data.region
		  }
          http.httpPost("?con=customer&act=addAddress" ,data,function(res){
                 if(res.code == '200' && res.msg == 'success'){
                        wx.navigateBack();
                        console.log("编辑地址成功");
                 }else{
                        //wx.navigateBack();
                        console.log("编辑地址失败");
                 }
          });
      }else{
		  var data = {
			username:val.name, 
			mobile:val.tel,
			address:val.address,
			region:that.data.region
		  };
          http.httpPost("?con=customer&act=addAddress" ,data,function(res){
			if(res.code == '200' && res.msg == 'success'){
				wx.navigateBack();
				console.log("添加地址成功");
			}else{
				//wx.navigateBack();
				console.log("添加地址失败");
			}
          });
      }
  },
  deleteAddress:function(){
     
      if((this.data.address!='')&& (this.data.address.id!='')){
            var id = this.data.address.id;
			var data = {id:id};
			http.httpPost("?con=customer&act=delAddress" ,data,function(res){
				if(res.code == '200' && res.msg == 'success'){
						wx.showToast({
							title: '删除地址成功！',
							icon: 'success',
							duration: 500
						})
						wx.navigateBack();
						console.log("删除地址成功");
				}else{
						//wx.navigateBack();
						console.log("删除地址失败");
				}
			});
      }else{
          console.log("删除地址失败");
      }
  }
})
