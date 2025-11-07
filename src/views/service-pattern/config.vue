<template>
  <div class="layout-content">
    <iframe :src="flowable_url" width="0" height="0" />
    <p class="layout-p1">参数配置</p>
    <Collapse active-key="1">
      <Panel key="1">
        优化策略
        <div slot="content" style="display:inline-block">
          <div style="float: left;">
            <span style="float: left;line-height:58px;">求解质量</span>
            <Slider
              :value="value[0]"
              :tip-format="format"
              class="layout-sli"
              @on-input="opt_pol1"
            />
          </div>
          <div style="float: left;">
            <span style="float: left;line-height:58px;">求解速度</span>
            <Slider
              :value="value[1]"
              :tip-format="format"
              class="layout-sli"
              @on-input="opt_pol2"
            />
          </div>
          <br />
        </div>
      </Panel>
      <Panel key="2">
        用户优化目标
        <div slot="content">
          <span>目标数量</span>
          <Radio-group v-model="user_opt_goal_number">
            <Radio label="单目标" />
            <Radio label="多目标" />
          </Radio-group>
          <br />
          <br />
          <Table
            v-if="user_opt_goal_number === '单目标'"
            stripe
            :columns="user_opt_goal_column"
            :data="user_opt_goal_data.slice(0, 1)"
          />
          <Table
            v-if="user_opt_goal_number === '多目标'"
            stripe
            :columns="user_opt_goal_column"
            :data="user_opt_goal_data"
          />
          <Button type="primary" @click="add_user_opt()">增加</Button>
        </div>
      </Panel>
      <Panel key="3">
        平台优化目标
        <div slot="content">
          <span style="font-size: 15px;">是否考虑平台优化目标</span>
          <Radio-group v-model="platform_yn">
            <Radio label="是" />
            <Radio label="否" />
          </Radio-group>
          <div v-if="platform_yn === '是'">
            <br />
            <draggable v-model="platform_opt_goal_data" class="wrapper">
              <transition-group>
                <div
                  v-for="item in platform_opt_goal_data"
                  :key="item"
                  class="item"
                >
                  <Icon type="md-hand" />
                  <span>{{ item }}</span>
                </div>
              </transition-group>
            </draggable>
          </div>
        </div>

        <!--          <p slot="content">乔纳森·伊夫是一位工业设计师，现任Apple公司设计师兼资深副总裁，英国爵士。他曾参与设计了iPod，iMac，iPhone，iPad等众多苹果产品。除了乔布斯，他是对苹果那些著名的产品最有影响力的人。</p>-->
      </Panel>
      <Panel key="4">
        优化目标优先级
        <div slot="content">
          <draggable v-model="list" class="wrapper">
            <transition-group>
              <div v-for="item in list" :key="item" class="item">
                <Icon type="md-hand" />
                <span>{{ item }}</span>
              </div>
            </transition-group>
          </draggable>
        </div>
        <!--          <p slot="content">乔纳森·伊夫是一位工业设计师，现任Apple公司设计师兼资深副总裁，英国爵士。他曾参与设计了iPod，iMac，iPhone，iPad等众多苹果产品。除了乔布斯，他是对苹果那些著名的产品最有影响力的人。</p>-->
      </Panel>
      <Panel key="5">
        算法选择
        <div slot="content">
          <Radio-group v-model="al_choose">
            <Radio label="基于规则的算法" />
            <Radio label="启发式算法" />
            <Radio label="演化算法" /> </Radio-group
          ><br /><br />
          <Radio-group
            v-if="al_choose === '基于规则的算法'"
            v-model="al_choose_1"
          >
            <Radio label="贪心算法" />
          </Radio-group>
          <Radio-group v-if="al_choose === '启发式算法'" v-model="al_choose_1">
            <Radio label="禁忌搜索算法" />
          </Radio-group>
          <Radio-group v-if="al_choose === '演化算法'" v-model="al_choose_1">
            <Radio label="遗传算法" />
            <Radio label="差分进化算法" />
            <Radio label="人工蜂群算法" />
          </Radio-group>
        </div>
      </Panel>
      <Panel key="6">
        其他参数
        <div slot="content">
          <span>匹配度阈值</span>
          <Input
            v-model="threshold"
            placeholder=""
            style="width: 100px"
          /><br />
          <span>需求模式对应的服务模式数量</span>
          <Input v-model="topk" placeholder="" style="width: 100px" /><br />
          <span>生成服务方案数量</span>
          <Input v-model="k" placeholder="" style="width: 100px" /><br />
        </div>
      </Panel> </Collapse
    ><br />
    <Button type="primary" @click="getrequest()">生成服务方案</Button>
  </div>
