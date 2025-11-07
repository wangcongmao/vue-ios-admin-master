<template>
  <el-cascader :props="props" />
</template>

<script>
export default {
  name: 'FeatureChooser',
  data() {
    return {
      id: 0,
      props: {
        lazy: true,
        lazyLoad(node, resolve) {
          const { level } = node
          setTimeout(() => {
            const nodes = Array.from({ length: level + 1 })
              .map(item => ({
                value: ++this.id,
                label: `选项${this.id}`,
                leaf: level >= 2
              }))
              // 通过调用resolve将子节点数据返回，通知组件数据加载完成
            resolve(nodes)
          }, 1000)
        }
      }
    }
  }
}
</script>

<style scoped>

</style>
