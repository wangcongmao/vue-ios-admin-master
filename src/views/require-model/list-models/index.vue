<template>
  <div class="">
    <el-row>
      <el-col :span="4">
        <el-tree
          ref="tree"
          class="ly-tree-container"
          :data="treeData"
          show-checkbox
          node-key="id"
          highlight-current
          :props="defaultProps"
          :expand-on-click-node="false"
          :check-on-click-node="true"
          :check-strictly="true"
          :default-expand-level="Infinity"
          @check="((obj, node)=>{checkNode(obj, node, 'tree')})"
          @node-click="((obj, node, vue)=>{clickNode(obj, node, vue,'tree')})"
          @check-change="handleChange"
        />
<!--        <el-tree-->
<!--          ref="tree"-->
<!--          class="ly-tree-container"-->
<!--          :data="treeData"-->
<!--          show-checkbox-->
<!--          lazy-->
<!--          :load="loadNode"-->
<!--          node-key="id"-->
<!--          highlight-current-->
<!--          :props="defaultProps"-->
<!--          :expand-on-click-node="false"-->
<!--          :check-on-click-node="true"-->
<!--          :check-strictly="true"-->
<!--          :default-expand-level="Infinity"-->
<!--          @check="((obj, node)=>{checkNode(obj, node, 'tree')})"-->
<!--          @node-click="((obj, node, vue)=>{clickNode(obj, node, vue,'tree')})"-->
<!--          @check-change="handleChange"-->
<!--        />-->
      </el-col>
      <el-col :span="18">
        <el-container>
          <el-header>
            <div style="margin-top:20px;margin-bottom: 20px">
              <el-row :gutter="10">
                <el-col :span="3">
                  <el-input v-model="listQuery.name" placeholder="名称" />
                </el-col>
                <el-col :span="3">
                  <el-input v-model="listQuery.description" placeholder="描述" />
                </el-col>
                <el-col :span="3">
                  <el-input v-model="listQuery.description" placeholder="功能点" />
                </el-col>
                <el-col :span="3">
                  <el-select v-model="listQuery.types" multiple placeholder="选择性能指标">
                    <el-option
                      v-for="item in typeOptions"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    ></el-option>
                  </el-select>
                </el-col>
                <el-col :span="4">
                  <el-input v-model="listQuery.description" placeholder="性能指标范围(1-2;;)" />
                </el-col>
                <el-col :span="3">
                  <el-select v-model="listQuery.name" placeholder="人群">
                    <el-option
                      v-for="item in options"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    ></el-option>
                  </el-select>
                </el-col>
                <el-col :span="3">
                  <el-input v-model="listQuery.description" placeholder="地域" />
                </el-col>
                <el-col :span="2">
                  <el-button
                    class="filter-item"
                    type="primary"
                    icon="el-icon-search"
                    @click="handleSearch"
                  >查找
                  </el-button>
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
                  <span>{{ scope.$index + (listQuery.page - 1) * listQuery.limit + 1 }}</span>
                </template>
              </el-table-column>
              <el-table-column
                property="name"
                label="模型名称"
                width="100"
              />
              <el-table-column
                property="description"
                label="模型描述"
                width="120"
              />
              <el-table-column
                label="所属领域"
                width="120"
              >
                <template slot-scope="scope">
                  <el-tag
                    v-for="(category,index) in scope.row.categories"
                    :key="index"
                    :type="category.fullLink?'success':'info'"
                    size="mini"
                  >
                    {{ category.name }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column
                label="功能点"
                width="100"
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
                label="性能指标"
                width="100"
              >
                <template slot-scope="scope">
                  <el-tag
                    v-for="(quality,index) in scope.row.qualities"
                    :key="index"
                    size="mini"
                  >
                    {{ quality.name }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column
                label="面向人群"
                width="100"
              >
                <template slot-scope="scope">
                  <el-tag
                    v-for="(p,index) in scope.row.people"
                    :key="index"
                    size="mini"
                  >
                    {{ p.name }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column
                property="region"
                label="地域"
                width="100"
              />

              <el-table-column label="流程图" width="300">
                <template slot-scope="scope">
                  <img
                    :src="scope.row.image"
                    @click="openImage(scope.row.image)"
                    style="width: 100%; height: 70px; cursor: pointer;"
                  />
                </template>
              </el-table-column>
              <el-table-column
                label="操作"
                width="150"
              >
                <template slot-scope="scope">
                  <!--                <el-button type="text" @click="modifyRequire(scope.row)">查看详情</el-button>-->
                  <el-button type="text" @click="modifySPT(scope)">编辑</el-button>
                  <el-button type="text" @click="deleteIndex(scope)">删除</el-button>
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
    <el-dialog :visible.sync="showDialog" :fullscreen="true">
      <div v-if="showDialog" style="text-align: center;">
        <el-card class="box-card">
          <el-form ref="form" label-width="80px">
            <el-form-item label="名称:">
              <el-input v-model="info.name" placeholder="请输入" size="small" />
            </el-form-item>
            <el-form-item label="功能描述:">
              <el-input v-model="info.description" placeholder="请输入" size="small" />
            </el-form-item>
            <el-form-item label="所属领域">
              <el-tree-select
                ref="treeSelect"
                v-model="info.categories"
                :styles="styles"
                :select-params="selectParams"
                :tree-params="treeParams"
                :tree-render-fun="_renderFun"
                @searchFun="_searchFun"
                @node-click="_nodeClickFun"
              />
            </el-form-item>
          </el-form>
        </el-card>
        <br>
        <SPTP :data="selectSPTProperties" @submit="uploadSPT" />
      </div>
    </el-dialog>
    <el-dialog :visible.sync="dialogVisible" width="50%">
      <img :src="currentImage" style="width: 100%;" />
    </el-dialog>
  </div>

</template>
<script>
import { deepClone } from '@/utils'
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination
import '../sp-template-add/category.scss'
import Vue from 'vue'
import Axios from 'axios'
import ElTreeSelect from 'el-tree-select'
import SPTP from '../sp-template-add/spt-property'

Axios.defaults.baseURL = process.env.VUE_APP_SP_BASE_URL
Vue.prototype.$ajax = Axios
Vue.use(ElTreeSelect)
export default {
  components: {
    Pagination,
    SPTP
  },
  data() {
    return {
      // treeData: [{
      //   '@id': 1,
      //   'id': 1,
      //   'parentId': null,
      //   'children': [{
      //     '@id': 2,
      //     'id': 2,
      //     'parentId': 1,
      //     'children': [{
      //       '@id': 3,
      //       'id': 3,
      //       'parentId': 2,
      //       'children': [],
      //       'name': '出租车',
      //       'description': '出租车',
      //       'removed': false
      //     }],
      //     'name': '租车',
      //     'description': '各类与租车相关的业务',
      //     'removed': false
      //   }],
      //   'name': '交通',
      //   'description': '交通类服务',
      //   'removed': false
      // }],
      treeData: [
        {
          '@id': 2,
          'id': 2,
          'parentId': null,
          'children': [
            {
              '@id': 3,
              'id': 3,
              'parentId': 2,
              'children': [],
              'name': '居家养老',
              'description': '为老年人提供机构养老服务，包括护理、生活照护等',
              'removed': false
            },
            {
              '@id': 3,
              'id': 3,
              'parentId': 2,
              'children': [],
              'name': '社区养老',
              'description': '为老年人提供机构养老服务，包括护理、生活照护等',
              'removed': false
            },
            {
              '@id': 4,
              'id': 4,
              'parentId': 2,
              'children': [],
              'name': '机构养老',
              'description': '上门提供养老照护服务，例如家政、助餐等',
              'removed': false
            }
          ],
          'name': '养老照护服务',
          'description': '覆盖机构、社区和居家养老的综合照护服务',
          'removed': false
        },
        {
          '@id': 5,
          'id': 5,
          'parentId': null,
          'children': [
            {
              '@id': 6,
              'id': 6,
              'parentId': 5,
              'children': [],
              'name': '老年预防保健和健康管理',
              'description': '专为老年人设计的医疗机构或专科服务',
              'removed': false
            },
            {
              '@id': 7,
              'id': 7,
              'parentId': 5,
              'children': [],
              'name': '老年人疾病诊疗服务',
              'description': '老年人慢性病预防与治疗服务',
              'removed': false
            },
            {
              '@id': 7,
              'id': 7,
              'parentId': 5,
              'children': [
                {
                  '@id': 7,
                  'id': 7,
                  'parentId': 5,
                  'children': [],
                  'name': '老年康复和医疗护理服务',
                  'description': '老年人慢性病预防与治疗服务',
                  'removed': false
                },
                {
                  '@id': 7,
                  'id': 7,
                  'parentId': 5,
                  'children': [],
                  'name': '老年康复辅具配置服务',
                  'description': '老年人慢性病预防与治疗服务',
                  'removed': false
                }
              ],
              'name': '老年康复护理服务',
              'description': '老年人慢性病预防与治疗服务',
              'removed': false
            },
            {
              '@id': 7,
              'id': 7,
              'parentId': 5,
              'children': [],
              'name': '安宁疗护服务',
              'description': '老年人慢性病预防与治疗服务',
              'removed': false
            },
            {
              '@id': 7,
              'id': 7,
              'parentId': 5,
              'children': [],
              'name': '其他',
              'description': '老年人慢性病预防与治疗服务',
              'removed': false
            }
          ],
          'name': '老年医疗卫生服务',
          'description': '包括老年人医疗诊治、护理、慢病管理等服务',
          'removed': false
        },
        {
          '@id': 8,
          'id': 8,
          'parentId': null,
          'children': [
            {
              '@id': 9,
              'id': 9,
              'parentId': 8,
              'children': [],
              'name': '老年健康促进',
              'description': '开展健康讲座、心理咨询等服务',
              'removed': false
            },
            {
              '@id': 10,
              'id': 10,
              'parentId': 8,
              'children': [],
              'name': '老年社会活动',
              'description': '组织老年人参与社区活动和社会事务',
              'removed': false
            }
          ],
          'name': '老年健康促进与社会参与',
          'description': '促进老年人身体、心理健康及社会融入',
          'removed': false
        },
        {
          '@id': 11,
          'id': 11,
          'parentId': null,
          'children': [
            {
              '@id': 12,
              'id': 12,
              'parentId': 11,
              'children': [],
              'name': '养老金服务',
              'description': '提供养老保险金领取与管理服务',
              'removed': false
            }
          ],
          'name': '老年社会保障',
          'description': '覆盖老年人保险、补助等社会保障服务',
          'removed': false
        },
        {
          '@id': 13,
          'id': 13,
          'parentId': null,
          'children': [
            {
              '@id': 14,
              'id': 14,
              'parentId': 13,
              'children': [],
              'name': '养老护理员培训',
              'description': '为养老护理人员提供技能培训',
              'removed': false
            }
          ],
          'name': '养老教育培训和人力资源服务',
          'description': '覆盖养老行业人才培养与培训服务',
          'removed': false
        },
        {
          '@id': 15,
          'id': 15,
          'parentId': null,
          'children': [
            {
              '@id': 16,
              'id': 16,
              'parentId': 15,
              'children': [],
              'name': '养老金管理',
              'description': '为老年人设计的养老金融理财产品',
              'removed': false
            }
          ],
          'name': '养老金融服务',
          'description': '围绕老年人需求设计的金融服务',
          'removed': false
        },
        {
          '@id': 17,
          'id': 17,
          'parentId': null,
          'children': [
            {
              '@id': 18,
              'id': 18,
              'parentId': 17,
              'children': [],
              'name': '智慧养老平台',
              'description': '智能硬件及平台服务整合，为养老提供技术支持',
              'removed': false
            }
          ],
          'name': '养老科技和智慧养老服务',
          'description': '使用先进技术优化养老服务',
          'removed': false
        },
        {
          '@id': 19,
          'id': 19,
          'parentId': null,
          'children': [
            {
              '@id': 18,
              'id': 18,
              'parentId': 17,
              'children': [],
              'name': '智慧养老平台',
              'description': '智能硬件及平台服务整合，为养老提供技术支持',
              'removed': false
            }
          ],
          'name': '养老公共管理',
          'description': '包括政策制定与监管、行业评估等',
          'removed': false
        },
        {
          '@id': 20,
          'id': 20,
          'parentId': null,
          'children': [
            {
              '@id': 18,
              'id': 18,
              'parentId': 17,
              'children': [],
              'name': '智慧养老平台',
              'description': '智能硬件及平台服务整合，为养老提供技术支持',
              'removed': false
            }
          ],
          'name': '其他养老服务',
          'description': '未列入其他分类的养老服务',
          'removed': false
        },
        {
          '@id': 21,
          'id': 21,
          'parentId': null,
          'children': [],
          'name': '老年用品及相关产品制造',
          'description': '生产老年人专用的生活和辅助产品',
          'removed': false
        },
        {
          '@id': 22,
          'id': 22,
          'parentId': null,
          'children': [
            {
              '@id': 18,
              'id': 18,
              'parentId': 17,
              'children': [],
              'name': '智慧养老平台',
              'description': '智能硬件及平台服务整合，为养老提供技术支持',
              'removed': false
            }
          ],
          'name': '老年用品及相关产品销售和租赁',
          'description': '老年人用品的销售和租赁服务',
          'removed': false
        },
        {
          '@id': 23,
          'id': 23,
          'parentId': null,
          'children': [
            {
              '@id': 18,
              'id': 18,
              'parentId': 17,
              'children': [],
              'name': '智慧养老平台',
              'description': '智能硬件及平台服务整合，为养老提供技术支持',
              'removed': false
            }
          ],
          'name': '养老设施建设',
          'description': '养老院、老年社区等设施的规划和建设',
          'removed': false
        }
      ],


      defaultProps: {
        children: 'children',
        label: 'name'
      },
      tableKey: 0,
      // list: null,
      options: [
        { value: 'John', label: 'John' },
        { value: 'Jane', label: 'Jane' },
        // 添加更多选项
      ],
      typeOptions: [
        { value: 'quality', label: '质量' },
        { value: 'price', label: '价格' },
        { value: 'responsive', label: '响应度' }
      ],
      typeOptionsMap: {
        quality: '质量',
        price: '价格',
        responsive: '响应度'
      },
      list: [
        {
          name: '体检',
          description: '全面的身体检查，包括各项健康指标的测量和评估。',
          categories: [{ name: '医养' }, { name: '老年人疾病诊疗服务' }, { name: '体格检查' }],
          features: [{ name: '健康评估' }, { name: '疾病筛查' }, { name: '健康咨询' }],
          qualities: [{ name: '质量(5)' }, { name: '价格(3)' }, { name: '响应度(4)' }],
          people: [{ name: '所有人群' }],
          region: '威海市',
          image: require('./pic/体检.png')
        },
        {
          name: '康复训练',
          description: '帮助患者恢复功能，改善生活质量的训练活动。',
          categories: [{ name: '医养' }, { name: '老年人疾病诊疗服务' }, { name: '康复护理' }],
          features: [{ name: '功能恢复' }, { name: '生活质量改善' }, { name: '心理支持' }],
          qualities: [{ name: '质量(4)' }, { name: '价格(3)' }, { name: '响应度(4)' }],
          people: [{ name: '康复患者' }],
          region: '威海市',
          image: require('./pic/康复训练.png')
        },
        {
          name: '营养咨询',
          description: '根据个人健康状况和需求，提供科学的饮食指导。',
          categories: [{ name: '康养' }, { name: '居家社区养老' }, { name: '健康管理服务' }],
          features: [{ name: '饮食指导' }, { name: '健康教育' }, { name: '个性化服务' }],
          qualities: [{ name: '质量(5)' }, { name: '价格(4)' }, { name: '响应度(4)' }],
          people: [{ name: '所有人群' }],
          region: '威海市',
          image: require('./pic/营养咨询.png')
        },
        {
          name: '养老服务',
          description: '为老年人提供生活照料和健康管理服务。',
          categories: [{ name: '康养' }, { name: '居家社区养老' }, { name: '生活照料服务' }, { name: '健康管理服务'}],
          features: [{ name: '生活照料' }, { name: '健康监测' }, { name: '心理支持' }],
          qualities: [{ name: '质量(4)' }, { name: '价格(3)' }, { name: '响应度(3)' }],
          people: [{ name: '老年人' }],
          region: '威海市',
          image: require('./pic/养老服务.png')
        },
        {
          name: '慢病管理',
          description: '针对慢性疾病患者的长期健康管理。',
          categories: [{ name: '医养' }, { name: '老年人疾病诊疗服务' }, { name: '慢病管理' }],
          features: [{ name: '疾病监测' }, { name: '健康教育' }, { name: '药物管理' }],
          qualities: [{ name: '质量(5)' }, { name: '价格(3)' }, { name: '响应度(4)' }],
          people: [{ name: '慢性病患者' }],
          region: '威海市',
          image: require('./pic/慢病管理.png')
        },
        {
          name: '心理咨询',
          description: '提供心理健康评估和心理支持服务。',
          categories: [{ name: '心理健康' }],
          features: [{ name: '心理评估' }, { name: '心理辅导' }, { name: '危机干预' }],
          qualities: [{ name: '质量(5)' }, { name: '价格(4)' }, { name: '响应度(4)' }],
          people: [{ name: '所有人群' }],
          region: '威海市',
          image: require('./pic/心理咨询.png')
        },
        {
          name: '家庭医生',
          description: '为家庭成员提供全方位的健康管理服务。',
          categories: [{ name: '医养' }, { name: '医疗护理' }, { name: '心理护理' }],
          features: [{ name: '健康管理' }, { name: '疾病预防' }, { name: '咨询服务' }],
          qualities: [{ name: '质量(4)' }, { name: '价格(3)' }, { name: '响应度(4)' }],
          people: [{ name: '所有人群' }],
          region: '威海市',
          image: require('./pic/家庭医生.png')
        },
        {
          name: '药物配送',
          description: '提供处方药和非处方药的配送服务。',
          categories: [{ name: '医养' }, { name: '药学服务' }, { name: '用药评估' }, { name: '用药指导' }],
          features: [{ name: '药物配送' }, { name: '用药指导' }, { name: '便捷服务' }],
          qualities: [{ name: '质量(4)' }, { name: '价格(3)' }, { name: '响应度(5)' }],
          people: [{ name: '所有人群' }],
          region: '威海市',
          image: require('./pic/药物配送.png')
        },
        {
          name: '健康讲座',
          description: '通过讲座形式普及健康知识，提升健康意识。',
          categories: [{ name: '康养' }, { name: '居家社区养老' }, { name: '老年教育'}],
          features: [{ name: '健康教育' }, { name: '知识普及' }, { name: '互动交流' }],
          qualities: [{ name: '质量(4)' }, { name: '价格(4)' }, { name: '响应度(3)' }],
          people: [{ name: '所有人群' }],
          region: '威海市',
          image: require('./pic/健康讲座.png')
        },
        {
          name: '远程医疗',
          description: '利用现代通信技术提供远程医疗服务。',
          categories: [{ name: '医养' }, { name: '老年人疾病诊疗服务' }],
          features: [{ name: '远程会诊' }, { name: '诊断服务' }, { name: '随访管理' }],
          qualities: [{ name: '质量(5)' }, { name: '价格(3)' }, { name: '响应度(5)' }],
          people: [{ name: '所有人群' }],
          region: '威海市',
          image: require('./pic/远程医疗.png')
        }
      ],
      dialogVisible: false,
      currentImage: '',
      total: 100,
      listLoading: false,
      listQuery: {
        page: 1,
        limit: 10,
        name: '',
        description: '',
        category: ''
      },
      // updateSPT: { visible: false, old: [], new: [], sptId: '' }
      showDialog: false,
      info: {
        sptId: 0,
        name: '',
        description: '',
        categories: [],
        sptProperties: []
      },
      selectSPTId: -1,
      selectSPTProperties: [],
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
          label: 'name',
          disabled: 'disabled',
          value: 'id'
        }
      },
      styles: {
        width: '300px'
      },
      categoryTreeData: [{
        '@id': 1,
        'id': 1,
        'parentId': null,
        'children': [{
          '@id': 2,
          'id': 2,
          'parentId': 1,
          'children': [{
            '@id': 3,
            'id': 3,
            'parentId': 2,
            'children': [],
            'name': '出租车',
            'description': '出租车',
            'removed': false
          }],
          'name': '租车',
          'description': '各类与租车相关的业务',
          'removed': false
        }],
        'name': '交通',
        'description': '交通类服务',
        'removed': false
      }],
      categories: new Map()
    }
  },
  created: function() {
    this.loadCategories()
    this.treeParams.data = this.categoryTreeData
  },
  // mounted:
  //   function() {
  //     setTimeout(() => {
  //       this.$refs.treeSelect.treeDataUpdateFun(this.categoryTreeData)
  //     }, 2000)
  //   },
  methods: {
    openImage(image) {
      this.currentImage = image;
      this.dialogVisible = true;
    },
    async getList1(resolve) {
      this.$ajax.get('/sptCategory/children?' + 'parentId=0')
        .then(response => {
          var data = response.data
          data.forEach((item) => {
            item.childrenCount > 0 ? (item.isLeaf = false) : (item.isLeaf = true)
          })
          resolve(data)
        })
    },
    // 获取树结构 子集数据
    async getChildList(node, resolve) {
      this.$ajax.get('/sptCategory/children?' + 'parentId=' + node.data.id)
        .then(response => {
          var data = response.data
          data.forEach((item) => {
            item.childrenCount > 0 ? (item.isLeaf = false) : (item.isLeaf = true)
          })
          resolve(data)
        })
    },
    // 加载 树数据、loadNode()方法、此函数函数接收两个参数，一个是node,即当前节点，一个是resolve作为数据处理函数
    loadNode(node, resolve) {
      if (node.level === 0) {
        this.node_had = node // 这里是关键！在data里面定义一个变量，将node.level == 0的node存起来
        this.resolve_had = resolve // 同上，把node.level == 0的resolve也存起来
        return this.getList1(resolve)
      }
      if (node.level >= 1) {
        return this.getChildList(node, resolve)
      }
    },
    // 编辑模板时获取
    loadCategories() {
      this.$ajax.get('/sptCategory/roots')
        .then(response => {
          this.categoryTreeData = response.data
          const that = this

          function walk(list) {
            for (let i = 0; i < list.length; i++) {
              that.categories.set(list[i].id, list[i])
              if (list[i].children != null && list[i].children.length > 0) {
                walk(list[i].children)
              }
            }
          }

          walk(this.categoryTreeData)
        })
    },
    async getList() {
      this.listLoading = true
      // If the Promise is rejected, the rejected value is thrown.
      try {
        const query = deepClone(this.listQuery)
        const choosed = this.$refs.tree.getCheckedNodes(false, false)
        if (choosed.length > 0) {
          console.log(choosed)
          query.category = choosed.map(value => value.name).join(',')
          console.log(query)
        }
        this.$ajax.get(`/sptemplate/query?name=${query.name}&description=${query.description}&category=${query.category}&page=${query.page}&limit=${query.limit}`)
          .then(res => {
            this.listLoading = false
            this.list = res.data.data.data
            this.total = res.data.data.total
            console.log(res)
          })
      } catch (e) {
        this.listLoading = false
      }
    },
    async deleteIndex(scope) {
      console.log(scope.row)
      this.$ajax.delete('/delspt?id=' + scope.row.id)
        .then((isSuccess) => {
          console.log(isSuccess)
          if (isSuccess.data) {
            this.$message({
              message: '删除成功',
              type: 'success'
            })
            this.getList()
          } else {
            this.$message.error('绑定模式，删除失败')
          }
        })
        .catch((response) => {
          this.$message.error('数据删除失败')
        })
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
    // 选中节点
    checkNode(obj, node, form) {
      let checkedKeys = this.$refs[form].getCheckedKeys()
      const childKeys = this.getChildKeys(obj)
      const index = checkedKeys.indexOf(obj.id)
      if (index !== -1) {
        // 选中并且选中子节点
        checkedKeys = checkedKeys.concat(childKeys)
      } else {
        // 取消选中并且取消选中子节点
        checkedKeys = checkedKeys.filter(item => childKeys.indexOf(item) === -1)
      }
      this.$refs[form].setCheckedKeys(checkedKeys)
    },

    // 点击节点
    clickNode(obj, node, vue, form) {
      let checkedKeys = this.$refs[form].getCheckedKeys()
      const index = checkedKeys.indexOf(obj.id)
      if (index !== -1) {
        checkedKeys.splice(index, 1)
        // 移除子节点
        const childKeys = this.getChildKeys(obj)
        checkedKeys = checkedKeys.filter(item => childKeys.indexOf(item) === -1)
      } else {
        checkedKeys.push(obj.id)
      }
      this.$refs[form].setCheckedKeys(checkedKeys)
    },
    // 获取子节点
    getChildKeys(node) {
      let arr = []
      arr.push(node.id)
      if (node.children != null && node.children.length > 0) {
        for (const n of node.children) {
          arr.push(n.id)
          const childKeys = this.getChildKeys(n)
          arr = arr.concat(childKeys)
        }
      }
      return arr
    },
    modifySPT(scope) {
      this.selectSPTId = scope.row.id
      this.info.sptId = this.selectSPTId
      this.info.name = scope.row.name
      this.info.description = scope.row.description
      this.info.categories = scope.row.categories
      this.$ajax.get(`/searchsptemplateandprop?id=${this.selectSPTId}`)
        .then(res => {
          this.selectSPTProperties = res.data
          console.log(res.data)
        })
      setTimeout(() => {
        this.$refs.treeSelect.treeDataUpdateFun(this.categoryTreeData)
      }, 2000)
      this.showDialog = true
    },
    // 树点击
    _nodeClickFun(data, node, vm) {
      console.log('this _nodeClickFun', this.info.categories, data, node)
    },
    // 树过滤
    _searchFun(value) {
      console.log(value, '<--_searchFun')
      this.$refs.treeSelect.filterFun(value)
    },
    // 自定义render
    _renderFun(h, { node, data, store }) {
      return (
        <span class='custom-tree-node'>
          <span>{node.label}</span>
        </span>
      )
    },
    uploadSPT() {
      const that = this

      function parents(node) {
        if (node == null || node.parentId === 0) {
          return []
        }
        return [that.categories.get(node.parentId), ...parents(that.categories.get(node.parentId))]
      }

      const categoryMap = {}
      console.log(this.info.categories)
      for (var i = 0; i < this.info.categories.length; i++) {
        if (typeof this.info.categories[i] === 'object') {
          this.info.categories[i] = this.info.categories[i].id
        }
      }
      console.log(this.info.categories)
      this.info.categories.forEach(i => {
        categoryMap[i] = true
      })
      console.log(categoryMap)
      const halfSet = new Set()
      this.info.categories.forEach(i => {
        console.log(parents(this.categories.get(i.id)), 'parents(this.categories.get(i))')
        parents(this.categories.get(i)).forEach(node => halfSet.add(node.id))
      })
      console.log(halfSet, 'halfSet')
      halfSet.forEach(i => {
        if (typeof categoryMap[i] === 'undefined') {
          categoryMap[i] = false
        }
      })
      console.log(this.info.categories)
      console.log(categoryMap)
      this.info.categories = categoryMap
      this.info.sptProperties = this.selectSPTProperties
      this.$ajax.post(`/updatesptemplate`, this.info).then((response) => {
        this.$message({
          message: '提交成功',
          type: 'success'
        })
        this.showDialog = false
        this.getList()
      }).catch((response) => {
        this.$message.error('提交失败')
      })
    },
    enterAddSP(scope) {
      this.selectSPTId = scope.row.id
      this.info.sptId = this.selectSPTId
      this.info.name = scope.row.name
      this.info.description = scope.row.description
      this.info.categories = scope.row.categories
      this.$ajax.get(`/searchsptemplateandprop?id=${this.selectSPTId}`)
        .then(res => {
          this.info.sptProperties = res.data
        })
      this.$router.push({ name: 'SpAdd', path: '/service-pattern/sp-add', params: { sptInfo: this.info }})
    },
    enterListSP(scope) {
      this.selectSPTId = scope.row.id
      this.info.sptId = this.selectSPTId
      this.info.name = scope.row.name
      this.info.description = scope.row.description
      this.info.categories = scope.row.categories
      this.$ajax.get(`/searchsptemplateandprop?id=${this.selectSPTId}`)
        .then(res => {
          this.info.sptProperties = res.data
        })
      this.$router.push({ name: 'SpList', path: '/service-pattern/sp-list', params: { sptInfo: this.info }})
    }
  }
}
</script>
<style lang="less" scoped>
.el-dialog__body {
  text-align: center;
}
</style>
