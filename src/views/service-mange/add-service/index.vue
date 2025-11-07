<template>
  <el-container>
    <el-header><h1>服务注册</h1></el-header>
    <el-main>
      <el-form ref="addForm" :model="addForm" :rules="rules" label-width="80px">
        <el-form-item label="服务名称">
          <el-input v-model="addForm.serviceName" autosize prop="serviceName" />
        </el-form-item>
        <el-form-item label="Feature">
          <el-select v-model="addForm.features" multiple placeholder="请选择">
            <el-option
              v-for="item in features"
              :key="item.featureId"
              :label="item.name"
              :value="item.featureId"
            />
          </el-select>
        </el-form-item>
<!--        <el-form-item label="所属领域">-->
<!--          <el-tree-select-->
<!--            ref="tree"-->
<!--            v-model="addForm.categories"-->
<!--            :data="treeData"-->
<!--            node-key="id"-->
<!--            size="mini"-->
<!--            :multiple="true"-->
<!--            :props="treeProps"-->
<!--          />-->
<!--        </el-form-item>-->
        <el-form-item label="所属领域">
          <el-tree-select
            ref="treeSelect"
            v-model="addForm.categories"
            :styles="styles"
            :select-params="selectParams"
            :tree-params="treeParams"
            @searchFun="_searchFun"
            @node-click="_nodeClickFun"
          />
        </el-form-item>
        <el-form-item label="提供商">
          <el-select v-model="addForm.provider" placeholder="请选择">
            <el-option
              v-for="item in providerData"
              :key="item.providerId"
              :label="item.name"
              :value="item.providerId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="服务类型">
          <el-select v-model="addForm.serviceType" placeholder="请选择">
            <el-option label="API类服务" value="API" />
            <el-option label="UI类服务" value="UI" />
            <el-option label="线下服务" value="OFFLINE" />
          </el-select>
        </el-form-item>
        <el-form-item label="区域">
          <el-input v-model="addForm.region" placeholder="请输入服务的区域，如：哈尔滨、北京" />
        </el-form-item>
        <el-form-item label="可用时间">
          <el-input v-model="addForm.workTime" placeholder="请输入服务的可用时间，格式应满足cron表达式规范,从左到右（用空格隔开）：秒 分 小时 月份中的日期 月份 星期中的日期 年份，如：0 0 8 * * 1-5 ; 4 hours  表示周一到周五的8:00-12:00" />
        </el-form-item>
        <el-form-item label="质量指标">
          <el-row v-for="serviceIndex in serviceIndexes" :key="serviceIndex.indexId">
            <el-col :span="4">{{ serviceIndex.name }}</el-col>
            <el-col :span="8"><el-checkbox :checked="true" aria-readonly="true" label="选择" /> </el-col>
          </el-row>
          <el-row v-for="serviceIndex in serviceIndexes2" :key="serviceIndex.indexId">
            <el-col :span="4">{{ serviceIndex.name }}</el-col>
            <el-col :span="8"><el-checkbox :checked="false" label="选择" /></el-col>
            <el-col :span="4"><el-button @click="removeIndex(serviceIndex)">移除该指标</el-button></el-col>
          </el-row>
          <el-row>
            <el-col :span="4">
              <el-select v-model="indexName" placeholder="请选择">
                <el-option
                  v-for="item in filterIndexes()"
                  :key="item.indexId"
                  :label="item.name"
                  :value="item"
                />
              </el-select>
            </el-col>
            <!--<el-col :span="8"><el-input v-model="indexValue" autosize /></el-col>-->
            <el-col :span="4">
              <el-button @click="attachIndex()">添加可选指标</el-button>
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item label="详细描述">
          <el-input v-model="addForm.textDescription" type="textarea" autosize placeholder="请输入详细描述" />
        </el-form-item>
        <el-form-item label="版本">
          <el-input v-model="addForm.version" autosize />
        </el-form-item>
        <el-form-item label="部署方式">
          <el-radio-group v-model="addForm.deployment.deploymentType">
            <el-radio :label="'GIT_S2I'">GIT</el-radio>
            <el-radio :label="'DOCKER'">Docker</el-radio>
            <el-radio :label="'EXTERNAL'">外部服务</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="addForm.deployment.deploymentType=='GIT_S2I'" label="GIT地址">
          <el-input v-model="addForm.deployment.gitUrl" autosize />
        </el-form-item>
        <el-form-item v-if="addForm.deployment.deploymentType=='GIT_S2I'" label="源代码分支">
          <el-input v-model="addForm.deployment.gitBranch" autosize />
        </el-form-item>
        <el-form-item v-if="addForm.deployment.deploymentType=='GIT_S2I'" label="S2I镜像">
          <el-input v-model="addForm.deployment.s2iImage" autosize />
        </el-form-item>
        <el-form-item v-if="addForm.deployment.deploymentType=='GIT_S2I'" label="S2I版本">
          <el-input v-model="addForm.deployment.s2iVersion" autosize />
        </el-form-item>
        <el-form-item v-if="addForm.deployment.deploymentType=='DOCKER'" label="Docker镜像">
          <el-input v-model="addForm.deployment.dockerImage" autosize />
        </el-form-item>
        <el-form-item label="接口类型">
          <el-radio-group v-model="addForm.deployment.protocol">
            <el-radio :label="protocols[0]" :disabled="true">SOAP/WSDL</el-radio>
            <el-radio :label="protocols[1]" :disabled="true">JSON/WADL</el-radio>
            <el-radio :label="protocols[2]">自定义</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-upload
          ref="upload"
          action="#"
          :on-change="handleFileChange"
          :multiple="false"
          :auto-upload="false"
        >
          <el-button slot="trigger" size="small" type="primary">选取接口定义文件</el-button>
        </el-upload>
        <el-form-item>
          <el-button type="primary" @click="onAdd">添加</el-button>
          <el-button @click="resetAddForm">取消</el-button>
        </el-form-item>
      </el-form>
    </el-main>
  </el-container>
