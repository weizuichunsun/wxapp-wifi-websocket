

export class websocket {
  constructor(options) {

    this.socketOpen = false;  //监听websocket是否已开启
    this.timerLayer = null;   // 判断请求到一定时间后请求超时提示
    this.timerNumber = 15 * 1000;  // 判断请求到一定时间

    this.chain_callback = null;   // 用于解决路由之间，A页面，B页面都调用了sendMessage 方法后，A页面触发跳转到B页面，B页面sendMessage后，在A页面监听到了。
    
    this.senior = false; // 高级权限，考虑到路由的原因，并且外部调用不修改权限，导致死循环，这里再做一层防护


  }
  /**
   * device 传入设备的信息
   * device.url 连接 websocket的地址
   * device.hiddenLoading 是否屏蔽发送的状态
   * device.senior 高级权限
   */
  sendMessage(device, data, callback) {
    var self = this;

    console.log("sendMessage self.socketOpen=>", self.socketOpen);
    console.log("sendMessage self.callback=>", self.callback);
    console.log("sendMessage callback=>", callback);

    clearTimeout(self.timerLayer);
    self.timerLayer = setTimeout(() => {
      wx.hideLoading();
      wx.showModal({
        title: '错误提示',
        content: '请求已超时',
      });
    }, self.timerNumber);

    var closeProgress;
    if (!device.hiddenLoading) {
      wx.showLoading({
        title: '加载中',
      });
      closeProgress = function () {
        clearTimeout(self.timerLayer);
        setTimeout(() => {
          wx.hideLoading();
        }, 300);
      }
    }
    self.chain_callback = callback;  // 用于处理路由的错误函数回调
    self.senior = device.senior ? true : false;
    


    let connectURL =  device.wsurl || "";
    console.log("connectURL=>", connectURL)
    if (!connectURL) {
      wx.showModal({
        title: '错误提示',
        content: '请求地址不能为空',
      });
      if (!!closeProgress) {
        closeProgress();
      }
      return false;
    }
    if (!self.socketOpen) {
      wx.connectSocket({
        url: connectURL
      });
    } else {
      self.sendSocketMessage(data);
    }

    wx.onSocketOpen(function (res) {
      self.socketOpen = true;
      console.log("wx.onSocketOpen res=>", res);
      wx.onSocketMessage(function (res) {
        console.log("wx.onSocketMessage res.data=>", res.data);
        if (!!closeProgress) {
          closeProgress();
        }
        clearTimeout(self.timerLayer);

        if (typeof self.chain_callback == "function") {
          self.chain_callback(JSON.parse(res.data), function (content) {
            console.log("websocket content=>", content);

            if (self.senior) {
              self.senior = false;
              self.sendSocketMessage(content);
            }
          });
        }
      });

      wx.onSocketError(function (res) {
        self.socketOpen = false;
        wx.closeSocket();
        if (!!closeProgress) {
          closeProgress();
        }
        console.log("wx.onSocketError res=>", res);
        // { errMsg: "" }
        // 监听 WebSocket 错误事件
        if (res && res.errMsg) {
          wx.showModal({
            title: '监听 WebSocket 错误事件',
            content: res.errMsg + "",
          });
          return false;
        }
      });
      // wx.onSocketClose(function callback) 监听 WebSocket 连接关闭事件
      wx.onSocketClose(function (res) {
        console.log("wx.onSocketClose res=>", res);
        self.socketOpen = false;
        if (res.code != 1000) {
          wx.showToast({
            title: res.reason + " " + res.code,
            icon: "none",
            duration: 4000
          });
          return false;
        }
      });
      self.sendSocketMessage(data);
    });
  }
  /**
   * 内部发送数据
   */
  sendSocketMessage(data) {
    var self = this;
    if (self.socketOpen) {
      wx.sendSocketMessage({
        data: data
      })
    } else {
      console.log("发送失败 self.socketOpen=>", self.socketOpen)
    }
  }
}