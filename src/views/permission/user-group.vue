<template>
  <div class="app-container">
    <div class="filter-container" style="margin-top:20px;">
      <el-input
        v-model="listQuery.name"
        placeholder="用户组"
        style="width: 200px;"
        class="filter-item"
      />

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
      >
        <i class="el-icon-plus" /> 新增
      </el-button>
    </div>

    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      style="width: 100%;"
      height="450"
    >
      <el-table-column prop="groupName" label="用户组名称" />
      <el-table-column prop="description" label="描述" />

      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button
            type="text"
            size="small"
            @click="handleEdit(scope)"
          >编辑</el-button>
          <el-button
            type="text"
            size="small"
            @click="handleDelete(scope)"
          >删除</el-button>
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
      <el-form :model="role" label-width="80px" label-position="left">
        <el-form-item label="用户组">
          <el-input v-model="role.groupName" placeholder="用户组" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="role.description"
            :autosize="{ minRows: 2, maxRows: 4}"
            type="textarea"
            placeholder="描述"
          />
        </el-form-item>
        <el-form-item label="用户列表">
          <el-checkbox-group v-model="role.users">
            <el-checkbox
              v-for="item in users"
              :key="item.uid"
              :label="item"
              style="padding-top:20px"
            >{{ item.viewName }}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <div style="text-align:right;">
        <el-button type="danger" @click="dialogVisible=false">取消</el-button>
        <el-button type="primary" @click="confirmRole">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import permission from '@/directive/permission/index.js' // 权限判断指令
import {
  roleList,
  users,
  addRole,
  updateRole,
  deleteRole
} from '@/api/permission/user-group'
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination
import { deepClone } from '@/utils'
const defaultRole = {
  groupName: '',
  description: '',
  users: []
}

export default {
  name: 'UserGroup',
  components: { Pagination },
  directives: { permission },
  data() {
    return {
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: false,
      listQuery: {
        page: 1,
        limit: 10,
        name: ''
      },
      role: Object.assign({}, defaultRole),
      users: [],
      dialogVisible: false,
      dialogType: 'new'
    }
  },
  created() {
    this.getUsers()
    this.getList()
  },
  methods: {
    async getUsers() {
      // If the Promise is rejected, the rejected value is thrown.
      try {
        const res = await users()
        this.users = res.map(user => {
          delete user['@id']
          return user
        })
      } catch (e) {
        console.error(e)
      }
    },
    async getList() {
      this.listLoading = true
      // If the Promise is rejected, the rejected value is thrown.
      try {
        const res = await roleList(this.listQuery)
        this.listLoading = false
        this.list = res.content.map(group => {
          group.users = group.users.map(user => {
            delete user['@id']
            return user
          })
          return group
        })
        this.total = res.numberOfElements
      } catch (e) {
        this.listLoading = false
      }
    },
    handleSearch() {
      this.getList()
    },
    handleCreate() {
      this.role = Object.assign({}, defaultRole)
      if (this.$refs.tree) {
        this.$refs.tree.setCheckedNodes([])
      }
      this.dialogType = 'new'
      this.dialogVisible = true
    },
    async handleEdit(scope) {
      this.dialogType = 'edit'
      this.dialogVisible = true
      this.role = deepClone(scope.row)
      this.role.users = this.role.users.map(user => {
        const i = this.users.findIndex(u => u.uid === user.uid)
        return this.users[i]
      })
    },
    async confirmRole() {
      const isEdit = this.dialogType === 'edit'
      if (isEdit) {
        await updateRole(this.role.groupName, this.role)
      } else {
        await addRole(this.role)
      }
      this.dialogVisible = false
      this.$message({
        showClose: true,
        message: '保存成功',
        type: 'success'
      })
      this.getList()
    },
    handleDelete({ row }) {
      this.$confirm('确认删除角色?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async() => {
          await deleteRole(row.id)
          this.$message({
            showClose: true,
            message: '删除成功',
            type: 'success'
          })
          this.getList()
        })
        .catch(err => {
          console.error(err)
        })
    }
  }
}
</script>
