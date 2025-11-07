<template>
  <div class="app-container">
    <div style="margin-top:20px;margin-bottom: 20px">
      <el-row :gutter="10">
        <el-col :span="4">
          <el-input v-model="listQuery.name" placeholder="名称"/>
        </el-col>
        <el-col :span="8">
          <el-button
            class="filter-item"
            type="primary"
            icon="el-icon-search"
            @click="handleSearch"
          >查找
          </el-button>
          <el-button
            class="filter-item"
            style="margin-left: 10px;"
            type="primary"
            @click="handleCreate"
          ><i class="el-icon-plus"/>新增
          </el-button>
        </el-col>
      </el-row>
    </div>

    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      style="width: 100%;"
      height="450"
      border
    >
      <el-table-column width="50">
        <template slot-scope="scope">
          <span>{{ scope.$index + (listQuery.page - 1) * listQuery.limit + 1 }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="name" label="名称"/>

      <el-table-column label="可为优化目标">
        <template slot-scope="scope">
          {{ scope.row.couldOptimize ? '是' : '否' }}
        </template>
      </el-table-column>
      <el-table-column label="正负性">
        <template slot-scope="scope">
          {{ scope.row.positive ? '正' : '负' }}
        </template>
      </el-table-column>
      <el-table-column align="center" min-width="100" label="操作">
        <template slot-scope="scope">
          <el-button type="text" size="small" @click="handleEdit(scope)">编辑</el-button>
          <el-button type="text" size="small" @click="deleteIndex(scope)">删除</el-button>
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
    <el-dialog :visible.sync="dialogVisible" :title="dialogType==='edit'?'编辑':'新增'">
      <el-form :model="user" label-width="80px" label-position="left" style="height: 410px;">
        <el-form-item label="名称">
          <el-input v-model="user.name" placeholder="名称"/>
        </el-form-item>
        <el-form-item label="可为优化目标">
          <el-switch
            v-model="user.couldOptimize"
            active-color="#13ce66"
            inactive-color="#ff4949"
          />
        </el-form-item>
        <el-form-item label="正负性">
          <el-switch
            v-model="user.positive"
            active-color="#13ce66"
            inactive-color="#ff4949"
          />
        </el-form-item>
      </el-form>
      <div style="text-align:right;">
        <el-button type="danger" @click="dialogVisible=false">取消</el-button>
        <el-button type="primary" @click="confirmUser">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import {deepClone} from '@/utils'
import Vue from 'vue'
import Axios from 'axios'
import {Pagination} from 'vant'

Axios.defaults.baseURL = process.env.VUE_APP_SP_BASE_URL
Vue.prototype.$ajax = Axios

const defaultUser = {
  id: '',
  name: '',
  positive: false,
  couldOptimize: false
}

export default {
  name: 'QualityIndex',
  components: {Pagination},
  data() {
    return {
      searchOptions: [
        {label: '名称', key: 'name'}
      ],
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: false,
      listQuery: {
        page: 1,
        limit: 10,
        name: ''
      },
      user: Object.assign({}, defaultUser),
      couldOptimizeOptions: [
        {
          value: 'true',
          label: '是'
        }, {
          value: 'false',
          label: '否'
        }
      ],
      dialogVisible: false,
      dialogType: 'new'
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      try {
        const query = deepClone(this.listQuery)
        query.page -= 1
        this.$ajax.get('/sptproperty/listbyquery?page=' + query.page + '&size=' + query.limit + '&name=' + query.name)
          .then(res => {
            this.listLoading = false
            this.list = res.data // res.content
            this.total = res.data.length
          })
      } catch (e) {
        this.listLoading = false
      }
    },
    handleSearch() {
      this.getList()
    },
    handleCreate() {
      this.dialogType = 'new'
      this.dialogVisible = true
      this.user = Object.assign({}, defaultUser)
    },
    handleEdit(scope) {
      this.dialogType = 'edit'
      this.dialogVisible = true
      // scope.row.roleIds = []
      this.user = deepClone(scope.row)
    },
    async deleteIndex(scope) {
      console.log(scope.row)
      this.$ajax.delete('/delsptproperty?id=' + scope.row.id)
        .then((isSuccess) => {
          console.log(isSuccess)
          if (isSuccess.data) {
            this.$message({
              message: '删除成功',
              type: 'success'
            })
            this.getList()
          } else {
            this.$message.error('绑定模板，删除失败')
          }
        })
        .catch((response) => {
          this.$message.error('数据删除失败')
        })
    },
    async confirmUser() {
      const isEdit = this.dialogType === 'edit'
      if (isEdit) {
        this.$ajax.post('/updatesptproperty', this.user)
          .then((response) => {
            this.dialogVisible = false
            this.$message({
              showClose: true,
              message: '保存成功',
              type: 'success'
            })
            this.getList()
          })
          .catch(ex => {
            console.error(ex)
            alert('数据传输失败！')
          })
      } else {
        this.$ajax.post('/insertsptproperty', this.user)
          .then((response) => {
            this.dialogVisible = false
            this.$message({
              showClose: true,
              message: '保存成功',
              type: 'success'
            })
            this.getList()
          })
          .catch(ex => {
            console.error(ex)
            alert('数据传输失败！')
          })
      }
    }
  }
}
</script>
