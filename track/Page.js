import _ from './utils'
import wxu from './wxUtils'
import KMC from './config'
import kmConfig from './kmConfig'
/**
 * bind Page onLoad
 * @param  {Object} t onLoad参数  可以在 onLoad 中获取打开当前页面所调用的 query 参数。
 */
var preHandlePageOnLoad = function(t) {
  // kmsrc 自定义参数kmsrc -> sr
  var e = ''
  try {
    e = wx.getStorageSync(KMC.prefix + 'src')
  } catch (t) {
    e = ''
  }
  var app = getApp()

  if (e) {
    app[KMC.prefix + 'src'] = e
  }
  if (!_.isEmptyObject(t)) {
    // t 为 Object 类型
    if (typeof t.kmsrc != 'undefined') {
      if (!e) {
        try {
          wx.setStorageSync(KMC.prefix + 'src', t.kmsrc)
        } catch (t) {}
        app[KMC.prefix + 'src'] = t.kmsrc
      }
    }
    // refer share user
    if (typeof t.refer_share_user != 'undefined') {
      app.refer_share_user = t.refer_share_user
    }
    this[KMC.prefix + 'page_args'] = JSON.stringify(t)
  }
  // referer Path
  var rPath = wx.getStorageSync(KMC.prefix + 'refererPath')
  if (rPath) {
    app[KMC.prefix + 'refererPath'] = rPath
  }
  // page_count
  if (!app[KMC.prefix + 'page_count']) {
    app[KMC.prefix + 'page_count'] = 1
  } else {
    app[KMC.prefix + 'page_count']++
  }

  wxu.sendPageTrack(app, this, 'load')
}

/**
 * Page onUnload
 */
var preHandlePageOnUnload = function() {
  var app = getApp()
  var path = this['__route__']
  wx.setStorageSync(KMC.prefix + 'refererPath', path)
  wxu.sendPageTrack(app, this, 'unload')
}

/**
 * Page onShow
 */
var preHandlePageOnShow = function(t, a) {
  var app = getApp()
  var _this = this
  _this[KMC.prefix + 'start_time'] = Date.now()
  var rPath = wx.getStorageSync(KMC.prefix + 'refererPath')
  if (rPath) {
    app[KMC.prefix + 'refererPath'] = rPath
  }
  wxu.sendPageTrack(app, _this, 'show')
}

/**
 * Page onHide
 */
var preHandlePageOnHide = function(t, a) {
  var app = getApp()
  var path = this['__route__']
  wx.setStorageSync(KMC.prefix + 'refererPath', path)
  wxu.sendPageTrack(app, this, 'hide')
}
