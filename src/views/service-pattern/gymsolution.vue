<template>
  <div className="table-container">
    <Table
      ref="table"
      :height="tableHeight"
      :columns="solColumn"
      :data="solColumnData"
      border
    />
  </div>
</template>

<script>
export default {
  name: 'Solution',
  data() {
    return {
      tableHeight: 500,
      solColumn: [
        {
          title: '方案编号',
          key: 'sid',
          render: (h, params) => {
            return h('div', params.row.sid)
          }
        },
        {
          title: '方案详情',
          key: 'details',
          render: (h, params) => {
            return h('Table', {
              props: {
                size: 'small'
              },
              attrs: {
                columns: this.detailsColumn,
                data: params.row.details
              }
            })
          }
        },
        {
          title: '约束详情',
          key: 'cons',
          render: (h, params) => {
            return h('Table', {
              props: {
                size: 'small'
              },
              attrs: {
                columns: this.consColumn,
                data: params.row.cons
              }
            })
          }
        },
        {
          title: '用户目标',
          key: 'score',
          render: (h, params) => {
            return h('div', params.row.score)
          }
        },
        {
          title: '操作',
          key: 'action',
          render: (h, params) => {
            return h('div', [
              h('Button', {
                props: {
                  type: 'primary',
                  size: 'small'
                },
                on: {
                  click: () => {
                    console.log('查看流程', params.row.sid)
                  }
                },
                style: {
                  marginRight: '5px'
                }
              }, '查看流程'),
              h('Button', {
                props: {
                  type: 'primary',
                  size: 'small'
                },
                on: {
                  click: () => {
                    console.log('选择流程', params.row.sid)
                    alert('选择成功！')
                  }
                }
              }, '选择该流程')
            ])
          }
        }
      ],
      detailsColumn: [
        {
          title: '模型名称',
          key: 'modelName',
          render: (h, params) => {
            return h('div', params.row.modelName)
          }
        },
        {
          title: '健康情境匹配度',
          key: 'matchScore',
          render: (h, params) => {
            return h('div', `${params.row.matchScore}%`)
          }
        }
      ],
      consColumn: [
        {
          title: '目标名',
          key: 'goalName',
          render: (h, params) => {
            return h('div', params.row.goalName)
          }
        },
        {
          title: '约束名',
          key: 'constraintName',
          render: (h, params) => {
            return h('div', params.row.constraintName)
          }
        },
        {
          title: '实际值',
          key: 'value',
          render: (h, params) => {
            return h('div', params.row.value)
          }
        }
      ],
      solColumnData: [
        {
          sid: '1734773267.673839a',
          details: [
            { modelName: '哈尔滨住家保姆', matchScore: 91 },
            { modelName: '哈尔滨家庭医生', matchScore: 89 },
            { modelName: '老年慢病管理', matchScore: 100 }
          ],
          cons: [
            { goalName: '保姆服务', constraintName: '价格', value: '4000元/月' },
            { goalName: '家庭医生服务', constraintName: '价格', value: '5000元/年' },
            { goalName: '家庭医生服务', constraintName: '位置', value: '3.2km' }
          ],
          score: '价格评分:0.96  \n 服务质量评分0.95'
        },
        {
          sid: '1734773267.673839b',
          details: [
            { modelName: '哈尔滨住家保姆2', matchScore: 85 },
            { modelName: '哈尔滨家庭医生2', matchScore: 99 },
            { modelName: '心脑血管慢病管理', matchScore: 70 },
            { modelName: '健康档案管理', matchScore: 86 }
          ],
          cons: [
            { goalName: '保姆服务', constraintName: '价格', value: '4500元/月' },
            { goalName: '家庭医生服务', constraintName: '价格', value: '5500元/年' },
            { goalName: '家庭医生服务', constraintName: '位置', value: '2km' }
          ],
          score: '价格评分:0.92  \n 服务质量评分0.96'
        }
      ]
    }
  },
  mounted() {
    this.tableHeight = window.innerHeight - this.$refs.table.$el.offsetTop - 80
  }
}
</script>

<style scoped>
.table-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}
</style>
