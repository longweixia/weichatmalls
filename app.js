//app.js
App({
  // onLaunch时请求各个接口，当小程序初始化完成时，会触发 onLaunch（全局只触发一次）
  onLaunch: function () {
    // 而var that=this之后，that没改变之前仍然是指向当时的this
    var that = this;
    // 判断是否登录
    let token = wx.getStorageSync('token');
    if (!token){
      // 跳到用户授权页面
      that.goLoginPageTimeOut()
      return
    }
    wx.request({
      url: 'https://api.it120.cc/' + that.globalData.subDomain + '/user/check-token',
      data: {
        token: token
      },
      success: function (res) {
        // 请求失败时，清除token重新跳转到用户授权页面去获取token 
        if (res.data.code != 0) {
          // removeStorageSync从本地缓存中同步移除指定 key，即token
          wx.removeStorageSync('token')
           // 跳到用户授权页面
          that.goLoginPageTimeOut()
        }
      }
    })
    //  获取商城名称    系统参数设置接口
    wx.request({
      url: 'https://api.it120.cc/'+ that.globalData.subDomain +'/config/get-value',
      data: {
        // 获取商城的名字
        key: 'mallName'
      },
      success: function(res) {
        if (res.data.code == 0) {
          wx.setStorageSync('mallName', res.data.data.value);
        }
      }
    })
    //  积分规则接口
    wx.request({
      url: 'https://api.it120.cc/' + that.globalData.subDomain + '/score/send/rule',
      data: {
        code: 'goodReputation'
      },
      success: function (res) {
        if (res.data.code == 0) {
          that.globalData.order_reputation_score = res.data.data[0].score;
        }
      }
    })
    // 系统参数设置接口
    wx.request({
      url: 'https://api.it120.cc/' + that.globalData.subDomain + '/config/get-value',
      data: {
        key: 'recharge_amount_min'
      },
      success: function (res) {
        if (res.data.code == 0) {
          that.globalData.recharge_amount_min = res.data.data.value;
        }
      }
    })
    // 获取砍价设置
    wx.request({
      url: 'https://api.it120.cc/' + that.globalData.subDomain + '/shop/goods/kanjia/list',
      data: {},
      success: function (res) {
        if (res.data.code == 0) {
          // result返回的所有的数据集合，然后往全局对象globalData里面添加一个kanjiaList属性
          that.globalData.kanjiaList = res.data.data.result;
        }
      }
    })
  },
  //  onLaunch结束后，提交信息给接口   模板消息接口/小程序、服务号模板消息发送接口
  sendTempleMsg: function (orderId, trigger, template_id, form_id, page, postJsonString){
    var that = this;
    wx.request({
      url: 'https://api.it120.cc/' + that.globalData.subDomain + '/template-msg/put',
      method:'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        token: wx.getStorageSync('token'),  //登录接口返回的登录凭证
        type: 0,   //0 小程序 1 服务号
        module: 'order',  //所属模块：immediately 立即发送模板消息；order 所属订单模块
        business_id: orderId,   //module不为immediately时必填，代表对应的【订单】数字编号
        trigger: trigger,   //module不为immediately时必填，代表对应的【订单】触发的状态
        template_id: template_id,  //模板消息ID
        form_id: form_id,   //type=0时必填，表单提交场景下，为 submit 事件带上的 formId；
                             //支付场景下，为本次支付的 prepay_id
        url: page,     //小程序：点击模板卡片后的跳转页面，仅限本小程序内的页面。支持带参数,
                       //（示例index?foo= bar）；服务号：跳转的网页地址
        postJsonString: postJsonString    //模板消息内容
      },
      success: (res) => {
        //console.log('*********************');
        //console.log(res.data);
        //console.log('*********************');
      }
    })
  },
  sendTempleMsgImmediately: function (template_id, form_id, page, postJsonString) {
    var that = this;
    wx.request({
      url: 'https://api.it120.cc/' + that.globalData.subDomain + '/template-msg/put',
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        token: wx.getStorageSync('token'),
        type: 0,
        module: 'immediately',    //所属模块：immediately 立即发送模板消息
        template_id: template_id,
        form_id: form_id,
        url: page,
        postJsonString: postJsonString
      },
      success: (res) => {
        console.log(res.data);
      }
    })
  },  
  // 跳转到获取用户信息，需要用户同意授权页面
  goLoginPageTimeOut: function () {
    setTimeout(function(){
      wx.navigateTo({
        url: "/pages/authorize/index"
      })
    }, 1000)    
  },
  // 全局对象
  globalData:{
    userInfo:null,
    subDomain: "longwei", // 如果你的域名是： https://api.it120.cc/abcd 那么这里只要填写 abcd
    version: "2.0",
    shareProfile: '柠檬美食，承接你的清凉夏日' // 首页转发的时候话术
  }
  /*
  根据自己需要修改下单时候的模板消息内容设置，可增加关闭订单、收货时候模板消息提醒；
  1、/pages/to-pay-order/index.js 中已添加关闭订单、商家发货后提醒消费者；
  2、/pages/order-details/index.js 中已添加用户确认收货后提供用户参与评价；评价后提醒消费者好评奖励积分已到账；
  3、请自行修改上面几处的模板消息ID，参数为您自己的变量设置即可。  
   */
})
