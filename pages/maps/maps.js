//logs.js
// const util = require('../../utils/util.js')
Page({
  data: {
    routeInfo: {
      // startLat: 19.17652,    //起点经度 选填，不填默认为当前位置
      // startLng: 21.212121,    //起点纬度 选填
      // startName: "我的位置",   // 起点名称 选填
      startName: "我的位置",   // 起点名称 选填
      endLat: 22.548901,    // 终点经度必传
      endLng: 114.089656,  //终点纬度 必传
      endName: "福田区中航路1号九方购物中心",  //终点名称 必传
      mode: "car"  //算路方式 选填
    }
  },
  onLoad: function () {

  },
  onShow: function () {
    let plugin = requirePlugin("myPlugin");
  }
})