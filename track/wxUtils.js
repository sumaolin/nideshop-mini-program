import _ from './utils'
// KM-CONFIG SDK全局配置信息
import KMC from './config'
import kmConfig from './kmConfig'
// km state 公用状态信息放着
var KMS = {
  rq_c: 0,
  al_c: 0,
  as_c: 0,
  ah_c: 0
}

var wxu = {}
wxu.getUUID = function(app) {
  var a = ''
  try {
    a = wx.getStorageSync(KMC.prefix + 'uuid')
  } catch (t) {
    a = 'uuid-getstoragesync'
  }
  if (!a) {
    a =
      Math.random()
        .toString(16)
        .replace('.', '') +
      '' +
      Date.now()
    try {
      wx.setStorageSync(KMC.prefix + 'uuid', a)
    } catch (t) {
      wx.setStorageSync(KMC.prefix + 'uuid', 'uuid-getstoragesync')
    }
    app[KMC.prefix + 'is_first_open'] = true
  }
  return a
}
/*
  current pagePath
 */
wxu.getPagePath = function() {
  try {
    var a = getCurrentPages(),
      b = '/'
    0 < a.length && (b = a.pop().__route__)
    return b
  } catch (c) {
    console.log('get current page path error:' + c)
  }
}
/*

 */
wxu.getSystemInfo = function() {
  var a = wx.getSystemInfoSync()
  return {
    pb: encodeURIComponent(a.brand),
    pm: encodeURIComponent(a.model),
    pr: a.pixelRatio,
    scw: a.screenWidth,
    sch: a.screenHeight,
    ww: a.windowWidth,
    wh: a.windowHeight,
    sbh: a.statusBarHeight,
    lg: a.language,
    wxv: a.version,
    system: encodeURIComponent(a.system),
    pl: encodeURIComponent(a.platform),
    fss: a.fontSizeSetting,
    sdkv: a.SDKVersion
  }
}
/*
  网络状态
*/
wxu.getNetworkType = function(a) {
  wx.getNetworkType({
    success: function(b) {
      a(b.networkType)
    }
  })
}

wxu.getUserAgent = function() {
  var a = wxu.getSystemInfo()
  wxu.getNetworkType(function(a) {
    wx.setStorageSync(KMC.prefix + 'nt', a)
  })
  a.nt = wx.getStorageSync(KMC.prefix + 'nt') || '4g'
  return a
}

/*
  获取 km.register() 注册到全局的信息
*/
wxu.getCustomerInfo = function() {
  var keyChain = ''
  try {
    keyChain = wx.getStorageSync(kmConfig.token)
  } catch (e) {
    console.log('getStorageSync error ' + e)
  }

  if (!keyChain) {
    console.log('not register info')
    return false
  }

  var arrKey = keyChain.split(',')

  var cInfo = {}
  for (var i = 0; i < arrKey.length; i++) {
    cInfo[arrKey[i]] = wx.getStorageSync(KMC.prefix + arrKey[i])
  }

  if (_.isEmptyObject(cInfo)) return false

  return cInfo
}

wxu.getAppBaseInfo = function(app) {
  var aInfo = {
    token: kmConfig['token'],
    uuid: wxu.getUUID(),
    st: Date.now(),
    v: KMC.version,
    l_token: app[KMC.prefix + 'life_token']
  }

  var cInfo = wxu.getCustomerInfo()
  if (cInfo && !_.isEmptyObject(cInfo)) {
    cInfo = Object.assign(cInfo, aInfo)
  } else {
    cInfo = aInfo
  }

  return cInfo
}

/**
 * 判断是否已经授权获取用户信息, 是的话直接获取用户信息并通过 callback 回调返回信息
 * @param  {Function} callback
 */
wxu.getWxUserInfo = function(callback) {
  if (wx.getSetting) {
    wx.getSetting({
      success: function(a) {
        if (a.authSetting['scope.userInfo']) {
          wx.getUserInfo({
            withCredentials: false,
            success: function(a) {
              callback(a)
            }
          })
        }
      }
    })
  }
}
/**
 * @param  {Object} t 发送信息的 对象
 * @param  {string} e method
 * @param  {string} n url
 */
wxu.sendRequest = function(t, e, n) {
  if (typeof arguments[1] === 'undefined') e = 'Post'
  if (typeof arguments[2] === 'undefined') n = 'data.php'
  var r = 0
  var i = function() {
    KMS.rq_c += 1
    t['rq_c'] = KMS.rq_c
    t['d'] = Date.now()

    var json_data = _.JSONEncode(t)
    var encoded_data = _.base64Encode(json_data)

    console.log(encoded_data)
    wx.request({
      url: KMC.api_base + '/' + n,
      data: encoded_data,
      method: e,
      success: function() {},
      fail: function() {
        // 请求失败后重发 2次
        if (r < 3) {
          r++
          t['rt'] = r
          i()
        }
      }
    })
  }
  i()
}

/**
 * getShareInfoDetail() 通过获取shareTicket 获取分享相关信息  https://developers.weixin.qq.com/miniprogram/dev/api/share.html#wxgetshareinfoobject
 * @param  {obj} App
 * @param  {String} st shareTicket
 * @param  {string} e eventName ['click', 'user'] click: 从分享的链接进入； user： 用户分享
 * demo: v(this, '0', 'click')  // 分享错误
 *       v(n, t['shareTickets'][e], 'user')
 */
