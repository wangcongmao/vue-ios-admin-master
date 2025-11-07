<template>
  <el-container>
    <el-header>
      <div style="margin-top:20px;margin-bottom: 20px">
        <el-row :gutter="10">
          <el-col :span="4">
            <el-input v-model="listQuery.provider" placeholder="组织" />
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
      <el-row :gutter="10">
        <h3>组织内个体</h3>
        <el-row :gutter="10">
          <h4>原子服务</h4>
          <el-table :data="filterServiceBySSP()" style="width: 100%;">
            <el-table-column width="50">
              <template slot-scope="scope">
                <span>{{ scope.$index + 1 }}</span>
              </template>
            </el-table-column>
            <el-table-column
              property="serviceName"
              label="服务名称"
              width="120"
            />
            <el-table-column
              label="Feature"
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
            >
              <template slot-scope="scope">
                <span style="margin-left: 10px">{{ scope.row.provider.name }}</span>
              </template>
            </el-table-column>
            <el-table-column
              property="textDescription"
              label="服务描述"
            />
          </el-table>
        </el-row>
        <el-row :gutter="10">
          <h4>共生体服务模式</h4>
          <el-table
            :key="tableKey"
            v-loading="listLoading"
            :data="list"
            style="width: 100%;"
            highlight-current-row
            border
            @current-change="handleCurrentChange"
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
              property="provider"
              label="组织"
            />
            <el-table-column
              label="包含的服务"
            >
              <template slot-scope="scope">
                <span style="margin-left: 10px">{{ scope.row.domain }}</span>
              </template>
            </el-table-column>
          </el-table>
        </el-row>
      </el-row>
      <el-row :gutter="10">
        <h3>个体间关系</h3>
        <el-row :gutter="10">
          <h4>原子服务间关系</h4>
          <el-table
            :data="serviceR"
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
        <el-row :gutter="10">
          <h4>共生体间关系</h4>
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
      </el-row>
      <div id="neo4jd3" style="min-height: 400px;" />
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
import * as d3 from 'd3'

