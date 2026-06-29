<template>
  <div class="wrapper">
    <text class="greeting">Multi-page application</text>
    <div style="row-gap: 10px;">
      <text class="text">{{ dateStr }}</text>
      <text class="text">options "from": {{ $page.options['from']}}</text>
    </div>

    <div style="flex-direction: row; margin-top: 20px;">
      <text class="btn" @click="jump">back</text>
      <text class="btn" @click="finishPage">finish</text>
    </div>
  </div>
</template>

<script>
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

export default {
  name: 'page',
  data() {
    return {
      dateStr: formatDateTimeStr(new Date()),
    }
  },
  mounted() {
    // this.$page.setInterval 创建的 timer 在页面退出时会自动释放, 在 base-page.js 中统一管理
    this.$page.setInterval(() => this.dateStr = formatDateTimeStr(new Date()) , 1000)
  },
  methods: {
    onShow() {
      // 页面显示生命周期, 此时可获取页面参数, 在 base-page.js 中统一调度
      console.log(`options ${JSON.stringify(this.$page.options)}`)
    },
    jump() {
      $falcon.navTo('index', { from: 'page' })
    },
    finishApp() {
      this.$app.finish()
    },
    finishPage() {
      this.$page.finish()
    },
  },
}

</script>

<style lang="less" scoped>
@import "base.less";

.greeting {
  text-align: center;
  margin: 20px 0px;
  font-size: 34px;
  color: #41b883;
}

</style>
