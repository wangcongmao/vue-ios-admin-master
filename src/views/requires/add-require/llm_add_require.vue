<template>
  <div id="llm-add-require">
    <h1>新增需求</h1>
    <div id="llm-add-require-text">
      <h2>需求文本</h2>
      <el-input
        v-model="requiretext"
        type="textarea"
        :autosize="{ minRows: 3, maxRows: 8 }"
        placeholder="请输入需求"
        style="width: 70%"
      />
    </div>
    <div>
      <el-button type="success" size="mini" @click="toGoalTree">意图树生成</el-button>
      <p v-if="showFlag">获取中</p>
    </div>
    <llm-add-require-comp :i-tree="iTree" @submit="uploadGoalTree" @tmp-save="tmpSave" />
  </div>

</template>

<script>
import llmAddRequireComp from '@/views/requires/add-require/component/LLMAddRequireComp'
import request from '@/utils/request2'

export default {
  name: 'AddRequire',
  components: {
    llmAddRequireComp
  },
  data() {
    return {
      requiretext: '',
      iTree: [{
        id: 0,
        goal: {
          content: 'goal',
          restricts: [],
          optTargets: []
        },
        children: []
      }],
      showFlag: false
    }
  },
  computed: {
    username() {
      return this.$store.getters.userinfo.name
    }
  },
  methods: {
    toGoalTree() {
      this.showFlag = true
      this.$ajax.post(`${process.env.VUE_APP_LLM_URL}/api`, { text: this.requiretext }
      ).then((response) => {
        // if (response.data.length === 0) {
        //   this.$message({
        //     message: '没有重写建议',
        //     type: 'warning'
        //   })
        // } else {
        //   this.rewriteResults = this.rewriteResDiff(response.data)
        //   this.hasRewrote = true
        //   this.$message({
        //     message: '重写成功',
        //     type: 'success'
        //   })
        // }
        console.log(response)
        this.iTree.pop()
        this.iTree.push(response.data)
        this.showFlag = false
      }).catch((res) => {
        console.log(res)
        this.$message({
          message: '重写失败',
          type: 'warning'
        })
        this.showFlag = false
      })
    },
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
#llm-add-require {
  text-align: center;
  margin-top: 20px;
}

#llm-add-require-text {
  margin-top: 20px;
  margin-bottom: 20px;
}

::-webkit-scrollbar {
  width: 8px; /*滚动条宽度*/
  height: 8px; /*滚动条高度*/
}

.el-textarea__inner::-webkit-scrollbar-thumb {
  background-color: rgba(168, 168, 168, .4); /*滚动条默认显示的颜色*/
}

.el-textarea__inner::-webkit-scrollbar {
  width: 8px;
  height: 8px;
  background-color: white; /*滚动条背景色显示的颜色*/
}
</style>
