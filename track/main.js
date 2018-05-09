// 整体的框架
import kmConfig from './kmConfig'
// KM-CONFIG SDK全局配置信息
import KMC from './config'
import wxu from './wxUtils'
// km state 公用状态信息放着
var KMS = {
  rq_c: 0
}

//  bind APP Page Event
;(function() {
  /*
    动态插入pre-function函数
    t 上下文对象
    a bind 对象t的函数名称
    e bind 的执行函数
  */
  function d(t, a, e) {
    if (t[a]) {
      var s = t[a] // origin function
      t[a] = function(t) {
        e.call(this, t, a) // e 动态bind函数
        s.call(this, t)
      }
    } else {
      t[a] = function(t) {
        e.call(this, t, a)
      }
    }
  }

  /** 在原函数后执行 函数 after-function
   * @param  {} t bind Object
   * @param  {} a bind Method
   * @param  {} e bind result
   * demo: c(t, 'onShareAppMessage', G)
   */
  function c(t, a, e) {
    if (t[a]) {
      var s = t[a]
      t[a] = function(t) {
        var n = s.call(this, t)
        e.call(this, [t, n], a)
        return n
      }
    } else {
      t[a] = function(t) {
        e.call(this, t, a)
      }
    }
  }

  var preHandleAppOnLaunch = function(opt) {
    console.log('pre handle App onLaunch')
    console.dir(opt)
  }

  var preHandleAppOnUnlaunch = function(opt) {
    console.log('pre handle App onUnLaunch')
  }

  var preHandleAppOnShow = function(opt) {
    console.log('pre Handle App OnShow')
    console.dir(opt)
  }

  var preHandleAppOnHide = function(opt) {
    console.log('pre Handle App OnHide')
  }

  var preHandleAppOnError = function(opt) {
    console.log('pre Handle App OnError')
  }

  var N = App
  App = function(t) {
    d(t, 'onLaunch', preHandleAppOnLaunch)
    d(t, 'onUnlaunch', preHandleAppOnUnlaunch) // 小程序文档中未 说明的函数
    d(t, 'onShow', preHandleAppOnShow)
    d(t, 'onHide', preHandleAppOnHide)
    d(t, 'onError', preHandleAppOnError)
    N(t)
  }

  var preHandlePageOnLoad = function(opt) {
    console.log(this['__route__'] + ' pre Handle Page OnLoad')
    console.dir(opt)
  }

  var preHandlePageOnUnload = function(opt) {
    console.log(this['__route__'] + ' pre Handle Page OnUnload')
  }

  var preHandlePageOnShow = function(opt) {
    console.log(this['__route__'] + ' pre Handle Page OnShow')
    console.dir(opt)
  }

  var preHandlePageOnHide = function() {
    console.log(this['__route__'] + ' pre Handle Page OnHide')
  }

  var preHandlePageOnReachBottom = function() {
    console.log(this['__route__'] + ' pre Handle Page OnReachBottom')
  }

  var preHandlePageOnPullDownRefresh = function() {
    console.log(this['__route__'] + ' pre Handle Page OnPullDownRefresh')
  }

  /**
   * Page onShareAppMessage 点击转发 menu 菜单中的转发时触发
   * Readme ： https://developers.weixin.qq.com/miniprogram/dev/api/share.html#wxgetshareinfoobject
   * @param  {Array} config [options, {title, PagePath}]
   * options 是 onShareAppMessage(options)中的 {from:'', target: ''}
   * @param  {String} a methoName: onShareAppMessage
   */
  var handleOnShareAppMessage = function(config, methodName) {
    console.log(this['__route__'] + ' handle OnShareAppMessage')
    console.log(config)
    var _this = this
    var app = getApp()
    if (typeof config == 'undefined') {
      return
    }
    if (typeof config[1] == 'undefined') {
      // config[1] onShareAppMessage 的用户配置  {title, PagePath}
      return
    }
    // uuid
    var uuid = ''
    try {
      uuid = wx.getStorageSync(KMC.prefix + 'uuid')
    } catch (t) {
      uuid = 'uuid-getstoragesync-error'
    }
    /*
      user share count 统计分享次数
    */
    var userShareCount = ''
    var USCTag = KMC.prefix + uuid + 'USC' // Storage中存储的变量
    try {
      userShareCount = wx.getStorageSync(USCTag)
    } catch (t) {
      userShareCount = 'user_share_count_error'
    }
    if (userShareCount === '' || typeof userShareCount === 'undefined') {
      try {
        wx.setStorageSync(USCTag, 1)
      } catch (t) {}
      userShareCount = 1
      app.page_share_count = userShareCount
    } else {
      userShareCount = parseInt(wx.getStorageSync(USCTag)) + 1
      app.page_share_count = userShareCount
      try {
        wx.setStorageSync(USCTag, userShareCount)
      } catch (t) {}
    }

    /*
      shareChain
      referrer share User 统计 分享用户的关系
    */
    var shareChain = ''
    var RSUTag = KMC.prefix + uuid + 'RSU'
    if (app.refer_share_user === 'undefined' || !app.refer_share_user) {
      try {
        shareChain = wx.getStorageSync(KMC.prefix + 'uuid') // 默认自己的 uuid
      } catch (t) {
        shareChain = 'refferer_share_user_error'
      }
    } else {
      // 判断是否包含 当前用户uuid
      shareChain = app.refer_share_user
      var arrShareChain = shareChain.split(',')
      var isIncludeSelf = false // 假设不是从自己的分享链接进入
      for (var d = 0, c = arrShareChain.length; d < c; d++) {
        // 判断是否从自己的分享进入
        var p = arrShareChain[d]
        if (p.replace('"', '') == uuid) {
          isIncludeSelf = true
          break
        }
      }
      if (arrShareChain.length >= 3) {
        if (!isIncludeSelf) {
          arrShareChain.shift() // 舍弃旧的分享来源
        } else {
        }
        shareChain = arrShareChain.toString() // 自动添加, 链接成字符串
      }
      if (shareChain !== '' && !isIncludeSelf) {
        shareChain = shareChain + ',' + uuid
      }
    }
    // 分享 path 上设置 refer_share_user

    if (!config[1].path || config[1].path === 'undefined') {
      if (KmConfig['defaultSharePath']) {
        config[1].path = KmConfig['defaultSharePath']
      } else {
        config[1].path = _this['__route__']
      }
    }
    if (config[1].path.indexOf('?') != -1) {
      config[1].path += '&refer_share_user=' + shareChain
    } else {
      config[1].path += '?refer_share_user=' + shareChain
    }

    wxu.sendShareTrack(
      'user_trigger_share',
      {
        from: config[0].from,
        path: config[1].path,
        title: config[1].title, // 转发事件来源。button：页面内转发按钮；menu：右上角转发菜单。https://developers.weixin.qq.com/miniprogram/dev/api/share.html
        pp: wxu.getPagePath(), // 触发分享的页面
        rsu: shareChain, // 分享链接， 后面的是从前面的 uuid 进入的
        sc: userShareCount // 用户分享的次数
      },

      false
    )

    /*
      config shareSuccess & shareFail
      转发成功 & 失败的 事件： https://developers.weixin.qq.com/miniprogram/dev/api/share.html
    */
    // var g = config[1]  user shareAppMessage config
    if (typeof config[1]['success'] === 'undefined') {
      config[1]['success'] = function(t) {}
    }
    if (typeof config[1]['fail'] === 'undefined') {
      config[1]['fail'] = function(t) {}
    }
    var originSAMFail = config[1]['fail'] // origin fail function
    var originSAMSuccess = config[1]['success'] // origin success function
    config[1]['success'] = function(t) {
      // t:shareTickets 为微信文档中的 shareTickets参数
      var a = new Array()
      if (typeof t['shareTickets'] === 'object') {
        for (var e = 0; e < t['shareTickets'].length; e++) {
          wxu.getShareInfoDetail(app, t['shareTickets'][e], 'user') //获取分享
        }
      }
      wxu.sendShareTrack('share_status', null, JSON.stringify(t))
      originSAMSuccess(t)
    }
    config[1]['fail'] = function(t) {
      wxu.sendShareTrack('share_status', null, 'fail')
      originSAMFail(t)
    }
    return config[1]
  }

  var J = Page
  Page = function(t) {
    d(t, 'onLoad', preHandlePageOnLoad)
    d(t, 'onUnload', preHandlePageOnUnload)
    d(t, 'onShow', preHandlePageOnShow)
    d(t, 'onHide', preHandlePageOnHide)
    d(t, 'onReachBottom', preHandlePageOnReachBottom)
    d(t, 'onPullDownRefresh', preHandlePageOnPullDownRefresh)
    if (typeof t['onShareAppMessage'] != 'undefined') {
      c(t, 'onShareAppMessage', handleOnShareAppMessage)
    }
    J(t)
  }
})()
