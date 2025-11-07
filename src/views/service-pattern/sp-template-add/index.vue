<template>
  <div id="add-spt">
    <h1>新增服务模式模板</h1>
    <br>
    <el-card class="box-card">
      <el-form ref="form" :model="addForm" label-width="80px">
        <el-form-item label="名称:" required>
          <el-input v-model="addForm.name" placeholder="请输入" size="small" />
        </el-form-item>
        <el-form-item label="功能描述:">
          <el-input v-model="addForm.description" placeholder="请输入" size="small" />
        </el-form-item>

        <el-form-item label="所属领域">
          <el-tree-select
            ref="treeSelect"
            v-model="addForm.categories"
            :styles="styles"
            :select-params="selectParams"
            :tree-params="treeParams"
            @searchFun="_searchFun"
            @node-click="_nodeClickFun"
          />
        </el-form-item>

      </el-form>
    </el-card>
    <br>

    <SPTP :data="sptProperty" @submit="uploadSPT" />
    <!--    <el-row>-->
    <!--      <el-button type="primary" size="mini" @click="uploadSPT">提交</el-button>-->
    <!--    </el-row>-->
  </div>
</template>

<style>
#add-spt {
  text-align: center;
}
.box-card {
  width: 80%;
  margin: auto;
}
</style>

<script>
import ElTreeSelect from 'el-tree-select'
import Vue from 'vue'
import Axios from 'axios'
import SPTP from './spt-property'

Axios.defaults.baseURL = process.env.VUE_APP_SP_BASE_URL
Vue.prototype.$ajax = Axios
Vue.use(ElTreeSelect)
export default {
  name: 'AddSPT',
  components: {
    SPTP
  },
  data() {
    return {
      name: '',
      categoryTreeData: [{
        '@id': 1,
        'id': 1,
        'parentId': null,
        'children': [{
          '@id': 2,
          'id': 2,
          'parentId': 1,
          'children': [{
            '@id': 3,
            'id': 3,
            'parentId': 2,
            'children': [],
            'name': '出租车',
            'description': '出租车',
            'removed': false
          }],
          'name': '租车',
          'description': '各类与租车相关的业务',
          'removed': false
        }],
        'name': '交通',
        'description': '交通类服务',
        'removed': false
      }],
      categories: new Map(),
      addForm: {
        name: '',
        description: '',
        categories: [],
        sptProperties: []
      },
      styles: {
        width: '300px'
      },
      test: '',
      selectParams: {
        multiple: true,
        clearable: true,
        placeholder: '请选择'
      },
      treeParams: {
        clickParent: false,
        filterable: true,
        'check-strictly': true,
        'default-expand-all': true,
        'expand-on-click-node': false,
        data: [],
        props: {
          children: 'children',
          label: 'name',
          disabled: 'disabled',
          value: 'id'
        }
      },
      properties: [],
      sptProperty: [{
        sptPropertyId: '',
        unit: '',
        threshold: '',
        isMust: false,
        couldSelect: false,
        options: []
      }]

    }
  },
  created() {
    this.loadCategories()
    this.treeParams.data = this.categoryTreeData
  },
  mounted:
    function() {
      setTimeout(() => {
        this.$refs.treeSelect.treeDataUpdateFun(this.categoryTreeData)
      }, 2000)
    },
  methods: {
    // 下拉框修改
    _selectChange(val) {
      console.log(val, '<-select change')
    },
    // 树点击
    _nodeClickFun(data, node, vm) {
      console.log('this _nodeClickFun', this.addForm.categories, data, node)
    },
    // 树过滤
    _searchFun(value) {
      console.log(value, '<--_searchFun')
      this.$refs.treeSelect.filterFun(value)
    },
    uploadSPT() {
      const that = this
      function parents(node) {
        if (node == null || node.parentId === 0) {
          return []
        }
        return [that.categories.get(node.parentId), ...parents(that.categories.get(node.parentId))]
      }
      const categoryMap = {}
      this.addForm.categories.forEach(i => {
        categoryMap[i] = true
      })
      const halfSet = new Set()
      this.addForm.categories.forEach(i => {
        console.log(parents(this.categories.get(i)), 'parents(this.categories.get(i))')
        parents(this.categories.get(i)).forEach(node => halfSet.add(node.id))
      })
      console.log(halfSet, 'halfSet')
      halfSet.forEach(i => {
        if (typeof categoryMap[i] === 'undefined') {
          categoryMap[i] = false
        }
      })
      console.log(categoryMap)
      this.addForm.categories = categoryMap
      this.addForm.sptProperties = this.sptProperty
      console.info(this.addForm)
      this.$ajax.post(`/insertsptemplate`, this.addForm).then((response) => {
        this.$message({
          message: '提交成功',
          type: 'success'
        })
      }).catch((response) => {
        this.$message.error('提交失败')
      })
    },
    loadCategories() {
      this.$ajax.get('/sptCategory/roots')
        .then(response => {
          this.categoryTreeData = response.data
          const that = this
          function walk(list) {
            for (let i = 0; i < list.length; i++) {
              that.categories.set(list[i].id, list[i])
              if (list[i].children != null && list[i].children.length > 0) {
                walk(list[i].children)
              }
            }
          }
          walk(this.categoryTreeData)
        })
    }
  }
}

</script>
