<template>
  <div>
    <el-dialog :append-to-body="true" v-bind="$attrs" title="档案" v-on="$listeners" @open="onOpen" @close="onClose">
      <el-form
        ref="elForm"
        :model="formData"
        :rules="rules"
        size="mini"
        label-width="80px"
        label-position="left"
      >
        <el-row>
          <el-form-item label="居民类别" prop="residentCategory">
            <el-checkbox-group v-model="formData.residentCategory" size="small">
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
        <el-row>
          <el-form-item label-width="120px" label="神智" prop="consciousness">
            <el-checkbox-group v-model="formData.consciousness" size="small">
              <el-checkbox
                v-for="(item, index) in consciousnessOptions"
                :key="index"
                :label="item.value"
                :disabled="item.disabled"
              >{{ item.label }}
              </el-checkbox>
            </el-checkbox-group>
          </el-form-item>
        </el-row>
        <el-row>
          <el-col :span="13">
            <el-form-item label-width="120px" label="皮肤" prop="skin">
              <el-checkbox-group v-model="formData.skin" size="medium">
                <el-checkbox
                  v-for="(item, index) in skinOptions"
                  :key="index"
                  :label="item.value"
                  :disabled="item.disabled"
                >{{ item.label }}
                </el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-col>
          <el-col :span="11">
            <el-form-item label-width="100px" label="皮肤疾病详情" prop="skinDiseaseDetails">
              <el-input
                v-model="formData.skinDiseaseDetails"
                placeholder="皮肤疾病部位/压疮部位"
                clearable
                :style="{width: '100%'}"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="13">
            <el-form-item label-width="120px" label="四肢活动度" prop="limbMobility">
              <el-checkbox-group v-model="formData.limbMobility" size="medium">
                <el-checkbox
                  v-for="(item, index) in limbMobilityOptions"
                  :key="index"
                  :label="item.value"
                  :disabled="item.disabled"
                >{{ item.label }}
                </el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-col>
          <el-col :span="11">
            <el-form-item label-width="70px" label="病变详情" prop="diseaseDetails">
              <el-input
                v-model="formData.diseaseDetails"
                placeholder="病变部位情况(障碍/畸形/偏瘫等)"
                clearable
                :style="{width: '100%'}"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="13">
            <el-form-item label-width="120px" label="视力情况" prop="visionStatus">
              <el-checkbox-group v-model="formData.visionStatus" size="medium">
                <el-checkbox
                  v-for="(item, index) in visionStatusOptions"
                  :key="index"
                  :label="item.value"
                  :disabled="item.disabled"
                >{{ item.label }}
                </el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-col>
          <el-col :span="11">
            <el-form-item label-width="70px" label="失明部位" prop="blindPart">
              <el-input v-model="formData.blindPart" clearable :style="{width: '100%'}" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-form-item label-width="120px" label="语言及沟通能力" prop="languageCommunication">
            <el-checkbox-group v-model="formData.languageCommunication" size="small">
              <el-checkbox
                v-for="(item, index) in languageCommunicationOptions"
                :key="index"
                :label="item.value"
                :disabled="item.disabled"
              >{{ item.label }}
              </el-checkbox>
            </el-checkbox-group>
          </el-form-item>
        </el-row>
        <el-row>
          <el-form-item label-width="120px" label="生活自理能力" prop="lifeCare">
            <el-checkbox-group v-model="formData.lifeCare" size="small">
              <el-checkbox
                v-for="(item, index) in lifeCareOptions"
                :key="index"
                :label="item.value"
                :disabled="item.disabled"
              >{{ item.label }}
              </el-checkbox>
            </el-checkbox-group>
          </el-form-item>
        </el-row>
        <el-row>
          <el-form-item label-width="120px" label="小便" prop="urine">
            <el-checkbox-group v-model="formData.urine" size="small">
              <el-checkbox
                v-for="(item, index) in urineOptions"
                :key="index"
                :label="item.value"
                :disabled="item.disabled"
              >{{ item.label }}
              </el-checkbox>
            </el-checkbox-group>
          </el-form-item>
        </el-row>
        <el-row>
          <el-form-item label-width="120px" label="大便" prop="stool">
            <el-checkbox-group v-model="formData.stool" size="small">
              <el-checkbox
                v-for="(item, index) in stoolOptions"
                :key="index"
                :label="item.value"
                :disabled="item.disabled"
              >{{ item.label }}
              </el-checkbox>
            </el-checkbox-group>
          </el-form-item>
        </el-row>
        <el-row>
          <el-form-item label-width="120px" label="带管" prop="catheter">
            <el-checkbox-group v-model="formData.catheter" size="small">
              <el-checkbox
                v-for="(item, index) in catheterOptions"
                :key="index"
                :label="item.value"
                :disabled="item.disabled"
              >{{ item.label }}
              </el-checkbox>
            </el-checkbox-group>
          </el-form-item>
        </el-row>
        <el-row>
          <el-form-item label-width="120px" label="过敏史" prop="allergyHistory">
            <el-checkbox-group v-model="formData.allergyHistory" size="small">
              <el-checkbox
                v-for="(item, index) in allergyHistoryOptions"
                :key="index"
                :label="item.value"
                :disabled="item.disabled"
              >{{ item.label }}
              </el-checkbox>
            </el-checkbox-group>
          </el-form-item>
        </el-row>
        <el-row>
          <el-form-item label-width="120px" label="疾病史" prop="medicalHistory">
            <el-checkbox-group v-model="formData.medicalHistory" size="small">
              <el-checkbox
                v-for="(item, index) in medicalHistoryOptions"
                :key="index"
                :label="item.value"
                :disabled="item.disabled"
              >{{ item.label }}
              </el-checkbox>
            </el-checkbox-group>
          </el-form-item>
        </el-row>
        <el-row>
          <el-form-item label-width="120px" label="跌倒史" prop="fallHistory">
            <el-radio-group v-model="formData.fallHistory" size="small">
              <el-radio
                v-for="(item, index) in fallHistoryOptions"
                :key="index"
                :label="item.value"
                :disabled="item.disabled"
              >{{ item.label }}
              </el-radio>
            </el-radio-group>
          </el-form-item>
        </el-row>
        <el-row>
          <el-form-item label-width="120px" label="传染病史" prop="infectiousDiseaseHistory">
            <el-checkbox-group v-model="formData.infectiousDiseaseHistory" size="medium">
              <el-checkbox
                v-for="(item, index) in infectiousDiseaseHistoryOptions"
                :key="index"
                :label="item.value"
                :disabled="item.disabled"
              >{{ item.label }}
              </el-checkbox>
            </el-checkbox-group>
          </el-form-item>
        </el-row>
        <el-row>
          <el-col :span="13">
            <el-form-item label-width="120px" label="手术史" prop="surgeryHistory">
              <el-radio-group v-model="formData.surgeryHistory" size="medium">
                <el-radio
                  v-for="(item, index) in surgeryHistoryOptions"
                  :key="index"
                  :label="item.value"
                  :disabled="item.disabled"
                >{{ item.label }}
                </el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="11">
            <el-form-item label-width="70px" label="手术详情" prop="surgeryDetails">
              <el-input v-model="formData.surgeryDetails" clearable :style="{width: '100%'}" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="13">
            <el-form-item label-width="120px" label="骨折史" prop="fractureHistory">
              <el-radio-group v-model="formData.fractureHistory" size="medium">
                <el-radio
                  v-for="(item, index) in fractureHistoryOptions"
                  :key="index"
                  :label="item.value"
                  :disabled="item.disabled"
                >{{ item.label }}
                </el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="11">
            <el-form-item label-width="70px" label="骨折详情" prop="fractureDetails">
              <el-input v-model="formData.fractureDetails" clearable :style="{width: '100%'}" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-form-item label="服药情况" prop="medicationStatus">
            <el-input
              v-model="formData.medicationStatus"
              type="textarea"
              placeholder="药名、计量频次"
              :autosize="{minRows: 4, maxRows: 10}"
              :style="{width: '100%'}"
            />
          </el-form-item>
        </el-row>
      </el-form>
      <div slot="footer">
        <el-button @click="close">取消</el-button>
        <el-button type="primary" @click="handelConfirm">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
