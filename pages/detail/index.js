//index.js
var config = require('../../config.js')
var http = require('../../utils/httpHelper.js')
var sta = require("../../utils/statistics.js");
var util = require("../../utils/util.js");
var WxParse = require('../../wxParse/wxParse.js');
//获取应用实例
var app = getApp();

Page({
  data: {
		indicatorDots: true,//是否显示面板指示点
		autoplay: true,  //是否自动切换
		interval: 5000, //自动切换时间
		duration: 1000,  //滑动时间
		buyNum:1,
		wxTimerList: {},
		wxParseData: {},
		selectedText:"颜色",
		index:0,
		goods_arr: [],
		goods_sku: [],
		price:0,
		original_price:0,
		comments:[],
		goods_id:0,
		page:0,
		loadMore:"查看更多...",
		income:0
    },
  onLoad:function(options){
	if(options.bid){
		wx.setStorageSync('bidcms_id', options.bid);
	}
    if (options.id>0){
      this.setData({
        goods_id: options.id
      });
	  this.getGoodsInfo();
      this.getComment();
    }
  },
	onShareAppMessage: function (res) {
		var that = this;
		if (res.from === 'button') {
		  // 来自页面内转发按钮
		  console.log(res.target)
		}
		var data=this.data.goods;
		var userInfo = wx.getStorageSync('userInfo');
		return {
		  title: data.title,
		  path: '/pages/detail/index?id='+data.id+'&bid='+userInfo.uid,
		  imageUrl:data.pictures[0],
		  success: function(res) {
			// 转发成功
			console.log(res);
		  },
		  fail: function(res) {
			// 转发失败
		  }
		}
	},
    onShow:function (){
      sta();
	  
    },
    goUrl:function(event){
      var url = config.HTTP_API_URL+'store/m.php'+event.currentTarget.dataset.url;
      wx.navigateTo({
        url: '/pages/web/web?url=' + encodeURIComponent(url),
      })
    },
    showIncome:function(event){
	  var money = event.currentTarget.dataset.val;
      this.setData({
		  income:parseFloat(money/100).toFixed(2)
	  });
	},
	closeIncome:function(event){
      this.setData({
		  income:0
	  });
	},
	
    goPhone: function (event) {
      var phone = event.currentTarget.dataset.phone;
      util.goPhone(phone);
    },
    getComment:function(){
      var that = this;
      var page = this.data.page;
      var data = { id: this.data.goods_id,page:this.data.page }
      http.httpPost("?con=item&act=getComment", data, function (res) {
        if (res.code == '200' && res.msg == 'success') {
          var len = res.data.length;
          var newDate = new Date();
          for (var i = 0; i < len;i++){
            newDate.setTime(res.data[i].updatetime * 1000);
            res.data[i].updatetime = newDate.getFullYear() + "-" + newDate.getMonth()+"-"+newDate.getDate()+" "+newDate.getHours()+":"+newDate.getMinutes();
            res.data[i].imglist = res.data[i].imglist!=""?res.data[i].imglist.split(','):[];
          }
          that.setData({
            comments:res.data,
            page: parseInt(page)+1,
            loadMore: len < 10?"没有更多内容了":"查看更多..."
          });
        }
      });
    },
    getGoodsInfo:function(){
        var that = this;
        var data = {id:this.data.goods_id}
        var shopInfo = wx.getStorageSync('shopInfo');
        wx.setNavigationBarColor({
          frontColor: '#' + (shopInfo.nav_color && shopInfo.nav_color != '' ? shopInfo.nav_color : '000000').toLowerCase(),
          backgroundColor: '#' + (shopInfo.nav_bgcolor && shopInfo.nav_bgcolor != '' ? shopInfo.nav_bgcolor : 'ffffff').toLowerCase(),
        })
        http.httpPost("?con=goods&act=getGoodsInfo" ,data,function(res){
          if(res.code == '200' && res.msg == 'success'){
            var goods = res.data;
            wx.setNavigationBarTitle({
              title: goods.title,
            })
            var skus=goods.skus;
            var sku_arr=that.data.goods_arr;
            for(var i in skus){
              sku_arr.push(skus[i].name+"("+skus[i].price+")");
            }
            that.setData({
              goods:goods,
              goods_sku:skus,
              goods_arr:sku_arr,
              price:goods.price,
              original_price:goods.original_price
            });
          }
        });
    },
    buyCount:function(e){
        var id = e.currentTarget.id;
        var mgoods = this.data.goods;
        var maxCount =0;
        
        var count = this.data.buyNum;
        if(id == "add"){
            var maxCount = mgoods.quota > 0 ? mgoods.quota : 1;
            count = count + 1;
            if (mgoods.num < count) {
              wx.showToast({
                title: '库存不足',
              })
              return false;
            }
            if(count<=maxCount){
              this.setData({buyNum:count});
            }
        }else{
            count = (count>0)?count-1:0;
            if(count>0){
              this.setData({buyNum:count});
            }
        }
    },
    previewImg:function(e){
      var src = e.currentTarget.dataset.src;//获取data-src
      var imgList = e.currentTarget.dataset.list;//获取data-list
      //图片预览
      wx.previewImage({
        current: src, // 当前显示图片的http链接
        urls: imgList // 需要预览的图片http链接列表
      })
    },
    buyNow:function(e){
      var that=this;
      var id = e.currentTarget.id;
      var count = this.data.buyNum;
      count = count > 0 ? count : 1;
      var mgoods = this.data.goods;
      if(mgoods.num<count){
        wx.showToast({
          title: '超出最大购买量',
        })
        return false;
      }
      var goods_sku=this.data.goods_sku;
      var sku_index=this.data.index;
	  http.getExtConfig(function(extconfig){
		  var goods = {
			  appid: extconfig.appid, 
			  pid: extconfig.pid,
			  id:mgoods.id,
			  name:mgoods.title,
			  img:mgoods.thumb,
			  maxcount: mgoods.quota,
			  maxnum: mgoods.num,
			  price:that.data.price,
			  buycount:count,
			  sku:goods_sku[sku_index]
		  };
		  try{
			  var allGoods =wx.getStorageSync('shoppingcar')
			  if(allGoods == ""){
				  allGoods = []
			  }
			  //检查购物车是否有此商品
			  for(var i=0;i<allGoods.length;i++){
				  var temp = allGoods[i];
				  if(temp.id == goods.id){
					  allGoods.splice(i, 1);
					  break;
				  }
			  }
			  allGoods.push(goods);
			  wx.setStorageSync('shoppingcar', allGoods);
			  if(id=='addCar'){
				wx.showToast({
				  title: '加入购物车成功',
				})
			  } else {
				wx.navigateTo({ url: '/pages/shoppingcar/index' });
			  }
		  } catch(m){
				console.log('立即购买失败!');
		  }
	  });
    },
    bindPickerChange: function(e) {
		var goods_sku=this.data.goods_sku;
		this.setData({
		  index: e.detail.value,
		  price:goods_sku[e.detail.value].price,
		  original_price:goods_sku[e.detail.value].oprice
		})
	},
})