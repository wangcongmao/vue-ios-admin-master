<template>
  <el-container>
    <el-header>
      <div style="margin-top:20px;margin-bottom: 20px">
        <el-row :gutter="10">
          <el-col :span="4">
            <el-select v-model="listQuery.domain" placeholder="请选择">
              <el-option
                v-for="item in ['医疗保健','看护','租车']"
                :key="item"
                :label="item"
                :value="item"
              />
            </el-select>
          </el-col>
          <el-col :span="4">
            <el-input v-model="listQuery.provider" placeholder="所属组织" />
          </el-col>
          <el-col :span="4">
            <el-select v-model="listQuery.features" multiple placeholder="请选择">
              <el-option
                v-for="item in ['急救','治疗','通讯']"
                :key="item"
                :label="item"
                :value="item"
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
      <el-tabs v-model="activeName">
        <el-tab-pane label="领域内服务模式展示" name="first">
          <!--<el-row>-->
          <!--<el-col :span="4">-->
          <!--【筛选条件】原子服务间关系：-->
          <!--<el-select v-model="listQuery.atomR" multiple placeholder="请选择">-->
          <!--<el-option-->
          <!--v-for="item in ['共用关系','先后关系','寄生关系']"-->
          <!--:key="item"-->
          <!--:label="item"-->
          <!--:value="item"-->
          <!--/>-->
          <!--</el-select>-->
          <!--</el-col>-->
          <!--</el-row>-->
          <el-row>
            <el-table :data="sspShowed">
              <el-table-column width="50">
                <template slot-scope="scope">
                  <span>{{ scope.$index + 1 }}</span>
                </template>
              </el-table-column>
              <el-table-column
                property="id"
                label="ID"
              />
              <el-table-column
                label="所属组织"
              >
                <template slot-scope="scope">
                  <span
                    v-for="(provider,i) in Array.from(new Set(scope.row.services.map(s=>s.provider.name)))"
                    :key="i"
                    style="margin-left: 10px"
                  >
                    {{ provider }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column
                label="包含的服务"
              >
                <template slot-scope="scope">
                  <span style="margin-left: 10px">{{ scope.row.services.map(x=>x.serviceName) }}</span>
                </template>
              </el-table-column>
              <el-table-column label="包含的Feature">
                <template slot-scope="scope">
                  <span
                    v-for="(feature,i) in Array.from(new Set(scope.row.services.map(s=>s.features).flat().map(x=>x.name)))"
                    :key="i"
                    style="margin-left: 10px"
                  >
                    {{ feature }}
                  </span>
                </template>
              </el-table-column>

              <!--<el-table-column label="包含的领域">-->
              <!--<template slot-scope="scope">-->
              <!--<span-->
              <!--v-for="(feature,i) in Array.from(new Set(scope.row.features))"-->
              <!--:key="i"-->
              <!--style="margin-left: 10px"-->
              <!--&gt;-->
              <!--{{ feature }}-->
              <!--</span>-->
              <!--</template>-->
              <!--</el-table-column>-->

              <!--<el-table-column property="rel" label="内部关系" />-->
              <!--<el-table-column-->
              <!--label="相关指标"-->
              <!--width="120"-->
              <!--&gt;-->
              <!--<template slot-scope="scope">-->
              <!--<span-->
              <!--v-for="(serviceIndex,i) in scope.row.index"-->
              <!--:key="i"-->
              <!--style="margin-left: 10px"-->
              <!--&gt;-->
              <!--{{ serviceIndex.name }}:{{ serviceIndex.value }}-->
              <!--</span>-->
              <!--</template>-->
              <!--</el-table-column>-->
              <el-table-column
                property="freq"
                label="出现频率"
              />
              <el-table-column
                label="bpmn展示"
              >
                <template slot-scope="scope">
                  <el-button type="text" @click="showBPMN(scope)">查看BPMN</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-row>
        </el-tab-pane>
        <el-tab-pane label="领域内服务模式间关系" name="second">
          <el-row>
            <el-col :span="4">
              【筛选条件】领域内服务模式间关系：
              <el-select v-model="listQuery.sspR" multiple placeholder="请选择">
                <el-option
                  v-for="item in ['整体局部','功能覆盖','功能互补','连接关系','质量支配','质量可替代','skyline']"
                  :key="item"
                  :label="item"
                  :value="item"
                />
              </el-select>
            </el-col>
          </el-row>
          <el-row>
            <el-table
              :data="dspRShowed"
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
                  <a style="margin-left: 10px" @click="alert('后续弹出一个图，说明为什么存在这个关系')">{{ scope.row.type }}</a>
                </template>
              </el-table-column>
            </el-table>
          </el-row>
        </el-tab-pane>
        <el-tab-pane label="领域内原子服务" name="third">
          （未完成）嵌入原子服务查询页面
        </el-tab-pane>
        <el-tab-pane label="服务模式的分级结构展示" name="forth">
          （未完成）嵌入钰霄将来的分级图
        </el-tab-pane>
      </el-tabs>
    </el-main>
    <el-dialog :visible.sync="isShown">
      <div> {{ bpmn }} </div>
    </el-dialog>
  </el-container>
</template>
<script>
// import Pagination from '@/components/Pagination' // Secondary package based on el-pagination
import request from '@/utils/request2'

export default {
  components: {
    // Pagination
  },
  data() {
    return {
      activeName: 'first',
      tableKey: 0,
      list: null,
      ssp: [],
      sspShowed: [],
      dspR: [],
      dspRShowed: [],
      checked_ssp: null,
      total: 0,
      listLoading: false,
      listQuery: {
        page: 1,
        limit: 10,
        domain: '',
        provider: '',
        features: [],
        atomR: [],
        sspR: []
      },
      bpmn: '',
      isShown: false
    }
  },
  created: function() {
    // this.loadCategory()
    //   .then(() => this.getList())
    // this.getList()
    // this.loadServices()
    this.loadSSP()
    // this.loadSR()
    // this.loadSSPR()
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
      let res = []
      if (this.listQuery.domain == '医疗保健') {
        res = [{ 'services': [{ 'serviceName': 'random_4', 'features': [{ 'name': '急救' }], 'categoryMappings': [{ 'fullLink': true, 'category': { 'catelogyName': '医疗保健' }}, { 'fullLink': true, 'category': { 'catelogyName': '信息通讯' }}, { 'fullLink': true, 'category': { 'catelogyName': '租车' }}], 'provider': { 'name': 'ICES' }, 'textDescription': '随机生成的服务', 'region': '威海', 'period': '0 0 8 * * 1-5 for 8 hours', 'index': [{ 'name': '平均花费', 'value': 3.48 }, { 'name': '最长响应时间', 'value': 7904 }] }, { 'serviceName': 'random_28', 'features': [], 'categoryMappings': [{ 'fullLink': true, 'category': { 'catelogyName': '出租车' }}, { 'fullLink': true, 'category': { 'catelogyName': '医疗保健' }}, { 'fullLink': true, 'category': { 'catelogyName': '看护' }}, { 'fullLink': true, 'category': { 'catelogyName': '治疗' }}, { 'fullLink': true, 'category': { 'catelogyName': '信息通讯' }}], 'provider': { 'name': 'Alibaba' }, 'textDescription': '随机生成的服务', 'region': '威海', 'period': '0 0 0 * * * for 24 hours', 'index': [{ 'name': '平均花费', 'value': 24.56 }, { 'name': '最长响应时间', 'value': 1764 }] }], 'freq': 3 }]
      } else if (this.listQuery.domain == '租车') {
        res = [
          {
            'services': [
              {
                'serviceName': 'random_24',
                'features': [
                  {
                    'name': '急救'
                  },
                  {
                    'name': '通讯'
                  }
                ],
                'categoryMappings': [
                  {
                    'fullLink': true,
                    'category': {
                      'catelogyName': '出租车'
                    }
                  },
                  {
                    'fullLink': true,
                    'category': {
                      'catelogyName': '医疗保健'
                    }
                  },
                  {
                    'fullLink': true,
                    'category': {
                      'catelogyName': '信息通讯'
                    }
                  }
                ],
                'provider': {
                  'name': 'ICES'
                },
                'textDescription': '随机生成的服务',
                'region': '北京',
                'period': '0 0 0 * * * for 24 hours',
                'index': [
                  {
                    'name': '平均花费',
                    'value': 16.56
                  },
                  {
                    'name': '最长响应时间',
                    'value': 7555
                  }
                ]
              },
              {
                'serviceName': 'random_20',
                'features': [
                  {
                    'name': '急救'
                  },
                  {
                    'name': '通讯'
                  }
                ],
                'categoryMappings': [
                  {
                    'fullLink': true,
                    'category': {
                      'catelogyName': '出租车'
                    }
                  },
                  {
                    'fullLink': true,
                    'category': {
                      'catelogyName': '看护'
                    }
                  }
                ],
                'provider': {
                  'name': 'Google'
                },
                'textDescription': '随机生成的服务',
                'region': '深圳',
                'period': '0 0 8 * * 1-6 for 4 hours',
                'index': [
                  {
                    'name': '平均花费',
                    'value': 45.17
                  },
                  {
                    'name': '最长响应时间',
                    'value': 1400
                  }
                ]
              }
            ],
            'freq': 3
          },
          {
            'services': [
              {
                'serviceName': 'random_22',
                'features': [
                  {
                    'name': '通讯'
                  }
                ],
                'categoryMappings': [
                  {
                    'fullLink': true,
                    'category': {
                      'catelogyName': '出租车'
                    }
                  },
                  {
                    'fullLink': true,
                    'category': {
                      'catelogyName': '医疗保健'
                    }
                  },
                  {
                    'fullLink': true,
                    'category': {
                      'catelogyName': '治疗'
                    }
                  },
                  {
                    'fullLink': true,
                    'category': {
                      'catelogyName': '健康养老'
                    }
                  }
                ],
                'provider': {
                  'name': 'Google'
                },
                'textDescription': '随机生成的服务',
                'region': '哈尔滨',
                'period': '0 0 8 * * 1-6 for 4 hours',
                'index': [
                  {
                    'name': '平均花费',
                    'value': 76.13
                  },
                  {
                    'name': '最长响应时间',
                    'value': 8955
                  }
                ]
              },
              {
                'serviceName': 'random_25',
                'features': [
                  {
                    'name': '急救'
                  },
                  {
                    'name': '治疗'
                  },
                  {
                    'name': '通讯'
                  }
                ],
                'categoryMappings': [
                  {
                    'fullLink': true,
                    'category': {
                      'catelogyName': '出租车'
                    }
                  },
                  {
                    'fullLink': true,
                    'category': {
                      'catelogyName': '信息通讯'
                    }
                  },
                  {
                    'fullLink': true,
                    'category': {
                      'catelogyName': '日常娱乐'
                    }
                  },
                  {
                    'fullLink': true,
                    'category': {
                      'catelogyName': '租车'
                    }
                  }
                ],
                'provider': {
                  'name': 'Alibaba'
                },
                'textDescription': '随机生成的服务',
                'region': '哈尔滨',
                'period': '0 0 0 * * * for 24 hours',
                'index': [
                  {
                    'name': '平均花费',
                    'value': 64.14
                  },
                  {
                    'name': '最长响应时间',
                    'value': 5429
                  }
                ]
              }
            ],
            'freq': 4
          },
          {
            'services': [
              {
                'serviceName': 'random_13',
                'features': [],
                'categoryMappings': [
                  {
                    'fullLink': true,
                    'category': {
                      'catelogyName': '出租车'
                    }
                  },
                  {
                    'fullLink': true,
                    'category': {
                      'catelogyName': '医疗保健'
                    }
                  },
                  {
                    'fullLink': true,
                    'category': {
                      'catelogyName': '看护'
                    }
                  },
                  {
                    'fullLink': true,
                    'category': {
                      'catelogyName': '信息通讯'
                    }
                  },
                  {
                    'fullLink': true,
                    'category': {
                      'catelogyName': '日常娱乐'
                    }
                  },
                  {
                    'fullLink': true,
                    'category': {
                      'catelogyName': '健康养老'
                    }
                  }
                ],
                'provider': {
                  'name': 'Google'
                },
                'textDescription': '随机生成的服务',
                'region': '威海',
                'period': '0 0 0 * * * for 24 hours',
                'index': [
                  {
                    'name': '平均花费',
                    'value': 61.19
                  },
                  {
                    'name': '最长响应时间',
                    'value': 10089
                  }
                ]
              },
              {
                'serviceName': 'random_1',
                'features': [
                  {
                    'name': '通讯'
                  }
                ],
                'categoryMappings': [
                  {
                    'fullLink': true,
                    'category': {
                      'catelogyName': '出租车'
                    }
                  },
                  {
                    'fullLink': true,
                    'category': {
                      'catelogyName': '治疗'
                    }
                  },
                  {
                    'fullLink': true,
                    'category': {
                      'catelogyName': '信息通讯'
                    }
                  },
                  {
                    'fullLink': true,
                    'category': {
                      'catelogyName': '日常娱乐'
                    }
                  },
                  {
                    'fullLink': true,
                    'category': {
                      'catelogyName': '健康养老'
                    }
                  },
                  {
                    'fullLink': true,
                    'category': {
                      'catelogyName': '租车'
                    }
                  }
                ],
                'provider': {
                  'name': 'Google'
                },
                'textDescription': '随机生成的服务',
                'region': '威海',
                'period': '0 0 0 * * * for 24 hours',
                'index': [
                  {
                    'name': '平均花费',
                    'value': 75.19
                  },
                  {
                    'name': '最长响应时间',
                    'value': 8897
                  }
                ]
              }
            ],
            'freq': 3
          },
          {
            'services': [
              {
                'serviceName': 'random_22',
                'features': [
                  {
                    'name': '通讯'
                  }
                ],
                'categoryMappings': [
                  {
                    'fullLink': true,
                    'category': {
                      'catelogyName': '出租车'
                    }
                  },
                  {
                    'fullLink': true,
                    'category': {
                      'catelogyName': '医疗保健'
                    }
                  },
                  {
                    'fullLink': true,
                    'category': {
                      'catelogyName': '治疗'
                    }
                  },
                  {
                    'fullLink': true,
                    'category': {
                      'catelogyName': '健康养老'
                    }
                  }
                ],
                'provider': {
                  'name': 'Google'
                },
                'textDescription': '随机生成的服务',
                'region': '哈尔滨',
                'period': '0 0 8 * * 1-6 for 4 hours',
                'index': [
                  {
                    'name': '平均花费',
                    'value': 76.13
                  },
                  {
                    'name': '最长响应时间',
                    'value': 8955
                  }
                ]
              },
              {
                'serviceName': 'random_9',
                'features': [
                  {
                    'name': '急救'
                  },
                  {
                    'name': '治疗'
                  }
                ],
                'categoryMappings': [
                  {
                    'fullLink': true,
                    'category': {
                      'catelogyName': '出租车'
                    }
                  },
                  {
                    'fullLink': true,
                    'category': {
                      'catelogyName': '医疗保健'
                    }
                  },
                  {
                    'fullLink': true,
                    'category': {
                      'catelogyName': '看护'
                    }
                  },
                  {
                    'fullLink': true,
                    'category': {
                      'catelogyName': '治疗'
                    }
                  },
                  {
                    'fullLink': true,
                    'category': {
                      'catelogyName': '租车'
                    }
                  }
                ],
                'provider': {
                  'name': 'Alibaba'
                },
                'textDescription': '随机生成的服务',
                'region': '威海',
                'period': '0 0 0 * * * for 24 hours',
                'index': [
                  {
                    'name': '平均花费',
                    'value': 33.91
                  },
                  {
                    'name': '最长响应时间',
                    'value': 1464
                  }
                ]
              }
            ],
            'freq': 3
          },
          {
            'services': [
              {
                'serviceName': 'random_9',
                'features': [
                  {
                    'name': '急救'
                  },
                  {
                    'name': '治疗'
                  }
                ],
                'categoryMappings': [
                  {
                    'fullLink': true,
                    'category': {
                      'catelogyName': '出租车'
                    }
                  },
                  {
                    'fullLink': true,
                    'category': {
                      'catelogyName': '医疗保健'
                    }
                  },
                  {
                    'fullLink': true,
                    'category': {
                      'catelogyName': '看护'
                    }
                  },
                  {
                    'fullLink': true,
                    'category': {
                      'catelogyName': '治疗'
                    }
                  },
                  {
                    'fullLink': true,
                    'category': {
                      'catelogyName': '租车'
                    }
                  }
                ],
                'provider': {
                  'name': 'Alibaba'
                },
                'textDescription': '随机生成的服务',
                'region': '威海',
                'period': '0 0 0 * * * for 24 hours',
                'index': [
                  {
                    'name': '平均花费',
                    'value': 33.91
                  },
                  {
                    'name': '最长响应时间',
                    'value': 1464
                  }
                ]
              },
              {
                'serviceName': 'random_7',
                'features': [
                  {
                    'name': '急救'
                  },
                  {
                    'name': '治疗'
                  },
                  {
                    'name': '通讯'
                  }
                ],
                'categoryMappings': [
                  {
                    'fullLink': true,
                    'category': {
                      'catelogyName': '出租车'
                    }
                  },
                  {
                    'fullLink': true,
                    'category': {
                      'catelogyName': '医疗保健'
                    }
                  },
                  {
                    'fullLink': true,
                    'category': {
                      'catelogyName': '看护'
                    }
                  },
                  {
                    'fullLink': true,
                    'category': {
                      'catelogyName': '信息通讯'
                    }
                  },
                  {
                    'fullLink': true,
                    'category': {
                      'catelogyName': '日常娱乐'
                    }
                  },
                  {
                    'fullLink': true,
                    'category': {
                      'catelogyName': '健康养老'
                    }
                  }
                ],
                'provider': {
                  'name': 'Google'
                },
                'textDescription': '随机生成的服务',
                'region': '威海',
                'period': '0 0 8 * * 1-5 for 8 hours',
                'index': [
                  {
                    'name': '平均花费',
                    'value': 32.59
                  },
                  {
                    'name': '最长响应时间',
                    'value': 1903
                  }
                ]
              }
            ],
            'freq': 3
          }
        ]
      } else {
        res = [{ 'services': [{ 'serviceName': 'random_13', 'features': [], 'categoryMappings': [{ 'fullLink': true, 'category': { 'catelogyName': '出租车' }}, { 'fullLink': true, 'category': { 'catelogyName': '医疗保健' }}, { 'fullLink': true, 'category': { 'catelogyName': '看护' }}, { 'fullLink': true, 'category': { 'catelogyName': '信息通讯' }}, { 'fullLink': true, 'category': { 'catelogyName': '日常娱乐' }}, { 'fullLink': true, 'category': { 'catelogyName': '健康养老' }}], 'provider': { 'name': 'Google' }, 'textDescription': '随机生成的服务', 'region': '威海', 'period': '0 0 0 * * * for 24 hours', 'index': [{ 'name': '平均花费', 'value': 61.19 }, { 'name': '最长响应时间', 'value': 10089 }] }, { 'serviceName': 'random_28', 'features': [], 'categoryMappings': [{ 'fullLink': true, 'category': { 'catelogyName': '出租车' }}, { 'fullLink': true, 'category': { 'catelogyName': '医疗保健' }}, { 'fullLink': true, 'category': { 'catelogyName': '看护' }}, { 'fullLink': true, 'category': { 'catelogyName': '治疗' }}, { 'fullLink': true, 'category': { 'catelogyName': '信息通讯' }}], 'provider': { 'name': 'Alibaba' }, 'textDescription': '随机生成的服务', 'region': '威海', 'period': '0 0 0 * * * for 24 hours', 'index': [{ 'name': '平均花费', 'value': 24.56 }, { 'name': '最长响应时间', 'value': 1764 }] }], 'freq': 3 }, { 'services': [{ 'serviceName': 'random_16', 'features': [], 'categoryMappings': [{ 'fullLink': true, 'category': { 'catelogyName': '医疗保健' }}, { 'fullLink': true, 'category': { 'catelogyName': '看护' }}, { 'fullLink': true, 'category': { 'catelogyName': '治疗' }}, { 'fullLink': true, 'category': { 'catelogyName': '信息通讯' }}, { 'fullLink': true, 'category': { 'catelogyName': '健康养老' }}, { 'fullLink': true, 'category': { 'catelogyName': '租车' }}], 'provider': { 'name': 'Google' }, 'textDescription': '随机生成的服务', 'region': '深圳', 'period': '0 0 8 * * 1-6 for 4 hours', 'index': [{ 'name': '平均花费', 'value': 31.83 }, { 'name': '最长响应时间', 'value': 1764 }] }, { 'serviceName': 'random_27', 'features': [{ 'name': '治疗' }, { 'name': '通讯' }], 'categoryMappings': [{ 'fullLink': true, 'category': { 'catelogyName': '医疗保健' }}, { 'fullLink': true, 'category': { 'catelogyName': '看护' }}, { 'fullLink': true, 'category': { 'catelogyName': '信息通讯' }}, { 'fullLink': true, 'category': { 'catelogyName': '日常娱乐' }}, { 'fullLink': true, 'category': { 'catelogyName': '租车' }}], 'provider': { 'name': 'Alibaba' }, 'textDescription': '随机生成的服务', 'region': '北京', 'period': '0 0 8 * * 1-6 for 4 hours', 'index': [{ 'name': '平均花费', 'value': 63.9 }, { 'name': '最长响应时间', 'value': 1423 }] }], 'freq': 4 }, { 'services': [{ 'serviceName': 'random_28', 'features': [], 'categoryMappings': [{ 'fullLink': true, 'category': { 'catelogyName': '出租车' }}, { 'fullLink': true, 'category': { 'catelogyName': '医疗保健' }}, { 'fullLink': true, 'category': { 'catelogyName': '看护' }}, { 'fullLink': true, 'category': { 'catelogyName': '治疗' }}, { 'fullLink': true, 'category': { 'catelogyName': '信息通讯' }}], 'provider': { 'name': 'Alibaba' }, 'textDescription': '随机生成的服务', 'region': '威海', 'period': '0 0 0 * * * for 24 hours', 'index': [{ 'name': '平均花费', 'value': 24.56 }, { 'name': '最长响应时间', 'value': 1764 }] }, { 'serviceName': 'random_18', 'features': [{ 'name': '急救' }, { 'name': '治疗' }], 'categoryMappings': [{ 'fullLink': true, 'category': { 'catelogyName': '医疗保健' }}, { 'fullLink': true, 'category': { 'catelogyName': '看护' }}, { 'fullLink': true, 'category': { 'catelogyName': '信息通讯' }}, { 'fullLink': true, 'category': { 'catelogyName': '日常娱乐' }}, { 'fullLink': true, 'category': { 'catelogyName': '健康养老' }}], 'provider': { 'name': 'ICES' }, 'textDescription': '随机生成的服务', 'region': '深圳', 'period': '0 0 8 * * 1-6 for 4 hours', 'index': [{ 'name': '平均花费', 'value': 15.96 }, { 'name': '最长响应时间', 'value': 5591 }] }], 'freq': 3 }]
      }
      this.ssp = res.map((ssp, i) => {
        ssp.id = 'dsp_' + this.listQuery.domain + i
        return ssp
      })
      this.dspR = [
        {
          from: 'dsp_租车1',
          to: 'dsp_租车0',
          type: '功能覆盖',
          domain: '租车'
        },
        {
          from: 'dsp_租车1',
          to: 'dsp_租车2',
          type: '功能覆盖',
          domain: '租车'
        },
        {
          from: 'dsp_租车3',
          to: 'dsp_租车0',
          type: '功能覆盖',
          domain: '租车'
        },
        {
          from: 'dsp_租车3',
          to: 'dsp_租车2',
          type: '功能覆盖',
          domain: '租车'
        },
        {
          from: 'dsp_租车4',
          to: 'dsp_租车0',
          type: '功能覆盖',
          domain: '租车'
        },
        {
          from: 'dsp_租车4',
          to: 'dsp_租车2',
          type: '功能覆盖',
          domain: '租车'
        }
      ]
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
      this.loadSSP().then(() => {
        this.sspShowed = this.ssp.filter(ssp =>
          (this.listQuery.provider.length == 0 || ssp.provider == this.listQuery.provider) &&
            (this.listQuery.features.length == 0 || this.listQuery.features.some(f => ssp.features.some(f2 => f2 == f))) &&
            (this.listQuery.atomR.length == 0 || this.listQuery.atomR.some(f => ssp.rel == f))
        )

        this.dspRShowed = this.dspR.filter(dspR =>
          // (this.listQuery.provider.length == 0 || dspR.provider == this.listQuery.provider) &&
          (this.listQuery.domain.length == 0 || dspR.domain == this.listQuery.domain) &&
            (this.listQuery.sspR.length == 0 || this.listQuery.sspR.some(f => dspR.type == f))
        )
      })
    },
    handleCurrentChange(val) {
      this.checked_ssp = val
    },
    openUrl(url) {
      window.open(url)
    },
    showBPMN(scope) {
      // window.open(`http://10.147.19.68:18080/process/downloadXML/pattern?tasks=${scope.row.tasks}`)
      this.$ajax.get(`http://10.147.19.68:18080/process/downloadXML/pattern?tasks=${scope.row.services.map(x => x.serviceName).join(',')}`).then(response => {
        this.bpmn = response.data
        this.isShown = true
      })
    }
  }
}
</script>
