var config = require('../../config.js')
//index.js
//获取应用实例
var app = getApp()
var sta = require("../../utils/statistics.js");
var http = require('../../utils/httpHelper.js');
var util = require('../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderid:0,
    amount:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if(options && options.id){
      this.setData({
        orderid:options.id
      });
    }
  },
  changAmount: function (event){
    var amount = event ? event.detail.value : 0;
    this.setData({
      amount:amount
    });
  },
  pay:function(){
    //获取订单信息
    var orderid=this.data.orderid;
    http.httpPost(config.HTTP_API_URL+'plugins/offlinepay/index.php?act=getPayInfo', { type: 'WXAPP', pay_type: 'order', id: orderid,amount:this.data.amount }, function (res) {
      var data = { type: 'WXAPP', notify_url: res.notify_url, info: res.info };
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