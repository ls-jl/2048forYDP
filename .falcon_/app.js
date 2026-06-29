function _collectFalconEventIds(name, callback)
{
  const evtList = $falcon.eventMap[name];
  if (evtList) {
    if (callback) {
      const index = evtList.findIndex(item => item.callback === callback || item.id === callback);
      if (index !== -1) {
        return [evtList[index].id]
      }
    } else {
      return evtList.map((item) => item.id)
    }
  }
  return []
}

class PageRes extends $falcon.Page {
  constructor() {
    super();
    this.falconOnTokens = [];  // [[token, name], ...]
    this.timeoutTokens = new Set();  // [token, ...]
    this.intervalTokens = new Set();  // [token, ...]
  }

  on(name, callback) {
    const token = $falcon.on(name, callback);
    this.falconOnTokens.push([token, name]);
    return token
  }

  off(name, callback) {
    const falconOnTokens2 = [];
    let idsWillRemoved = _collectFalconEventIds(name, callback);
    idsWillRemoved = new Set(idsWillRemoved);
    for (let [token, name] of this.falconOnTokens) {
      if (idsWillRemoved.has(token)) {
        continue
      }
      falconOnTokens2.push([token, name]);
    }
    this.falconOnTokens = falconOnTokens2;

    $falcon.off(name, callback);
  }
  trigger(name, options) {
    $falcon.trigger(name, options);
  }
  setTimeout(func, ms) {
    const token = setTimeout(() => {
      this.timeoutTokens.delete(token);
      func();
    }, ms);
    this.timeoutTokens.add(token);
    return token
  }
  setInterval(func, ms) {
    const token = setInterval(func, ms);
    this.intervalTokens.add(token);
    return token
  }
  clearTimeout(token) {
    this.timeoutTokens.delete(token);
    clearTimeout(token);
  }
  clearInterval(token) {
    this.intervalTokens.delete(token);
    clearInterval(token);
  }
  release() {
    for (let [token, name] of this.falconOnTokens) {
      $falcon.off(name, token);
    }
    this.falconOnTokens.length = 0;
    for (let token of this.timeoutTokens) {
      clearTimeout(token);
    }
    this.timeoutTokens.clear();
    for (let token of this.intervalTokens) {
      clearInterval(token);
    }
    this.intervalTokens.clear();
  }
}

class BasePage extends PageRes {
  /**
   * 构造函数,页面生命周期内只执行一次
   */
  constructor() {
    super();
  }

  // some Util
  async sleep(ms) {
    return new Promise((resolve) => {
      this.setTimeout(() => {
        resolve();
      }, ms);
    })
  }


  /**
   * 页面生命周期:首次启动
   * @param Object options 页面启动参数
   */
  onLoad(options) {
    super.onLoad(options);
    this.options = options;
  }

  /**
   * 页面生命周期:页面重新进入
   * 其他应用或者系统通过$falcon.navTo()方法重新启动页面.可以通过这个回调拿到新启动的参数
   * @param Object options 重新启动参数
   */
  onNewOptions(options) {
    super.onNewOptions(options);
    this.options = options;
  }

  /**
   * 页面生命周期:页面进入前台
   */
  onShow() {
    super.onShow();

    //onshow以后组件才创建,可以调用组件的方法
    if (this.$root.onShow) {
      this.$root.onShow();
    }
  }

  /**
   * 页面生命周期:页面进入后台
   */
  onHide() {
    super.onHide();
    if (this.$root.onHide) {
      this.$root.onHide();
    }
  }

  /**
   * 页面生命周期:页面卸载
   */
  onUnload() {
    try {
      super.onUnload();
      if (this.$root.onUnload) {
        this.$root.onUnload();
      }
    } finally {
      if (this.release) {
        // to call PageRes release method
        this.release();
      }
    }
  }

  beforeVueInstantiate(Vue) {
    try {
      Vue.prototype.$workspace = globalThis.$workspace;
      Vue.prototype.$appid = globalThis.$appid;
    } catch (err) {
      console.log(err);
    }
  }
}

class App extends $falcon.App {
  /**
   * 构造函数,应用生命周期内只构造一次
   */
  constructor() {
    super();
  }

  /**
   * 应用生命周期:应用启动. 初始化完成时回调,全局只触发一次.
   * @param {Object} options 启动参数
   */
  onLaunch(options) {
    super.onLaunch(options);
    // 屏幕分辨率适配机制:
    // 当 viewPort 设置750时, 所有元素尺寸可按照设计稿为 750px 宽度标准编写,
    // 最后系统会动态计算屏幕实际尺寸并显示.
    // this.setViewPort(750)

    // 设置页面基类,应用全局的$falcon.Page将被替换成此处指定的BasePage.
    // 继承自$falcon.Page的页面将继承自改基类.
    // 如页面未指定js,直接指向.vue文件,页面创建时会默认创建该类的实例
    $falcon.useDefaultBasePageClass(BasePage);
  }

  /**
   * 应用生命周期,应用启动或应用从后台切换到前台时触发
   */
  onShow() {
    super.onShow();
  }

  /**
   * 应用生命周期:应用退出前或者应用从前台切换到后台时触发
   */
  onHide() {
    super.onHide();
  }

  /**
   * 应用生命周期:应用销毁前触发
   */
  onDestroy() {
    super.onDestroy();
  }
}

try {
  globalThis['window'] = {
    requestAnimationFrame,
    cancelAnimationFrame
  };
} catch (err) {
  console.log(err);
}

try {
  globalThis['process'] = {
    env: {
      NODE_ENV: 'production'
    }
  };
} catch (err) {
  console.log(err);
}

var App$1 = App;

App$1.meta = {
  "pages": {
    "index": "pages/index/index.vue",
    "page": "pages/page/page.vue"
  },
  "options": {
    "style": {
      "lessPaths": [
        "styles"
      ]
    }
  }
};
App$1.meta.name = '2048';
App$1.meta.version = '0.1.1';
App$1.meta.isSingleJsBundle = false;
$falcon.__AppClazz = App$1;
$falcon.__loadModuleDefault = async function (fileName) {
  if(App$1.__pages && App$1.__pages[fileName]){
    return App$1.__pages[fileName];
  } else {
    try{
      const pagePath = './' + fileName + '.js';
      let mod = await import(pagePath);
      return mod.default;
    } catch(e){
      console.log(e.message, e.stack);
    }
  }
};
