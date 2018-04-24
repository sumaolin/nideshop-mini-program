function getNetworkType(a) {
  wx.getNetworkType({
    success: function(b) {
      a(b.networkType)
    }
  })
}

function getSystemInfo() {
  var a = wx.getSystemInfoSync()
  return {
    adt: encodeURIComponent(a.model),
    scl: a.pixelRatio,
    scr: a.windowWidth + 'x' + a.windowHeight,
    lg: a.language,
    fl: a.version,
    jv: encodeURIComponent(a.system),
    tz: encodeURIComponent(a.platform)
  }
}
