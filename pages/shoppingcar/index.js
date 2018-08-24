//logs.js
var util = require('../../utils/util.js')
var sta = require("../../utils/statistics.js");
Page({
  data: {
    allGoods:{},
    sumPrice:0
  },
  onLoad: function () {
    var shopInfo = wx.getStorageSync('shopInfo');
    
    wx.setNavigationBarColor({
      frontColor: '#' + (shopInfo.nav_color && shopInfo.nav_color != '' ? shopInfo.nav_color : '000000').toLowerCase(),
      backgroundColor: '#' + (shopInfo.nav_bgcolor && shopInfo.nav_bgcolor != '' ? shopInfo.nav_bgcolor : 'ffffff').toLowerCase(),
    })
  },
  onShow:function (){
    sta();
    this.showAllGoods();
  },
  settlement:function (){
    wx.navigateTo({url: '/pages/settlement/index'})
  },
  jia:function (e){
    this.jiaj(e,true);
  },
  jian:function (e){
    this.jiaj(e,false);
  },
  showAllGoods:function (){

    var allGoods =  wx.getStorageSync('shoppingcar');
    var sumPrice = 0;
    for(var i=0;i< allGoods.length;i++){
		allGoods[i].img='http:'+allGoods[i].img.replace('http:','').replace('https:','');
        var price = parseFloat(allGoods[i].price);
        var count =  allGoods[i].buycount;
        price = util.accMul(price,count);
        sumPrice = util.accAdd(sumPrice,price);
    }

    this.setData({
      allGoods:allGoods,
      sumPrice:sumPrice
    });
  },
  toDetail:function(e){
      var id = e.currentTarget.dataset.id;
        wx.redirectTo({
          url: '../detail/index?id='+id}
        )
  },
  jiaj:function (e,boo){
    var id = e.currentTarget.dataset.id;
    var allGoods = this.data.allGoods;
    for(var i=0;i<allGoods.length;i++){
        if(allGoods[i].id==id){
            if(boo){
              var maxcount = allGoods[i].maxcount > 0 && allGoods[i].maxcount < allGoods[i].maxnum ? allGoods[i].maxcount : allGoods[i].maxnum; 
              if (allGoods[i].buycount >= maxcount) {
                wx.showToast({
                  title: '超出最大购买量',
                })
                return;
              } else {
                allGoods[i].buycount = allGoods[i].buycount + 1;
              }
            }else{
                if (allGoods[i].buycount<=1){
                  allGoods.splice(i, 1);
                } else {
                  allGoods[i].buycount = allGoods[i].buycount - 1;
                }
            }
            break;
          }
    }
    wx.setStorageSync('shoppingcar', allGoods);
    this.setData({
      allGoods:allGoods
    });
    this.showAllGoods();
  }
})
