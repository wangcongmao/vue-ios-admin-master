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
          <service-table ref="serviceTable" :list-query="listQuery2" />
        </el-main>
      </el-container>
    </el-col>
  </el-row>
</template>
<script>
import { deepClone } from '@/utils'
import request from '@/utils/request2'
import ServiceTable from './service-table'
import '../domain/category.scss'
export default {
  components: {
    ServiceTable
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
      listQuery: {
        page: 1,
        limit: 10,
        name: '',
        description: '',
        category: '',
        provider: ''
      },
      listQuery2: {
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
    this.loadCategory()
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
    handleSearch() {
      const query = deepClone(this.listQuery)
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
      this.listQuery2 = query
      this.$refs['serviceTable'].getList()
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
