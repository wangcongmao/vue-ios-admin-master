<template>
  <el-row>
    <el-col :span="6">
      <el-tree
        ref="tree"
        class="ly-tree-container"
        :data="treeData"
        show-checkbox
        default-expand-all
        node-key="@id"
        highlight-current
        :props="defaultProps"
        :expand-on-click-node="true"
        :check-on-click-node="true"
        :check-strictly="true"
        @check-change="handleChange"
      />
    </el-col>
    <el-col :span="18">
      <el-container>
        <el-header>
          <el-button type="primary" plain @click="add">添加同级领域</el-button>
          <el-button type="primary" plain @click="addChild">添加子领域</el-button>
          <el-button type="primary" plain @click="update">修改选中的领域</el-button>
          <el-button type="warning" plain @click="removeData">删除选中的领域</el-button>
        </el-header>
        <el-main>
          <div v-if="!whenAdd && !whenUpdate">
            <el-form :model="viewForm" label-width="80px">
              <el-form-item label="领域名称">
                {{ viewForm.name }}
              </el-form-item>
              <el-form-item label="详细描述">
                {{ viewForm.description }}
              </el-form-item>
            </el-form>
          </div>
          <div v-if="whenAdd">
            <el-form ref="addForm" :model="addForm" :rules="rules" label-width="80px">
              <el-form-item label="领域名称">
                <el-input v-model="addForm.name" />
              </el-form-item>
              <el-form-item label="详细描述">
                <el-input v-model="addForm.description" type="textarea" autosize placeholder="请输入详细描述" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="onAdd">添加</el-button>
                <el-button @click="resetAddForm">取消</el-button>
              </el-form-item>
            </el-form>
          </div>
          <div v-if="whenUpdate">
            <el-form ref="updateForm" :model="updateForm" :rules="rules" label-width="80px">
              <el-form-item label="领域名称">
                <el-input v-model="updateForm.name" />
              </el-form-item>
              <el-form-item label="详细描述">
                <el-input v-model="updateForm.description" type="textarea" autosize placeholder="请输入详细描述" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="onUpdate">修改</el-button>
                <el-button @click="resetUpdateForm">取消</el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-main>
      </el-container>
    </el-col>
  </el-row>
</template>
<script>
import './category.scss'
import Vue from 'vue'
import Axios from 'axios'

Axios.defaults.baseURL = process.env.VUE_APP_SP_BASE_URL
Vue.prototype.$ajax = Axios
export default {
  components: {},
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
      currentId: 0,
      currentNode: {},
      whenAdd: false,
      whenUpdate: false,
      addForm: {
        id: 0,
        name: '',
        description: ''
      },
      updateForm: {
        id: 0,
        name: '',
        description: ''
      },
      viewForm: {
        name: '',
        description: ''
      },
      rules: {
        name: [
          { required: true, message: '请输入类别名称', trigger: 'blur' },
          { min: 2, max: 8, message: '长度在 2 到 8 个字符', trigger: 'blur' }
        ],
        description: [
          { required: true, message: '请输入对该类别的详细描述', trigger: 'change' }
        ]
      }
    }
  },
  created() {
    this.loadData()
  },
  methods: {
    loadData() {
      this.$ajax.get('/sptCategory/roots')
        .then(response => {
          this.treeData = response.data
        })
    },
    handleChange(node, checked) {
      console.info(node, checked)
      if (checked) {
        this.$refs.tree.setCheckedKeys([node['@id']])
        this.currentId = node.id
        this.currentNode = node
        this.viewForm = this.$refs.tree.getCheckedNodes()[0]
      }
    },
    add() {
      if (this.currentId <= 0) {
        this.$notify({
          type: 'error',
          title: '操作提示',
          message: '请先选择任意一条记录！',
          duration: 2000
        })
        return
      }
      this.whenAdd = true
      this.whenUpdate = false
      this.addForm = {
        id: 0,
        name: '',
        description: '',
        parentId: this.viewForm.parentId === 0 ? 0 : this.viewForm.parentId
      }
    },
    addChild() {
      if (this.currentId <= 0) {
        this.$notify({
          type: 'error',
          title: '操作提示',
          message: '请先选择任意一条记录！',
          duration: 2000
        })
        return
      }
      this.whenAdd = true
      this.whenUpdate = false
      this.addForm = {
        id: 0,
        name: '',
        description: '',
        parentId: this.viewForm.id
      }
    },
    update() {
      if (this.currentId <= 0) {
        this.$notify({
          type: 'error',
          title: '操作提示',
          message: '请先选择任意一条记录！',
          duration: 2000
        })
        return
      }
      this.whenAdd = false
      this.whenUpdate = true
      this.updateForm = this.viewForm
    },
    removeData() {
      if (this.currentId <= 0) {
        this.$notify({
          type: 'error',
          title: '操作提示',
          message: '请先选择任意一条记录！',
          duration: 2000
        })
        return
      }
      if (this.currentNode.children.length > 0) {
        alert('有子领域,删除失败！')
        return
      }
      this.$http.post(`/delsptcategory/`, { id: this.currentId })
        .then((isSuccess) => {
          if (isSuccess.data) {
            this.loadData()
            alert('数据删除成功')
          } else {
            alert('绑定模板,删除失败！')
          }
        })
        .catch(ex => {
          console.error(ex)
          alert('数据删除失败！')
        })
    },
    onAdd() {
      this.$refs['addForm'].validate((valid) => {
        if (valid) {
          this.$ajax.post('/insertsptCategory', this.addForm)
            .then(response => response.data)
            .then(reponse => {
              this.loadData()
              this.handleChange(reponse, true)
              this.whenAdd = false
            })
            .catch(ex => {
              console.error(ex)
              alert('数据传输失败！')
            })
        } else {
          alert('表单验证失败!!')
          return false
        }
      })
    },
    resetAddForm() {
      this.whenAdd = false
    },
    onUpdate() {
      this.$refs['updateForm'].validate((valid) => {
        if (valid) {
          this.$ajax.post(`/updatesptCategory`, this.updateForm)
            .then(response => response.data)
            .then((data) => {
              this.loadData()
              this.handleChange(data, true)
              this.whenUpdate = false
            })
            .catch(ex => {
              console.error(ex)
              alert('数据传输失败！')
            })
        } else {
          alert('表单验证失败!!')
          return false
        }
      })
    },
    resetUpdateForm() {
      this.whenUpdate = false
    }
  }
}
</script>