import { D3Graph } from './d3graph'
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
          description: 'SSP1',
          domain: 'call120,cure,inform_family',
          provider: 'ICES'
        },
        {
          description: 'SSP2',
          domain: 'call120,cure',
          provider: 'ICES'
        },
        {
          description: 'SSP3',
          domain: 'cure,inform_family',
          provider: 'ICES'
        }
      ],
      serviceData: [
        {
          '@id': 1,
          'serviceId': 16,
          'serviceName': 'call120',
          'feature': {
            '@id': 2,
            'featureId': 16,
            'name': '急救',
            'categoryMappings': [
              {
                'id': {
                  'featureId': 16,
                  'categoryId': 2
                },
                'fullLink': false,
                'feature': 2,
                'category': {
                  '@id': 3,
                  'catelogyId': 2,
                  'parent': {
                    '@id': 4,
                    'catelogyId': 1,
                    'parent': null,
                    'children': [
                      3
                    ],
                    'catelogyName': '交通',
                    'description': '交通类服务',
                    'removed': false,
                    'id': 1
                  },
                  'children': [
                    {
                      '@id': 5,
                      'catelogyId': 3,
                      'parent': 3,
                      'children': [],
                      'catelogyName': '出租车',
                      'description': '出租车',
                      'removed': false,
                      'id': 3
                    },
                    {
                      '@id': 6,
                      'catelogyId': 4,
                      'parent': 3,
                      'children': [],
                      'catelogyName': '顺风车',
                      'description': '顺风车',
                      'removed': false,
                      'id': 4
                    }
                  ],
                  'catelogyName': '租车',
                  'description': '各类与租车相关的业务',
                  'removed': false,
                  'id': 2
                }
              },
              {
                'id': {
                  'featureId': 16,
                  'categoryId': 5
                },
                'fullLink': false,
                'feature': 2,
                'category': {
                  '@id': 7,
                  'catelogyId': 5,
                  'parent': null,
                  'children': [
                    {
                      '@id': 8,
                      'catelogyId': 7,
                      'parent': 7,
                      'children': [],
                      'catelogyName': '日常娱乐',
                      'description': '日常娱乐',
                      'removed': false,
                      'id': 7
                    },
                    {
                      '@id': 9,
                      'catelogyId': 6,
                      'parent': 7,
                      'children': [],
                      'catelogyName': '医疗保健',
                      'description': '医疗保健',
                      'removed': false,
                      'id': 6
                    },
                    {
                      '@id': 10,
                      'catelogyId': 8,
                      'parent': 7,
                      'children': [
                        {
                          '@id': 11,
                          'catelogyId': 9,
                          'parent': 10,
                          'children': [],
                          'catelogyName': '保姆',
                          'description': '保姆',
                          'removed': false,
                          'id': 9
                        },
                        {
                          '@id': 12,
                          'catelogyId': 10,
                          'parent': 10,
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
                }
              },
              {
                'id': {
                  'featureId': 16,
                  'categoryId': 6
                },
                'fullLink': true,
                'feature': 2,
                'category': 9
              },
              {
                'id': {
                  'featureId': 16,
                  'categoryId': 3
                },
                'fullLink': true,
                'feature': 2,
                'category': 5
              },
              {
                'id': {
                  'featureId': 16,
                  'categoryId': 1
                },
                'fullLink': false,
                'feature': 2,
                'category': 4
              }
            ],
            'serviceType': 'UI',
            'textDescription': '120紧急救援'
          },
          'provider': {
            '@id': 13,
            'providerId': 1,
            'name': 'ICES',
            'location': '哈尔滨工业大学',
            'removed': false,
            'id': 1
          },
          'textDescription': 'call120',
          'version': '1.0',
          'servicePath': null,
          'createTimestamp': '2019-11-22T14:52:39.848+0000',
          'removed': false,
          'deployment': {
            '@id': 14,
            'serviceId': 16,
            'deploymentType': 'EXTERNAL',
            'gitUrl': null,
            'gitBranch': null,
            's2iImage': null,
            's2iVersion': null,
            'dockerImage': null,
            'protocol': null,
            'service': 1
          },
          'roles': [
            {
              '@id': 15,
              'id': {
                'serviceId': 16,
                'name': '医生'
              },
              'service': 1
            },
            {
              '@id': 16,
              'id': {
                'serviceId': 16,
                'name': '病人'
              },
              'service': 1
            }
          ],
          'apis': [
            {
              '@id': 17,
              'apiId': 6,
              'service': 1,
              'apiType': 'VIEW',
              'description': '查看救护车进度',
              'hasOutput': null,
              'hasInput': [],
              'roles': [
                16
              ],
              'templateContext': 'http://10.147.19.68:30548/call120.html?sessionId=${sessionId}',
              'removed': false,
              'id': 6
            },
            {
              '@id': 18,
              'apiId': 5,
              'service': 1,
              'apiType': 'FINISH',
              'description': '结束服务',
              'hasOutput': {
                '@id': 19,
                'id': 5,
                'xsdType': 'xsd:string',
                'comment': '请求结果'
              },
              'hasInput': [],
              'roles': [
                15
              ],
              'templateContext': 'http://10.147.19.68:30548/rest/finish/call120/${sessionId}',
              'removed': false,
              'id': 5
            },
            {
              '@id': 20,
              'apiId': 7,
              'service': 1,
              'apiType': 'ASYNC_REQUEST',
              'description': '发起请求',
              'hasOutput': {
                '@id': 21,
                'id': 6,
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
              '@id': 22,
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
            }
          ],
          'id': 16,
          'categoryMappings': [
            {
              'id': {
                'featureId': 16,
                'categoryId': 2
              },
              'fullLink': false,
              'feature': 2,
              'category': 3
            },
            {
              'id': {
                'featureId': 16,
                'categoryId': 5
              },
              'fullLink': false,
              'feature': 2,
              'category': 7
            },
            {
              'id': {
                'featureId': 16,
                'categoryId': 6
              },
              'fullLink': true,
              'feature': 2,
              'category': 9
            },
            {
              'id': {
                'featureId': 16,
                'categoryId': 3
              },
              'fullLink': true,
              'feature': 2,
              'category': 5
            },
            {
              'id': {
                'featureId': 16,
                'categoryId': 1
              },
              'fullLink': false,
              'feature': 2,
              'category': 4
            }
          ],
          'serviceType': 'UI',
          'categories': [
            5,
            3,
            9,
            4,
            7
          ]
        },
        {
          '@id': 23,
          'serviceId': 17,
          'serviceName': 'cure',
          'feature': {
            '@id': 24,
            'featureId': 17,
            'name': '治疗',
            'categoryMappings': [
              {
                'id': {
                  'featureId': 17,
                  'categoryId': 5
                },
                'fullLink': false,
                'feature': 24,
                'category': 7
              },
              {
                'id': {
                  'featureId': 17,
                  'categoryId': 6
                },
                'fullLink': true,
                'feature': 24,
                'category': 9
              }
            ],
            'serviceType': 'UI',
            'textDescription': '住院治疗'
          },
          'provider': 13,
          'textDescription': '治疗',
          'version': '1.0',
          'servicePath': null,
          'createTimestamp': '2019-11-24T14:00:41.528+0000',
          'removed': false,
          'deployment': {
            '@id': 25,
            'serviceId': 17,
            'deploymentType': 'EXTERNAL',
            'gitUrl': null,
            'gitBranch': null,
            's2iImage': null,
            's2iVersion': null,
            'dockerImage': null,
            'protocol': null,
            'service': 23
          },
          'roles': [
            {
              '@id': 26,
              'id': {
                'serviceId': 17,
                'name': '医生'
              },
              'service': 23
            },
            {
              '@id': 27,
              'id': {
                'serviceId': 17,
                'name': '家属'
              },
              'service': 23
            }
          ],
          'apis': [
            {
              '@id': 28,
              'apiId': 11,
              'service': 23,
              'apiType': 'VIEW',
              'description': '查看病人的状况',
              'hasOutput': null,
              'hasInput': [],
              'roles': [
                27
              ],
              'templateContext': 'http://10.147.19.68:30548/cure_family.html?sessionId=${sessionId}',
              'removed': false,
              'id': 11
            },
            {
              '@id': 29,
              'apiId': 12,
              'service': 23,
              'apiType': 'VIEW',
              'description': '添加诊断结论',
              'hasOutput': null,
              'hasInput': [],
              'roles': [
                26
              ],
              'templateContext': 'http://10.147.19.68:30548/cure_doctor.html?sessionId=${sessionId}',
              'removed': false,
              'id': 12
            },
            {
              '@id': 30,
              'apiId': 9,
              'service': 23,
              'apiType': 'ASYNC_REQUEST',
              'description': '发起请求',
              'hasOutput': {
                '@id': 31,
                'id': 7,
                'xsdType': 'xsd:bool',
                'comment': '请求是否成功'
              },
              'hasInput': [],
              'roles': [],
              'templateContext': 'http://10.147.19.68:30548/rest/create/cure/${sessionId}',
              'removed': false,
              'id': 9
            },
            {
              '@id': 32,
              'apiId': 10,
              'service': 23,
              'apiType': 'FINISH',
              'description': '结束服务',
              'hasOutput': {
                '@id': 33,
                'id': 8,
                'xsdType': 'xsd:object',
                'comment': '诊断结果及历史'
              },
              'hasInput': [],
              'roles': [
                26
              ],
              'templateContext': 'http://10.147.19.68:30548/rest/finish/cure/${sessionId}',
              'removed': false,
              'id': 10
            }
          ],
          'id': 17,
          'categoryMappings': [
            {
              'id': {
                'featureId': 17,
                'categoryId': 5
              },
              'fullLink': false,
              'feature': 24,
              'category': 7
            },
            {
              'id': {
                'featureId': 17,
                'categoryId': 6
              },
              'fullLink': true,
              'feature': 24,
              'category': 9
            }
          ],
          'serviceType': 'UI',
          'categories': [
            9,
            7
          ]
        },
        {
          '@id': 34,
          'serviceId': 18,
          'serviceName': 'inform_family',
          'feature': {
            '@id': 35,
            'featureId': 18,
            'name': '信息通讯',
            'categoryMappings': [
              {
                'id': {
                  'featureId': 18,
                  'categoryId': 8
                },
                'fullLink': true,
                'feature': 35,
                'category': 10
              },
              {
                'id': {
                  'featureId': 18,
                  'categoryId': 10
                },
                'fullLink': true,
                'feature': 35,
                'category': 12
              },
              {
                'id': {
                  'featureId': 18,
                  'categoryId': 5
                },
                'fullLink': false,
                'feature': 35,
                'category': 7
              },
              {
                'id': {
                  'featureId': 18,
                  'categoryId': 9
                },
                'fullLink': true,
                'feature': 35,
                'category': 11
              }
            ],
            'serviceType': 'UI',
            'textDescription': '通讯交流'
          },
          'provider': 13,
          'textDescription': '通知家属',
          'version': '1.0',
          'servicePath': null,
          'createTimestamp': '2019-11-24T14:29:50.813+0000',
          'removed': false,
          'deployment': {
            '@id': 36,
            'serviceId': 18,
            'deploymentType': 'EXTERNAL',
            'gitUrl': null,
            'gitBranch': null,
            's2iImage': null,
            's2iVersion': null,
            'dockerImage': null,
            'protocol': null,
            'service': 34
          },
          'roles': [
            {
              '@id': 37,
              'id': {
                'serviceId': 18,
                'name': '家属'
              },
              'service': 34
            },
            {
              '@id': 38,
              'id': {
                'serviceId': 18,
                'name': '病人'
              },
              'service': 34
            }
          ],
          'apis': [
            {
              '@id': 39,
              'apiId': 13,
              'service': 34,
              'apiType': 'FINISH',
              'description': '结束服务',
              'hasOutput': {
                '@id': 40,
                'id': 9,
                'xsdType': 'xsd:object',
                'comment': '诊断结果及历史'
              },
              'hasInput': [],
              'roles': [],
              'templateContext': 'http://10.147.19.68:30548/rest/finish/inform-family/${sessionId}',
              'removed': false,
              'id': 13
            },
            {
              '@id': 41,
              'apiId': 14,
              'service': 34,
              'apiType': 'ASYNC_REQUEST',
              'description': '发起请求',
              'hasOutput': {
                '@id': 42,
                'id': 10,
                'xsdType': 'xsd:bool',
                'comment': '请求是否成功'
              },
              'hasInput': [],
              'roles': [],
              'templateContext': 'http://10.147.19.68:30548/rest/create/inform-family/${sessionId}',
              'removed': false,
              'id': 14
            },
            {
              '@id': 43,
              'apiId': 15,
              'service': 34,
              'apiType': 'VIEW',
              'description': '更新自身状态',
              'hasOutput': null,
              'hasInput': [],
              'roles': [
                38
              ],
              'templateContext': 'http://10.147.19.68:30548/inform_family.html?sessionId=${sessionId}',
              'removed': false,
              'id': 15
            },
            {
              '@id': 44,
              'apiId': 16,
              'service': 34,
              'apiType': 'VIEW',
              'description': '查看病人状态',
              'hasOutput': null,
              'hasInput': [],
              'roles': [
                37
              ],
              'templateContext': 'http://10.147.19.68:30548/inform_family_fm.html?sessionId=${sessionId}',
              'removed': false,
              'id': 16
            }
          ],
          'id': 18,
          'categoryMappings': [
            {
              'id': {
                'featureId': 18,
                'categoryId': 8
              },
              'fullLink': true,
              'feature': 35,
              'category': 10
            },
            {
              'id': {
                'featureId': 18,
                'categoryId': 10
              },
              'fullLink': true,
              'feature': 35,
              'category': 12
            },
            {
              'id': {
                'featureId': 18,
                'categoryId': 5
              },
              'fullLink': false,
              'feature': 35,
              'category': 7
            },
            {
              'id': {
                'featureId': 18,
                'categoryId': 9
              },
              'fullLink': true,
              'feature': 35,
              'category': 11
            }
          ],
          'serviceType': 'UI',
          'categories': [
            12,
            11,
            7,
            10
          ]
        }
      ],
      serviceR: [
        {
          from: 'call120',
          to: 'cure',
          type: '调用关系'
        }, {
          from: 'cure',
          to: 'inform_family',
          type: '共用关系'
        },
        {
          from: 'call120',
          to: 'inform_family',
          type: '共用关系'
        }
      ],
      dspR: [
        {
          from: 'SSP2',
          to: 'SSP1',
          type: '整体局部关系'
        },
        {
          from: 'SSP3',
          to: 'SSP1',
          type: '整体局部关系'
        },
        {
          from: 'SSP2',
          to: 'SSP3',
          type: '功能互补关系'
        }
      ],
      checked_ssp: null,
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
    // this.getList()
    this.loadServices()
    this.loadSSP()
    this.loadSR()
    this.loadSSPR()
  },
  mounted: function() {
    const d3Graph = new D3Graph()
    d3Graph.refresh({
      nodes: [
        {
          id: 'SSP1',
          labels: ['共生体'],
          properties: {
            name: 'SSP1',
            provider: 'ICES'
          }
        },
        {
          id: 'SSP2',
          labels: ['共生体'],
          properties: {
            name: 'SSP2',
            provider: 'ICES'
          }
        },
        {
          id: 'SSP3',
          labels: ['共生体'],
          properties: {
            name: 'SSP3',
            provider: 'ICES'
          }
        },
        {
          id: 'AS1',
          labels: ['原子服务'],
          properties: {
            name: '急救',
            provider: 'ICES'
          }
        },
        {
          id: 'AS2',
          labels: ['原子服务'],
          properties: {
            name: '治疗',
            provider: 'ICES'
          }
        },
        {
          id: 'AS3',
          labels: ['原子服务'],
          properties: {
            name: '在线通讯',
            provider: 'ICES'
          }
        }
      ],
      relationships: [
        {
          'id': 'edge01',
          'type': '整体局部关系',
          'startNode': 'SSP2',
          'endNode': 'SSP1',
          'properties': {},
          'source': 'SSP2',
          'target': 'SSP1',
          'linknum': 1
        },
        {
          'id': 'edge02',
          'type': '整体局部关系',
          'startNode': 'SSP3',
          'endNode': 'SSP1',
          'properties': {},
          'source': 'SSP3',
          'target': 'SSP1',
          'linknum': 1
        },
        {
          'id': 'edge03',
          'type': '功能互补',
          'startNode': 'AS1',
          'endNode': 'AS2',
          'properties': {},
          'source': 'AS1',
          'target': 'AS2',
          'linknum': 1
        }
      ]
    })
  },
  methods: {
    async loadServices() {
      const res = await request({
        url: '/sp/services',
        method: 'get'
      })
      this.serviceData = res
    },
    async loadSSP() {
      const res = await request({
        url: '/sp/ssp',
        method: 'get'
      })
      this.list = res
    },
    async loadSR() {
      const res = await request({
        url: '/sp/sr',
        method: 'get'
      })
      this.serviceR = res
    },
    async loadSSPR() {
      const res = await request({
        url: '/sp/sspr',
        method: 'get'
      })
      this.dspR = res
    },
    filterServiceBySSP() {
      return this.serviceData.filter(s => s.provider.name == 'ICES')
    },
    loadCategory() {
      return request({
        url: '/user/list',
        method: 'get'
      }).then(data => {
        this.userList = data
      })
    },
    // async getList() {
    //   this.listLoading = true
    //   // If the Promise is rejected, the rejected value is thrown.
    //   try {
    //     const query = deepClone(this.listQuery)
    //     query.page -= 1
    //     // const res = await request({
    //     //   url: '/solution/query',
    //     //   method: 'get',
    //     //   params: query
    //     // })
    //     this.listLoading = false
    //     this.list = this.rawData
    //     this.total = this.rawData.length
    //     // this.list = res.content
    //     // this.total = res.totalElements
    //   } catch (e) {
    //     this.listLoading = false
    //   }
    // },
    handleSearch() {
      this.getList()
    },
    handleCurrentChange(val) {
      this.checked_ssp = val
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
