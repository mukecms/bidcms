//index.js
var config = require('../../../config.js')
var http = require('../../../utils/httpHelper.js')
var util = require('../../../utils/util.js')
var sta = require("../../../utils/statistics.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderList:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that=this;
    if(options && options.id){
      var data={id:options.id};
      http.httpPost("?con=order&act=getOrderDetail" ,data,function(res){
        if(res.code == '200' && res.msg == 'success'){
          var orderList = res.data;
          that.setData({orderList:orderList});
        }
      });
    }
  },
  goPhone: function (event) {
    var phone = event.currentTarget.dataset.phone;
    util.goPhone(phone);
  },
  goUrl: function (event) {
    var url = event ? event.currentTarget.dataset.url : '';
    util.goUrl(url);
  },
  pay:function(e){
    var that=this;
	   //此处写支付
    var orderid = parseInt(e.currentTarget.id);
	   //获取订单信息
		http.httpPost('?con=order&act=getOrderInfo',{type: 'WXAPP',pay_type: 'order',id:orderid},function(res){
      var data = { type: 'WXAPP', notify_url: res.notify_url, info: res };
			http.httpPost(config.HTTP_WXAPP_URL+"?con=pay&act=wxpay" ,data,function(params){
				if(params.code==1){
				   var json=params.data;
				   json.success=function(res){
					   wx.showToast({
							title: '支付成功',
							icon: 'success',
							duration: 1000
						});
             that.updateOrderInfo(orderid,1);
				   }
				   json.fail=function(res){
						wx.showModal({
							title: '错误提示',
							content: '支付失败',
							success: function(res) {
							  return;
							}
						})
				   }
				   wx.requestPayment(json);
				} else {
					wx.showModal({
						title: '错误提示',
						content: params.msg,
						success: function(res) {
						  return;
						}
					})
				}
			});
		});
       
  },
  confirmOrder: function (e) {
    let that = this;
    var orderid = parseInt(e.currentTarget.id);
    if (orderid > 0) {
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
  cancelOrder: function (e) {
    let that = this;
    var orderid = parseInt(e.currentTarget.id);
    if (orderid > 0) {
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
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})