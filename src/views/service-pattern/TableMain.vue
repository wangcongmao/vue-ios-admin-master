<template>
  <div class="layout">
    <!--    <div class="app-container">-->
    <!--      <change-node ref="change-node" @myMounted="createdFunction"></change-node>-->
    <!--    </div>-->
    <Layout>
      <Content :style="{ padding: '0 50px' }">
        <Card title="查询服务模式">
          <Table ref="table" :columns="spColumn" :data="sp" stripe border />
          <Table
            ref="table"
            :columns="spColumnData"
            :data="spData"
            stripe
            border
          />
          <div style="margin: 10px;overflow: hidden">
            <Button
              v-if="this.$store.getters.userinfo.name === 'admin'"
              @click="addRow()"
              >增加</Button
            >
            <!--
              <treeselect :multiple="true" :options="treeData" :open-on-click="true" :append-to-body="true"/>-->
            <div style="float: right;">
              <Page
                :total="spAllData.length"
                :page-size="pageSize"
                show-total
                :current="1"
                show-elevator
                size="small"
                @on-change="changePage"
              />
            </div>
          </div>
        </Card>
        <Alert>{{ opensp }}</Alert>
        <Modal v-model="modal1" title="服务模式实例">
          <Table
            ref="table"
            :columns="processColumn"
            :data="sp_process"
            stripe
            border
          />
          <Button @click="addprocess()">增加</Button>
        </Modal>
      </Content>
      <iframe :src="flowable_url" width="0" height="0" />
    </Layout>
  </div>
</template>

