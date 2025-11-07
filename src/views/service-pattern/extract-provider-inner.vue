<template>
  <el-container>
    <el-header>
      <el-button
        class="filter-item"
        type="primary"
        icon="el-icon-search"
        @click="handleSearch"
      >查找</el-button>
      <el-button
        class="filter-item"
        type="primary"
        @click="randomServices"
      >随机生成服务</el-button>
      <el-button
        class="filter-item"
        type="primary"
        @click="randomLogs"
      >随机生成日志</el-button>
      <el-button
        class="filter-item"
        type="primary"
        @click="extractSSP"
      >抽取共生体模式</el-button>

    </el-header>
    <el-main>
      <el-row :gutter="10">
        <h3>组织内个体</h3>
        <el-row :gutter="10">
          <h4>原子服务</h4>
          <el-table :data="serviceData" style="width: 100%;">
            <el-table-column width="50">
              <template slot-scope="scope">
                <span>{{ scope.$index + 1 }}</span>
              </template>
            </el-table-column>
            <el-table-column
              property="serviceName"
              label="服务名称"
              width="120"
            />
            <el-table-column
              label="Feature"
            >
              <template slot-scope="scope">
                <el-tag
                  v-for="(feature,index) in scope.row.features"
                  :key="index"
                  size="mini"
                >
                  {{ feature.name }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column
              label="所属领域"
            >
              <template slot-scope="scope">
                <el-tag
                  v-for="(catelogy,index) in scope.row.categoryMappings"
                  :key="index"
                  :type="catelogy.fullLink?'success':'info'"
                  size="mini"
                >
                  {{ catelogy.category.catelogyName }}
                </el-tag>
                <!--<span style="margin-left: 10px">{{ getCatelogyName(scope.row) }}</span>-->
              </template>
            </el-table-column>
            <el-table-column
              label="服务提供商"
            >
              <template slot-scope="scope">
                <span style="margin-left: 10px">{{ scope.row.provider.name }}</span>
              </template>
            </el-table-column>
            <el-table-column label="区域" property="region" />
            <el-table-column label="时间" property="period" />
            <el-table-column
              label="相关指标"
              width="120"
            >
              <template slot-scope="scope">
                <span
                  v-for="(serviceIndex,i) in scope.row.index"
                  :key="i"
                  style="margin-left: 10px"
                >
                  {{ serviceIndex.name }}:{{ serviceIndex.value }}
                </span>
              </template>
            </el-table-column>
            <el-table-column
              property="textDescription"
              label="服务描述"
            />
          </el-table>
        </el-row>
        <el-row :gutter="10">
          <h4>抽取出的共生体服务模式</h4>
          <el-table :data="ssp">
            <el-table-column width="50">
              <template slot-scope="scope">
                <span>{{ scope.$index + 1 }}</span>
              </template>
            </el-table-column>
            <el-table-column
              property="id"
              label="ID"
            />
            <el-table-column
              property="provider"
              label="所属组织"
            />
            <el-table-column
              label="包含的服务"
            >
              <template slot-scope="scope">
                <span style="margin-left: 10px">{{ scope.row.services.map(x=>x.serviceName) }}</span>
              </template>
            </el-table-column>
            <el-table-column label="包含的Feature">
              <template slot-scope="scope">
                <span
                  v-for="(feature,i) in scope.row.features"
                  :key="i"
                  style="margin-left: 10px"
                >
                  {{ feature }}
                </span>
              </template>
            </el-table-column>
            <el-table-column
              label="相关指标"
              width="120"
            >
              <template slot-scope="scope">
                <span
                  v-for="(serviceIndex,i) in scope.row.index"
                  :key="i"
                  style="margin-left: 10px"
                >
                  {{ serviceIndex.name }}:{{ serviceIndex.value }}
                </span>
              </template>
            </el-table-column>
            <el-table-column
              property="freq"
              label="出现频率"
            />
          </el-table>
        </el-row>
        <el-row :gutter="10">
          <h3>抽取出的SSP间关系</h3>
          <el-table
            :data="dspR"
            style="width: 100%;"
            border
          >
            <el-table-column width="50">
              <template slot-scope="scope">
                <span>{{ scope.$index + 1 }}</span>
              </template>
            </el-table-column>
            <el-table-column
              property="from"
              label="head"
            />
            <el-table-column
              label="tail"
            >
              <template slot-scope="scope">
                <span style="margin-left: 10px">{{ scope.row.to }}</span>
              </template>
            </el-table-column>
            <el-table-column
              label="关系"
            >
              <template slot-scope="scope">
                <span style="margin-left: 10px">{{ scope.row.type }}</span>
              </template>
            </el-table-column>
          </el-table>
        </el-row>
        <el-row :gutter="10">
          <h3>日志</h3>
          <el-table :data="logs">
            <el-table-column width="50">
              <template slot-scope="scope">
                <span>{{ scope.$index + 1 }}</span>
              </template>
            </el-table-column>
            <el-table-column
              property="name"
              label="名称"
            />
            <el-table-column
              label="包含的服务"
            >
              <template slot-scope="scope">
                <span style="margin-left: 10px">{{ scope.row.list.map(x=>x.serviceName) }}</span>
              </template>
            </el-table-column>
          </el-table>
        </el-row>
      </el-row>
    </el-main>
  </el-container>
</template>
<script>
import request from '@/utils/request2'
export default {
  components: {
  },
  data() {
    return {
      serviceData: [],
      logs: [],
      ssp: [],
      dspR: []
    }
  },
  created: function() {
    this.refreshData()
  },
  methods: {
    async loadServices() {
      const res = await request({
        url: '/sp/services',
        method: 'get'
      })
      this.serviceData = res
    },
    async loadLogs() {
      const res = await request({
        url: '/sp/logs',
        method: 'get'
      })
      this.logs = res
    },
    async loadSSP() {
      const res = await request({
        url: '/sp/extractedSSP',
        method: 'get'
      })
      this.ssp = res
    },
    async randomServices() {
      const res = await request({
        // url: '/sp/randomService',
        url: '/sp/loadService',
        method: 'get'
      })
      this.serviceData = res
    },
    async randomLogs() {
      const res = await request({
        // url: '/sp/randomLogs',
        url: '/sp/loadLogs',
        method: 'get'
      })
      this.logs = res
    },
    async extractSSP() {
      await request({
        url: '/sp/extractSSP',
        method: 'get'
      })
      await this.loadSSP()
      this.dspR = [
        {
          from: 'extract_10',
          to: 'extract_1',
          type: '质量支配'
        },
        {
          from: 'extract_5',
          to: 'extract_0',
          type: '质量支配'
        },
        {
          from: 'extract_6',
          to: 'extract_7',
          type: 'skyline'
        },
        {
          from: 'extract_9',
          to: 'extract_8',
          type: '质量支配'
        }
      ]
    },
    refreshData() {
      this.loadServices()
      this.loadSSP()
      this.loadLogs()
    },
    handleSearch() {
      this.refreshData()
    }
  }
}
</script>
