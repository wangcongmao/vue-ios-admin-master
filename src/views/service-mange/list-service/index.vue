<template>
  <el-row>
    <el-col :span="6">
      <el-tree
        ref="tree"
        class="ly-tree-container"
        :data="treeData"
        show-checkbox
        default-expand-all
        node-key="@id"
        highlight-current
        :props="defaultProps"
        :expand-on-click-node="true"
        :check-on-click-node="true"
        :check-strictly="false"
        @check-change="handleChange"
      />
    </el-col>
    <el-col :span="18">
      <el-container>
        <el-header>
          <div style="margin-top:20px;margin-bottom: 20px">
            <el-row :gutter="10">
              <el-col :span="4">
                <el-input v-model="listQuery.name" placeholder="名称" />
              </el-col>
              <el-col :span="4">
                <el-input v-model="listQuery.description" placeholder="描述" />
              </el-col>
              <el-col :span="4">
                <el-input v-model="listQuery.provider" placeholder="提供商" />
              </el-col>
              <el-col :span="8">
                <el-button
                  class="filter-item"
                  type="primary"
                  icon="el-icon-search"
                  @click="handleSearch"
                >查找</el-button>
              </el-col>
            </el-row>
          </div>
        </el-header>
        <el-main>
          <el-table
            :key="tableKey"
            v-loading="listLoading"
            :data="list"
            style="width: 100%;"
            height="800"
            border
          >
            <el-table-column width="50">
              <template slot-scope="scope">
                <span>{{ scope.$index+(listQuery.page - 1) * listQuery.limit + 1 }}</span>
              </template>
            </el-table-column>
            <el-table-column
              property="serviceName"
              label="服务名称"
              width="120"
            />
            <el-table-column
              label="功能点"
              width="150"
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
              width="150"
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
              width="120"
            >
              <template slot-scope="scope">
                <span style="margin-left: 10px">{{ getProviderName(scope.row) }}</span>
              </template>
            </el-table-column>
            <el-table-column
              property="region"
              label="区域"
              width="120"
            />
            <el-table-column

              label="服务可用时间"
              width="120"
            >
              <template slot-scope="scope">
                <span style="margin-left: 10px">全天24小时</span>
              </template>
            </el-table-column>
<!--        property="workTime"    <el-table-column-->
<!--              label="相关指标"-->
<!--              width="120"-->
<!--            >-->
<!--              <template slot-scope="scope">-->
<!--                <span-->
<!--                  v-for="(serviceIndex,i) in scope.row.serviceIndices"-->
<!--                  :key="i"-->
<!--                  style="margin-left: 10px"-->
<!--                >-->
<!--                  {{ qualityIndexes.filter(q=>q.indexId==serviceIndex.id.indexId)[0].name }}:-->
<!--                  {{ serviceIndex.value }}-->
<!--                </span>-->
<!--              </template>-->
<!--            </el-table-column>-->
            <el-table-column
              property="textDescription"
              label="服务描述"
              width="120"
            />
            <el-table-column
              property="version"
              label="服务版本"
              width="120"
            />
            <el-table-column
              label="服务创建时间"
              width="120"
            >
              <template slot-scope="scope">
                <span style="margin-left: 10px">{{ scope.row.createTimestamp | formatDate }}</span>
              </template>
            </el-table-column>
<!--            <el-table-column-->
<!--              label="角色列表"-->
<!--              width="120"-->
<!--            >-->
<!--              <template slot-scope="scope">-->
<!--                <span style="margin-left: 10px">{{ getRoleName(scope.row) }}</span>-->
<!--              </template>-->
<!--            </el-table-column>-->
            <el-table-column
              label="接口详情"
              width="120"
            >
              <template slot-scope="scope">
                <router-link :to="{path:'/service-mange/list-service/list-api',query: {serviceId: scope.row.serviceId}}">查看接口详情</router-link>
              </template>
            </el-table-column>
          </el-table>
          <pagination
            v-show="total>0"
            :total="total"
            :page.sync="listQuery.page"
            :limit.sync="listQuery.limit"
            @pagination="getList"
          />
        </el-main>
      </el-container>
    </el-col>
  </el-row>
