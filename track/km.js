// 整体的框架
var mta = require('../utils/mta_analysis.js')
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
    mta.App.init({
      appID: '500562310',
      eventID: 'index_from',
      statPullDownFresh: true,
      statShareApp: true,
      statReachBottom: true,
      lauchOpts: opt
    })
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
    mta.Page.init()
    console.log('pre Handle Page OnLoad')
    console.dir(opt)
  }

  var preHandlePageOnUnload = function(opt) {
    console.log('pre Handle Page OnUnload')
  }

  var preHandlePageOnShow = function(opt) {
    console.log('pre Handle Page OnShow')
    console.dir(opt)
  }

  var preHandlePageOnHide = function() {
    console.log('pre Handle Page OnHide')
  }

  var preHandlePageOnReachBottom = function() {
    console.log('pre Handle Page OnReachBottom')
  }

  var preHandlePageOnPullDownRefresh = function() {
    console.log('pre Handle Page OnPullDownRefresh')
  }

  var handleOnShareAppMessage = function(config) {
    console.log('handle OnShareAppMessage')
    console.dir(config)
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
