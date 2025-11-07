<template>
  <div class="app-container">
    <div style="margin-top:20px;margin-bottom: 20px">
      <el-row :gutter="10">
        <el-col :span="4">
          <el-input v-model="listQuery.name" placeholder="名称" />
        </el-col>
        <el-col :span="4">
          <el-input v-model="listQuery.location" placeholder="地址" />
        </el-col>
        <el-col :span="8">
          <el-button
            class="filter-item"
            type="primary"
            icon="el-icon-search"
            @click="handleSearch"
          >查找</el-button>
          <el-button
            class="filter-item"
            style="margin-left: 10px;"
            type="primary"
            @click="handleCreate"
          > <i class="el-icon-plus" />新增</el-button>
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
          <span>{{ scope.$index+(listQuery.page - 1) * listQuery.limit + 1 }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="name" label="名称" width="120" />
      <el-table-column prop="location" label="地址" width="90" />
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button
            type="text"
            size="small"
            @click="handleEdit(scope)"
          >编辑</el-button>
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
          <el-input v-model="user.name" placeholder="名称" />
        </el-form-item>
        <el-form-item label="地址">
          <el-input v-model="user.location" placeholder="地址" />
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
import { deepClone } from '@/utils'
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination
import request from '@/utils/request2'

const defaultUser = {
  name: '',
  location: ''
}

export default {
  name: 'ServiceProvider',
  components: { Pagination },
  data() {
    return {
      searchOptions: [
        { label: '名称', key: 'name' },
        { label: '地址', key: 'location' }
      ],
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: false,
      listQuery: {
        page: 1,
        limit: 10,
        name: '',
        location: ''
      },
      user: Object.assign({}, defaultUser),
      activeName: 'first',
      dialogVisible: false,
      dialogType: 'new'
    }
  },
  created() {
    this.getList()
  },
  methods: {
    async getList() {
      this.listLoading = true
      // If the Promise is rejected, the rejected value is thrown.
      try {
        const query = deepClone(this.listQuery)
        query.page -= 1
        const res = await request({
          url: '/serviceProvider/query',
          method: 'get',
          params: query
        })
        this.listLoading = false
        this.list = res.content
        this.total = res.totalElements
      } catch (e) {
        this.listLoading = false
      }
    },
    handleSearch() {
      this.getList()
    },
    handleCreate() {
      this.dialogType = 'new'
      this.activeName = 'first'
      this.dialogVisible = true
      this.user = Object.assign({}, defaultUser)
    },
    handleEdit(scope) {
      this.dialogType = 'edit'
      this.activeName = 'first'
      this.dialogVisible = true
      // scope.row.roleIds = []
      this.user = deepClone(scope.row)
    },
    async confirmUser() {
      const isEdit = this.dialogType === 'edit'
      if (isEdit) {
        await request({
          url: `/serviceProvider/update/${this.user.id}`,
          method: 'post',
          data: this.user
        })
      } else {
        await request({
          url: `/serviceProvider/create`,
          method: 'post',
          data: this.user
        })
      }
      this.dialogVisible = false
      this.$message({
        showClose: true,
        message: '保存成功',
        type: 'success'
      })
      this.getList()
    }
  }
}
</script>
