<template>
  <svg
    :id="id"
    class="provider-svg"
  />
</template>

<script>
import * as d3 from 'd3'
import $ from 'jquery'

const defaultSPData = {
  SSPNodes: [{
    id: '',
    name: '',
    ASNodes: [{
      id: '',
      name: ''
    }]
  }],
  edges: [{
    source: '',
    target: ''
  }]
}

export default {
  name: 'ProviderSvg',
  props: {
    data: {
      type: Object,
      require: true,
      default: defaultSPData
    },
    id: {
      type: String,
      require: true,
      default: ''
    }
  },
  data() {
    return {
      SSPNodes: defaultSPData.SSPNodes,
      edges: defaultSPData.edges,
      offsetX: 0,
      offsetY: 0
    }
  },
  watch: {
    data: {
      handler(value) {
        this.SSPNodes = value.SSPNodes
        this.edges = value.edges
        this.draw_svg()
      }
    }
  },
  mounted() {
    this.SSPNodes = this.data.SSPNodes
    this.edges = this.data.edges
    this.draw_svg()
  },
  methods: {
    showNodeDetail(node) {
      this.$emit('showNodeDetail', node)
    },
    initSvg() {
      const selector = '#' + this.id
      const svg = d3.select(selector)
      svg.selectAll('*').remove()
      const bottomCircleG = svg.append('g')
      const edgesG = svg.append('g')
      const topCircleG = svg.append('g')
      const width = $(selector).width()
      const height = $(selector).height()
      const offset = $(selector).offset()
      this.offsetX = offset.left
      this.offsetY = offset.top
      return {
        topCircleG,
        edgesG,
        bottomCircleG,
        width,
        height
      }
    },
    draw_svg() {
      const { topCircleG, edgesG, bottomCircleG, width, height } = this.initSvg()
      const that = this

      const force = d3.forceSimulation()
        .force('link', d3.forceLink())
        .force('charge', d3.forceManyBody().strength(-100))
        .force('center', d3.forceCenter())

      // 生成节点数据
      force.nodes(this.SSPNodes)
        .on('tick', tick.bind(that))// 这个函数很重要，后面给出具体实现和说明
      // 设置图形的中心位置
      force.force('center')
        .x(width / 2)
        .y(height / 2)

      // 绘制SSP节点
      const circle = bottomCircleG.selectAll('.' + this.id + '-out-circle')
        .data(force.nodes())// 表示使用force.nodes数据
        .enter()
        .append('circle')
        .attr('r', function(d) { // 设置圆圈半径
          return 35 * (Math.ceil(d.ASNodes.length / 4))
        })
        .attr('id', function(d) {
          return d.id
        })
        .attr('xx', function(d) {
          return d.x
        })
        .attr('yy', function(d) {
          return d.y
        })
        .attr('offX', that.offsetX)
        .attr('offY', that.offsetY)
        .attr('class', this.id + '-out-circle')
        .on('dblclick', function(node) {
          that.showNodeDetail({
            type: 'SSP',
            data: node
          })
        })
        .call(d3.drag()
          .on('start', started)
          .on('drag', dragged)
          .on('end', ended))

      // SSP的提示文字
      circle.append('svg:title')
        .text(function(node) {
          return node.id
        })

      // SSP内部的AS节点
      const ASCircle = topCircleG.selectAll('.' + this.id + '-in-circle')
        .data(force.nodes())
        .enter()
        .append('g')
        .attr('xx', function(d) {
          return d.x
        })
        .attr('yy', function(d) {
          return d.y
        })
        .attr('x', function(d) {
          const ASNodes = d.ASNodes
          for (let i = 0; i < ASNodes.length; i++) {
            // 计算AS节点以SSP节点为参照的相对位置
            const lays = (Math.floor(i / 4)) + 1
            const dushu = (i % 4) * Math.PI / (2 * lays)
            const beilv = 20 * Math.pow(lays, 1.3)
            const x = d.x + beilv * Math.cos(dushu)
            const y = d.y - beilv * Math.sin(dushu)
            const ASNode = d3.select(this)
              .append('circle')
              .attr('r', 8)
              .attr('class', that.id + '-in-circle')
              .attr('id', ASNodes[i].id)
              .attr('xx', x) // x相对距离
              .attr('yy', y) // y相对距离
              .attr('offX', that.offsetX)
              .attr('offY', that.offsetY)
              // 初次相对最近的这个'g'(this)移动，tick里移动的则是'g'
              .attr('transform', 'translate(' + x + ',' + y + ')')
              .on('dblclick', function() {
                that.showNodeDetail({
                  type: 'AS',
                  data: ASNodes[i]
                })
              })

            // AS的提示文字
            ASNode.append('svg:title')
              .text(ASNodes[i].id + ' ' + ASNodes[i].serviceName)
          }
        })

      // 设置连接线
      const edges_line = edgesG.selectAll('.provider-edge-path')
        .data(this.edges)
        .enter()
        .append('path')
        .attr('class', 'provider-edge-path')
        .attr('id', function(d, i) {
          return 'provider-edge-path-' + i
        })
        .style('pointer-events', 'none')
        .style('stroke', 'black')
        .style('stroke-width', 1)// 线条粗细
        // remind 箭头位置
        .attr('marker-end', 'url(#arrow-marker-10)')// 根据箭头标记的id号标记箭头

      // 连接线的提示文字
      edges_line.append('svg:title')
        .text(function(edge) {
          // return edge.source + '-->' + edge.target
          return edge.relationShip
        })

      // 左下角组织名
      const providerName = topCircleG.append('g')
        .append('text')
        .text(this.id)
        .attr('transform',
          'translate(20,' + (height - 20) + ')')
      function tick() {
        // SSP节点
        circle
          .attr('transform', function(d) {
            return 'translate(' + d.x + ',' + d.y + ')'
          })
          .attr('xx', function(d) {
            return d.x
          })
          .attr('yy', function(d) {
            return d.y
          })

        // AS节点
        ASCircle
          .attr('transform', function(d) {
            return 'translate(' + d.x + ',' + d.y + ')'
          })
          .attr('xx', function(d) {
            return d.x
          })
          .attr('yy', function(d) {
            return d.y
          })

        // 连接线
        edges_line.attr('d', function(d) {
          const src = $('#' + d.source)
          const tgt = $('#' + d.target)
          let srcX = src.attr('xx')
          let srcY = src.attr('yy')
          let tgtX = tgt.attr('xx')
          let tgtY = tgt.attr('yy')
          if (src.attr('r') === '8') {
            const parent = src.parent()
            srcX = parent.attr('xx') - (-srcX)
            srcY = parent.attr('yy') - (-srcY)
          }
          if (tgt.attr('r') === '8') {
            const parent = tgt.parent()
            tgtX = parent.attr('xx') - (-tgtX)
            tgtY = parent.attr('yy') - (-tgtY)
          }
          const srcR = src.attr('r')
          const tgtR = tgt.attr('r')
          const finalPoint = getSrcAndTgtPoints([srcX, srcY, srcR, tgtX, tgtY, tgtR])
          return 'M ' + finalPoint[0] + ' ' + finalPoint[1] + ' L ' + finalPoint[2] + ' ' + finalPoint[3]
        })

        this.$emit('drawlink')
      }

      function started(d) {
        if (!d3.event.active) {
          force.alphaTarget(0.8).restart() // 设置衰减系数，对节点位置移动过程的模拟，数值越高移动越快，数值范围[0，1]
        }
        d.fx = d.x
        d.fy = d.y
      }

      function dragged(d) {
        d.fx = d3.event.x
        d.fy = d3.event.y
      }

      function ended(d) {
        if (!d3.event.active) {
          force.alphaTarget(0)
        }
        d.fx = null
        d.fy = null
      }

      // [srcX, srcY, srcR, tgtX, tgtY, tgtR]
      function getSrcAndTgtPoints(origin) {
        const dx = origin[3] - origin[0]
        const dy = origin[4] - origin[1]
        const degree = Math.atan2(dy, dx)
        const cos = Math.cos(degree)
        const sin = Math.sin(degree)
        const tx = origin[3] - (cos * origin[5])
        const ty = origin[4] - (sin * origin[5])
        const sx = origin[0] - (-cos * origin[2])
        const sy = origin[1] - (-sin * origin[2])
        return [sx, sy, tx, ty]
      }
    }
  }
}
</script>

<style>
  .provider-svg {
      height: 400px;
      box-shadow: 0 1px 5px rgba(0, 0, 0, 0.2);
  }
  circle {
      fill: #d2d2d2;
      stroke: #333;
      stroke-width: 1px;
  }

    text {
        font: 12px Microsoft YaHei;
        pointer-events: none;
        text-shadow: 0 1px 0 #fff, 1px 0 0 #fff, 0 -1px 0 #fff, -1px 0 0 #fff;
    }
</style>
