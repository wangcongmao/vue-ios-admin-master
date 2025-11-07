<template>
  <div id="add-spt">
    <h1>新增需求模式模板</h1>
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
          <el-tree-select ref="treeSelect" v-model="addForm.categories" lazy
                          :load="loadNode" :styles="styles" :select-params="selectParams" :tree-params="treeParams" :tree-render-fun="_renderFun" @searchFun="_searchFun" @node-click="_nodeClickFun" />
        </el-form-item>

      </el-form>
    </el-card>
    <br>

    <SPTP :data="sptProperty" @submit="uploadSPT"/>
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
    // this.loadCategories()
  },
  mounted:
    function() {
      setTimeout(() => {
        this.treeParams.data = this.categoryTreeData
        this.$refs.treeSelect.treeDataUpdateFun(this.categoryTreeData)
      }, 1000)
    },
  methods: {
    // 获取树结构 父集数据
    async getList(resolve) {
      this.$ajax.get('/sptCategory/children?' + 'parentId=0')
        .then(response => {
          var data = response.data
          data.forEach((item) => {
            item.childrenCount > 0 ? (item.isLeaf = false) : (item.isLeaf = true)
          })
          resolve(data)
        })
    },
    // 获取树结构 子集数据
    async getChildList(node, resolve) {
      this.$ajax.get('/sptCategory/children?' + 'parentId=' + node.data.id)
        .then(response => {
          var data = response.data
          data.forEach((item) => {
            item.childrenCount > 0 ? (item.isLeaf = false) : (item.isLeaf = true)
          })
          resolve(data)
        })
    },
    // 加载 树数据、loadNode()方法、此函数函数接收两个参数，一个是node,即当前节点，一个是resolve作为数据处理函数
    loadNode(node, resolve) {
      if (node.level === 0) {
        return this.getList(resolve)
      }
      if (node.level >= 1) {
        return this.getChildList(node, resolve)
      }
    },
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
      // 自行判断 是走后台查询，还是前端过滤
      // this.$refs.treeSelect.$refs.tree.filter(value);
      this.$refs.treeSelect.filterFun(value)
      // 后台查询
      // this.$refs.treeSelect.treeDataUpdateFun(categoryTreeData);
    },
    // 自定义render
    _renderFun(h, { node, data, store }) {
      return (
        <span class='custom-tree-node'>
          <span>{node.label}</span>
        </span>
      )
    },
    uploadSPT() {
      function parents(node) {
        if (node == null || node.parent == null) {
          return []
        }
        return [node.parent, ...parents(node.parent)]
      }
      const categoryMap = {}
      this.addForm.categories.forEach(i => {
        categoryMap[i] = true
      })
      const halfSet = new Set()
      this.addForm.categories.forEach(i => {
        parents(this.categories.get(i)).forEach(node => halfSet.add(node.id))
      })
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
