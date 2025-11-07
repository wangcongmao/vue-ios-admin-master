<template>
  <div class="dashboard-container">
    <!--    <component :is="currentRole"   https://www.baidu.com/>-->
    <!--  <iframe id="predashboard" src="https://cx.o2o.bailingjk.net/webYygh/?hospitalCode=0530_0001&userId=403099432&openId=oRkDjsl6YwUIZxf724w40SbFzJ0Y&publicNoCode=gzh-0530_0001&patientId=405035926&t=2#/yygh/appointment" frameborder="0" scrolling="no" /> -->
<!--    <object data="http://ncd.bailingjk.com/rhms/patientsSigning/jumpSign?userId=B55E9647ADBBF9981C64A638D991AB1D&publicNoCode=gzh-0539_0003&mark=sign#" height="1000px" width="100%"></object>-->
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
// import adminDashboard from './admin'
// import editorDashboard from './editor'

export default {
  name: 'Dashboard',
  components: {
    // adminDashboard, editorDashboard
  },
  data() {
    return {
      currentRole: 'adminDashboard'
    }
  },
  computed: {
    ...mapGetters([
      'roles'
    ])
  },
  mounted() {
    const oIframe = document.getElementById('predashboard')
    const deviceWidth = document.documentElement.clientWidth
    const deviceHeight = document.documentElement.clientHeight
    oIframe.style.width = (Number(deviceWidth) - 220) + 'px' // 数字是页面布局宽度差值
    oIframe.style.height = (Number(deviceHeight) - 100) + 'px' // 数字是页面布局高度差
    console.log(deviceHeight)
    console.log(deviceWidth)
    // oIframe.style.width = '1366' + 'px'; //数字是页面布局宽度差值
    // oIframe.style.height = '768' + 'px'; //数字是页面布局高度差
  },
  created() {
    if (!this.roles.includes('admin')) {
      this.currentRole = 'editorDashboard'
    }
  }
}
</script>
