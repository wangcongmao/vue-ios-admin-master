
import { constantRoutes, asyncRoutes } from '@/router'
import store from '@/store'
import { deepClone } from '@/utils'

const state = {
  routes: [],
  addRoutes: []
}

const mutations = {
  SET_ROUTES: (state, routes) => {
    state.addRoutes = routes
    state.routes = constantRoutes.concat(routes)
  }
}

const actions = {
  generateRoutes({ commit }) {
    return new Promise(resolve => {
      var accessedRoutes = deepClone(asyncRoutes)
      accessedRoutes = filterAsyncRoutes(accessedRoutes)
      commit('SET_ROUTES', accessedRoutes)
      resolve(accessedRoutes)
    })
  }
}

/**
 * Use meta.role to determine if the current user has permission
 * @param roles
 * @param route
 */
function hasPermission(route) {
  const menus = store.getters.menus
  if (route.path) {
    // eslint-disable-next-line eqeqeq
    if (route.path == '*') {
      return true
    }
    for (var menu of menus) {
      // eslint-disable-next-line eqeqeq
      if (route.path == menu.url) {
        return true
      }
    }
  }
  return false
}

/**
 * Filter asynchronous routing tables by recursion
 * @param routes asyncRoutes
 * @param roles
 */
function filterAsyncRoutes(routes) {
  const res = []
  routes.forEach(route => {
    if (hasPermission(route)) {
      if (route.children) {
        route.children = filterAsyncRoutes(route.children)
      }
      res.push(route)
    }
  })

  return res
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
