<template>
  <el-collapse v-model="activeNames">
    <el-collapse-item title="接口详情" name="1">
      <el-container>
        <el-header>
          <el-row :gutter="10">
            <el-col :span="4">
              所属服务：<b>{{ service.serviceName }}&nbsp;{{ service.textDescription }}</b>
            </el-col>
            <el-col :span="4">
              服务类别：<b>{{ service.categories.map(c=>c.catelogyName).join(',') }}</b>
            </el-col>
          </el-row>
        </el-header>
        <el-main>
          <el-table
            :key="tableKey"
            v-loading="listLoading"
            :data="service.apis"
            style="width: 100%;"
            border
          >
            <el-table-column width="50">
              <template slot-scope="scope">
                <span>{{ scope.$index+ 1 }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="description" label="接口描述" />
            <el-table-column label="接口类型">
              <template slot-scope="scope">
                <span>{{ ServiceApiType[scope.row.apiType] }}</span>
              </template>
            </el-table-column>
            <!--<el-table-column label="相关角色">-->
            <!--<template slot-scope="scope">-->
            <!--<span>{{ scope.row.roles.map(role=>role.id.name).join(',') }}</span>-->
            <!--</template>-->
            <!--</el-table-column>-->
            <el-table-column label="输入列表">
              <template slot-scope="scope">
                <el-tag
                  v-for="(input,index) in uniq(scope.row.hasInput) "
                  :key="index"
                  size="mini"
                >
                  {{ input.parameterName }}:{{ input.xsdType }}:{{ input.comment }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="输出类型">
              <template slot-scope="scope">
                <span>{{ scope.row.hasOutput==null?'':scope.row.hasOutput.xsdType }}-{{ scope.row.hasOutput==null?'':scope.row.hasOutput.comment }}</span>
              </template>
            </el-table-column>
            <el-table-column label="测试">
              <template slot-scope="scope">
                <el-button v-if="scope.row.apiType == 'REQUEST'" @click="callApiService(scope.row.apiId)">测试</el-button>
                <el-button v-if="scope.row.apiType == 'VIEW'" @click="callUiService(scope.row.apiId)">测试</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-main>
      </el-container>
    </el-collapse-item>
    <el-collapse-item title="调用模版" name="2">
      <p>{{ apiTemplate }}</p>
      <ContextEditor v-model="test.context" />
    </el-collapse-item>
    <el-collapse-item v-if="test.isUI" title="UI调用界面" name="3">
      <form ref="testForm" :action="form.action" :method="form.method" target="testFrame">
        <input v-for="(param,i) in form.params" :key="i" type="hidden" :name="param.name" :value="param.value">
      </form>
      <el-row><el-button @click="loadUITwice">加载UI</el-button></el-row>
      <el-row><iframe ref="testFrame" width="100%" height="600px" name="testFrame" src="about:blank" sandbox="allow-forms allow-same-origin allow-scripts" /></el-row>
    </el-collapse-item>
    <el-collapse-item title="调用结果" name="4">
      <el-row><el-button @click="getResult">调用/获取结果</el-button></el-row>
      <p>{{ test.responseText }}</p>
      <p>{{ test.extracted }}</p>
    </el-collapse-item>
  </el-collapse>
</template>
<script>
import request from '@/utils/request2'
import ContextEditor from './ContextEditor'

export default {
  name: 'ListApi',
  components: { ContextEditor },
  data() {
    return {
      service: {
        '@id': 1,
        'serviceId': 6,
        'serviceName': 'call120',
        'categories': [
          {
            '@id': 2,
            'catelogyId': 6,
            'parent': {
              '@id': 3,
              'catelogyId': 5,
              'parent': null,
              'children': [
                2,
                {
                  '@id': 4,
                  'catelogyId': 7,
                  'parent': 3,
                  'children': [],
                  'catelogyName': '日常娱乐',
                  'description': '日常娱乐',
                  'removed': false,
                  'id': 7
                },
                {
                  '@id': 5,
                  'catelogyId': 8,
                  'parent': 3,
                  'children': [
                    {
                      '@id': 6,
                      'catelogyId': 9,
                      'parent': 5,
                      'children': [],
                      'catelogyName': '保姆',
                      'description': '保姆',
                      'removed': false,
                      'id': 9
                    },
                    {
                      '@id': 7,
                      'catelogyId': 10,
                      'parent': 5,
                      'children': [],
                      'catelogyName': '清洁工',
                      'description': '清洁工',
                      'removed': false,
                      'id': 10
                    }
                  ],
                  'catelogyName': '看护',
                  'description': '看护',
                  'removed': false,
                  'id': 8
                }
              ],
              'catelogyName': '健康养老',
              'description': '健康养老',
              'removed': false,
              'id': 5
            },
            'children': [],
            'catelogyName': '医疗保健',
            'description': '医疗保健',
            'removed': false,
            'id': 6
          },
          {
            '@id': 8,
            'catelogyId': 1,
            'parent': null,
            'children': [
              {
                '@id': 9,
                'catelogyId': 2,
                'parent': 8,
                'children': [
                  {
                    '@id': 10,
                    'catelogyId': 4,
                    'parent': 9,
                    'children': [],
                    'catelogyName': '顺风车',
                    'description': '顺风车',
                    'removed': false,
                    'id': 4
                  },
                  {
                    '@id': 11,
                    'catelogyId': 3,
                    'parent': 9,
                    'children': [],
                    'catelogyName': '出租车',
                    'description': '出租车',
                    'removed': false,
                    'id': 3
                  }
                ],
                'catelogyName': '租车',
                'description': '各类与租车相关的业务',
                'removed': false,
                'id': 2
              }
            ],
            'catelogyName': '交通',
            'description': '交通类服务',
            'removed': false,
            'id': 1
          }
        ],
        'provider': {
          '@id': 12,
          'providerId': 1,
          'name': 'ICES',
          'location': '哈尔滨工业大学',
          'removed': false,
          'id': 1
        },
        'serviceType': 'UI',
        'textDescription': '呼叫120',
        'version': '1.0',
        'servicePath': null,
        'createTimestamp': '2019-11-19T16:06:31.561+0000',
        'removed': false,
        'deployment': {
          '@id': 13,
          'serviceId': 6,
          'deploymentType': 'EXTERNAL',
          'gitUrl': null,
          'gitBranch': null,
          's2iImage': null,
          's2iVersion': null,
          'dockerImage': null,
          'service': 1
        },
        'roles': [
          {
            '@id': 14,
            'id': {
              'serviceId': 6,
              'name': '病人'
            },
            'service': 1
          },
          {
            '@id': 15,
            'id': {
              'serviceId': 6,
              'name': '医生'
            },
            'service': 1
          }
        ],
        'apis': [
          {
            '@id': 16,
            'apiId': 6,
            'service': 1,
            'apiType': 'VIEW',
            'description': '查看救护车进度',
            'hasOutput': null,
            'hasInput': [],
            'roles': [
              14
            ],
            'templateContext': 'http://10.147.19.68:30548/call120.html?sessionId=${sessionId}',
            'removed': false,
            'id': 6
          },
          {
            '@id': 17,
            'apiId': 7,
            'service': 1,
            'apiType': 'ASYNC_REQUEST',
            'description': '发起请求',
            'hasOutput': {
              '@id': 18,
              'id': 5,
              'xsdType': 'xsd:bool',
              'comment': '请求是否成功'
            },
            'hasInput': [],
            'roles': [],
            'templateContext': 'http://10.147.19.68:30548/rest/create/call120/${sessionId}',
            'removed': false,
            'id': 7
          },
          {
            '@id': 19,
            'apiId': 8,
            'service': 1,
            'apiType': 'VIEW',
            'description': '更新救护车进度',
            'hasOutput': null,
            'hasInput': [],
            'roles': [
              15
            ],
            'templateContext': 'http://10.147.19.68:30548/call120hs.html?sessionId=${sessionId}',
            'removed': false,
            'id': 8
          },
          {
            '@id': 20,
            'apiId': 5,
            'service': 1,
            'apiType': 'FINISH',
            'description': '结束服务',
            'hasOutput': null,
            'hasInput': [],
            'roles': [
              15
            ],
            'templateContext': 'http://10.147.19.68:30548/rest/finish/call120/${sessionId}',
            'removed': false,
            'id': 5
          }
        ],
        'id': 6
      },
      listLoading: false,
      tableKey: 0,
      ServiceApiType: {
        SYNC_REQUEST: '同步请求', ASYNC_REQUEST: '异步请求', VIEW: '用户界面', FINISH: '结束接口'
      },
      activeNames: ['1'],
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
      }
    }
  },
  computed: {
    apiTemplate: function() {
      const api = this.service.apis.find(function(api) {
        return api.apiId === this.test.testId
      }, this)
      return api == null ? '' : api.templateContext
    },
    fulledTemplate: function() {
      let params = ''
      for (let i = 0; i < this.test.context.length; i++) {
        params = `${params}var ${this.test.context[i].key} = ${this.test.context[i].value};`
      }
      params = params + 'return `' + this.apiTemplate.replace(/\\/g, '\\\\') + '`'
      return new Function(params)()
    }
  },
  created() {
    // gym先注释掉
    // this.getList()
  },
  methods: {
    async getList() {
      this.listLoading = true
      // If the Promise is rejected, the rejected value is thrown.
      try {
        const res = await request({
          url: `/service/${this.$route.query.serviceId}`,
          method: 'get'
        })
        this.listLoading = false
        this.service = res
      } catch (e) {
        this.listLoading = false
      }
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
    loadUITwice() {
      this.loadUI()
      setTimeout(() => {
        this.loadUI()
      }, 200)
    },
    loadUI() {
      const template = JSON.parse(this.apiTemplate)
      let requestSetting = template['request']
      requestSetting = JSON.parse(this.fulledTemplate)
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
    },
    async getResult() {
      let api
      if (this.test.isUI) {
        // 调用After接口，获取UI结果
        api = this.service.apis.find(function(api) {
          return api.apiType === 'AFTER'
        }, this)
        console.log(api)
      } else {
        // 调用该接口，等待结果
        api = this.service.apis.find(function(api) {
          return api.apiId === this.test.testId
        }, this)
      }
      const ct = {}
      for (let i = 0; i < this.test.context.length; i++) {
        ct[this.test.context[i].key] = this.test.context[i].value
      }
      const res = await request({
        url: `/testService/${api.apiId}`,
        method: 'get',
        params: {
          context: JSON.stringify(ct)
        }
      })
      console.log(res)
      this.test.responseText = res.rawText
      this.test.extracted = res.result
    }
  }
}
</script>
