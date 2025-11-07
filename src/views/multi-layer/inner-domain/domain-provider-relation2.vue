<template>
  <div class="product-detail-wrapper">
    <div class="content-wrapper">
      <el-main style="height: 1000px">
        <svg id="link-svg" style="width:1000px;height:860px;position: absolute;" />
        <div id="svg-container">
          <domain-svg
            v-if="DSPData.nodes.length > 0"
            :id="DSPData.domain"
            :data="DSPData"
            style="width: 80%; margin: 20px 10%; z-index: 30"
            @drawlink="drawLink"
            @showNodeDetail="showNodeDetail"
          />
          <provider-svg
            v-for="(sData, index) in SPData"
            :id="sData.provider"
            :key="'provider-' + index"
            :data="sData"
            :style="'width:' + width + '%; margin: 20px ' + margin + '%; z-index: 30'"
            @drawlink="drawLink"
            @showNodeDetail="showNodeDetail"
          />
        </div>
      </el-main>
    </div>
    <el-dialog :visible.sync="dialogVisible" :title="dialogTitle[nodeType]">
      <div style="margin: 20px 40px;font-size: 16px">
        <ul v-if="nodeType === 'DSP'">
          <li>模式名称：{{ dialogData.id }}</li>
          <li>所含服务：
            <el-tag
              v-for="(sname,index) in dialogData.services.map(x=>id2service(x).serviceName)"
              :key="index"
              :type="'info'"
              size="mini"
            >
              {{ sname }}
            </el-tag>
            <!--{{ dialogData.services }}-->
          </li>
          <li>BPMN：
            <div style="overflow:auto;width: 800px;">
              <img :src="'/dsp/'+dialogData.id+'.png'" :alt="dialogData.id">
            </div>
          </li>
        </ul>
        <ul v-else-if="nodeType === 'SSP'">
          <li>模式名称：{{ dialogData.id }}</li>
          <li>所含服务： <el-tag
            v-for="(service,index) in dialogData.ASNodes"
            :key="index"
            :type="'info'"
            size="mini"
          >
            {{ service.serviceName }}
          </el-tag>
            <!--{{dialogData.ASNodes}}-->
          </li>
        </ul>
        <ul v-else>
          <li>服务ID：{{ dialogData.id }}</li>
          <li>服务名称：{{ dialogData.serviceName }}</li>
          <li>服务类型：{{ dialogData.serviceType }}</li>
          <li>服务描述：{{ dialogData.textDescription }}</li>
        </ul>
      </div>
      <div style="text-align:right;">
        <el-button type="primary" @click="dialogVisible=false">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import * as d3 from 'd3'
