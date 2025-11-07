<template>
  <div class="">
    <el-row>
      <el-col :span="6">
        <el-tree
          ref="tree"
          class="ly-tree-container"
          :data="treeData"
          show-checkbox
          lazy
          :load="loadNode"
          node-key="id"
          highlight-current
          :props="defaultProps"
          :expand-on-click-node="false"
          :check-on-click-node="true"
          :check-strictly="true"
          :default-expand-level="Infinity"
          @check="((obj, node)=>{checkNode(obj, node, 'tree')})"
          @node-click="((obj, node, vue)=>{clickNode(obj, node, vue,'tree')})"
          @check-change="handleChange"
        />
      </el-col>
      <el-col :span="18">
        <el-container>
          <el-header>
            <div style="margin-top:20px;margin-bottom: 20px">
              <el-row :gutter="10">
                <el-col :span="4">
                  <el-input v-model="listQuery.name" placeholder="名称" />
                </el-col>
                <el-col :span="4">
                  <el-input v-model="listQuery.description" placeholder="描述" />
                </el-col>
                <el-col :span="8">
                  <el-button
                    class="filter-item"
                    type="primary"
                    icon="el-icon-search"
                    @click="handleSearch"
                  >查找
                  </el-button>
                </el-col>
              </el-row>
            </div>
          </el-header>
          <el-main>
            <el-table
              :key="tableKey"
              v-loading="listLoading"
              :data="list"
              style="width: 100%;"
              height="800"
              border
            >
              <el-table-column width="50">
                <template slot-scope="scope">
                  <span>{{ scope.$index + (listQuery.page - 1) * listQuery.limit + 1 }}</span>
                </template>
              </el-table-column>
              <el-table-column
                property="name"
                label="模板名称"
                width="120"
              />
              <el-table-column
                property="description"
                label="模板描述"
                width="120"
              />
              <el-table-column
                label="所属领域"
                width="150"
              >
                <template slot-scope="scope">
                  <el-tag
                    v-for="(category,index) in scope.row.categories"
                    :key="index"
                    size="mini"
                  >
                    {{ category.name }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column
                label="操作"
                width="300"
              >
                <template slot-scope="scope">
                  <!--                <el-button type="text" @click="modifyRequire(scope.row)">查看详情</el-button>-->
                  <el-button type="text" @click="modifySPT(scope)">编辑</el-button>
                  <el-button type="text" @click="enterAddSP(scope)">新增服务模式</el-button>
                  <el-button type="text" @click="enterListSP(scope)">查看服务模式</el-button>
                  <el-button type="text" @click="deleteIndex(scope)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
            <pagination
              v-show="total>0"
              :total="total"
              :page.sync="listQuery.page"
              :limit.sync="listQuery.limit"
              @pagination="getList"
            />
          </el-main>
        </el-container>
      </el-col>
    </el-row>
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
            <el-form-item label="所属领域">
              <el-tree-select
                ref="treeSelect"
                v-model="info.categories"
                :styles="styles"
                :select-params="selectParams"
                :tree-params="treeParams"
                :tree-render-fun="_renderFun"
                @searchFun="_searchFun"
                @node-click="_nodeClickFun"
              />
            </el-form-item>
          </el-form>
        </el-card>
        <br>
        <SPTP :data="selectSPTProperties" @submit="uploadSPT" />
      </div>
    </el-dialog>

  </div>

</template>
<script>
import { deepClone } from '@/utils'
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination
import '../sp-template-add/category.scss'
import Vue from 'vue'
import Axios from 'axios'
import ElTreeSelect from 'el-tree-select'
import SPTP from '../sp-template-add/spt-property'

Axios.defaults.baseURL = process.env.VUE_APP_SP_BASE_URL
Vue.prototype.$ajax = Axios
Vue.use(ElTreeSelect)
export default {
  components: {
    Pagination,
    SPTP
  },
  data() {
    return {
      treeData: [{
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
      defaultProps: {
        children: 'children',
        label: 'name'
      },
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: false,
      listQuery: {
        page: 1,
        limit: 10,
        name: '',
        description: '',
        category: ''
      },
      // updateSPT: { visible: false, old: [], new: [], sptId: '' }
      showDialog: false,
      info: {
        sptId: 0,
        name: '',
        description: '',
        categories: [],
        sptProperties: []
      },
      selectSPTId: -1,
      selectSPTProperties: [],
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
      styles: {
        width: '300px'
      },
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
      categories: new Map()
    }
  },
  created: function() {
    this.loadCategories()
    this.treeParams.data = this.categoryTreeData
  },
  // mounted:
  //   function() {
  //     setTimeout(() => {
  //       this.$refs.treeSelect.treeDataUpdateFun(this.categoryTreeData)
  //     }, 2000)
  //   },
  methods: {
    async getList1(resolve) {
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
        this.node_had = node // 这里是关键！在data里面定义一个变量，将node.level == 0的node存起来
        this.resolve_had = resolve // 同上，把node.level == 0的resolve也存起来
        return this.getList1(resolve)
      }
      if (node.level >= 1) {
        return this.getChildList(node, resolve)
      }
    },
    // 编辑模板时获取
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
    },
    async getList() {
      this.listLoading = true
      // If the Promise is rejected, the rejected value is thrown.
      try {
        const query = deepClone(this.listQuery)
        const choosed = this.$refs.tree.getCheckedNodes(false, false)
        if (choosed.length > 0) {
          console.log(choosed)
          query.category = choosed.map(value => value.name).join(',')
          console.log(query)
        }
        this.$ajax.get(`/sptemplate/query?name=${query.name}&description=${query.description}&category=${query.category}&page=${query.page}&limit=${query.limit}`)
          .then(res => {
            this.listLoading = false
            this.list = res.data.data.data
            this.total = res.data.data.total
            console.log(res)
          })
      } catch (e) {
        this.listLoading = false
      }
    },
    async deleteIndex(scope) {
      console.log(scope.row)
      this.$ajax.delete('/delspt?id=' + scope.row.id)
        .then((isSuccess) => {
          console.log(isSuccess)
          if (isSuccess.data) {
            this.$message({
              message: '删除成功',
              type: 'success'
            })
            this.getList()
          } else {
            this.$message.error('绑定模式，删除失败')
          }
        })
        .catch((response) => {
          this.$message.error('数据删除失败')
        })
    },
    handleSearch() {
      this.getList()
    },
    handleChange(node, checked) {
      // console.info(node,checked);
      // if (checked) {
      //   this.$refs.tree.setCheckedKeys([node['@id']])
      //   this.currentId = node.id
      //   this.viewForm = this.$refs.tree.getCheckedNodes()[0]
      // }
    },
    // 选中节点
    checkNode(obj, node, form) {
      let checkedKeys = this.$refs[form].getCheckedKeys()
      const childKeys = this.getChildKeys(obj)
      const index = checkedKeys.indexOf(obj.id)
      if (index !== -1) {
        // 选中并且选中子节点
        checkedKeys = checkedKeys.concat(childKeys)
      } else {
        // 取消选中并且取消选中子节点
        checkedKeys = checkedKeys.filter(item => childKeys.indexOf(item) === -1)
      }
      this.$refs[form].setCheckedKeys(checkedKeys)
    },

    // 点击节点
    clickNode(obj, node, vue, form) {
      let checkedKeys = this.$refs[form].getCheckedKeys()
      const index = checkedKeys.indexOf(obj.id)
      if (index !== -1) {
        checkedKeys.splice(index, 1)
        // 移除子节点
        const childKeys = this.getChildKeys(obj)
        checkedKeys = checkedKeys.filter(item => childKeys.indexOf(item) === -1)
      } else {
        checkedKeys.push(obj.id)
      }
      this.$refs[form].setCheckedKeys(checkedKeys)
    },
    // 获取子节点
    getChildKeys(node) {
      let arr = []
      arr.push(node.id)
      if (node.children != null && node.children.length > 0) {
        for (const n of node.children) {
          arr.push(n.id)
          const childKeys = this.getChildKeys(n)
          arr = arr.concat(childKeys)
        }
      }
      return arr
    },
    modifySPT(scope) {
      this.selectSPTId = scope.row.id
      this.info.sptId = this.selectSPTId
      this.info.name = scope.row.name
      this.info.description = scope.row.description
      this.info.categories = scope.row.categories
      this.$ajax.get(`/searchsptemplateandprop?id=${this.selectSPTId}`)
        .then(res => {
          this.selectSPTProperties = res.data
          console.log(res.data)
        })
      setTimeout(() => {
        this.$refs.treeSelect.treeDataUpdateFun(this.categoryTreeData)
      }, 2000)
      this.showDialog = true
    },
    // 树点击
    _nodeClickFun(data, node, vm) {
      console.log('this _nodeClickFun', this.info.categories, data, node)
    },
    // 树过滤
    _searchFun(value) {
      console.log(value, '<--_searchFun')
      this.$refs.treeSelect.filterFun(value)
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
      const that = this

      function parents(node) {
        if (node == null || node.parentId === 0) {
          return []
        }
        return [that.categories.get(node.parentId), ...parents(that.categories.get(node.parentId))]
      }

      const categoryMap = {}
      console.log(this.info.categories)
      for (var i = 0; i < this.info.categories.length; i++) {
        if(typeof this.info.categories[i] === 'object'){
          this.info.categories[i] = this.info.categories[i].id;
        }
      }
      console.log(this.info.categories)
      this.info.categories.forEach(i => {
        categoryMap[i] = true
      })
      console.log(categoryMap)
      const halfSet = new Set()
      this.info.categories.forEach(i => {
        console.log(parents(this.categories.get(i.id)), 'parents(this.categories.get(i))')
        parents(this.categories.get(i)).forEach(node => halfSet.add(node.id))
      })
      console.log(halfSet, 'halfSet')
      halfSet.forEach(i => {
        if (typeof categoryMap[i] === 'undefined') {
          categoryMap[i] = false
        }
      })
      console.log(this.info.categories)
      console.log(categoryMap)
      this.info.categories = categoryMap
      this.info.sptProperties = this.selectSPTProperties
      this.$ajax.post(`/updatesptemplate`, this.info).then((response) => {
        this.$message({
          message: '提交成功',
          type: 'success'
        })
        this.showDialog = false
        this.getList()
      }).catch((response) => {
        this.$message.error('提交失败')
      })
    },
    enterAddSP(scope) {
      this.selectSPTId = scope.row.id
      this.info.sptId = this.selectSPTId
      this.info.name = scope.row.name
      this.info.description = scope.row.description
      this.info.categories = scope.row.categories
      this.$ajax.get(`/searchsptemplateandprop?id=${this.selectSPTId}`)
        .then(res => {
          this.info.sptProperties = res.data
        })
      this.$router.push({ name: 'SpAdd', path: '/service-pattern/sp-add', params: { sptInfo: this.info }})
    },
    enterListSP(scope) {
      this.selectSPTId = scope.row.id
      this.info.sptId = this.selectSPTId
      this.info.name = scope.row.name
      this.info.description = scope.row.description
      this.info.categories = scope.row.categories
      this.$ajax.get(`/searchsptemplateandprop?id=${this.selectSPTId}`)
        .then(res => {
          this.info.sptProperties = res.data
        })
      this.$router.push({ name: 'SpList', path: '/service-pattern/sp-list', params: { sptInfo: this.info }})
    }
  }
}
</script>
