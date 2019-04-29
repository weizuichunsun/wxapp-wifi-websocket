const app = getApp();

import { wifitooth } from "../utils/wifitooth.js";

Page({
  data: {
    wifiName: "",

    wifiPwd: "",
  },
  onLoad: function () {

  },
  bindwifiName: function (e) {
    var self = this;

    let value = e.detail.value;

    console.log("bindwifiName value=>", value);
    self.setData({
      "wifiName": value
    });

  }, 
  bindwifiPwd: function (e) {
    var self = this;

    let value = e.detail.value;

    console.log("bindwifiPwd value=>", value);
    self.setData({
      "wifiPwd": value
    });

  },
  START: function () {
    // START 示例代码
    let device = {
    }
    wifitooth.START(device, function () {

    });
  },
  SEARCH: function () {

    // START 示例代码
    let device = {
      wifiName: this.data.wifiName,
      // wifiList:function(res){
      // TO DO 用来处理搜到周边的WIFI设备列表，

      // },
      // onWifiConnected:function(res){
      // TO DO 用来处理获取当前连接的WFII名称，减少用户输入WIFI表单时间
      // }
    }
    wifitooth.START(device, function (res) {
      console.log("wifitooth.START res=>", res)
      wx.showModal({
        title: '',
        content: JSON.stringify(res),
      })
    });
  },
  CONNECT: function () {
    // CONNECT 示例代码
    let device = {
      wifiName: this.data.wifiName,
      wifiPwd: this.data.wifiPwd,
      // wifiList:function(res){
      // TO DO 用来处理搜到周边的WIFI设备列表，

      // },
      // onWifiConnected:function(res){
      // TO DO 用来处理获取当前连接的WFII名称，减少用户输入WIFI表单时间
      // }
    }
    wifitooth.CONNECT(device, function (res) {
      console.log("wifitooth.CONNECT res=>", res)
      wx.showModal({
        title: '',
        content: JSON.stringify(res),
      })
    });
  },
  SEND: function () {
    // SEND 示例代码
    let device = {
      wifiName: this.data.wifiName,
      wifiPwd: this.data.wifiPwd,
      wsurl: "ws://localhost:8000"
    }
    let data = (new Date()).getTime();
    wifitooth.SEND(device, data, function (res) {
      console.log("wifitooth.SEND res=>", res)

      wx.showModal({
        title: '',
        content: JSON.stringify(res),
      })
    });

  },
  STOP: function () {
    // STOP 示例代码
    let device = {
    }
    wifitooth.STOP(device, function (res) {
      console.log("res=>", res)
      
    });
  },
  SEND_WEBSOCKET: function () {
    // SEND_WEBSOCKET 示例代码
    let device = {
      // wifiName: "wifiName",
      // wifiPwd: "wifiPwd",
      wsurl: "ws://localhost:8000"
    }
    let data = (new Date()).getTime();

    wifitooth.sendMessage(device, data, function (res) {
      console.log("wifitooth.sendMessage res=>", res)
      // wx.showModal({
      //   title: '',
      //   content: JSON.stringify(res),
      // });
      wx.navigateTo({
        url: '../logs/logs',
      })
    });
  },
})
