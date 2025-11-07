<template>
  <el-container>
    <el-header><h1>服务模式注册</h1></el-header>
    <el-main>
      <br>
      <h2>服务模式模板信息</h2>
      <br>
      <el-card class="box-card">
        <el-row>
          <el-col :span="4">模式名称</el-col>
          <el-col :span="8">{{ sptInfo.name }}</el-col>
        </el-row>
        <el-row>
          <el-col :span="4">详细描述</el-col>
          <el-col :span="8">{{ sptInfo.description }}</el-col>
        </el-row>
        <el-row>
          <el-col :span="4">所属领域</el-col>
          <el-tag
            v-for="(category,index) in sptInfo.categories"
            :key="index"
            size="mini"
          >
            {{ category.name }}
          </el-tag>
        </el-row>
      </el-card>
      <br>
      <h2>服务模式</h2>
      <br>
      <!--基本信息表单-->
      <el-form ref="addForm" :model="addForm" label-width="80px">
        <el-form-item label="模式名称" prop="spName">
          <el-input v-model="addForm.spName" autosize/>
        </el-form-item>
        <el-form-item label="详细描述" prop="spFunc">
          <el-input v-model="addForm.spFunc" type="textarea" autosize placeholder="请输入详细描述"/>
        </el-form-item>
      </el-form>
      <!--属性的表单-->
      <el-form ref="properties" :model="addForm.properties" label-width="auto">
        <el-table
          ref="table"
          border
          :header-cell-style="{ 'text-align': 'center' }"
          :cell-style="{ 'text-align': 'center' }"
          :data="addForm.properties"
          style="width: 100%"
          highlight-current-row
        >
          <el-table-column align="center" label="属性名">
            <template slot-scope="scope">
              <!--表格里面嵌套表单-->
              <el-form-item :prop="scope.$index + '.name'">
                <el-input
                  v-model="addForm.properties[scope.$index].name"
                  autocomplete="off"
                  size="small"
                  readonly
                />
              </el-form-item>
            </template>
          </el-table-column>

          <el-table-column align="center" label="单位">
            <template slot-scope="scope">
              <el-form-item :prop="scope.$index + '.unit'">
                <el-input
                  v-model="addForm.properties[scope.$index].unit"
                  autocomplete="off"
                  size="small"
                  readonly
                />
              </el-form-item>
            </template>
          </el-table-column>
          <el-table-column align="center" label="误差阈值">
            <template slot-scope="scope">
              <el-form-item
                :prop="scope.$index + '.threshold'"
              >
                <el-input
                  v-model="addForm.properties[scope.$index].threshold"
                  autocomplete="off"
                  size="small"
                  readonly
                />
              </el-form-item>
            </template>
          </el-table-column>
          <el-table-column align="center" label="值" prop="value">
            <template slot-scope="scope">
              <el-form-item
                :prop="scope.$index + '.value'"
              >
                <el-select
                  v-if="(addForm.properties[scope.$index].couldSelect===true||addForm.properties[scope.$index].options.length>0)&&addForm.properties[scope.$index].couldMulti===false"
                  v-model="addForm.properties[scope.$index].value"
                  placeholder="请选择"
                >
                  <el-option
                    v-for="(item,index) in addForm.properties[scope.$index].options"
                    :key="index"
                    :lablel="item.value"
                    :value="item.value"
                  />
                </el-select>
                <el-select
                  v-else-if="(addForm.properties[scope.$index].couldSelect===true||addForm.properties[scope.$index].options.length>0)&&addForm.properties[scope.$index].couldMulti===true"
                  v-model="addForm.properties[scope.$index].value"
                  placeholder="请选择"
                  multiple
                >
                  <el-option
                    v-for="(item,index) in addForm.properties[scope.$index].options"
                    :key="index"
                    :lablel="item.value"
                    :value="item.value"
                  />
                </el-select>
                <el-input
                  v-else
                  v-model="addForm.properties[scope.$index].value"
                  autocomplete="off"
                  size="small"
                  placeholder="区间类型用-间隔"
                />
              </el-form-item>

            </template>
          </el-table-column>
          <el-table-column fixed="right" label="操作" width="100">
            <template slot-scope="scope">
              <el-button
                type="text"
                size="small"
                @click="handleDeleteRow(addForm.properties[scope.$index])"
              >删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-form>
      <div>
        <el-button type="primary" @click="onAdd">保存并添加流程</el-button>
        <el-button @click="resetAddForm">取消</el-button>
      </div>
    </el-main>
  </el-container>
</template>
<script>

