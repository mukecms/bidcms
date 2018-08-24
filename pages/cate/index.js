var config = require('../../config.js')
var http = require('../../utils/httpHelper.js')
var util = require('../../utils/util.js')
var sta = require("../../utils/statistics.js");

var app = getApp()
Page({
  data: {
    logs: [],
    goodsH: 0,
    mechine: {},//被扫麻将机的信息
    catHighLightIndex: 0,//左侧列表高亮的下标
    scrollToGoodsView: 0,
    toView: '',
    toViewType: '',
    GOODVIEWID: 'catGood_',
    animation: true,
    goodsNumArr: [0],//记录了每个类型商品占用的高度
    shoppingCart: {},//购物车物品id映射数量
    shoppingCartGoodsId: [],//购物车里面的物品的id
    goodMap: {},//所有物品的列表
    chooseGoodArr: [],//购物车的物品列表
    totalNum: 0,//总数量
    totalPay: 0,//总价
    showShopCart: false,//购物列表是否展示
    fromClickScroll: false,//标记左侧的滚动来源，false是来自于本身的滚动，true是点击引导的滚动,
    timeStart: "",
    timeEnd: "",
    hideCount: true,
    count: 0,
    needAni: false,
    hide_good_box: true,
    url: ""//wx.getStorageSync('url')
  },
  onReady: function () {
    // Do something when page ready.
  },
  onShareAppMessage: function (res) {
    var that = this;
   
	var userInfo = wx.getStorageSync('userInfo');
    return {
      title: '[' + app.globalData.shopinfo + ']商品分类',
      path: '/pages/cate/index?bid='+userInfo.uid,
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },
  onLoad: function (options) {
	if(options.bid){
		wx.setStorageSync('bidcms_id', options.bid);
	}
    let systemInfo = wx.getStorageSync('systemInfo');
    let mechine = options;
    let _that = this;
    var shopInfo = wx.getStorageSync('shopInfo');
    wx.setNavigationBarColor({
      frontColor: '#' + (shopInfo.nav_color && shopInfo.nav_color != '' ? shopInfo.nav_color : '000000').toLowerCase(),
      backgroundColor: '#' + (shopInfo.nav_bgcolor && shopInfo.nav_bgcolor != '' ? shopInfo.nav_bgcolor : 'ffffff').toLowerCase(),
    })
    this.busPos = {};
    this.busPos['x'] = 45;//购物车的位置
    this.busPos['y'] = app.globalData.hh - 56;

    this.setData({
      mechine: mechine,
      systemInfo: systemInfo,
      goodsH: systemInfo.windowHeight - 245
    });
    http.httpPost("?con=goods&act=getCate", {}, function (res) {
      if (res.code == '200' && res.msg == 'success') {
      var goodMap=_that.data.goodMap;
      var goodsNumArr=_that.data.goodsNumArr;
      //存下项目下的产品个数
      for (let i = 0; i < res.data.length; i++) {
        goodsNumArr.push(res.data[i].goods.length);
        let goods = res.data[i].goods;
        if (goods.length > 0) {
          for (let j = 0; j < goods.length; j++) {
          goodMap[goods[j].id] = goods[j];
          }
        }
      }
      let HArr = [];
      for (let j = 0; j < goodsNumArr.length; j++) {
        if (j == 0) {
          HArr.push(0);
        } else {
          HArr.push(goodsNumArr[j] * 98 + HArr[j - 1]);
        }
      }
      //初始化右侧商品一开始滚动的位置
      _that.setData({
        toView: _that.GOODVIEWID + res.data[0].id,
        goodMap:goodMap,
        goodsNumArr:HArr,
        storeDetail:res.shop,
        goodslist:res.data
      });
      }
    });
  },
  goUrl: function (event) {
    var url = event ? event.currentTarget.dataset.url : '';
    if (url.indexOf('/pages/cate/index') > 0) {
      return false;
    }
    util.goUrl(url, this);
  },
  //右侧列表滚动事件
  goodsViewScrollFn: function (e) {
    //console.log(e)
    this.getIndexFromHArr(e.detail.scrollTop)
  },
  //传入滚动的值，去让右侧的类型也跟着变动
  getIndexFromHArr: function (value) {
    //找出滚动高度的区间，则找出展示中的商品是属于哪个类型
    for (var j = 0; j < this.data.goodsNumArr.length; j++) {
      if ((value >= this.data.goodsNumArr[j]) && (value < this.data.goodsNumArr[j + 1])) {
        //console.log(j+"bbb"+value + '####' + this.data.goodsNumArr[j])
        if (!this.data.fromClickScroll) {
          this.setData({
            catHighLightIndex: j
          });
        }
      }
    }
    this.setData({
      fromClickScroll: false
    });
  },
  //左侧列表点击事件
  catClickFn: function (e) {
    let that = this;
    let _index = e.target.id.split('_')[1];
    let goodListId = e.target.id.split('_')[2];

    // //左侧点击高亮
    this.setData({
      fromClickScroll: true
    });
    this.setData({
      catHighLightIndex: _index
    });
    //右侧滚动到相应的类型
    this.setData({
      toView: that.data.GOODVIEWID + goodListId
    });
  },
  //添加商品到购物车
  addGoodToCartFn: function (e) {
    let shoppingCart = JSON.parse(JSON.stringify(this.data.shoppingCart));
    let shoppingCartGoodsId = [];
    let _id = e.target.id.split('_')[1];
    let _index = -1;

    if (this.data.shoppingCartGoodsId.length > 0) {
      for (let i = 0; i < this.data.shoppingCartGoodsId.length; i++) {
        shoppingCartGoodsId.push(this.data.shoppingCartGoodsId[i])
        if (_id == this.data.shoppingCartGoodsId[i]) {
          _index = i;
        }
      }
    }

    if (_index > -1) {//已经存在购物车，只是数量变化
      shoppingCart[_id] = Number(shoppingCart[_id]) + 1;
    } else {//新增  
      shoppingCartGoodsId.push(_id);
      shoppingCart[_id] = 1;
    }

    this.setData({
      shoppingCart: shoppingCart,
      shoppingCartGoodsId: shoppingCartGoodsId
    });

    this._resetTotalNum();
  },
  touchOnGoods: function (e) {
    this.finger = {}; var topPoint = {};
    this.finger['x'] = e.touches["0"].clientX;//点击的位置
    this.finger['y'] = e.touches["0"].clientY;

    if (this.finger['y'] < this.busPos['y']) {
      topPoint['y'] = this.finger['y'] - 150;
    } else {
      topPoint['y'] = this.busPos['y'] - 150;
    }
    topPoint['x'] = Math.abs(this.finger['x'] - this.busPos['x']) / 2;

    if (this.finger['x'] > this.busPos['x']) {
      topPoint['x'] = (this.finger['x'] - this.busPos['x']) / 2 + this.busPos['x'];
    } else {
      topPoint['x'] = (this.busPos['x'] - this.finger['x']) / 2 + this.finger['x'];
    }

    //topPoint['x'] = this.busPos['x'] + 80
    //this.linePos = app.bezier([this.finger, topPoint, this.busPos], 30);
    this.linePos = util.bezier([this.busPos, topPoint, this.finger], 30);
    this.startAnimation(e);
  },
  startAnimation: function (e) {
    var index = 0, that = this, bezier_points = that.linePos['bezier_points'];
    this.setData({
      hide_good_box: false,
      bus_x: that.finger['x'],
      bus_y: that.finger['y']
    })
    var len = bezier_points.length;
    index = len
    this.timer = setInterval(function () {
      index--;
      that.setData({
        bus_x: bezier_points[index]['x'],
        bus_y: bezier_points[index]['y']
      })
      if (index < 1) {
        clearInterval(that.timer);
        that.addGoodToCartFn(e);
        that.setData({
          hide_good_box: true
        })
      }
    }, 22);
  },
  //移除商品的事件
  decreaseGoodToCartFn: function (e) {
    let shoppingCart = JSON.parse(JSON.stringify(this.data.shoppingCart));
    let shoppingCartGoodsId = [];
    let _id = e.target.id.split('_')[1];
    let _index = -1;

    if (this.data.shoppingCartGoodsId.length > 0) {
      for (let i = 0; i < this.data.shoppingCartGoodsId.length; i++) {
        shoppingCartGoodsId.push(this.data.shoppingCartGoodsId[i]);
        if (_id == this.data.shoppingCartGoodsId[i]) {
          _index = i;
        }
      }
    }

    if (_index > -1) {//已经存在购物车，只是数量变化
      shoppingCart[_id] = Number(shoppingCart[_id]) - 1;
      if (shoppingCart[_id] <= 0) {
        shoppingCartGoodsId.splice(_index, 1);
      }
    }

    this.setData({
      shoppingCart: shoppingCart,
      shoppingCartGoodsId: shoppingCartGoodsId
    });

    this._resetTotalNum();
  },
  //重新计算选择的商品的总数和总价
  _resetTotalNum: function () {
    var that=this;
    let shoppingCartGoodsId = this.data.shoppingCartGoodsId,
      totalNum = 0,
      totalPay = 0,
      chooseGoodArr = [];

    if (shoppingCartGoodsId) {
      http.getExtConfig(function (extconfig) {
        for (let i = 0; i < shoppingCartGoodsId.length; i++) {
          let goodNum = Number(that.data.shoppingCart[shoppingCartGoodsId[i]]);
          var mgoods = that.data.goodMap[shoppingCartGoodsId[i]];
          var goods = {
            appid: extconfig.appid,
            pid: extconfig.pid,
            id: mgoods.id,
            name: mgoods.title,
            img: mgoods.pic,
            maxcount: mgoods.quota,
            maxnum: mgoods.num,
            price: mgoods.price,
            buycount: goodNum,
            sku: {}
          };
          totalNum += Number(goodNum);
          totalPay += Number(mgoods.price) * goodNum;
          chooseGoodArr.push(goods);
        }
        try {
          wx.setStorageSync('shoppingcar', chooseGoodArr);
          that.setData({
            totalNum: totalNum,
            totalPay: totalPay.toFixed(2),
            chooseGoodArr: chooseGoodArr
          });
        } catch (m) {
          console.log('立即购买失败!');
        }
      });
    }

    
  },
  //购物列表切换隐藏或者现实
  showShopCartFn: function (e) {
    if (this.data.totalPay > 0) {
      this.setData({
        showShopCart: !this.data.showShopCart
      });
    }
  },
  //清空购物车
  clearShopCartFn: function (e) {
    wx.setStorageSync('shoppingcar', []);
    this.setData({
      shoppingCartGoodsId: [],
      totalNum: 0,
      totalPay: 0,
      chooseGoodArr: [],
      shoppingCart: {}
    });
  },
  //结算
  goPayFn: function (e) {
    wx.navigateTo({ url: '/pages/settlement/index' })
  }
})
