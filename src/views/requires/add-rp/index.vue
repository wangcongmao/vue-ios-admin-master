<template>
  <div id="add-rp">
    <h1>新增需求模式</h1>
    <br>
    <el-card class="box-card">
      <el-form ref="form" label-width="80px">
        <el-form-item label="名称:">
          <el-input v-model="info.name" placeholder="请输入" size="small" />
        </el-form-item>
        <el-form-item label="功能描述:">
          <el-input v-model="info.description" placeholder="请输入" size="small" />
        </el-form-item>
        <el-form-item label="业务领域:">
          <el-input v-model="info.domain" placeholder="请输入" size="small" />
        </el-form-item>
        <el-form-item label="档案:">
          <el-button @click="dialogVisible = true">关联健康档案</el-button>
          <record :visible.sync="dialogVisible" title="健康档案表单" @getRHData="RHData" />
          <el-tag v-for="(target, index) in rprhDataShow" :key="index" size="mini" type="success">
            {{ target.key + ':' + target.value }}
          </el-tag>
        </el-form-item>
      </el-form>
    </el-card>
    <br>
    <tree-table :data="requirePattern" :is-tree="false" @submit="uploadGoalTree" />
  </div>
</template>

<script>
import TreeTable from '.././component/TreeTable'
import Record from '../add-require/component/RecordComp'
import { isString } from '@/utils/validate'
import request from '@/utils/request-requires'

