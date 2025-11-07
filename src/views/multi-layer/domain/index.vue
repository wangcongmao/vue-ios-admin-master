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
          <el-button @click="add">添加同级领域</el-button>
          <el-button @click="addChild">添加子领域</el-button>
          <el-button @click="update">修改选中的领域</el-button>
          <el-button @click="removeData">删除选中的领域</el-button>
        </el-header>
        <el-main>
          <div v-if="!whenAdd && !whenUpdate">
            <el-form :model="viewForm" label-width="80px">
              <el-form-item label="领域名称">
                {{ viewForm.catelogyName }}
              </el-form-item>
              <el-form-item label="详细描述">
                {{ viewForm.description }}
              </el-form-item>
            </el-form>
          </div>
          <div v-if="whenAdd">
            <el-form ref="addForm" :model="addForm" :rules="rules" label-width="80px">
              <el-form-item label="领域名称">
                <el-input v-model="addForm.catelogyName" />
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
                <el-input v-model="updateForm.catelogyName" />
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
import request from '@/utils/request2'
import './category.scss'
// import { deepClone } from '@/utils'

// import ServiceTable from '../atomic-service/service-table'

export default {
  components: { },
  data() {
    return {
      treeData: [{
        '@id': 1,
        'catelogyId': 1,
        'parent': null,
        'children': [{
          '@id': 2,
          'catelogyId': 2,
          'parent': 1,
          'children': [{
            '@id': 3,
            'catelogyId': 3,
            'parent': 2,
            'children': [],
            'catelogyName': '出租车',
            'description': '出租车',
            'removed': false,
            'id': 3
          }],
          'catelogyName': '租车',
          'description': '各类与租车相关的业务',
          'removed': false,
          'id': 2
        }],
        'catelogyName': '交通',
        'description': '交通类服务',
        'removed': false,
        'id': 1
      }],
      defaultProps: {
        children: 'children',
        label: 'catelogyName'
      },
      currentId: 0,
      whenAdd: false,
      whenUpdate: false,
      addForm: {
        catelogyId: 0,
        catelogyName: '',
        description: ''
      },
      updateForm: {
        catelogyId: 0,
        catelogyName: '',
        description: ''
      },
      viewForm: {
        catelogyName: '',
        description: ''
      },
      rules: {
        catelogyName: [
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
      return request({
        url: '/serviceCategory/listRoots',
        method: 'get'
      }).then(data => {
        this.treeData = data
      })
    },
    handleChange(node, checked) {
      // console.info(node,checked);
      if (checked) {
        this.$refs.tree.setCheckedKeys([node['@id']])
        this.currentId = node.id
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
        catelogyId: 0,
        catelogyName: '',
        description: '',
        parent: (typeof this.viewForm.parent) === 'object' ? this.viewForm.parent : {
          catelogyId: this.$refs.tree.getNode(this.viewForm.parent).data.catelogyId
        }
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
        catelogyId: 0,
        catelogyName: '',
        description: '',
        parent: {
          catelogyId: this.viewForm.catelogyId
        }
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
      this.$http.delete(`/serviceCategory/${this.viewForm.catelogyId}`)
        .then((isSuccess) => {
          isSuccess ? this.loadData() : null
        })
        .catch(ex => {
          console.error(ex)
          alert('数据删除失败！')
        })
    },
    onAdd() {
      this.$refs['addForm'].validate((valid) => {
        if (valid) {
          this.$http.post('/serviceCategory/create', this.addForm)
            .then(response => response.data)
            .then((data) => {
              this.loadData()
                .then(() => {
                  this.handleChange(data, true)
                })
              this.whenAdd = false
            })
            .catch(ex => {
              console.error(ex)
              alert('数据传输失败！')
            })
            // this.tableData.push(this.addForm);
            // this.whenAdd = false;
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
          this.$http.post(`/serviceCategory/update/${this.updateForm.catelogyId}`, this.updateForm)
            .then(response => response.data)
            .then((data) => {
              this.loadData()
                .then(() => {
                  this.handleChange(data, true)
                })
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
