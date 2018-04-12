;(function() {
  var t = '6.1.2' // version
  var a = 'log'
  var e = require('./ald-stat-conf.js') // config
  var s = 0
  var n = 0
  var r = 0
  var i = 0
  var o = {}
  // 获取 aldstat_uuid 用户唯一标识
  function l(t) {
    var a = ''
    try {
      a = wx.getStorageSync('aldstat_uuid')
    } catch (t) {
      a = 'uuid-getstoragesync'
    }
    if (!a) {
      a = '' + Date.now() + Math.floor(Math.random() * 1e7)
      try {
        wx.setStorageSync('aldstat_uuid', a)
      } catch (t) {
        wx.setStorageSync('aldstat_uuid', 'uuid-getstoragesync')
      }
      t.aldstat_is_first_open = true
    }
    return a
  }
  // 获取用户服务器配置信息 ，收集数据配置的开关
  function _() {
    wx.request({
      url: 'https://' + a + '.aldwx.com/config/app.json',
      header: { AldStat: 'MiniApp-Stat' },
      method: 'GET',
      success: function(t) {
        if (t.statusCode === 200) {
          for (var a in t.data) {
            wx.setStorageSync(a, t.data[a])
          }
        }
      }
    })
  }
  /*
    动态插入pre-function函数
    t 上下文对象
    a bind 对象t的函数名称
    e bind 的执行函数
  */
  function d(t, a, e) {
    if (t[a]) {
      var s = t[a] //
      t[a] = function(t) {
        e.call(this, t, a)
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
  // 判断是否已经授权获取用户信息, 是的话直接获取用户信息并通过 t 回调返回信息
  var f = function(t) {
    if (wx.getSetting) {
      wx.getSetting({
        success: function(a) {
          if (a.authSetting['scope.userInfo']) {
            wx.getUserInfo({
              withCredentials: false,
              success: function(a) {
                t(a)
              }
            })
          }
        }
      })
    }
  }
  /*
    u() 发起请求接口
    t 要发送的信息info
    e request method
    n 接口地址
    demo:　u(i, 'GET', 'd.html')
  */
  var u = function(t, e, n) {
    if (typeof arguments[1] === 'undefined') e = 'GET'
    if (typeof arguments[2] === 'undefined') n = 'd.html'
    var r = 0
    var i = function() {
      s += 1
      t['rq_c'] = s
      wx.request({
        url: 'https://' + a + '.aldwx.com/' + n,
        data: t,
        header: { AldStat: 'MiniApp-Stat' },
        method: e,
        success: function() {},
        fail: function() {
          // 请求失败后重发 2次
          if (r < 2) {
            r++
            t['retryTimes'] = r
            i()
          }
        }
      })
    }
    i()
  }
  // extend 默认要添加的信息 uu 获取用户信息
  var p = function(a, s, n, r) {
    var i = {
      ak: e['app_key'], // ak app_key
      uu: l(a), // 用户唯一标识
      at: a.aldstat_access_token, // app_token
      st: Date.now(), // 发起时间
      tp: n,
      ev: s,
      v: t
    }
    if (r) {
      i['ct'] = r
    }
    if (a.aldstat_qr) {
      i['qr'] = a.aldstat_qr
    }
    u(i, 'GET', 'd.html')
  }
  /*
    h() 自定义ald 事件
    a messageObj
    s method name ['event']
    n level ['ald_share_chain', 'ald_error_message', 'ald_share_click' ]
    r arguments 参数
    demo:　h(e, 'event', 'ald_error_message', JSON.stringify(t))
     h(t, 'event', 'ald_share_click', JSON.stringify(a))
  */
  var h = function(a, s, n, r) {
    if (typeof a['aldstat_showoption'] === 'undefined') {
      a['aldstat_showoption'] = {}
    }
    var i = {
      ak: e['app_key'],
      wsr: a.aldstat_showoption,
      uu: l(a),
      at: a.aldstat_access_token,
      st: Date.now(),
      tp: n,
      ev: s,
      nt: a.aldstat_network_type,
      pm: a.aldstat_phone_model,
      pr: a.aldstat_pixel_ratio,
      ww: a.aldstat_window_width,
      wh: a.aldstat_window_height,
      lang: a.aldstat_language,
      wv: a.aldstat_wechat_version,
      lat: a.aldstat_lat,
      lng: a.aldstat_lng,
      spd: a.aldstat_speed,
      v: t
    }
    if (r) {
      i['ct'] = r
    }
    if (a.aldstat_location_name) {
      i['ln'] = a.aldstat_location_name
    }
    if (a.aldstat_src) {
      i['sr'] = a.aldstat_src
    }
    if (a.aldstat_qr) {
      i['qr'] = a.aldstat_qr
    }
    u(i, 'GET', 'd.html')
  }
  // app.aldstat Object 的class
  function g(t) {
    this.app = t
  }
  g.prototype['debug'] = function(t) {
    h(this.app, 'debug', 0, t)
  }
  g.prototype['warn'] = function(t) {
    h(this.app, 'debug', 1, t)
  }
  g.prototype['error'] = function(t) {
    p(this.app, 'debug', 2, t)
  }
  g.prototype['sendEvent'] = function(t, a) {
    if (!D(t)) {
      return false
    }
    if (t.length >= 255) {
      return false
    }
    if (typeof a === 'object') {
      for (var e in a) {
        if (!D(e)) {
          return false
        }
        if (typeof a[e] == 'object') {
          return false
        }
        if (!D(a[e])) {
          return false
        }
      }
      h(this.app, 'event', t, JSON.stringify(a))
    } else {
      if (typeof a === 'string' && a.length <= 255) {
        if (D(a)) {
          var s = String(a)
          var n = new Object()
          n[s] = a
          h(this.app, 'event', t, a)
        }
      } else {
        h(this.app, 'event', t, false)
      }
    }
  }
  /*
    bind app unLaunch 添加 duration
   */
  var w = function() {
    var t = this
    t.aldstat_duration += Date.now() - t.aldstat_showtime
    m(t, 'app', 'unLaunch')
  }
  /**
   * v() 通过获取shareTicket 获取分享相关信息
   * @param  {obj} t messageObj
   * @param  {string} a shareTicket
   * @param  {string} e click
   * demo: v(this, '0', 'click')
   * v(n, t['shareTickets'][e], 'user')
   */
  var v = function(t, a, e) {
    if (typeof wx['getShareInfo'] != 'undefined') {
      wx.getShareInfo({
        shareTicket: a,
        success: function(a) {
          h(t, 'event', 'ald_share_' + e, JSON.stringify(a))
        },
        fail: function() {
          h(t, 'event', 'ald_share_' + e, '1') //分享错误
        }
      })
    } else {
      h(t, 'event', 'ald_share_' + e, '1')
    }
  }
  /*
    bind App onLaunch
   */
  var y = function(t) {
    _() // get 服务器配置
    this['aldstat'] = new g(this) // aldstat 实例
    var a = ''
    try {
      a = wx.getStorageSync('aldstat_src')
    } catch (t) {
      a = 'uuid-getstoragesync'
    }
    if (a) {
      this.aldstat_src = a
    }
    var s = l(this) // 获取当前用户uuid
    this.aldstat_uuid = s
    this.aldstat_timestamp = Date.now()
    this.aldstat_showtime = Date.now()
    this.aldstat_duration = 0
    var n = this
    n.aldstat_error_count = 0
    n.aldstat_page_count = 1
    n.aldstat_first_page = 0
    if (typeof t != 'undefined') {
      this.aldstat_showoption = t
    } else {
      this.aldstat_showoption = {}
    }
    // 获取网络类型
    var r = function() {
      wx.getNetworkType({
        success: function(t) {
          n.aldstat_network_type = t['networkType']
        },
        complete: i
      })
    }
    // 获取系统信息
    var i = function() {
      wx.getSystemInfo({
        success: function(t) {
          n.aldstat_vsdk_version =
            typeof t['SDKVersion'] === 'undefined' ? '1.0.0' : t['SDKVersion']
          n.aldstat_phone_model = t['model']
          n.aldstat_pixel_ratio = t['pixelRatio']
          n.aldstat_window_width = t['windowWidth']
          n.aldstat_window_height = t['windowHeight']
          n.aldstat_language = t['language']
          n.aldstat_wechat_version = t['version']
          n.aldstat_sv = t['system']
          n.aldstat_wvv = t['platform']
        },
        complete: function() {
          if (e['getLocation']) {
            c()
          }
          d()
        }
      })
    }
    // 获取 用户信息 添加uuid 后发送给后端
    var d = function() {
      f(function(t) {
        // t = wx.getUserInfo
        var a = ''
        try {
          a = wx.getStorageSync('aldstat_uuid')
        } catch (t) {
          a = 'uuid-getstoragesync'
        }
        t['userInfo']['uu'] = a
        o = t
        u(t['userInfo'], 'GET', 'u.html')
      })
    }
    /*
      获取地理位置信息
     */
    var c = function() {
      wx.getLocation({
        type: 'wgs84',
        success: function(t) {
          n.aldstat_lat = t['latitude']
          n.aldstat_lng = t['longitude']
          n.aldstat_speed = t['speed']
        }
      })
    }
    r()
    var p = ''
    try {
      p = wx.getStorageSync('app_session_key_create_launch_upload')
    } catch (t) {
      p = ''
    }
    if (!p) {
      n.aldstat_access_token = '' + Date.now() + Math.floor(Math.random() * 1e7)
    } else {
      if (p > 0 && typeof p === 'number') {
        n.aldstat_access_token =
          '' + Date.now() + Math.floor(Math.random() * 1e7)
      }
    }
    m(n, 'app', 'launch')
  }
  /*
    app onError 上报错误信息
   */
  var S = function(t, a) {
    var e = this
    if (typeof this.aldstat_error_count === 'undefined') {
      this.aldstat_error_count = 1
    } else {
      this.aldstat_error_count++
    }
    h(e, 'event', 'ald_error_message', JSON.stringify(t))
  }
  /*
    m() app级别的信息 launch, unLaunch, load, hide产生的信息
    a messageObject 要发送的信息的信息对象
    s 'app'
    o 事件名称 [launch, unLaunch, show, hide]
    demo: m(t, 'app', 'unLaunch')
  */
  var m = function(a, s, o) {
    var _ = ''
    try {
      _ = wx.getStorageSync('app_' + o + '_upload')
    } catch (t) {
      _ = ''
    }
    if (!_ && o !== 'launch') {
      return
    }
    if (_ < 1 && typeof _ === 'number') {
      return
    }
    if (typeof a.aldstat_timestamp === 'undefined') {
      a.aldstat_timestamp = Date.now()
    }
    var d = wx.getSystemInfoSync()
    a.aldstat_vsdk_version =
      typeof d['SDKVersion'] === 'undefined' ? '1.0.0' : d['SDKVersion']
    a.aldstat_phone_model = d['model']
    a.aldstat_pixel_ratio = d['pixelRatio']
    a.aldstat_window_width = d['windowWidth']
    a.aldstat_window_height = d['windowHeight']
    a.aldstat_language = d['language']
    a.aldstat_sv = d['system']
    a.aldstat_wvv = d['platform']
    var c = {
      ak: e['app_key'],
      waid: e['appid'],
      wst: e['appsecret'],
      uu: l(a), // 获取uuid 并判断是否是第一次进入app
      at: a.aldstat_access_token,
      wsr: a.aldstat_showoption,
      st: a.aldstat_timestamp,
      dr: a.aldstat_duration,
      et: Date.now(),
      pc: a.aldstat_page_count,
      fp: a.aldstat_first_page,
      lp: a.aldstat_last_page,
      life: o,
      ec: a.aldstat_error_count,
      nt: a.aldstat_network_type,
      pm: a.aldstat_phone_model,
      wsdk: a.aldstat_vsdk_version,
      pr: a.aldstat_pixel_ratio,
      ww: a.aldstat_window_width,
      wh: a.aldstat_window_height,
      lang: a.aldstat_language,
      wv: a.aldstat_wechat_version,
      lat: a.aldstat_lat,
      lng: a.aldstat_lng,
      spd: a.aldstat_speed,
      v: t,
      ev: s, // 不清楚
      sv: a.aldstat_sv,
      wvv: a.aldstat_wvv
    }
    if (o === 'launch') {
      n += 1
    } else if (o === 'show') {
      r += 1
    } else {
      i += 1
    }
    c['la_c'] = n
    c['as_c'] = r
    c['ah_c'] = i
    if (a.page_share_count && typeof a.page_share_count === 'number') {
      c['sc'] = a.page_share_count
    }
    if (a.aldstat_is_first_open) {
      c['ifo'] = 'true'
    }
    if (a.aldstat_location_name) {
      c['ln'] = a.aldstat_location_name
    }
    if (a.aldstat_src) {
      c['sr'] = a.aldstat_src
    }
    if (a.aldstat_qr) {
      c['qr'] = a.aldstat_qr
    }
    if (a.ald_share_src) {
      c['usr'] = a.ald_share_src
    }
    u(c, 'GET', 'd.html')
  }

  /**
   * bind app onShow
   * @param  {option} t 小程序App onShow 中的返回参数
   * 参考链接： https://developers.weixin.qq.com/miniprogram/dev/framework/app-service/app.html
   */
  var x = function(t) {
    this.aldstat_showtime = Date.now()
    if (typeof t != 'undefined') {
      this.aldstat_showoption = t
    } else {
      this.aldstat_showoption = {}
    }
    var a = ''
    try {
      a = wx.getStorageSync('app_session_key_create_show_upload')
    } catch (t) {
      a = ''
    }
    if (a) {
      if (a > 0 && typeof a === 'number') {
        this.aldstat_access_token =
          '' + Date.now() + Math.floor(Math.random() * 1e7)
      }
    }
    m(this, 'app', 'show')
    if (typeof t != 'undefined') {
      if (typeof t['shareTicket'] != 'undefined') {
        v(this, t['shareTicket'], 'click')
      } else if (typeof t['query'] != 'undefined') {
        if (typeof t['query']['ald_share_src'] != 'undefined') {
          v(this, '0', 'click')
        }
      }
    }
  }
  /*
    bind app hide
    add duration 停留时间统计
  */
  var k = function(t, a) {
    var e = this
    if (e.aldstat_is_first_open) {
      e.aldstat_is_first_open = false
    }
    e.aldstat_duration = Date.now() - e.aldstat_showtime
    m(e, 'app', 'hide')
  }
  /**
   * q(t) 判断 t 是否 为Object
   * @param  {obj} t
   */
  function q(t) {
    for (var a in t) {
      return false
    }
    return true
  }
  // 检测 是否是合法字符串
  function D(t) {
    if (typeof t !== 'string') {
      return false
    }
    var a = t.replace(/\s+/g, '_')
    if (/[~`!@/#+=\$%\^()&\*]+/g.test(a)) {
      return false
    }
    return true
  }

  /**
   * Page onHide
   */
  var T = function(t, a) {
    var e = getApp()
    M(e, this, 'hide')
  }
  /**
   * Page onUnload
   */
  var b = function(t, a) {
    var e = getApp()
    M(e, this, 'unload')
  }
  /**
   * bind Page onLoad
   * @param  {Object} t onLoad参数
   * @param  {} a
   */
  var A = function(t, a) {
    var e = ''
    try {
      e = wx.getStorageSync('aldstat_src')
    } catch (t) {
      e = ''
    }
    var s = getApp()
    if (typeof wx['showShareMenu'] != 'undefined') {
    }
    if (e) {
      s.aldstat_src = e
    }
    if (!q(t)) {
      // t 为 Object 类型
      if (typeof t.aldsrc != 'undefined') {
        if (!e) {
          try {
            wx.setStorageSync('aldstat_src', t.aldsrc)
          } catch (t) {}
          s.aldstat_src = t.aldsrc
          s.aldstat_qr = t.aldsrc
        } else {
          s.aldstat_qr = t.aldsrc
        }
      }
      if (typeof t.ald_share_src != 'undefined') {
        s.ald_share_src = t.ald_share_src
      }
      this.aldstat_page_args = JSON.stringify(t)
    }
    M(s, this, 'load')
  }
  /**
   * Page级别 事件的调用
   * @param  {object} a getApp()
   * @param  {string} s this MessageObj 全局信息载体
   * @param  {string} n 事件名称 [load, show, unload, hide]
   */
  var M = function(a, s, n) {
    var r = ''
    try {
      r = wx.getStorageSync('page_' + n + '_upload')
    } catch (t) {
      r = ''
    }
    if (!r && n !== 'show') {
      return
    }
    if (r < 1 && typeof r === 'number') {
      return
    }
    s.aldstat_start_time = Date.now()
    s.aldstat_error_count = 0
    if (!a.aldstat_page_count) {
      a.aldstat_page_count = 1
    } else {
      a.aldstat_page_count++
    }
    if (!a.aldstat_first_page) {
      a.aldstat_first_page = s['__route__']
      s.aldstat_is_first_page = true
    }
    a.aldstat_last_page = s['__route__']
    var i = {
      uu: l(a),
      at: a.aldstat_access_token,
      wsr: a.aldstat_showoption,
      ak: e['app_key'],
      ev: 'page',
      st: s.aldstat_start_time,
      dr: Date.now() - s.aldstat_start_time,
      pp: s['__route__'],
      life: n,
      sc: s.page_share_count,
      ec: s.aldstat_error_count,
      nt: a.aldstat_network_type,
      pm: a.aldstat_phone_model,
      pr: a.aldstat_pixel_ratio,
      ww: a.aldstat_window_width,
      wh: a.aldstat_window_height,
      lang: a.aldstat_language,
      wv: a.aldstat_wechat_version,
      lat: a.aldstat_lat,
      lng: a.aldstat_lng,
      spd: a.aldstat_speed,
      v: t,
      wsdk: a.aldstat_vsdk_version,
      sv: a.aldstat_sv,
      wvv: a.aldstat_wvv
    }
    if (s.aldstat_is_first_page) {
      i['ifp'] = 'true'
    }
    if (a.aldstat_page_last_page) {
      i['lp'] = a.aldstat_page_last_page
    }
    if (a.aldstat_location_name) {
      i['ln'] = a.aldstat_location_name
    }
    if (s.aldstat_page_args) {
      i['ag'] = s.aldstat_page_args
    }
    if (a.aldstat_src) {
      i['sr'] = a.aldstat_src
    }
    if (a.aldstat_qr) {
      i['qr'] = a.aldstat_qr
    }
    if (a.ald_share_src) {
      i['usr'] = a.ald_share_src
    }
    a.aldstat_page_last_page = s['__route__']
    u(i, 'GET', 'd.html')
  }
  /**
   * Page onShow
   * @param  {} t
   * @param  {} a
   */
  var I = function(t, a) {
    var e = getApp()
    M(e, this, 'show')
  }
  /**
   * Page onPullDownRefresh
   */
  var E = function(t, a) {
    var e = getApp()
    h(e, 'event', 'ald_pulldownrefresh', 1)
  }
  /**
    Page onReachBottom
   */
  var O = function(t, a) {
    var e = getApp()
    h(e, 'event', 'ald_reachbottom', 1)
  }
  /**
   * Page onShareAppMessage 点击转发menu 菜单中的转发时触发
   * Readme ： https://developers.weixin.qq.com/miniprogram/dev/api/share.html#wxgetshareinfoobject
   * @param  {Array} t
   * @param  {String} a onShareAppMessage
   */
  var G = function(t, a) {
    // console.log('onShareAppMessage')
    var s = this
    var n = getApp()
    if (typeof t == 'undefined') {
      return
    }
    if (typeof t[1] == 'undefined') {
      // t[1] onShareMessage 的用户配置
      return
    }
    // r: uuid
    var r = ''
    try {
      r = wx.getStorageSync('aldstat_uuid')
    } catch (t) {
      r = 'uuid-getstoragesync'
    }
    var i = ''
    try {
      i = wx.getStorageSync(r)
    } catch (t) {
      i = 'p_share_count_getst'
    }
    //  o shareChain ald_share_src
    var o = ''
    if (n.ald_share_src === 'undefined' || !n.ald_share_src) {
      try {
        o = wx.getStorageSync('aldstat_uuid')
      } catch (t) {
        o = 'ald_share_src_getst'
      }
    } else {
      // 判断是否包含 当前用户uuid
      o = n.ald_share_src
      var l = o.split(',')
      var _ = true
      for (var d = 0, c = l.length; d < c; d++) {
        var p = l[d]
        if (p.replace('"', '') == r) {
          _ = false
          break
        }
      }
      if (l.length >= 3) {
        if (_) {
          l.shift() // why delete first ?
        } else {
        }
        o = l.toString() // 自动添加, 链接成字符串
      }
      if (o !== '' && _) {
        o = o + ',' + r
      }
    }
    // 分享 path 上设置 ald_share_src
    if (!t[1].path || t[1].path === 'undefined') {
      if (e['defaultPath']) {
        t[1].path = e['defaultPath']
      } else {
        t[1].path = s['__route__']
      }
    }
    if (t[1].path.indexOf('?') != -1) {
      t[1].path += '&ald_share_src=' + o
    } else {
      t[1].path += '?ald_share_src=' + o
    }
    h(n, 'event', 'ald_share_chain', { path: n.aldstat_last_page, chain: o }) // 调用转发的次数
    // 统计分享次数
    if (i === '' || typeof i === 'undefined') {
      try {
        wx.setStorageSync(r, 1)
      } catch (t) {}
      i = 1
      n.page_share_count = i
    } else {
      i = parseInt(wx.getStorageSync(r)) + 1
      n.page_share_count = i
      try {
        wx.setStorageSync(r, i)
      } catch (t) {}
    }
    // 发送用户信息
    f(function(t) {
      var a = ''
      try {
        a = wx.getStorageSync('aldstat_uuid')
      } catch (t) {
        a = 'uuid-getstoragesync'
      }
      t['userInfo']['uu'] = a
      u(t['userInfo'], 'GET', 'u.html')
    })

    var g = t[1]
    if (typeof t[1]['success'] === 'undefined') {
      t[1]['success'] = function(t) {}
    }
    if (typeof t[1]['fail'] === 'undefined') {
      t[1]['fail'] = function(t) {}
    }
    var w = t[1]['fail'] // origin fail function
    var y = t[1]['success'] // origin success function
    t[1]['success'] = function(t) {
      // t 为微信文档中的option参数
      var a = new Array()
      if (typeof t['shareTickets'] === 'object') {
        for (var e = 0; e < t['shareTickets'].length; e++) {
          v(n, t['shareTickets'][e], 'user') //
        }
      }
      h(n, 'event', 'ald_share_status', JSON.stringify(t))
      y(t)
    }
    t[1]['fail'] = function(t) {
      h(n, 'event', 'ald_share_status', 'fail')
      w(t)
    }
    return t[1]
  }

  /**
   * @param  {String} t Page path query 把query转换为Obj
   */
  var j = function(t) {
    var a = new Object()
    if (t.indexOf('?') != -1) {
      var e = t.split('?')[1]
      var s = e.split('&')
      for (var n = 0; n < s.length; n++) {
        a[s[n].split('=')[0]] = unescape(s[n].split('=')[1])
      }
    } else {
      a = t
    }
    return a
  }
  var N = App
  App = function(t) {
    d(t, 'onLaunch', y)
    d(t, 'onUnlaunch', w)
    d(t, 'onShow', x)
    d(t, 'onHide', k)
    d(t, 'onError', S)
    N(t)
  }
  var J = Page
  Page = function(t) {
    d(t, 'onLoad', A)
    d(t, 'onUnload', b)
    d(t, 'onShow', I)
    d(t, 'onHide', T)
    d(t, 'onReachBottom', O)
    d(t, 'onPullDownRefresh', E)
    if (typeof t['onShareAppMessage'] != 'undefined') {
      c(t, 'onShareAppMessage', G)
    }
    J(t)
  }
})()
