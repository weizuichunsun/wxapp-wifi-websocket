import { websocket } from "./websocket.js";
function findDevice(wifiName, wifiList) {
  let k = 0;
  if (!wifiList.length) {
    return k;
  }
  wifiList.find((it, index) => {
    if (wifiName == it.SSID) {
      k = 1;
      return true;
    }
  });

  return k;
}
class wifitooth extends websocket {
  constructor(options) {
    super(options);

    this.START_STEP = false;

  }
  /**
   * device 传入设备的基础信息 对象类型 {}
   * data 发送的数据
   * callback 回调
   */
  STOP(device,callback) {
    wx.stopWifi({
      success(res) {
        console.log("wx.stopWifi res=>", res);
        if (typeof callback == "function"){
          callback(res)
        }
      },
      fail(err) {
        console.log("wx.stopWifi err=>", err);
        if (typeof callback == "function") {
          callback(err)
        }
      }
    })
  }
  /**
   * 错误码
   */
  ErrorMsg(errCode) {
    var self = this;
    console.log("ErroMSg errCode=>", errCode);
    var errDesc = "";

    errCode = parseInt(errCode);

    switch (errCode) {
      case 12000:
        errDesc = "未先调用startWifi接口";
        break;

      case 12001:
        errDesc = "当前系统不支持相关能力";
        break;

      case 12002:
        errDesc = "Wi-Fi 密码错误";
        break;

      case 12003:
        errDesc = "未先调用startWifi接口";
        break;

      case 12004:
        errDesc = "未先调用startWifi接口";
        break;

      case 12005:
        // errDesc = " Android特有，未打开 Wi-Fi 开关";
        errDesc = "打开手机 Wi-Fi 开关";
        break;

      case 12006:
        // errDesc = "Android特有，未打开 GPS 定位开关";
        errDesc = "手机未打开GPS/位置信息开关";
        break;

      case 12007:
        errDesc = "用户拒绝授权链接 Wi-Fi";
        break;


      case 12008:
        errDesc = "无效SSID";
        break;

      case 12009:
        errDesc = "系统运营商配置拒绝连接 Wi-Fi";
        break;

      case 12010:
        // errDesc = "系统其他错误，需要在errmsg打印具体的错误原因";
        errDesc = "请重新打开手机 Wi-Fi 开关";
        break;

      case 12011:
        errDesc = "应用在后台无法配置 Wi-Fi";
        break;
    }
    if (errCode) {
      wx.stopWifi({
        success(res) {
          console.log("wx.stopWifi res=>", res);
        },
        fail(err) {
          console.log("wx.stopWifi err=>", err);
        }
      })
      self.START_STEP = false;
      wx.showModal({
        title: '请按提示设置获取Wi-Fi',
        content: errDesc,
        showCancel: false
      });

      return false;
    }
    return true;
  }
  /**
    * device 传入设备的基础信息 对象类型 {}
    * callback 回调
    * next 执行模块下一步骤
    */
  START(device, callback, next) {
    var self = this;


    // if(!self.START_STEP){

    self.START_STEP = true;
    wx.startWifi({
      success(res) {
        console.log("wx.startWifi res=>", res);
        if (typeof callback == "function") {
          callback();
        }
        if (typeof next == "function") {
          next();
        }
      },
      fail(err) {
        console.log("wx.startWifi err=>", err);

        if (typeof callback == "function") {
          callback();
        }
        if (typeof next == "function") {
          next();
        }
      }
    });



  }
  /**
   * device 传入设备的基础信息 对象类型 {}
   * callback 回调
   * next 执行模块下一步骤
   * device.wifiName 搜索的wifi热点名称
   * device.wifiList 获取搜到的设备列表
   * device.onWifiConnected 监听连接上 Wi-Fi 的事件 返回
   * 
   */
  SEARCH(device, callback, next) {
    var self = this;

    self.START(device, null, function () {

      wx.onWifiConnected((res) => {
        console.log("wx.onWifiConnected res=>", res);
        if (typeof device.onWifiConnected == "function") {
          device.onWifiConnected(res)
        }
      });

      if (typeof device.onWifiConnected == "function") {
        // 这里单用来处理获取当前设备连接的wifi名称，不需要往下走
        return false;
      }

      wx.onGetWifiList((res) => {
        console.log("wx.onGetWifiList res=>", res);
        let wifiList = res.wifiList || [];
        let find = findDevice(device.wifiName, wifiList);
        console.log("find=>", find, (new Date()).getTime());
        // 如果需要查看搜到的设备，则返回
        if (typeof device.wifiList == "function") {
          device.wifiList(wifiList);
        }
        if (!find) {
          wx.showModal({
            title: '',
            content: 'WIFI热点不存在，请靠近设备',
          });
          return false;
        }
        if (typeof callback == "function") {
          callback(find);
        }
        if (typeof next == "function") {
          next(find);
        }
      });

      // wx.getWifiList 请求获取 Wi - Fi 列表。在 onGetWifiList 注册的回调中返回 wifiList 数据。
      wx.getWifiList({
        success(res) {
          console.log("wx.getWifiList res=>", res);
        },
        fail(err) {
          console.log("wx.getWifiList err=>", err);
          self.ErrorMsg(err.errCode);
        }
      });
    });

  }
  /**
   * device 传入设备的基础信息 对象类型 {}
   * callback 回调
   * next 执行模块下一步骤
   * device.wifiName 搜索的wifi热点名称
   * device.wifiPwd Wi-Fi 设备密码
   */
  CONNECT(device, callback, next) {
    var self = this;

    self.SEARCH(device, null, function () {
      if (!device.wifiName && device.wifiPwd) {
        wx.showModal({
          title: '',
          content: '请输入连接wifi的名称和密码',
        })
        return false;
      }
      wx.getConnectedWifi({
        success(res) {
          console.log("wx.getConnectedWifi res=>", res);
          if (res && res.errCode == 0) {
            let wifi = res.wifi;
            if (wifi.SSID == device.wifiName) {
              if (typeof callback == "function") {
                callback(wifi);
              }
              if (typeof next == "function") {
                next(wifi);
              }
            } else {
              connectWifi();
            }
          } else {
            console.log("未知错误")
            self.ErrorMsg(res.errCode);
          }
        },
        fail(err) {
          console.log("wx.getConnectedWifi err=>", err);
          // { errCode: 12010, errMsg: "getConnectedWifi:fail:currentWifi is null" }
          // self.ErrorMsg(err.errCode);
          /**
           * 如果用户手机WIFI没有启动自动连接某个热点，那么该地方肯定是报错的，因此直接尝试连接，在连接中提示错误
           */
          connectWifi()
        }
      });

      function connectWifi() {
        wx.connectWifi({
          SSID: device.wifiName,
          password: device.wifiPwd,
          success(res) {
            console.log("wx.connectWifi res=>", res);
            if (typeof callback == "function") {
              callback();
            }
            if (typeof next == "function") {
              next();
            }
          },
          fail(err) {
            console.log("wx.connectWifi err=>", err);
            self.ErrorMsg(err.errCode);
          }
        });
      }
    })
  }
  /**
   * device 传入设备的基础信息 对象类型 {}
   * data 发送的数据
   * callback 回调
   * 
   * device.wsurl 连接 websocket的地址
   * device.SSID Wi-Fi 设备 SSID
   * device.password Wi-Fi 设备密码
   */
  SEND(device, data, callback) {
    var self = this;
    self.CONNECT(device, null, function () {
      console.log("wifitooth SEND");
      self.sendMessage(device, data, function (res, next) {
        if (typeof callback == "function") {
          // callback(res, function (content) {
          //   if (typeof next == "function") {
          //     next(content);
          //   }
          // });

          callback(res);
        }
      });
    });
  }
}
// 
module.exports = {
  wifitooth: new wifitooth()
}