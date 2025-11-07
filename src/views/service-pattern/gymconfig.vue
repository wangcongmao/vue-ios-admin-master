<template>
  <div class="layout-content">
<!--    <iframe :src="flowable_url" width="0" height="0" />-->
    <p class="layout-p1">匹配参数配置</p>
    <Collapse active-key="1">
      <Panel key="1">
        优化目标
        <div slot="content" style="display:inline-block">
          <div style="float: left;">
            <span style="float: left;line-height:58px;">服务质量</span>
            <Slider :value="value[0]" :tip-format="format" class="layout-sli" @on-input="opt_pol1" />
          </div>
          <div style="float: left;">
            <span style="float: left;line-height:58px;">价格</span>
            <Slider :value="value[1]" :tip-format="format" class="layout-sli" @on-input="opt_pol2" />
          </div>
          <div style="float: left;">
            <span style="float: left;line-height:58px;">响应度</span>
            <Slider :value="value[2]" :tip-format="format" class="layout-sli" @on-input="opt_pol3" />
          </div>
          <br>
        </div>
      </Panel>

      <Panel key="2">
        算法选择
        <div slot="content">
          <Radio-group v-model="al_choose">
            <Radio label="遗传算法" />
            <Radio label="粒子群优化算法" />
            <Radio label="模拟退火算法" />
          </Radio-group><br><br>
        </div>
      </Panel>
      <Panel key="3">
        算法参数设置
        <div slot="content">
          <span>健康情境匹配阈值</span>
          <Input v-model="threshold" placeholder="0.7" style="width: 100px" /><br>
          <span>生成服务方案数量</span>
          <Input v-model="topk" placeholder="10" style="width: 100px" /><br>
          <span>种群规模</span>
          <Input v-model="N" placeholder="100" style="width: 100px" /><br>
          <span>最大迭代次数</span>
          <Input v-model="Max" placeholder="200" style="width: 100px" /><br>
          <span>停止标准</span>
          <Input v-model="e" placeholder="30" style="width: 100px" /><br>
          <span>交叉率</span>
          <Input v-model="pc" placeholder="0.8" style="width: 100px" /><br>
          <span>变异率</span>
          <Input v-model="pm" placeholder="0.1" style="width: 100px" /><br>
        </div>
      </Panel>
    </Collapse><br>
    <Button type="primary" @click="getrequest()">生成服务方案</Button>
  </div>
</template>

<script>
import Vue from 'vue'
import qs from 'qs'
export default {
  name: 'Config',
  data() {
    return {
      threshold: 0.7,
      topk: 10,
      N: 100,
      Max: 200,
      e: 30,
      pc: 0.8,
      pm: 0.1,
      value: [0, 100]
    }
  },
  created() {
  },
  methods: {

  }
}
</script>

<style>
.layout-sli{
  float: left;
  width: 300px;
  margin: 10px;
}
.layout-div{

}
.layout-content{
  font-family: "Helvetica Neue",Helvetica,"PingFang SC","Hiragino Sans GB","Microsoft YaHei","微软雅黑",Arial,sans-serif;
  width: 600px;
  min-height: 200px;
  margin: 15px;
  overflow-x:hidden;
  background: #fff;
  border-radius: 4px;
}
.layout-p1{
  margin: 15px;
  font-size:25px
}
.item{
  font-size: 12px;
  width: 300px;
  height: 20px;
}
</style>
