var config = require('../../config.js')
//index.js
//获取应用实例
var app = getApp()
var sta = require("../../utils/statistics.js");
var timer = require('../../utils/wxTimer.js');
var http = require('../../utils/httpHelper.js'); 
var util = require('../../utils/util.js'); 
var WxParse = require('../../wxParse/wxParse.js'); 

Page({
  data: {
    topScroll:[],
    footerNav:[],
    bannerIcon:[],
    pageIndex:1,
    pageSize:10,
    loading: true,
    loadtitle:"Bidcms正在努力为你加载更多...",
    hasMore:true,
    guessProducts:[],
    title:"首页",
    wxTimerList:{},
    wxParseData:{},
    searchKeyword:"",
    currentIndex:0,
    userInfo:{}
  }, 
  onShareAppMessage: function (res) {
    var title = this.data.title;
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
	var userInfo = wx.getStorageSync('userInfo');
    return {
      title: title,
      path: 'pages/index/index?bid='+userInfo.uid
    }
  },
  //事件处理函数
  onLoad: function (options) {
    var that=this;
    
    if(options.bid){
      wx.setStorageSync('bidcms_id', options.bid);
    }
    http.getUserInfo(function (userinfo) {
      that.setData({
        userInfo: userinfo
      });
  });
	var shopInfo = wx.getStorageSync('shopInfo');
    var url = "";
	  
	  if (options.id>0){
		url='?id='+options.id;
	  } else {
		http.httpPost("?con=banner&act=getFooter" ,{},function(res){
		  if(res.code == '200' && res.msg == 'success'){
			that.setData({footerNav:res.data,footerType:res.style});
		  }
		});
	  }
	  http.httpPost(url, {}, function (res) {
		  if (res.code == '200' && res.msg == 'success') {
			var len = res.data.LModules.length;
			for (var i = 0; i < len; i++) {
			  var id = res.data.LModules[i].id;
			  if (res.data.LModules[i].type == 20) {
				var endtime = res.data.LModules[i].content.act_end_time.replace('T', ' ');
				//开启第一个定时器
				var wxTimer = new timer({
				  endTime: endtime,
				  name: id,
				  complete: function () {
				  console.log("完成了")
				  }
				})
				wxTimer.start(that);
			  }
			  if (res.data.LModules[i].type == 18 || res.data.LModules[i].type == 1) {
			  var html = util.htmlDecode(res.data.LModules[i].content.fulltext);
			  WxParse.wxParse(id, 'html', html, that, 0)
			  }
			}
			wx.setNavigationBarColor({
			  frontColor: '#' + (shopInfo.nav_color && shopInfo.nav_color != '' ? shopInfo.nav_color : '000000').toLowerCase(),
			  backgroundColor: '#' + (shopInfo.nav_bgcolor && shopInfo.nav_bgcolor != '' ? shopInfo.nav_bgcolor : 'ffffff').toLowerCase(),
			})
			var title = res.data.page.title;
			wx.setNavigationBarTitle({
			  title: title,
			})
			that.setData({
			  pages: res.data,
			  title: title
			});
		  }
	  });
  },
  goUrl:function(event){
    var url = event ? event.currentTarget.dataset.url : '';
    if(url=='?con=index&act=index&wxapp=/pages/index/index'){
      return false;
    }
    util.goUrl(url,this);
  },
  goPhone:function(event){
	var phone = event ? event.currentTarget.dataset.phone : '15503640042';
    util.goPhone(phone);
  },
  //输入框事件，每输入一个字符，就会触发一次  
  bindKeywordInput: function (e) {
    console.log("输入框事件")
    this.setData({
      searchKeyword: e.detail.value
    })
  },
  getUser:function(userData){
		var that=this;
		app.userLogin(userData,this);
  },
  //点击搜索按钮，触发事件  
  keywordSearch: function (e) {
	var searchKeyword=this.data.searchKeyword;
    wx.navigateTo({
      url: "/pages/list/index?keyword=" + searchKeyword,
    });
  },
  onReady (options) {
    var that = this;
	
  },
  onShow () {
  },
  getTab(e){
	this.setData({currentIndex:e.currentTarget.dataset.id});
  }
})