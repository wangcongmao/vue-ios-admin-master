/** When your routing table is too long, you can split it into small modules**/

import Layout from '@/layout'
import Vue from 'vue'
import Axios from 'axios'
// Axios.defaults.baseURL = `http://10.147.19.68:30534/`
// Axios.defaults.baseURL = `http://10.147.19.68:18080/`
Axios.defaults.baseURL = process.env.VUE_APP_SERVICE_MANAGE_BASE_URL
// Axios.defaults.baseURL = `http://service-registry-linan.10.147.19.68.nip.io/`
Vue.prototype.$http = Axios

const serviceManageRouter = {
  path: '/service-mange',
  component: Layout,
  name: 'service-mange',
  meta: {
    title: '服务管理',
    icon: 'lock'
  },
  children: [
    {
      path: '/service-mange/service-category/',
      component: () => import('@/views/service-mange/service-category/'),
      name: 'service-category',
      meta: {
        title: '服务领域', noCache: true
      }
    },
    {
      path: '/service-mange/list-service/',
      component: () => import('@/views/service-mange/list-service/'),
      name: 'list-service',
      meta: {
        title: '服务维护', noCache: true
      }
    },
    {
      path: '/service-mange/add-service/',
      component: () => import('@/views/service-mange/add-service/'),
      name: 'add-service',
      meta: {
        title: '服务注册', noCache: true
      }
    },

    {
      path: '/service-mange/list-service/list-api',
      component: () => import('@/views/service-mange/list-service/list-api'),
      name: 'list-api',
      meta: {
        title: '查看接口列表', noCache: true
      },
      hidden: true
    },
    {
      path: '/service-mange/service-provider/',
      component: () => import('@/views/service-mange/service-provider/'),
      name: 'service-provider',
      meta: {
        title: '服务提供商维护', noCache: true
      }
    },
    {
      path: '/service-mange/add-service/add_feature',
      component: () => import('@/views/service-mange/add-service/add_feature'),
      name: 'add-feature',
      meta: {
        title: '服务功能点新增', noCache: true
      }
    },
    {
      path: '/service-mange/list-service/list_feature',
      component: () => import('@/views/service-mange/list-service/list_feature'),
      name: 'list-service',
      meta: {
        title: '服务功能点维护', noCache: true
      }
    },
    {
      path: '/service-mange/quality-index',
      component: () => import('@/views/service-mange/quality-index'),
      name: 'quality-index',
      meta: {
        title: '质量指标管理', noCache: true
      }
    }
  ]
}

export default serviceManageRouter
