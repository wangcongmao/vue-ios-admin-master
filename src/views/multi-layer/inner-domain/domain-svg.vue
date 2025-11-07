<template>
  <svg
    :id="id"
    class="domain-svg"
  />
</template>

<script>
import * as d3 from 'd3'
import $ from 'jquery'

export default {
  name: 'DomainSvg',
  props: {
    data: {
      type: Object,
      require: true
    },
    id: {
      type: String,
      require: true
    }
  },
  data() {
    return {
      nodes: [],
      edges: [],
      offsetX: 0,
      offsetY: 0
    }
  },
  watch: {
    data: {
      handler(value) {
        this.nodes = value.nodes
        this.edges = value.edges
        this.draw_svg()
      }
    }
  },
  mounted() {
    this.nodes = this.data.nodes
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
      const width = $(selector).width()
      const height = $(selector).height()
      const offset = $(selector).offset()
      this.offsetX = offset.left
      this.offsetY = offset.top
      return {
        svg,
        width,
        height
      }
    },
    draw_svg() {
      const { svg, width, height } = this.initSvg()
      const that = this

      const force = d3.forceSimulation()
        .force('link', d3.forceLink())
        .force('charge', d3.forceManyBody())
        .force('center', d3.forceCenter())

      // 生成节点数据
      force.nodes(this.nodes)
        .on('tick', tick.bind(that))// 这个函数很重要，后面给出具体实现和说明
      // 生成边数据
      force.force('link')
        .id(d => d.id)
        .links(this.edges)
        .distance(180)
      // 设置图形的中心位置
      force.force('center')
        .x(width / 2)
        .y(height / 2)

      // 设置连接线
      const edges_line = svg.selectAll('.domain-edge-path')
        .data(this.edges)
        .enter()
        .append('path')
        .attr('d', function(d) {
          return 'M ' + d.source.x + ' ' + d.source.y + ' L ' + d.target.x + ' ' + d.target.y
        })
        .attr('class', 'domain-edge-path')
        .attr('id', function(d, i) {
          return 'domain-edge-path-' + i
        })
        .style('pointer-events', 'none')
        .style('stroke', 'black')
        .style('stroke-width', 1)// 线条粗细
        .attr('marker-end', 'url(#arrow-marker-35)')// 根据箭头标记的id号标记箭头

      // 设置线条上的文字
      const edges_text = svg.append('g').selectAll('.domain-edge-label')
        .data(this.edges)
        .enter()
        .append('text')
        .style('pointer-events', 'none')
        .attr('class', 'domain-edge-label')
        .attr('id', function(d, i) {
          return 'domain-edge-label-' + i
        })
        .attr('dx', 40)
        .attr('dy', 0)
      edges_text.append('textPath')
        .attr('xlink:href', function(d, i) {
          return '#domain-edge-path-' + i
        })
        .style('pointer-events', 'none')
        .text(function(d) {
          // return d.source.id + '-->' + d.target.id
          return d.relationShip
        })

      // 绘制节点
      const circle = svg.append('g').selectAll('.domain-circle')
        .data(force.nodes())// 表示使用force.nodes数据
        .enter()
        .append('circle')
        .attr('r', 30)// 设置圆圈半径
        .attr('id', function(d) {
          return d.id
        })
        .attr('class', 'domain-circle')
        .attr('offX', that.offsetX)
        .attr('offY', that.offsetY)
        .on('dblclick', function(node) {
          that.showNodeDetail({
            type: 'DSP',
            data: node
          })
        })
        .call(d3.drag()
          .on('start', started)
          .on('drag', dragged)
          .on('end', ended))

      // 节点上文字
      const text = svg.append('g').selectAll('text')
        .data(force.nodes())
        .enter()
        .append('text')
        .attr('dy', '.35em')
        .attr('text-anchor', 'middle')// 在圆圈中加上数据
        .attr('x', function(d) {
          const re_en = /[a-zA-Z0-9]+/g
          // 如果是全英文，不换行
          if (d.id.match(re_en)) {
            d3.select(this).append('tspan')
              .attr('x', 0)
              .attr('y', 2)
              .text(function() {
                return d.id
              })
            // 如果小于四个字符，不换行
          } else if (d.id.length <= 4) {
            d3.select(this).append('tspan')
              .attr('x', 0)
              .attr('y', 2)
              .text(function() {
                return d.id
              })
          } else {
            const top = d.id.substring(0, 4)
            const bot = d.id.substring(4, d.id.length)

            d3.select(this).text(function() {
              return ''
            })

            d3.select(this).append('tspan')
              .attr('x', 0)
              .attr('y', -7)
              .text(function() {
                return top
              })

            d3.select(this).append('tspan')
              .attr('x', 0)
              .attr('y', 10)
              .text(function() {
                return bot
              })
          }
        })

      // 左上角领域名
      const domainName = svg.append('g')
        .append('text')
        .text(this.id)
        .attr('transform', 'translate(20,20)')
      function tick() {
        // 节点
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
        // 节点文字
        text
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
        edges_line
          .attr('d', function(d) {
            const path = 'M ' + d.source.x + ' ' + d.source.y + ' L ' + d.target.x + ' ' + d.target.y
            return path
          })
        // 连接线上文字
        edges_text
          .attr('transform', function(d, i) {
            if (d.target.x < d.source.x) {
              const bbox = this.getBBox()
              const rx = bbox.x + bbox.width / 2
              const ry = bbox.y + bbox.height / 2
              return 'rotate(180 ' + rx + ' ' + ry + ')'
            } else {
              return 'rotate(0)'
            }
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
    }
  }
}
</script>

<style>
  .domain-svg {
      height: 400px;
      box-shadow: 0 1px 5px rgba(0, 0, 0, 0.2);
  }

  .domain-circle {
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
