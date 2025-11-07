import { login, logout, getInfo, getNewMenus } from '@/api/permission/user'
import { getToken, setToken, removeToken } from '@/utils/auth'
import router, { resetRouter } from '@/router'
import store from '../index'

const state = {
  token: getToken(),
  userinfo: {},
  roles: [],
  curRole: -1,
  menus: [],
  permissions: []
}

const mutations = {
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  SET_USER: (state, userinfo) => {
    state.userinfo = userinfo
  },
  SET_ROLES: (state, roles) => {
    state.roles = roles
  },
  SET_CUR_ROLE: (state, curRole) => {
    state.curRole = curRole
  },
  SET_MENUS: (state, menus) => {
    state.menus = menus
  },
  SET_PERMISSIONS: (state, permissions) => {
    state.permissions = permissions
  }
}

const actions = {
  // user login
  login({ commit }, userInfo) {
    const { username, password } = userInfo
    return new Promise((resolve, reject) => {
      login({ username: username.trim(), password: password }).then(response => {
        commit('SET_TOKEN', response.result)
        setToken(response.result)
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // get user info
  getInfo({ commit, state }) {
    return new Promise((resolve, reject) => {
      getInfo(state.token).then(response => {
        if (!response) {
          reject('Verification failed, please Login again.')
        }
        const userinfo = response.result
        if (!userinfo || userinfo == null) {
          reject('getInfo: userinfo must be a non-null object!')
        }
        const { roles, curRoleId, menus, permissions } = userinfo
        // roles must be a non-empty array
        if (!roles || roles.length <= 0) {
          reject('getInfo: roles must be a non-null array!')
        }
        if (!menus || menus.length <= 0) {
          reject('getInfo: menus must be a non-null array!')
        }
        const rolesInfo = []
        for (var role of roles) {
          rolesInfo.push({ name: role.name, id: role.id })
        }

        commit('SET_USER', userinfo)
        commit('SET_ROLES', rolesInfo)
        commit('SET_CUR_ROLE', curRoleId)
        commit('SET_MENUS', menus)
        commit('SET_PERMISSIONS', permissions)
        // resolve(response.result)
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // 根据角色id获取新的菜单树
  getMenus({ commit, dispatch }, role) {
    return new Promise((resolve, reject) => {
      getNewMenus(role).then(response => {
        if (!response) {
          reject('Verification failed, please Login again.')
        }
        const userinfo = response.result
        if (!userinfo || userinfo == null) {
          reject('getNewMenus: userinfo must be a non-null object!')
        }
        const { menus, curRoleId } = userinfo

        if (!menus || menus.length <= 0) {
          reject('getNewMenus: menus must be a non-null array!')
        }

        commit('SET_MENUS', menus)
        commit('SET_CUR_ROLE', curRoleId)
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // 切换角色，即重新获取角色的菜单列表
  switchRole({ commit, dispatch }, role) {
    return new Promise(async resolve => {
      await store.dispatch('user/getMenus', role)

      resetRouter()

      // generate accessible routes map based on roles
      const accessRoutes = await store.dispatch('permission/generateRoutes')

      // dynamically add accessible routes
      router.addRoutes(accessRoutes)
      // reset visited views and cached views
      store.dispatch('tagsView/delAllViews')
      resolve()
    })
  },
  // user logout
  logout({ commit, state }) {
    return new Promise((resolve, reject) => {
      logout(state.token).then(() => {
        commit('SET_TOKEN', '')
        commit('SET_USER', {})
        commit('SET_ROLES', [])
        commit('SET_MENUS', [])
        commit('SET_PERMISSIONS', [])
        removeToken()
        resetRouter()
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // remove token
  resetToken({ commit }) {
    return new Promise(resolve => {
      commit('SET_TOKEN', '')
      removeToken()
      resolve()
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
