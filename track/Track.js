import _ from './utils'
import KMC from './config'
import kmConfig from './kmConfig'
import wxu from './wxUtils'
// KM class 类
function KM(t) {
  this.app = t
}
/*
  km.track() 自定义事件
*/
KM.prototype['track'] = function(t, a) {
  if (!_.isFormatString(t)) {
    return false
  }
  if (_.isFormatString.length >= 255) {
    return false
  }
  if (typeof a === 'object') {
    for (var e in a) {
      if (!_.isFormatString(e)) {
        return false
      }
      if (_.isObject(a[e])) {
        return false
      }
      if (!_.isFormatString(a[e])) {
        return false
      }
    }
    wxu.sendCSTrack(t, JSON.stringify(a))
  } else {
    if (typeof a === 'string' && a.length <= 255) {
      if (_.isFormatString(a)) {
        var s = String(a)
        var n = new Object()
        n[s] = a
        wxu.sendCSTrack(t, a)
      }
    } else {
      wxu.sendCSTrack(t, false)
    }
  }
}

KM.prototype['indentify'] = function(openid) {
  if (!_.isFormatString(openid)) {
    console.log(openid + ' not correct openid')
    return false
  }

  var originUUID = wxu.getUUID()

  try {
    wx.setStorageSync(KMC.prefix + 'uuid', openid)
  } catch (e) {
    console.log(e)
    return false
  }

  var originUSCTag = KMC.prefix + '' + originUUID + 'USC'
  var originUSC = ''
  try {
    originUSC = wx.getStorageSync(originUSCTag)
  } catch (e) {
    console.log(e)
  }

  var changedUSCTag = KMC.prefix + '' + openid + 'USC'
  try {
    wx.setStorageSync(changedUSCTag, originUSC)
  } catch (e) {}
}

KM.prototype['register'] = function(obj) {
  if (_.isEmptyObject(obj)) {
    console.log('args is not correct')
    return false
  }

  var arrKey = []
  try {
    for (var k in obj) {
      wx.setStorageSync(KMC.prefix + '' + k, obj[k])
      arrKey.push(k)
    }
  } catch (e) {
    console.log('KM register error: wx.setStorageSync ' + e)
  }

  try {
    wx.setStorageSync(kmConfig.token, arrKey.join(','))
  } catch (e) {
    console.log('KM register error: wx.setStorageSync ' + e)
  }
}

export default KM