</template>
<script>

import ElTreeSelect from 'el-tree-select'
import request from '@/utils/request2'
import Vue from 'vue'
Vue.use(ElTreeSelect)

const protocols = ['SOAP', 'JSON', 'default']

export default {
  // components: {
  //   ElTreeSelect
  // },
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
      categories: new Map(),
      treeProps: {
        children: 'children',
        label: 'catelogyName'
      },
      styles: {
        width: '300px'
      },
      selectParams: {
        multiple: true,
        clearable: true,
        placeholder: '请选择'
      },
      treeParams: {
        clickParent: false,
        filterable: true,
        'check-strictly': true,
        'default-expand-all': true,
        'expand-on-click-node': false,
        data: [],
        props: {
          children: 'children',
          label: 'catelogyName',
          disabled: 'disabled',
          value: 'catelogyId'
        }
      },
      providerData: [
        {
          '@id': 1,
          'providerId': 1,
          'name': 'ICES',
          'location': '哈尔滨工业大学',
          'removed': false,
          'id': 1
        },
        {
          '@id': 2,
          'providerId': 2,
          'name': '阿里巴巴',
          'location': '杭州',
          'removed': false,
          'id': 2
        }
      ],
      rpData: [],
      rpItems: [],
      features: [],
      indexName: null,
      indexValue: '',
      protocols: protocols,
      addForm: {
        serviceName: '',
        categories: [],
        provider: {
          providerId: 1
        },
        features: [],
        serviceType: 'API',
        region: '',
        workTime: '',
        textDescription: '',
        version: '',
        deployment: {
          protocol: protocols[2],
          deploymentType: 'GIT_S2I',
          gitUrl: '',
          gitBranch: '',
          s2iImage: '',
          s2iVersion: '',
          dockerImage: ''
        },
        roles: [],
        apis: []
      },
      qualityIndexes: [],
      serviceIndexes: [

      ],
      serviceIndexes2: [

      ],
      rules: {
        serviceName: [
          { required: true, message: '请输入服务名称', trigger: 'blur' },
          { regexp: /[a-zA-Z_0-9]{1,8}/, message: '长度在 2 到 8 个字符,由英文字母_和数字组成', trigger: 'blur' }
        ],
        textDescription: [
          { required: true, message: '请输入对该服务的详细描述', trigger: 'change' }
        ]
      }
    }
  },
  created: function() {
    this.loadProviders()
    this.loadCategories()
    this.loadFeatures()
    this.loadQualityIndexes()
    this.treeParams.data = this.treeData
  },
  mounted:
    function() {
      setTimeout(() => {
        this.$refs.treeSelect.treeDataUpdateFun(this.treeData)
      }, 2000)
    },
  methods: {
    async loadProviders() {
      return request({
        url: '/serviceProvider/list',
        method: 'get'
      }).then(data => {
        this.providerData = data
      })
    },
    async loadQualityIndexes() {
      return request({
        url: '/qualityIndex/list',
        method: 'get'
      }).then(data => {
        this.qualityIndexes = data
        this.serviceIndexes = this.qualityIndexes.filter(i => i.required)
        // this.serviceIndexes2 = this.qualityIndexes.filter(i => !i.required)
      })
    },
    async loadFeatures() {
      return request({
        url: '/serviceFeature/list',
        method: 'get'
      }).then(data => {
        this.features = data
      })
    },
    async loadCategories() {
      return request({
        url: '/serviceCategory/listRoots',
        method: 'get'
      }).then(data => {
        this.treeData = data
        const that = this
        function walk(list) {
          for (let i = 0; i < list.length; i++) {
            that.categories.set(list[i].catelogyId, list[i])
            if (list[i].children != null && list[i].children.length > 0) {
              walk(list[i].children)
            }
          }
        }

        walk(this.treeData)
      })
    },
    handleFileChange(file, fileList) {
      // console.info(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        // console.info(reader.result)
        const config = JSON.parse(reader.result)
        // this.addForm.deployment = config.deployment
        // this.addForm.roles = config.roles
        // this.addForm.apis = config.apis
        this.addForm.apiDefine = JSON.stringify(config)
      }
      reader.readAsText(file.raw)
    },
    onAdd() {
      function parents(node) {
        if (node == null || node.parent == null) {
          return []
        }
        return [node.parent, ...parents(node.parent)]
      }
      this.$refs['addForm'].validate((valid) => {
        if (valid) {
          console.info(this.addForm)
          const categoryMap = {}
          this.addForm.categories.forEach(i => {
            categoryMap[i] = true
          })
          const halfSet = new Set()
          this.addForm.categories.forEach(i => {
            parents(this.categories.get(i)).forEach(node => halfSet.add(node.id))
          })
          halfSet.forEach(i => {
            if (typeof categoryMap[i] === 'undefined') {
              categoryMap[i] = false
            }
          })
          this.addForm.categories = categoryMap
          console.info(this.addForm)

          if (typeof (this.addForm.provider) === 'object') {
            this.addForm.provider = this.addForm.provider.providerId
          }

          this.addForm.qualityIndexes = [].concat(this.serviceIndexes).concat(this.serviceIndexes2).map(index => index.indexId)
          // if (!this.addForm.serviceName.match(/[a-zA-Z_0-9]{1,20}/)) {
          //   alert('服务名称长度在 2 到 20 个字符,由英文字母_和数字组成')
          //   return
          // }
          if (this.addForm.deployment == null || this.addForm.deployment.deploymentType == null) {
            alert('服务接口定义文件未上传或文件中未定义服务部署内容')
            return
          }
          // TODO 完善表单验证！！！ 并将category、provider 替换成对象
          console.log(this.addForm)
          return request({
            url: '/service/create',
            method: 'post',
            data: this.addForm
          }).then((response) => {
            this.$message({
              message: '添加成功',
              type: 'success'
            })
            this.resetAddForm()
          })
            .catch(ex => {
              console.error(ex)
              this.$message.error('添加失败')
            })
        } else {
          this.$message.error('表单验证失败!')
          return false
        }
      })
    },
    resetAddForm() {
      this.$refs.addForm.resetFields()
    },
    removeIndex(index) {
      const i = this.serviceIndexes2.indexOf(index)
      this.serviceIndexes2.splice(i, 1)
    },
    attachIndex() {
      const si = Object.assign({}, this.indexName)
      si.value = this.indexValue
      this.serviceIndexes2.push(si)
    },
    filterIndexes() {
      return this.qualityIndexes
        .filter(x => !x.required)
        .filter(x => !this.serviceIndexes2.some(si => si.name === x.name))
    },
    // 下拉框修改
    _selectChange(val) {
      console.log(val, '<-select change')
    },
    // 树点击
    _nodeClickFun(data, node, vm) {
      console.log('this _nodeClickFun', this.addForm.categories, data, node)
    },
    // 树过滤
    _searchFun(value) {
      console.log(value, '<--_searchFun')
      this.$refs.treeSelect.filterFun(value)
    },
  }
}
</script>
