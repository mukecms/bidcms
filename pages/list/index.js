var config = require('../../config.js')
var http = require('../../utils/httpHelper.js')
var util = require('../../utils/util.js')
//index.js
//获取应用实例
var app = getApp()
var sta = require("../../utils/statistics.js");
Page({
  data: {
    indicatorDots: false,//是否显示面板指示点
    autoplay: false,  //是否自动切换
    current:0,      //当前所在index
    interval: 0, //自动切换时间
    duration: 200,  //滑动时间
    catId:"0",
    goodsList:[],
    searchPageNum:0,
    callbackcount:5,
    orderBy:""
  },
  onShareAppMessage: function (res) {
    var that = this;
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
    var data = this.data.goods;
	var userInfo = wx.getStorageSync('userInfo');
    return {
      title: '[' + app.globalData.shopinfo + ']商品列表',
      path: '/pages/list/index?bid='+userInfo.uid,
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },
  goUrl:function(event){
    var url = event ? event.currentTarget.dataset.url : '';
	if(url.indexOf('/pages/list/index')>0){
		return false;
	}
    util.goUrl(url,this);
  },
  onLoad:function(options){
	if(options.bid){
	 wx.setStorageSync('bidcms_id', options.bid);
	}
	var keyword=options.keyword?options.keyword:'';
    this.setData({
		  searchKeyword:keyword
	});
    var shopInfo = wx.getStorageSync('shopInfo');
     wx.setNavigationBarColor({
      frontColor: '#' + (shopInfo.nav_color && shopInfo.nav_color != '' ? shopInfo.nav_color : '000000').toLowerCase(),
      backgroundColor: '#' + (shopInfo.nav_bgcolor && shopInfo.nav_bgcolor != '' ? shopInfo.nav_bgcolor : 'ffffff').toLowerCase(),
    })
	  this.getGoodsCate();
  },
  onReady () {
      var that = this;
      http.httpPost("?con=banner&act=getFooter" ,{},function(res){
      if(res.code == '200' && res.msg == 'success'){
        that.setData({footerNav:res.data});
      }
      });
  },
  onShow:function(){
        sta();
  },
  getGoodsCate:function(){
    var that = this;
    http.httpPost("?con=item&act=getCateList" ,{},function(res){
      if(res.code == '200' && res.msg == 'success'){
        var list = res.data;
        var goodsData = [{id:0,title:"全部"}];
        for(var i=1;i<list.length+1;i++){
          goodsData[i]= {id:list[i-1].id,title:list[i-1].title};
        }
        that.setData({goodsData:goodsData});
        that.fetchSearchList();
      }
    });
  },
  getGoodsList: function (param, pageindex, callbackcount, callback){
        var that = this;
        var page = this.data.page;
        var data = {
          page: pageindex, 
          page_size: callbackcount, 
        }
        if(param){
          data.title=param.keyword;
          data.order=param.order;
          data.cat_id=param.cat_id;
        }
        http.httpPost("?con=item&act=list" ,data,function(res){
          if(res.code == '200' && res.msg == 'success'){
            var list = res.data;
            typeof callback == "function" && callback(list)
          }
        });
  },
  //输入框事件，每输入一个字符，就会触发一次  
  bindKeywordInput: function (e) {
    this.setData({
      searchKeyword: e.detail.value,
      catId: 0,
      orderBy: ""
    })
  },
  getCate: function (event) {
    let cid = event ? event.currentTarget.dataset.id : "0";
    this.setData({
      isFromSearch: true,
      catId: cid,
      searchPageNum: 0,
      orderBy: "",
      searchKeyword:"",
      searchLoadingComplete: false //把“没有数据”设为false，隐藏  
    })
    this.fetchSearchList();
  },
  orderBy:function(event){
    let orderBy = event ? event.currentTarget.dataset.val : "";
    var norder=this.data.orderBy;
    if (orderBy.indexOf('price')>=0){
      if (norder == 'price_asc') {
        orderBy = 'price_desc';
      } else if (norder = "price_desc") {
        orderBy = 'price_asc';
      }
    }
    
    this.setData({
      isFromSearch: true,
      orderBy: orderBy,
      searchPageNum:0,
      searchLoadingComplete: false //把“没有数据”设为false，隐藏  
    })
    this.fetchSearchList();
  },
  loadMore:function(){
    var searchPageNum = this.data.searchPageNum;
    this.setData({
      isFromSearch: false,
      searchPageNum: searchPageNum+1
    })
    this.fetchSearchList();
  },
  //点击搜索按钮，触发事件  
  keywordSearch: function (e) {
    this.setData({
      searchPageNum: 0,   //第一次加载，设置1    
      isFromSearch: true,  //第一次加载，设置true  
      searchLoading: true,  //把"上拉加载"的变量设为true，显示  
      searchLoadingComplete: false //把“没有数据”设为false，隐藏  
    })
    this.fetchSearchList();
  },
  //搜索，访问网络  
  fetchSearchList: function () {
    let that = this;
    let searchKeyword = that.data.searchKeyword,//输入框字符串作为参数  
      searchPageNum = that.data.searchPageNum,//把第几次加载次数作为参数  
      callbackcount = that.data.callbackcount, //返回数据的个数  
      orderBy = that.data.orderBy,
      cateId = that.data.catId;
    //访问网络
    that.setData({
      loadingText: "正在加载..." 
    });
    var param = { "keyword": that.data.searchKeyword, "order": orderBy, "cat_id": cateId}
    this.getGoodsList(param, searchPageNum, callbackcount, function (data) {
      //判断是否有数据，有则取数据  
      if (data.length>0) {
        let searchList = [];

        //如果isFromSearch是true从data中取出数据，否则先从原来的数据继续添加  
        that.data.isFromSearch ? searchList = data : searchList = that.data.goodsList.concat(data)
        that.setData({
          goodsList: searchList, //获取数据数组  
          searchLoading: true,   //把"上拉加载"的变量设为true，显示  
          loadingText: "点击加载更多..."
        });
        //没有数据了，把“没有数据”显示，把“上拉加载”隐藏  
      } else {
		 wx.showToast({
			title: '暂无更多商品了',
			icon: 'success',
			duration: 1000
		  })
        that.setData({
          searchLoadingComplete: true, //把“没有数据”设为true，显示  
          searchLoading: false  //把"上拉加载"的变量设为false，隐藏  
        });
      }
    })
  }
})