import $ from 'jquery'
import domainSvg from './domain-svg'
import providerSvg from './provider-svg'
const title = {
  DSP: '领域内服务模式详情',
  SSP: '组织内服务模式详情',
  AS: '原子服务详情'
}
export default {
  name: 'DPRelation',
  components: { domainSvg, providerSvg },
  data() {
    return {
      domains: [
        { name: '健康养老', value: '健康养老' },
        { name: '生活购物', value: '生活购物' },
        { name: '出行', value: '出行' }
      ],
      providers: [
        { name: '天鑫', value: '天鑫' },
        { name: '众阳软件', value: '众阳软件' },
        { name: 'ICES', value: 'ICES' }
      ],
      listQuery: { domain: '', providers: [] },
      DSPData: { nodes: [], edges: [] },
      SPData: [],
      crossLinks: [],
      width: 0,
      margin: 0,
      markerSize: [],
      dialogVisible: false,
      nodeType: '',
      dialogTitle: title,
      dialogData: {},
      services: [{ '@id': 1, 'serviceId': 1, 'serviceName': '保姆清单', 'serviceType': 'UI', 'provider': { '@id': 25, 'providerId': 2, 'name': '天鑫', 'location': '山东威海', 'removed': false, 'id': 2 }, 'textDescription': '获取大姐家政公司的保姆列表，包括人员简要信息，分为住家保姆与不住家保姆', 'version': '1.0', 'servicePath': null, 'region': '山东', 'workTime': '0 0 0 * * * for 24 hours', 'createTimestamp': 1585122334017, 'removed': false, 'id': 1, 'categories': [3, 4, 24] }, { '@id': 1, 'serviceId': 134, 'serviceName': '一键转入院', 'serviceType': 'UI', 'provider': { '@id': 14, 'providerId': 3, 'name': '众阳软件', 'location': '山东济南', 'removed': false, 'id': 3 }, 'textDescription': '一键转入院', 'version': '1.0', 'servicePath': null, 'region': '山东', 'workTime': '0 0 0 * * * for 24 hours', 'createTimestamp': 1585190525190, 'removed': false, 'id': 134, 'categories': [3, 13, 7] }, { '@id': 1, 'serviceId': 7, 'serviceName': '保姆预约', 'serviceType': 'UI', 'provider': { '@id': 25, 'providerId': 2, 'name': '天鑫', 'location': '山东威海', 'removed': false, 'id': 2 }, 'textDescription': '对指定保姆发起预约申请', 'version': '1.0', 'servicePath': null, 'region': '山东', 'workTime': '0 0 0 * * * for 24 hours', 'createTimestamp': 1585130815674, 'removed': false, 'id': 7, 'categories': [3, 4, 24] }, { '@id': 1, 'serviceId': 8, 'serviceName': '保姆订单', 'serviceType': 'UI', 'provider': { '@id': 25, 'providerId': 2, 'name': '天鑫', 'location': '山东威海', 'removed': false, 'id': 2 }, 'textDescription': '查询家政公司发给自己保姆服务订单，订单包括价格信息，服务人员信息，费用信息并支付。', 'version': '1.0', 'servicePath': null, 'region': '山东', 'workTime': '0 0 0 * * * for 24 hours', 'createTimestamp': 1585130815841, 'removed': false, 'id': 8, 'categories': [5, 3, 4] }, { '@id': 1, 'serviceId': 137, 'serviceName': '医院体检服务', 'serviceType': 'UI', 'provider': { '@id': 14, 'providerId': 3, 'name': '众阳软件', 'location': '山东济南', 'removed': false, 'id': 3 }, 'textDescription': '医院体检服务', 'version': '1.0', 'servicePath': null, 'region': '山东', 'workTime': '0 0 0 * * * for 24 hours', 'createTimestamp': 1585190525549, 'removed': false, 'id': 137, 'categories': [8, 3, 4] }, { '@id': 1, 'serviceId': 138, 'serviceName': '慢病签约随访服务', 'serviceType': 'UI', 'provider': { '@id': 14, 'providerId': 3, 'name': '众阳软件', 'location': '山东济南', 'removed': false, 'id': 3 }, 'textDescription': '慢病签约随访服务', 'version': '1.0', 'servicePath': null, 'region': '山东', 'workTime': '0 0 0 * * * for 24 hours', 'createTimestamp': 1585190525698, 'removed': false, 'id': 138, 'categories': [5, 4, 3] }, { '@id': 1, 'serviceId': 140, 'serviceName': '商品搜索', 'serviceType': 'UI', 'provider': { '@id': 25, 'providerId': 2, 'name': '天鑫', 'location': '山东威海', 'removed': false, 'id': 2 }, 'textDescription': '商品搜索', 'version': '1.0', 'servicePath': null, 'region': '山东', 'workTime': '0 0 0 * * * for 24 hours', 'createTimestamp': 1585198390568, 'removed': false, 'id': 140, 'categories': [3, 4, 24] }, { '@id': 1, 'serviceId': 141, 'serviceName': '商品订单', 'serviceType': 'UI', 'provider': { '@id': 25, 'providerId': 2, 'name': '天鑫', 'location': '山东威海', 'removed': false, 'id': 2 }, 'textDescription': '商品订单', 'version': '1.0', 'servicePath': null, 'region': '山东', 'workTime': '0 0 0 * * * for 24 hours', 'createTimestamp': 1585198390717, 'removed': false, 'id': 141, 'categories': [20, 3, 19] }, { '@id': 1, 'serviceId': 14, 'serviceName': '护工清单', 'serviceType': 'UI', 'provider': { '@id': 25, 'providerId': 2, 'name': '天鑫', 'location': '山东威海', 'removed': false, 'id': 2 }, 'textDescription': '获取大姐家政公司的护工列表，包括人员简要信息', 'version': '1.0', 'servicePath': null, 'region': '山东', 'workTime': '0 0 0 * * * for 24 hours', 'createTimestamp': 1585130816693, 'removed': false, 'id': 14, 'categories': [3, 21, 4] }, { '@id': 1, 'serviceId': 142, 'serviceName': '在线支付', 'serviceType': 'UI', 'provider': { '@id': 25, 'providerId': 2, 'name': '天鑫', 'location': '山东威海', 'removed': false, 'id': 2 }, 'textDescription': '在线支付', 'version': '1.0', 'servicePath': null, 'region': '山东', 'workTime': '0 0 0 * * * for 24 hours', 'createTimestamp': 1585198390855, 'removed': false, 'id': 142, 'categories': [3, 5, 4] }, { '@id': 1, 'serviceId': 143, 'serviceName': '商品评价', 'serviceType': 'UI', 'provider': { '@id': 25, 'providerId': 2, 'name': '天鑫', 'location': '山东威海', 'removed': false, 'id': 2 }, 'textDescription': '商品评价', 'version': '1.0', 'servicePath': null, 'region': '山东', 'workTime': '0 0 0 * * * for 24 hours', 'createTimestamp': 1585198390983, 'removed': false, 'id': 143, 'categories': [15, 4, 3] }, { '@id': 1, 'serviceId': 15, 'serviceName': '护工详情', 'serviceType': 'UI', 'provider': { '@id': 25, 'providerId': 2, 'name': '天鑫', 'location': '山东威海', 'removed': false, 'id': 2 }, 'textDescription': '获取指定护工的详情信息', 'version': '1.0', 'servicePath': null, 'region': '山东', 'workTime': '0 0 0 * * * for 24 hours', 'createTimestamp': 1585130816814, 'removed': false, 'id': 15, 'categories': [4, 23, 3] }, { '@id': 1, 'serviceId': 16, 'serviceName': '服务评价', 'serviceType': 'UI', 'provider': { '@id': 25, 'providerId': 2, 'name': '天鑫', 'location': '山东威海', 'removed': false, 'id': 2 }, 'textDescription': '对指定护工进行评价', 'version': '1.0', 'servicePath': null, 'region': '山东', 'workTime': '0 0 0 * * * for 24 hours', 'createTimestamp': 1585130816940, 'removed': false, 'id': 16, 'categories': [16, 3, 12] }, { '@id': 1, 'serviceId': 144, 'serviceName': '护理计划查询', 'serviceType': 'UI', 'provider': { '@id': 25, 'providerId': 2, 'name': '天鑫', 'location': '山东威海', 'removed': false, 'id': 2 }, 'textDescription': '护理计划查询', 'version': '1.0', 'servicePath': null, 'region': '山东', 'workTime': '0 0 0 * * * for 24 hours', 'createTimestamp': 1585198391151, 'removed': false, 'id': 144, 'categories': [5, 4, 3] }, { '@id': 1, 'serviceId': 17, 'serviceName': '护工预约', 'serviceType': 'UI', 'provider': { '@id': 25, 'providerId': 2, 'name': '天鑫', 'location': '山东威海', 'removed': false, 'id': 2 }, 'textDescription': '对指定护工发起预约申请', 'version': '1.0', 'servicePath': null, 'region': '山东', 'workTime': '0 0 0 * * * for 24 hours', 'createTimestamp': 1585130817067, 'removed': false, 'id': 17, 'categories': [5, 3, 4] }, { '@id': 1, 'serviceId': 145, 'serviceName': '护理日程安排', 'serviceType': 'UI', 'provider': { '@id': 25, 'providerId': 2, 'name': '天鑫', 'location': '山东威海', 'removed': false, 'id': 2 }, 'textDescription': '护理日程安排', 'version': '1.0', 'servicePath': null, 'region': '山东', 'workTime': '0 0 0 * * * for 24 hours', 'createTimestamp': 1585198391278, 'removed': false, 'id': 145, 'categories': [4, 5, 3] }, { '@id': 1, 'serviceId': 18, 'serviceName': '护工订单', 'serviceType': 'UI', 'provider': { '@id': 25, 'providerId': 2, 'name': '天鑫', 'location': '山东威海', 'removed': false, 'id': 2 }, 'textDescription': '查询家政公司发给自己护工服务订单，订单包括价格信息，服务人员信息，费用信息。', 'version': '1.0', 'servicePath': null, 'region': '山东', 'workTime': '0 0 0 * * * for 24 hours', 'createTimestamp': 1585130817208, 'removed': false, 'id': 18, 'categories': [5, 4, 3] }, { '@id': 1, 'serviceId': 146, 'serviceName': '护理记录', 'serviceType': 'UI', 'provider': { '@id': 25, 'providerId': 2, 'name': '天鑫', 'location': '山东威海', 'removed': false, 'id': 2 }, 'textDescription': '护理记录', 'version': '1.0', 'servicePath': null, 'region': '山东', 'workTime': '0 0 0 * * * for 24 hours', 'createTimestamp': 1585198391385, 'removed': false, 'id': 146, 'categories': [4, 20, 3] }, { '@id': 1, 'serviceId': 147, 'serviceName': '护理内容查询', 'serviceType': 'UI', 'provider': { '@id': 25, 'providerId': 2, 'name': '天鑫', 'location': '山东威海', 'removed': false, 'id': 2 }, 'textDescription': '护理内容查询', 'version': '1.0', 'servicePath': null, 'region': '山东', 'workTime': '0 0 0 * * * for 24 hours', 'createTimestamp': 1585198391504, 'removed': false, 'id': 147, 'categories': [3, 13, 18] }, { '@id': 1, 'serviceId': 97, 'serviceName': '健康档案建档', 'serviceType': 'UI', 'provider': { '@id': 14, 'providerId': 3, 'name': '众阳软件', 'location': '山东济南', 'removed': false, 'id': 3 }, 'textDescription': '健康档案建档', 'version': '1.0', 'servicePath': null, 'region': '山东', 'workTime': '0 0 0 * * * for 24 hours', 'createTimestamp': 1585190520308, 'removed': false, 'id': 97, 'categories': [5, 4, 3] }, { '@id': 1, 'serviceId': 99, 'serviceName': '健康档案共享', 'serviceType': 'UI', 'provider': { '@id': 14, 'providerId': 3, 'name': '众阳软件', 'location': '山东济南', 'removed': false, 'id': 3 }, 'textDescription': '健康档案共享', 'version': '1.0', 'servicePath': null, 'region': '山东', 'workTime': '0 0 0 * * * for 24 hours', 'createTimestamp': 1585190520653, 'removed': false, 'id': 99, 'categories': [3, 12, 11] }, { '@id': 1, 'serviceId': 100, 'serviceName': '健康档案更新', 'serviceType': 'UI', 'provider': { '@id': 14, 'providerId': 3, 'name': '众阳软件', 'location': '山东济南', 'removed': false, 'id': 3 }, 'textDescription': '健康档案更新', 'version': '1.0', 'servicePath': null, 'region': '山东', 'workTime': '0 0 0 * * * for 24 hours', 'createTimestamp': 1585190520791, 'removed': false, 'id': 100, 'categories': [5, 4, 3] }, { '@id': 1, 'serviceId': 37, 'serviceName': '社区服务浏览', 'serviceType': 'UI', 'provider': { '@id': 25, 'providerId': 2, 'name': '天鑫', 'location': '山东威海', 'removed': false, 'id': 2 }, 'textDescription': '社区服务浏览', 'version': '1.0', 'servicePath': null, 'region': '山东', 'workTime': '0 0 0 * * * for 24 hours', 'createTimestamp': 1585130819556, 'removed': false, 'id': 37, 'categories': [20, 3, 18] }, { '@id': 1, 'serviceId': 101, 'serviceName': '健康档案授权', 'serviceType': 'UI', 'provider': { '@id': 14, 'providerId': 3, 'name': '众阳软件', 'location': '山东济南', 'removed': false, 'id': 3 }, 'textDescription': '健康档案授权', 'version': '1.0', 'servicePath': null, 'region': '山东', 'workTime': '0 0 0 * * * for 24 hours', 'createTimestamp': 1585190520935, 'removed': false, 'id': 101, 'categories': [12, 3, 11] }, { '@id': 1, 'serviceId': 38, 'serviceName': '社区服务预约', 'serviceType': 'UI', 'provider': { '@id': 25, 'providerId': 2, 'name': '天鑫', 'location': '山东威海', 'removed': false, 'id': 2 }, 'textDescription': '社区服务预约', 'version': '1.0', 'servicePath': null, 'region': '山东', 'workTime': '0 0 0 * * * for 24 hours', 'createTimestamp': 1585130819675, 'removed': false, 'id': 38, 'categories': [4, 6, 3] }, { '@id': 1, 'serviceId': 102, 'serviceName': '线上签约', 'serviceType': 'UI', 'provider': { '@id': 14, 'providerId': 3, 'name': '众阳软件', 'location': '山东济南', 'removed': false, 'id': 3 }, 'textDescription': '线上签约', 'version': '1.0', 'servicePath': null, 'region': '山东', 'workTime': '0 0 0 * * * for 24 hours', 'createTimestamp': 1585190521074, 'removed': false, 'id': 102, 'categories': [3, 12, 7] }, { '@id': 1, 'serviceId': 39, 'serviceName': '社区服务订单', 'serviceType': 'UI', 'provider': { '@id': 25, 'providerId': 2, 'name': '天鑫', 'location': '山东威海', 'removed': false, 'id': 2 }, 'textDescription': '社区服务订单', 'version': '1.0', 'servicePath': null, 'region': '山东', 'workTime': '0 0 0 * * * for 24 hours', 'createTimestamp': 1585130819783, 'removed': false, 'id': 39, 'categories': [3, 10, 16] }, { '@id': 1, 'serviceId': 103, 'serviceName': '服务查询', 'serviceType': 'UI', 'provider': { '@id': 14, 'providerId': 3, 'name': '众阳软件', 'location': '山东济南', 'removed': false, 'id': 3 }, 'textDescription': '服务查询', 'version': '1.0', 'servicePath': null, 'region': '山东', 'workTime': '0 0 0 * * * for 24 hours', 'createTimestamp': 1585190521205, 'removed': false, 'id': 103, 'categories': [11, 7, 3] }, { '@id': 1, 'serviceId': 40, 'serviceName': '社区服务评价', 'serviceType': 'UI', 'provider': { '@id': 25, 'providerId': 2, 'name': '天鑫', 'location': '山东威海', 'removed': false, 'id': 2 }, 'textDescription': '社区服务评价', 'version': '1.0', 'servicePath': null, 'region': '山东', 'workTime': '0 0 0 * * * for 24 hours', 'createTimestamp': 1585130819888, 'removed': false, 'id': 40, 'categories': [5, 3, 4] }, { '@id': 1, 'serviceId': 104, 'serviceName': '医生交流', 'serviceType': 'UI', 'provider': { '@id': 14, 'providerId': 3, 'name': '众阳软件', 'location': '山东济南', 'removed': false, 'id': 3 }, 'textDescription': '医生交流', 'version': '1.0', 'servicePath': null, 'region': '山东', 'workTime': '0 0 0 * * * for 24 hours', 'createTimestamp': 1585190521353, 'removed': false, 'id': 104, 'categories': [3, 4, 5] }, { '@id': 1, 'serviceId': 41, 'serviceName': '社区服务机构查询', 'serviceType': 'UI', 'provider': { '@id': 25, 'providerId': 2, 'name': '天鑫', 'location': '山东威海', 'removed': false, 'id': 2 }, 'textDescription': '查询所有社区服务机构列表', 'version': '1.0', 'servicePath': null, 'region': '山东', 'workTime': '0 0 0 * * * for 24 hours', 'createTimestamp': 1585130819996, 'removed': false, 'id': 41, 'categories': [3, 4, 5] }, { '@id': 1, 'serviceId': 105, 'serviceName': '健康管理/教育 ', 'serviceType': 'UI', 'provider': { '@id': 14, 'providerId': 3, 'name': '众阳软件', 'location': '山东济南', 'removed': false, 'id': 3 }, 'textDescription': '健康管理/教育 ', 'version': '1.0', 'servicePath': null, 'region': '山东', 'workTime': '0 0 0 * * * for 24 hours', 'createTimestamp': 1585190521482, 'removed': false, 'id': 105, 'categories': [4, 3, 5] }, { '@id': 1, 'serviceId': 42, 'serviceName': '社区服务机构详情', 'serviceType': 'UI', 'provider': { '@id': 25, 'providerId': 2, 'name': '天鑫', 'location': '山东威海', 'removed': false, 'id': 2 }, 'textDescription': '查询所有社区服务机构详情', 'version': '1.0', 'servicePath': null, 'region': '山东', 'workTime': '0 0 0 * * * for 24 hours', 'createTimestamp': 1585130820103, 'removed': false, 'id': 42, 'categories': [4, 5, 3] }, { '@id': 1, 'serviceId': 106, 'serviceName': '随访服务', 'serviceType': 'UI', 'provider': { '@id': 14, 'providerId': 3, 'name': '众阳软件', 'location': '山东济南', 'removed': false, 'id': 3 }, 'textDescription': '随访服务', 'version': '1.0', 'servicePath': null, 'region': '山东', 'workTime': '0 0 0 * * * for 24 hours', 'createTimestamp': 1585190521594, 'removed': false, 'id': 106, 'categories': [8, 3, 4] }, { '@id': 1, 'serviceId': 108, 'serviceName': '健康卡办理', 'serviceType': 'UI', 'provider': { '@id': 14, 'providerId': 3, 'name': '众阳软件', 'location': '山东济南', 'removed': false, 'id': 3 }, 'textDescription': '健康卡办理', 'version': '1.0', 'servicePath': null, 'region': '山东', 'workTime': '0 0 0 * * * for 24 hours', 'createTimestamp': 1585190521872, 'removed': false, 'id': 108, 'categories': [4, 3, 5] }, { '@id': 1, 'serviceId': 112, 'serviceName': '慢病筛查', 'serviceType': 'UI', 'provider': { '@id': 14, 'providerId': 3, 'name': '众阳软件', 'location': '山东济南', 'removed': false, 'id': 3 }, 'textDescription': '慢病筛查', 'version': '1.0', 'servicePath': null, 'region': '山东', 'workTime': '0 0 0 * * * for 24 hours', 'createTimestamp': 1585190522374, 'removed': false, 'id': 112, 'categories': [3, 12, 7] }, { '@id': 1, 'serviceId': 113, 'serviceName': '签约服务', 'serviceType': 'UI', 'provider': { '@id': 14, 'providerId': 3, 'name': '众阳软件', 'location': '山东济南', 'removed': false, 'id': 3 }, 'textDescription': '签约服务', 'version': '1.0', 'servicePath': null, 'region': '山东', 'workTime': '0 0 0 * * * for 24 hours', 'createTimestamp': 1585190522512, 'removed': false, 'id': 113, 'categories': [5, 4, 3] }, { '@id': 1, 'serviceId': 114, 'serviceName': '医生咨询', 'serviceType': 'UI', 'provider': { '@id': 14, 'providerId': 3, 'name': '众阳软件', 'location': '山东济南', 'removed': false, 'id': 3 }, 'textDescription': '医生咨询', 'version': '1.0', 'servicePath': null, 'region': '山东', 'workTime': '0 0 0 * * * for 24 hours', 'createTimestamp': 1585190522640, 'removed': false, 'id': 114, 'categories': [3, 12, 4] }, { '@id': 1, 'serviceId': 115, 'serviceName': '健康评估', 'serviceType': 'UI', 'provider': { '@id': 14, 'providerId': 3, 'name': '众阳软件', 'location': '山东济南', 'removed': false, 'id': 3 }, 'textDescription': '健康评估', 'version': '1.0', 'servicePath': null, 'region': '山东', 'workTime': '0 0 0 * * * for 24 hours', 'createTimestamp': 1585190522750, 'removed': false, 'id': 115, 'categories': [4, 3, 5] }, { '@id': 1, 'serviceId': 57, 'serviceName': '每日血压查询', 'serviceType': 'UI', 'provider': { '@id': 14, 'providerId': 2, 'name': '天鑫', 'location': '山东威海', 'removed': false, 'id': 2 }, 'textDescription': '查询指定老人的健康数据', 'version': '1.0', 'servicePath': null, 'region': '山东', 'workTime': '0 0 0 * * * for 24 hours', 'createTimestamp': 1585130821930, 'removed': false, 'id': 57, 'categories': [5, 3, 4] }, { '@id': 1, 'serviceId': 58, 'serviceName': '每日血糖查询', 'serviceType': 'UI', 'provider': { '@id': 14, 'providerId': 2, 'name': '天鑫', 'location': '山东威海', 'removed': false, 'id': 2 }, 'textDescription': '查询指定老人的体检报告', 'version': '1.0', 'servicePath': null, 'region': '山东', 'workTime': '0 0 0 * * * for 24 hours', 'createTimestamp': 1585130822075, 'removed': false, 'id': 58, 'categories': [4, 13, 3] }, { '@id': 1, 'serviceId': 61, 'serviceName': '健康报告', 'serviceType': 'UI', 'provider': { '@id': 25, 'providerId': 2, 'name': '天鑫', 'location': '山东威海', 'removed': false, 'id': 2 }, 'textDescription': '查询老人的健康报告', 'version': '1.0', 'servicePath': null, 'region': '山东', 'workTime': '0 0 0 * * * for 24 hours', 'createTimestamp': 1585130822482, 'removed': false, 'id': 61, 'categories': [5, 4, 3] }]
    }
  },
  watch: {
    SPData(newVal) {
      const count = newVal.length
      this.width = 80 / count
      this.margin = 10 / count

      // remind 计算SSP中AS数确定是否需要新增marker
    }
  },
  created() {
    // remind 领域-组织层次关系初始化
    // getDomains
    // getProviders
  },
  mounted() {
    this.drawMarker(35)
    this.drawMarker(10)
  },
  methods: {
    showNodeDetail(data) {
      this.nodeType = data.type
      this.dialogData = data.data
      this.dialogVisible = true
    },
    id2service(serviceId) {
      return this.services.filter(s => s.serviceId == serviceId)[0]
    },
    processDataOld() {
      this.DSPData = {
        domain: '医疗服务',
        nodes: [
          { id: 'DSP1', BPMN: 'url', services: [57, 58, 61, 99, 101, 134] },
          { id: 'DSP2', BPMN: 'url', services: [57, 58, 61, 137, 100] },
          { id: 'DSP3', BPMN: 'url', services: [57, 58, 61, 97, 100, 138] }
        ],
        edges: [
          { source: 'DSP1', target: 'DSP2', relationShip: '连接关系' },
          { source: 'DSP3', target: 'DSP2', relationShip: '连接关系' }
        ]
      }
      this.SPData = [
        {
          provider: '天鑫',
          SSPNodes: [
            {
              id: 'SSP1',
              ASNodes: [
                { id: 'AS1', serviceName: '每日血压查询', serviceType: 'UI', textDescription: '查询指定老人的血压数据' },
                { id: 'AS2', serviceName: '每日血糖查询', serviceType: 'UI', textDescription: '查询指定老人的血糖数据' },
                { id: 'AS3', serviceName: '健康报告', serviceType: 'UI', textDescription: '查询老人的健康报告' },
                { id: 'AS4', serviceName: '健康档案共享', serviceType: 'UI', textDescription: '健康档案共享' }
              ]
            }
          ],
          edges: []
        },
        {
          provider: '众阳软件',
          SSPNodes: [
            {
              id: 'SSP2',
              ASNodes: [
                { id: 'AS7', serviceName: '健康档案授权', serviceType: 'UI', textDescription: '健康档案授权' },
                { id: 'AS8', serviceName: '一键转入院', serviceType: 'UI', textDescription: '一键转入院' },
                { id: 'AS5', serviceName: '健康档案建档', serviceType: 'UI', textDescription: '健康档案建档' },
                { id: 'AS6', serviceName: '健康档案更新', serviceType: 'UI', textDescription: '健康档案更新' }
              ]
            },
            {
              id: 'SSP3',
              ASNodes: [
                { id: 'AS11', serviceName: '慢病签约随访服务', serviceType: 'UI', textDescription: '慢病签约随访服务' },
                { id: 'AS12', serviceName: '医院体检服务', serviceType: 'UI', textDescription: '医院体检服务' }
              ]
            }
          ],
          edges: [
            { source: 'SSP3', target: 'SSP2', relationShip: '功能互补' },
            // { source: 'SSP3', target: 'AS6', relationShip: '功能互补' },
            { source: 'AS7', target: 'AS11', relationShip: '功能互补' }
          ]
        }
      ]
      this.crossLinks = [
        { source: 'DSP1', target: 'SSP1', relationShip: '包含关系' },
        { source: 'DSP1', target: 'SSP3', relationShip: '包含关系' },
        { source: 'DSP2', target: 'AS1', relationShip: '包含关系' },
        { source: 'DSP2', target: 'AS11', relationShip: '共用关系' },
        { source: 'DSP2', target: 'AS8', relationShip: '共用关系' },
        { source: 'DSP1', target: 'AS5', relationShip: '共用关系' }
      ]
    },
    handleSearch() {
      this.processDataOld()
    },
    drawMarker(delta) {
      // 箭头
      d3.select('#link-svg')
        .append('marker')
        .attr('id', 'arrow-marker-' + delta)
        // 设置为strokeWidth箭头会随着线的粗细发生变化
        // .attr('markerUnits','strokeWidth')
        .attr('markerUnits', 'userSpaceOnUse')
        // 坐标系的区域
        .attr('viewBox', '0 -5 10 10')
        // 箭头坐标
        .attr('refX', delta)
        .attr('refY', 0)
        // 标识的大小
        .attr('markerWidth', 12)
        .attr('markerHeight', 12)
        // 绘制方向，可设定为：auto（自动确认方向）和 角度值
        .attr('orient', 'auto')
        // 箭头宽度
        .attr('stroke-width', 1.5)
        .append('path')
        // 箭头的路径
        .attr('d', 'M0,-5L10,0L0,5')
        // 箭头颜色
        .attr('fill', '#000000')
    },
    drawLink() {
      const svg = d3.select('#link-svg')
      $('#link-svg').attr('style', 'width:1000px;height:860px;position: absolute;z-index:0;')
      const offset = $('#link-svg').offset()
      svg.selectAll('g').remove()
      const that = this

      // console.info(this.crossLinks)
      // 设置连接线
      const edges_line = svg.append('g').selectAll('.cross-edge-path')
        .data(this.crossLinks)
        .enter()
        .append('path')
        .attr('d', function(d) {
          const src = $('#' + d.source)
          const tgt = $('#' + d.target)
          const srcP = that.getRelavatePosition(offset, src)
          let tgtP = that.getRelavatePosition(offset, tgt)
          const tgtR = tgt.attr('r')
          tgtP = that.getTgtPoints([srcP[0], srcP[1], tgtP[0], tgtP[1], tgtR])
          // console.info(srcP, tgtP)
          return 'M ' + srcP[0] + ' ' + srcP[1] + ' L ' + tgtP[0] + ' ' + tgtP[1]
        })
        .attr('class', 'cross-edge-path')
        .attr('id', function(d, i) {
          return 'cross-edge-path-' + i
        })
        .style('pointer-events', 'none')
        .style('stroke', 'black')
        .style('stroke-width', 1)// 线条粗细
        // remind 箭头位置
        .attr('marker-end', 'url(#arrow-marker-10)')// 根据箭头标记的id号标记箭头

      // 设置线条上的文字
      const edges_text = svg.append('g').selectAll('.cross-edge-label')
        .data(this.crossLinks)
        .enter()
        .append('text')
        .style('pointer-events', 'none')
        .attr('class', 'cross-edge-label')
        .attr('id', function(d, i) {
          return 'cross-edge-label-' + i
        })
        .attr('dx', 180)
        .attr('dy', 0)
      edges_text.append('textPath')
        .attr('xlink:href', function(d, i) {
          return '#cross-edge-path-' + i
        })
        .style('pointer-events', 'none')
        .text(function(d) {
          return d.relationShip
        })
      edges_text.attr('transform', function(d, i) {
        const src = $('#' + d.source)
        const tgt = $('#' + d.target)
        const srcP = that.getRelavatePosition(offset, src)
        const tgtP = that.getRelavatePosition(offset, tgt)
        if (tgtP[0] < srcP[0]) {
          const bbox = this.getBBox()
          const rx = bbox.x + bbox.width / 2
          const ry = bbox.y + bbox.height / 2
          return 'rotate(180 ' + rx + ' ' + ry + ')'
        } else {
          return 'rotate(0)'
        }
      })
    },
    // [srcX, srcY, tgtX, tgtY, tgtR]
    getTgtPoints(origin) {
      const dx = origin[2] - origin[0]
      const dy = origin[3] - origin[1]
      const degree = Math.atan2(dy, dx)
      const cos = Math.cos(degree)
      const sin = Math.sin(degree)
      const tx = origin[2] - (cos * origin[4])
      const ty = origin[3] - (sin * origin[4])
      return [tx || 10, ty || 10]
    },
    getRelavatePosition(offset, point) {
      const dx1 = point.attr('offX') - offset.left
      const dy1 = point.attr('offY') - offset.top
      let dx2 = point.attr('xx')
      let dy2 = point.attr('yy')
      if (point.attr('r') === '8') {
        const parent = point.parent()
        dx2 = parent.attr('xx') - (-dx2)
        dy2 = parent.attr('yy') - (-dy2)
      }
      const x = dx2 - (-dx1)
      const y = dy2 - (-dy1)
      return [x || 10, y || 10]
    }
  }
}
</script>
<style lang="less" scoped>
    @import '~@/styles/less/common.less';

    .product-detail-wrapper{
        width: 100%;
        background-color: #f6f6f6;
        padding-top: 0px;
        padding-bottom: 40px;
    }
    #link-svg{
            position: absolute;
            top: 60px;
            left: 0;
            /*width: 100%;*/
            width:900px;
            height: 860px;
        }

    #svg-container {
        position: absolute;
        top: 60px;
        left: 0;
        width: 100%;
        height: 860px;
    }
</style>
