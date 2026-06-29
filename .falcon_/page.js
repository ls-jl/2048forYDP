//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

function formatDateTimeStr(now)
{
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  const hour = now.getHours().toString().padStart(2, '0');
  const minute = now.getMinutes().toString().padStart(2, '0');
  const second = now.getSeconds().toString().padStart(2, '0');

  return `${year}-${month}-${day} ${hour}:${minute}:${second}`
}

var script = {
  name: 'page',
  data() {
    return {
      dateStr: formatDateTimeStr(new Date()),
    }
  },
  mounted() {
    // this.$page.setInterval 创建的 timer 在页面退出时会自动释放, 在 base-page.js 中统一管理
    this.$page.setInterval(() => this.dateStr = formatDateTimeStr(new Date()) , 1000);
  },
  methods: {
    onShow() {
      // 页面显示生命周期, 此时可获取页面参数, 在 base-page.js 中统一调度
      console.log(`options ${JSON.stringify(this.$page.options)}`);
    },
    jump() {
      $falcon.navTo('index', { from: 'page' });
    },
    finishApp() {
      this.$app.finish();
    },
    finishPage() {
      this.$page.finish();
    },
  },
};

var style_0 = { "_": {
  "text": {
    "fontSize": "16px",
    "color": "#34495e"
  },
  "wrapper": {
    "justifyContent": "center",
    "alignItems": "center"
  },
  "btn": {
    "marginTop": "10px",
    "marginRight": "10px",
    "marginBottom": "10px",
    "marginLeft": "10px",
    "paddingTop": 0,
    "paddingRight": "20px",
    "paddingBottom": 0,
    "paddingLeft": "20px",
    "fontSize": "24px",
    "color": "#727272",
    "borderRadius": "6px",
    "boxShadow:active": "0px 0px 5px #646566"
  },
  "greeting": {
    "textAlign": "center",
    "marginTop": "20px",
    "marginRight": "0px",
    "marginBottom": "20px",
    "marginLeft": "0px",
    "fontSize": "34px",
    "color": "#41b883"
  }
} };

var render = function (){
var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    staticClass: ["wrapper"]
  }, [_c('text', {
    staticClass: ["greeting"]
  }, [_vm._v("Multi-page application")]), _c('div', {
    staticStyle: {
      rowGap: "10px"
    }
  }, [_c('text', {
    staticClass: ["text"]
  }, [_vm._v(_vm._s(_vm.dateStr))]), _c('text', {
    staticClass: ["text"]
  }, [_vm._v("options \"from\": " + _vm._s(_vm.$page.options['from']))])]), _c('div', {
    staticStyle: {
      flexDirection: "row",
      marginTop: "20px"
    }
  }, [_c('text', {
    staticClass: ["btn"],
    on: {
      "click": _vm.jump
    }
  }, [_vm._v("back")]), _c('text', {
    staticClass: ["btn"],
    on: {
      "click": _vm.finishPage
    }
  }, [_vm._v("finish")])])])
};

var staticRenderFns=[];
render._withStripped = true;
  
const __file = 'src/pages/page/page.vue';
const _scopeId = 'data-v-38915e8a';

const _exports = script;

_exports.render = render;
_exports.staticRenderFns = staticRenderFns;
_exports._compiled = true;
_exports._scopeId = _scopeId;
_exports.themes = {};
_exports.style = Object.assign({}, style_0['_']);
_exports.__file = __file;

export { _exports as default };
