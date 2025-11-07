<template>
  <div class="layout">
    <!--    <div class="app-container">-->
    <!--      <change-node ref="change-node" @myMounted="createFunction"></change-node>-->
    <!--    </div>-->

    <Layout>
      <Content :style="{padding: '0 50px'}">
        <Card title="查询">
          <Table
            ref="table"
            :columns="rpspColumn"
            :data="search"
            border
          />
          <Table
            ref="table"
            :row-class-name="rowClassName"
            :columns="rpspDataColumn"
            :data="searchData"
            border
          />
          <div style="margin: 10px;overflow: hidden">
            <Button @click="addRow()">增加</Button>
            <Button @click="addmm1 = true">构造偶对表</Button>
            <Button @click="updatemm1 = true">更新偶对表</Button>
            <div style="float: right;">
              <Page :total="searchAllData.length" :page-size="pageSize" show-total :current="1" show-elevator size="small" @on-change="changePage" />
            </div>
          </div>
        </Card>
        <Modal
          v-model="addmm1"
          title="构造偶对表"
          @on-ok="addmm()"
          @on-cancel="cancel"
        >
          <p>注意：构造偶对表会删除之前偶对表中的数据</p>
          <p>请选择构造的时间范围</p>
          <Col span="12" />
          <DatePicker type="daterange" placement="bottom-end" placeholder="Select date" style="width: 200px" split-panels @on-change="adddate" />
          </Col>
        </Modal>

        <Modal
          v-model="updatemm1"
          title="更新偶对表"
          @on-ok="updatemm()"
          @on-cancel="cancel"
        >
          <p>注意：更新偶对表无法恢复之前的数据</p>
          <p>请选择更新的时间范围</p>
          <Col span="12" />
          <DatePicker type="daterange" placement="bottom-end" placeholder="Select date" style="width: 200px" split-panels @on-change="updatedate" />
          </Col>
        </Modal>

        <Modal
          v-model="modal1"
          width="800"
          title="背景"
          @on-ok="ok"
          @on-cancel="cancel"
        >
          <!--改这里-->
          <Table
            ref="table"
            :columns="contextColumn"
            :data="contextData"
            stripe
            border
          />
          <Button @click="addcontext()">增加</Button>
          <!--<p>{{edit_context.context}}</p>-->
        </Modal>
        <Modal
          v-model="modal2"
          width="800"
          title="背景"
          @on-ok="ok1"
          @on-cancel="cancel"
        >
          <!--改这里-->
          <Table
            ref="table"
            :columns="contextColumn1"
            :data="contextData1"
            stripe
            border
          />
          <Button @click="addcontext1()">增加</Button>
          <Button @click="clearcontext1()">清空</Button>
          <!--<p>{{edit_context.context}}</p>-->
        </Modal>

        <Modal
          v-model="modal3"
          title="选择需求模型和服务模式"
          @on-ok="okp"
          @on-cancel="cancel"
        >
          <!--改这里-->
          服务模式
          <!--<Select v-model="model1" style="width:200px">
            <Option v-for="item in spList" :value="item.value" :key="item.value"></Option>
          </Select>-->
          <Input v-model="model1" style="width:150px" />
          <Button @click="searchsp()">查询</Button>{{ model1_id }}<br>
          需求模型
          <Input v-model="model2" style="width:150px" />
          <Button @click="searchrp()">查询</Button>{{ model2_id }}<br>
          <Table
            ref="table"
            :columns="pattern"
            :data="patternData"
            stripe
            border
          />
          <!--<p>{{edit_context.context}}</p>-->
        </Modal>
      </Content>
    </Layout>
  </div>
</template>

