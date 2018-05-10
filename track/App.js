import KM from './Track.js'
import wxu from './wxUtils'
import KMC from './config'
/*
  bind App onLaunch
*/
var preHandleAppOnLaunch = function(t) {
  this['km'] = new KM(this) // km 实例

  var s = wxu.getUUID(this) // 获取当前用户uuid
  this[KMC.prefix + 'uuid'] = s
  this[KMC.prefix + 'life_token'] = _.random()
  this[KMC.prefix + 'timestamp'] = Date.now()
  this[KMC.prefix + 'showtime'] = Date.now()
  this[KMC.prefix + 'duration'] = 0
  var n = this
  n[KMC.prefix + 'error_count'] = 0
  n[KMC.prefix + 'page_count'] = 1
  n[KMC.prefix + 'first_page'] = 0
  if (typeof t != 'undefined') {
    this[KMC.prefix + 'launchOpt'] = t
  } else {
    this[KMC.prefix + 'launchOpt'] = {}
  }

  var d = function() {
    wxu.getWxUserInfo(function(t) {
      // t = wx.getUserInfo
      var a = ''
      try {
        a = wx.getStorageSync(KMC.prefix + 'uuid')
      } catch (t) {
        a = 'uuid-getstoragesync'
      }
      t['userInfo']['uuid'] = a
      wxu.sendRequest(t['userInfo'], 'post', 'u.html')
    })
  }
  d()

  wxu.sendAppTrack(n, 'launch')
}

/**
 * bind app onShow
 * @param  {option} t 小程序App onShow 中的返回参数
 * 参考链接： https://developers.weixin.qq.com/miniprogram/dev/framework/app-service/app.html
 */
var preHandleAppOnShow = function(launchOpt) {
  this[KMC.prefix + 'showtime'] = Date.now()
  if (typeof launchOpt != 'undefined') {
    this[KMC.prefix + 'launchOpt'] = launchOpt
  } else {
    this[KMC.prefix + 'launchOpt'] = {}
  }
  var uuid = wxu.getUUID(this)

  if (typeof launchOpt != 'undefined') {
    if (typeof launchOpt['shareTicket'] != 'undefined') {
      getShareInfoDetail(this, launchOpt['shareTicket'], 'click')
    }
    if (typeof launchOpt['query'] != 'undefined') {
      if (typeof launchOpt['query']['refer_share_user'] != 'undefined') {
        this['refer_share_user'] = launchOpt['query']['refer_share_user']
      }
    }
  }
  wxu.sendAppTrack(this, 'show')
}
/*
    bind app hide
    add duration 停留时间统计
  */
var preHandleAppOnHide = function(t, a) {
  var app = this
  if (app[KMC.prefix + 'is_first_open']) {
    app[KMC.prefix + 'is_first_open'] = false
  }
  app[KMC.prefix + 'duration'] = Date.now() - app[KMC.prefix + 'showtime']
  wxu.sendAppTrack(app, 'hide')
}
/*
    bind app unLaunch 添加 duration
   */
var preHandleAppOnUnlaunch = function() {
  var app = this
  app[KMC.prefix + 'duration'] += Date.now() - app[KMC.prefix + 'showtime']
  wxu.sendAppTrack(app, 'unLaunch')
}

/*
    app onError 上报错误信息
   */
var preHandleAppOnError = function(err) {
  var app = this
  if (typeof this.aldstat_error_count === 'undefined') {
    this.aldstat_error_count = 1
  } else {
    this.aldstat_error_count++
  }
  wxu.sendErrorTrack(JSON.stringify(err))
}
