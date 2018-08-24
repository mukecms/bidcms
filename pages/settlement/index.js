
var http = require('../..//utils/httpHelper.js')
var util = require('../../utils/util.js')
var sta = require("../../utils/statistics.js");
var config = require('../../config.js')
//获取应用实例
var app = getApp()
Page({
  data: {
    allGoods:{},
    sumPrice:0,
    address:{},
    couponArray:[], //优惠券
    multiArray: ["快递","EMS","平邮","商家配送","自提"],
    objectArray: ["express", "ems", "surface","distribution","self"],
    objectCouponArray:[],
    pindex:0,
    cindex:0,
    couponIndex:0,
    shipping_type:'express',
    coupon:'0-0-0',
    postPrice:0
  },
  onLoad: function () {
	var that = this;
	
  },
  onShow:function (){
	  var that=this;
    sta();
    var allGoods =  wx.getStorageSync('shoppingcar');
    var sumPrice = 0;
    for(var i=0;i< allGoods.length;i++){
        var price = parseFloat(allGoods[i].price);
        var count =  allGoods[i].buycount;
        price = util.accMul(price,count);
        allGoods[i].pay = price;
		    allGoods[i].img='http:'+allGoods[i].img.replace('http:','').replace('https:','');
        sumPrice = util.accAdd(sumPrice,price);
    }
    this.setData({ allGoods:allGoods, sumPrice:sumPrice });
    this.getDefaultAddress();
    this.initExpress(0);
  },
  getDefaultAddress:function(){
      //获取地址
      var that = this;
      http.httpPost("?con=customer&act=getAddrInfo" ,{},function(res){
        if(res.code == '200' && res.msg == 'success'){
          that.setData({address:res.data,is_address:true});
        }
      });
  },
  payOrderSuccess:function(orderid,status,callback){
		var data = {
		  id:orderid,
		  status:status
		};
		http.httpPost("?con=order&act=updateOrder" ,data,function(res){
			if(res.code == '200' && res.msg == 'success'){
				//订单支付成功
				  typeof callback == "function" && callback(res.data)
			}else{
				//订单支付失败
				  typeof callback == "function" && callback('')
			}  
		})
  },
  toAddress:function(){
      wx.navigateTo({url: '/pages/address/index?type=select'})
  },
  addAddress:function(){
	   wx.navigateTo({url:"/pages/address/addto/index?id=0"})
  },
  settlement:function (){
    var that = this;
    //检查地址是否为空
    if(this.data.address == ""){
        wx.showModal({
            title: '提示',
            content: '请您先添加邮寄地址！',
            success: function(res) {
              if (res.confirm) {
                  that.toAddress();
              }
              return;
            }
        })
    }
    //继续生成订单
    var addressid = this.data.address.address_id;
    var allGoods = this.data.allGoods;
    var postIndex=this.data.cindex;
    var couponIndex=this.data.couponIndex;
    if(this.data.objectCouponArray.length>0){
      var coupon_info=this.data.objectCouponArray[couponIndex];
      var coupon=coupon_info.id+"-"+coupon_info.title+"-"+coupon_info.amount;
    }
    if(addressid>0){
      var data ={
        addressid:addressid,
        amount:that.data.sumPrice,
        payamount:that.data.sumPrice,
        goods:allGoods,
        post_fee: that.data.postPrice,
		shipping_type:this.data.objectArray[postIndex],
        coupon:coupon,
        message:that.data.message,
        bidcms_id:wx.getStorageSync('bidcms_id')
      };
      
      http.httpPost("?con=order&act=createOrder" ,data,function(res){
        if(res.code == '200' && res.msg == 'success'){
          //订单创建成功
          if(res.orderid != ''){
            try{
              wx.setStorageSync('shoppingcar','');
            }catch(e){
              console.log('清空购物车失败');
            }
            wx.showToast({
              title: '下单成功',
              icon: 'success',
              duration: 1000
            });
            wx.redirectTo({
              url: '/pages/order/detail/index?id=' + res.orderid 
            });
          }
        }else{
          //订单创建失败
          wx.showToast({
            title: res.msg,
            icon: 'none',
            duration: 1000
          });
        }  
      });
    } else {
      wx.showToast({
        title: '添加配送地址',
        icon: 'success',
        duration: 1000
      });
    }
  },
  bindTextAreaInput: function(e) {
    this.setData({message:e.detail.value})
  },
  bindCouponChange: function(e) {
    this.setData({
      couponIndex: e.detail.value
    })
  },
  initExpress(e){
    var that = this;
    let item_ids = [];
    let nums = [];
    let weights = [];
    let volumes = [];
    var allGoods = this.data.allGoods;
    for (let i = 0; i < allGoods.length; i++) {
      item_ids.push(allGoods[i].id);
      nums.push(allGoods[i].buycount);
    }
    http.httpPost('?con=order&act=freight', { item_ids: item_ids, nums: nums, weights: weights, volumes: volumes, express_type: this.data.objectArray[e] }, function (res) {
      if (res.code == '200') {
        that.setData({ postPrice: res.post_fee });
      }
    });
  },
  bindShippingChange: function (e) {
    this.initExpress(e.detail.value);
    this.setData({ cindex: e.detail.value });
  }
})
