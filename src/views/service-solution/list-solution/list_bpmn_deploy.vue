<template>
  <div>
    <el-table
      ref="singleTable"
      :data="tableData"
      highlight-current-row
      style="width: 100%"
      @current-change="handleCurrentChange"
    >
      <el-table-column
        type="index"
        width="50"
      />
      <el-table-column
        property="name"
        label="名称"
        width="120"
      />
      <el-table-column
        property="version"
        label="版本"
        width="120"
      />
    </el-table>
    <div style="margin-top: 20px">
      <!--<el-button @click="setCurrent(tableData[1])">选中第二行</el-button>-->
      <!--<el-button @click="setCurrent()">取消选择</el-button>-->
      <el-button @click="execute">执行选中的服务模式</el-button>
    </div>
    <div>{{ responseData }}</div>
  </div>
</template>
<script>
export default {
  components: {

  },
  data() {
    return {
      tableData: [],
      currentRow: null,
      responseData: {}
    }
  },
  mounted: function() {
    this.$http.get('/process/list')
      .then(response => response.data)
      .then(data => {
        this.tableData = data
      })
  },
  methods: {
    handleCurrentChange(val) {
      this.currentRow = this.tableData.indexOf(val)
    },
    execute() {
      if (this.currentRow == null) {
        alert('请先选取其中的一行')
        return
      }
      this.$http.get(`/process/start/${this.tableData[this.currentRow].id}`)
        .then(response => response.data)
        .then((data) => {
          this.responseData = data
        })
        .catch(ex => {
          console.error(ex)
          alert('失败！')
        })
      // console.info("before ",this.currentRow,this.tableData);
      // this.tableData.splice(this.currentRow,1);
      // console.info("after",this.tableData)
    }
  }
}
</script>