<script>
// import ChangeNode from '@/components/changeNode'
export default {
  name: 'TableMain',
  // components: { ChangeNode },
  data() {
    return {
      nodeInfos: [],
      currentNode: null,
      firstCreate: true,
      // sp_url: "http://10.147.19.68:8088/",
      // node30004_url: "http://10.147.19.68:30004/",
      // sp_algorithm_url: "http://al.ngrok2.xiaomiqiu.cn/",
      sp_url: null,
      node30004_url: null,
      sp_algorithm_url: null,
      require_url: '/api/get-all-rps',
      add_date: [],
      update_date: [],
      pageSize: 5,
      startPage: 0,
      searchAllData: [],
      index: 0,
      model1: '',
      model1_id: '',
      model1_name: '',
      sp: true,
      update: false,
      model2: '',
      model2_id: '',
      model2_name: '',
      modal1: false,
      modal2: false,
      modal3: false,
      addmm1: false,
      updatemm1: false,
      rpAllIdNameList: [],
      patternData: [],
      pattern: [
        {
          title: 'ID',
          key: 'key',
          render: (h, params) => {
            return h('div', params.row.key)
          }
        },
        {
          title: '描述',
          key: 'value',
          render: (h, params) => {
            return h('div', params.row.value)
          }
        },
        {
          title: '操作',
          key: 'action',
          render: (h, params) => {
            return h('Button', {
              props: {
                type: params.row.$isEdit ? 'warning' : 'info',
                size: 'small',
                icon: ''
              },
              style: {
                marginRight: '5px'
              },
              on: {
                click: () => {
                  if (this.sp) {
                    this.model1_id = params.row.key
                    this.model1_name = params.row.name
                  } else {
                    this.model2_id = params.row.key
                    this.model2_name = params.row.name
                  }
                }
              }
            }, '选择')
          }
        }],
      // 用来接收后台传输的数据
      search: [{
        $isEdit: false,
        rpName: '',
        spName: '',
        times: '',
        p: '',
        context: ''
      }],
      contextData: [],
      contextData1: [],
      searchcontext: JSON.stringify({}),
      // searchData: [],

      nowdata: [],
      contextColumn: [
        {
          title: 'key',
          key: 'key',
          render: (h, params) => {
            if (params.row.$isEdit) {
              return h('Input', {
                props: {
                  value: params.row.key
                },
                on: {
                  input: function(event) {
                    params.row.key = event
                  }
                }
              })
            } else {
              return h('div', params.row.key)
            }
          }
        },
        {
          title: 'value',
          key: 'value',
          render: (h, params) => {
            function calc_len(value_list) {
              const list = []
              for (let i = 0; i < value_list.length; i++) {
                list.push([h('Input', {
                  props: {
                    value: value_list[i]
                  },
                  style: {
                    width: '80%'
                  },
                  on: {
                    input: function(event) {
                      value_list[i] = event
                    }
                  }
                }), h('Icon', { /* 删除*/
                  props: {
                    type: 'md-remove',
                    size: '18'
                  },
                  on: {
                    click: () => {
                      params.row.value_list.splice(i, 1)
                      /* ???*/
                      params.row.type = '1'
                      params.row.type = '枚举'
                    }
                  }
                })])
              }
              return list
            }
            function edittype(type) {
              if (type === '枚举') {
                if (params.row.value_list === undefined) {
                  params.row.value_list = ['']
                }
                return h('div', [h('div', calc_len(params.row.value_list)), h('Icon', {
                  props: {
                    type: 'md-add',
                    size: '18'
                  },
                  on: {
                    click: () => {
                      params.row.value_list.push('')
                      /* ???*/
                      params.row.type = '1'
                      params.row.type = '枚举'
                    }
                  }
                })])
              } else if (type === '范围') {
                return h('div', ['min', h('Input', {
                  props: {
                    value: params.row.value_left
                  },
                  on: {
                    input: function(event) {
                      params.row.value_left = event
                    }
                  }
                }), 'max', h('Input', {
                  props: {
                    value: params.row.value_right
                  },
                  on: {
                    input: function(event) {
                      params.row.value_right = event
                    }
                  }
                })])
              } else if (type === '逻辑') {
                const list = [
                  {
                    value: '是'
                  }, {
                    value: '否'
                  }
                ]
                return h('Select', {
                  props: { transfer: true },
                  on: {
                    'on-change': (event) => {
                      params.row.value = event
                    }
                  }
                }, list.map((item) => {
                  return h('Option', {
                    props: {
                      value: item.value,
                      label: item.value
                    }
                  })
                }))
              }
            }

            if (params.row.$isEdit) {
              return h('div', [edittype(params.row.type)])
            } else {
              return h('div', params.row.value)
            }
          }
        },
        {
          title: '类型',
          key: 'type',
          render: (h, params) => {
            const contexttype = [
              {
                value: '范围'
              }, {
                value: '枚举'
              }, {
                value: '逻辑'
              }
            ]
            if (params.row.$isEdit) {
              return h('div', [h('Select', {
                props: { transfer: true },
                on: {
                  'on-change': (event) => {
                    /* this.handleType(params.row, event);*/
                    params.row.type = event
                  }
                }
              }, contexttype.map((item) => {
                return h('Option', {
                  props: {
                    value: item.value,
                    label: item.value
                  }
                })
              }))])
            } else {
              return h('div', params.row.type)
            }
          }
        },
        {
          title: '操作',
          key: 'action',
          render: (h, params) => {
            return h('div', [
              h('Button', {
                props: {
                  type: params.row.$isEdit ? 'warning' : 'info',
                  size: 'small',
                  icon: ''
                },
                style: {
                  marginRight: '5px'
                },
                on: {
                  click: () => {
                    if (params.row.$isEdit) {
                      if (params.row.type === '范围') {
                        if ((isNaN(parseFloat(params.row.value_left.toString()))) || (isNaN(parseFloat(params.row.value_right.toString()))) || (parseInt(params.row.value_left.toString()) > parseInt(params.row.value_right.toString()))) {
                          if (params.row.key === '时间') {
                            /* 判断时间合法*/
                            params.row.value = params.row.value_left.toString() + '~' + params.row.value_right.toString()
                          } else alert('请输入正确的范围')
                        } else {
                          params.row.value = params.row.value_left.toString() + '~' + params.row.value_right.toString()
                        }
                      } else if (params.row.type === '枚举') {
                        params.row.value = params.row.value_list.map(function(c) {
                          return c
                        }).join(',')
                      } else if (params.row.type === '逻辑') {
                      }
                      this.handleSave(params.row)
                      this.contextData[params.index]['type'] = params.row.type
                      this.contextData[params.index]['key'] = params.row.key
                      this.contextData[params.index]['value'] = params.row.value
                    } else {
                      if (params.row.value.search('~') > -1) {
                        params.row.type = '范围'
                        params.row.value_left = params.row.value.substr(0, params.row.value.search('~'))
                        params.row.value_right = params.row.value.substr(params.row.value.search('~') + 1, params.row.value.length)
                      } else if (params.row.value.search(',') > -1 || (params.row.value !== '是') && (params.row.value !== '否')) {
                        params.row.type = '枚举'
                        params.row.value_list = params.row.value.split(',')
                      } else params.row.type = '逻辑'
                      this.handleEdit(params.row)
                    }
                  }
                }
              }, params.row.$isEdit ? '保存' : '修改'),
              h('Poptip', {
                props: {
                  confirm: true,
                  title: '是否要删除此字段？',
                  transfer: true
                },
                on: {
                  'on-ok': () => {
                    /* this.$ajax.post("http://10.147.19.68:8088/delMap",{
                                      rpId:params.row.rpId,
                                      spId:params.row.spId,
                                      p:params.row.p,
                                      context:params.row.context
                                  })*/
                    this.contextData.splice(params.row._index, 1)
                    // 删除逻辑
                  }
                }
              }, [
                h('Button', {
                  props: {
                    type: 'error',
                    size: 'small'
                  },
                  style: {
                    marginRight: '5px'
                  }
                }, '删除')
              ])
            ])
          }
        }],

      contextColumn1: [
        {
          title: 'key',
          key: 'key',
          render: (h, params) => {
            if (params.row.$isEdit) {
              return h('Input', {
                props: {
                  value: params.row.key
                },
                on: {
                  input: function(event) {
                    params.row.key = event
                  }
                }
              })
            } else {
              return h('div', params.row.key)
            }
          }
        },
        {
          title: 'value',
          key: 'value',
          render: (h, params) => {
            function calc_len(value_list) {
              const list = []
              for (let i = 0; i < value_list.length; i++) {
                list.push([h('Input', {
                  props: {
                    value: value_list[i]
                  },
                  style: {
                    width: '80%'
                  },
                  on: {
                    input: function(event) {
                      value_list[i] = event
                    }
                  }
                }), h('Icon', { /* 删除*/
                  props: {
                    type: 'md-remove',
                    size: '18'
                  },
                  on: {
                    click: () => {
                      params.row.value_list.splice(i, 1)
                      /* ???*/
                      params.row.type = '1'
                      params.row.type = '枚举'
                    }
                  }
                })])
              }
              return list
            }
            function edittype(type) {
              if (type === '枚举') {
                if (params.row.value_list === undefined) {
                  params.row.value_list = ['']
                }
                return h('div', [h('div', calc_len(params.row.value_list)), h('Icon', {
                  props: {
                    type: 'md-add',
                    size: '18'
                  },
                  on: {
                    click: () => {
                      params.row.value_list.push('')
                      /* ???*/
                      params.row.type = '1'
                      params.row.type = '枚举'
                    }
                  }
                })])
              } else if (type === '范围') {
                return h('div', [h('Input', {
                  props: {
                    value: params.row.value_left
                  },
                  on: {
                    input: function(event) {
                      params.row.value_left = event
                    }
                  }
                }), h('Input', {
                  props: {
                    value: params.row.value_right
                  },
                  on: {
                    input: function(event) {
                      params.row.value_right = event
                    }
                  }
                })])
              } else if (type === '逻辑') {
                const list = [
                  {
                    value: '是'
                  }, {
                    value: '否'
                  }
                ]
                return h('Select', {
                  props: { transfer: true },
                  on: {
                    'on-change': (event) => {
                      params.row.value = event
                    }
                  }
                }, list.map((item) => {
                  return h('Option', {
                    props: {
                      value: item.value,
                      label: item.value
                    }
                  })
                }))
              }
            }

            if (params.row.$isEdit) {
              return h('div', [edittype(params.row.type)])
            } else {
              return h('div', params.row.value)
            }
          }
        },
        {
          title: '类型',
          key: 'type',
          render: (h, params) => {
            const contexttype = [
              {
                value: '范围'
              }, {
                value: '枚举'
              }, {
                value: '逻辑'
              }
            ]
            if (params.row.$isEdit) {
              return h('div', [h('Select', {
                props: { transfer: true },
                on: {
                  'on-change': (event) => {
                    /* this.handleType(params.row, event);*/
                    params.row.type = event
                  }
                }
              }, contexttype.map((item) => {
                return h('Option', {
                  props: {
                    value: item.value,
                    label: item.value
                  }
                })
              }))])
            } else {
              return h('div', params.row.type)
            }
          }
        },
        {
          title: '操作',
          key: 'action',
          render: (h, params) => {
            return h('div', [
              h('Button', {
                props: {
                  type: params.row.$isEdit ? 'warning' : 'info',
                  size: 'small',
                  icon: ''
                },
                style: {
                  marginRight: '5px'
                },
                on: {
                  click: () => {
                    if (params.row.$isEdit) {
                      if (params.row.type === '范围') {
                        if ((isNaN(parseFloat(params.row.value_left.toString()))) || (isNaN(parseFloat(params.row.value_right.toString()))) || (parseInt(params.row.value_left.toString()) > parseInt(params.row.value_right.toString()))) {
                          if (params.row.key === '时间') {
                            /* 判断时间合法*/
                            params.row.value = params.row.value_left.toString() + '~' + params.row.value_right.toString()
                          } else alert('请输入正确的范围')
                        } else {
                          params.row.value = params.row.value_left.toString() + '~' + params.row.value_right.toString()
                        }
                      } else if (params.row.type === '枚举') {
                        params.row.value = params.row.value_list.map(function(c) {
                          return c
                        }).join(',')
                      } else if (params.row.type === '逻辑') {
                      }
                      this.handleSave(params.row)
                      this.contextData1[params.index]['type'] = params.row.type
                      this.contextData1[params.index]['key'] = params.row.key
                      this.contextData1[params.index]['value'] = params.row.value
                    } else {
                      if (params.row.value.search('~') > -1) {
                        params.row.type = '范围'
                        params.row.value_left = params.row.value.substr(0, params.row.value.search('~'))
                        params.row.value_right = params.row.value.substr(params.row.value.search('~') + 1, params.row.value.length)
                      } else if (params.row.value.search(',') > -1 || (params.row.value !== '是') && (params.row.value !== '否')) {
                        params.row.type = '枚举'
                        params.row.value_list = params.row.value.split(',')
                      } else params.row.type = '逻辑'
                      this.handleEdit(params.row)
                    }
                  }
                }
              }, params.row.$isEdit ? '保存' : '修改'),
              h('Poptip', {
                props: {
                  confirm: true,
                  title: '是否要删除此字段？',
                  transfer: true
                },
                on: {
                  'on-ok': () => {
                    /* this.$ajax.post("http://10.147.19.68:8088/delMap",{
                                      rpId:params.row.rpId,
                                      spId:params.row.spId,
                                      p:params.row.p,
                                      context:params.row.context
                                  })*/
                    this.contextData1.splice(params.row._index, 1)
                    // 删除逻辑
                  }
                }
              }, [
                h('Button', {
                  props: {
                    type: 'error',
                    size: 'small'
                  },
                  style: {
                    marginRight: '5px'
                  }
                }, '删除')
              ])
            ])
          }
        }],
      // easy-table-vue的列规范

      // iview的列命名规范
      rpspDataColumn: [
        {
          title: ' ',
          key: 'rpName',
          render: (h, params) => {
            let update_tag = ''
            if (params.row.renew === 'new') {
              update_tag = '新增'
            } else if (params.row.renew === 'edit') {
              update_tag = '修改'
            }
            return h('div', [params.row.rpName, (this.update && update_tag !== '') ? h('Tag', {
              props: {
                color: 'orange'
              }
            }, params.row.renew) : ''])
          }
        }, {
          title: ' ',
          key: 'spName',
          render: (h, params) => {
            return h('div', params.row.spName)
          }
        }, {
          title: ' ',
          key: 'context',
          render: (h, params) => {
            // @h 是一个构造器，可以使用其创建新组建
            // @params 是表格的数据，params.row可以获取当前行的数据{
            const context = JSON.parse(params.row.context)
            const row_contextlist = []
            for (const i in context) {
              row_contextlist.push(h('Tag', {
                props: {
                  color: 'orange'
                }
              }, i + ' : ' + context[i]))
              row_contextlist.push(h('br'))
            }
            return params.row.$isEdit ? h('Button', {
              props: {
                type: 'primary',
                size: 'small'
              },
              on: {
                'click': () => {
                  const context = JSON.parse(params.row.context)
                  let type = ''
                  this.nowdata = params.row
                  this.contextData = []
                  for (var key in context) {
                    if (context[key].search('~') > -1) {
                      type = '范围'
                    } else if (context[key].search(',') > -1 || (context[key] !== '是') && (context[key] !== '否')) {
                      type = '枚举'
                    } else type = '逻辑'
                    this.contextData.push({
                      $isEdit: false,
                      key: key,
                      value: context[key],
                      type: type
                    })
                  }
                  this.modal1 = true
                }
              },
              style: {
                marginRight: '5px'
              }
            }, '编辑') : h('div', {
              style: {
                fontSize: '100%'
              }
            }, row_contextlist)
            /* if (params.row.$isEdit) {
                return h("Select", {
                  props: {transfer:true},
                  on: {
                    "on-change": (event) => {
                      params.row.context = event
                    }
                  }
                }, this.context.map((item) => {
                  return h('Option', {
                    props: {
                      value: item.value,
                      label: item.value
                    }
                  })
                }))
              } else return h('div', params.row.context);*/
          }
        },
        {
          title: ' ',
          key: 'p',
          render: (h, params) => {
            return h('div', params.row.p)
          }
        }, {
          title: ' ',
          key: 'times',
          render: (h, params) => {
            if (params.row.$isEdit) {
              return h('Input', {
                props: {
                  value: params.row.times
                },
                on: {
                  input: function(event) {
                    params.row.times = event
                  }
                }
              })
            } else {
              return h('div', params.row.times)
            }
          }
        },
        {
          title: ' ',
          key: 'action',
          width: 200,
          render: (h, params) => {
            return h('div', [
              h('Button', {
                props: {
                  type: params.row.$isEdit ? 'warning' : 'info',
                  size: 'small',
                  icon: ''
                },
                style: {
                  marginRight: '5px'
                },
                on: {
                  click: () => {
                    console.log(this.now)
                    if (params.row.$isEdit) {
                      console.log(params.row)
                      if (params.row.new) {
                        this.$ajax.post(this.sp_url + 'insertrecord', {
                          rpId: params.row.rpId,
                          spId: params.row.spId,
                          times: params.row.times,
                          context: params.row.context,
                          p: 1
                        }).catch(function(error) {
                          console.log(error)
                        })
                      } else {
                        console.log(params.row._index)
                        console.log(this.index)
                        this.$ajax.post(this.sp_url + 'delrecord', {
                          rpId: this.searchData[params.row._index].olddata.rpId,
                          spId: this.searchData[params.row._index].olddata.spId,
                          times: this.searchData[params.row._index].olddata.times,
                          context: this.searchData[params.row._index].olddata.context,
                          p: this.searchData[params.row._index].olddata.p
                        }).then(res => {
                          this.$ajax.post(this.sp_url + 'insertrecord', {
                            rpId: params.row.rpId,
                            spId: params.row.spId,
                            times: params.row.times,
                            context: params.row.context,
                            p: params.row.p
                          })
                        }).catch(function(error) {
                          console.log(error)
                        })
                      }
                      this.handleSave(params.row)
                      this.searchData[params.row._index].$isEdit = false
                    } else {
                      console.log(params.row)
                      this.searchData[params.row._index].olddata = {
                        rpId: params.row.rpId,
                        spId: params.row.spId,
                        times: params.row.times,
                        context: params.row.context,
                        p: params.row.p
                      }
                      this.handleEdit(params.row)
                      this.searchData[params.row._index].$isEdit = true
                    }
                  }
                }
              }, params.row.$isEdit ? '保存' : '修改'),
              h('Poptip', {
                props: {
                  confirm: true,
                  title: '是否要删除此字段？',
                  transfer: true
                },
                on: {
                  'on-ok': () => {
                    console.log(params.row)
                    this.$ajax.post(this.sp_url + 'delrecord', {
                      rpId: params.row.rpId,
                      spId: params.row.spId,
                      context: params.row.context
                    })
                    this.searchAllData.splice(params.row._index, 1)
                    // 删除逻辑
                  }
                }
              }, [
                h('Button', {
                  props: {
                    type: 'error',
                    size: 'small'
                  },
                  style: {
                    marginRight: '5px'
                  }
                }, '删除')
              ]), params.row.$isEdit ? h('Button', {
                props: {
                  type: 'info',
                  size: 'small',
                  icon: ''
                },
                style: {
                  marginRight: '5px'
                },
                on: {
                  click: () => {
                    if (params.row.$isEdit) {
                      this.modal3 = true
                      this.index = params.row._index
                      this.model1_id = params.row.spId
                      this.model1_name = params.row.spName
                      this.model2_id = params.row.rpId
                      this.model2_name = params.row.rpName
                    }
                  }
                }
              }, '设置模式') : ''
            ])
          }
        }],
      rpspColumn: [
        {
          title: '需求模型',
          key: 'rpName',

          render: (h, params) => {
            return h('Input', {
              props: {
                value: params.row.rpName
              },
              on: {
                input: function(event) {
                  params.row.rpName = event
                }
              }
            })
          }
        },
        {
          title: '服务模式',
          key: 'spName',
          render: (h, params) => {
            return h('Input', {
              props: {
                value: params.row.spName
              },
              on: {
                input: function(event) {
                  params.row.spName = event
                }
              }
            })
          }
        }, {
          title: '匹配情景',
          key: 'context',
          render: (h, params) => {
            const contextlist = []
            for (let i = 0; i < this.contextData1.length; i++) {
              contextlist.push(h('Tag', {
                props: {
                  color: 'orange'
                }
              }, this.contextData1[i]['key'] + ' : ' + this.contextData1[i]['value']))
              contextlist.push(h('br'))
            }
            console.log('contextlist', contextlist)
            return [h('div', {
              style: {
                fontSize: '100%'
              }
            }, contextlist)]
          }
        }, {
          title: '匹配度',
          key: 'p',
          render: (h, params) => {
            if (params.row.$isEdit) {
              params.row.p = 1
            }
          }
        }, {
          title: '使用次数',
          key: 'times',
          render: (h, params) => {
            if (params.row.$isEdit) {
              params.row.times = 1
            }
          }
        },
        {
          title: '操作',
          key: 'action',
          width: 200,
          render: (h, params) => {
            return h('div', [
              h('Button', {
                props: {
                  type: params.row.$isEdit ? 'warning' : 'info',
                  size: 'small',
                  icon: ''
                },
                style: {
                  marginRight: '5px'
                },
                on: {
                  click: () => {
                    var rpIdNameList = []
                    /* var rpIdNameList = [
                                              {"rpId":"1", "rpName":"rp1"},
                                              {"rpId":"2", "rpName":"rp2"},
                                              {"rpId":"3", "rpName":"rp3"},
                                              {"rpId":"4", "rpName":"rp4"}
                                              ];*/

                    for (var i = 0; i < this.rpAllIdNameList.length; i++) {
                      if ((this.rpAllIdNameList[i].rpName.search(params.row.rpName)) !== -1 || (params.row.rpName.length === 0)) {
                        rpIdNameList.push({
                          'rpId': this.rpAllIdNameList[i].rpId,
                          'rpName': this.rpAllIdNameList[i].rpName
                        })
                      }
                    }
                    console.log(rpIdNameList)
                    let spField = ''
                    if (params.row.rpName !== undefined && params.row.rpName !== '') {
                      spField = 'test'
                    }
                    if (this.contextData1.length !== 0) {
                      spField = 'test'
                    }
                    this.$ajax.post(this.sp_url + 'findspbyall', {
                      spId: '',
                      spName: params.row.spName,
                      spFunc: '',
                      spField: spField
                    }).then(res => {
                      var datamap = []
                      for (var i = 0; i < rpIdNameList.length; i++) {
                        datamap.push([])
                        for (var j = 0; j < res.data.length; j++) {
                          datamap[i].push({
                            'rpId': rpIdNameList[i].rpId,
                            'rpName': rpIdNameList[i].rpName,
                            'spId': res.data[j].spId,
                            'spName': res.data[j].spName
                          })
                        }
                      }
                      var that = this
                      this.searchAllData = []
                      datamap.forEach(function(d1, i) {
                        d1.forEach((d2, j) => {
                          that.$ajax.post(that.sp_url + 'findtimesandp', {
                            rpId: d2.rpId,
                            spId: d2.spId,
                            context: that.searchcontext
                          }).then(res => {
                            for (var k = 0; k < res.data.length; k++) {
                              that.searchAllData.push({
                                spId: d2.spId,
                                spName: datamap[i][j].spName,
                                rpId: d2.rpId,
                                rpName: datamap[i][j].rpName,
                                context: res.data[k].context,
                                times: res.data[k].times,
                                p: res.data[k].p,
                                renew: res.data[k].renew
                              })
                            }
                          })
                        })
                      })
                    })
                  }
                }
              }, '查询'), h('Button', {
                props: {
                  type: 'primary',
                  size: 'small'
                },
                on: {
                  'click': () => {
                    this.modal2 = true
                  }
                },
                style: {
                  marginRight: '5px'
                }
              }, '编辑匹配情景')
            ])
          }
        }],
      rpList: [],
      spList: [],
      context: []
      // EChart数据列

    }
  },
  computed: {
    searchData: function() {
      if (this.searchAllData.length <= this.pageSize) {
        return this.searchAllData
      } else {
        return this.searchAllData.slice(this.startPage, this.startPage + this.pageSize)
      }
    }
  },
  created() {
    // this.getAllConnectedNodes()
    // 在created函数中使用axios的get请求向后台获取用户信息数据

    // this.$ajax(this.sp_url + 'findcontext').then(res => {
    //     let that = this
    //     that.context = [{value:" "}]
    //     res.data.forEach(data=>{
    //         that.context.push({
    //             value:data
    //         })
    //     })
    //     console.log("splist",this.context)
    // }).catch(function (error) {
    //     console.log(error);
    // });
    this.$ajax(`${process.env.VUE_APP_IOS_URL}/module/addrs`).then(res => {
      const urls = res.data
      this.sp_url = urls['spAddr'] + '/'
      this.node30004_url = urls['rpAddr'] + '/'
      this.sp_algorithm_url = urls['spAlgorithmAddr'] + '/'
      console.log('sp_url', this.sp_url)
      console.log('node30004_url', this.node30004_url)
      console.log('sp_algorithm_url', this.sp_algorithm_url)
      return 1
    }).then(() => {
      this.createFunction()
    })
  },
  methods: {
    createFunction() {
      {
        // if(!this.firstCreate){
        //   return
        // }
        this.firstCreate = false
        console.log(this.node30004_url)
        console.log(this.sp_url)
        this.$ajax(this.node30004_url + 'api/get-all-rps').then(res => {
          const that = this
          that.rpList = [{ value: ' ' }]
          res.data.forEach(data => {
            that.rpList.push({
              value: data.info.name
            })
            that.rpAllIdNameList.push({
              'rpId': data.info.rpId,
              'rpName': data.info.name,
              'rpDescription': data.info.description
            })
          })
          console.log('rplist', this.rpList)
          console.log('rpAllIdNameList', this.rpAllIdNameList)
        }).catch(function(error) {
          console.log(error)
        })

        this.$ajax(this.sp_url + 'findsp').then(res => {
          const that = this
          that.spList = [{ value: ' ' }]
          res.data.forEach(data => {
            that.spList.push({
              value: data
            })
          })
          console.log('splist', this.spList)
        }).catch(function(error) {
          console.log(error)
        })
      }
    },
    getAllConnectedNodes() {
      const url = process.env.VUE_APP_NODE_ADMIN_URL + '/node/info'
      console.log(url)
      this.axios({
        method: 'get',
        url: url,
        async: true,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }).then(res => {
        this.nodeInfos = res.data.filter((item) => {
          return item['status'] === 'CONNECTED' && item['id'] != 'center'
        })
        // 默认第一个显示的为center节点
        this.currentNode = [this.nodeInfos[0]]
        this.updateRequestUrl()
      })
    },
    updateRequestUrl() {
      console.log(this.currentNode)
      const url = 'http://' + this.currentNode[0]['ip'] + '/module/spAddrs'
      console.log('updateRequestUrl' + url)
      this.$ajax({
        method: 'get',
        url: url,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }).then(res => {
        console.log('当前sp_url: ' + this.sp_url)
        console.log('当前node30004_url: ' + this.node30004_url)
        console.log('当前sp_algorithm_url: ' + this.sp_algorithm_url)
      }).then(res => {

      })
    },
    // 处理下拉菜单切换
    handleNodeChange(command) {
      console.log(command)
      for (let i = 0; i < this.nodeInfos.length; i++) {
        if (this.nodeInfos[i]['id'] === command) {
          this.currentNode = [this.nodeInfos[i]]
          this.updateRequestUrl()
        }
      }
    },
    // 点击了修改按钮

    handleEdit(row) {
      this.$set(row, '$isEdit', true)
    },
    // 点击了保存按钮
    handleSave(row) {
      this.$set(row, '$isEdit', false)
    },
    handleType(row, event) {
      this.$set(row, 'type', event)
    },
    addmm() {
      this.$ajax.get(this.sp_algorithm_url + 'api/bmm?past=' + this.add_date[0] + '&now=' + this.add_date[1]).then(res => {
        if (res.data.number > 0) {
          alert('偶对表构造成功')
        } else {
          alert('偶对表构造失败，日期内没有日志')
        }
      })
    },
    updatemm() {
      this.$ajax.get(this.sp_algorithm_url + 'api/umm?past=' + this.update_date[0] + '&now=' + this.update_date[1]).then(res => {
        if (res.data.number > 0) {
          alert('偶对表更新成功')
        } else {
          alert('偶对表更新失败，日期内没有日志')
        }
        this.update = true
      })
    },
    addRow() {
      console.log(this.searchData)
      this.searchAllData.push({
        $isEdit: false,
        rpId: '',
        rpName: '',
        spId: '',
        spName: '',
        times: '',
        p: '',
        context: '{}',
        new: true
      })
    },
    addcontext() {
      this.contextData.push({
        $isEdit: false,
        key: '',
        value: '',
        type: ''
      })
    },
    addcontext1() {
      this.contextData1.push({
        $isEdit: false,
        key: '',
        value: '',
        type: ''
      })
    },
    clearcontext1() {
      this.contextData1 = []
    },
    ok1() {
      this.searchcontext = {}
      for (var i in this.contextData1) {
        this.searchcontext[this.contextData1[i]['key']] = this.contextData1[i]['value']
      }
      this.searchcontext = JSON.stringify(this.searchcontext)
      console.log(this.searchcontext)
      this.$Message.info('保存成功')
    },
    ok() {
      var temp = {}
      for (var i in this.contextData) {
        temp[this.contextData[i]['key']] = this.contextData[i]['value']
      }
      temp = JSON.stringify(temp)

      this.searchData[this.nowdata._index].context = temp
      console.log(this.searchData)
      this.$Message.info('保存成功')
    },
    cancel() {
      this.$Message.info('取消')
    },
    okp() {
      this.searchData[this.index].rpId = this.model2_id
      this.searchData[this.index].rpName = this.model2_name
      this.searchData[this.index].spId = this.model1_id
      this.searchData[this.index].spName = this.model1_name
      this.searchData[this.index].$isEdit = true
      console.log(this.searchData[this.index])
    },
    searchsp() {
      this.sp = true
      this.patternData = []
      if (this.model1 == undefined) {
        this.model1 = ''
      }
      this.$ajax.post(this.sp_url + 'findspbyall', {
        spId: '',
        spName: this.model1,
        spFunc: '',
        spField: ''
      }).then(res => {
        console.log('查询服务模式')
        console.log(res.data)
        for (var i = 0; i < res.data.length; i++) {
          this.patternData.push({
            'key': res.data[i].spId,
            'value': res.data[i].spFunc,
            'name': res.data[i].spName
          })
        }
      })
    },
    searchrp() {
      console.log(this.model1)
      this.sp = false
      /*            this.patternData = [
                {"key":"1", "value":"describe1", "name":"rp1"},
                {"key":"2", "value":"describe2", "name":"rp2"},
                {"key":"3", "value":"describe3", "name":"rp3"},
                {"key":"4", "value":"describe4", "name":"rp4"}
            ];*/
      this.patternData = []
      for (var i = 0; i < this.rpAllIdNameList.length; i++) {
        if (this.rpAllIdNameList[i].rpName.search(this.model2) != -1) {
          this.patternData.push({
            'key': this.rpAllIdNameList[i].rpId,
            'value': this.rpAllIdNameList[i].rpDescription,
            'name': this.rpAllIdNameList[i].rpName
          })
        }
      }
    },
    changePage(index) {
      // 这里直接更改了模拟的数据，真实使用场景应该从服务端获取数据
      // let _start = (index - 1) * this.pageSize;
      this.startPage = (index - 1) * this.pageSize
      // let _end = index * this.pageSize;
      // this.searchData = this.searchAllData.slice(_start, _end)
    },
    adddate(date, type) {
      this.add_date = date
      console.log(this.add_date)
    },
    updatedate(date, type) {
      this.update_date = date
      console.log(this.update_date)
    },
    rowClassName(row, index) {
      // if (row.renew === "new") {
      //     return 'demo-table-info-row'
      // } else if (row.renew === "edit") {
      //     return 'demo-table-error-row'
      // }
      return ''
    }
  }
}
</script>

