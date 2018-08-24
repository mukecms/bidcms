var config = require('config.js')
var http = require('./utils/httpHelper.js')
var util = require('./utils/util.js')
var WxParse = require('./wxParse/wxParse.js'); 
//app.js
App({
  globalData:{
    userInfo:null,
    title:"",
    shopInfo:{},
    pos:{}
  },
  onLaunch: function () {
    //调用API从本地缓存中获取数据
    var that = this;
    wx.getSystemInfo({//  获取页面的有关信息
      success: function (res) {
        wx.setStorageSync('systemInfo', res)
        var ww = res.windowWidth;
        var hh = res.windowHeight;
        that.globalData.ww = ww;
        that.globalData.hh = hh;
      }
    });
    
    var shopInfo = wx.getStorageSync('shopInfo');
    if (!shopInfo || shopInfo==null){
      http.httpPost('?act=shop_setting', {}, function (res) {
        shopInfo=res.data;
        wx.setStorageSync('shopInfo', res.data);
      });
    }
	if(shopInfo.site_title){
		wx.setNavigationBarTitle({
		  title: shopInfo.site_title,
		}) 
	}
  },
  userLogin: function (userData,that){
    try {
      var userInfo = wx.getStorageSync('userInfo');
      if(!userInfo.uid || userInfo.uid==''){
        //调用登录接口
        wx.login({
          success: function (res) {
            if (res.code) {
              userInfo = userData.detail.userInfo;
              //发起网络请求
              http.httpPost(config.HTTP_WXAPP_URL + "?con=customer&act=wxlogin", { code: res.code, channel: 1, wxuser: userData.detail.encryptedData, iv: userData.detail.iv }, function (ures) {
                if (ures.errcode == '0') {
                  userInfo.uid = ures.data.token;
                  try {
                    wx.getLocation({
                      type: 'wgs84',
                      success: (res) => {
                        userInfo.pos = res;
                      }
                    });
                    wx.setStorageSync('userInfo', userInfo);
                    that.setData({
                      userInfo: userInfo
                    });
                  } catch (e) {
                  }
                } else {
                  wx.showToast({
                    title: ures.errmsg,
                    icon: 'success',
                    duration: 1000
                  });
                }
              }
              );

            } else {
              console.log('获取用户登录态失败！' + res.errMsg)
            }
          },
          fail: function (e) {
            console.log(e);
          }
        });
      }
    } catch (e) {
      console.log(e);
    }
  }
})