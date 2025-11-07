<template>
  <el-container>
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
          property="serviceName"
          label="服务名称"
          width="120"
        />
        <el-table-column
          label="Feature"
          width="150"
        >
          <template slot-scope="scope">
            <el-tag
              v-for="(feature,index) in scope.row.features"
              :key="index"
              size="mini"
            >
              {{ feature.name }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          label="所属领域"
          width="150"
        >
          <template slot-scope="scope">
            <el-tag
              v-for="(catelogy,index) in scope.row.categoryMappings"
              :key="index"
              :type="catelogy.fullLink?'success':'info'"
              size="mini"
            >
              {{ catelogy.category.catelogyName }}
            </el-tag>
            <!--<span style="margin-left: 10px">{{ getCatelogyName(scope.row) }}</span>-->
          </template>
        </el-table-column>
        <el-table-column
          label="服务提供商"
          width="120"
        >
          <template slot-scope="scope">
            <span style="margin-left: 10px">{{ scope.row.provider.name }}</span>
          </template>
        </el-table-column>
        <el-table-column
          property="region"
          label="区域"
          width="120"
        />
        <el-table-column
          property="workTime"
          label="时间"
          width="120"
        />
        <el-table-column
          label="相关指标"
          width="120"
        >
          <template slot-scope="scope">
            <span
              v-for="(serviceIndex,i) in scope.row.serviceIndices"
              :key="i"
              style="margin-left: 10px"
            >
              {{ qualityIndexes.filter(q=>q.indexId==serviceIndex.id.indexId).map(x=>x.name)[0] }}:
              {{ serviceIndex.value }}
            </span>
          </template>
        </el-table-column>
        <el-table-column
          property="textDescription"
          label="服务描述"
          width="120"
        />
        <el-table-column
          property="version"
          label="服务版本"
          width="120"
        />
        <el-table-column
          label="服务创建时间"
          width="120"
        >
          <template slot-scope="scope">
            <span style="margin-left: 10px">{{ scope.row.createTimestamp | formatDate }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="角色列表"
          width="120"
        >
          <template slot-scope="scope">
            <span style="margin-left: 10px">{{ scope.row.roles.map(role => role.id.name).join(',') }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="接口详情"
          width="120"
        >
          <template slot-scope="scope">
            <router-link :to="{path:'/service-mange/list-service/list-api',query: {serviceId: scope.row.serviceId}}">查看接口详情</router-link>
          </template>
        </el-table-column>
      </el-table>
    </el-main>
    <el-footer>
      <pagination
        v-show="total>0"
        :total="total"
        :page.sync="listQuery.page"
        :limit.sync="listQuery.limit"
        @pagination="getList"
      />
    </el-footer>
  </el-container>

</template>

<script>
import { deepClone } from '@/utils'
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination
import request from '@/utils/request2'

export default {
  name: 'ServiceTable',
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
  props: {
    listQuery: {
      type: Object,
      default: function() {
        return {
          page: 1,
          limit: 10,
          name: '',
          description: '',
          category: '',
          provider: ''
        }
      }
    }
  },
  data: function() {
    return {
      tableKey: 0,
      list: [],
      total: 0,
      listLoading: false,
      qualityIndexes: []
    }
  },
  created: function() {
    this.loadQualityIndexes()
  },
  methods: {
    async getList() {
      this.listLoading = true
      // If the Promise is rejected, the rejected value is thrown.
      try {
        const query = deepClone(this.listQuery)
        query.page -= 1
        delete query.sspR
        const res = await request({
          url: '/service/query',
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
    async loadQualityIndexes() {
      return request({
        url: '/qualityIndex/list',
        method: 'get'
      }).then(data => {
        this.qualityIndexes = data
        // this.serviceIndexes2 = this.qualityIndexes.filter(i => !i.required)
      })
    }
  }
}
</script>

<style scoped>

</style>
