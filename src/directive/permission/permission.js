import store from '@/store'

export default {
  inserted(el, binding, vnode) {
    const { value } = binding
    const permissions = store.getters && store.getters.permissions

    if (value && value instanceof Array && value.length > 0 && permissions) {
      let hasPermission = false
      for (var perm of permissions) {
        if (perm.url === value[0]) {
          hasPermission = true
          break
        }
      }
      if (!hasPermission) {
        el.remove()
      }
    } else {
      throw new Error(`need permissions! Like v-permission="['/rest/user/list']"`)
    }
  }
}
