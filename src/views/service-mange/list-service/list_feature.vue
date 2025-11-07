<template>
  <el-row>
    <el-col :span="24">
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
                >查找</el-button>
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
            height="450"
            border
          >
            <el-table-column width="50">
              <template slot-scope="scope">
                <span>{{ scope.$index+(listQuery.page - 1) * listQuery.limit + 1 }}</span>
              </template>
            </el-table-column>
            <el-table-column
              property="name"
              label="功能点名称"
            />
            <el-table-column
              property="textDescription"
              label="服务描述"
            />
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
</template>
<script>
import { deepClone } from '@/utils'
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination
import request from '@/utils/request2'
import '../service-category/category.scss'
export default {
  components: {
    Pagination
  },
  filters: {
    formatDate: function(value) {
      const date = new Date(value)
      const y = date.getFullYear()
      let MM = date.getMonth() + 1
      MM = MM < 10 ? ('0' + MM) : MM
      let d = date.getDate()
      d = d < 10 ? ('0' + d) : d
      let h = date.getHours()
      h = h < 10 ? ('0' + h) : h
      let m = date.getMinutes()
      m = m < 10 ? ('0' + m) : m
      let s = date.getSeconds()
      s = s < 10 ? ('0' + s) : s
      return y + '-' + MM + '-' + d + ' ' + h + ':' + m + ':' + s
    }
  },
  data() {
    return {
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: false,
      listQuery: {
        page: 1,
        limit: 10,
        name: '',
        description: ''
      }
    }
  },
  created: function() {
    // this.loadCategory().then(() => this.getList())
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
          url: '/serviceFeature/query',
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
    }
  }
}
</script>
