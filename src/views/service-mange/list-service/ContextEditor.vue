<template>
  <el-container>
    <el-header>
      <el-button @click="addItem()">添加</el-button>
    </el-header>
    <el-main>
      <div v-for="(pair,i) in context" :index="i">
        <el-col span="2"><label style="float: right">key: </label></el-col>
        <el-col span="10">
          <el-input size="medium" v-model="pair.key" @input="valueChanged" />
        </el-col>
        <el-col span="2"><label style="float: right">value: </label></el-col>
        <el-col span="10">
          <el-input size="medium" v-model="pair.value" label="value" @input="valueChanged" />
        </el-col>
      </div>
    </el-main>
  </el-container>
</template>
<script>
export default {
  name: 'ContextEditor',
  props: ['value'],
  data() {
    return {
      context: this.value || []
    }
  },
  methods: {
    addItem: function() {
      this.context.push({
        key: '',
        value: ''
      })
      this.$emit('input', this.context)
    },
    valueChanged: function() {
      this.$emit('input', this.context)
    }
  }
}
</script>
