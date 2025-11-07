<template>
  <el-container>
    <el-header><h1>新增服务功能点</h1></el-header>
    <el-main>
      <el-form ref="addForm" :model="addForm" :rules="rules" label-width="80px">
        <el-form-item label="名称">
          <el-input v-model="addForm.name" autosize prop="name" />
        </el-form-item>
        <!--<el-form-item label="所属领域">-->
        <!--<el-tree-select-->
        <!--ref="tree"-->
        <!--v-model="addForm.categories"-->
        <!--:data="treeData"-->
        <!--node-key="id"-->
        <!--size="mini"-->
        <!--:multiple="true"-->
        <!--:props="treeProps"-->
        <!--/>-->
        <!--</el-form-item>-->
        <!--<el-form-item label="对应意图">-->
        <!--<el-select v-model="addForm.intentions" multiple placeholder="请选择">-->
        <!--<el-option-->
        <!--v-for="(item,index) in rpItems"-->
        <!--:key="index"-->
        <!--:label="item.goal.fullPath"-->
        <!--:value="item.goal.fullPath"-->
        <!--/>-->
        <!--</el-select>-->
        <!--</el-form-item>-->
        <el-form-item label="详细描述">
          <el-input v-model="addForm.textDescription" type="textarea" autosize placeholder="请输入详细描述" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onAdd">添加</el-button>
          <el-button @click="resetAddForm">取消</el-button>
        </el-form-item>
      </el-form>
    </el-main>
  </el-container>
</template>
<script>
// import ElTreeSelect from './ELTreeSelect'
// import request from '@/utils/request2'

