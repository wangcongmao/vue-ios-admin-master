<template>
  <el-container>
    <el-header>
      <el-table
        :data="tableData"
        style="width: 100%;"
        height="450"
        highlight-current-row
        border
        @current-change="handleCurrentChange"
      >
        <el-table-column width="50" type="index" />
        <el-table-column
          label="方案描述"
          width="120"
        >
          <template slot-scope="scope">
            <span style="margin-left: 10px">{{ scope.row.solution.description }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="发起者"
          width="120"
        >
          <template slot-scope="scope">
            <span style="margin-left: 10px">{{ scope.row.solution.creator.viewName }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="状态"
          width="120"
        >
          <template slot-scope="scope">
            <span style="margin-left: 10px">{{ stateMap[scope.row.solution.state] }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="方案创建时间"
          width="120"
        >
          <template slot-scope="scope">
            <span style="margin-left: 10px">{{ scope.row.solution.createTimestamp | formatDate }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="方案启动时间"
          width="120"
        >
          <template slot-scope="scope">
            <span style="margin-left: 10px">{{ scope.row.solution.startTimestamp | formatDate }}</span>
          </template>
        </el-table-column>
      </el-table>
    </el-header>
    <el-main>
      <el-table
        v-if="session!=null && session.statuses!=null"
        :data="session.statuses"
        style="width: 100%;"
        height="450"
        border
      >
        <el-table-column label="" width="50">
          <template slot-scope="scope">
            <span>{{ scope.$index+ 1 }}</span>
          </template>
        </el-table-column>
        <el-table-column label="服务名称" width="90">
          <template slot-scope="scope">
            <span>{{ scope.row.serviceInfo.serviceName }}</span>
          </template>
        </el-table-column>
        <el-table-column label="服务描述" width="90">
          <template slot-scope="scope">
            <span>{{ scope.row.serviceInfo.textDescription }}</span>
          </template>
        </el-table-column>
        <el-table-column label="相关角色" width="90">
          <template slot-scope="scope">
            <span>{{ Array.from(new Set(scope.row.serviceInfo.roles.map(role=>role.id.name))).join(',') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="运行状态" width="90">
          <template slot-scope="scope">
            <span>
              {{ scope.row.serviceStage=='RUNNING'?'运行中':'' }}
              {{ scope.row.serviceStage=='CREATED'?'未开始':'' }}
              {{ scope.row.serviceStage=='FINISH'?'已完成':'' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="当前结果" width="90">
          <template slot-scope="scope">
            <span>
              {{ scope.row.currentValue }}
            </span>
          </template>
        </el-table-column>
      </el-table>
      <img v-if="session!=null" :src="$http.defaults.baseURL+'process/download/'+session.processId">
    </el-main>
  </el-container>
</template>
<script>
import request from '@/utils/request2'
export default {
  components: {

  },
  data() {
    return {
      tableData: [],
      currentRow: null,
      responseData: {},
      sub_url: '',
      session: null,
      stateMap: {
        INITIALIZATION: '待生成', EDITING: '编辑中', CREATED: '已生成', RUNNING: '执行中', FINISH: '执行完毕',
        '': '全部'
      }
    }
  },
  mounted: function() {
    request({
      url: `/process/sessions`,
      method: 'get'
    })
    // this.$http.get('/process/sessions')
    //   .then(response => response.data)
      .then(data => {
        this.tableData = data
      })
  },
  methods: {
    handleCurrentChange(val) {
      this.session = val
    },
    continueExecute(session) {
      this.$http.get('/task/list')
        .then(response => response.data)
        .then(data => {
          data.filter(task => task.processId == session.processId).forEach(task => {
            session.statuses.filter(status => status.serviceInfo.serviceName == task.name).forEach(status => {
              // let serviceId = status.serviceInfo.serviceId;
              this.sub_url = `http://${status.serviceInfo.servicePath}/?sessionId=${session.sessionId}`
              console.info(this.sub_url)
            })
          })
        })
    }
  }
}
</script>
