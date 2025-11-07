<template>
  <div class="spt-property">
    <el-table :data="tableListData" border stripe class="init_table" size="small">
      <el-table-column align="center" label="属性" min-width="6%">
        <template slot-scope="{row}">
          <el-select v-model="row.sptPropertyId" placeholder="请选择">
            <el-option
              v-for="item in properties"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </template>
      </el-table-column>
      <el-table-column align="center" label="单位" min-width="6%">
        <template slot-scope="{row}">
          <el-input v-model="row.unit" :placeholder="row.unit" size="mini" class="goal-input"/>
        </template>
      </el-table-column>
      <el-table-column align="center" label="误差阈值" min-width="6%">
        <template slot-scope="{row}">
          <el-input v-model="row.threshold" :placeholder="row.threshold" size="mini" class="goal-input"/>
        </template>
      </el-table-column>
      <el-table-column align="center" label="是否必填" min-width="6%">
        <template slot-scope="{row}">
          <el-select v-model="row.isMust" placeholder="请选择" size="small">
            <el-option
              v-for="item in optionsTorF"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </template>
      </el-table-column>
      <el-table-column align="center" label="是否有选项" min-width="6%">
        <template slot-scope="{row}">
          <el-select v-model="row.couldSelect" placeholder="请选择">
            <el-option
              v-for="item in optionsTorF"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </template>
      </el-table-column>

      <el-table-column align="center" min-width="10%" label="选项">
        <template slot-scope="scope">
          <el-tag v-for="o in scope.row.options" size="mini">
            {{ getRestrictString(o) }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column align="center" min-width="10%" label="操作">
        <template slot-scope="scope">
          <el-button type="text" @click="handleDelete(scope)">删除</el-button>
          <el-button type="text" @click="showDialog(scope)">配置属性选项</el-button>
        </template>
      </el-table-column>
    </el-table>
    <br>
    <el-row>
      <el-button type="success" size="mini" @click="handleAddTop">增加模板属性</el-button>
      <el-button type="primary" size="mini" @click="$emit('submit')">提交</el-button>
    </el-row>
    <!--        TODO 封装成组件-->
    <el-dialog :styles="{width:'40%'}" :visible.sync="visible" title="编辑属性选项" :before-close="closeDialog">
      <el-table :data="propertyOptions" class="restricts_table">
        <el-table-column align="center" label="选项类型">
          <template slot-scope="{row}">
            <el-select v-model="row.valueType" placeholder="请选择" size="small">
              <el-option
                v-for="item in valueTypeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column align="center" label="属性值">
          <template slot-scope="{row}">
            <template v-if="row.valueType==='region'">
              min:
              <el-input v-model="row.minValue" :placeholder="row.minValue" size="mini"/>
              max:
              <el-input v-model="row.maxValue" :placeholder="row.maxValue" size="mini"/>
            </template>
            <template v-else>
              <el-input v-model="row.value" type="text" :placeholder="row.value" size="small"/>
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
        <el-button type="primary" size="mini" @click="addRestrict()">增加选项</el-button>
        <el-button type="success" size="mini" @click="handleDialogConfirm">确定</el-button>
      </el-row>
      <br>
      <!--                        {{goalRestricts}}-->
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
export default {
  name: 'SPTP',
  props: [
    'data'
  ],
  data() {
    return {
      visible: false,
      initParam: {
        sptPropertyId: '',
        unit: '',
        threshold: '',
        isMust: false,
        couldSelect: false,
        options: []
      },
      properties: [{
        id: 1,
        name: '属性1'
      }],
      optionsTorF: [
        {
          value: 'true',
          label: '是'
        }, {
          value: 'false',
          label: '否'
        }
      ],
      sptProperty: {
        sptPropertyId: '',
        unit: '',
        threshold: '',
        isMust: false,
        couldSelect: false,
        options: []
      },
      propertyOptions: [],
      valueTypeOptions: [
        {
          value: 'region',
          label: '区间'
        }, {
          value: 'enum',
          label: '枚举'
        }
      ]
    }
  },
  computed: {
    tableListData: function () {
      return this.data
    }
  },
  mounted() {
    this.getProperties()
  },
  methods: {
    getRestrictString(r) {
      if (r.valueType === 'region') {
        return ` ${r.minValue}~${r.maxValue}`
      }
      if (r.valueType !== '') {
        return ` ${r.value}`
      }
    },
    getProperties() {
      try {
        this.$ajax.get('/sptproperty/list')
          .then(res => {
            this.properties = res.data // res.content
          })
      } catch (e) {
        console.log(e)
      }
    },
    handleDelete(scope) { // 删除节点
      const node = scope.row
      console.log(node)
      const index = this.data.findIndex(d => d.sptPropertyId ===
        node.sptPropertyId
      )
      this.data.splice(index, 1)
    },
    handleAddTop() { // 添加顶部节点
      const obj = JSON.parse(JSON.stringify(this.initParam))// copy参数
      // obj.id = this.id++
      // obj.goal.content += obj.id
      this.data.push(obj)
    },
    addRestrict() {
      restrictNum += 1
      this.propertyOptions.push({
        id: restrictNum,
        // key: '',
        valueType: '',
        minValue: 0,
        maxValue: 9999,
        value: ''
      })
    },
    deleteRestrict(row) {
      const index = this.propertyOptions.findIndex(d => d.id === row.id)
      this.propertyOptions.splice(index, 1)
    },
    showDialog(scope) {
      const node = scope.row
      this.sptProperty = node
      this.propertyOptions = JSON.parse(JSON.stringify(node.options))
      this.visible = true
    },
    handleDialogConfirm() {
      this.visible = false
      this.sptProperty.options = this.propertyOptions
      this.data.forEach((item, index) => {
        if (item.id === this.sptProperty.sptPropertyId) {
          this.data.splice(index, 1, this.sptProperty)
        }
      })
    },
    closeDialog(done) {
      this.$confirm('确认关闭？数据将不会被保存!', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(_ => {
        done()
      }).catch(_ => {
      })
    }
  }
}
</script>

<style lang='stylus' rel='stylesheet/stylus'>
.spt-property
  .goal-input
    width 120px

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
