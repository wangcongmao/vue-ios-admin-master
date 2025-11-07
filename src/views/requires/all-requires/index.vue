<template>
  <div class="all-requires">
    <iframe
      src="http://10.147.19.68/flowable-explorer/"
      style="display: none"
    />
    <iframe
      src="http://10.147.19.68/flowable-explorer/"
      style="display: none"
    />
    <h1 style="text-align: center">
      需求维护
    </h1>
    <br />
    <div style="margin:auto;width: 80%">
      <el-header>
        <div style="margin-top:20px;margin-bottom: 20px">
          <el-row :gutter="10">
            <el-col :span="5">
              <el-input v-model="detail" placeholder="意图内容" />
            </el-col>
            <el-col :span="6">
              <el-select
                v-model="searchOption"
                placeholder="需求状态"
                value="1"
              >
                <el-option
                  v-for="(state, index) in searchRequireState"
                  :key="index"
                  :label="state.name"
                  :value="state.id"
                />
              </el-select>
            </el-col>
            <el-col v-if="this.$store.getters.curRole === 1" :span="5">
              <el-input v-model="searchUsername" placeholder="用户" />
            </el-col>
            <el-col :span="6">
              <el-button
                class="filter-item"
                type="primary"
                icon="el-icon-search"
                @click="search"
                >查找
              </el-button>
            </el-col>
          </el-row>
        </div>
      </el-header>
    </div>
    <br />
    <el-table
      id="table"
      v-loading="loading"
      :data="tableListData"
      :row-class-name="toggleDisplayTr"
      :span-method="toggleMergeRow"
      border
      class="init_table"
      size="small"
    >
      <!--            意图树-->
      <el-table-column
        label="意图"
        min-width="150"
        show-overflow-tooltip
        align="left"
      >
        <template slot-scope="scope">
          <p
            :style="
              `margin-left: ${scope.row.__level *
                15}px;margin-top:0;margin-bottom:0`
            "
          >
            <i
              class="permission_toggleFold"
              :class="toggleFoldingClass(scope.row)"
              @click="toggleFoldingStatus(scope.row)"
            />
            <span
              v-if="scope.row.__identity.indexOf(routePrefix) === 0"
              style="color: #ff291a"
            >
              {{ scope.row.goal.content }}
            </span>
            <span v-else> {{ scope.row.goal.content }} </span>
            <span
              v-if="
                typeof scope.row.rpInfo !== 'undefined' &&
                  scope.row.showRpResult
              "
            >
              <el-tag
                size="mini"
                :color="calcColor(scope.row.rpInfo.name)"
                effect="dark"
                >{{ scope.row.rpInfo.name }}</el-tag
              >
            </span>
          </p>
        </template>
      </el-table-column>
      <!--            显示约束-->
      <el-table-column align="center" min-width="200" label="约束">
        <template slot-scope="scope">
          <el-tag
            v-for="(target, index) in scope.row.goal.optTargets"
            :key="index"
            size="mini"
            type="info"
            effect="dark"
          >
            {{ target.name + ":" + target.weight }}
          </el-tag>
          <el-tag
            v-for="restrict in scope.row.goal.restricts"
            :key="restrict.key"
            size="mini"
          >
            {{ getRestrictString(restrict) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" label="提出时间">
        <template slot-scope="scope">
          <span>{{ handleTime(scope.row.requireInfo.timestamp) }}</span>
          <!-- <span v-if="scope.row.__level === 0">{{ handleTime(scope.row.requireInfo.timestamp) }}</span>-->
        </template>
      </el-table-column>
      <!--      需求处理状态-->
      <el-table-column align="center" min-width="50" label="需求处理状态">
        <template slot-scope="scope">
          <!--  <span v-if="scope.row.__level === 0">{{ getAdminState(scope.row.state, scope.row.requireInfo.state) }}</span>-->
          <span>{{
            getAdminState(scope.row.state, scope.row.requireInfo.state)
          }}</span>
        </template>
      </el-table-column>
      <!--            用户关注状态-->
      <el-table-column align="center" min-width="50" label="用户关注状态">
        <template slot-scope="scope">
          <!--          <span v-if="scope.row.__level === 0">{{ getUserState(scope.row.state) }}</span>-->
          <span>{{ getUserState(scope.row.state) }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" min-width="50" label="用户名">
        <template slot-scope="scope">
          <span>{{ scope.row.requireInfo.userId }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" min-width="50" label="匹配方式">
        <template slot-scope="scope">
          <span v-if="scope.row.flag == 1">通过中心节点匹配需求模式</span>
          <span
            v-else-if="scope.row.requireInfo.state === requireState.MATCH_RP.id"
            >通过本地节点匹配需求模式</span
          >
        </template>
      </el-table-column>
      <!--            操作-->
      <el-table-column align="center" min-width="100" label="操作">
        <template slot-scope="scope">
          <span v-if="scope.row.requireInfo.state === requireState.COMMIT.id">
            <el-button type="text" @click="matchRp(scope)">立即匹配</el-button>
            <el-button type="text" @click="modifyRequire(scope.row)"
              >修改</el-button
            >
          </span>
          <span
            v-else-if="scope.row.requireInfo.state === requireState.MATCH_RP.id"
          >
            <span>
              <el-button type="text" @click="matchSp(scope)"
                >生成服务方案</el-button
              >
            </span>
            <span>
              <el-button
                v-if="scope.row.showRpResult"
                type="text"
                @click="hiddenMatchRp(scope)"
                >隐藏匹配方案</el-button
              >
              <el-button v-else type="text" @click="showMatchRp(scope)"
                >查看匹配方案</el-button
              >
            </span>

            <!--            </span>-->
          </span>
          <span
            v-else-if="
              scope.row.requireInfo.state === requireState.TEMP_SAVE.id
            "
          >
            <el-button type="text" @click="modifyRequire(scope.row)"
              >继续编辑</el-button
            >
          </span>
          <span v-else>
            <el-button
              type="text"
              @click="openUrl(scope.row.requireInfo.serviceSchemeUrl)"
              >查看方案</el-button
            >
            <el-button type="text" @click="execute(scope.row)">执行</el-button>
          </span>
          <!--          <el-popover-->
          <!--            placement="top-start"-->
          <!--            width="200"-->
          <!--            trigger="hover">-->
          <!--            <p v-for="(val,key,i) in scope.row.contexts">{{key}}:{{val}}</p>-->

          <!--          </el-popover>-->
        </template>
      </el-table-column>
    </el-table>
    <br /><br />
    <!--    <div class="add-require">-->
    <!--      <el-row>-->
    <!--        <el-button-->
    <!--          type="primary"-->
    <!--          icon="el-icon-plus"-->
    <!--          circle-->
    <!--          @click="$router.push({path:'/requires/add-require/index'})"-->
    <!--        />-->
    <!--      </el-row>-->

    <!--    </div>-->
    <el-dialog
      :visible.sync="updateRequire.visible"
      :fullscreen="true"
      append-to-body
    >
      <div style="text-align: center;">
        <add-require-comp
          :i-tree="updateRequire.new"
          @submit="update"
          @tmp-save="tmpSave"
        />
      </div>
    </el-dialog>
    <el-dialog :visible.sync="visible" :fullscreen="true">
      <!--      <el-dialog-->
      <!--      :visible.sync="visible"-->
      <!--      :fullscreen="true"-->
      <!--      :before-close="handleClose"-->
      <!--    >-->
      <!--      <iframe :src="matchSpUrl" width="100%" :height="iframeHeight" />-->
    </el-dialog>
  </div>
</template>

<script>
import { spAlgorithmUrl, spBaseUrl } from "../utils/api";
import {
  getAdminState,
  getRestrictString,
  getUserState
} from "./restrict-options";
import {
  handleTime,
  rpRequireMap,
  ergodicGoals,
  calcColor,
  optimizationOpt,
  requireState,
  searchRequireState
} from "./util";
import qs from "qs";
import require from "@/utils/request2";
import AddRequireComp from "@/views/requires/add-require/component/AddRequireComp";
import { login } from "@/api/permission/user";

const mergeCol = new Set([
  "提出时间",
  "需求处理状态",
  "用户关注状态",
  "操作",
  "用户名",
  "匹配方式"
]);
export default {
  name: "AllRequires",
  components: { AddRequireComp },
  data() {
    return {
      searchRequireState: searchRequireState,
      requireState: requireState,
      data: [],
      userList: [],
      foldList: [],
      visible: false,
      detail: "",
      searchOption: "",
      searchUsername: "",
      flowableUrl: "",
      matchSpUrl: "",
      delsubData: { file: "", url: "" },
      selectRequire: { requireId: -1, id: -1 },
      loading: false,
      updateRequire: { visible: false, old: [], new: [] },
      matchPopoverVisible: false,
      strategy: {
        threshold: 0.5,
        topk: 10,
        k: 1,
        optimization: optimizationOpt[0]
      },
      optimizationOpt: optimizationOpt,
      routeParams: null
    };
  },
  computed: {
    routePrefix: function() {
      for (var i = 0; i < this.tableListData.length; i++) {
        if (
          typeof this.tableListData[i].requireInfo !== "undefined" &&
          this.tableListData[i].requireInfo.requireId ===
            this.routeParams.requireId
        ) {
          return this.tableListData[i].__identity;
        }
      }
    },
    tableListData: function() {
      return this.formatConversion([], this.data);
    },
    iframeHeight: function() {
      return screen.availHeight * 0.85 + "px";
    },
    username() {
      return this.$store.getters.userinfo.name;
    }
  },
  mounted() {
    this.routeParams = this.$route.query;
    console.log(this.routeParams);
    this.getAllRequire();
  },
  methods: {
    getRestrictString,
    toggleFoldingStatus(params) {
      console.log(this.foldList);
      this.foldList.includes(params.__identity)
        ? this.foldList.splice(this.foldList.indexOf(params.__identity), 1)
        : this.foldList.push(params.__identity);
    },
    toggleDisplayTr({ row, index }) {
      for (let i = 0; i < this.foldList.length; i++) {
        const item = this.foldList[i];
        // 如果foldList中元素存在于 row.__family中，则该行隐藏。  如果该行的自身标识等于隐藏元素，则代表该元素就是折叠点
        if (row.__family.includes(item) && row.__identity !== item) {
          console.log("loop row", row);
          return "foldHide";
        }
      }
      return "foldShow";
    },
    toggleFoldingClass(params) {
      return params.children.length === 0
        ? "permission_placeholder"
        : this.foldList.indexOf(params.__identity) === -1
        ? "el-icon-minus"
        : "el-icon-plus";
    },
    toggleMergeRow({ row, column, rowIndex, columnIndex }) {
      const foldList = this.foldList;

      function childrenNum(goal) {
        let num = 1;
        if (foldList.includes(goal.__identity)) {
          return num;
        }
        for (let i = 0; i < goal.children.length; i++) {
          num += childrenNum(goal.children[i]);
        }
        return num;
      }

      if (mergeCol.has(column.label)) {
        if (row.__level === 0) {
          const num = childrenNum(row);
          return {
            rowspan: num,
            colspan: 1
          };
        } else {
          return [0, 0];
        }
      }
    },
    formatConversion(
      parent,
      children,
      index = 0,
      family = [],
      elderIdentity = "x"
    ) {
      // children如果长度等于0，则代表已经到了最低层
      // let page = (this.startPage - 1) * 10
      if (children.length > 0) {
        children.map((x, i) => {
          // 设置 __level 标志位 用于展示区分层级
          this.$set(x, "__level", index);
          // 设置 __family 为家族关系 为所有父级，不包含本身在内
          this.$set(x, "__family", [...family]);
          // 本身的唯一标识  可以理解为个人的身份证咯 一定唯一。
          this.$set(x, "__identity", elderIdentity + "_" + i);
          parent.push(x);
          // 如果仍有子集，则进行递归
          if (x.children.length > 0) {
            this.formatConversion(
              parent,
              x.children,
              index + 1,
              [...family, elderIdentity + "_" + i],
              elderIdentity + "_" + i
            );
          }
        });
      }
      return parent;
    },
    getAllRequire() {
      //
      this.$ajax
        .get(
          `${
            process.env.VUE_APP_REQUIRE_BASE_URL
          }/api/get-all-requests?userId=${this.username}`
        )
        .then(response => {
          this.data = response.data;
        })
        .then(() => {
          this.data.forEach(item => {
            require
              .get(`/solution/listByRequire/${item.requireInfo.requireId}`)
              .then(res => {
                this.$set(item, "state", res[0].state);
                this.$set(item, "id", res[0].id);
              });
            this.$ajax(
              `${process.env.VUE_APP_IOS_URL}/require/match/flag?requireId=${
                item.requireInfo.requireId
              }`
            ).then(res => {
              this.$set(item, "flag", res.data);
            });
          });
        })
        .catch(_ => {
          this.$message.error("没有需求录入");
        });
    },
    matchRp(scope) {
      const requireId = scope.row.goal.requireId;
      this.loading = true;
      // TODO 改成get
      this.$ajax
        .post(`${process.env.VUE_APP_REQUIRE_BASE_URL}/api/matching`, {
          requireId: requireId
        })
        .then(response => {
          this.loading = false;
          this.$message({
            message: "匹配成功",
            type: "success"
          });
          this.getAllRequire();
        })
        .catch(response => {
          this.$message.error("匹配失败");
        });
    },
    async matchSp(scope) {
      const requireId = scope.row.goal.requireId;
      const solutionId = scope.row.id;

      // gym:这里匹配过与否都使用ios节点
      await this.$ajax(
        `${
          process.env.VUE_APP_IOS_URL
        }/require/match/flag?requireId=${requireId}`
      ).then(res => {
        if (res.data === "") {
          this.matchSpUrl = `#/service-pattern/config?solutionId=${solutionId}&requireId=${requireId}&center=0`;
        } else {
          this.matchSpUrl = `#/service-pattern/config?solutionId=${solutionId}&requireId=${requireId}&center=0`;
        }
      });
      // this.loading = true
      // this.matchSpUrl = `#/service-pattern/config?solutionId=${solutionId}&requireId=${requireId}&center=0`
      console.log(this.matchSpUrl);
      this.selectRequire.requireId = requireId;
      this.selectRequire.id = scope.row.id;
      this.visible = true;
      window.open(this.matchSpUrl, "_self");
    },
    search() {
      // if (this.detail === '') {
      //   this.$message({
      //     message: '搜索内容不可以为空',
      //     type: 'warning'
      //   })
      //   return
      // }
      if (this.searchOption === requireState.TEMP_SAVE.id) {
        this.$message({
          message: "临时提交需求不可搜索",
          type: "warning"
        });
        return;
      }
      this.$ajax
        .get(
          `${process.env.VUE_APP_REQUIRE_BASE_URL}/api/search-goal?detail=${
            this.detail
          }&option=${this.searchOption}&userId=${this.searchUsername}`
        )
        .then(response => {
          this.data = response.data;
        });
    },
    openUrl(url) {
      window.open(url);
    },
    execute(require) {
      const url = require.requireInfo.serviceSchemeUrl;
      const id = require.id;
      console.log("require", require);
      this.$ajax
        .get(
          `${process.env.VUE_APP_RP_SP_ALGORITHM_URL}/api/runscheme?inputfile=${
            url.split("=")[1]
          }&id=${id}`
        )
        .then(response => {
          this.$message({
            message: "开始执行",
            type: "success"
          });
        })
        .catch(respose => {
          this.$message.error("执行失败");
        });
    },
    showMatchRp(scope) {
      const requireId = scope.row.goal.requireId;
      scope.row.showRpResult = true;
      this.$ajax
        .get(
          `${
            process.env.VUE_APP_REQUIRE_BASE_URL
          }/api/match-result?requireId=${requireId}`
        )
        .then(response => {
          const map = rpRequireMap(response.data);
          ergodicGoals([scope.row], item => {
            if (typeof map[item.goal.goalId] !== "undefined") {
              this.$set(item, "showRpResult", true);
              this.$set(item, "rpInfo", map[item.goal.goalId]);
            }
          });
        })
        .catch(_ => {
          this.$message.error("出现错误");
        });
    },
    hiddenMatchRp(scope) {
      ergodicGoals([scope.row], item => {
        item.showRpResult = false;
      });
    },
    tmpSave(t) {
      this.updateRequire.new.forEach(item => {
        delete item.requireInfo;
        delete item.id;
        delete item.state;
      });
      this.$ajax
        .post(
          `${
            process.env.VUE_APP_REQUIRE_BASE_URL
          }/api/temp-save-itree?requireId=${this.selectRequire.requireId}`,
          {
            data: this.updateRequire.new,
            contexts: {}
          }
        )
        .then(_ => {
          this.updateRequire.visible = false;
          this.getAllRequire();
        });
    },
    update(t) {
      this.updateRequire.new.forEach(item => {
        delete item.requireInfo;
        delete item.id;
        delete item.state;
      });
      this.$ajax
        .post(
          `${
            process.env.VUE_APP_REQUIRE_BASE_URL
          }/api/modify-require?requireId=${this.selectRequire.requireId}`,
          {
            data: this.updateRequire.new,
            contexts: {}
          }
        )
        .then(_ => {
          this.updateRequire.visible = false;
          this.getAllRequire();
        });
    },
    modifyRequire(require) {
      const requireId = require.requireInfo.requireId;
      // console.log(requireId)
      this.updateRequire.old = [require];
      this.updateRequire.new = JSON.parse(JSON.stringify([require]));
      this.updateRequire.visible = true;
      this.selectRequire.requireId = require.requireInfo.requireId;
    },
    handleTime,
    calcColor,
    getUserState,
    getAdminState
  }
};
</script>

<style lang="stylus" rel="stylesheet/stylus">
.foldHide
  display none

.foldShow
.all-requires
  .search-input
    text-align center
    width 30%

  .permission_toggleFold
    vertical-align middle
    padding-right 5px
    font-size 16px
    cursor pointer

  .permission_placeholder
    content ' '
    display inline-block
    width 24px
    font-size 16px

  .init_table
    width 90% !important
    margin 0 auto !important

    th
      padding 0 !important
      height 30px !important
      line-height 30px !important
      text-align: center !important

    td
      padding 0 !important
      height 30px !important
      line-height 30px !important z

  .add-require
    position fixed
    right 5%
    bottom 10%

  .el-select .el-input
    width: 130px
</style>
