<template>
  <div class="tree-table">
    <el-table :data="tableListData" :row-style="toggleDisplayTr" border stripe class="init_table" size="small">
      <!--            目标树-->
      <el-table-column label="目标" min-width="150" show-overflow-tooltip align="left">
        <template slot-scope="{row}">
          <p :style="`margin-left: ${row.__level * 15}px;margin-top:0;margin-bottom:0`">
            <i class="permission_toggleFold" :class="toggleFoldingClass(row)" @click="toggleFoldingStatus(row)" />
            <el-autocomplete
              v-if="isTree"
              v-model="row.goal.content"
              size="mini"
              :fetch-suggestions="getAllGoalAdvice"
              placeholder="请输入"
              @focus="getGoalAdviceByParent(row)"
            />
            <el-input v-else v-model="row.goal.content" :placeholder="row.goal.content" size="mini" class="goal-input" />
          </p>
        </template>
      </el-table-column>
      <!--            显示约束-->
      <el-table-column align="center" min-width="200" label="约束">
        <template slot-scope="scope">
          <span v-if="isTree">
            <el-tag v-for="(target, index) in scope.row.goal.optTargets" :key="index" size="mini" type="info">
              {{ target.name + ':' + target.weight }}
            </el-tag>
          </span>
          <el-tag v-for="restrict in scope.row.goal.restricts" :key="restrict.key" size="mini">
            {{ getRestrictString(restrict) }}
          </el-tag>
        </template>
      </el-table-column>
      <!--            操作-->
      <el-table-column align="center" min-width="100" label="操作">
        <template slot-scope="scope">
          <el-button type="text" @click="handleAdd(scope)">增加</el-button>
          <el-button type="text" @click="handleDelete(scope)">删除</el-button>
          <el-button type="text" @click="showDialog(scope)">编辑约束</el-button>
          <el-button v-if="isTree" type="text" @click="showTargetDialog(scope)">编辑目标</el-button>
        </template>
      </el-table-column>
    </el-table>
    <br>
    <el-row>
      <el-button v-if="!isTree" type="success" size="mini" @click="handleAddTop">增加顶级节点</el-button>
      <el-button v-if="!isTree" type="primary" size="mini" @click="$emit('submit')">提交</el-button>
    </el-row>
    <!--        TODO 封装成组件-->
    <el-dialog :styles="{width:'40%'}" :visible.sync="visible" title="编辑约束" :before-close="closeDialog">
      <el-table :data="goalRestricts" class="restricts_table">
        <el-table-column align="center" label="约束名">
          <template slot-scope="{row}">
            <el-autocomplete
              v-if="isTree"
              v-model="row.key"
              size="mini"
              :fetch-suggestions="resSearch"
              placeholder="请输入"
              @focus="getResAdvice"
              @select="item => {handleResSelect(item, row)}"
            />
            <el-input v-else v-model="row.key" type="text" :placeholder="row.key" size="small" />
          </template>
        </el-table-column>
        <el-table-column align="center" label="约束类型">
          <template slot-scope="{row}">
            <el-select v-model="row.valueType" placeholder="请选择" size="small">
              <el-option
                v-for="item in options"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column align="center" label="约束值">
          <template slot-scope="{row}">
            <template v-if="row.valueType==='region'">
              min:<el-input v-model="row.minValue" :placeholder="''+row.minValue" size="mini" />
              max:<el-input v-model="row.maxValue" :placeholder="''+row.maxValue" size="mini" />
              unit:<el-input v-model="row.unit" :placeholder="row.unit" size="mini" />
            </template>
            <template v-else-if="row.valueType==='after'">
              <el-select
                v-model="selectedTimeResGoal"
                placehoder="请选择"
                :transfer="true"
                size="small"
                @visible-change="handleTimeRes(row)"
              >
                <el-option v-for="item in goalBrother" :key="item.__identity" :value="JSON.stringify(item)" :label="item.goal.content" />
              </el-select>
            </template>
            <template v-else>
              <el-input v-model="row.value" type="text" :placeholder="row.value" size="small" />
            </template>
          </template>
        </el-table-column>
        <el-table-column align="center" label="操作">
          <template slot-scope="{row}">
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteRestrict(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <br>
      <el-row>
        <el-button type="primary" size="mini" @click="addRestrict()">增加约束</el-button>
        <el-button type="success" size="mini" @click="handleDialogConfirm">确定</el-button>
      </el-row>
      <br>
      <!--                        {{goalRestricts}}-->
    </el-dialog>
    <el-dialog :styles="{width:'40%'}" :visible.sync="targetVisible" title="编辑优化目标" :before-close="closeDialog">
      <el-table :data="goalOptTargets">
        <el-table-column align="center" label="优化目标">
          <template slot-scope="{row}">
            <el-select v-model="row.name" placeholder="请选择" size="small">
              <el-option
                v-for="(item, index) in targetOption"
                :key="index"
                :value="item"
                :label="item"
              />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column align="center" label="权重">
          <template slot-scope="{row}">
            <el-input v-model="row.weight" size="mini" />
          </template>
        </el-table-column>
        <el-table-column align="center" label="操作">
          <template slot-scope="{row}">
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="delOptTarget(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <br>
      <el-row>
        <el-button type="primary" size="mini" @click="addOptTarget()">增加优化目标</el-button>
        <el-button type="success" size="mini" @click="handleOptTargetConfirm()">确定</el-button>
      </el-row>
    </el-dialog>
    <br>
    <!--        {{data}}-->
    <br>
    <el-button
      type="primary"
      icon="el-icon-plus"
      circle
      class="add-button"
      @click="$router.go(0)"
    />
  </div>
</template>

<script>
let restrictNum = 0
let optNum = 0
import { getRestrictString } from '../all-requires/restrict-options'
import { targetOption } from './data'

export default {
  name: 'TreeTable',
  props: [
    'data',
    'isTree'
  ],
  data() {
    return {
      foldList: [],
      visible: false,
      initParam: {// 新增参数
        id: 0,
        goal: {
          content: 'goal',
          // TODO requireId为了解决matching中的data.goal.requireId warning，本身没有意义
          requireId: 0,
          restricts: [],
          optTargets: []
        },
        children: []
      },
      id: 1,
      // TODO 改成currentGoal
      goal: {},
      goalRestricts: [],
      goalRestrictsOld: [],
      goalBrother: [],
      // 选取时间约束时目标约束的对象
      selectedTimeResGoal: '',
      options: [
        {
          value: 'region',
          label: '区间'
        }, {
          value: 'enum',
          label: '枚举'
        }, {
          value: 'after',
          label: '时序(在...之后)'
        }, {
          value: 'service-provider',
          label: '服务提供者'
        }
      ],
      targetVisible: false,
      goalOptTargets: [],
      targetOption: targetOption,
      goalAdviceByParent: [],
      resAdvice: []

      //    TODO 把options移动到单独的文件中
    }
  },
  computed: {
    tableListData: function() {
      return this.formatConversion([], this.data)
    }
  },
  mounted() {
  },
  methods: {
    getRestrictString,
    toggleFoldingStatus(params) {
      this.foldList.includes(params.__identity) ? this.foldList.splice(this.foldList.indexOf(params.__identity), 1) : this.foldList.push(params.__identity)
    },
    toggleDisplayTr({ row, index }) {
      for (let i = 0; i < this.foldList.length; i++) {
        const item = this.foldList[i]
        // 如果foldList中元素存在于 row.__family中，则该行隐藏。  如果该行的自身标识等于隐藏元素，则代表该元素就是折叠点
        if (row.__family.includes(item) && row.__identity !== item) return 'display:none;'
      }
      return ''
    },
    toggleFoldingClass(params) {
      return params.children.length === 0 ? 'permission_placeholder' : (this.foldList.indexOf(params.__identity) === -1 ? 'el-icon-minus' : 'el-icon-plus')
    },
    // TODO 顶级节点的添加以及兄弟节点的获取
    formatConversion(parent, children, index = 0, family = [], elderIdentity = 'x') {
      // children如果长度等于0，则代表已经到了最低层
      // let page = (this.startPage - 1) * 10
      if (children.length > 0) {
        children.map((x, i) => {
          // 设置 __level 标志位 用于展示区分层级
          this.$set(x, '__level', index)
          // 设置 __family 为家族关系 为所有父级，包含本身在内
          this.$set(x, '__family', [...family])
          // 本身的唯一标识  可以理解为个人的身份证咯 一定唯一。
          this.$set(x, '__identity', elderIdentity + '_' + i)
          parent.push(x)
          // 如果仍有子集，则进行递归
          if (x.children.length > 0) {
            this.formatConversion(parent, x.children, index + 1, [...family, elderIdentity + '_' + i], elderIdentity + '_' + i)
          }
        })
      }
      return parent
    },
    handleAdd(scope) { // 新增节点
      const node = scope.row
      const obj = JSON.parse(JSON.stringify(this.initParam))
      obj.id = this.id++
      obj.goal.content += obj.id
      node.children.push(obj)
    },
    handleDelete(scope) { // 删除节点
      const node = scope.row
      if (node.children && node.children.length !== 0) {
        this.$message.error('此节点有子级，不可删除！')
        return false
      } else {
        // 删除操作
        const children = this.getBrotherById(node.__family)
        const index = children.findIndex(d => d.__identity === node.__identity)
        children.splice(index, 1)
      }
    },
    getBrotherById(ids) {
      if (ids.length > 0) {
        const parent = this.tableListData.filter((node) => {
          if (node.__identity === ids[ids.length - 1]) {
            return node
          }
        })
        return parent[0].children
      } else {
        return this.data
      }
    },
    handleAddTop() { // 添加顶部节点
      const obj = JSON.parse(JSON.stringify(this.initParam))// copy参数
      obj.id = this.id++
      obj.goal.content += obj.id
      this.data.push(obj)
    },
    addRestrict() {
      restrictNum += 1
      // TODO 可以提取出来
      this.goalRestricts.push({
        id: restrictNum,
        key: '',
        valueType: '',
        minValue: 0,
        maxValue: 9999,
        unit: 0,
        value: ''
      })
    },
    deleteRestrict(row) {
      const index = this.goalRestricts.findIndex(d => d.id === row.id)
      this.goalRestricts.splice(index, 1)
    },
    showDialog(scope) {
      const node = scope.row
      this.goal = node.goal
      this.goalRestricts = JSON.parse(JSON.stringify(node.goal.restricts))
      this.goalBrother = this.getBrotherById(node.__family).filter(item => {
        return item.id !== node.id
      })
      this.visible = true
    },
    handleTimeRes(row) {
      const node = JSON.parse(this.selectedTimeResGoal || '{}')
      if (typeof (node.id) !== 'undefined') {
        row.unit = node.id
        let time = 0
        node.goal.restricts.forEach(restrict => {
          if (restrict.valueType === 'after') {
            time = restrict.minValue + 1
          }
        })
        if (node.goal.restricts.length === 0) {
          time = 1
        }
        row.minValue = time
        row.value = node.goal.content
      }
    },
    handleDialogConfirm() {
      this.visible = false
      this.goal.restricts = this.goalRestricts
    },
    closeDialog(done) {
      this.$confirm('确认关闭？数据将不会被保存!', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(_ => {
        done()
      }).catch(_ => {})
    },
    showTargetDialog(scope) {
      const node = scope.row
      this.goal = node.goal
      this.goalOptTargets = JSON.parse(JSON.stringify(node.goal.optTargets))
      this.targetVisible = true
    },
    addOptTarget() {
      optNum += 1
      this.goalOptTargets.push({
        id: optNum,
        name: '',
        weight: 0
      })
    },
    delOptTarget(row) {
      const index = this.goalOptTargets.findIndex(d => d.id === row.id)
      this.goalOptTargets.splice(index, 1)
    },
    handleOptTargetConfirm() {
      this.targetVisible = false
      let sum = 0.0
      this.goalOptTargets.forEach(item => {
        sum += parseFloat(item.weight)
      })
      this.goalOptTargets.forEach(item => {
        item.weight = parseFloat(item.weight) / sum
      })
      this.goal.optTargets = this.goalOptTargets
    },
    getGoalAdviceByParent(goal) {
      let content = ''
      if (typeof goal.__family === 'undefined' || goal.__family.length === 0) {
        content = ''
      } else {
        const identity = goal.__family[goal.__family.length - 1]
        const index = this.tableListData.findIndex(d => d.__identity === identity)
        content = this.tableListData[index].goal.content
      }
      this.$ajax.get(`${process.env.VUE_APP_REQUIRE_BASE_URL}/api/recommend-req-by-parent?parentReq=${content}`).then(res => {
        this.goalAdviceByParent = res.data.map(item => ({
          value: item
        }))
      }).catch(_ => {
        this.goalAdviceByParent = [{ value: '网络错误' }]
      })
    },
    getAllGoalAdvice(queryString, cb) {
      this.$ajax.get(`${process.env.VUE_APP_REQUIRE_BASE_URL}/api/recommend-req-by-input?input=${queryString}`).then(res => {
        const cand = JSON.parse(JSON.stringify(this.goalAdviceByParent))
        res.data.forEach(item => {
          cand.push({ value: item })
        })
        cb(cand)
      }).catch(_ => {
        cb([{ value: '网络错误' }])
      })
    },
    getResAdvice() {
      const req = this.goal.content
      this.$ajax.get(`${process.env.VUE_APP_REQUIRE_BASE_URL}/api/recommend-res?req=${req}`).then(res => {
        this.resAdvice = res.data.map(item => ({
          value: this.getRestrictString(item),
          res: item
        }))
      }).catch(_ => {
        this.resAdvice = [{ value: '网络错误', res: {
          key: '',
          valueType: '',
          minValue: 0,
          maxValue: 9999,
          unit: 0,
          value: ''
        }
        }]
      })
    },
    resSearch(input, cb) {
      const resAdvice = this.resAdvice
      const results = input ? resAdvice.filter(item => {
        return item.res.key.indexOf(input) !== -1
      }) : resAdvice
      // 调用 callback 返回建议列表的数据
      cb(results)
    },
    handleResSelect(item, row) {
      const res = item.res
      row.key = res.key
      row.valueType = res.valueType
      row.minValue = res.minValue
      row.maxValue = res.maxValue
      row.value = res.value
      row.unit = res.unit
    }
  }
}
</script>

<style lang='stylus' rel='stylesheet/stylus'>
  .tree-table
    .goal-input
      width 300px
    .permission_toggleFold
      vertical-align middle
      padding-right 5px
      font-size 16px
      cursor pointer
    .permission_placeholder
      content ' '
      display inline-block
      width 24px
      font-size 16px
    .init_table
      width 90% !important
      margin 0 auto !important
      th
        padding 0 !important
        height 30px !important
        line-height 30px !important
        text-align: center !important
      td
        padding 0 !important
        height 30px !important
        line-height 30px !important
    .add-button
      position fixed
      right 5%
      bottom 10%
</style>
