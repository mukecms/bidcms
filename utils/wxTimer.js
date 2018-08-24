/**
 * author: limengqi (Bidcms)
 * organization: Bidcms(Bidcms开源电商)(http://bidcms.com)
 * 
 * for: 微信小程序倒计时
 */
var wxTimer = function (initObj){
	initObj = initObj || {};
	this.interval = initObj.interval || 0;				//间隔时间
	this.complete = initObj.complete;					//结束任务
	this.intervalFn = initObj.intervalFn;				//间隔任务
	this.name = initObj.name;							//当前计时器在计时器数组对象中的名字

	this.intervarID;									//计时ID
  this.endTime = initObj.endTime;										//结束时间
}
function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

wxTimer.prototype = {
	//开始
	start:function(self){
      var that = this;
      //开始倒计时
	    var count = 0;//这个count在这里应该是表示s数，js中获得时间是ms，所以下面*1000都换成ms
      function begin(){
        if (that.endTime && new Date(that.endTime)!="Invalid Date"){
          var leftTime = (new Date(that.endTime)) - (new Date()); //计算剩余的毫秒数 
          var days = parseInt(leftTime / 1000 / 60 / 60 / 24, 10); //计算剩余的天数 
          var hours = parseInt(leftTime / 1000 / 60 / 60 % 24, 10); //计算剩余的小时 
          var minutes = parseInt(leftTime / 1000 / 60 % 60, 10);//计算剩余的分钟 
          var seconds = parseInt(leftTime / 1000 % 60, 10);//计算剩余的秒数 
          days = formatNumber(days);
          hours = formatNumber(hours);
          minutes = formatNumber(minutes);
          seconds = formatNumber(seconds);
          var c = { "days": days, "hours": hours, "minutes": minutes, "seconds": seconds };

          var wxTimerList = self.data.wxTimerList;
          //更新计时器数组
          wxTimerList[that.name] = c;

          self.setData({
            wxTimerList: wxTimerList
          });
          //时间间隔执行函数
          if (0 == (count - 1) % that.interval && that.intervalFn) {
            that.intervalFn();
          }
          //结束执行函数
          if (leftTime <= 0) {
            if (that.complete) {
              that.complete();
            }
            that.stop();
          }
          that.intervarID = setTimeout(function () { begin(); }, 1000);
        }
        
      }
      begin();
	},
	//结束
	stop:function(){
		clearInterval(this.intervarID);
	},
	//校准
	calibration:function(){
		this.endTime = this.endSystemTime - Date.now();
	}
}

module.exports = wxTimer;