</template>
<script>
import { deepClone } from '@/utils'
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination
import request from '@/utils/request2'
import '../service-category/category.scss'
export default {
  components: {
    Pagination
  },
  filters: {
    formatDate: function(value) {
      const date = new Date(value)
      const y = date.getFullYear()
      let MM = date.getMonth() + 1
      MM = MM < 10 ? ('0' + MM) : MM
      let d = date.getDate()
      d = d < 10 ? ('0' + d) : d
      let h = date.getHours()
      h = h < 10 ? ('0' + h) : h
      let m = date.getMinutes()
      m = m < 10 ? ('0' + m) : m
      let s = date.getSeconds()
      s = s < 10 ? ('0' + s) : s
      return y + '-' + MM + '-' + d + ' ' + h + ':' + m + ':' + s
    }
  },
  data() {
    return {
      treeData: [{
        '@id': 1,
        'catelogyId': 1,
        'parent': null,
        'children': [{
          '@id': 2,
          'catelogyId': 2,
          'parent': 1,
          'children': [{
            '@id': 3,
            'catelogyId': 3,
            'parent': 2,
            'children': [],
            'catelogyName': '出租车',
            'description': '出租车',
            'removed': false,
            'id': 3
          }],
          'catelogyName': '租车',
          'description': '各类与租车相关的业务',
          'removed': false,
          'id': 2
        }],
        'catelogyName': '交通',
        'description': '交通类服务',
        'removed': false,
        'id': 1
      }],
      defaultProps: {
        children: 'children',
        label: 'catelogyName'
      },
      tableKey: 0,
      list: null,
      total: 1,
      listLoading: false,
      listQuery: {
        page: 1,
        limit: 10,
        name: '',
        description: '',
        category: '',
        provider: ''
      },
      providerData: [
        {
          providerId: 1,
          name: '本地服务',
          location: '哈工大'
        }, {
          providerId: 2,
          name: '阿里',
          location: '杭州'
        }, {
          providerId: 3,
          name: '腾讯',
          location: '深圳'
        }
      ],
      qualityIndexes: []
    }
  },
  created: function() {
    this.loadCategory().then(() => this.getList())
    this.loadQualityIndexes()
  },
  methods: {
    async loadQualityIndexes() {
      return request({
        url: '/qualityIndex/list',
        method: 'get'
      }).then(data => {
        this.qualityIndexes = data
        // this.serviceIndexes2 = this.qualityIndexes.filter(i => !i.required)
      })
    },
    loadCategory() {
      return request({
        url: '/serviceCategory/listRoots',
        method: 'get'
      }).then(data => {
        this.treeData = data
      })
    },
    async getList() {
      this.listLoading = true
      // If the Promise is rejected, the rejected value is thrown.
      try {
        const query = deepClone(this.listQuery)
        query.page = 0
        const choosed = this.$refs.tree.getCheckedNodes(false, false)
        if (choosed.length > 0) {
          const paths = choosed.map(node => this.$refs.tree.getNodePath(node)).sort((a, b) => a.length - b.length)
          const results = []
          results.push(paths[0])
          out_for:
          for (let i = 1; i < paths.length; i++) {
            for (let j = 0; j < results.length; j++) {
              if (paths[i].length === results[j].length) {
                continue
              }
              if (results[j].every((value, index) => value.id === paths[i][index].id)) {
                continue out_for
              }
            }
            results.push(paths[i])
          }
          query.category = results.map(value => value[value.length - 1].catelogyName).join(',')
        }
        const res = await request({
          url: '/service/query',
          method: 'get',
          params: query
        })
        this.listLoading = false
        this.list = res.content
        // this.total = res.totalElements
        this.total= 500
      } catch (e) {
        this.listLoading = false
      }
    },
    handleSearch() {
      this.getList()
    },
    handleChange(node, checked) {
      // console.info(node,checked);
      // if (checked) {
      //   this.$refs.tree.setCheckedKeys([node['@id']])
      //   this.currentId = node.id
      //   this.viewForm = this.$refs.tree.getCheckedNodes()[0]
      // }
    },
    getCatelogyName(row) {
      return row.categories.map(category => category.catelogyName).join(',')
    }, getRoleName(row) {
      return row.roles.map(role => role.id.name).join(',')
    },
    getProviderName(row) {
      return row.provider.name
    }
  }
}
</script>
