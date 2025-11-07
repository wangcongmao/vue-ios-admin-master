<template>
  <div>
    <Table
      ref="table"
      :height="tableHeight"
      style="overflow: auto"
      :columns="solColumn"
      :data="solColumnData"
      border
    />
    <!--    <Button type="primary" @click="unsat()" >不满意，使用中心节点匹配</Button>-->
  </div>
</template>

<script>
import qs from "qs";
export default {
  name: "Solution",
  data() {
    return {
      sp_algorithm_url: "http://10.147.19.68:8000/",
      // sp_algorithm_url: "http://al.ngrok2.xiaomiqiu.cn/",
      ios_url: "http://10.147.19.68:9095/",
      // node30004_url: "http://10.147.19.68:30004/",
      node30004_url: "http://10.147.19.68:9095/",
      node30003_url: "http://10.147.19.68:9095/",
      // sp_url: "http://10.147.19.68:8088/",
      // activiti_url: "http://10.147.19.68:8089/",
      // flowable_url: "http://10.147.19.68:18080/flowable-explorer/",
      sp_url: "http://10.147.19.68:8088/",
      activiti_url: "http://10.147.19.68:8089/",
      flowable_url: "http://10.147.19.68:18080/flowable-explorer/",
      tableHeight: 500,
      solColumn: [
        {
          title: "方案编号",
          key: "sid",
          render: (h, params) => {
            return h("div", params.row.sid);
          }
        },
        {
          title: "方案详情",
          key: "srpsp",
          render: (h, params) => {
            const srpsp = JSON.parse(params.row.srpspname.replace(/'/g, '"'));
            // for (let key in srpsp){
            //     srpsplist.push(key + ":" + srpsp[key], h("br"))
            // }
            // for (let key in srpsp){
            //     srpsplist.push({
            //         r: key,
            //         s: srpsp[key]
            //     })
            // }
            return h("Table", {
              props: {
                size: "small"
              },
              attrs: {
                columns: this.srpspColumn,
                data: srpsp
              }
            });
          }

          //     return h("div", srpsplist);
          // }
        },
        {
          title: "约束详情",
          key: "cons",
          render: (h, params) => {
            const cons = JSON.parse(params.row.cons.replace(/'/g, '"'));
            // cons.forEach(data=>{
            //     conslist.push("目标", data.goalname, "，约束", data.constraintname, "，实际值", data.value, h('br'))
            // })
            return h("Table", {
              props: {
                size: "small"
              },
              attrs: {
                columns: this.consColumn,
                data: cons
              }
            });
          }
        },
        {
          title: "用户目标",
          key: "score",
          render: (h, params) => {
            const scorelist = [];
            const score = JSON.parse(params.row.score.replace(/'/g, '"'));
            for (const i in score) {
              scorelist.push(score[i].name + ":" + score[i].score, h("br"));
            }
            return h("div", scorelist);
          }
        },
        {
          title: "操作",
          key: "action",
          render: (h, params) => {
            return h("div", [
              h(
                "Button",
                {
                  props: {
                    type: "primary",
                    size: "small"
                  },
                  on: {
                    click: () => {
                      window.open(
                        this.flowable_url +
                          "modeler.html?modelId=" +
                          params.row.sid
                      );
                    }
                  },
                  style: {
                    marginRight: "5px"
                  }
                },
                "查看流程"
              ),
              h(
                "Poptip",
                {
                  props: {
                    confirm: true,
                    title: "确认选择？",
                    transfer: true
                  },
                  on: {
                    "on-ok": () => {
                      this.$ajax
                        .get(
                          this.sp_algorithm_url +
                            "api/delsub?inputfile=" +
                            params.row.sid
                        )
                        .then(res => {
                          const error_num = res.data.error_num;
                          if (error_num === 1) {
                            alert("有未绑定的服务");
                          } else {
                            const flowableUrl =
                              this.flowable_url +
                              "" +
                              "modeler.html?modelId=" +
                              params.row.sid;
                            this.$ajax
                              .post(
                                this.node30004_url + `api/modify-state`,
                                qs.stringify({
                                  requireId: this.requireId,
                                  url: flowableUrl
                                }),
                                {
                                  headers: {
                                    "content-type":
                                      "application/x-www-form-urlencoded"
                                  }
                                }
                              )
                              .then(() => {
                                this.$ajax
                                  .get(
                                    this.node30003_url +
                                      `solution/toEditing/${this.solutionId}`
                                  )
                                  .then(_ => {
                                    console.log(_);
                                    this.$ajax
                                      .get(
                                        this.node30003_url +
                                          `solution/toCreated/${
                                            this.solutionId
                                          }?url=${flowableUrl}`
                                      )
                                      .then(res => {
                                        console.log(res);
                                        alert("选择成功");
                                      });
                                  });
                              });
                          }
                        });
                    }
                  }
                },
                [
                  h(
                    "Button",
                    {
                      props: {
                        type: "primary",
                        size: "small"
                      },
                      style: {
                        marginRight: "5px"
                      }
                    },
                    "选择该流程"
                  )
                ]
              ),
              h(
                "Button",
                {
                  props: {
                    type: "primary",
                    size: "small"
                  },
                  on: {
                    click: () => {
                      this.$ajax.get(
                        this.sp_algorithm_url +
                          "api/runscheme?inputfile=" +
                          params.row.sid +
                          "&id=0"
                      );
                    }
                  },
                  style: {
                    marginRight: "5px"
                  }
                },
                "执行流程"
              )
            ]);
          }
        }
      ],
      srpspColumn: [
        {
          title: "需求模式名",
          key: "goalname",
          render: (h, params) => {
            return h("div", params.row.goalname);
          }
        },
        {
          title: "服务模式名",
          key: "spname",
          render: (h, params) => {
            return h("div", params.row.spname);
          }
        },
        {
          title: "匹配度",
          key: "md",
          render: (h, params) => {
            if (params.row.md === 0) {
              params.row.md = "额外部分";
            }
            return h("div", params.row.md);
          }
        }
      ],
      consColumn: [
        {
          title: "目标名",
          key: "r",
          render: (h, params) => {
            return h("div", params.row.goalname);
          }
        },
        {
          title: "约束名",
          key: "cons",
          render: (h, params) => {
            return h("div", params.row.constraintname);
          }
        },
        {
          title: "实际值",
          key: "value",
          render: (h, params) => {
            return h("div", params.row.value);
          }
        }
      ],
      solColumnData: []
    };
  },

  created() {
    this.requireId = this.$route.query.requireId;
    this.solutionId = this.$route.query.solutionId;
    this.$ajax
      .get(
        this.activiti_url + "find_models_id?id=" + this.$route.query.savepath
      )
      .then(res => {
        console.log("dddddddddddddddddddddddddddd", res.data);
        res.data.forEach(data => {
          this.$ajax
            .get(this.sp_url + "findsolution?sid=" + data.id)
            .then(res => {
              this.solColumnData.push(res.data);
            });
        });
      })
      .catch(function(error) {
        console.log(error);
      });
    console.log(this.solColumnData);
  },
  mounted() {
    this.tableHeight = window.innerHeight - this.$refs.table.$el.offsetTop - 80;
    // window.innerHeight是浏览器可用高度，this.$refs.table.$el.offsetTop是表格距离浏览器可用高度顶部的距离
  },
  methods: {
    unsat() {
      this.$ajax
        .get(
          this.ios_url +
            "require/rematch?requireId=" +
            this.requireId +
            "&solutionId=" +
            this.solutionId
        )
        .then(_ => {
          alert("成功");
        });
    }
  }
};
</script>

<style scoped></style>
