var util = require('./utils/util.js')
var api = require('./config/api.js')
var user = require('./services/user.js')

var km = require('./track/main')

App({
  onLaunch: function() {
    this.km.register({
      su: 'maolin'
    })
    wx.login()
    //获取用户的登录信息
    console.log(wx.getStorageSync('userInfo'))
    user
      .checkLogin()
      .then(res => {
        console.log(res)
        this.globalData.userInfo = wx.getStorageSync('userInfo')

        this.globalData.token = wx.getStorageSync('token')
      })
      .catch(() => {})
  },

  globalData: {
    userInfo: {
      nickname: 'Hi,游客',
      username: '点击去登录',
      avatar:
        'http://yanxuan.nosdn.127.net/8945ae63d940cc42406c3f67019c5cb6.png'
    },
    token: ''
  }
})