<script>
// import ChangeNode from '@/components/changeNode'
export default {
  name: "TableMain",
  // components: { ChangeNode },
  data() {
    return {
      nodeInfos: [],
      currentNode: null,
      firstCreate: true,
      // sp_url: "http://10.147.19.68:8088/",
      // activiti_url: "http://10.147.19.68:8089/",
      // flowable_url: "http://10.147.19.68:18080/flowable-explorer/",
      // node30003_url: "http://10.147.19.68:30003/",
      // sp_algorithm_url: "http://al.ngrok2.xiaomiqiu.cn/",

      sp_url: process.env.VUE_APP_SP_BASE_URL + "/",
      activiti_url: process.env.VUE_APP_ACTIVITI_URL + "/",
      flowable_url: process.env.VUE_APP_FLOWABLE_URL + "/",
      node30003_url: process.env.VUE_APP_SERVICE_MANAGE_BASE_URL + "/",
      sp_algorithm_url: "http://10.147.19.68:8000/",

      process_id: "",
      process_func: "",
      process_field: "健康养老",
      modal1: false,
      sp_process: [],
      success: "chen1",
      // 用来接收后台传输的数据
      opensp: "消息提示",
      pageStart: 0,
      pageSize: 5,
      tableData: [],
      processColumn: [
        {
          title: " ",
          key: "spName",
          render: (h, params) => {
            // @h 是一个构造器，可以使用其创建新组建
            // @params 是表格的数据，params.row可以获取当前行的数据
            if (params.row.$isEdit) {
              return h("div", [
                h("br"),
                "实例名称：",
                h("Input", {
                  props: {
                    value: params.row.spName
                  },
                  on: {
                    input: function(event) {
                      params.row.spName = event;
                    }
                  }
                }),
                h("br")
              ]);
            } else {
              return h(
                "div",
                {
                  style: {
                    fontSize: "120%"
                  }
                },
                [h("br"), h("p", "实例名称：" + params.row.spName), h("br")]
              );
            }
          }
        },
        {
          title: " ",
          key: "action",
          render: (h, params) => {
            return h("div", [
              h(
                "Button",
                {
                  props: {
                    type: params.row.$isEdit ? "warning" : "info",
                    size: "small",
                    icon: ""
                  },
                  style: {
                    marginRight: "5px"
                  },
                  on: {
                    click: () => {
                      console.log(this.now);
                      if (params.row.$isEdit) {
                        if (params.row.new) {
                          params.row.new = false;
                          this.$ajax
                            .post(this.sp_url + "addsp", {
                              spId: params.row.spId,
                              spName: params.row.spName,
                              spFunc: this.process_func,
                              spField: this.process_field,
                              spProcess: "1"
                            })
                            .catch(function(error) {
                              console.log(error);
                            });
                          this.$ajax
                            .post(this.activiti_url + "update_model", {
                              id: params.row.spId,
                              name: params.row.spName
                            })
                            .catch(function(error) {
                              console.log(error);
                            });
                        } else {
                          this.$ajax
                            .post(this.sp_url + "updatesp", {
                              spId: params.row.spId,
                              spName: params.row.spName,
                              spFunc: this.process_func,
                              spField: this.process_field,
                              spProcess: "1",
                              spIdOld: params.row.olddata.spId,
                              spNameOld: params.row.olddata.spName,
                              spFuncOld: this.process_func,
                              spFieldOld: this.process_field
                            })
                            .catch(function(error) {
                              console.log(error);
                            });
                          this.$ajax
                            .post(this.activiti_url + "update_model", {
                              id: params.row.spId,
                              name: params.row.spName
                            })
                            .catch(function(error) {
                              console.log(error);
                            });
                        }
                        this.handleSave(params.row);
                      } else {
                        params.row.olddata = {
                          spId: params.row.spId,
                          spName: params.row.spName,
                          spFunc: this.process_func,
                          spField: this.process_field,
                          spProcess: "1"
                        };
                        // 在这里打开导入服务
                        this.handleEdit(params.row);
                      }
                    }
                  }
                },
                params.row.$isEdit ? "保存" : "修改"
              ),
              params.row.$isEdit
                ? h(
                    "Button",
                    {
                      props: {
                        type: params.row.$processEdit ? "warning" : "info",
                        size: "small",
                        icon: ""
                      },
                      style: {
                        marginRight: "5px"
                      },
                      on: {
                        click: () => {
                          if (
                            params.row.spProcess === null ||
                            params.row.spProcess === ""
                          ) {
                            this.$ajax(
                              this.activiti_url +
                                "add_new_process_by_model_id?id=" +
                                params.row.spId +
                                "&name=" +
                                params.row.spName +
                                "&model_id=" +
                                this.process_id
                            ).then(res => {
                              if (res.data === "success") {
                                window.open(
                                  this.flowable_url +
                                    "modeler.html?modelId=" +
                                    params.row.spId
                                );
                                // eslint-disable-next-line no-empty
                              } else {
                              }
                            });
                          } else {
                            window.open(
                              this.flowable_url +
                                "modeler.html?modelId=" +
                                params.row.spId
                            );
                          }
                        }
                      }
                    },
                    "修改流程"
                  )
                : h(
                    "Button",
                    {
                      props: {
                        type: "info",
                        size: "small",
                        icon: ""
                      },
                      style: {
                        marginRight: "5px"
                      },
                      on: {
                        click: () => {
                          this.opensp = "执行中";
                          const url =
                            this.sp_algorithm_url +
                            "api/runsp?inputfile=" +
                            params.row.spId;
                          this.$ajax.get(url).then(data => {
                            this.opensp = data.data.msg;
                          });
                        }
                      }
                    },
                    "执行"
                  ),
              h(
                "Poptip",
                {
                  props: {
                    confirm: true,
                    title: "是否要删除此字段？",
                    transfer: true
                  },
                  on: {
                    "on-ok": () => {
                      console.log(params.row);
                      this.$ajax.get(
                        this.activiti_url + "del_model?id=" + params.row.spId
                      );
                      this.$ajax.post(this.sp_url + "delsp", {
                        spId: params.row.spId,
                        spName: params.row.spName,
                        spFunc: this.process_func,
                        spField: this.process_field
                      });
                      this.sp_process.splice(params.row._index, 1);
                      // 删除逻辑
                    }
                  }
                },
                [
                  h(
                    "Button",
                    {
                      props: {
                        type: "error",
                        size: "small"
                      },
                      style: {
                        marginRight: "5px"
                      }
                    },
                    "删除"
                  )
                ]
              )
            ]);
          }
        }
      ],
      sp: [
        {
          $isEdit: false,
          spId: "",
          spName: "",
          spFunc: "",
          spField: ""
        }
      ],
      // spData: [],
      spAllData: [],
      // easy-table-vue的列规范
      spColumnData: [
        {
          title: " ",
          key: "imgurl",
          width: 400,
          render: (h, params) => {
            return h("img", {
              style: {
                verticalAlign: "middle",
                width: "95%",
                height: "95%"
              },
              attrs: {
                src: params.row.imgurl
              },
              on: {
                click: () => {
                  this.showimg(params.row._index);
                }
              }
            });
          }
        },
        {
          title: " ",
          key: "spName",
          render: (h, params) => {
            // @h 是一个构造器，可以使用其创建新组建
            // @params 是表格的数据，params.row可以获取当前行的数据
            if (params.row.$isEdit) {
              return h("div", [
                "服务模式名称：",
                h("Input", {
                  props: {
                    value: params.row.spName
                  },
                  on: {
                    input: function(event) {
                      params.row.spName = event;
                    }
                  }
                }),
                h("br"),
                "服务模式功能：",
                h("Input", {
                  props: {
                    value: params.row.spFunc
                  },
                  on: {
                    input: function(event) {
                      params.row.spFunc = event;
                    }
                  }
                }),
                h("br"),
                "服务模式领域：",
                h("treeselect", {
                  props: {
                    multiple: true,
                    "append-to-body": true,
                    options: this.treeData
                  },
                  on: {
                    input: function(event) {
                      params.row.spField = event.toString();
                      console.log(params.row.spField);
                    }
                  }
                })
              ]);
            } else {
              return h(
                "div",
                {
                  style: {
                    fontSize: "120%"
                  }
                },
                [
                  h("br"),
                  h("p", "服务模式名称：" + params.row.spName),
                  h("br"),
                  h("p", "服务模式功能：" + params.row.spFunc),
                  h("br"),
                  h("p", "服务模式领域：" + params.row.spField),
                  h("br")
                ]
              );
            }
          }
        },
        {
          title: " ",
          key: "action",
          width: 300,
          render: (h, params) => {
            console.log(
              "jjjjjjjjjjjjjjjjjjjjjjjjjjjj",
              this.$store.getters.userinfo.name
            );
            if (this.$store.getters.userinfo.name === "admin") {
              return h("div", [
                h(
                  "Button",
                  {
                    props: {
                      type: params.row.$isEdit ? "warning" : "info",
                      size: "small",
                      icon: ""
                    },
                    style: {
                      marginRight: "5px"
                    },
                    on: {
                      click: () => {
                        console.log(this.now);
                        if (params.row.$isEdit) {
                          if (params.row.new) {
                            params.row.new = false;
                            this.$ajax
                              .post(this.sp_url + "addsp", {
                                spId: params.row.spId,
                                spName: params.row.spName,
                                spFunc: params.row.spFunc,
                                spField: params.row.spField,
                                spProcess: "0"
                              })
                              .catch(function(error) {
                                console.log(error);
                              });
                            this.$ajax
                              .post(this.activiti_url + "update_model", {
                                id: params.row.spId,
                                name: params.row.spName
                              })
                              .catch(function(error) {
                                console.log(error);
                              });
                          } else {
                            this.$ajax
                              .post(this.sp_url + "updatesp", {
                                spId: params.row.spId,
                                spName: params.row.spName,
                                spFunc: params.row.spFunc,
                                spField: params.row.spField,
                                spProcess: "0",
                                spIdOld: params.row.olddata.spId,
                                spNameOld: params.row.olddata.spName,
                                spFuncOld: params.row.olddata.spFunc,
                                spFieldOld: params.row.olddata.spField
                              })
                              .catch(function(error) {
                                console.log(error);
                              });
                            this.$ajax
                              .post(this.activiti_url + "update_model", {
                                id: params.row.spId,
                                name: params.row.spName
                              })
                              .catch(function(error) {
                                console.log(error);
                              });
                          }
                          this.handleSave(params.row);
                        } else {
                          params.row.olddata = {
                            spId: params.row.spId,
                            spName: params.row.spName,
                            spFunc: params.row.spFunc,
                            spField: params.row.spField,
                            spProcess: "0"
                          };
                          // 在这里打开导入服务
                          this.handleEdit(params.row);
                        }
                      }
                    }
                  },
                  params.row.$isEdit ? "保存" : "修改"
                ),
                params.row.$isEdit
                  ? h(
                      "Button",
                      {
                        props: {
                          type: params.row.$processEdit ? "warning" : "info",
                          size: "small",
                          icon: ""
                        },
                        style: {
                          marginRight: "5px"
                        },
                        on: {
                          click: () => {
                            this.opensp = "服务模式文件导入中，请稍后...";
                            console.log(params.row.spProcess);
                            if (
                              params.row.spProcess === null ||
                              params.row.spProcess === ""
                            ) {
                              this.$ajax(
                                this.activiti_url +
                                  "add_new_model?id=" +
                                  params.row.spId +
                                  "&name=" +
                                  params.row.spName
                              ).then(res => {
                                if (res.data === "success") {
                                  this.opensp =
                                    "导入服务模式文件成功! 访问 " +
                                    this.flowable_url +
                                    "modeler.html?modelId=" +
                                    params.row.spId +
                                    " 修改文件。";
                                  window.open(
                                    this.flowable_url +
                                      "modeler.html?modelId=" +
                                      params.row.spId
                                  );
                                } else {
                                  this.opensp = "出现错误";
                                }
                              });
                            } else {
                              this.opensp =
                                "导入服务模式文件成功! 访问 " +
                                this.flowable_url +
                                "modeler.html?modelId=" +
                                params.row.spId +
                                " 修改文件。";
                              window.open(
                                this.flowable_url +
                                  "modeler.html?modelId=" +
                                  params.row.spId
                              );
                            }
                          }
                        }
                      },
                      "修改流程"
                    )
                  : h(
                      "Button",
                      {
                        props: {
                          type: "info",
                          size: "small",
                          icon: ""
                        },
                        style: {
                          marginRight: "5px"
                        },
                        on: {
                          click: () => {
                            this.opensp = "执行中";
                            const url =
                              this.sp_algorithm_url +
                              "api/runsp?inputfile=" +
                              params.row.spId;
                            this.$ajax.get(url).then(data => {
                              this.opensp = data.data.msg;
                            });
                          }
                        }
                      },
                      "执行"
                    ),
                h(
                  "Poptip",
                  {
                    props: {
                      confirm: true,
                      title: "是否要删除此字段？",
                      transfer: true
                    },
                    on: {
                      "on-ok": () => {
                        console.log(params.row);
                        this.$ajax
                          .get(
                            this.activiti_url +
                              "del_model?id=" +
                              params.row.spId
                          )
                          .then(res => {
                            this.opensp = res.data;
                          });
                        this.$ajax.post(this.sp_url + "delsp", {
                          spId: params.row.spId,
                          spName: params.row.spName,
                          spFunc: params.row.spFunc,
                          spField: params.row.spField
                        });
                        this.spAllData.splice(params.row._index, 1);
                        // 删除逻辑
                      }
                    }
                  },
                  [
                    h(
                      "Button",
                      {
                        props: {
                          type: "error",
                          size: "small"
                        },
                        style: {
                          marginRight: "5px"
                        }
                      },
                      "删除"
                    )
                  ]
                ),
                h(
                  "Button",
                  {
                    props: {
                      type: "info",
                      size: "small",
                      icon: ""
                    },
                    style: {
                      marginRight: "5px"
                    },
                    on: {
                      click: () => {
                        this.modal1 = true;
                        this.process_id = params.row.spId;
                        this.process_func = params.row.spFunc;
                        this.process_field = params.row.spField;
                        this.$ajax
                          .post(this.sp_url + "findprocessbyall", {
                            spId: this.process_id,
                            spName: "",
                            spFunc: this.process_func,
                            spField: this.process_field
                          })
                          .then(res => {
                            var _spData = res.data;
                            var that = this;
                            var promiseAll = _spData.map(function(i) {
                              return that.$ajax.get(
                                that.activiti_url +
                                  "find_model_extra?id=" +
                                  i.spId,
                                { responseType: "arraybuffer" }
                              );
                            });

                            that.sp_process = [];
                            that.$ajax.all(promiseAll).then(function(resArr) {
                              resArr.forEach(function(res, i) {
                                console.log(i);
                                that.sp_process.push({
                                  imgurl:
                                    "data:image/png;base64," +
                                    btoa(
                                      new Uint8Array(res.data).reduce(
                                        (data, byte) =>
                                          data + String.fromCharCode(byte),
                                        ""
                                      )
                                    ),
                                  spId: _spData[i].spId,
                                  spName: _spData[i].spName,
                                  spFunc: _spData[i].spFunc,
                                  spField: _spData[i].spField
                                });
                              });
                              /* if (that.sp_process.length <= that.pageSize){
                                              that.spData = that.sp_process
                                          } else {
                                              that.spData = that.sp_process.slice(0, that.pageSize);
                                          }*/
                            });
                          })
                          .catch(function(error) {
                            console.log(error);
                          });
                      }
                    }
                  },
                  "查看实例"
                )
              ]);
            }
          }
        }
      ],
      // iview的列命名规范
      spColumn: [
        {
          title: "服务模式名称",
          key: "spName",
          render: (h, params) => {
            // @h 是一个构造器，可以使用其创建新组建
            // @params 是表格的数据，params.row可以获取当前行的数据
            return h("Input", {
              props: {
                value: params.row.spName
              },
              on: {
                input: function(event) {
                  params.row.spName = event;
                }
              }
            });
          }
        },
        {
          title: "功能信息",
          key: "spFunc",
          render: (h, params) => {
            return h("Input", {
              props: {
                value: params.row.spFunc
              },
              on: {
                input: function(event) {
                  params.row.spFunc = event;
                }
              }
            });
          }
        },
        {
          title: "领域信息",
          key: "spField",
          render: (h, params) => {
            return h("treeselect", {
              props: {
                multiple: true,
                "append-to-body": true,
                transfer: true,
                options: this.treeData
              },
              on: {
                input: function(event) {
                  params.row.spField = event.toString();
                  console.log(params.row.spField);
                }
              }
            });
          }
        },
        {
          title: "操作",
          key: "action",
          width: 300,
          render: (h, params) => {
            return h("div", [
              h(
                "Button",
                {
                  props: {
                    type: params.row.$isEdit ? "warning" : "info",
                    size: "small",
                    icon: ""
                  },
                  style: {
                    marginRight: "5px"
                  },
                  on: {
                    click: () => {
                      console.log(params.row);
                      this.$ajax
                        .post(this.sp_url + "findspbyall", {
                          spId: params.row.spId,
                          spName: params.row.spName,
                          spFunc: params.row.spFunc,
                          spField: params.row.spField
                        })
                        .then(res => {
                          var _spData = res.data;
                          var tmpspData = [];
                          _spData.forEach(sp => {
                            if (sp.spProcess === "0") {
                              tmpspData.push(sp);
                            }
                          });
                          _spData = tmpspData;

                          var that = this;
                          var promiseAll = _spData.map(function(i) {
                            return that.$ajax.get(
                              that.activiti_url +
                                "find_model_extra?id=" +
                                i.spId,
                              { responseType: "arraybuffer" }
                            );
                          });

                          /* this.$ajax.get(url, {responseType: 'arraybuffer'}).then(data =>{
                                                this.imgurl = 'data:image/png;base64,' + btoa(new Uint8Array(data.data).reduce((data, byte) => data + String.fromCharCode(byte), ''))
                                            });*/
                          that.spAllData = [];
                          for (let i = 0; i < _spData.length; i++) {
                            console.log(_spData[i]);
                            if (_spData[i].spProcess === "0") {
                              that.spAllData.push({
                                imgurl: "", // 'data:image/png;base64,' + btoa(new Uint8Array(res.data).reduce((data, byte) => data + String.fromCharCode(byte), '')),
                                spId: _spData[i].spId,
                                spName: _spData[i].spName,
                                spFunc: _spData[i].spFunc,
                                spField: _spData[i].spField
                              });
                            }
                          }
                          console.log("spData", _spData);
                          console.log("promiseAll", promiseAll);
                          promiseAll.forEach((req, i) => {
                            req.then(res => {
                              console.log(i, that.spAllData[i]);
                              that.spAllData[i].imgurl =
                                "data:image/png;base64," +
                                btoa(
                                  new Uint8Array(res.data).reduce(
                                    (data, byte) =>
                                      data + String.fromCharCode(byte),
                                    ""
                                  )
                                );
                              console.log(that.spAllData[i].imgurl);
                            });
                          });

                          // that.$ajax.all(promiseAll).then(function(resArr){
                          //
                          //     if (that.spAllData.length <= that.pageSize){
                          //         that.spData = that.spAllData
                          //     } else {
                          //         that.spData = that.spAllData.slice(0, that.pageSize);
                          //     }
                          // })
                        })
                        .catch(function(error) {
                          console.log(error);
                        });
                    }
                  }
                },
                "查询"
              )
            ]);
          }
        }
      ],
      spIdList: [],
      spNameList: [],
      spFuncList: [],
      spFieldList: [],
      categories: new Map(),
      treeData: []
      // EChart数据列
    };
  },
  computed: {
    spData: function() {
      const that = this;
      if (that.spAllData.length <= that.pageSize) {
        return that.spAllData;
      } else {
        return that.spAllData.slice(
          this.pageStart,
          this.pageStart + that.pageSize
        );
      }
    }
  },
  created() {
    this.$ajax(`${process.env.VUE_APP_IOS_URL}/module/addrs`)
      .then(res => {
        const urls = res.data;
        this.sp_url = urls["spAddr"] + "/";
        // this.sp_algorithm_url = urls['spAlgorithmAddr'] + '/'
        this.sp_algorithm_url = "http://10.147.19.68:8000/";
        // this.activiti_url = urls['activitiAddr'] + "/"
        this.activiti_url = "http://10.147.19.68:8089/";
        // this.flowable_url = urls['flowableAddr'] + "/"
        this.flowable_url = "http://10.147.19.68:18080/flowable-explorer/";
        this.node30003_url = urls["serviceAddr"] + "/";
        console.log("sp_url", this.sp_url);
        console.log("sp_algorithm_url", this.sp_algorithm_url);
        console.log("activiti_url", this.activiti_url);
        console.log("flowable_url", this.flowable_url);
        console.log("node30003_url", this.node30003_url);
        return 1;
      })
      .then(() => {
        this.createdFunction();
      });
  },
  methods: {
    createdFunction() {
      // eslint-disable-next-line no-lone-blocks
      {
        // if(!this.firstCreate){
        //   return
        // }
        this.firstCreate = false;
        this.$ajax(this.sp_url + "findspid")
          .then(res => {
            const that = this;
            that.spIdList = [{ value: " " }];
            res.data.forEach(data => {
              that.spIdList.push({
                value: data
              });
            });
            console.log("spIdList", this.spIdList);
          })
          .catch(function(error) {
            console.log(error);
          });

        this.$ajax(this.sp_url + "findspname")
          .then(res => {
            const that = this;
            that.spNameList = [{ value: " " }];
            res.data.forEach(data => {
              that.spNameList.push({
                value: data
              });
            });
            console.log("splist", this.spNameList);
          })
          .catch(function(error) {
            console.log(error);
          });

        this.$ajax(this.sp_url + "findspfunc")
          .then(res => {
            const that = this;
            that.spFuncList = [{ value: " " }];
            res.data.forEach(data => {
              that.spFuncList.push({
                value: data
              });
            });
            console.log("splist", this.spFuncList);
          })
          .catch(function(error) {
            console.log(error);
          });

        this.$ajax(this.sp_url + "findspfield")
          .then(res => {
            const that = this;
            that.spFieldList = [{ value: " " }];
            res.data.forEach(data => {
              that.spFieldList.push({
                value: data
              });
            });
            console.log("splist", this.spFieldList);
          })
          .catch(function(error) {
            console.log(error);
          });
        this.loadCategories();
      }
    },
    // 点击了修改按钮
    handleCheckChange(data) {
      alert(data);
    },
    handleEdit(row) {
      this.$set(row, "$isEdit", true);
    },
    // 点击了保存按钮
    handleSave(row) {
      this.$set(row, "$isEdit", false);
    },
    addprocess() {
      console.log("addProcess");
      const x = this.sp_process
        .map(function(c) {
          return c.spId;
        })
        .join(",");
      const a = x
        .toString()
        .split(",")
        .sort();
      const max = a.pop();
      let b = max.substring(this.process_id.length, max.length);
      if (b === "") {
        b = -1;
      }
      const processId = this.process_id + (parseInt(b) + 1).toString();
      this.sp_process.push({
        $isEdit: false,
        $processEdit: false,
        spId: processId,
        spName: "新实例",
        spFunc: this.process_func,
        spField: this.process_field,
        new: true,
        spProcess: ""
      });
      console.log(this.sp_process);
    },
    addRow() {
      console.log("addRow");
      var date = new Date();
      var year = date.getFullYear();
      var month = (date.getMonth() + 1).toString();
      var strDate = date.getDate();
      var hour = date.getHours();
      var min = date.getMinutes();
      var sec = date.getSeconds();
      if (month >= 1 && month <= 9) {
        month = "0" + month;
      }
      if (strDate >= 0 && strDate <= 9) {
        strDate = "0" + strDate;
      } /*
          if (hour >= 0 && hour <= 9) {
              hour = "0" + strDate;
          }*/
      if (min >= 0 && min <= 9) {
        min = "0" + min;
      }
      if (sec >= 0 && sec <= 9) {
        sec = "0" + sec;
      }
      var currentdate = year + month + strDate + hour + min + sec;
      this.spAllData.push({
        $isEdit: false,
        $processEdit: false,
        spId: currentdate,
        spName: "新服务模式",
        spFunc: "",
        spField: "健康养老",
        new: true,
        spProcess: ""
      });
    },
    changePage(index) {
      // 这里直接更改了模拟的数据，真实使用场景应该从服务端获取数据
      this.pageStart = (index - 1) * this.pageSize;
      // let _start = (index - 1) * this.pageSize;
      // let _end = index * this.pageSize;
      // this.spData = this.spAllData.slice(_start, _end)
    },
    showimg(index) {
      const img = new Image();
      img.src = this.spData[index].imgurl;
      this.$Modal.info({
        title: "缩略图",
        width: img.width + 100,
        content: `<img src="${this.spData[index].imgurl}">`
      });
    },

    async loadCategories() {
      return this.$ajax
        .get(this.node30003_url + "serviceCategory/listRoots")
        .then(data => {
          const that = this;
          console.log(data.data);
          this.treeData = data.data;

          function edit(list) {
            for (let i = 0; i < list.length; i++) {
              if (list[i].children != null && list[i].children.length > 0) {
                list[i].children = edit(list[i].children);
              } else delete list[i].children;
              list[i].id = list[i].catelogyName;
              list[i].label = list[i].catelogyName;
            }
            return list;
          }

          this.treeData = edit(this.treeData);

          function walk(list) {
            for (let i = 0; i < list.length; i++) {
              that.categories.set(list[i].catelogyId, list[i]);
              if (list[i].children != null && list[i].children.length > 0) {
                walk(list[i].children);
              }
            }
          }

          walk(this.treeData);
          console.log(this.treeData);
        });
    }
  }
};
</script>

<style scoped>
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
</style>
