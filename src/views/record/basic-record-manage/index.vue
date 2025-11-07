<template>
  <div style="margin:30px">

    <el-form ref="elForm" :model="formData" :rules="rules" size="mini" label-width="100px">
      <el-row :gutter="10">
        <el-col :span="8">
          <el-form-item label="姓名" prop="userName">
            <el-input v-model="formData.userName" clearable :style="{width: '100%'}" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="身份证号" prop="idNumber">
            <el-input v-model="formData.idNumber" clearable :style="{width: '100%'}" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="性别" prop="gender">
            <el-radio-group v-model="formData.gender" size="medium">
              <el-radio
                v-for="(item, index) in genderOptions"
                :key="index"
                :label="item.value"
                :disabled="item.disabled"
              >{{ item.label }}
              </el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="10">
        <el-col :span="8">
          <el-form-item label="年龄" prop="age">
            <el-input v-model="formData.age" clearable :style="{width: '100%'}" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="出生日期" prop="birthDate">
            <el-date-picker
              v-model="formData.birthDate"
              format="yyyy-MM-dd"
              value-format="yyyy-MM-dd"
              :style="{width: '100%'}"
              clearable
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="政治面貌" prop="politicalStatus">
            <el-select v-model="formData.politicalStatus" clearable :style="{width: '100%'}">
              <el-option
                v-for="(item, index) in politicalStatusOptions"
                :key="index"
                :label="item.label"
                :value="item.value"
                :disabled="item.disabled"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="10">
        <el-col :span="8">
          <el-form-item label="民族" prop="ethnicity">
            <el-input v-model="formData.ethnicity" clearable :style="{width: '100%'}" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="文化程度" prop="educationLevel">
            <el-select v-model="formData.educationLevel" clearable :style="{width: '100%'}">
              <el-option
                v-for="(item, index) in educationLevelOptions"
                :key="index"
                :label="item.label"
                :value="item.value"
                :disabled="item.disabled"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="婚姻状况" prop="maritalStatus">
            <el-select v-model="formData.maritalStatus" clearable :style="{width: '100%'}">
              <el-option
                v-for="(item, index) in maritalStatusOptions"
                :key="index"
                :label="item.label"
                :value="item.value"
                :disabled="item.disabled"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="10">
        <el-col :span="8">
          <el-form-item label="子女状况" prop="childrenStatus">
            <el-input v-model="formData.childrenStatus" clearable :style="{width: '100%'}" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="血型" prop="bloodType">
            <el-select v-model="formData.bloodType" clearable :style="{width: '100%'}">
              <el-option
                v-for="(item, index) in bloodTypeOptions"
                :key="index"
                :label="item.label"
                :value="item.value"
                :disabled="item.disabled"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="固定电话" prop="fixedPhone">
            <el-input v-model="formData.fixedPhone" clearable :style="{width: '100%'}" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="10">
        <el-col :span="8">
          <el-form-item label="移动电话" prop="mobilePhone">
            <el-input v-model="formData.mobilePhone" clearable :style="{width: '100%'}" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="邻居姓名" prop="neighborName">
            <el-input v-model="formData.neighborName" clearable :style="{width: '100%'}" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="邻居电话" prop="neighborPhone">
            <el-input v-model="formData.neighborPhone" clearable :style="{width: '100%'}" />
          </el-form-item>
        </el-col>
        <el-row :gutter="10">
          <el-col :span="8">
            <el-form-item label="紧急联系人" prop="emergencyContact">
              <el-input v-model="formData.emergencyContact" clearable :style="{width: '100%'}" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="联系人电话" prop="contactPhone">
              <el-input v-model="formData.contactPhone" clearable :style="{width: '100%'}" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-col :span="24">
          <el-form-item label="详细地址" prop="detailedAddress">
            <el-input
              v-model="formData.detailedAddress"
              type="textarea"
              :autosize="{minRows: 1, maxRows: 4}"
              :style="{width: '100%'}"
            />
          </el-form-item>
        </el-col>
        <el-row>
          <el-form-item label="居民类别" prop="residentCategory">
            <el-checkbox-group v-model="formData.residentCategory" size="medium">
              <el-checkbox
                v-for="(item, index) in residentCategoryOptions"
                :key="index"
                :label="item.value"
                :disabled="item.disabled"
              >{{ item.label }}
              </el-checkbox>
            </el-checkbox-group>
          </el-form-item>
        </el-row>
        <el-col :span="24">
          <el-form-item size="large">
            <el-button type="primary" @click="submitForm">更新</el-button>
            <el-button @click="resetForm">重置</el-button>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
  </div>
</template>
<script>
import VueFormGenerator from 'vue-form-generator'
import 'vue-form-generator/dist/vfg.css' // optional full css additions
import Vue from 'vue'
import request from '@/utils/request-requires'

Vue.use(VueFormGenerator)

