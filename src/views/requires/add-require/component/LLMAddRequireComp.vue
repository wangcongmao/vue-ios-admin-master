<template>
  <div id="add-require">

    <h2 v-if="false">context</h2>
    <el-card v-if="false" class="box-card">
      <el-form ref="form" label-width="80px">
        <el-form-item v-for="context in allContexts" :key="context" :label="context+':'">
          <span v-if="selectCon.has(context)">
            <el-select v-model="userCon[context]" placeholder="请选择" style="width:70%">
              <el-option v-for="se in variableSet[context]" :key="se" :value="se" :label="se" />
            </el-select>
          </span>

          <span v-else>
            <el-input v-model="userCon[context]" placeholder="请输入" size="small" style="width:70%" />
          </span>
        </el-form-item>
      </el-form>
    </el-card>
    <br>
    <h2>生成意图树</h2>
    <br>
    <tree-table :data="iTree" :is-tree="true" />

    <el-row>
      <el-button type="info" size="mini" @click="changeShow">
        {{ showRewrite ? '查看原始输入' : '查看重写结果' }}
      </el-button>
      <el-button type="success" size="mini" @click="rewriteGoalTree">需求重写</el-button>
      <el-button size="mini" @click="$emit('tmp-save')">临时保存</el-button>
      <el-button type="primary" size="mini" @click="$emit('submit')">提交</el-button>
    </el-row>
    <br>
    <div v-if="rewriteResults.length !== 0">
      <div v-for="(result, index) in rewriteResults" :key="index">
        <h3>重写结果{{ index+1 }}</h3>
        <tree-table :data="[result]" :is-tree="true" />
        <el-row>
          <el-button type="primary" size="mini" @click="selectThisRewriteRes(result)">选择当前结果</el-button>
        </el-row>
      </div>
    </div>
  </div>
</template>

<script>
import TreeTable from '../../component/TreeTable'
import { variableSet, allContexts, defaultCon, selectCon } from '../context-opt'
import jiff from 'jiff'

const diffRegExp = /parent|__|Id|has/
export default {
  name: 'AddRequire',
  components: {
    TreeTable
  },
  props: [
    'iTree'
  ],
  data() {
    return {
      userInput: {},
      rewriteResults: [],
      selectRewriteResult: {},
      showRewrite: false,
      userCon: JSON.parse(JSON.stringify(defaultCon)),
      variableSet: variableSet,
      allContexts: allContexts,
      selectCon: selectCon,
      hasRewrote: false
    }
  },
  computed: {
    username() {
      return this.$store.getters.userinfo.name
    }
  },
  methods: {
    changeShow() {
      if (this.showRewrite) {
        // 切换成用户输入
        this.showRewrite = false
        this.selectRewriteResult = this.setTree(this.input)
      } else {
        // 切换成重写建议
        if (typeof this.selectRewriteResult.id === 'undefined') {
          this.$message({
            message: '请先进行重写操作',
            type: 'error'
          })
        } else {
          this.showRewrite = true
          this.input = this.setTree(this.selectRewriteResult)
        }
      }
    },
    selectThisRewriteRes(result) {
      this.selectRewriteResult = result
      this.changeShow()
    },
    setTree(node) {
      const res = this.iTree.pop()
      this.iTree.push(node)
      return res
    },
    rewriteResDiff(results) {
      return results.map(result => {
        const patches = jiff.diff(this.iTree[0], result).filter(diff => {
          return !diffRegExp.test(diff.path)
        })
        const newPatch = []
        console.log(patches)
        patches.forEach(diff => {
          console.log(diff)
          if (diff.path.includes('restricts')) {
            // console.log(diff)
            if (diff.op === 'add') {
              diff.value['op'] = 'add'
              newPatch.push(diff)
            } else {
              newPatch.push(diff)
            }
            // TODO 替换的约束怎么表示
            // if (diff.op === 'test') {
            //   diff.op = 'replace'
            //   diff.value['op'] = 'remove'
            //   newPatch.push(diff)
            // }
          } else {
            // diff.value.goal['op'] = 'add'  todo gym注释掉这一行，但是没弄明白呢
            newPatch.push(diff)
          }
        })
        const iTreeCopy = jiff.clone(this.iTree[0])
        return jiff.patch(newPatch, iTreeCopy)
      })
    },
    rewriteGoalTree() {
      this.$ajax.post(`${process.env.VUE_APP_REQUIRE_BASE_URL}/api/rewrite`, this.iTree[0]).then((response) => {
        if (response.data.length === 0) {
          this.$message({
            message: '没有重写建议',
            type: 'warning'
          })
        } else {
          this.rewriteResults = this.rewriteResDiff(response.data)
          this.hasRewrote = true
          this.$message({
            message: '重写成功',
            type: 'success'
          })
        }
      }).catch((res) => {
        this.$message({
          message: '重写失败',
          type: 'warning'
        })
      })
    }
  }
}
</script>

<style scoped>
#add-require {
  text-align: center;
}
.box-card {
  width: 30%;
  margin: auto;
}

</style>