<style>
  .layout {
    border: 1px solid #d7dde4;
    background: #f5f7f9;
    position: relative;
    border-radius: 4px;
    overflow-y: scroll;
    height: 100%;
  }

  .layout-logo {
    width: 100px;
    height: 30px;
    background: #5b6270;
    border-radius: 3px;
    float: left;
    position: relative;
    top: 15px;
    left: 20px;
    font-weight: bold;
    text-align: center;
    color: #49ffcc;
  }

  .layout-nav {
    width: 420px;
    margin: 0 auto;
    margin-right: 20px;
  }

  .layout-footer-center {
    text-align: center;
  }

  .ivu-table .demo-table-info-row td{
    /*background-color: #2dd5f5;*/
    color: #ff9900;
  }
  .ivu-table .demo-table-error-row td{
    /*background-color: #ffff44;*/
    color: #ff6600;
  }
  .ivu-table td.demo-table-info-column{
    background-color: #2db7f5;
    color: #fff;
  }
  .ivu-table .demo-table-info-cell-name {
    background-color: #2db7f5;
    color: #fff;
  }
  .ivu-table .demo-table-info-cell-age {
    background-color: #ff6600;
    color: #fff;
  }
  .ivu-table .demo-table-info-cell-address {
    background-color: #187;
    color: #fff;
  }

</style>
