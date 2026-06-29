<template>
  <div class="wrapper">
    <text class="greeting">{{ message }}, falcon!</text>
    <hello-world />
    <text class="btn" @click="jump">click to the next page</text>
  </div>
</template>

<script>
import HelloWorld from '@/components/HelloWorld.vue'
export default {
  name: 'index',
  components: { HelloWorld },
  data() {
    return {
      message: '',
    }
  },
  methods: {
    onShow() {
      this.message = 'Hello'
    },
    onHide() {
      console.log(`onHide called`)
    },
    jump() {
      $falcon.navTo('page', { from: 'index' })
    },
  },
}
</script>

<style lang="less" scoped>
@import "base.less";

.greeting {
  text-align: center;
  margin: 20px 0px;
  font-size: 50px;
  color: #41b883;
}

</style>
