<template>
  <div class="errPage-container">
    <div slot="title" style="margin:5px">
      <span style="padding-right: 10px;">Error Log</span>
      <el-button  size="mini" type="primary" icon="el-icon-delete" @click="clearAll">Clear All</el-button>
      <p/>
    </div>
    <el-table :data="errorLogs" border>
      <el-table-column label="Message">
        <template slot-scope="{row}">
          <div>
            <span class="message-title">Msg:</span>
            <el-tag type="danger">{{ row.err.message }}</el-tag>
          </div>
          <br />
          <div>
            <span class="message-title" style="padding-right: 10px;">Info:</span>
            <el-tag type="warning">{{ row.vm.$vnode.tag }} error in {{ row.info }}</el-tag>
          </div>
          <br />
          <div>
            <span class="message-title" style="padding-right: 16px;">Url:</span>
            <el-tag type="success">{{ row.url }}</el-tag>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="Stack">
        <template slot-scope="scope">{{ scope.row.err.stack }}</template>
      </el-table-column>
    </el-table>
  </div>
</template>


<script>
export default {
  name: "ErrorLog",
  data() {
    return {
     
    };
  },
  computed: {
    errorLogs() {
      return this.$store.getters.errorLogs;
    }
  },
  methods: {
    clearAll() {
      this.$store.dispatch("errorLog/clearErrorLog");
    }
  }
};
</script>

<style scoped>
.errPage-container{
  padding: 35px
}
.message-title {
  font-size: 16px;
  color: #333;
  font-weight: bold;
  padding-right: 8px;
}
</style>