export default {
  components: {},
  inheritAttrs: false,
  props: [],
  data() {
    return {
      formData: {
        residentCategory: [],
        consciousness: [],
        skin: [],
        skinDiseaseDetails: undefined,
        limbMobility: [],
        diseaseDetails: undefined,
        visionStatus: [],
        blindPart: undefined,
        languageCommunication: [],
        lifeCare: [],
        urine: [],
        stool: [],
        catheter: [],
        allergyHistory: [],
        medicalHistory: [],
        fallHistory: undefined,
        infectiousDiseaseHistory: [],
        surgeryHistory: undefined,
        surgeryDetails: undefined,
        fractureHistory: undefined,
        fractureDetails: undefined,
        medicationStatus: ''
      },
      rules: {
        residentCategory: [],
        consciousness: [],
        skin: [],
        skinDiseaseDetails: [],
        limbMobility: [],
        diseaseDetails: [],
        visionStatus: [],
        blindPart: [],
        languageCommunication: [],
        lifeCare: [],
        urine: [],
        stool: [],
        catheter: [],
        allergyHistory: [],
        medicalHistory: [],
        fallHistory: [],
        infectiousDiseaseHistory: [],
        surgeryHistory: [],
        surgeryDetails: [],
        fractureHistory: [],
        fractureDetails: [],
        medicationStatus: []
      },
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
      }]
    }
  },
  computed: {},
  watch: {},
  created() {
  },
  mounted() {
  },
  methods: {
    onOpen() {
      console.log('onOpen')
    },
    onClose() {
      // todo 不清空
    },
    close() {
      this.$emit('update:visible', false)
    },
    handelConfirm() {
      this.$refs['elForm'].validate(async valid => {
        if (!valid) return
        console.log('formData', this.formData)
        await this.$emit('getRHData', this.formData)
        this.close()
      })
    }
  }
}

</script>
<style>
</style>
