<template>
  <div class="product-detail-wrapper">
    <div class="content-wrapper">
      <el-header>
        <div style="margin-top:20px;margin-bottom: 20px">
          <el-row :gutter="10">
            <el-col :span="5">
              <el-select v-model="listQuery.domain" style="width:300px;" placeholder="领域">
                <el-option
                  v-for="item in domains"
                  :key="item.value"
                  :label="item.name"
                  :value="item.value"
                />
              </el-select>
            </el-col>
            <el-col :span="5">
              <el-select v-model="listQuery.providers" style="width:300px;" multiple placeholder="组织">
                <el-option
                  v-for="item in providers"
                  :key="item.value"
                  :label="item.name"
                  :value="item.value"
                />
              </el-select>
            </el-col>
            <el-col :span="3">
              <el-button
                type="primary"
                icon="el-icon-search"
                @click="handleSearch"
              >查找</el-button>
            </el-col>
          </el-row>
        </div>
      </el-header>
      <el-main style="height: 1000px">
        <svg id="link-svg" />
        <div id="svg-container">
          <domain-svg
            v-if="DSPData.nodes.length > 0"
            :id="DSPData.domain"
            :data="DSPData"
            style="width: 80%; margin: 20px 10%; z-index: 3"
            @drawLink="drawLink"
            @showNodeDetail="showNodeDetail"
          />
          <provider-svg
            v-for="(sData, index) in SPData"
            :id="sData.provider"
            :key="'provider-' + index"
            :data="sData"
            :style="'width:' + width + '%; margin: 20px ' + margin + '%'"
            @drawLink="drawLink"
            @showNodeDetail="showNodeDetail"
          />
        </div>
      </el-main>
    </div>
    <el-dialog :visible.sync="dialogVisible" :title="dialogTitle[nodeType]">
      <div style="margin: 20px 40px;font-size: 16px">
        <ul v-if="nodeType === 'DSP'">
          <li>模式名称：{{ dialogData.id }}</li>
          <li>所含服务：{{ dialogData.services }}</li>
          <li>BPMN：{{ dialogData.BPMN }}</li>
        </ul>
        <ul v-else-if="nodeType === 'SSP'">
          <li>模式名称：{{ dialogData.id }}</li>
          <li>所含服务：</li>
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
      dialogData: {}
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
    processDataOld() {
      this.DSPData = {
        domain: '健康养老',
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
            { source: 'SSP3', target: 'AS6', relationShip: '功能互补' },
            { source: 'AS7', target: 'AS11', relationShip: '功能互补' }
          ]
        }
      ]
      this.crossLinks = [
        { source: 'DSP1', target: 'SSP1' },
        { source: 'DSP1', target: 'SSP3' },
        { source: 'DSP2', target: 'AS1' },
        { source: 'DSP2', target: 'AS11' },
        { source: 'DSP2', target: 'AS8' },
        { source: 'DSP1', target: 'AS5' }
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
      const offset = $('#link-svg').offset()
      svg.selectAll('g').remove()
      const that = this
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
          return d.source + '-->' + d.target
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
      return [tx, ty]
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
      return [x, y]
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
            width: 100%;
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
