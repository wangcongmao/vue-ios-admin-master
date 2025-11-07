<template>
  <div class="all-rps">
    <h1 style="text-align: center">
      需求模式挖掘
    </h1>
    <br>
    <el-card>
      <el-form ref="form" label-width="80px" :inline="true">
        <el-form-item label="名称:">
          <el-select v-model="mineParam.mode" placeholder="请选择活动区域">
            <el-option v-for="item in mineMode" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="开始时间:">
          <el-date-picker
            v-model="mineParam.startTime"
            type="date"
            placeholder="选择日期"
            value-format="yyyy-MM-dd"
          />
        </el-form-item>
        <el-form-item label="结束日期:">
          <el-date-picker
            v-model="mineParam.endTime"
            type="date"
            placeholder="选择日期"
            value-format="yyyy-MM-dd"
          />
        </el-form-item>
        <el-form-item label="支持度:">
          <el-input v-model="mineParam.support" placeholder="请输入最小支持度" size="small" />
        </el-form-item>
        <el-form-item label="保留粒度:">
          <el-input v-model="mineParam.minGrading" placeholder="请输入最小保留粒度" size="small" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="mineRP()">立即挖掘</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <br>
    <h2 style="text-align: center">
      新挖掘的服务模式
    </h2>
    <br>
    <el-table :data="tableListData" :row-style="toggleDisplayTr" border stripe class="init_table" size="small">
      <!--            目标树-->
      <el-table-column label="目标" min-width="150" show-overflow-tooltip align="left">
        <template slot-scope="scope">
          <p :style="`margin-left: ${scope.row.__level * 15}px;margin-top:0;margin-bottom:0`">
            <i class="permission_toggleFold" :class="toggleFoldingClass(scope.row)" @click="toggleFoldingStatus(scope.row)" />
            {{ scope.row.goal.content }}
          </p>
        </template>
      </el-table-column>
      <!--            显示约束-->
      <el-table-column align="center" min-width="200" label="约束">
        <template slot-scope="scope">
          <el-tag v-for="restrict in scope.row.goal.restricts" :key="restrict.key" size="mini">
            {{ getRestrictString(restrict) }}
          </el-tag>
        </template>
      </el-table-column>
    </el-table>
    <br>
    <el-button
      type="primary"
      icon="el-icon-plus"
      circle
      class="add-rp"
      @click="$router.push({path:'/requires/add-rp/index'})"
    />

    <el-dialog :visible.sync="showDialog" :fullscreen="true">
      <div v-if="showDialog" style="text-align: center;">
        <el-card class="box-card">
          <el-form ref="form" label-width="80px">
            <el-form-item label="名称:">
              <el-input v-model="info.name" placeholder="请输入" size="small" />
            </el-form-item>
            <el-form-item label="功能描述:">
              <el-input v-model="info.description" placeholder="请输入" size="small" />
            </el-form-item>
            <el-form-item label="业务领域:">
              <el-input v-model="info.domain" placeholder="请输入" size="small" />
            </el-form-item>
          </el-form>
        </el-card>
        <br>
        <tree-table :data="requirePattern" :is-tree="false" @submit="modifyRp" />
      </div>
    </el-dialog>
  </div>

</template>

<script>
import { handleTime } from '../all-requires/util'
import { getRestrictString } from '../all-requires/restrict-options'
import TreeTable from '../component/TreeTable'

export default {
  name: 'MineRp',
  components: { TreeTable },
  data() {
    return {
      data: [],
      selectedRP: {
        info: {}
      },
      detail: '',
      foldList: [],
      mineParam: {
        mode: 'last-time',
        startTime: '',
        endTime: '',
        support: -1,
        minGrading: -1
      },
      requirePattern: [{
        id: 0,
        goal: {
          content: 'goal',
          restricts: []
        },
        children: []
      }],
      selectRpId: -1,
      showDialog: false,
      mineMode: [
        {
          value: 'specify',
          label: '指定时间范围'
        },
        {
          value: 'last-time',
          label: '从上次结束时开始'
        },
        {
          value: 'all',
          label: '挖掘全部需求'
        }
      ]
    }
  },
  computed: {
    tableListData: function() {
      return this.formatConversion([], this.selectedRP.data || [])
    }
  },
  mounted() {
    this.getAllRPs()
  },
  methods: {
    rowClick(row) {
      this.selectedRP = row
    },
    getRestrictString,
    getAllRPs() {
      this.$ajax.get(`${process.env.VUE_APP_REQUIRE_BASE_URL}/api/get-all-rps`).then(response => {
        this.data = response.data
      })
    },
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
    formatConversion(parent, children, index = 0, family = [], elderIdentity = 'x') {
      // children如果长度等于0，则代表已经到了最低层
      // let page = (this.startPage - 1) * 10
      if (children.length > 0) {
        children.map((x, i) => {
          // 设置 __level 标志位 用于展示区分层级
          this.$set(x, '__level', index)
          // 设置 __family 为家族关系 为所有父级，不包含本身在内
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
    modifyRpDialog(scope) {
      const rpId = scope.row.info.rpId
      this.selectRPId = rpId
      this.requirePattern = scope.row.data
      this.info.name = scope.row.info.name
      this.info.description = scope.row.info.description
      this.info.domain = scope.row.info.domain
      this.showDialog = true
    },
    modifyRp() {
      this.$ajax.post(`${process.env.VUE_APP_REQUIRE_BASE_URL}/api/modify-rp?rpId=${this.selectRPId}`, {
        info: this.info,
        data: this.requirePattern }
      ).then(_ => {
        this.showDialog = false
        this.getAllRPs()
      })
    },
    handleTime: handleTime,
    mineRP() {
      let start = -1
      let end = -1
      if (this.mineParam.mode === 'specify') {
        start = this.mineParam.startTime
        if (start === '') {
          this.$message.error('请输入开始日期')
          return
        }
      }
      if (this.mineParam.mode !== 'all') {
        end = this.mineParam.endTime
        if (end === '') {
          this.$message.error('请输入结束日期')
          return
        }
      }
      const sup = this.mineParam.support
      const grad = this.mineParam.minGrading
      console.log(`${process.env.VUE_APP_RP_MINER_BASE_URL}/api/rp-miner?start=${start}&end=${end}&sup=${sup}&grad=${grad}`)
      this.$ajax.get(`${process.env.VUE_APP_RP_MINER_BASE_URL}/api/rp-miner?start=${start}&end=${end}&sup=${sup}&grad=${grad}`).then(res => {
        this.selectedRP = {
          data: res.data,
          info: {
            name: '新挖掘的需求模式'
          }
        }
      })
    }
  }
}
</script>

<style lang='stylus' rel='stylesheet/stylus'>
  .all-rps
    height 100%
    .mother-table
      margin 0 auto !important
      th
        padding 0 !important
        height 30px !important
      td
        padding 0 !important
        height 30px !important
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
    .add-rp
      position fixed
      right 5%
      bottom 10%
    .box-card {
      width: 60%;
      margin: auto;
    }
</style>
