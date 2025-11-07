<template>
  <el-container>
    <el-header>
      <div style="margin-top:20px;margin-bottom: 20px">
        <el-row :gutter="10">
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
      <el-row :gutter="10">
        <h3>跨领域的服务模式</h3>
        <el-table
          :key="tableKey"
          v-loading="listLoading"
          :data="list"
          style="width: 100%;"
          border
        >
          <el-table-column width="50">
            <template slot-scope="scope">
              <span>{{ scope.$index+(listQuery.page - 1) * listQuery.limit + 1 }}</span>
            </template>
          </el-table-column>
          <el-table-column
            property="description"
            label="描述"
          />
          <el-table-column
            label="领域"
          >
            <template slot-scope="scope">
              <span style="margin-left: 10px">{{ scope.row.domain }}</span>
            </template>
          </el-table-column>
          <el-table-column
            label="包含的服务"
          >
            <template slot-scope="scope">
              <span style="margin-left: 10px">{{ scope.row.services }}</span>
            </template>
          </el-table-column>
          <el-table-column
            label="操作"
          >
            <template slot-scope="scope">
              <el-button type="text" @click="showBPMN(scope)">查看BPMN</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-row>
      <el-row :gutter="10">
        <h3>服务模式间的关系</h3>
        <el-table
          :data="dspR"
          style="width: 100%;"
          border
        >
          <el-table-column width="50">
            <template slot-scope="scope">
              <span>{{ scope.$index + 1 }}</span>
            </template>
          </el-table-column>
          <el-table-column
            property="from"
            label="head"
          />
          <el-table-column
            label="tail"
          >
            <template slot-scope="scope">
              <span style="margin-left: 10px">{{ scope.row.to }}</span>
            </template>
          </el-table-column>
          <el-table-column
            label="关系"
          >
            <template slot-scope="scope">
              <span style="margin-left: 10px">{{ scope.row.type }}</span>
            </template>
          </el-table-column>
        </el-table>
      </el-row>
    </el-main>
    <el-dialog :visible.sync="isShown">
      <div> {{ bpmn }} </div>
    </el-dialog>
  </el-container>
</template>
<script>
import { deepClone } from '@/utils'
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination
import request from '@/utils/request2'
export default {
  components: {
    Pagination
  },
  filters: {
    formatDate: function(value) {
      const date = new Date(value)
      if (date.getTime() < new Date(2000, 1, 1).getTime()) {
        return ''
      }
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
      rawData: [
        {
          description: 'SP1',
          domain: '医疗保健,交通',
          tasks: '急救,治疗',
          services: 'call120,cure'
        },
        {
          description: 'SP2',
          domain: '医疗保健,交通',
          tasks: '急救,治疗',
          services: 'call120,cure_2'
        },
        {
          description: 'SP3',
          domain: '医疗保健,通讯服务',
          tasks: '急救,在线通讯',
          services: 'call120,inform_family'
        }
      ],
      serviceData: [],
      dspR: [
        {
          from: 'SP2',
          to: 'SP1',
          type: '竞争关系'
        },
        {
          from: 'SP3',
          to: 'SP1',
          type: '功能互补关系'
        }
      ],
      total: 0,
      listLoading: false,
      listQuery: {
        page: 1,
        limit: 10,
        creator: '',
        description: '',
        state: ''
      },
      stateMap: {
        INITIALIZATION: '待生成', EDITING: '编辑中', CREATED: '已生成', RUNNING: '执行中', FINISH: '执行完毕',
        '': '全部'
      },
      userList: [],
      bpmn: '',
      isShown: false
    }
  },
  created: function() {
    // this.loadCategory()
    //   .then(() => this.getList())
    this.getList()
  },
  methods: {
    loadCategory() {
      return request({
        url: '/user/list',
        method: 'get'
      }).then(data => {
        this.userList = data
      })
    },
    async getList() {
      this.listLoading = true
      // If the Promise is rejected, the rejected value is thrown.
      try {
        const query = deepClone(this.listQuery)
        query.page -= 1
        // const res = await request({
        //   url: '/solution/query',
        //   method: 'get',
        //   params: query
        // })
        this.listLoading = false
        this.list = this.rawData
        this.total = this.rawData.length
        // this.list = res.content
        // this.total = res.totalElements
      } catch (e) {
        this.listLoading = false
      }
    },
    handleSearch() {
      this.getList()
    },
    openUrl(url) {
      window.open(url)
    },
    showBPMN(scope) {
      // window.open(`http://10.147.19.68:18080/process/downloadXML/pattern?tasks=${scope.row.tasks}`)
      this.$ajax.get(`http://10.147.19.68:18080/process/downloadXML/pattern?tasks=${scope.row.tasks}`).then(response => {
        this.bpmn = response.data
        this.isShown = true
      })
    }
  }
}
</script>
