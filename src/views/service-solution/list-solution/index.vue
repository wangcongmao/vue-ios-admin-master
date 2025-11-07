<template>
  <el-container>
    <el-header>
      <div style="margin-top:20px;margin-bottom: 20px">
        <el-row :gutter="10">
          <el-col :span="4">
            <el-input v-model="listQuery.creator" placeholder="发起者" />
          </el-col>
          <el-col :span="4">
            <el-input v-model="listQuery.description" placeholder="描述" />
          </el-col>
          <el-col :span="2">
            <label style="float: right;position: center;margin-top: 15%;">状态：</label>
          </el-col>
          <el-col :span="4">
            <!--<el-input v-model="listQuery.state" placeholder="状态" />-->
            <el-select v-model="listQuery.state" title="状态" style="width: 140px" class="filter-item">
              <el-option
                v-for="(value,key) in stateMap"
                :key="key"
                :label="value"
                :value="key"
              />
            </el-select>
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
          property="description"
          label="方案描述"
          width="120"
        />
        <el-table-column
          label="发起者"
          width="120"
        >
          <template slot-scope="scope">
            <span style="margin-left: 10px">{{ scope.row.creator.viewName }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="状态"
          width="120"
        >
          <template slot-scope="scope">
            <span style="margin-left: 10px">{{ stateMap[scope.row.state] }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="方案创建时间"
          width="120"
        >
          <template slot-scope="scope">
            <span style="margin-left: 10px">{{ scope.row.initialTimestamp | formatDate }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="方案生成时间"
          width="120"
        >
          <template slot-scope="scope">
            <span style="margin-left: 10px">{{ scope.row.createTimestamp | formatDate }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
        >
          <template slot-scope="scope">
            <!--            <el-button v-if="scope.row.state=='INITIALIZATION'" type="text" @click="matchSp(scope)">生成服务方案</el-button>-->
            <!--            <el-button type="text" @click="openUrl(scope.row.operationUrl)">查看服务方案流程</el-button>-->
            <!--            <el-button v-if="scope.row.state=='CREATED'" type="text" @click="execute(scope.row.operationUrl)">部署服务方案实例</el-button>-->
            <!--            v-if="scope.row.state=='CREATED'||scope.row.state=='RUNNING'||scope.row.state=='FINISH'"-->
            <!--            <el-button v-if="scope.row.state!=='INITIALIZATION'" type="text" @click="showDetails(scope.row)">查看服务方案实例</el-button>-->
            <el-button v-if="scope.row.state=='INITIALIZATION'" type="text" @click="matchSp(scope)">生成服务方案</el-button>
            <el-button v-if="scope.row.state=='EDITING' || scope.row.state=='RUNNING'||scope.row.state=='FINISH' || scope.row.state=='CREATED'" type="text" @click="openUrl(scope.row.operationUrl)">查看服务方案</el-button>
            <el-button v-if="scope.row.state=='CREATED'" type="text" @click="execute(scope.row.operationUrl, scope.row.id)">部署服务方案实例</el-button>
            <el-button v-if="scope.row.state=='RUNNING'||scope.row.state=='FINISH'" type="text" @click="showDetails(scope.row)">查看服务方案实例</el-button>
            <!--            scope.row.state=='CREATED'|| 上面那个按钮在服务方案状态是CREATED时是没有具体实例的-->
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

      <hr>
      <el-table
        :data="instanceList"
        style="width: 100%;"
        height="450"
        border
      >
        <el-table-column width="50">
          <template slot-scope="scope">
            <span>{{ scope.$index + 1 }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="实例状态"
          width="120"
        >
          <template slot-scope="scope">
            <span style="margin-left: 10px">{{ instanceStateMap[scope.row.state] }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="实例启动时间"
          width="120"
        >
          <template slot-scope="scope">
            <span style="margin-left: 10px">{{ scope.row.startTimestamp | formatDate }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="实例完成时间"
          width="120"
        >
          <template slot-scope="scope" />
        </el-table-column>
        <el-table-column label="实例流程图">
          <template slot-scope="scope">
            <img v-if="scope.row.state !== 'INITIALIZATION' " :src="serviceUrl+'/process/download/'+scope.row.processId" style="margin-left: 10px" @click="showimgGraph(scope.row.processId)"></img>
            <span v-if="scope.row.state === 'INITIALIZATION' " style="margin-left: 10px">暂未启动，尚无图片</span>
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          width="180"
        >
          <template slot-scope="scope">
            <el-button v-if="scope.row.state=='INITIALIZATION'" type="text" @click="startInstance(scope.row)">启动服务方案实例</el-button>
            <el-button type="text" @click="showDetails2(scope.row)">查看实例详情</el-button>
          </template>
        </el-table-column>
      </el-table>
      <hr>

      <el-table
        v-if="currentInstance!=null"
        :data="serviceStatuses"
        style="width: 100%;"
        height="450"
        border
      >
        <el-table-column width="50">
          <template slot-scope="scope">
            <span>{{ scope.$index + 1 }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="任务名称"
          width="240"
        >
          <template slot-scope="scope">
            <span style="margin-left: 10px">{{ scope.row.activityName }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="任务指派角色"
          width="120"
        >
          <template slot-scope="scope">
            <span style="margin-left: 10px">{{ scope.row.roleAssignee }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="服务所在节点"
          width="120"
        >
          <template slot-scope="scope">
            <span style="margin-left: 10px">{{ nodeInfos[scope.row.nodeId] }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="执行结果"
          width="480"
        >
          <template slot-scope="scope">
            <span v-if="scope.row.currentValue !== '{}' " style="margin-left: 10px">{{ scope.row.currentValue }}</span>
            <span v-if="scope.row.currentValue === '{}' " style="margin-left: 10px">服务暂未执行，尚无结果</span>
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          width="360"
        >
          <template slot-scope="scope">
            <el-button v-if="currentInstance.state === 'INITIALIZATION'" :disabled="scope.row.userAssignee==''" type="text" @click="showGroupDialog(scope.row)">指派角色</el-button>
            <span v-if="currentInstance.state !== 'INITIALIZATION'">实例已执行，不可指派角色</span>
          </template>
        </el-table-column>
      </el-table>
    </el-main>
    <el-dialog :visible.sync="assignDialogShow" title="工作角色指派">
      <el-form :model="assignForm" label-width="80px" label-position="left">
        <el-form-item label="指派">
          <el-select v-model="assignForm.assignee" placeholder="请选择执行任务的人员角色">
            <el-option
              v-for="item in groupList"
              :key="item.groupName"
              :label="item.groupName"
              :value="item.groupName"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <div style="text-align:right;">
        <el-button type="danger" @click="assignDialogShow=false">取消</el-button>
        <el-button type="primary" @click="confirmRecord">确定</el-button>
      </div>
    </el-dialog>
  </el-container>
</template>
<script>
import { deepClone } from '@/utils'
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination
import request from '@/utils/request2'
import baseUrl from '../../requires/all-requires/api'

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
      instanceStateMap: {
        INITIALIZATION: '待启动', EDITING: '编辑中', CREATED: '已生成', RUNNING: '执行中', FINISH: '执行完毕',
        '': '全部'
      },
      userList: [],
      userGroups: [],
      instanceList: [],
      currentInstance: null,
      assignForm: {
        assignee: '',
        groups: [],
        candidateUsers: []
      },
      assignDialogShow: false,
      serviceUrl: process.env.VUE_APP_SERVICE_MANAGE_BASE_URL,
      nodeInfos: {},
      groupList: null
    }
  },
  computed: {
    serviceStatuses: function() {
      if (this.currentInstance == null) return []
      return [... new Set(this.currentInstance.statuses)]
    },
    filterUserByAssignForm: function() {
      if (this.assignForm == null || (this.assignForm.assignee && ('' + this.assignForm.assignee.length) > 0)) {
        return [this.$store.getters.userinfo]
      }
      if (this.assignForm.candidateUsers && this.assignForm.candidateUsers.length > 0) {
        return (this.userList || []).filter(user => this.assignForm.candidateUsers.some(id => id == user.uid))
      }
      const candidateSet = new Set()
      this.userGroups.filter(group => this.assignForm.groups.some(name => name == group.groupName)).forEach(group => {
        group.users.forEach(user => {
          candidateSet.add(user)
        })
      }, this)
      return [...candidateSet]
    }
  },
  created: function() {
    this.loadNodeInfos()
    this.loadUsers()
    this.loadGroups()
    this.getList()
    console.log('userinfo', this.$store.getters.userinfo)
  },
  methods: {
    loadNodeInfos() {
      this.$ajax(`${process.env.VUE_APP_CENTER_URL}/node/info`).then(res => {
        console.log(res.data)
        res.data.forEach(nodeInfo => {
          this.nodeInfos[nodeInfo.id] = nodeInfo.description
        })
        console.log(this.nodeInfos)
      })
    },
    loadUsers() {
      return request({
        url: '/user/list',
        method: 'get'
      }).then(data => {
        this.userList = data
      })
    },
    loadGroups() {
      return request({
        url: '/group/list',
        method: 'get'
      }).then(data => {
        this.userGroups = data
      })
    },
    async getList() {
      this.listLoading = true
      // If the Promise is rejected, the rejected value is thrown.
      try {
        const query = deepClone(this.listQuery)
        query.page -= 1
        query.creator = this.$store.getters.userinfo.name
        const res = await request({
          url: '/solution/query',
          method: 'get',
          params: query
        })
        this.listLoading = false
        this.list = res.content
        this.total = res.totalElements
        console.log('list', this.list)
      } catch (e) {
        this.listLoading = false
      }
    },
    handleSearch() {
      this.getList()
    },
    matchSp(scope) {
      // 原本写法
      // const requireId = scope.row.requireId
      // this.loading = true
      // this.$ajax.get(`${process.env.VUE_APP_REQUIRE_BASE_URL}/api/match-result?requireId=${requireId}`).then(response => {
      //   response.data.requireRootName = scope.row.description
      //   const result = response.data
      //   this.$ajax.post(`${baseUrl.matchUrl}/api/getrequest`, result).then(response => {
      //     this.loading = false
      //     this.getList()
      //     // this.visible = true
      //     // this.flowableUrl = response.data.url
      //     // this.delsubData.file = response.data.savepath.split('/').reverse()[1]
      //     // this.delsubData.url = response.data.url.split('=').reverse()[0]
      //   })
      //   // this.selectRequireId = requireId
      // }).catch(_ => {
      //   this.$message.error('匹配失败')
      // })
      console.log(scope)
      this.$router.push({ path: '/requires/all-requires/index', query: { requireId: scope.row.requireId }})
    },
    openUrl(url) {
      window.open(url)
    },
    execute(url, solutionId) {
      this.$ajax.get(`${process.env.VUE_APP_RP_SP_ALGORITHM_URL}/api/runscheme?inputfile=${url.split('=')[1]}&id=${solutionId}`).then((response) => {
        this.$message({
          message: '执行成功',
          type: 'success'
        })
        this.$router.go(0)
      }).catch((respose) => {
        this.$message.error('执行失败')
      })
      // console.log( `${process.env.VUE_APP_RP_SP_ALGORITHM_URL}/api/runscheme?inputfile=${url.split('=')[1]}&id=${solutionId}`)
    },
    async showDetails(solution) {
      this.instanceList = await request({
        url: `/process/sessionBySolution/${solution.id}`,
        method: 'get'
      })
    },
    async startInstance(instance) {
      console.log('instance', instance)
      const msg = await request({
        url: `/solution/startInstance/${instance.sessionId}`,
        method: 'get'
      })
      if (msg.success) {
        this.$message({
          message: '启动成功',
          type: 'success'
        })
        this.showDetails(instance.solution)
      } else {
        this.$message.error('执行失败,' + msg.message)
      }
    },
    async showDetails2(instance) {
      const data = await request({
        url: `/process/session/${instance.sessionId}`,
        method: 'get'
      })
      console.log(data)
      this.currentInstance = data.result
    },
    showAssignee(assignee) {
      if (assignee) {
        if (assignee == 'Provider') {
          return '-'
        } else {
          return (this.userList.find(user => user.uid == assignee) || { viewName: '  ' }).viewName
        }
      } else {
        return '未指派'
      }
    },
    showAssignDialog(status) {
      console.log('status', status)
      this.assignForm = JSON.parse(status.bpmnAssigneeConfig) || {
        assignee: '',
        groups: [],
        candidateUsers: [],
        status: status
      }
      this.assignDialogShow = true
    },
    showGroupDialog(status) {
      console.log('status', status)
      this.$ajax(`${process.env.VUE_APP_SERVICE_MANAGE_BASE_URL}/group/list`).then(res => {
        console.log(res.data)
        this.groupList = res.data
        this.assignForm = {
          assignee: '',
          groups: [],
          candidateUsers: [],
          status: status
        }
        this.assignDialogShow = true
      })
    },
    async confirmRecord() {
      console.log(this.assignForm)
      await request({
        url: `/assignRole/${this.assignForm.status.id}/${this.assignForm.assignee}`,
        method: 'get'
      })
      this.assignDialogShow = false
      this.showDetails2(this.currentInstance)
    },
    showimgGraph(processId) {
      const img = new Image()
      const imgsrc = this.serviceUrl + '/process/download/' + processId
      img.src = this.serviceUrl + '/process/download/' + processId
      this.$Modal.info({
        title: '缩略图',
        width: img.width + 100,
        content: `<img src="${imgsrc}">`
      })
    }

  }
}
</script>
