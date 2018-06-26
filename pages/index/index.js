//index.js
//获取应用实例
var app = getApp()
// Page() 函数用来注册一个页面。接受一个 object 参数，其指定页面的初始数据、
//生命周期函数、事件处理函数等。
Page({
  data: {
    indicatorDots: true,
    autoplay: true,  //默认自动播放
    interval: 3000,  //自动切换时间间隔
    duration: 1000,  //滑动动画时长
    loadingHidden: false , // loading
    userInfo: {},
    swiperCurrent: 0,
    // businessId:0,  
    selectCurrent:0,
    categories: [],  //导航栏所有分类信息
    activeCategoryId: 0,//选中的分类的index，默认是0即全部所在的位置
    goods:[],  //某个分类的所有信息
    scrollTop:"0",
    loadingMoreHidden:true,
    hasNoCoupons: true,   //优惠券是否隐藏
    coupons: [],   //优惠券数据的集合
    searchInput: '',  //输入的内容
  },

  tabClick: function (e) {
    // setData修改数组某一项的值。一般setData方法多用于点击后改变页面信息或者刷新后与后台交互获取最新的信息
    this.setData({
      //currentTarget 当前组件的一些属性值集合，更新activeCategoryId
      activeCategoryId: e.currentTarget.id
    });
    this.getGoodsList(this.data.activeCategoryId);
  },

  //事件处理函数 swiper中的事件，左右滑动的时候，滑动结束会出发这个事件
  swiperchange: function(e) {
      //console.log(e.detail.current)
       this.setData({  
         swiperCurrent: e.detail.current  //current当前所在滑块的 index
    })  
  },

  // 跳转到商品详情处
  toDetailsTap:function(e){
    // 一级页面，到希望跳转到的页面不要有Tabbar时，不要使用 redirectTo而是使用 navigateTo就可以了。
    wx.navigateTo({
      //DataSet可以成内存中的数据库是为了找到item.id，类似一个节点；这里跳转页面需要带所对应的商品id的
      url:"/pages/goods-details/index?id="+e.currentTarget.dataset.id
    })
  },

  // 点击轮播图跳转到对应的详情页面,但是这里为什么不能跳转
  tapBanner: function(e) {
    if (e.currentTarget.dataset.id != 0) {
      wx.navigateTo({
        url: "/pages/goods-details/index?id=" + e.currentTarget.dataset.id
      })
    }
  },

// 表示什么
  bindTypeTap: function(e) {
     this.setData({  
        selectCurrent: e.index  //选中的位置
    })  
  },

  // 搜索栏的样式
  scroll: function (e) {
    //  console.log(e) ;
    var that = this,scrollTop=that.data.scrollTop;
    that.setData({
      // scrollTop() 方法返回或设置匹配元素的滚动条的垂直位置。
      scrollTop:e.detail.scrollTop
    })
    // console.log('e.detail.scrollTop:'+e.detail.scrollTop) ;
    // console.log('scrollTop:'+scrollTop)
  },
  // 获得banner相关信息
  onLoad: function () {
    var that = this
    wx.setNavigationBarTitle({
      // 设置顶部标题为商城名字，在app.js就已经存起来了
      title: wx.getStorageSync('mallName')
    })
    wx.request({
      url: 'https://api.it120.cc/' + app.globalData.subDomain + '/banner/list',
      data: {
        key: 'mallName'
      },
      success: function(res) {
        if (res.data.code == 404) {
          wx.showModal({
            title: '提示',
            content: '请在后台添加 banner 轮播图片',
            showCancel: false
          })
        } else {
          that.setData({
            banners: res.data.data
          });
        }
      }
    })
    wx.request({
      url: 'https://api.it120.cc/'+ app.globalData.subDomain +'/shop/goods/category/all',
      success: function(res) {
        var categories = [{id:0, name:"全部"}]; 
        if (res.data.code == 0) {
          for (var i = 0; i < res.data.data.length; i++) {
            //将接口返回的美食，服饰等每个分类的信息存入categories数组里
            categories.push(res.data.data[i]);
          }
        }
        that.setData({
          categories:categories,
          activeCategoryId:0
        });
        that.getGoodsList(0);
      }
    })
    that.getCoupons ();
    that.getNotice ();
  },

  // categoryId获取指定分类下的商品
  getGoodsList: function (categoryId) {
    if (categoryId == 0) {
      categoryId = "";
    }
    console.log(categoryId)
    var that = this;
    wx.request({
      url: 'https://api.it120.cc/'+ app.globalData.subDomain +'/shop/goods/list',
      data: {
        categoryId: categoryId,
        // nameLike商品名称关键词模糊搜索，一般是后端做，实现搜索匹配的功能
        nameLike: that.data.searchInput
      },
      success: function(res) {
        that.setData({
          goods:[],
          loadingMoreHidden:true
        });
        var goods = [];
        if (res.data.code != 0 || res.data.data.length == 0) {
          that.setData({
            loadingMoreHidden:false,
          });
          return;
        }
        for(var i=0;i<res.data.data.length;i++){
          goods.push(res.data.data[i]);
        }
        that.setData({
          goods:goods,
        });
      }
    })
  },

// 优惠券
  getCoupons: function () {
    var that = this;
    wx.request({
      url: 'https://api.it120.cc/' + app.globalData.subDomain + '/discounts/coupons',
      data: {
        type: ''
      },
      success: function (res) {
        if (res.data.code == 0) {
          that.setData({
            hasNoCoupons: false,  //优惠券是否隐藏
            coupons: res.data.data
          });
        }
      }
    })
  },
  //表示领取优惠券的提示信息
  gitCoupon : function (e) {
    var that = this;
    wx.request({
      // 接口是什么
      url: 'https://api.it120.cc/' + app.globalData.subDomain + '/discounts/fetch',
      data: {
        id: e.currentTarget.dataset.id,
        token: wx.getStorageSync('token')
      },
      success: function (res) {
        if (res.data.code == 20001 || res.data.code == 20002) {
          wx.showModal({
            title: '错误',
            content: '来晚了',
            showCancel: false
          })
          return;
        }
        if (res.data.code == 20003) {
          wx.showModal({
            title: '错误',
            content: '你领过了，别贪心哦~',
            showCancel: false
          })
          return;
        }
        if (res.data.code == 30001) {
          wx.showModal({
            title: '错误',
            content: '您的积分不足',
            showCancel: false
          })
          return;
        }
        if (res.data.code == 20004) {
          wx.showModal({
            title: '错误',
            content: '已过期~',
            showCancel: false
          })
          return;
        }
        if (res.data.code == 0) {
          wx.showToast({
            title: '领取成功，赶紧去下单吧~',
            icon: 'success',
            duration: 2000
          })
        } else {
          wx.showModal({
            title: '错误',
            content: res.data.msg,
            showCancel: false
          })
        }
      }
    })
  },

  // 点击分享时弹出的信息
  onShareAppMessage: function () {
    return {
      title: wx.getStorageSync('mallName') + '[' + app.globalData.shareProfile+']',
      path: '/pages/index/index',
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },

  // 公告信息
  getNotice: function () {
    var that = this;
    wx.request({
      url: 'https://api.it120.cc/' + app.globalData.subDomain + '/notice/list',
      data: { pageSize: 5 },//每页显示的条数
      success: function (res) {
        if (res.data.code == 0) {
          that.setData({
            noticeList: res.data.data//所有信息的集合
          });
        }
      }
    })
  },

  // 输入时触发的事件
  listenerSearchInput: function (e) {
    this.setData({
      searchInput: e.detail.value
    })

  },
  // 点击完成按钮时即搜索按钮触发
  toSearch : function (){
    this.getGoodsList(this.data.activeCategoryId);
  }
})
