<template>
  <div>
    <add-require-comp :i-tree="iTree" @submit="uploadGoalTree" @tmp-save="tmpSave" />
  </div>
</template>

<script>
import AddRequireComp from '@/views/requires/add-require/component/AddRequireComp'
import request from '@/utils/request2'

export default {
  name: 'AddRequire',
  components: {
    AddRequireComp
  },
  data() {
    return {
      iTree: [{
        id: 0,
        goal: {
          content: 'goal',
          restricts: [],
          optTargets: []
        },
        children: []
      }]
    }
  },
  computed: {
    username() {
      return this.$store.getters.userinfo.name
    }
  },
  methods: {
    tmpSave() {
      this.$ajax.post(`${process.env.VUE_APP_REQUIRE_BASE_URL}/api/temp-save-itree?requireId=-1`, {
        user: this.username,
        data: this.iTree,
        contexts: this.userCon
      }).then((response) => {
        this.$message({
          message: '保存成功',
          type: 'success'
        })
      })
    },
    uploadGoalTree() {
      this.$ajax.post(`${process.env.VUE_APP_REQUIRE_BASE_URL}/api/upload-goal-tree`, {
        user: this.username,
        data: this.iTree,
        contexts: this.userCon
      }).then((response) => {
        this.$message({
          message: '提交成功',
          type: 'success'
        })
        return response.data
      }).then(res => {
        // 保存需求同时为它创建一条solution
        request.get(`/solution/create?creator=${this.username}&requireId=${res}&description=${this.iTree[0].goal.content}`)
      }).catch((respose) => {
        this.$message.error('提交失败')
      })
    }
  }
}
</script>

<style scoped>
</style>
