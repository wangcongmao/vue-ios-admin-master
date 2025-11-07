<template>
  <el-container>
    <el-header>
      <div style="margin-top:20px;margin-bottom: 20px">
        <el-row :gutter="10">
          <el-col :span="4">
            <el-select v-model="listQuery.domain" placeholder="所属领域">
              <el-option
                v-for="item in ['养老服务','医疗服务','社会服务']"
                :key="item"
                :label="item"
                :value="item"
              />
            </el-select>
          </el-col>
          <el-col :span="4">
            <el-select v-model="listQuery.provider" placeholder="所属组织">
              <el-option
                v-for="item in ['','天鑫','众阳软件']"
                :key="item"
                :label="item"
                :value="item"
              />
            </el-select>
            <!--<el-input v-model="listQuery.provider" placeholder="所属组织" />-->
          </el-col>
          <el-col :span="4">
            <el-select v-model="listQuery.features" multiple placeholder="请选择">
              <el-option
                v-for="item in features"
                :key="item.featureId"
                :label="item.name"
                :value="item.name"
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
        <el-tab-pane label="跨领域服务模式展示" name="first">
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
            <el-table :data="dspNodeShows">
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
                label="所属领域"
              >
                <template slot-scope="scope">
                  <el-tag
                    v-for="(domain,i) in ['养老服务','医疗服务']"
                    :key="i"
                    :type="'info'"
                    size="mini"
                  >
                    {{ domain }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column
                label="所属组织"
              >
                <template slot-scope="scope">
                  <el-tag
                    v-for="(provider,i) in Array.from(new Set(scope.row.services.map(s=>id2service(s).provider.name)))"
                    :key="i"
                    :type="'info'"
                    size="mini"
                  >
                    {{ provider }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column
                label="包含的服务"
              >
                <template slot-scope="scope">
                  <el-tag
                    v-for="(sname,index) in scope.row.services.map(x=>id2service(x).serviceName)"
                    :key="index"
                    :type="'info'"
                    size="mini"
                  >
                    {{ sname }}
                  </el-tag>
                  <!--<span style="margin-left: 10px">{{ scope.row.services.map(x=>x.serviceName) }}</span>-->
                </template>
              </el-table-column>
              <!--<el-table-column label="包含的Feature">-->
              <!--<template slot-scope="scope">-->
              <!--<span-->
              <!--v-for="(feature,i) in Array.from(new Set(scope.row.services.map(s=>s.features).flat().map(x=>x.name)))"-->
              <!--:key="i"-->
              <!--style="margin-left: 10px"-->
              <!--&gt;-->
              <!--{{ feature }}-->
              <!--</span>-->
              <!--</template>-->
              <!--</el-table-column>-->

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
                  <el-button type="text" @click="showBPMN(scope.row.id)">查看BPMN</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-row>
        </el-tab-pane>
        <el-tab-pane label="跨领域服务模式间关系" name="second">
          <el-row>
            <el-col :span="4">
              【筛选条件】跨领域服务模式间关系：
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
              :data="dspEdgeShows"
              style="width: 100%;"
              border
            >
              <el-table-column width="50">
                <template slot-scope="scope">
                  <span>{{ scope.$index + 1 }}</span>
                </template>
              </el-table-column>
              <el-table-column
                property="source"
                label="head"
              />
              <el-table-column
                label="tail"
              >
                <template slot-scope="scope">
                  <span style="margin-left: 10px">{{ scope.row.target }}</span>
                </template>
              </el-table-column>
              <el-table-column
                label="关系"
              >
                <template slot-scope="scope">
                  <span style="margin-left: 10px">{{ scope.row.relationship }}</span>
                </template>
              </el-table-column>
            </el-table>
          </el-row>
        </el-tab-pane>
        <el-tab-pane label="服务模式的分级结构展示" name="forth">
          （未完成）嵌入钰霄将来的分级图
        </el-tab-pane>
      </el-tabs>
    </el-main>
    <el-dialog :visible.sync="isShown">
      <div style="overflow:auto;width: 800px;">
        <img :src="bpmnUrl" :alt="bpmn">
      </div>
    </el-dialog>
  </el-container>
</template>
<script>
// import Pagination from '@/components/Pagination' // Secondary package based on el-pagination
import request from '@/utils/request2'
import { deepClone } from '@/utils'

import ServiceTable from '../atomic-service/service-table'
export default {
  components: {
    ServiceTable
    // Pagination
  },
  data() {
    return {
      activeName: 'first',
      tableKey: 0,
      list: null,

      dspGraph: { 'nodes': [{ 'id': 'hsc1', 'bpmn': '一个图片的url', 'services': [57, 58, 61, 99, 101, 134], 'inner_services': [], 'inner_ssps': ['ssp1', 'ssp2'], 'freq': 3, 'domain': '医疗服务' }, { 'id': 'hsc2', 'bpmn': '一个图片的url', 'services': [57, 58, 61, 137, 100], 'inner_services': [137, 100], 'inner_ssps': ['ssp1'], 'freq': 5, 'domain': '医疗服务' }, { 'id': 'hsc3', 'bpmn': '一个图片的url', 'services': [57, 58, 61, 97, 100, 138], 'inner_services': [], 'inner_ssps': ['ssp1', 'ssp3'], 'freq': 6, 'domain': '医疗服务' }], 'edges': [{ 'source': 'hsc3', 'target': 'hsc1', 'relationship': '连接关系', 'type': 'one-way' }] },
      sspGraph: { 'nodes': [{ 'id': 'ssp1', 'services': [57, 58, 61], 'provider': '天鑫', 'freq': 5 }, { 'id': 'ssp4', 'services': [1, 7, 8], 'provider': '天鑫', 'freq': 4 }, { 'id': 'ssp5', 'services': [14, 17, 18, 16], 'provider': '天鑫', 'freq': 4 }, { 'id': 'ssp6', 'services': [140, 141, 142, 143], 'provider': '天鑫', 'freq': 3 }, { 'id': 'ssp10', 'services': [14, 15, 16, 17, 18, 144, 145, 146, 147], 'provider': '天鑫', 'freq': 3 }, { 'id': 'ssp11', 'services': [37, 38, 39, 40, 41, 42], 'provider': '天鑫', 'freq': 3 }, { 'id': 'ssp2', 'services': [99, 101, 134], 'provider': '众阳软件', 'freq': 4 }, { 'id': 'ssp3', 'services': [97, 100, 138], 'provider': '众阳软件', 'freq': 5 }, { 'id': 'ssp7', 'services': [102, 103, 104, 105, 106, 100], 'provider': '众阳软件', 'freq': 4 }, { 'id': 'ssp8', 'services': [112, 113, 114, 115, 108], 'provider': '众阳软件', 'freq': 5 }, { 'id': 'ssp9', 'services': [100, 146, 97, 99, 101], 'provider': '众阳软件', 'freq': 5 }], 'edges': [{ 'source': 'ssp1', 'target': 'ssp4', 'relationship': '功能互补', 'type': 'two-way' }, { 'source': 'ssp1', 'target': 'ssp5', 'relationship': '功能互补', 'type': 'two-way' }, { 'source': 'ssp1', 'target': 'ssp6', 'relationship': '功能互补', 'type': 'two-way' }, { 'source': 'ssp1', 'target': 'ssp10', 'relationship': '功能互补', 'type': 'two-way' }, { 'source': 'ssp1', 'target': 'ssp11', 'relationship': '功能互补', 'type': 'two-way' }, { 'source': 'ssp4', 'target': 'ssp5', 'relationship': '功能互补', 'type': 'two-way' }, { 'source': 'ssp4', 'target': 'ssp6', 'relationship': '功能互补', 'type': 'two-way' }, { 'source': 'ssp4', 'target': 'ssp10', 'relationship': '功能互补', 'type': 'two-way' }, { 'source': 'ssp4', 'target': 'ssp11', 'relationship': '功能互补', 'type': 'two-way' }, { 'source': 'ssp5', 'target': 'ssp6', 'relationship': '功能互补', 'type': 'two-way' }, { 'source': 'ssp5', 'target': 'ssp11', 'relationship': '功能互补', 'type': 'two-way' }, { 'source': 'ssp6', 'target': 'ssp10', 'relationship': '功能互补', 'type': 'two-way' }, { 'source': 'ssp6', 'target': 'ssp11', 'relationship': '功能互补', 'type': 'two-way' }, { 'source': 'ssp10', 'target': 'ssp11', 'relationship': '功能互补', 'type': 'two-way' }, { 'source': 'ssp2', 'target': 'ssp3', 'relationship': '功能互补', 'type': 'two-way' }, { 'source': 'ssp2', 'target': 'ssp7', 'relationship': '功能互补', 'type': 'two-way' }, { 'source': 'ssp2', 'target': 'ssp8', 'relationship': '功能互补', 'type': 'two-way' }, { 'source': 'ssp2', 'target': 'ssp9', 'relationship': '功能互补', 'type': 'two-way' }, { 'source': 'ssp3', 'target': 'ssp7', 'relationship': '功能互补', 'type': 'two-way' }, { 'source': 'ssp3', 'target': 'ssp8', 'relationship': '功能互补', 'type': 'two-way' }, { 'source': 'ssp3', 'target': 'ssp9', 'relationship': '功能互补', 'type': 'two-way' }, { 'source': 'ssp7', 'target': 'ssp8', 'relationship': '功能互补', 'type': 'two-way' }, { 'source': 'ssp7', 'target': 'ssp9', 'relationship': '功能互补', 'type': 'two-way' }, { 'source': 'ssp8', 'target': 'ssp9', 'relationship': '功能互补', 'type': 'two-way' }, { 'source': 'ssp10', 'target': 'ssp5', 'relationship': '整体局部', 'type': 'one-way' }] },
      services: [{ '@id': 1, 'serviceId': 1, 'serviceName': '保姆清单', 'serviceType': 'UI', 'provider': { '@id': 25, 'providerId': 2, 'name': '天鑫', 'location': '山东威海', 'removed': false, 'id': 2 }, 'textDescription': '获取大姐家政公司的保姆列表，包括人员简要信息，分为住家保姆与不住家保姆', 'version': '1.0', 'servicePath': null, 'region': '山东', 'workTime': '0 0 0 * * * for 24 hours', 'createTimestamp': 1585122334017, 'removed': false, 'id': 1, 'categories': [3, 4, 24] }, { '@id': 1, 'serviceId': 134, 'serviceName': '一键转入院', 'serviceType': 'UI', 'provider': { '@id': 14, 'providerId': 3, 'name': '众阳软件', 'location': '山东济南', 'removed': false, 'id': 3 }, 'textDescription': '一键转入院', 'version': '1.0', 'servicePath': null, 'region': '山东', 'workTime': '0 0 0 * * * for 24 hours', 'createTimestamp': 1585190525190, 'removed': false, 'id': 134, 'categories': [3, 13, 7] }, { '@id': 1, 'serviceId': 7, 'serviceName': '保姆预约', 'serviceType': 'UI', 'provider': { '@id': 25, 'providerId': 2, 'name': '天鑫', 'location': '山东威海', 'removed': false, 'id': 2 }, 'textDescription': '对指定保姆发起预约申请', 'version': '1.0', 'servicePath': null, 'region': '山东', 'workTime': '0 0 0 * * * for 24 hours', 'createTimestamp': 1585130815674, 'removed': false, 'id': 7, 'categories': [3, 4, 24] }, { '@id': 1, 'serviceId': 8, 'serviceName': '保姆订单', 'serviceType': 'UI', 'provider': { '@id': 25, 'providerId': 2, 'name': '天鑫', 'location': '山东威海', 'removed': false, 'id': 2 }, 'textDescription': '查询家政公司发给自己保姆服务订单，订单包括价格信息，服务人员信息，费用信息并支付。', 'version': '1.0', 'servicePath': null, 'region': '山东', 'workTime': '0 0 0 * * * for 24 hours', 'createTimestamp': 1585130815841, 'removed': false, 'id': 8, 'categories': [5, 3, 4] }, { '@id': 1, 'serviceId': 137, 'serviceName': '医院体检服务', 'serviceType': 'UI', 'provider': { '@id': 14, 'providerId': 3, 'name': '众阳软件', 'location': '山东济南', 'removed': false, 'id': 3 }, 'textDescription': '医院体检服务', 'version': '1.0', 'servicePath': null, 'region': '山东', 'workTime': '0 0 0 * * * for 24 hours', 'createTimestamp': 1585190525549, 'removed': false, 'id': 137, 'categories': [8, 3, 4] }, { '@id': 1, 'serviceId': 138, 'serviceName': '慢病签约随访服务', 'serviceType': 'UI', 'provider': { '@id': 14, 'providerId': 3, 'name': '众阳软件', 'location': '山东济南', 'removed': false, 'id': 3 }, 'textDescription': '慢病签约随访服务', 'version': '1.0', 'servicePath': null, 'region': '山东', 'workTime': '0 0 0 * * * for 24 hours', 'createTimestamp': 1585190525698, 'removed': false, 'id': 138, 'categories': [5, 4, 3] }, { '@id': 1, 'serviceId': 140, 'serviceName': '商品搜索', 'serviceType': 'UI', 'provider': { '@id': 25, 'providerId': 2, 'name': '天鑫', 'location': '山东威海', 'removed': false, 'id': 2 }, 'textDescription': '商品搜索', 'version': '1.0', 'servicePath': null, 'region': '山东', 'workTime': '0 0 0 * * * for 24 hours', 'createTimestamp': 1585198390568, 'removed': false, 'id': 140, 'categories': [3, 4, 24] }, { '@id': 1, 'serviceId': 141, 'serviceName': '商品订单', 'serviceType': 'UI', 'provider': { '@id': 25, 'providerId': 2, 'name': '天鑫', 'location': '山东威海', 'removed': false, 'id': 2 }, 'textDescription': '商品订单', 'version': '1.0', 'servicePath': null, 'region': '山东', 'workTime': '0 0 0 * * * for 24 hours', 'createTimestamp': 1585198390717, 'removed': false, 'id': 141, 'categories': [20, 3, 19] }, { '@id': 1, 'serviceId': 14, 'serviceName': '护工清单', 'serviceType': 'UI', 'provider': { '@id': 25, 'providerId': 2, 'name': '天鑫', 'location': '山东威海', 'removed': false, 'id': 2 }, 'textDescription': '获取大姐家政公司的护工列表，包括人员简要信息', 'version': '1.0', 'servicePath': null, 'region': '山东', 'workTime': '0 0 0 * * * for 24 hours', 'createTimestamp': 1585130816693, 'removed': false, 'id': 14, 'categories': [3, 21, 4] }, { '@id': 1, 'serviceId': 142, 'serviceName': '在线支付', 'serviceType': 'UI', 'provider': { '@id': 25, 'providerId': 2, 'name': '天鑫', 'location': '山东威海', 'removed': false, 'id': 2 }, 'textDescription': '在线支付', 'version': '1.0', 'servicePath': null, 'region': '山东', 'workTime': '0 0 0 * * * for 24 hours', 'createTimestamp': 1585198390855, 'removed': false, 'id': 142, 'categories': [3, 5, 4] }, { '@id': 1, 'serviceId': 143, 'serviceName': '商品评价', 'serviceType': 'UI', 'provider': { '@id': 25, 'providerId': 2, 'name': '天鑫', 'location': '山东威海', 'removed': false, 'id': 2 }, 'textDescription': '商品评价', 'version': '1.0', 'servicePath': null, 'region': '山东', 'workTime': '0 0 0 * * * for 24 hours', 'createTimestamp': 1585198390983, 'removed': false, 'id': 143, 'categories': [15, 4, 3] }, { '@id': 1, 'serviceId': 15, 'serviceName': '护工详情', 'serviceType': 'UI', 'provider': { '@id': 25, 'providerId': 2, 'name': '天鑫', 'location': '山东威海', 'removed': false, 'id': 2 }, 'textDescription': '获取指定护工的详情信息', 'version': '1.0', 'servicePath': null, 'region': '山东', 'workTime': '0 0 0 * * * for 24 hours', 'createTimestamp': 1585130816814, 'removed': false, 'id': 15, 'categories': [4, 23, 3] }, { '@id': 1, 'serviceId': 16, 'serviceName': '服务评价', 'serviceType': 'UI', 'provider': { '@id': 25, 'providerId': 2, 'name': '天鑫', 'location': '山东威海', 'removed': false, 'id': 2 }, 'textDescription': '对指定护工进行评价', 'version': '1.0', 'servicePath': null, 'region': '山东', 'workTime': '0 0 0 * * * for 24 hours', 'createTimestamp': 1585130816940, 'removed': false, 'id': 16, 'categories': [16, 3, 12] }, { '@id': 1, 'serviceId': 144, 'serviceName': '护理计划查询', 'serviceType': 'UI', 'provider': { '@id': 25, 'providerId': 2, 'name': '天鑫', 'location': '山东威海', 'removed': false, 'id': 2 }, 'textDescription': '护理计划查询', 'version': '1.0', 'servicePath': null, 'region': '山东', 'workTime': '0 0 0 * * * for 24 hours', 'createTimestamp': 1585198391151, 'removed': false, 'id': 144, 'categories': [5, 4, 3] }, { '@id': 1, 'serviceId': 17, 'serviceName': '护工预约', 'serviceType': 'UI', 'provider': { '@id': 25, 'providerId': 2, 'name': '天鑫', 'location': '山东威海', 'removed': false, 'id': 2 }, 'textDescription': '对指定护工发起预约申请', 'version': '1.0', 'servicePath': null, 'region': '山东', 'workTime': '0 0 0 * * * for 24 hours', 'createTimestamp': 1585130817067, 'removed': false, 'id': 17, 'categories': [5, 3, 4] }, { '@id': 1, 'serviceId': 145, 'serviceName': '护理日程安排', 'serviceType': 'UI', 'provider': { '@id': 25, 'providerId': 2, 'name': '天鑫', 'location': '山东威海', 'removed': false, 'id': 2 }, 'textDescription': '护理日程安排', 'version': '1.0', 'servicePath': null, 'region': '山东', 'workTime': '0 0 0 * * * for 24 hours', 'createTimestamp': 1585198391278, 'removed': false, 'id': 145, 'categories': [4, 5, 3] }, { '@id': 1, 'serviceId': 18, 'serviceName': '护工订单', 'serviceType': 'UI', 'provider': { '@id': 25, 'providerId': 2, 'name': '天鑫', 'location': '山东威海', 'removed': false, 'id': 2 }, 'textDescription': '查询家政公司发给自己护工服务订单，订单包括价格信息，服务人员信息，费用信息。', 'version': '1.0', 'servicePath': null, 'region': '山东', 'workTime': '0 0 0 * * * for 24 hours', 'createTimestamp': 1585130817208, 'removed': false, 'id': 18, 'categories': [5, 4, 3] }, { '@id': 1, 'serviceId': 146, 'serviceName': '护理记录', 'serviceType': 'UI', 'provider': { '@id': 25, 'providerId': 2, 'name': '天鑫', 'location': '山东威海', 'removed': false, 'id': 2 }, 'textDescription': '护理记录', 'version': '1.0', 'servicePath': null, 'region': '山东', 'workTime': '0 0 0 * * * for 24 hours', 'createTimestamp': 1585198391385, 'removed': false, 'id': 146, 'categories': [4, 20, 3] }, { '@id': 1, 'serviceId': 147, 'serviceName': '护理内容查询', 'serviceType': 'UI', 'provider': { '@id': 25, 'providerId': 2, 'name': '天鑫', 'location': '山东威海', 'removed': false, 'id': 2 }, 'textDescription': '护理内容查询', 'version': '1.0', 'servicePath': null, 'region': '山东', 'workTime': '0 0 0 * * * for 24 hours', 'createTimestamp': 1585198391504, 'removed': false, 'id': 147, 'categories': [3, 13, 18] }, { '@id': 1, 'serviceId': 97, 'serviceName': '健康档案建档', 'serviceType': 'UI', 'provider': { '@id': 14, 'providerId': 3, 'name': '众阳软件', 'location': '山东济南', 'removed': false, 'id': 3 }, 'textDescription': '健康档案建档', 'version': '1.0', 'servicePath': null, 'region': '山东', 'workTime': '0 0 0 * * * for 24 hours', 'createTimestamp': 1585190520308, 'removed': false, 'id': 97, 'categories': [5, 4, 3] }, { '@id': 1, 'serviceId': 99, 'serviceName': '健康档案共享', 'serviceType': 'UI', 'provider': { '@id': 14, 'providerId': 3, 'name': '众阳软件', 'location': '山东济南', 'removed': false, 'id': 3 }, 'textDescription': '健康档案共享', 'version': '1.0', 'servicePath': null, 'region': '山东', 'workTime': '0 0 0 * * * for 24 hours', 'createTimestamp': 1585190520653, 'removed': false, 'id': 99, 'categories': [3, 12, 11] }, { '@id': 1, 'serviceId': 100, 'serviceName': '健康档案更新', 'serviceType': 'UI', 'provider': { '@id': 14, 'providerId': 3, 'name': '众阳软件', 'location': '山东济南', 'removed': false, 'id': 3 }, 'textDescription': '健康档案更新', 'version': '1.0', 'servicePath': null, 'region': '山东', 'workTime': '0 0 0 * * * for 24 hours', 'createTimestamp': 1585190520791, 'removed': false, 'id': 100, 'categories': [5, 4, 3] }, { '@id': 1, 'serviceId': 37, 'serviceName': '社区服务浏览', 'serviceType': 'UI', 'provider': { '@id': 25, 'providerId': 2, 'name': '天鑫', 'location': '山东威海', 'removed': false, 'id': 2 }, 'textDescription': '社区服务浏览', 'version': '1.0', 'servicePath': null, 'region': '山东', 'workTime': '0 0 0 * * * for 24 hours', 'createTimestamp': 1585130819556, 'removed': false, 'id': 37, 'categories': [20, 3, 18] }, { '@id': 1, 'serviceId': 101, 'serviceName': '健康档案授权', 'serviceType': 'UI', 'provider': { '@id': 14, 'providerId': 3, 'name': '众阳软件', 'location': '山东济南', 'removed': false, 'id': 3 }, 'textDescription': '健康档案授权', 'version': '1.0', 'servicePath': null, 'region': '山东', 'workTime': '0 0 0 * * * for 24 hours', 'createTimestamp': 1585190520935, 'removed': false, 'id': 101, 'categories': [12, 3, 11] }, { '@id': 1, 'serviceId': 38, 'serviceName': '社区服务预约', 'serviceType': 'UI', 'provider': { '@id': 25, 'providerId': 2, 'name': '天鑫', 'location': '山东威海', 'removed': false, 'id': 2 }, 'textDescription': '社区服务预约', 'version': '1.0', 'servicePath': null, 'region': '山东', 'workTime': '0 0 0 * * * for 24 hours', 'createTimestamp': 1585130819675, 'removed': false, 'id': 38, 'categories': [4, 6, 3] }, { '@id': 1, 'serviceId': 102, 'serviceName': '线上签约', 'serviceType': 'UI', 'provider': { '@id': 14, 'providerId': 3, 'name': '众阳软件', 'location': '山东济南', 'removed': false, 'id': 3 }, 'textDescription': '线上签约', 'version': '1.0', 'servicePath': null, 'region': '山东', 'workTime': '0 0 0 * * * for 24 hours', 'createTimestamp': 1585190521074, 'removed': false, 'id': 102, 'categories': [3, 12, 7] }, { '@id': 1, 'serviceId': 39, 'serviceName': '社区服务订单', 'serviceType': 'UI', 'provider': { '@id': 25, 'providerId': 2, 'name': '天鑫', 'location': '山东威海', 'removed': false, 'id': 2 }, 'textDescription': '社区服务订单', 'version': '1.0', 'servicePath': null, 'region': '山东', 'workTime': '0 0 0 * * * for 24 hours', 'createTimestamp': 1585130819783, 'removed': false, 'id': 39, 'categories': [3, 10, 16] }, { '@id': 1, 'serviceId': 103, 'serviceName': '服务查询', 'serviceType': 'UI', 'provider': { '@id': 14, 'providerId': 3, 'name': '众阳软件', 'location': '山东济南', 'removed': false, 'id': 3 }, 'textDescription': '服务查询', 'version': '1.0', 'servicePath': null, 'region': '山东', 'workTime': '0 0 0 * * * for 24 hours', 'createTimestamp': 1585190521205, 'removed': false, 'id': 103, 'categories': [11, 7, 3] }, { '@id': 1, 'serviceId': 40, 'serviceName': '社区服务评价', 'serviceType': 'UI', 'provider': { '@id': 25, 'providerId': 2, 'name': '天鑫', 'location': '山东威海', 'removed': false, 'id': 2 }, 'textDescription': '社区服务评价', 'version': '1.0', 'servicePath': null, 'region': '山东', 'workTime': '0 0 0 * * * for 24 hours', 'createTimestamp': 1585130819888, 'removed': false, 'id': 40, 'categories': [5, 3, 4] }, { '@id': 1, 'serviceId': 104, 'serviceName': '医生交流', 'serviceType': 'UI', 'provider': { '@id': 14, 'providerId': 3, 'name': '众阳软件', 'location': '山东济南', 'removed': false, 'id': 3 }, 'textDescription': '医生交流', 'version': '1.0', 'servicePath': null, 'region': '山东', 'workTime': '0 0 0 * * * for 24 hours', 'createTimestamp': 1585190521353, 'removed': false, 'id': 104, 'categories': [3, 4, 5] }, { '@id': 1, 'serviceId': 41, 'serviceName': '社区服务机构查询', 'serviceType': 'UI', 'provider': { '@id': 25, 'providerId': 2, 'name': '天鑫', 'location': '山东威海', 'removed': false, 'id': 2 }, 'textDescription': '查询所有社区服务机构列表', 'version': '1.0', 'servicePath': null, 'region': '山东', 'workTime': '0 0 0 * * * for 24 hours', 'createTimestamp': 1585130819996, 'removed': false, 'id': 41, 'categories': [3, 4, 5] }, { '@id': 1, 'serviceId': 105, 'serviceName': '健康管理/教育 ', 'serviceType': 'UI', 'provider': { '@id': 14, 'providerId': 3, 'name': '众阳软件', 'location': '山东济南', 'removed': false, 'id': 3 }, 'textDescription': '健康管理/教育 ', 'version': '1.0', 'servicePath': null, 'region': '山东', 'workTime': '0 0 0 * * * for 24 hours', 'createTimestamp': 1585190521482, 'removed': false, 'id': 105, 'categories': [4, 3, 5] }, { '@id': 1, 'serviceId': 42, 'serviceName': '社区服务机构详情', 'serviceType': 'UI', 'provider': { '@id': 25, 'providerId': 2, 'name': '天鑫', 'location': '山东威海', 'removed': false, 'id': 2 }, 'textDescription': '查询所有社区服务机构详情', 'version': '1.0', 'servicePath': null, 'region': '山东', 'workTime': '0 0 0 * * * for 24 hours', 'createTimestamp': 1585130820103, 'removed': false, 'id': 42, 'categories': [4, 5, 3] }, { '@id': 1, 'serviceId': 106, 'serviceName': '随访服务', 'serviceType': 'UI', 'provider': { '@id': 14, 'providerId': 3, 'name': '众阳软件', 'location': '山东济南', 'removed': false, 'id': 3 }, 'textDescription': '随访服务', 'version': '1.0', 'servicePath': null, 'region': '山东', 'workTime': '0 0 0 * * * for 24 hours', 'createTimestamp': 1585190521594, 'removed': false, 'id': 106, 'categories': [8, 3, 4] }, { '@id': 1, 'serviceId': 108, 'serviceName': '健康卡办理', 'serviceType': 'UI', 'provider': { '@id': 14, 'providerId': 3, 'name': '众阳软件', 'location': '山东济南', 'removed': false, 'id': 3 }, 'textDescription': '健康卡办理', 'version': '1.0', 'servicePath': null, 'region': '山东', 'workTime': '0 0 0 * * * for 24 hours', 'createTimestamp': 1585190521872, 'removed': false, 'id': 108, 'categories': [4, 3, 5] }, { '@id': 1, 'serviceId': 112, 'serviceName': '慢病筛查', 'serviceType': 'UI', 'provider': { '@id': 14, 'providerId': 3, 'name': '众阳软件', 'location': '山东济南', 'removed': false, 'id': 3 }, 'textDescription': '慢病筛查', 'version': '1.0', 'servicePath': null, 'region': '山东', 'workTime': '0 0 0 * * * for 24 hours', 'createTimestamp': 1585190522374, 'removed': false, 'id': 112, 'categories': [3, 12, 7] }, { '@id': 1, 'serviceId': 113, 'serviceName': '签约服务', 'serviceType': 'UI', 'provider': { '@id': 14, 'providerId': 3, 'name': '众阳软件', 'location': '山东济南', 'removed': false, 'id': 3 }, 'textDescription': '签约服务', 'version': '1.0', 'servicePath': null, 'region': '山东', 'workTime': '0 0 0 * * * for 24 hours', 'createTimestamp': 1585190522512, 'removed': false, 'id': 113, 'categories': [5, 4, 3] }, { '@id': 1, 'serviceId': 114, 'serviceName': '医生咨询', 'serviceType': 'UI', 'provider': { '@id': 14, 'providerId': 3, 'name': '众阳软件', 'location': '山东济南', 'removed': false, 'id': 3 }, 'textDescription': '医生咨询', 'version': '1.0', 'servicePath': null, 'region': '山东', 'workTime': '0 0 0 * * * for 24 hours', 'createTimestamp': 1585190522640, 'removed': false, 'id': 114, 'categories': [3, 12, 4] }, { '@id': 1, 'serviceId': 115, 'serviceName': '健康评估', 'serviceType': 'UI', 'provider': { '@id': 14, 'providerId': 3, 'name': '众阳软件', 'location': '山东济南', 'removed': false, 'id': 3 }, 'textDescription': '健康评估', 'version': '1.0', 'servicePath': null, 'region': '山东', 'workTime': '0 0 0 * * * for 24 hours', 'createTimestamp': 1585190522750, 'removed': false, 'id': 115, 'categories': [4, 3, 5] }, { '@id': 1, 'serviceId': 57, 'serviceName': '每日血压查询', 'serviceType': 'UI', 'provider': { '@id': 14, 'providerId': 2, 'name': '天鑫', 'location': '山东威海', 'removed': false, 'id': 2 }, 'textDescription': '查询指定老人的健康数据', 'version': '1.0', 'servicePath': null, 'region': '山东', 'workTime': '0 0 0 * * * for 24 hours', 'createTimestamp': 1585130821930, 'removed': false, 'id': 57, 'categories': [5, 3, 4] }, { '@id': 1, 'serviceId': 58, 'serviceName': '每日血糖查询', 'serviceType': 'UI', 'provider': { '@id': 14, 'providerId': 2, 'name': '天鑫', 'location': '山东威海', 'removed': false, 'id': 2 }, 'textDescription': '查询指定老人的体检报告', 'version': '1.0', 'servicePath': null, 'region': '山东', 'workTime': '0 0 0 * * * for 24 hours', 'createTimestamp': 1585130822075, 'removed': false, 'id': 58, 'categories': [4, 13, 3] }, { '@id': 1, 'serviceId': 61, 'serviceName': '健康报告', 'serviceType': 'UI', 'provider': { '@id': 25, 'providerId': 2, 'name': '天鑫', 'location': '山东威海', 'removed': false, 'id': 2 }, 'textDescription': '查询老人的健康报告', 'version': '1.0', 'servicePath': null, 'region': '山东', 'workTime': '0 0 0 * * * for 24 hours', 'createTimestamp': 1585130822482, 'removed': false, 'id': 61, 'categories': [5, 4, 3] }],
      serviceEdges: [{ 'source': '1', 'target': '8', 'relationship': '共用关系', 'type': 'two-way' }, { 'source': '7', 'target': '8', 'relationship': '共用关系', 'type': 'two-way' }, { 'source': '140', 'target': '143', 'relationship': '共用关系', 'type': 'two-way' }, { 'source': '141', 'target': '143', 'relationship': '共用关系', 'type': 'two-way' }, { 'source': '14', 'target': '147', 'relationship': '共用关系', 'type': 'two-way' }, { 'source': '142', 'target': '143', 'relationship': '共用关系', 'type': 'two-way' }, { 'source': '15', 'target': '147', 'relationship': '共用关系', 'type': 'two-way' }, { 'source': '16', 'target': '147', 'relationship': '共用关系', 'type': 'two-way' }, { 'source': '144', 'target': '147', 'relationship': '共用关系', 'type': 'two-way' }, { 'source': '17', 'target': '147', 'relationship': '共用关系', 'type': 'two-way' }, { 'source': '145', 'target': '147', 'relationship': '共用关系', 'type': 'two-way' }, { 'source': '18', 'target': '147', 'relationship': '共用关系', 'type': 'two-way' }, { 'source': '146', 'target': '147', 'relationship': '共用关系', 'type': 'two-way' }, { 'source': '97', 'target': '101', 'relationship': '共用关系', 'type': 'two-way' }, { 'source': '99', 'target': '101', 'relationship': '共用关系', 'type': 'two-way' }, { 'source': '100', 'target': '101', 'relationship': '共用关系', 'type': 'two-way' }, { 'source': '37', 'target': '42', 'relationship': '共用关系', 'type': 'two-way' }, { 'source': '101', 'target': '146', 'relationship': '共用关系', 'type': 'two-way' }, { 'source': '38', 'target': '42', 'relationship': '共用关系', 'type': 'two-way' }, { 'source': '102', 'target': '106', 'relationship': '共用关系', 'type': 'two-way' }, { 'source': '39', 'target': '42', 'relationship': '共用关系', 'type': 'two-way' }, { 'source': '103', 'target': '106', 'relationship': '共用关系', 'type': 'two-way' }, { 'source': '40', 'target': '42', 'relationship': '共用关系', 'type': 'two-way' }, { 'source': '104', 'target': '106', 'relationship': '共用关系', 'type': 'two-way' }, { 'source': '41', 'target': '42', 'relationship': '共用关系', 'type': 'two-way' }, { 'source': '105', 'target': '106', 'relationship': '共用关系', 'type': 'two-way' }, { 'source': '108', 'target': '115', 'relationship': '共用关系', 'type': 'two-way' }, { 'source': '112', 'target': '115', 'relationship': '共用关系', 'type': 'two-way' }, { 'source': '113', 'target': '115', 'relationship': '共用关系', 'type': 'two-way' }, { 'source': '114', 'target': '115', 'relationship': '共用关系', 'type': 'two-way' }, { 'source': '57', 'target': '61', 'relationship': '共用关系', 'type': 'two-way' }, { 'source': '58', 'target': '61', 'relationship': '共用关系', 'type': 'two-way' }, { 'source': '1', 'target': '7', 'relationship': '先后关系', 'type': 'one-way' }, { 'source': '7', 'target': '8', 'relationship': '先后关系', 'type': 'one-way' }, { 'source': '137', 'target': '100', 'relationship': '先后关系', 'type': 'one-way' }, { 'source': '140', 'target': '141', 'relationship': '先后关系', 'type': 'one-way' }, { 'source': '141', 'target': '142', 'relationship': '先后关系', 'type': 'one-way' }, { 'source': '14', 'target': '17', 'relationship': '先后关系', 'type': 'one-way' }, { 'source': '142', 'target': '143', 'relationship': '先后关系', 'type': 'one-way' }, { 'source': '17', 'target': '18', 'relationship': '先后关系', 'type': 'one-way' }, { 'source': '18', 'target': '16', 'relationship': '先后关系', 'type': 'one-way' }, { 'source': '146', 'target': '100', 'relationship': '先后关系', 'type': 'one-way' }, { 'source': '97', 'target': '100', 'relationship': '先后关系', 'type': 'one-way' }, { 'source': '99', 'target': '101', 'relationship': '先后关系', 'type': 'one-way' }, { 'source': '100', 'target': '146', 'relationship': '先后关系', 'type': 'one-way' }, { 'source': '101', 'target': '134', 'relationship': '先后关系', 'type': 'one-way' }, { 'source': '102', 'target': '103', 'relationship': '先后关系', 'type': 'one-way' }, { 'source': '103', 'target': '104', 'relationship': '先后关系', 'type': 'one-way' }, { 'source': '104', 'target': '105', 'relationship': '先后关系', 'type': 'one-way' }, { 'source': '105', 'target': '106', 'relationship': '先后关系', 'type': 'one-way' }, { 'source': '106', 'target': '100', 'relationship': '先后关系', 'type': 'one-way' }, { 'source': '112', 'target': '113', 'relationship': '先后关系', 'type': 'one-way' }, { 'source': '113', 'target': '114', 'relationship': '先后关系', 'type': 'one-way' }, { 'source': '114', 'target': '115', 'relationship': '先后关系', 'type': 'one-way' }, { 'source': '115', 'target': '108', 'relationship': '先后关系', 'type': 'one-way' }, { 'source': '57', 'target': '58', 'relationship': '先后关系', 'type': 'one-way' }, { 'source': '58', 'target': '61', 'relationship': '先后关系', 'type': 'one-way' }, { 'source': '61', 'target': '97', 'relationship': '先后关系', 'type': 'one-way' }],

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

      listQuery2: {
        page: 1,
        limit: 10,
        category: '',
        provider: '',
        features: []
      },
      features: [],
      bpmn: 'dsp1',
      bpmnUrl: '/dsp/dsp1.png',
      isShown: false
    }
  },
  computed: {
    dspNodeShows: function() {
      if (this.listQuery.domain == '社会服务') {
        return []
      }
      const nodes = this.dspGraph.nodes
      // .filter(nd => nd.domain == this.listQuery.domain)
      if (this.listQuery.provider == '') {
        return nodes
      } else {
        return nodes.filter(nd => nd.services.some(sid =>
          this.services.filter(s => s.serviceId == sid && s.provider.name == this.listQuery.provider).length > 0
        ))
      }
    },
    dspEdgeShows: function() {
      const nodes = this.dspNodeShows
      const edges = this.dspGraph.edges.filter(ed =>
        nodes.filter(nd => nd.id == ed.source).length > 0)
      if (this.listQuery.sspR.length == 0) {
        return edges
      } else {
        return edges.filter(ed => this.listQuery.sspR.indexOf(
          ed.relationship) >= 0)
      }
    }
  },
  created: function() {
    // this.loadSSP()
    this.loadFeatures()
  },
  methods: {
    async loadFeatures() {
      return request({
        url: '/serviceFeature/list',
        method: 'get'
      }).then(data => {
        this.features = data
      })
    },
    handleSearch() {
      const query = deepClone(this.listQuery)
      query.category = query.domain
      delete query.domain
      this.listQuery2 = query
      this.$refs['serviceTable'].getList()
    },
    id2service(serviceId) {
      return this.services.filter(s => s.serviceId == serviceId)[0]
    },
    handleCurrentChange(val) {
      this.checked_ssp = val
    },
    openUrl(url) {
      window.open(url)
    },
    // showBPMN(scope) {
    //   // window.open(`http://10.147.19.68:18080/process/downloadXML/pattern?tasks=${scope.row.tasks}`)
    //   this.$ajax.get(`http://10.147.19.68:18080/process/downloadXML/pattern?tasks=${scope.row.tasks}`).then(response => {
    //     this.bpmn = response.data
    //     this.isShown = true
    //   })
    // }
    showBPMN(id) {
      this.bpmn = id
      this.bpmnUrl = `/hsc/${id}.png`
      this.isShown = true
    }
  }
}
</script>
