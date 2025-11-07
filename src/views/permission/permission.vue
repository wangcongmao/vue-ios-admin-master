<template>
  <div class="app-container">
    <div style="margin-top:20px;max-width:600px;margin-left: 80px;">
      <el-row :gutter="20">
        <el-col :span="20">
          <el-input placeholder="输入关键字进行过滤" v-model="filterText" clearable></el-input>
        </el-col>
        <el-col :span="4">
          <el-button class="filter-item" type="primary" @click="() => handleCreate()">
            <i class="el-icon-plus" /> 添加
          </el-button>
        </el-col>
      </el-row>
      <el-row style="padding-top:20px">
        <el-col>
          <el-tree
            ref="tree"
            :data="permissions"
            :props="defaultProps"
            node-key="id"
            class="permission-tree"
            default-expand-all
            :expand-on-click-node="false"
            :filter-node-method="filterNode"
          >
            <span class="custom-tree-node" slot-scope="{ node, data }">
              <span>{{ node.label }}</span>
              <span>
                <el-button
                  type="text"
                  size="mini"
                  @click="() => handleCreate(data)"
                  v-permission="['/rest/permission/add']"
                >添加</el-button>
                <el-button
                  type="text"
                  size="mini"
                  @click="() => handleEdit(node,data)"
                  v-permission="['/rest/permission/update']"
                >编辑</el-button>
                <el-button
                  type="text"
                  size="mini"
                  @click="() => handleDelete(data)"
                  v-permission="['/rest/permission/delete']"
                >删除</el-button>
              </span>
            </span>
          </el-tree>
        </el-col>
      </el-row>
    </div>
    <el-dialog :visible.sync="dialogVisible" :title="dialogType==='edit'?'编辑':'新增'">
      <el-form :model="permission" label-width="80px" label-position="left">
        <el-form-item label="上级权限">
          <treeselect
            v-model="permission.parentId"
            :options="permissions"
            :normalizer="normalizer"
            placeholder="选择上级部门"
          />
        </el-form-item>
        <el-form-item label="权限名">
          <el-input v-model="permission.name" placeholder="权限名" />
        </el-form-item>
        <el-form-item label="权限类型">
          <el-select v-model="permission.types" style="width: 140px" class="filter-item">
            <el-option
              v-for="item in typesOptions"
              :key="item.key"
              :label="item.label"
              :value="item.key"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="url">
          <el-input v-model="permission.url" placeholder="url" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input v-model="permission.sorts" placeholder="排序" />
        </el-form-item>
      </el-form>
      <div style="text-align:right;">
        <el-button type="danger" @click="dialogVisible=false">取消</el-button>
        <el-button type="primary" @click="confirmPermission">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
// import the component
import Treeselect from "@riophae/vue-treeselect";
// import the styles
import "@riophae/vue-treeselect/dist/vue-treeselect.css";
import permission from "@/directive/permission/index.js"; // 权限判断指令
import {
  permissions,
  addPermission,
  updatePermission,
  deletePermission
} from "@/api/permission/permission";
import { deepClone } from "@/utils";
import { isEmpty, isString, isArray } from "@/utils/validate";
const defaultPermission = {
  id: undefined,
  name: "",
  parentId: undefined,
  parentName: "",
  url: "",
  types: "",
  sorts: undefined
};
export default {
  name: "Permission",
  components: { Treeselect },
  directives: { permission },
  data() {
    return {
      defaultProps: {
        children: "childrens",
        label: "name"
      },
      permission: Object.assign({}, defaultPermission),
      permissions: [],
      dialogVisible: false,
      dialogType: "new",
      typesOptions: [{ label: "菜单", key: 0 }, { label: "按钮", key: 1 }],
      filterText: ""
    };
  },
  created() {
    this.getPermissions();
  },
  watch: {
    filterText(val) {
      this.$refs.tree.filter(val);
    }
  },
  methods: {
    async getPermissions() {
      const res = await permissions();
      let result = res.result;
      this.diGuiTree(result);
      this.permissions = [{ id: 0, name: "权限树", childrens: result }];
    },
    filterNode(value, data) {
      if (!value) return true;
      return data.name.indexOf(value) !== -1;
    },
    diGuiTree(item) {
      //递归便利树结构
      item.forEach(item => {
        item.childrens === "" ||
        item.childrens === undefined ||
        item.childrens === null
          ? delete item.childrens
          : this.diGuiTree(item.childrens);
      });
    },
    normalizer(node) {
      return {
        id: node.id,
        label: node.name,
        children: node.childrens
      };
    },
    handleCreate(data) {
      this.dialogType = "new";
      this.dialogVisible = true;
      this.permission = Object.assign({}, defaultPermission);
      if (data != null) {
        this.permission.parentId = data.id;
        this.permission.parentName = data.name;
      }
    },

    async handleEdit(node, data) {
      this.dialogType = "edit";
      this.dialogVisible = true;
      this.permission = deepClone(data);
      const parent = node.parent.data;
      this.permission.parentId = parent.id;
      this.permission.parentName = parent.name;
    },
    async confirmPermission() {
      const isEdit = this.dialogType === "edit";
      if (isEdit) {
        await updatePermission(this.permission);
      } else {
        await addPermission(this.permission);
      }
      this.dialogVisible = false;
      this.$message({
        showClose: true,
        message: "保存成功",
        type: "success"
      });
      this.getPermissions();
    },
    handleDelete(data) {
      this.$confirm("确认删除?", "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(async () => {
          await deletePermission(data.id);
          this.$message({
            showClose: true,
            message: "删除成功",
            type: "success"
          });
          this.getPermissions();
        })
        .catch(err => {
          console.error(err);
        });
    }
  }
};
</script>
<style>
.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  padding-right: 8px;
}
</style>