export default {
  name: 'AddRP',
  components: {
    TreeTable,
    Record
  },
  data() {
    return {
      name: '',
      info: {
        name: '',
        description: '',
        domain: ''
      },
      dialogVisible: false,
      requirePattern: [{
        id: 0,
        goal: {
          content: 'goal',
          restricts: []
        },
        children: []
      }],
      rprhData: {},
      rprhDataShow: [],
      rpId: 0,
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
      }],
      consciousnessOptions: [{
        'label': '清醒',
        'value': 1
      }, {
        'label': '意识模糊',
        'value': 2
      }, {
        'label': '谵妄',
        'value': 3
      }, {
        'label': '嗜睡',
        'value': 4
      }, {
        'label': '昏睡',
        'value': 5
      }, {
        'label': '浅昏迷',
        'value': 6
      }, {
        'label': '深昏迷',
        'value': 7
      }],
      skinOptions: [{
        'label': '完整',
        'value': 1
      }, {
        'label': '破损',
        'value': 2
      }, {
        'label': '压疮',
        'value': 3
      }],
      limbMobilityOptions: [{
        'label': '正常',
        'value': 1
      }, {
        'label': '部分病变',
        'value': 2
      }],
      visionStatusOptions: [{
        'label': '良好',
        'value': 1
      }, {
        'label': '视物模糊',
        'value': 2
      }, {
        'label': '失明',
        'value': 3
      }],
      languageCommunicationOptions: [{
        'label': '正常',
        'value': 1
      }, {
        'label': '表达不流畅',
        'value': 2
      }, {
        'label': '能听懂但无法表达',
        'value': 3
      }, {
        'label': '完全丧失',
        'value': 4
      }],
      lifeCareOptions: [{
        'label': '完全自理',
        'value': 1
      }, {
        'label': '轻度依赖',
        'value': 2
      }, {
        'label': '中度依赖',
        'value': 3
      }, {
        'label': '重度依赖',
        'value': 4
      }],
      urineOptions: [{
        'label': '正常',
        'value': 1
      }, {
        'label': '排尿困难',
        'value': 2
      }, {
        'label': '尿失禁',
        'value': 3
      }, {
        'label': '尿潴留',
        'value': 4
      }, {
        'label': '留置导尿管',
        'value': 5
      }],
      stoolOptions: [{
        'label': '正常',
        'value': 1
      }, {
        'label': '腹泻',
        'value': 2
      }, {
        'label': '失禁',
        'value': 3
      }, {
        'label': '便秘',
        'value': 4
      }, {
        'label': '肠造瘘',
        'value': 5
      }],
      catheterOptions: [{
        'label': '胃管',
        'value': 1
      }, {
        'label': '导尿管',
        'value': 2
      }, {
        'label': '精致留置针',
        'value': 3
      }, {
        'label': '引流管',
        'value': 4
      }, {
        'label': 'PICC',
        'value': 5
      }, {
        'label': '其他',
        'value': 6
      }],
      allergyHistoryOptions: [{
        'label': '青霉素',
        'value': 1
      }, {
        'label': '磺胺',
        'value': 2
      }, {
        'label': '链霉素',
        'value': 3
      }, {
        'label': '头孢',
        'value': 4
      }, {
        'label': '其他(药物)',
        'value': 5
      }, {
        'label': '其他(食物)',
        'value': 6
      }, {
        'label': '无',
        'value': 7
      }],
      medicalHistoryOptions: [{
        'label': '高血压',
        'value': 1
      }, {
        'label': '糖尿病',
        'value': 2
      }, {
        'label': '冠心病',
        'value': 3
      }, {
        'label': '脑卒中',
        'value': 4
      }, {
        'label': '慢性支气管炎',
        'value': 5
      }, {
        'label': '哮喘',
        'value': 6
      }, {
        'label': '肿瘤',
        'value': 7
      }, {
        'label': '其他',
        'value': 8
      }, {
        'label': '无',
        'value': 9
      }],
      fallHistoryOptions: [{
        'label': '无',
        'value': 1
      }, {
        'label': '有',
        'value': 2
      }],
      infectiousDiseaseHistoryOptions: [{
        'label': '无',
        'value': 1
      }, {
        'label': '乙肝',
        'value': 2
      }, {
        'label': '肺结核',
        'value': 4
      }, {
        'label': 'HIV',
        'value': 5
      }, {
        'label': '其他',
        'value': 6
      }],
      surgeryHistoryOptions: [{
        'label': '无',
        'value': 1
      }, {
        'label': '有',
        'value': 2
      }],
      fractureHistoryOptions: [{
        'label': '无',
        'value': 1
      }, {
        'label': '有',
        'value': 2
      }],
      englishToChinese: {
        'residentCategory': { name: '居民类别', type: 'array', options: null },
        'consciousness': { name: '神智', type: 'array', options: null },
        'skin': { name: '皮肤', type: 'array', options: null },
        'limbMobility': { name: '四肢活动度', type: 'array', options: null },
        'visionStatus': { name: '视力情况', type: 'array', options: null },
        'languageCommunication': { name: '语言及沟通能力', type: 'array', options: null },
        'lifeCare': { name: '自理能力', type: 'array', options: null },
        'urine': { name: '小便', type: 'array', options: null },
        'stool': { name: '大便', type: 'array', options: null },
        'catheter': { name: '带管', type: 'array', options: null },
        'allergyHistory': { name: '过敏史', type: 'array', options: null },
        'medicalHistory': { name: '疾病史', type: 'array', options: null },
        'fallHistory': { name: '跌倒史', type: 'array', options: null },
        'infectiousDiseaseHistory': { name: '传染病史', type: 'array', options: null },
        'surgeryHistory': { name: '手术史', type: 'array', options: null },
        'surgeryDetails': { name: '手术详情', type: 'string', options: undefined },
        'fractureHistory': { name: '骨折史', type: 'array', options: null },
        'fractureDetails': { name: '骨折详情', type: 'string', options: undefined },
        'medicationStatus': { name: '服药情况', type: 'array', options: undefined }
      }

    }
  },
  created() {
    // 在created()中进行this操作
    var _this = this // 保存this一开始指向的对象

    for (const key in _this.englishToChinese) {
      _this.englishToChinese[key].options = _this[key + 'Options']
    }
  },
  methods: {
    uploadGoalTree() {
      this.$ajax.post(`${process.env.VUE_APP_REQUIRE_BASE_URL}/api/upload-require-pattern`, {
        info: this.info,
        data: this.requirePattern
      }).then((response) => {
        this.rpId = response.data
        this.$message({
          message: '提交成功',
          type: 'success'
        })

        for (const key in this.rprhData) {
          if (Object.prototype.hasOwnProperty.call(this.rprhData, key)) {
            if (Array.isArray(this.rprhData[key])) {
              this.rprhData[key] = this.rprhData[key].join(',')
            }
          }
        }
        this.rprhData.rpId = this.rpId
        request({
          url: '/api/upload-rp-rh',
          method: 'post',
          data: this.rprhData
        }).then((response) => {
          this.$message({
            message: '绑定健康信息成功',
            type: 'success'
          })
        })
          .catch(ex => {
            console.error(ex)
            this.$message.error('绑定健康信息失败')
          })
      }).catch((response) => {
        this.$message.error('提交失败')
      })
    },
    RHData(data) {
      this.rprhData = data
      this.rprhDataShow = [] // 修改档案前需要清空之前的
      for (const key in data) {
        if (Object.hasOwnProperty.call(data, key)) {
          const value = data[key]
          const o = {
            key: '',
            value: ''
          }
          if (value === undefined) {
            continue
          } else if (Array.isArray(value)) {
            if (value.length === 0) {
              continue
            } else {
              o.key = this.englishToChinese[key].name
              const options = this.englishToChinese[key].options
              console.log(options)
              value.forEach((v, i) => {
                let optionLabel
                for (let j = 0; j < options.length; j++) {
                  if (options[j].value === v) {
                    optionLabel = options[j].label
                    break
                  }
                }
                if (i !== 0) o.value = o.value.concat(',' + optionLabel)
                else o.value = o.value.concat(optionLabel)
              }
              )
              this.rprhDataShow.push(o)
            }
          } else if (isString(value) && value !== '') {
            o.key = this.englishToChinese[key].name
            o.value = value
            this.rprhDataShow.push(o)
          }
        }
      }
    }

  }
}
</script>

<style scoped>
#rp-name {
  width: 40%;
  margin: auto;
}

#add-rp {
  text-align: center;
}

.box-card {
  width: 60%;
  margin: auto;
}
</style>