export default {
  components: {},
  props: [],
  data() {
    return {
      userId: this.$store.getters.userinfo.name,
      formData: {
        userId: this.$store.getters.userinfo.name,
        userName: undefined,
        idNumber: undefined,
        gender: undefined,
        age: undefined,
        birthDate: undefined,
        ethnicity: undefined,
        politicalStatus: undefined,
        educationLevel: undefined,
        maritalStatus: undefined,
        childrenStatus: undefined,
        bloodType: undefined,
        fixedPhone: undefined,
        mobilePhone: undefined,
        neighborName: undefined,
        neighborPhone: undefined,
        emergencyContact: undefined,
        contactPhone: undefined,
        detailedAddress: undefined,
        residentCategory: []
      },
      rules: {
        userName: [{
          required: true,
          message: '姓名不能为空',
          trigger: 'blur'
        }],
        idNumber: [{
          required: true,
          message: '身份证号不能为空',
          trigger: 'blur'
        }, {
          pattern: /^([1-6][1-9]|50)\d{4}(18|19|20)\d{2}((0[1-9])|10|11|12)(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/,
          message: '请输入正确身份证号',
          trigger: 'blur'
        }],
        gender: [{
          required: true,
          message: '性别不能为空',
          trigger: 'change'
        }],
        age: [{
          required: true,
          message: '年龄不能为空',
          trigger: 'blur'
        }],
        birthDate: [{
          required: true,
          message: '出生日期不能为空',
          trigger: 'change'
        }],
        ethnicity: [],
        politicalStatus: [],
        educationLevel: [],
        maritalStatus: [],
        childrenStatus: [],
        bloodType: [],
        fixedPhone: [],
        mobilePhone: [],
        neighborName: [],
        neighborPhone: [],
        emergencyContact: [{
          required: true,
          message: '紧急联系人姓名不能为空',
          trigger: 'blur'
        }],
        contactPhone: [{
          required: true,
          message: '紧急联系人电话不能为空',
          trigger: 'blur'
        }],
        detailedAddress: [{
          required: true,
          message: '详细地址不能为空',
          trigger: 'blur'
        }],
        residentCategory: []
      },
      genderOptions: [{
        'label': '男',
        'value': 1
      }, {
        'label': '女',
        'value': 2
      }],
      politicalStatusOptions: [{
        'label': '群众',
        'value': 13
      }, {
        'label': '中共党员',
        'value': 1
      }, {
        'label': '中共预备党员',
        'value': 2
      }, {
        'label': '共青团员',
        'value': 3
      }, {
        'label': '民革党员',
        'value': 4
      }, {
        'label': '民盟盟员',
        'value': 5
      }, {
        'label': '民建会员',
        'value': 6
      }, {
        'label': '民进会员',
        'value': 7
      }, {
        'label': '农工党党员',
        'value': 8
      }, {
        'label': '致公党党员',
        'value': 9
      }, {
        'label': '九三学社社员',
        'value': 10
      }, {
        'label': '台盟盟员',
        'value': 11
      }, {
        'label': '无党派人士',
        'value': 12
      }],
      educationLevelOptions: [{
        'label': '硕士及以上',
        'value': 1
      }, {
        'label': '本科',
        'value': 2
      }, {
        'label': '大专',
        'value': 3
      }, {
        'label': '中专/中技',
        'value': 4
      }, {
        'label': '技工学校',
        'value': 5
      }, {
        'label': '高中',
        'value': 6
      }, {
        'label': '初中',
        'value': 7
      }, {
        'label': '小学',
        'value': 8
      }, {
        'label': '半文盲',
        'value': 9
      }, {
        'label': '文盲',
        'value': 10
      }],
      maritalStatusOptions: [{
        'label': '未婚',
        'value': 1
      }, {
        'label': '已婚',
        'value': 2
      }, {
        'label': '离异',
        'value': 3
      }, {
        'label': '丧偶',
        'value': 4
      }],
      bloodTypeOptions: [{
        'label': 'O型',
        'value': 1
      }, {
        'label': 'A型',
        'value': 2
      }, {
        'label': 'B型',
        'value': 3
      }, {
        'label': 'AB型',
        'value': 4
      }],
      residentCategoryOptions: [{
        'label': '低保老人',
        'value': 1
      }, {
        'label': '特困老人（三无、低保等)',
        'value': 2
      }, {
        'label': '失独老人',
        'value': 3
      }, {
        'label': '重点优待对象',
        'value': 4
      }, {
        'label': '独居老人',
        'value': 5
      }, {
        'label': '空巢（留守）老人',
        'value': 6
      }, {
        'label': '失能老人',
        'value': 7
      }, {
        'label': '低保边缘等低收入群体',
        'value': 8
      }, {
        'label': '残疾',
        'value': 9
      }]
    }
  },
  computed: {},
  watch: {},
  created() {
    this.getRecordBasic()
  },
  mounted() {
  },
  methods: {
    submitForm() {
      function myjoin(array) {
        if (array !== undefined) {
          return array.join(',')
        }
      }
      this.$refs['elForm'].validate(valid => {
        if (valid) {
          // TODO 提交表单
          this.formData.residentCategory = myjoin(this.formData.residentCategory)
          console.log(this.formData)
          return request({
            url: '/api/upload-record-basic',
            method: 'post',
            data: this.formData
          }).then((response) => {
            this.$message({
              message: '添加成功',
              type: 'success'
            })
            // this.resetAddForm()
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
    resetForm() {
      this.$refs['elForm'].resetFields()
    },
    getRecordBasic() {
      function split(string) {
        if (string !== undefined && string !== null) {
          return string.split(',').map(Number)
        } else {
          return []
        }
      }
      const params = {
        userId: this.userId
      }
      return request({
        url: '/api/get-record-basic',
        method: 'get',
        params: params
      }).then((response) => {
        if (response.status === 200) {
          this.$message({
            message: '获取成功',
            type: 'success'
          })

          response.data.residentCategory = split(response.data.residentCategory)
          this.formData = response.data
        } else {
          this.$message.info('未创建基础档案')
        }
      })
        .catch(ex => {
          console.info(ex)
          this.$message.info('获取失败')
        })
    }
  }
}

</script>
<style>
</style>