wxu.getShareInfoDetail = function(app, st, e) {
  if (typeof wx['getShareInfo'] != 'undefined') {
    wx.getShareInfo({
      shareTicket: st,
      success: function(a) {
        wxu.sendShareTrack(e + '_share_Info', null, JSON.stringify(a))
      },
      fail: function() {
        wxu.sendShareTrack(e + '_share_Info', null, 'error') //分享错误
      }
    })
  } else {
    wxu.sendShareTrack(e + '_share_Info', null, 'error')
  }
}

wxu.sendShareTrack = function(eventName, extendInfo, args) {
  var app = getApp()
  var ug = wxu.getUserAgent()
  var baseInfo = wxu.getAppBaseInfo(app)
  var i = {
    et: 'Share',
    en: eventName
  }
  if (args) {
    i['s_arge'] = args
  }

  if (extendInfo) {
    i = Object.assign(i, extendInfo)
  }

  var data = Object.assign(ug, baseInfo, i)

  wxu.sendRequest(data)
}
/*
  sendErrorTrack(mes) 发送错误信息
*/
wxu.sendErrorTrack = function(mes) {
  var app = getApp()
  var ug = wxu.getUserAgent()
  var base = wxu.getAppBaseInfo(app)
  var i = {
    et: 'Error',
    err: mes
  }
  var c = Object.assign(ug, base, i)
  wxu.sendRequest(c)
}
/*
    sendAppTrack() app级别的信息 launch, unLaunch, load, hide产生的信息
    app getApp() App生命周期内的信息存储对象
    eventName 事件名称 [launch, unLaunch, show, hide]
  */
wxu.sendAppTrack = function(app, eventName) {
  if (typeof app[KMC.prefix + 'timestamp'] === 'undefined') {
    app[KMC.prefix + 'timestamp'] = Date.now()
  }
  var ug = wxu.getUserAgent()
  var baseInfo = wxu.getAppBaseInfo(app)
  var e = {
    et: 'App',
    en: eventName
  }

  var info = Object.assign(ug, e, baseInfo)
  var c = {
    lopt: app[KMC.prefix + 'launchOpt'],
    showT: app[KMC.prefix + 'showtime'],
    dr: app[KMC.prefix + 'duration'],
    pc: app[KMC.prefix + 'page_count'],
    fp: app[KMC.prefix + 'first_page'], // ?
    lp: app[KMC.prefix + 'last_page'], // ?
    ec: app[KMC.prefix + 'error_count'] // ?
  }
  if (eventName === 'launch') {
    KMS.al_c += 1
  } else if (eventName === 'show') {
    KMS.as_c += 1
  } else {
    KMS.ah_c += 1
  }
  c['alc'] = KMS.al_c
  c['asc'] = KMS.as_c
  c['ahc'] = KMS.ah_c
  if (app.page_share_count && typeof app.page_share_count === 'number') {
    c['sc'] = app.page_share_count
  }
  if (app[KMC.prefix + 'is_first_open']) {
    c['ifo'] = 'true'
  }

  // if (app[KMC.prefix + 'src']) {
  //   c['sr'] = app[KMC.prefix + 'src']
  // }

  if (app.refer_share_user) {
    c['rsu'] = app.refer_share_user
  }

  c = Object.assign(info, c)

  wxu.sendRequest(c)
}

/**
 * Page级别 事件的调用
 * @param  {object} a getApp()
 * @param  {string} s Page 当中的上下午环境 this
 * @param  {string} n 事件名称 [load, show, unload, hide]
 */
wxu.sendPageTrack = function(app, s, eventName) {
  if (!s[KMC.prefix + 'start_time']) {
    s[KMC.prefix + 'start_time'] = Date.now()
  }

  if (!app[KMC.prefix + 'first_page']) {
    app[KMC.prefix + 'first_page'] = s['__route__']
    s[KMC.prefix + 'is_first_page'] = true
  }
  app[KMC.prefix + 'last_page'] = s['__route__']
  var rPath = app[KMC.prefix + 'refererPath']
    ? app[KMC.prefix + 'refererPath']
    : 'first'
  var i = {
    et: 'Page',
    st: s[KMC.prefix + 'start_time'],
    dr: Date.now() - s[KMC.prefix + 'start_time'],
    pp: s['__route__'],
    rpp: rPath,
    en: eventName,
    sc: s.page_share_count,
    pc: app[KMC.prefix + 'page_count']
  }
  if (s[KMC.prefix + 'is_first_page']) {
    i['ifp'] = 'true'
  }

  if (s[KMC.prefix + 'page_args']) {
    i['ag'] = s[KMC.prefix + 'page_args']
  }
  if (app[KMC.prefix + 'src']) {
    i['sr'] = app[KMC.prefix + 'src']
  }

  if (app.refer_share_user) {
    i['rsu'] = app.refer_share_user
  }

  var ug = wxu.getUserAgent()
  var baseInfo = wxu.getAppBaseInfo(app)

  var info = Object.assign(ug, baseInfo, i)
  wxu.sendRequest(info)
}

/*
  发送用户自定义请求
*/
wxu.sendCSTrack = function(eventName, message) {
  var app = getApp()
  var ug = wxu.getUserAgent()
  var baseInfo = wxu.getAppBaseInfo(app)
  var i = {
    et: 'CS', // customer
    en: eventName
  }

  if (message) {
    i['args'] = message
  }

  var data = Object.assign(ug, baseInfo, i)

  wxu.sendRequest(data)
}
export default wxu
