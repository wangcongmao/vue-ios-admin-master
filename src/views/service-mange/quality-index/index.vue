<template>
  <div class="app-container">
    <div style="margin-top:20px;margin-bottom: 20px">
      <el-row :gutter="10">
        <el-col :span="4">
          <el-input v-model="listQuery.name" placeholder="名称" />
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
      <el-table-column prop="name" label="名称" />
      <el-table-column prop="valueType" label="值类型" />
      <el-table-column prop="threshold" label="误差阈值" />
      <el-table-column prop="unit" label="单位" />
      <el-table-column prop="computeType" label="计算方式" />
      <el-table-column prop="combineModeP" label="并行组合方式" />
      <el-table-column prop="combineModeS" label="串行组合方式" />
      <el-table-column label="可为优化目标">
        <template slot-scope="scope">
          {{ scope.row.couldOptimize?'是':'否' }}
        </template>
      </el-table-column>
      <el-table-column label="正负性">
        <template slot-scope="scope">
          {{ scope.row.positive?'是':'否' }}
        </template>
      </el-table-column>
      <el-table-column label="是否必填">
        <template slot-scope="scope">
          {{ scope.row.required?'是':'否' }}
        </template>
      </el-table-column>
      <el-table-column align="center"  min-width="100" label="操作">
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
      <el-form :model="user" label-width="80px" label-position="left" >
        <el-form-item label="名称">
          <el-input v-model="user.name" placeholder="名称" />
        </el-form-item>
        <el-form-item label="值类型">
          <el-select v-model="user.valueType" placeholder="请选择">
            <el-option
              v-for="item in valueTypeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
          <!--<el-input v-model="user.valueType" placeholder="值类型" />-->
        </el-form-item>
        <el-form-item label="误差阈值">
          <el-input v-model="user.threshold" placeholder="误差阈值" />
        </el-form-item>
        <el-form-item label="单位">
          <el-input v-model="user.unit" placeholder="单位" />
        </el-form-item>
        <el-form-item label="串行组合方式">
          <el-select v-model="user.combineModeS" placeholder="请选择">
            <el-option
              v-for="item in combineModeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="并行组合方式">
          <el-select v-model="user.combineModeP" placeholder="请选择">
            <el-option
              v-for="item in combineModeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
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
        <el-form-item label="是否必填">
          <el-switch
            v-model="user.required"
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
import { deepClone } from '@/utils'
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination
import request from '@/utils/request2'

const defaultUser = {
  indexId: '',
  name: '',
  valueType: 'Integer',
  threshold: '0',
  unit: '',
  combineMode: 'FIRST',
  required: false,
  couldOptimize: false
}

export default {
  name: 'QualityIndex',
  components: { Pagination },
  data() {
    return {
      searchOptions: [
        { label: '名称', key: 'name' }
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
      valueTypeOptions: [
        {
          value: 'Integer',
          label: '整型'
        }, {
          value: 'Float',
          label: '浮点型'
        }
      ],
      combineModeOptions: [
        {
          value: 'SUM',
          label: '累加'
        }, {
          value: 'AVG',
          label: '平均'
        }, {
          value: 'MUL',
          label: '相乘'
        }, {
          value: 'MAX',
          label: '取最大值'
        }, {
          value: 'MIN',
          label: '取最小值'
        }, {
          value: 'FIRST',
          label: '取第一个值'
        }
      ],
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
    async getList() {
      this.listLoading = true
      // If the Promise is rejected, the rejected value is thrown.
      try {
        const query = deepClone(this.listQuery)
        query.page -= 1
        const res = await request({
          url: '/qualityIndex/list',
          method: 'get'
          //, params: query
        })
        this.listLoading = false
        this.list = res // res.content
        this.total = res.length
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
      // const data = {
      //   id: scope.row.indexId
      // }
      // user: Object.assign({}, defaultUser),
      this.user = deepClone(scope.row)
      await request({
        url: `/qualityIndex/${this.user.indexId}`,
        method: 'delete'
      }).then((response) => {
        this.$message({
          message: '删除成功',
          type: 'success'
        })
      }).catch((response) => {
        this.$message.error('删除失败')
      })
      this.getList()
    },
    async confirmUser() {
      const isEdit = this.dialogType === 'edit'
      if (isEdit) {
        await request({
          url: `/qualityIndex/update/${this.user.indexId}`,
          method: 'post',
          data: this.user
        })
      } else {
        await request({
          url: `/qualityIndex/create`,
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
