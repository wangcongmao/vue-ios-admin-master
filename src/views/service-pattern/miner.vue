<template>
  <div class="layout-content">
    <iframe :src="flowable_url" width="0" height="0" />
    <Button type="primary" @click="getrequest()">导入日志文件</Button>
    <p class="layout-p1">参数配置</p>
    <Collapse active-key="1">
      <Panel key="1">
        算法选择
        <div slot="content">
          <Radio-group v-model="al_choose">
            <Radio label="Alpha算法" />
            <Radio label="启发式算法" />
            <Radio label="演化算法" />
          </Radio-group>
          <br /><br />
          <Radio-group v-if="al_choose === 'Alpha算法'" v-model="al_choose_1">
            <Radio label="Alpha" />
            <Radio label="Alpha+" />
            <Radio label="Alpha++" />
          </Radio-group>
          <Radio-group v-if="al_choose === '启发式算法'" v-model="al_choose_1">
            <Radio label="Heuristic Miner" />
          </Radio-group>
          <Radio-group v-if="al_choose === '遗传算法'" v-model="al_choose_1">
            <Radio label="Genetic Miner" />
            <Radio label="Evolutionary Tree Miner" />
          </Radio-group>
        </div>
      </Panel>
      <Panel key="2">
        参数
        <div slot="content">
          <span>因果关系阈值</span>
          <Input
            v-model="threshold"
            placeholder=""
            style="width: 100px"
          /><br />
          <span>并发关系阈值</span>
          <Input v-model="topk" placeholder="" style="width: 100px" /><br />
          <span>循环关系阈值</span>
          <Input v-model="k" placeholder="" style="width: 100px" /><br />
        </div>
      </Panel>

      <Panel key="3">
        优化策略
        <div slot="content" style="display:inline-block">
          <div style="float: left;">
            <span style="float: left;line-height:58px;">fitness</span>
            <Slider
              :value="value[0]"
              :tip-format="format"
              class="layout-sli"
              @on-input="opt_pol1"
            />
          </div>
          <div style="float: left;">
            <span style="float: left;line-height:58px;">simplicity</span>
            <Slider
              :value="value[1]"
              :tip-format="format"
              class="layout-sli"
              @on-input="opt_pol2"
            />
          </div>
          <div style="float: left;">
            <span style="float: left;line-height:58px;">precision</span>
            <Slider
              :value="value[2]"
              :tip-format="format"
              class="layout-sli"
              @on-input="opt_pol3"
            />
          </div>
          <div style="float: left;">
            <span style="float: left;line-height:58px;">Generalization</span>
            <Slider
              :value="value[3]"
              :tip-format="format"
              class="layout-sli"
              @on-input="opt_pol4"
            />
          </div>
          <br />
        </div>
      </Panel>
      <Panel key="4">
        资源视角
        <div slot="content">
          <span style="font-size: 15px;">是否进行资源视角挖掘</span>
          <Radio-group v-model="platform_yn">
            <Radio label="是" />
            <Radio label="否" />
          </Radio-group>
        </div>
      </Panel>
      <Panel key="5">
        数据视角
        <div slot="content">
          <span style="font-size: 15px;">是否进行数据视角挖掘</span>
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
      </Panel>
    </Collapse>
    <br />

    <Button type="primary" @click="getrequest()">挖掘模型</Button>
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
      platform_opt_goal_data: ["转化率", "平均时间", "实例数量"]
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