</template>

<script>
import Vue from "vue";
import qs from "qs";
export default {
  name: "Config",
  data() {
    return {
      // sp_algorithm_url: "http://10.147.19.68:30029/",
      sp_algorithm_url: "http://10.147.19.68:8000/",
      // sp_algorithm_url: "http://al.ngrok2.xiaomiqiu.cn/",
      ios_url: "http://10.147.19.68:9095/",
      // node30004_url: "http://10.147.19.68:30004/",
      node30004_url: "http://10.147.19.68:8083/",
      node30003_url: "http://10.147.19.68:8090/",
      // flowable_url: "http://10.147.19.68:18080/flowable-explorer/",
      flowable_url: "http://10.147.19.68:18080/flowable-explorer/",
      threshold: 0,
      k: 10,
      topk: 10,
      goal_data: {
        targetTree: {
          goal: {}
        }
      },
      user_opt_name: [],
      user_opt_goal_weight: "",
      requireId: "",
      solutionId: "",
      center: "",
      optimization_policy: 0,
      al_choose: "",
      al_choose_1: "",
      value: [0, 100],
      platform_yn: "是",
      platform_opt_goal: "分配平均",
      user_opt_goal_number: "多目标",
      list: ["用户目标", "平台目标", "服务提供商目标"],
      user_opt_goal_column: [
        {
          title: "目标名",
          key: "name",
          render: (h, params) => {
            if (params.row.$isEdit) {
              return h(
                "Select",
                {
                  props: { transfer: true },
                  on: {
                    "on-change": event => {
                      params.row.name = event;
                    }
                  }
                },
                this.user_opt_name.map(item => {
                  return h("Option", {
                    props: {
                      value: item.value,
                      label: item.value
                    }
                  });
                })
              );
            } else return h("div", params.row.name);
          }
        },
        {
          title: "优先级",
          key: "level",
          render: (h, params) => {
            if (params.row.$isEdit) {
              return h("Input", {
                props: {
                  placeholder: "请输入数字",
                  value: params.row.level
                },
                on: {
                  input: function(event) {
                    params.row.level = event;
                  }
                }
              });
            } else return h("div", params.row.level);
          }
        },
        {
          title: "优化的节点",
          key: "range"
          // 这里差读取目标树的内容
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
                    type: params.row.$isEdit ? "warning" : "info",
                    size: "small",
                    icon: ""
                  },
                  style: {
                    marginRight: "5px"
                  },
                  on: {
                    click: () => {
                      if (params.row.$isEdit) {
                        console.log(params.row._index);
                        this.user_opt_goal_data[params.row._index].level =
                          params.row.level;
                        this.user_opt_goal_data[params.row._index].name =
                          params.row.name;
                        this.user_opt_goal_data[params.row._index].range =
                          params.row.range;
                        this.handleSave(params.row);
                      } else {
                        this.handleEdit(params.row);
                      }
                    }
                  }
                },
                params.row.$isEdit ? "保存" : "修改"
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
                      this.user_opt_goal_data.splice(params.row._index, 1);
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
      user_opt_goal_data: [],
      platform_opt_goal_data: ["成交最多", "抽成最多", "分配均匀"]
    };
  },
  created() {
    this.requireId = this.$route.query.requireId;
    console.log(this.requireId);
    this.solutionId = this.$route.query.solutionId;
    this.center = this.$route.query.center;
    console.log(parseInt(this.center));
    let request = "";
    request =
      this.node30004_url + "api/match-result?requireId=" + this.requireId;
    console.log("requuest", request);
    this.$ajax.get(request).then(res => {
      this.goal_data = res.data;
      console.log("------------goaldata----------------", this.goal_data);
      this.user_opt_goal_data = [];
      this.user_opt_goal_weight = [];
      const optTargets = this.goal_data.targetTree.goal.optTargets;
      for (let i = 0; i < optTargets.length; i++) {
        this.user_opt_goal_data.push({
          name: optTargets[i].name,
          level: optTargets[i].weight,
          range: this.goal_data.targetTree.goal.content,
          $isEdit: false
        });
      }
      this.goal_data.center = this.center;
      this.$ajax
        .post(this.sp_algorithm_url + "api/miv", this.goal_data)
        .then(res => {
          // this.threshold = res.data.threshold;
          this.threshold = 0.7;
          this.al_choose_1 = res.data.optimization;
        });
    });
    this.$ajax.get(this.node30003_url + "qualityIndex/list").then(res => {
      for (let i = 0; i < res.data.length; i++) {
        if (res.data[i].couldOptimize === true) {
          this.user_opt_name.push({
            value: res.data[i].name
          });
        }
      }
    });
  },
  methods: {
    format(val) {
      return val + "%";
    },
    opt_pol1(val) {
      Vue.set(this.value, 1, 100 - val);
      this.optimization_policy = val;
    },
    opt_pol2(val) {
      Vue.set(this.value, 0, 100 - val);
      this.optimization_policy = 100 - val;
    },
    add_user_opt() {
      this.user_opt_goal_data.push({
        name: "",
        level: "",
        range: "",
        $isEdit: false
      });
    },
    handleEdit(row) {
      this.$set(row, "$isEdit", true);
    },
    handleSave(row) {
      this.$set(row, "$isEdit", false);
    },
    getrequest() {
      console.log(
        "================================================================"
      );
      console.log(this.requireId);
      const optTargets = [];
      this.goal_data.requireId = this.requireId;
      this.goal_data.solutionId = this.solutionId;
      for (let i = 0; i < this.user_opt_goal_data.length; i++) {
        // 根节点的优化目标
        optTargets.push({
          name: this.user_opt_goal_data[i].name,
          weight: this.user_opt_goal_data[i].level
        });
      }
      this.goal_data.targetTree.goal.optTargets = optTargets;
      this.goal_data.strategy = {
        // 原来的匹配策略
        threshold: this.threshold,
        topk: this.topk,
        k: this.k,
        optimization: this.al_choose_1
      };
      console.log(this.goal_data);
      let platform_goal = [];
      if (this.platform_yn === "是") {
        platform_goal = this.platform_opt_goal_data;
      }
      this.goal_data.platform_goal = platform_goal; // 平台目标
      this.goal_data.goal_priority = this.list; // 优化目标优先级
      this.goal_data.strategy_new = this.value; // 优化策略
      console.log(this.goal_data);
      let request = "";
      if (this.center === "0" || this.center === 0) {
        request = this.sp_algorithm_url + "api/getrequest-node";
      } else {
        request = this.sp_algorithm_url + "api/getrequest-node";
      }
      console.log(request);
      this.$ajax.post(request, this.goal_data).then(res => {
        console.log(res.data);
        if (res.data.msg === "没有合适的服务方案") {
          console.log(this.center);
          if (parseInt(this.center) === 0) {
            this.$ajax
              .post(
                this.node30004_url + `api/modify-state`,
                qs.stringify({
                  requireId: this.requireId,
                  url: 1
                }),
                {
                  headers: {
                    "content-type": "application/x-www-form-urlencoded"
                  }
                }
              )
              .then(() => {
                console.log("center设置1");
              });

            this.$ajax
              .get(
                this.ios_url +
                  "require/rematch?requireId=" +
                  this.requireId +
                  "&solutionId=" +
                  this.solutionId
              )
              .then(_ => {
                alert("没有合适的服务方案，通过中心节点重新匹配需求模式");
              });
          } else {
            alert("没有合适的服务方案");
          }
        }
        console.log(res.data.url);
        window.open(res.data.url, "_self");
      });
    }
  }
};
</script>

<style>
.layout-sli {
  float: left;
  width: 300px;
  margin: 10px;
}
.layout-div {
}
.layout-content {
  font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB",
    "Microsoft YaHei", "微软雅黑", Arial, sans-serif;
  width: 600px;
  min-height: 200px;
  margin: 15px;
  overflow-x: hidden;
  background: #fff;
  border-radius: 4px;
}
.layout-p1 {
  margin: 15px;
  font-size: 25px;
}
.item {
  font-size: 12px;
  width: 300px;
  height: 20px;
}
</style>
