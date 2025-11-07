<template>
  <el-container>
    <el-header>
      <p>当前登陆的用户：{{ this.$store.getters.userinfo.vserName }}</p>
      <!--      <p>用户拥有的角色：{{ roles.join(',') }}</p>-->
    </el-header>
    <el-main>
      <el-row>

        <el-table
          :data="todoservice"
          style="width: 100%;"
          highlight-current-row
          border
        >
          <el-table-column type="index" width="50" />
          <el-table-column label="本地服务方案涉及服务">
            <el-table-column
              label="服务名称"
            >
              <template slot-scope="scope">
                <span>{{ scope.row.activityName }}</span>
              </template>
            </el-table-column>

            <el-table-column
              label="服务所在节点"
            >
              <template slot-scope="scope">
                <span>{{ nodeInfos[scope.row.nodeId] }}</span>
              </template>
            </el-table-column>

            <el-table-column
              label="相关服务方案"
            >
              <template slot-scope="scope">
                <span>{{ scope.row.session.solution.description }}</span>
              </template>
            </el-table-column>

            <el-table-column
              label="服务状态"
            >
              <template slot-scope="scope">
                <el-tag :type="calcType(scope.row.serviceStage)">{{ scope.row.serviceStage }}</el-tag>
                <!--              <span>{{ scope.row.serviceStage }}</span>-->
              </template>
            </el-table-column>

            <el-table-column
              label="操作"
            >
              <template slot-scope="scope">
                <el-button v-if="scope.row.serviceStage === 'RUNNING' " type="success" plain @click="handleCurrentChange(scope.row)">加载服务UI</el-button>
                <el-button v-if="scope.row.finishFlag && !finishButtonShow" type="warning" plain @click="getResult(scope.row)">结束服务调用</el-button>
              </template>
            </el-table-column>
          </el-table-column>
        </el-table>
        <pagination
          v-show="todoTotal>0"
          :total="todoTotal"
          :page.sync="todoQuery.page"
          :limit.sync="todoQuery.limit"
          @pagination="getTodoList"
        />
        <el-table
          style="width: 100%;"
          empty-text="  "
        />
        <el-table
          :data="externtodoservice"
          style="width: 100%;"
          highlight-current-row
          border
        >

          <el-table-column type="index" width="50" />
          <el-table-column label="外部服务方案涉及服务">
            <el-table-column
              label="服务名称"
            >
              <template slot-scope="scope">
                <span>{{ scope.row.activityName }}</span>
              </template>
            </el-table-column>

            <el-table-column
              label="服务所在节点"
            >
              <template slot-scope="scope">
                <span>{{ nodeInfos[scope.row.nodeId] }}</span>
              </template>
            </el-table-column>

            <el-table-column
              label="相关服务方案"
            >
              <template slot-scope="scope">
                <span>{{ scope.row.solutionName }}</span>
              </template>
            </el-table-column>

            <el-table-column
              label="相关服务方案所在节点"
            >
              <template slot-scope="scope">
                <span>{{ nodeInfos[scope.row.solutionNodeId] }}</span>
              </template>
            </el-table-column>

            <el-table-column
              label="服务状态"
            >
              <template slot-scope="scope">
                <el-tag :type="calcType(scope.row.serviceStage)">{{ scope.row.serviceStage }}</el-tag>
                <!--              <span>{{ scope.row.serviceStage }}</span>-->
              </template>
            </el-table-column>

            <el-table-column
              label="操作"
              width="480px"
            >
              <template slot-scope="scope">
                <el-button v-if="scope.row.serviceStage === 'RUNNING' " type="success" plain @click="handleExternSolutionService(scope.row)">加载服务UI</el-button>
                <el-button v-if="scope.row.externFinishFlag && finishButtonShow" type="warning" plain @click="getExternResult(scope.row)">结束服务调用</el-button>
              </template>
            </el-table-column>
          </el-table-column>
        </el-table>
        <pagination
          v-show="externtodoTotal>0"
          :total="externtodoTotal"
          :page.sync="externtodoQuery.page"
          :limit.sync="externtodoQuery.limit"
          @pagination="getExternTodoList"
        />
      </el-row>
      <el-row />
      <form ref="testForm" :action="form.action" :method="form.method" target="testFrame">
        <input v-for="(param,i) in form.params" :key="i" type="hidden" :name="param.name" :value="param.value">
      </form>
      <el-row>
        <iframe id="uiframe" ref="testFrame" width="100%" height="100%" style="min-height: 800px;overscroll-behavior-y: auto" name="testFrame" :src="iframe_src" sandbox="allow-forms allow-same-origin allow-scripts" />
      </el-row>
      <p>{{ test.responseText }}</p>
      <p>{{ test.extracted }}</p>
    </el-main>
  </el-container>