export default {
  name: 'SpAdd',
  data() {
    return {
      sp_url: process.env.VUE_APP_SP_BASE_URL,
      activiti_url: process.env.VUE_APP_ACTIVITI_URL,
      flowable_url: process.env.VUE_APP_FLOWABLE_URL,
      initData: {},
      addForm: {
        spName: '',
        spFunc: '',
        properties: []
      },
      sptInfo: this.$route.params.sptInfo
      // todo：表单验证
      // rules: {
      //   spName: [
      //     { required: true, message: '请输入服务模式名称', trigger: 'blur' },
      //     { regexp: /[a-zA-Z_0-9]{1,8}/, message: '长度在 2 到 8 个字符,由英文字母_和数字组成', trigger: 'blur' }
      //   ],
      //   spFunc: [
      //     { required: true, message: '请输入对该服务模式的详细描述', trigger: 'change' }
      //   ]
      // }
    }
  },
  created: function() {
    this.loadData()
  },

  methods: {
    loadData() {
      //  遍历sptInfo的sptProperties，将其转换为addForm的properties
      for (let i = 0; i < this.sptInfo.sptProperties.length; i++) {
        const sptProperty = this.sptInfo.sptProperties[i]
        const property = {
          index: i,
          sptPropertyId: sptProperty.sptPropertyId,
          name: sptProperty.sptPropertyName,
          unit: sptProperty.unit,
          isMust: sptProperty.isMust,
          threshold: sptProperty.threshold,
          value: sptProperty.defaultValue,
          couldSelect: sptProperty.couldSelect,
          couldMulti: sptProperty.couldMulti,
          options: sptProperty.options
        }
        if (sptProperty.options.length > 0) {
          for (let j = 0; j < sptProperty.options.length; j++) {
            if (sptProperty.options[j].valueType === 'region') {
              sptProperty.options[j].value = sptProperty.options[j].minValue + '-' + sptProperty.options[j].maxValue
            }
          }
        }
        this.addForm.properties.push(property)
        this.initData = JSON.parse(JSON.stringify(this.addForm))
      }
    },
    onAdd() {
      // this.$refs['addForm'].validate((valid) => {
      //   if (valid) {
      // TODO 完善表单验证！！！
      for (let i = this.addForm.properties.length - 1; i >= 0; i--) {
        if (this.addForm.properties[i].value === undefined || this.addForm.properties[i].value == null || this.addForm.properties[i].value === '') {
          this.addForm.properties.splice(i, 1)
        }
      }
      var date = new Date()
      var year = date.getFullYear()
      var month = (date.getMonth() + 1).toString()
      var strDate = date.getDate()
      var hour = date.getHours()
      var min = date.getMinutes()
      var sec = date.getSeconds()
      if (month >= 1 && month <= 9) {
        month = '0' + month
      }
      if (strDate >= 0 && strDate <= 9) {
        strDate = '0' + strDate
      }
      if (min >= 0 && min <= 9) {
        min = '0' + min
      }
      if (sec >= 0 && sec <= 9) {
        sec = '0' + sec
      }
      // 使用当前时间
      var spId = year + month + strDate + hour + min + sec
      this.$ajax.post(this.sp_url + '/addsp', {
        spId: spId,
        spName: this.addForm.spName,
        spFunc: this.addForm.spFunc,
        sptId: this.sptInfo.sptId,
        propertyJson: JSON.stringify(this.addForm.properties),
        spProcess: '0'
      })
        .then(response => {
          if (response.status === 200) {
            this.$ajax(this.activiti_url + '/add_new_model?id=' + spId + '&name=' + this.addForm.spName)
              .then(res => {
                if (res.data === 'success') {
                  this.$message({
                    message: '导入服务模式文件成功! 访问 ' + this.flowable_url + '/modeler.html?modelId=' + spId + ' 修改文件。',
                    type: 'success'
                  })
                  window.open(this.flowable_url + '/modeler.html?modelId=' + spId)
                }
              })
              .catch(function(error) {
                console.log(error)
                this.$message.error('activiti、flowable创建模型失败')
              })
            this.resetAddForm()
          }
        })
        .then((data) => {
          this.$message({
            message: '提交成功',
            type: 'success'
          })
        })
        .catch(function(error) {
          console.error(error)
          this.$message.error('提交失败')
          return false
        })
      // } else {
      //   alert('表单验证失败!!')
      //   return false
      // }
      // })
    },
    /**
     * 删除行
     * @param row
     */
    handleDeleteRow(row) {
      const datas = this.addForm.properties
      console.info(datas)
      console.info(row)
      const index = datas.findIndex(d => d.sptPropertyId === row.sptPropertyId)
      datas.splice(index, 1)
    },
    resetAddForm() {
      console.log('reset add form')
      if (this.initData.properties !== undefined) {
        this.addForm.properties = JSON.parse(JSON.stringify(this.initData.properties))
      }
      this.$refs.addForm.resetFields()
      this.$refs.properties.resetFields()
    }

  }

}
</script>
<style>
/* 隐藏多选框 */
.disabled-column .el-checkbox__input {
  display: none;
}
</style>