export default {
  components: {
    // ElTreeSelect
  },
  data() {
    return {
      // treeData: [{
      //   '@id': 1,
      //   'catelogyId': 1,
      //   'parent': null,
      //   'children': [{
      //     '@id': 2,
      //     'catelogyId': 2,
      //     'parent': 1,
      //     'children': [{
      //       '@id': 3,
      //       'catelogyId': 3,
      //       'parent': 2,
      //       'children': [],
      //       'catelogyName': '出租车',
      //       'description': '出租车',
      //       'removed': false,
      //       'id': 3
      //     }],
      //     'catelogyName': '租车',
      //     'description': '各类与租车相关的业务',
      //     'removed': false,
      //     'id': 2
      //   }],
      //   'catelogyName': '交通',
      //   'description': '交通类服务',
      //   'removed': false,
      //   'id': 1
      // }],
      // categories: new Map(),
      // treeProps: {
      //   children: 'children',
      //   label: 'catelogyName'
      // },
      addForm: {
        name: '',
        // intentions: [],
        // categories: [],
        // serviceType: 'API',
        textDescription: ''
      },
      rules: {
        name: [
          { required: true, message: '请输入服务名称', trigger: 'blur' },
          { regexp: /[a-zA-Z_0-9]{1,8}/, message: '长度在 2 到 8 个字符,由英文字母_和数字组成', trigger: 'blur' }
        ],
        textDescription: [
          { required: true, message: '请输入对该服务的详细描述', trigger: 'change' }
        ]
      },
      rpData: [],
      rpItems: []
    }
  },
  created: function() {
    // this.loadCategories()
    // this.loadRequirePatterns()
  },
  methods: {
    // async loadCategories() {
    //   return request({
    //     url: '/serviceCategory/listRoots',
    //     method: 'get'
    //   }).then(data => {
    //     this.treeData = data
    //     const that = this
    //     function walk(list) {
    //       for (let i = 0; i < list.length; i++) {
    //         that.categories.set(list[i].catelogyId, list[i])
    //         if (list[i].children != null && list[i].children.length > 0) {
    //           walk(list[i].children)
    //         }
    //       }
    //     }
    //
    //     walk(this.treeData)
    //   })
    // },
    // async loadRequirePatterns() {
    //   request.get(`${process.env.VUE_APP_REQUIRE_BASE_URL}/api/get-all-rps`).then(data => {
    //     this.rpData = data
    //     const itemSet = new Set()
    //     function walkRequirePatternGoal(goal, superPath = '') {
    //       if (goal != null) {
    //         goal.goal.fullPath = superPath + '/' + goal.goal.content
    //         itemSet.add(goal)
    //         if (goal.children && goal.children.length > 0) {
    //           for (let i = 0; i < goal.children.length; i++) {
    //             walkRequirePatternGoal(goal.children[i], goal.goal.fullPath)
    //           }
    //         }
    //       }
    //     }
    //
    //     for (let i = 0; i < this.rpData.length; i++) {
    //       const rp = this.rpData[i]
    //       if (rp && rp.data && rp.data.length > 0) {
    //         for (let j = 0; j < rp.data.length; j++) {
    //           walkRequirePatternGoal(rp.data[j])
    //         }
    //       }
    //     }
    //
    //     this.rpItems = [... itemSet]
    //   })
    // },
    onAdd() {
      // function parents(node) {
      //   if (node == null || node.parent == null) {
      //     return []
      //   }
      //   return [node.parent, ...parents(node.parent)]
      // }
      this.$refs['addForm'].validate((valid) => {
        if (valid) {
          // console.info(this.addForm)
          // const categoryMap = new Map()
          // this.addForm.categories.forEach(i => {
          //   categoryMap.set(i, {
          //     id: {
          //       categoryId: i
          //     },
          //     category: {
          //       id: i
          //     },
          //     fullLink: true
          //   })
          // })
          // const halfSet = new Set()
          // this.addForm.categories.forEach(i => {
          //   parents(this.categories.get(i)).forEach(node => halfSet.add(node.id))
          // })
          // halfSet.forEach(i => {
          //   if (!categoryMap.has(i)) {
          //     categoryMap.set(i, {
          //       id: {
          //         categoryId: i
          //       },
          //       category: {
          //         id: i
          //       },
          //       fullLink: false
          //     })
          //   }
          // })

          // this.addForm.categoryMappings = [...categoryMap.values()]
          // delete this.addForm.categories
          console.info(this.addForm)

          // TODO 完善表单验证！！！ 并将category、provider 替换成对象
          this.$http.post('/serviceFeature/create', this.addForm)
            .then(response => response.data)
            .then((data) => {
              console.info(data)
              alert('添加成功！')
              this.resetAddForm()
            })
            .catch(ex => {
              console.error(ex)
              alert('数据传输失败！')
            })
        } else {
          alert('表单验证失败!!')
          return false
        }
      })
    },
    resetAddForm() {
      this.$refs.addForm.resetFields()
    }
  }
}
</script>

<!--<template>-->
<!--  <el-container>-->
<!--    <el-header><h1>新增服务Feature</h1></el-header>-->
<!--    <el-main>-->
<!--      <el-form ref="addForm" :model="addForm" :rules="rules" label-width="80px">-->
<!--        <el-form-item label="名称">-->
<!--          <el-input v-model="addForm.name" autosize prop="name" />-->
<!--        </el-form-item>-->
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
<!--        <el-form-item label="对应意图">-->
<!--          <el-select v-model="addForm.intentions" multiple placeholder="请选择">-->
<!--            <el-option-->
<!--              v-for="(item,index) in rpItems"-->
<!--              :key="index"-->
<!--              :label="item.goal.fullPath"-->
<!--              :value="item.goal.fullPath"-->
<!--            />-->
<!--          </el-select>-->
<!--          &lt;!&ndash;<el-tag&ndash;&gt;-->
<!--            &lt;!&ndash;v-for="(item,index) in rpItems"&ndash;&gt;-->
<!--            &lt;!&ndash;:key="index"&ndash;&gt;-->
<!--            &lt;!&ndash;:type="(item.children && item.children.length>0)?'info':'success'"&ndash;&gt;-->
<!--            &lt;!&ndash;size="mini"&ndash;&gt;-->
<!--          &lt;!&ndash;&gt;&ndash;&gt;-->
<!--            &lt;!&ndash;{{ item.goal.fullPath }}&ndash;&gt;-->
<!--          &lt;!&ndash;</el-tag>&ndash;&gt;-->
<!--        </el-form-item>-->
<!--        &lt;!&ndash;<el-form-item label="服务类型">&ndash;&gt;-->
<!--          &lt;!&ndash;<el-select v-model="addForm.serviceType" placeholder="请选择">&ndash;&gt;-->
<!--            &lt;!&ndash;<el-option label="API类服务" value="API" />&ndash;&gt;-->
<!--            &lt;!&ndash;<el-option label="UI类服务" value="UI" />&ndash;&gt;-->
<!--            &lt;!&ndash;<el-option label="线下服务" value="OFFLINE" />&ndash;&gt;-->
<!--          &lt;!&ndash;</el-select>&ndash;&gt;-->
<!--        &lt;!&ndash;</el-form-item>&ndash;&gt;-->
<!--        <el-form-item label="详细描述">-->
<!--          <el-input v-model="addForm.textDescription" type="textarea" autosize placeholder="请输入详细描述" />-->
<!--        </el-form-item>-->
<!--        <el-form-item>-->
<!--          <el-button type="primary" @click="onAdd">添加</el-button>-->
<!--          <el-button @click="resetAddForm">取消</el-button>-->
<!--        </el-form-item>-->
<!--      </el-form>-->
<!--    </el-main>-->
<!--  </el-container>-->
<!--</template>-->
<!--<script>-->
<!--import ElTreeSelect from './ELTreeSelect'-->
<!--import request from '@/utils/request2'-->

