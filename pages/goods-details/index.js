//index.js
//获取应用实例
var app = getApp();
// 在文件头引入wxParse，下面要用
var WxParse = require('../../wxParse/wxParse.js');

Page({
  data: {
    autoplay: true,
    interval: 3000,
    duration: 1000,
    goodsDetail:{},  //商品详细数据
    swiperCurrent: 0,  //当前滑块所在的位置
    hasMoreSelect:false, //是否有规格属性
    selectSize:"选择：",//规格数属性的规格文字,初始化时只有选择两个字,后面会拼接所有规格文字
    selectSizePrice:0,//选中规格属性后所对应的价格
    totalScoreToPay: 0,//总共需要支付的积分
    shopNum:0,// 购物车上面显示的数量
    hideShopPopup:true,//遮罩层是否隐藏
    buyNumber:0, //购买的数量
    buyNumMin:1,//最小购买的数量
    buyNumMax: 0,//最大购买的数量

    propertyChildIds: "",//	选择的规格尺寸信息：如：4:15,2:10,1:4 。多个规格请用英文的逗号分割，4:15 中的 4 获取代表颜色，15 或许代表 土豪金
    propertyChildNames:"",
    canSubmit:false, //  选中规格尺寸时候是否允许加入购物车
    shopCarInfo:{}, //购物车信息，数据在购物车组件里
    shopType: "addShopCar",//购物类型，加入购物车或立即购买，默认为加入购物车
    token:""
  },

  //事件处理函数
  swiperchange: function(e) {
      //console.log(e.detail.current)
       this.setData({  
        //  swiperCurrent当前滑块所在的位置
        swiperCurrent: e.detail.current  
    })  
  },
  // inviter_id 邀请人的id，商品的id
  onLoad: function (e) {
    // if (e.inviter_id) {
    //   wx.setStorage({
    //     key: 'inviter_id_' + e.id,
    //     data: e.inviter_id
    //   })
    // }
    var that = this;
    // // 砍价id
    // // 接口返回的数据
    // that.data.kjId = e.kjId;
    // // 获取购物车数据
    // wx.getStorage({
    //   key: 'shopCarInfo',
    //   success: function(res) {
    //     that.setData({
    //       shopCarInfo:res.data,
    //       shopNum:res.data.shopNum
    //     });
    //   } 
    // })
    wx.showLoading({ //显示消息提示框  此处是提升用户体验的作用
      title: '数据加载中',
      icon: 'loading',
    });
    wx.request({
      url: 'https://api.it120.cc/'+ app.globalData.subDomain +'/shop/goods/detail',
      data: {
        id: e.id//商品编号
      },
      complete() {  //请求结束后隐藏 loading 提示框
        wx.hideLoading();
      },
      success: function(res) {
        // 所有规格名字的集合
        // var selectSizeTemp = "";
        // // properties 该商品可选的规格和尺寸单元，对应不同的价格和库存数
        // if (res.data.data.properties) {
        //   for(var i=0;i<res.data.data.properties.length;i++){
        //     selectSizeTemp = selectSizeTemp + " " + res.data.data.properties[i].name;
        //   }
        //   that.setData({
        //     // hasMoreSelect有规格信息,即该功能区显示
        //     hasMoreSelect:true,
        //     // 将请选择和规格文字拼接起来
        //     selectSize:that.data.selectSize + selectSizeTemp,
        //     // basicInfo商品基础信息【同列表接口的返回参数】
        //     // 	minPrice砍价的底价,接口暂时未开放此功能 这里不是这个意思吧，就是商品的售价
        //     selectSizePrice:res.data.data.basicInfo.minPrice,
        //     totalScoreToPay: res.data.data.basicInfo.minScore
        //   });
        // }
        that.data.goodsDetail = res.data.data;
        if (res.data.data.basicInfo.videoId) {
          that.getVideoSrc(res.data.data.basicInfo.videoId);
        }
        // 这里为什么要重新设置呢
        that.setData({
          goodsDetail:res.data.data,
          // selectSizePrice:res.data.data.basicInfo.minPrice,
          // totalScoreToPay: res.data.data.basicInfo.minScore,
          // //  buyNumMax库存数
          // buyNumMax:res.data.data.basicInfo.stores,
          // // 初始化时,库存数大于0时设置为1,否则显示为0
          // buyNumber:(res.data.data.basicInfo.stores>0) ? 1: 0
        });
        // 1.bindName----article 绑定的数据名(必填)
        // 2.type---html 可以为html或者md(必填)
        // 3.data---res.data.data.content 为传入的具体数据(必填)
        // 4.target----that 为Page对象, 一般为this(必填)
        // 5.imagePadding---5 为当图片自适应是左右的单一padding(默认为0, 可选)
        // content商品详细介绍，后台富媒体编辑器填写的内容
        WxParse.wxParse('article', 'html', res.data.data.content, that, 5);
      }
    });

    // 初始化评价
    this.reputation(e.id);
  },
  favadd:function (e) {
    let token = wx.getStorageSync('token');
      wx.request({
        url: 'https://api.it120.cc/' + app.globalData.subDomain + '/shop/goods/fav/add',
        method: 'GET',
        data: {
          id: e.id,//商品编号
          token: token
        },
        header: {
          'content-type': 'application/json' // 默认值
        },
        success: res => {
          // if (res.data.code !== 0) {
          //   return false;
          // }
          console.log(1);
          wx.showToast({
            title: '收藏成功',  //标题  
            icon: 'success',  //图标，支持"success"、"loading"  
            // image: '../image/img.png',  //自定义图标的本地路径，image 的优先级高于 icon  
            duration: 500, //提示的延迟时间，单位毫秒，默认：1500  
            mask: false,  //是否显示透明蒙层，防止触摸穿透，默认：false  
            success: function () { }, //接口调用成功的回调函数  
            fail: function () { },  //接口调用失败的回调函数  
            complete: function () { } //接口调用结束的回调函数  
          })  
        }
      });
  },
  // 生命周期函数--监听页面加载完成
  // 点击会进入购车页面
  goShopCar: function () {
    // 关闭所有页面，打开到应用内的某个页面。
    wx.reLaunch({
      url: "/pages/shop-cart/index"
    });
  },
  // 点击加入购物车，弹窗出现的底部就是购物车按钮
  // toAddShopCar: function () {
  //   this.setData({
  //     shopType: "addShopCar"
  //   })
  //   // 弹出规格选择框
  //   this.bindGuiGeTap();
  // },
  // // 点击立即购买，弹窗出现的底部就是立即购买按钮
  // tobuy: function () {
  //   this.setData({
  //     shopType: "tobuy"
  //   });
  //    // 弹出规格选择框
  //   this.bindGuiGeTap();
  //   /*    if (this.data.goodsDetail.properties && !this.data.canSubmit) {
  //         this.bindGuiGeTap();
  //         return;
  //       }
  //       if(this.data.buyNumber < 1){
  //         wx.showModal({
  //           title: '提示',
  //           content: '暂时缺货哦~',
  //           showCancel:false
  //         })
  //         return;
  //       }
  //       this.addShopCar();
  //       this.goShopCar();*/
  // },  
  // /**
  //  * 规格选择弹出框显示
  //  */
  // bindGuiGeTap: function() {
  //    this.setData({  
  //       hideShopPopup: false 
  //   })  
  // },
  /**
   * 规格选择弹出框隐藏
   */
  // closePopupTap: function() {
  //    this.setData({  
  //       hideShopPopup: true 
  //   })  
  // },
  // // 购买数量减
  // numJianTap: function() {
  //    if(this.data.buyNumber > this.data.buyNumMin){
  //       var currentNum = this.data.buyNumber;
  //       currentNum--; 
  //       this.setData({  
  //           buyNumber: currentNum
  //       })  
  //    }
  // },
  // // 购买数量减
  // numJiaTap: function() {
  //    if(this.data.buyNumber < this.data.buyNumMax){
  //       var currentNum = this.data.buyNumber;
  //       currentNum++ ;
  //       this.setData({  
  //           buyNumber: currentNum
  //       })  
  //    }
  // },
  /**
   * 选择商品规格
   * @param {Object} e
   */
  labelItemTap: function(e) {
    var that = this;
    /*
    console.log(e)
    console.log(e.currentTarget.dataset.propertyid)
    console.log(e.currentTarget.dataset.propertyname)
    console.log(e.currentTarget.dataset.propertychildid)
    console.log(e.currentTarget.dataset.propertychildname)
    */
    // 取消该分类下的子栏目所有的选中状态
    // e.currentTarget.dataset.propertyindex这里面的propertyindex是wxml里的data-propertyindex   另外e.target.dataset来获取属性值
    // var childs = that.data.goodsDetail.properties[e.currentTarget.dataset.propertyindex].childsCurGoods;
    // for(var i = 0;i < childs.length;i++){
    //   that.data.goodsDetail.properties[e.currentTarget.dataset.propertyindex].childsCurGoods[i].active = false;
    // }
    // // 设置当前选中状态
    // that.data.goodsDetail.properties[e.currentTarget.dataset.propertyindex].childsCurGoods[e.currentTarget.dataset.propertychildindex].active = true;
    // 获取所有的选中规格尺寸数据
    // var needSelectNum = that.data.goodsDetail.properties.length;
    // var curSelectNum = 0;
    // var propertyChildIds= "";
    // var propertyChildNames = "";
    // for (var i = 0;i < that.data.goodsDetail.properties.length;i++) {
    //   childs = that.data.goodsDetail.properties[i].childsCurGoods;
    //   for (var j = 0;j < childs.length;j++) {
    //     if(childs[j].active){
    //       curSelectNum++;
    //       propertyChildIds = propertyChildIds + that.data.goodsDetail.properties[i].id + ":"+ childs[j].id +",";
    //       propertyChildNames = propertyChildNames + that.data.goodsDetail.properties[i].name + ":"+ childs[j].name +"  ";
    //     }
    //   }
    // }
    // var canSubmit = false;
    // if (needSelectNum == curSelectNum) {
    //   canSubmit = true;
    // }
    // 计算当前价格
    // if (canSubmit) {
    //   wx.request({
    //     url: 'https://api.it120.cc/'+ app.globalData.subDomain +'/shop/goods/price',
    //     data: {
    //       // 商品编号
    //       goodsId: that.data.goodsDetail.basicInfo.id,
    //       // 选择的规格尺寸信息：如：4:15,2:10,1:4 。多个规格请用英文的逗号分割，4:15 中的 4 获取代表颜色，15 或许代表 土豪金
    //       propertyChildIds:propertyChildIds
    //     },
    //     success: function(res) {
    //       that.setData({
    //         selectSizePrice:res.data.data.price,
    //         totalScoreToPay: res.data.data.score,
    //         propertyChildIds:propertyChildIds,
    //         propertyChildNames:propertyChildNames,
    //         // stores库存数
    //         buyNumMax:res.data.data.stores,
    //         buyNumber:(res.data.data.stores>0) ? 1: 0
    //       });
    //     }
    //   })
    // }

    
    // this.setData({
    //   goodsDetail: that.data.goodsDetail,
    //   canSubmit:canSubmit
    // })  
  },
  /**
  * 加入购物车
  */
  // addShopCar:function(){
  //   if (this.data.goodsDetail.properties && !this.data.canSubmit) {
  //     if (!this.data.canSubmit){
  //       wx.showModal({
  //         title: '提示',
  //         content: '请选择商品规格！',
  //         showCancel: false
  //       })       
  //     }
  //     // 弹出规格显示框
  //     this.bindGuiGeTap();
  //     return;
  //   }
  //   if(this.data.buyNumber < 1){
  //     wx.showModal({
  //       title: '提示',
  //       content: '购买数量不能为0！',
  //       showCancel:false
  //     })
  //     return;
  //   }
  //   //组建购物车
  //   // bulidShopCarInfo 组建购物车信息函数
  //   var shopCarInfo = this.bulidShopCarInfo();

  //   this.setData({
  //     // 购物车信息，数据在购物车组件里
  //     shopCarInfo:shopCarInfo,
  //     shopNum:shopCarInfo.shopNum
  //   });

  //   // 写入本地存储
  //   wx.setStorage({
  //     key:'shopCarInfo',
  //     data:shopCarInfo
  //   })
  //   this.closePopupTap();
  //   wx.showToast({
  //     title: '加入购物车成功',
  //     icon: 'success',
  //     duration: 2000
  //   })
  //   //console.log(shopCarInfo);

  //   //shopCarInfo = {shopNum:12,shopList:[]}
  // },
	/**
	  * 立即购买
	  */
  // buyNow:function(){
  //   if (this.data.goodsDetail.properties && !this.data.canSubmit) {
  //     if (!this.data.canSubmit) {
  //       wx.showModal({
  //         title: '提示',
  //         content: '请选择商品规格！',
  //         showCancel: false
  //       })
  //     }
  //     this.bindGuiGeTap();
  //     wx.showModal({
  //       title: '提示',
  //       content: '请先选择规格尺寸哦~',
  //       showCancel:false
  //     })
  //     return;
  //   }    
  //   if(this.data.buyNumber < 1){
  //     wx.showModal({
  //       title: '提示',
  //       content: '购买数量不能为0！',
  //       showCancel:false
  //     })
  //     return;
  //   }
  //   //组建立即购买信息
  //   var buyNowInfo = this.buliduBuyNowInfo();
  //   // 写入本地存储
  //   wx.setStorage({
  //     key:"buyNowInfo",
  //     data:buyNowInfo
  //   })
  //   // 隐藏规格弹出框
  //   this.closePopupTap();

  //   wx.navigateTo({
  //     // orderType=buyNow点击立即购买
  //     url: "/pages/to-pay-order/index?orderType=buyNow"
  //   })    
  // },
  /**
   * 组建购物车信息
   */
  // bulidShopCarInfo: function () {
  //   // 加入购物车
  //   var shopCarMap = {};
  //   // goodsId商品编号
  //   shopCarMap.goodsId = this.data.goodsDetail.basicInfo.id;
  //   shopCarMap.pic = this.data.goodsDetail.basicInfo.pic;
  //   shopCarMap.name = this.data.goodsDetail.basicInfo.name;
  //   // shopCarMap.label=this.data.goodsDetail.basicInfo.id; 规格尺寸 
  //   shopCarMap.propertyChildIds = this.data.propertyChildIds;
  //   shopCarMap.label = this.data.propertyChildNames;
  //   shopCarMap.price = this.data.selectSizePrice;
  //   shopCarMap.score = this.data.totalScoreToPay;
  //   shopCarMap.left = "";
  //   shopCarMap.active = true;
  //   shopCarMap.number = this.data.buyNumber;
  //   shopCarMap.logisticsType = this.data.goodsDetail.basicInfo.logisticsId;
  //   shopCarMap.logistics = this.data.goodsDetail.logistics;
  //   shopCarMap.weight = this.data.goodsDetail.basicInfo.weight;

  //   var shopCarInfo = this.data.shopCarInfo;
  //   if (!shopCarInfo.shopNum) {
  //     shopCarInfo.shopNum = 0;
  //   }
  //   if (!shopCarInfo.shopList) {
  //     shopCarInfo.shopList = [];
  //   }
  //   var hasSameGoodsIndex = -1;
  //   // for (var i = 0; i < shopCarInfo.shopList.length; i++) {
  //   //   var tmpShopCarMap = shopCarInfo.shopList[i];
  //   //   if (tmpShopCarMap.goodsId == shopCarMap.goodsId && tmpShopCarMap.propertyChildIds == shopCarMap.propertyChildIds) {
  //   //     hasSameGoodsIndex = i;
  //   //     shopCarMap.number = shopCarMap.number + tmpShopCarMap.number;
  //   //     break;
  //   //   }
  //   // }

  //   shopCarInfo.shopNum = shopCarInfo.shopNum + this.data.buyNumber;
  //   if (hasSameGoodsIndex > -1) {
  //     shopCarInfo.shopList.splice(hasSameGoodsIndex, 1, shopCarMap);
  //   } else {
  //     shopCarInfo.shopList.push(shopCarMap);
  //   }
  //   shopCarInfo.kjId = this.data.kjId;
  //   return shopCarInfo;
  // },
	/**
	 * 组建立即购买信息
	 */
  // buliduBuyNowInfo: function () {
  //   var shopCarMap = {};
  //   shopCarMap.goodsId = this.data.goodsDetail.basicInfo.id;
  //   shopCarMap.pic = this.data.goodsDetail.basicInfo.pic;
  //   shopCarMap.name = this.data.goodsDetail.basicInfo.name;
  //   // shopCarMap.label=this.data.goodsDetail.basicInfo.id; 规格尺寸 
  //   shopCarMap.propertyChildIds = this.data.propertyChildIds;
  //   shopCarMap.label = this.data.propertyChildNames;
  //   shopCarMap.price = this.data.selectSizePrice;
  //   shopCarMap.score = this.data.totalScoreToPay;
  //   shopCarMap.left = "";
  //   shopCarMap.active = true;
  //   shopCarMap.number = this.data.buyNumber;
  //   shopCarMap.logisticsType = this.data.goodsDetail.basicInfo.logisticsId;
  //   shopCarMap.logistics = this.data.goodsDetail.logistics;
  //   shopCarMap.weight = this.data.goodsDetail.basicInfo.weight;

  //   var buyNowInfo = {};
  //   if (!buyNowInfo.shopNum) {
  //     buyNowInfo.shopNum = 0;
  //   }
  //   if (!buyNowInfo.shopList) {
  //     buyNowInfo.shopList = [];
  //   }
  //   /*    var hasSameGoodsIndex = -1;
  //       for (var i = 0; i < toBuyInfo.shopList.length; i++) {
  //         var tmpShopCarMap = toBuyInfo.shopList[i];
  //         if (tmpShopCarMap.goodsId == shopCarMap.goodsId && tmpShopCarMap.propertyChildIds == shopCarMap.propertyChildIds) {
  //           hasSameGoodsIndex = i;
  //           shopCarMap.number = shopCarMap.number + tmpShopCarMap.number;
  //           break;
  //         }
  //       }
  //       toBuyInfo.shopNum = toBuyInfo.shopNum + this.data.buyNumber;
  //       if (hasSameGoodsIndex > -1) {
  //         toBuyInfo.shopList.splice(hasSameGoodsIndex, 1, shopCarMap);
  //       } else {
  //         toBuyInfo.shopList.push(shopCarMap);
  //       }*/

  //   buyNowInfo.shopList.push(shopCarMap);
  //   buyNowInfo.kjId = this.data.kjId;
  //   return buyNowInfo;
  // },   
  onShareAppMessage: function () {
    return {
      title: this.data.goodsDetail.basicInfo.name,
      path: '/pages/goods-details/index?id=' + this.data.goodsDetail.basicInfo.id + '&inviter_id=' + wx.getStorageSync('uid'),
      desc: '柠檬美食，给你酷爽的夏日!',
      success: function (res) {
        // 转发成功
        wx.showModal({
          title: '转发成功',
          showCancel: false
        })
        return;
      },
      fail: function (res) {
        // 转发失败
        wx.showModal({
          title: '转发失败',
          showCancel: false
        })
        return;
      }
    }
  },
  // 评价
  reputation: function (goodsId) {
    var that = this;
    wx.request({
      url: 'https://api.it120.cc/' + app.globalData.subDomain + '/shop/goods/reputation',
      data: {
        goodsId: goodsId
      },
      success: function (res) {
        if (res.data.code == 0) {
          //console.log(res.data.data);
          that.setData({
            reputation: res.data.data
          });
        }
      }
    })
  },
  getVideoSrc: function (videoId) {
    var that = this;
    wx.request({
      url: 'https://api.it120.cc/' + app.globalData.subDomain + '/media/video/detail',
      data: {
        videoId: videoId
      },
      success: function (res) {
        if (res.data.code == 0) {
          that.setData({
            videoMp4Src: res.data.data.fdMp4
          });
        }
      }
    })
  },
  // getKanjiaInfo: function (gid) {
  //   var that = this;
  //   if (!app.globalData.kanjiaList || app.globalData.kanjiaList.length == 0){
  //     that.setData({
  //       curGoodsKanjia: null
  //     });
  //     return;
  //   }
  //   let curGoodsKanjia = app.globalData.kanjiaList.find(ele => {
  //     return ele.goodsId == gid
  //   });
  //   if (curGoodsKanjia) {
  //     that.setData({
  //       curGoodsKanjia: curGoodsKanjia
  //     });
  //   } else {
  //     that.setData({
  //       curGoodsKanjia: null
  //     });
  //   }
  // },
  // goKanjia: function () {
  //   var that = this;
  //   if (!that.data.curGoodsKanjia) {
  //     return;
  //   }
  //   wx.request({
  //     url: 'https://api.it120.cc/' + app.globalData.subDomain + '/shop/goods/kanjia/join',
  //     data: {
  //       kjid: that.data.curGoodsKanjia.id,
  //       token: wx.getStorageSync('token')
  //     },
  //     success: function (res) {
  //       if (res.data.code == 0) {
  //         console.log(res.data);
  //         wx.navigateTo({
  //           url: "/pages/kanjia/index?kjId=" + res.data.data.kjId + "&joiner=" + res.data.data.uid + "&id=" + res.data.data.goodsId
  //         })
  //       } else {
  //         wx.showModal({
  //           title: '错误',
  //           content: res.data.msg,
  //           showCancel: false
  //         })
  //       }
  //     }
  //   })
  // },
})
