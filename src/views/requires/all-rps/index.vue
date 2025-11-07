<template>
  <div class="all-rps">
    <h1 style="text-align: center">
      需求模式维护
    </h1>
    <br>
    <div style="margin:auto;width: 30%">
      <el-input v-model="detail" placeholder="请输入需要搜索的内容">
        <el-button slot="append" icon="el-icon-search" @click="search" />
      </el-input>
    </div>
    <br>
    <el-table
      :data="data"
      style="width: 60%"
      class="mother-table"
      border
      highlight-current-row
      @row-click="rowClick"
    >
      <el-table-column prop="info.name" label="名称" align="center" />
      <el-table-column prop="info.description" label="描述" align="center" />
      <el-table-column prop="info.domain" label="业务领域" align="center" />
      <el-table-column prop="info.timestamp" label="创建时间" align="center">
        <template slot-scope="scope">
          {{ handleTime(scope.row.info.timestamp) }}
        </template>
      </el-table-column>
      <el-table-column prop="info.frequency" label="使用频率" align="center" />
      <el-table-column prop="info.support" label="支持度" align="center" />
      <el-table-column prop="info.fresh" label="新鲜度" align="center">
        <template slot-scope="scope">
          {{ handleTime(scope.row.info.fresh) }}
        </template>
      </el-table-column>
      <el-table-column align="center" width="100" label="操作">
        <template slot-scope="scope">
          <el-button type="text" @click="modifyRpDialog(scope)">修改</el-button>
        </template>
      </el-table-column>
    </el-table>
    <br>
    <h2 style="text-align: center">
      {{ selectedRP.info.name || '' }}
    </h2>
    <br>
    <el-table :data="tableListData" :row-class-name="toggleDisplayTr" border stripe class="init_table" size="small">
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
            <el-form-item label="档案:">
              <el-button @click="dialogVisible = true">关联健康档案</el-button>
              <record :visible.sync="dialogVisible" title="健康档案表单" @getRHData="RHData" />
              <el-tag v-for="(target, index) in rprhDataShow" :key="index" size="mini" type="success">
                {{ target.key + ':' + target.value }}
              </el-tag>
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
import Record from '../add-require/component/RecordComp'
import request from '@/utils/request-requires'
import { isString } from '@/utils/validate'
export default {
  name: 'AllRP',
  components: { TreeTable, Record },
  data() {
    return {
      data: [],
      selectedRP: {
        info: {}
      },
      detail: '',
      foldList: [],
      info: {
        name: '',
        description: '',
        domain: ''
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
      rpMinerDialog: {
        show: false,
        data: []
      },
      dialogVisible: false,
      rprhData: {}, // 前端存储array等形式的数据
      rprhDataShow: [],
      rprhDataBack: undefined, // 后台存储string形式的数据
      residentCategoryOptions: [{
        'label': '低保老人',
        'value': 1
      }, {
        'label': '特困老人（三无、低保等)',
        'value': 2
      }, {
        'label': '失独老人',
        'value': 3
      }, {
        'label': '重点优待对象',
        'value': 4
      }, {
        'label': '独居老人',
        'value': 5
      }, {
        'label': '空巢（留守）老人',
        'value': 6
      }, {
        'label': '失能老人',
        'value': 7
      }, {
        'label': '低保边缘等低收入群体',
        'value': 8
      }, {
        'label': '残疾',
        'value': 9
      }],
      consciousnessOptions: [{
        'label': '清醒',
        'value': 1
      }, {
        'label': '意识模糊',
        'value': 2
      }, {
        'label': '谵妄',
        'value': 3
      }, {
        'label': '嗜睡',
        'value': 4
      }, {
        'label': '昏睡',
        'value': 5
      }, {
        'label': '浅昏迷',
        'value': 6
      }, {
        'label': '深昏迷',
        'value': 7
      }],
      skinOptions: [{
        'label': '完整',
        'value': 1
      }, {
        'label': '破损',
        'value': 2
      }, {
        'label': '压疮',
        'value': 3
      }],
      limbMobilityOptions: [{
        'label': '正常',
        'value': 1
      }, {
        'label': '部分病变',
        'value': 2
      }],
      visionStatusOptions: [{
        'label': '良好',
        'value': 1
      }, {
        'label': '视物模糊',
        'value': 2
      }, {
        'label': '失明',
        'value': 3
      }],
      languageCommunicationOptions: [{
        'label': '正常',
        'value': 1
      }, {
        'label': '表达不流畅',
        'value': 2
      }, {
        'label': '能听懂但无法表达',
        'value': 3
      }, {
        'label': '完全丧失',
        'value': 4
      }],
      lifeCareOptions: [{
        'label': '完全自理',
        'value': 1
      }, {
        'label': '轻度依赖',
        'value': 2
      }, {
        'label': '中度依赖',
        'value': 3
      }, {
        'label': '重度依赖',
        'value': 4
      }],
      urineOptions: [{
        'label': '正常',
        'value': 1
      }, {
        'label': '排尿困难',
        'value': 2
      }, {
        'label': '尿失禁',
        'value': 3
      }, {
        'label': '尿潴留',
        'value': 4
      }, {
        'label': '留置导尿管',
        'value': 5
      }],
      stoolOptions: [{
        'label': '正常',
        'value': 1
      }, {
        'label': '腹泻',
        'value': 2
      }, {
        'label': '失禁',
        'value': 3
      }, {
        'label': '便秘',
        'value': 4
      }, {
        'label': '肠造瘘',
        'value': 5
      }],
      catheterOptions: [{
        'label': '胃管',
        'value': 1
      }, {
        'label': '导尿管',
        'value': 2
      }, {
        'label': '精致留置针',
        'value': 3
      }, {
        'label': '引流管',
        'value': 4
      }, {
        'label': 'PICC',
        'value': 5
      }, {
        'label': '其他',
        'value': 6
      }],
      allergyHistoryOptions: [{
        'label': '青霉素',
        'value': 1
      }, {
        'label': '磺胺',
        'value': 2
      }, {
        'label': '链霉素',
        'value': 3
      }, {
        'label': '头孢',
        'value': 4
      }, {
        'label': '其他(药物)',
        'value': 5
      }, {
        'label': '其他(食物)',
        'value': 6
      }, {
        'label': '无',
        'value': 7
      }],
      medicalHistoryOptions: [{
        'label': '高血压',
        'value': 1
      }, {
        'label': '糖尿病',
        'value': 2
      }, {
        'label': '冠心病',
        'value': 3
      }, {
        'label': '脑卒中',
        'value': 4
      }, {
        'label': '慢性支气管炎',
        'value': 5
      }, {
        'label': '哮喘',
        'value': 6
      }, {
        'label': '肿瘤',
        'value': 7
      }, {
        'label': '其他',
        'value': 8
      }, {
        'label': '无',
        'value': 9
      }],
      fallHistoryOptions: [{
        'label': '无',
        'value': 1
      }, {
        'label': '有',
        'value': 2
      }],
      infectiousDiseaseHistoryOptions: [{
        'label': '无',
        'value': 1
      }, {
        'label': '乙肝',
        'value': 2
      }, {
        'label': '肺结核',
        'value': 4
      }, {
        'label': 'HIV',
        'value': 5
      }, {
        'label': '其他',
        'value': 6
      }],
      surgeryHistoryOptions: [{
        'label': '无',
        'value': 1
      }, {
        'label': '有',
        'value': 2
      }],
      fractureHistoryOptions: [{
        'label': '无',
        'value': 1
      }, {
        'label': '有',
        'value': 2
      }],
      englishToChinese: {
        'residentCategory': { name: '居民类别', type: 'array', options: null },
        'consciousness': { name: '神智', type: 'array', options: null },
        'skin': { name: '皮肤', type: 'array', options: null },
        'limbMobility': { name: '四肢活动度', type: 'array', options: null },
        'visionStatus': { name: '视力情况', type: 'array', options: null },
        'languageCommunication': { name: '语言及沟通能力', type: 'array', options: null },
        'lifeCare': { name: '自理能力', type: 'array', options: null },
        'urine': { name: '小便', type: 'array', options: null },
        'stool': { name: '大便', type: 'array', options: null },
        'catheter': { name: '带管', type: 'array', options: null },
        'allergyHistory': { name: '过敏史', type: 'array', options: null },
        'medicalHistory': { name: '疾病史', type: 'array', options: null },
        'fallHistory': { name: '跌倒史', type: 'int', options: null },
        'infectiousDiseaseHistory': { name: '传染病史', type: 'array', options: null },
        'surgeryHistory': { name: '手术史', type: 'int', options: null },
        'surgeryDetails': { name: '手术详情', type: 'string', options: undefined },
        'fractureHistory': { name: '骨折史', type: 'int', options: null },
        'fractureDetails': { name: '骨折详情', type: 'string', options: undefined },
        'medicationStatus': { name: '服药情况', type: 'array', options: undefined }
      }
    }
  },
  computed: {
    tableListData: function() {
      return this.formatConversion([], this.selectedRP.data || [])
    }
  },
  mounted() {
    this.getAllRPs()
    var _this = this // 保存this一开始指向的对象

    for (const key in _this.englishToChinese) {
      _this.englishToChinese[key].options = _this[key + 'Options']
    }
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
        if (row.__family.includes(item) && row.__identity !== item) {
          console.log('loop row', row)
          return 'foldHide'
        }
      }
      return 'foldShow'
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
    getRPRH() {
      request({
        url: `/api/get-rp-rh?rpId=${this.selectRPId}`,
        method: 'get'
      }).then((response) => {
        if (response.status === 204) {
          this.$message({
            message: '未绑定健康档案',
            type: 'info'
          })
        } else {
          this.rprhDataBack = response.data
          console.log(this.rprhDataBack)
          for (const key in this.rprhDataBack) {
            if (key === 'rpId') continue
            if (Object.hasOwnProperty.call(this.rprhDataBack, key)) {
              let value = this.rprhDataBack[key]

              const o = {
                key: '',
                value: ''
              }
              if (value === null || value === '') {
                continue
              } else if (this.englishToChinese[key].type === 'array') {
                value = value.split(',').map(Number)
                if (value.length === 0) {
                  continue
                } else {
                  o.key = this.englishToChinese[key].name
                  const options = this.englishToChinese[key].options
                  console.log(options)
                  console.log(value)
                  value.forEach((v, i) => {
                    let optionLabel
                    for (let j = 0; j < options.length; j++) {
                      if (options[j].value === v) {
                        optionLabel = options[j].label
                        break
                      }
                    }
                    if (i !== 0) o.value = o.value.concat(',' + optionLabel)
                    else o.value = o.value.concat(optionLabel)
                  }
                  )
                  this.rprhDataShow.push(o)
                }
              } else if (this.englishToChinese[key].type === 'int') {
                o.key = this.englishToChinese[key].name
                o.value = Number(value)
                this.rprhDataShow.push(o)
              } else if (this.englishToChinese[key].type === 'string') {
                o.key = this.englishToChinese[key].name
                o.value = value
                this.rprhDataShow.push(o)
              }
            }
          }
        }
      })
        .catch(ex => {
          console.error(ex)
          this.$message.error('获取健康档案失败')
        })
    },
    modifyRpDialog(scope) {
      this.selectRPId = scope.row.info.rpId
      this.requirePattern = scope.row.data
      this.info.name = scope.row.info.name
      this.info.description = scope.row.info.description
      this.info.domain = scope.row.info.domain
      this.showDialog = true
      this.getRPRH()
    },
    search() {
      if (this.detail === '') {
        this.$message({
          message: '搜索内容不可以为空',
          type: 'warning'
        })
        return
      }
      this.$ajax.get(`${process.env.VUE_APP_REQUIRE_BASE_URL}/api/search-rp?detail=${this.detail}`).then(response => {
        this.data = response.data
        this.selectedRP = { info: {}}
      })
    },
    modifyRp() {
      this.$ajax.post(`${process.env.VUE_APP_REQUIRE_BASE_URL}/api/modify-rp?rpId=${this.selectRPId}`, {
        info: this.info,
        data: this.requirePattern }
      ).then(_ => {
        this.showDialog = false
        this.getAllRPs()
      })
      for (const key in this.rprhData) {
        if (Object.prototype.hasOwnProperty.call(this.rprhData, key)) {
          if (Array.isArray(this.rprhData[key])) {
            this.rprhData[key] = this.rprhData[key].join(',')
          }
        }
      }
      this.rprhData.rpId = this.selectRPId
      request({
        url: '/api/upload-rp-rh',
        method: 'post',
        data: this.rprhData
      }).then((response) => {
        this.$message({
          message: '绑定健康信息成功',
          type: 'success'
        })
      })
        .catch(ex => {
          console.error(ex)
          this.$message.error('绑定健康信息失败')
        })
    },
    RHData(data) {
      this.rprhData = data
      this.rprhDataShow = [] // 修改档案前需要清空之前的
      for (const key in data) {
        if (Object.hasOwnProperty.call(data, key)) {
          const value = data[key]
          const o = {
            key: '',
            value: ''
          }
          if (value === undefined) {
            continue
          } else if (Array.isArray(value)) {
            if (value.length === 0) {
              continue
            } else {
              o.key = this.englishToChinese[key].name
              const options = this.englishToChinese[key].options
              console.log(options)
              value.forEach((v, i) => {
                  let optionLabel
                  for (let j = 0; j < options.length; j++) {
                    if (options[j].value === v) {
                      optionLabel = options[j].label
                      break
                    }
                  }
                  if (i !== 0) o.value = o.value.concat(',' + optionLabel)
                  else o.value = o.value.concat(optionLabel)
                }
              )
              this.rprhDataShow.push(o)
            }
          } else if (isString(value) && value !== '') {
            o.key = this.englishToChinese[key].name
            o.value = value
            this.rprhDataShow.push(o)
          }
        }
      }
    },
    handleTime: handleTime
  }
}
</script>

<style lang='stylus' rel='stylesheet/stylus'>
  .foldHide
    display none

  .foldShow

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
</style>