<!--export default {-->
<!--  components: {-->
<!--    ElTreeSelect-->
<!--  },-->
<!--  data() {-->
<!--    return {-->
<!--      treeData: [{-->
<!--        '@id': 1,-->
<!--        'catelogyId': 1,-->
<!--        'parent': null,-->
<!--        'children': [{-->
<!--          '@id': 2,-->
<!--          'catelogyId': 2,-->
<!--          'parent': 1,-->
<!--          'children': [{-->
<!--            '@id': 3,-->
<!--            'catelogyId': 3,-->
<!--            'parent': 2,-->
<!--            'children': [],-->
<!--            'catelogyName': '出租车',-->
<!--            'description': '出租车',-->
<!--            'removed': false,-->
<!--            'id': 3-->
<!--          }],-->
<!--          'catelogyName': '租车',-->
<!--          'description': '各类与租车相关的业务',-->
<!--          'removed': false,-->
<!--          'id': 2-->
<!--        }],-->
<!--        'catelogyName': '交通',-->
<!--        'description': '交通类服务',-->
<!--        'removed': false,-->
<!--        'id': 1-->
<!--      }],-->
<!--      categories: new Map(),-->
<!--      treeProps: {-->
<!--        children: 'children',-->
<!--        label: 'catelogyName'-->
<!--      },-->
<!--      addForm: {-->
<!--        name: '',-->
<!--        intentions: [],-->
<!--        categories: [],-->
<!--        serviceType: 'API',-->
<!--        textDescription: ''-->
<!--      },-->
<!--      rules: {-->
<!--        name: [-->
<!--          { required: true, message: '请输入服务名称', trigger: 'blur' },-->
<!--          { regexp: /[a-zA-Z_0-9]{1,8}/, message: '长度在 2 到 8 个字符,由英文字母_和数字组成', trigger: 'blur' }-->
<!--        ],-->
<!--        textDescription: [-->
<!--          { required: true, message: '请输入对该服务的详细描述', trigger: 'change' }-->
<!--        ]-->
<!--      },-->
<!--      rpData: [],-->
<!--      rpItems: []-->
<!--    }-->
<!--  },-->
<!--  created: function() {-->
<!--    this.loadCategories()-->
<!--    this.loadRequirePatterns()-->
<!--  },-->
<!--  methods: {-->
<!--    async loadCategories() {-->
<!--      return request({-->
<!--        url: '/serviceCategory/listRoots',-->
<!--        method: 'get'-->
<!--      }).then(data => {-->
<!--        this.treeData = data-->
<!--        const that = this-->
<!--        function walk(list) {-->
<!--          for (let i = 0; i < list.length; i++) {-->
<!--            that.categories.set(list[i].catelogyId, list[i])-->
<!--            if (list[i].children != null && list[i].children.length > 0) {-->
<!--              walk(list[i].children)-->
<!--            }-->
<!--          }-->
<!--        }-->

<!--        walk(this.treeData)-->
<!--      })-->
<!--    },-->
<!--    async loadRequirePatterns() {-->
<!--      request.get(`${process.env.VUE_APP_REQUIRE_BASE_URL}/api/get-all-rps`).then(data => {-->
<!--        this.rpData = data-->
<!--        const itemSet = new Set()-->
<!--        function walkRequirePatternGoal(goal, superPath = '') {-->
<!--          if (goal != null) {-->
<!--            goal.goal.fullPath = superPath + '/' + goal.goal.content-->
<!--            itemSet.add(goal)-->
<!--            if (goal.children && goal.children.length > 0) {-->
<!--              for (let i = 0; i < goal.children.length; i++) {-->
<!--                walkRequirePatternGoal(goal.children[i], goal.goal.fullPath)-->
<!--              }-->
<!--            }-->
<!--          }-->
<!--        }-->

<!--        for (let i = 0; i < this.rpData.length; i++) {-->
<!--          const rp = this.rpData[i]-->
<!--          if (rp && rp.data && rp.data.length > 0) {-->
<!--            for (let j = 0; j < rp.data.length; j++) {-->
<!--              walkRequirePatternGoal(rp.data[j])-->
<!--            }-->
<!--          }-->
<!--        }-->

<!--        this.rpItems = [... itemSet]-->
<!--      })-->
<!--    },-->
<!--    onAdd() {-->
<!--      function parents(node) {-->
<!--        if (node == null || node.parent == null) {-->
<!--          return []-->
<!--        }-->
<!--        return [node.parent, ...parents(node.parent)]-->
<!--      }-->
<!--      this.$refs['addForm'].validate((valid) => {-->
<!--        if (valid) {-->
<!--          console.info(this.addForm)-->
<!--          const categoryMap = new Map()-->
<!--          this.addForm.categories.forEach(i => {-->
<!--            categoryMap.set(i, {-->
<!--              id: {-->
<!--                categoryId: i-->
<!--              },-->
<!--              category: {-->
<!--                id: i-->
<!--              },-->
<!--              fullLink: true-->
<!--            })-->
<!--          })-->
<!--          const halfSet = new Set()-->
<!--          this.addForm.categories.forEach(i => {-->
<!--            parents(this.categories.get(i)).forEach(node => halfSet.add(node.id))-->
<!--          })-->
<!--          halfSet.forEach(i => {-->
<!--            if (!categoryMap.has(i)) {-->
<!--              categoryMap.set(i, {-->
<!--                id: {-->
<!--                  categoryId: i-->
<!--                },-->
<!--                category: {-->
<!--                  id: i-->
<!--                },-->
<!--                fullLink: false-->
<!--              })-->
<!--            }-->
<!--          })-->

<!--          this.addForm.categoryMappings = [...categoryMap.values()]-->
<!--          delete this.addForm.categories-->
<!--          console.info(this.addForm)-->

<!--          // TODO 完善表单验证！！！ 并将category、provider 替换成对象-->
<!--          this.$http.post('/serviceFeature/create', this.addForm)-->
<!--            .then(response => response.data)-->
<!--            .then((data) => {-->
<!--              console.info(data)-->
<!--              alert('添加成功！')-->
<!--              this.resetAddForm()-->
<!--            })-->
<!--            .catch(ex => {-->
<!--              console.error(ex)-->
<!--              alert('数据传输失败！')-->
<!--            })-->
<!--        } else {-->
<!--          alert('表单验证失败!!')-->
<!--          return false-->
<!--        }-->
<!--      })-->
<!--    },-->
<!--    resetAddForm() {-->
<!--      this.$refs.addForm.resetFields()-->
<!--    }-->
<!--  }-->
<!--}-->
<!--</script>-->
