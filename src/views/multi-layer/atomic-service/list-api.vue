<template>
  <div class="app-container">
    <div style="margin-top:20px;margin-bottom: 20px">
      <el-row :gutter="10">
        <el-col :span="4">
          所属服务：<b>{{ service.serviceName }}&nbsp;{{ service.textDescription }}</b>
        </el-col>
        <el-col :span="4">
          服务类别：<b>{{ service.categories.map(c=>c.catelogyName).join(',') }}</b>
        </el-col>
      </el-row>
    </div>

    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="service.apis"
      style="width: 100%;"
      height="450"
      border
    >
      <el-table-column width="50">
        <template slot-scope="scope">
          <span>{{ scope.$index+ 1 }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="description" label="接口描述" width="120" />
      <el-table-column label="接口类型" width="90">
        <template slot-scope="scope">
          <span>{{ ServiceApiType[scope.row.apiType] }}</span>
        </template>
      </el-table-column>
      <el-table-column label="相关角色" width="90">
        <template slot-scope="scope">
          <span>{{ scope.row.roles.map(role=>role.id.name).join(',') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="输入列表" width="90">
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
      <el-table-column label="输出类型" width="90">
        <template slot-scope="scope">
          <span>{{ scope.row.hasOutput==null?'':scope.row.hasOutput.xsdType }}-{{ scope.row.hasOutput==null?'':scope.row.hasOutput.comment }}</span>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
<script>
import request from '@/utils/request2'

export default {
  name: 'ListApi',
  components: { },
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
      }
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
    }
  }
}
</script>
