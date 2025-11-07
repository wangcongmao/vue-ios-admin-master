<template>
  <div class="app-container">
    <div class="filter-container" style="margin-top:20px;">
      <el-input
        v-model="listQuery.name"
        placeholder="角色名"
        style="width: 200px;"
        class="filter-item"
      />

      <el-button
        v-permission="['/rest/role/list']"
        class="filter-item"
        type="primary"
        icon="el-icon-search"
        @click="handleSearch"
      >查找</el-button>
      <el-button
        v-permission="['/rest/role/add']"
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
      <el-table-column prop="name" label="角色名" />
      <el-table-column prop="description" label="描述" />

      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button
            v-permission="['/rest/role/update']"
            type="text"
            size="small"
            @click="handleEdit(scope)"
          >编辑</el-button>
          <el-button
            v-permission="['/rest/role/delete']"
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
        <el-form-item label="角色名">
          <el-input v-model="role.name" placeholder="角色名" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="role.description"
            :autosize="{ minRows: 2, maxRows: 4}"
            type="textarea"
            placeholder="描述"
          />
        </el-form-item>
        <el-form-item label="权限许可">
          <el-tree
            ref="tree"
            :check-strictly="checkStrictly"
            :data="permissions"
            :props="defaultProps"
            default-expand-all
            show-checkbox
            node-key="id"
            class="permission-tree"
          />
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
  addRole,
  updateRole,
  deleteRole
} from '@/api/permission/role'
import { permissions, permissionsByRole } from '@/api/permission/permission'
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination
import { deepClone } from '@/utils'
import { isEmpty } from '@/utils/validate'
const defaultRole = {
  id: undefined,
  name: '',
  description: '',
  permIds: ''
}
export default {
  name: 'Role',
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
      dialogVisible: false,
      dialogType: 'new',
      checkStrictly: false,
      defaultProps: {
        children: 'childrens',
        label: 'name'
      },
      permissions: [],
      permissionsByRole: []
    }
  },
  created() {
    this.getList()
    this.getPermissions()
  },
  methods: {
    async getList() {
      this.listLoading = true
      // If the Promise is rejected, the rejected value is thrown.
      try {
        const res = await roleList(this.listQuery)
        this.listLoading = false
        this.list = res.result.rows
        this.total = res.result.records
      } catch (e) {
        this.listLoading = false
      }
    },
    async getPermissions() {
      const res = await permissions()
      this.permissions = res.result
      // this.permissions = this.generateRoutes(res.data);
    },
    async getPermissionsByRole(roleId) {
      const res = await permissionsByRole(roleId)
      this.permissionsByRole = res.result
      // this.routes = this.generateRoutes(res.data);
    },
    handleSearch() {
      this.getList()
    },
    handleCreate() {
      this.role = Object.assign({}, defaultRole)
      if (this.$refs.tree) {
        this.$refs.tree.setCheckedNodes([])
      }
      this.checkStrictly = true
      this.dialogType = 'new'
      this.dialogVisible = true
    },
    generateArr(routes) {
      let data = []
      routes.forEach(route => {
        data.push(route)
        if (route.childrens) {
          const temp = this.generateArr(route.childrens)
          if (temp.length > 0) {
            data = [...data, ...temp]
          }
        }
      })
      return data
    },
    async handleEdit(scope) {
      this.dialogType = 'edit'
      this.dialogVisible = true
      this.checkStrictly = true
      this.role = deepClone(scope.row)
      const res = await permissionsByRole(this.role.id)
      this.permissionsByRole = res.result
      this.$nextTick(() => {
        this.$refs.tree.setCheckedNodes(
          this.generateArr(this.permissionsByRole)
        )
      })
    },
    async confirmRole() {
      const isEdit = this.dialogType === 'edit'
      var checkedKeys = this.$refs.tree.getCheckedKeys()
      if (!isEmpty(checkedKeys)) {
        this.role.permIds = checkedKeys.join(',')
      }
      if (isEdit) {
        await updateRole(this.role)
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