</template>
<script>
import request from '@/utils/request2'
import ContextEditor from '../../service-mange/list-service/ContextEditor.vue'
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination
export default {
  components: {
    ContextEditor, Pagination
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
      iframe_src: 'about:blank',
      solution_list: [],
      stateMap: {
        INITIALIZATION: '待生成', EDITING: '编辑中', CREATED: '已生成', RUNNING: '执行中', FINISH: '执行完毕',
        '': '全部'
      },
      tableData: [],
      roles: [],
      taskList: [],

      status: {},
      responseData: {},
      sub_url: '',
      whenView: false,
      listLoading: false,
      tableKey: 0,
      serviceInfo: { apis: [] },
      ServiceApiType: {
        SYNC_REQUEST: '同步请求', ASYNC_REQUEST: '异步请求', VIEW: '用户界面', FINISH: '结束接口'
      },
      test: {
        testId: 0,
        started: false,
        isUI: false,
        context: [],
        responseText: '',
        extracted: ''
      },
      form: {
        method: 'GET',
        action: '#',
        params: []
      },
      nodeInfos: {},
      loadTwice: false,
      todoservice: [],
      todoTotal: 0,
      todoQuery: {
        page: 1,
        limit: 5
      },
      externtodoservice: [],
      externtodoTotal: 0,
      externtodoQuery: {
        page: 1,
        limit: 5
      },
      finishButtonShow: true
    }
  },
  computed: {
    apiTemplate: function() {
      return this.serviceInfo
      // const api = this.serviceInfo.apis.find(function(api) {
      //   return api.apiId === this.test.testId
      // }, this)
      // return api == null ? '' : api.templateContext
    },
    fulledTemplate: function() {
      return this.serviceInfo
      // let params = ''
      // for (let i = 0; i < this.test.context.length; i++) {
      //   params = `${params}var ${this.test.context[i].key} = ${this.test.context[i].value};`
      // }
      // params = params + 'return `' + this.apiTemplate.replace(/\\/g, '\\\\') + '`'
      // return new Function(params)()
    }
  },
  mounted: function() {
    console.log('现在程序运行到这里啦1')
    // this.$ajax(`${process.env.VUE_APP_CENTER_URL}/node/info`).then(res => {
    this.$ajax('http://bigservice.ices.net:30195/node/info').then(res => {
      console.log('这是现在获取到的数据1')
      res.data.forEach(nodeInfo => {
        this.nodeInfos[nodeInfo.id] = nodeInfo.description
      })
      console.log(this.nodeInfos)
    })
    this.getTodoList()
    this.getExternTodoList()
    // request({
    //   url: '/solution/todo/service',
    //   method: 'get',
    //   params: {
    //     userName: this.$store.getters.userinfo.name,
    //     limit: 10,
    //     page: 0
    //   }
    // }).then(data => {
    //
    //   this.todoservice = data["content"]
    //   console.log('todoService:', this.todoservice)
    // })
    // this.$ajax(`${process.env.VUE_APP_CENTER_URL}/node/info`).then(res => {
    //   console.log(res.data)
    //   res.data.forEach(nodeInfo => {
    //     this.nodeInfos[nodeInfo.id]= nodeInfo.description
    //   })
    //   console.log(this.nodeInfos)
    // })

    // request({
    //   url: '/solution/query',
    //   method: 'get',
    //   params: {
    //     page: 0,
    //     limit: 10,
    //     creator: '',
    //     description: '',
    //     state: 'RUNNING'
    //   }
    // }).then(res => {
    //   this.solution_list = res.content
    // }).then(() => request({
    //   url: `/process/sessions`,
    //   method: 'get'
    // })
    // ).then(data => {
    //   this.tableData = data
    //   console.log(data)
    // }).then(() => {
    //   return request({
    //     url: '/group/list',
    //     method: 'get'
    //   }).then(
    //   //   data => {
    //   //   this.roles = data.filter(dt => dt.users.some(u => u.name == this.$store.getters.userinfo.name)).map(x => x.groupName)
    //   // }
    //   ).then(() => {
    //     request({
    //       url: '/task/list',
    //       method: 'get'
    //     }).then(data => {
    //       console.log('data:', data)
    //       console.log('tableData:', this.tableData)
    //       let taskList = this.tableData.flatMap(o => o.statuses.map(st => { st.sessionId = o.sessionId; return st }))
    //       console.info('first--tasklist:', taskList)
    //       taskList = taskList.filter(s => s.serviceStage === 'RUNNING' && data.some(d => s.activityName === d.name))
    //       // taskList = taskList.filter(s => this.roles.some(r => s.serviceInfo.roles.some(sr => sr.id.name == r)))
    //       this.taskList = taskList
    //       this.taskList = taskList
    //       console.info('tasklist:', taskList)
    //     })
    //   })
    // })
  },
  methods: {
    getTodoList() {
      console.log('todoQuery', this.todoQuery)
      request({
        url: '/solution/todo/service',
        method: 'get',
        params: {
          userName: this.$store.getters.userinfo.name,
          limit: this.todoQuery.limit,
          page: this.todoQuery.page - 1
        }
      }).then(data => {
        console.log(data)
        this.todoTotal = data['totalElements']
        this.todoservice = data['content']
        console.log('todoService:', this.todoservice)
      })
    },
    getExternTodoList() {
      console.log('externtodoQuery', this.todoQuery)
      request({
        url: '/solution/todo/extern/service',
        method: 'get',
        params: {
          userName: this.$store.getters.userinfo.name,
          limit: this.externtodoQuery.limit,
          page: this.externtodoQuery.page - 1
        }
      }).then(data => {
        console.log(data)
        this.externtodoTotal = data['totalElements']
        this.externtodoservice = data['content']
        console.log('externtodoService:', this.externtodoservice)
      })
    },
    finishAPI(api, sessionId, serviceId) {
      // let template = api.templateContext
      // const pattern = /\$\{sessionId\}/
      // let group = null
      // do {
      //   group = template.match(pattern)
      //   if (group != null && group.length > 0) {
      //     template = template.replace(group[0], sessionId)
      //   }
      // } while (group != null && group.length > 0)
      // request({
      //   url: template,
      //   method: 'get'
      // }).then(data => {
      //   return request({
      //     url: `/process/updateSession/${sessionId}/${serviceId}/FINISH`,
      //     method: 'get',
      //     params: {
      //       value: 'finish'
      //     }
      //   })
      // })
      request({
        url: `/process/updateSession/${sessionId}/${serviceId}/FINISH`,
        method: 'get',
        params: {
          value: 'finish'
        }
      })
    },
    viewAPI(api, sessionId) {
      let template = api.templateContext
      const pattern = /\$\{sessionId\}/
      let group = null
      do {
        group = template.match(pattern)
        if (group != null && group.length > 0) {
          template = template.replace(group[0], sessionId)
        }
      } while (group != null && group.length > 0)
      this.sub_url = template
      this.whenView = true
    },
    // handleCurrentChange(val) {
    //   console.log('handleCurrentChange:   ' + val)
    //   console.log(val)
    //   this.status = val
    // },

    async handleCurrentChange(val) {
      val.finishFlag = true
      this.finishButtonShow = false
      this.status = val
      console.log('val: ', val)
      // 后台的 ServiceStatus 加一个字段表示服务所在的节点，此处假设是 nodeId,且后台实现了查询当前节点id、根据节点id获取某些配置的功能
      const currentNodeInfo = await request({
        url: `/nodeInfo/current`,
        method: 'get'
      }) // 假设 后台已实现了 /nodeInfo/current 方法，返回一个json对象，其中包含当前节点的id、service-manage服务的url等
      const currentNodeId = currentNodeInfo['iodId']
      console.log('currentNodeId: ', currentNodeInfo['iodId'])
      // 根据UI服务是否在当前的节点上进行不同请求
      if (currentNodeId === val.nodeId) { // 服务在当前节点上
        console.log('UI服务在当前节点')
        this.serviceInfo = await request({
          url: `/assembleTemplate/currentNode?statusId=${this.status.id}`,
          method: 'get'
        })
        console.log('Before')
        console.log('first apiTemplate: ', this.serviceInfo)
        console.log('End')
      } else { // 在其他节点上
        // 方式1 假设 /nodeInfo/{nodeId} 会返回一个对应节点的json对象，其中的serviceManageUrl是service-manage服务的url等
        console.log('UI服务不在当前节点')
        this.serviceInfo = await request({
          url: `/assembleTemplate/exNode?statusId=${this.status.id}`,
          method: 'get'
        })
        console.log(this.serviceInfo)
      }
      this.loadTwice = false
      this.loadUI()

      setTimeout(() => {
        this.loadTwice = true
        this.loadUI()
        console.log('ffffff', document)
        var ddd = document.getElementById('uiframe').contentWindow.document
        console.log('ffffff', ddd)
      }, 200)
    },

    async handleExternSolutionService(val) {
      val.externFinishFlag = true
      this.finishButtonShow = true
      this.status = val
      console.log('externVal: ', val)
      this.serviceInfo = await request({
        url: `/assembleTemplate/exSolution?statusId=${this.status.id}`,
        method: 'get'
      })
      console.log('Before')
      console.log('apiTemplate: ', this.serviceInfo)
      console.log('End')

      this.loadTwice = false
      this.loadUI()

      setTimeout(() => {
        this.loadTwice = true
        this.loadUI()
      }, 200)
    },

    continueExecute(session) {
      this.$http.get('/task/list')
        .then(response => response.data)
        .then(data => {
          data.filter(task => task.processId === session.processId).forEach(task => {
            session.statuses.filter(status => status.serviceInfo.serviceName === task.name).forEach(status => {
              // let serviceId = status.serviceInfo.serviceId;
              this.sub_url = `http://${status.serviceInfo.servicePath}/?sessionId=${session.sessionId}`
              console.info(this.sub_url)
            })
          })
        })
    },
    uniq(arr) {
      return Array.from(new Set(arr))
    },
    callApiService(id) {
      this.test.started = true
      this.test.isUI = false
      this.test.testId = id
      this.loadParameters()
    },
    callUiService(id) {
      this.test.started = true
      this.test.isUI = true
      this.test.testId = id
      this.loadParameters()
    },
    loadParameters() {
      const template = JSON.parse(this.apiTemplate)
      const has_input = template.has_input || []
      const params = []
      params.push({
        key: 'sessionId',
        value: '\"12345678\"'
      })
      for (let i = 0; i < has_input.length; i++) {
        params.push({
          key: `param_${has_input[i].parameter_name}`,
          value: `"${has_input[i].comment}"`
        })
      }
      this.test.context.splice(0, this.test.context.length, ...params)
      // this.test.context.addAll(params)
      console.log(this.test.context)
    },
    loadUI() {
      // const template = JSON.parse(this.apiTemplate)
      // let requestSetting = template['request']
      // requestSetting = JSON.parse(this.fulledTemplate)
      console.log('apiTemplate', this.apiTemplate)
      console.log('fulledTemplate', this.fulledTemplate)
      const template = this.apiTemplate
      console.log('template', template)
      let requestSetting = template.request
      console.log('requestSetting', requestSetting)
      requestSetting = this.fulledTemplate
      requestSetting = requestSetting.request
      console.log(requestSetting)
      this.form.method = requestSetting.method
      this.form.action = requestSetting.base_url
      if (requestSetting.query_params) {
        for (const key in requestSetting.query_params) {
          this.form.params.push({
            name: key,
            value: requestSetting.query_params[key]
          })
        }
      }
      if (requestSetting.method === 'POST' && requestSetting.body && requestSetting.body.format === 'form-data' && requestSetting.body.context) {
        for (const key in requestSetting.body.context) {
          const value = requestSetting.body.context[key]
          this.form.params.push({
            name: key,
            value: typeof value === 'object' ? JSON.stringify(value) : value
          })
        }
      }
      this.$refs.testForm.submit()
      // this.iframe_src = this.apiTemplate.request.base_url
    },
    async getResult(val) {
      this.status = val
      console.log('val: ', val)
      // alert("服务调用结束:   " + this.status.id )
      const ret = await request({
        url: `/finishUIService?statusId=${this.status.id}`,
        method: 'get'
      })
      this.$router.go(0)
      console.log(ret)
    },
    async getExternResult(val) {
      this.status = val
      console.log('val: ', val)
      const ret = await request({
        url: `/finishExternSolutionService?statusId=${this.status.id}`,
        method: 'get'
      })
      // this.$router.go(0)
      console.log(ret)
    },
    calcType(s) {
      if (s === 'FINISH') {
        return 'danger'
      } else if (s === 'CREATED') {
        return ''
      } else if (s === 'RUNNING') {
        return 'success'
      }
    }
  }
}
</script>
