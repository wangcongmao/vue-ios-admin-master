<template>
  <el-dropdown trigger="click" @command="handleRoleSwitch">
    <div>
      <svg-icon icon-class="peoples" />
    </div>
    <el-dropdown-menu slot="dropdown">
      <el-dropdown-item v-for="item of rolesOptions" :key="item.id" :disabled="curRole===item.id" :command="item.id">
        {{
          item.name }}
      </el-dropdown-item>
    </el-dropdown-menu>
  </el-dropdown>
</template>

<script>
export default {

  computed: {
    rolesOptions() {
      const roles = this.$store.getters.roles
      var rolesOptions = []
      roles.forEach(role => {
        rolesOptions.push(role)
      })
      return rolesOptions
    },
    curRole() {
      return this.$store.getters.curRole
    }
  },
  methods: {
    handleRoleSwitch(role) {
      this.$ELEMENT.role = role
      this.$store.dispatch('user/switchRole', role)
      this.$nextTick(() => {
        this.$router.replace({
          path: '/redirect/dashboard'
        })
      })
      this.$message({
        message: 'Switch role Success',
        type: 'success'
      })
    }
  }

}
</script>
