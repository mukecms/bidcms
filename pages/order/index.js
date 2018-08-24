//index.js
var config = require('../../config.js')
var http = require('../../utils/httpHelper.js')
var util = require('../../utils/util.js')
var sta = require("../../utils/statistics.js");
//获取应用实例
var app = getApp()
Page({
  data: {
    orderList:[],
	orderParam:{}
 },
 onLoad: function (options) {
    var orderParam=this.data.orderParam;
	if(options.type){
		orderParam.type=options.type;
	}
	if(options.status){
		orderParam.status=options.status;
	} else {
		orderParam.status='all';
	}
	this.setData({
		orderParam:orderParam
	});
	this.getlist();
  },
  onShow:function(){
    sta();
    
  },
  goUrl:function(event){
    var url = event ? event.currentTarget.dataset.url : '';
    util.goUrl(url,this);
  },
  getlist:function(){
    var that = this;
	var data=this.data.orderParam;
	http.httpPost("?con=order&act=getOrderList" ,data,function(res){
		if(res.code == '200' && res.msg == 'success'){
			 var orderList = res.data;
			 let orderTab=res.tab;
			 that.setData({orderList:orderList});
			 that.setData({orderTab:orderTab});
		}
	});
  },
  filterOrder:function(e){
	  var params = e.currentTarget.dataset.params.split('&');
	  var orderParam={};
	  for(var p in params){
		  var t=params[p].split('=');
		  orderParam[t[0]]=t[1];
	  }
	  var index = e.currentTarget.dataset.index;

	  this.setData({
		  current:index,
		  orderParam:orderParam
	  });
	  this.getlist();
  },
  pay:function(e){
    var that=this;
	   //此处写支付
    var orderid = parseInt(e.currentTarget.id);
    if (orderid>0){
      //获取订单信息
      http.httpPost('?con=order&act=getOrderInfo', { type: 'WXAPP', pay_type: 'order', id: orderid }, function (res) {
        var data = { type: 'WXAPP', notify_url: res.notify_url, info: res };
        http.httpPost(config.HTTP_WXAPP_URL + "?con=pay&act=wxpay", data, function (params) {
          if (params.code == 1) {
            var json = params.data;
            json.success = function (res) {
              wx.showToast({
                title: '支付成功',
                icon: 'success',
                duration: 1000
              });
              that.updateOrderInfo(orderid, 1);
            }
            json.fail = function (res) {
              wx.showModal({
                title: '错误提示',
                content: '支付失败',
                success: function (res) {
                  return;
                }
              })
            }
            wx.requestPayment(json);
          } else {
            wx.showModal({
              title: '错误提示',
              content: params.msg,
              success: function (res) {
                return;
              }
            })
          }
        });
      });
    }
	  
       
  },
  confirmOrder: function (e) {
    let that = this;
    var orderid = parseInt(e.currentTarget.id);
    if(orderid>0){
      wx.showModal({
        title: '确认收货',
        content: '确认已经收到货物？',
        success: function (data) {
          if (data.confirm) {
            wx.showToast({
              title: '正在确认订单...',
              icon: 'loading',
              duration: 1000
            })
            //确认订单
            that.updateOrderInfo(orderid, 3);
          }
        }
      })
    }
    
  },
  cancelOrder:function (e){
    let that=this;
    var orderid = parseInt(e.currentTarget.id);
    if(orderid>0){
      wx.showModal({
        title: '取消订单',
        content: '确认取消订单？',
        success: function (data) {
          if (data.confirm) {
            wx.showToast({
              title: '正在取消订单...',
              icon: 'loading',
              duration: 1000
            })
            //取消订单
            that.updateOrderInfo(orderid, -1);
          }
        }
      })
    }
    
  },
  updateOrderInfo: function (orderid, status) {
    let that = this;
    let data = { status: status, id: orderid }
    if (status != 1) {
      http.httpPost("?con=order&act=updateOrder", data, function (res) {
        if (res.code == '200' && res.msg == 'success') {
          let text = '';
          if (status == -1) {
            text = '订单已取消';
          } else if (status == 3) {
            text = '订单确认收货';
          }
          wx.showToast({
            title: text,
            icon: 'loading',
            duration: 1000
          })
        }
      });
    }
    var orderList = that.data.orderList;
    for (var i in orderList) {
      if (orderList[i].id == orderid) {
        orderList[i].order_status = status;
        break;
      }
    }
    that.setData({ orderList: orderList });
  }
})
