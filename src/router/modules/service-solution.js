/** When your routing table is too long, you can split it into small modules**/

import Layout from '@/layout'
import Vue from 'vue'
import Axios from 'axios'
// Axios.defaults.baseURL = `http://10.147.19.68:30534/`
// Axios.defaults.baseURL = `http://10.147.19.68:18080/`
// Axios.defaults.baseURL = `http://service-registry-linan.10.147.19.68.nip.io/`
Axios.defaults.baseURL = process.env.VUE_APP_SERVICE_MANAGE_BASE_URL

Vue.prototype.$http = Axios
const serviceSolutionRouter = {
  path: '/service-solution',
  component: Layout,
  name: 'service-solution',
  meta: {
    title: '供需匹配',
    icon: 'lock'
  },
  children: [
    {
      path: '/service-solution/config',
      component: () => import('@/views/service-pattern/gymconfig'),
      name: 'config',
      meta: {
        title: '参数设置', noCache: true
      }
    },
    {
      path: '/service-solution/solution',
      component: () => import('@/views/service-pattern/gymsolution'),
      name: 'list-solution',
      meta: {
        title: '匹配方案管理', noCache: true
      }
    },
    {
      path: '/service-solution/list-solution',
      component: () => import('@/views/service-solution/list-solution'),
      name: 'list-solution',
      meta: {
        title: '服务方案查询', noCache: true
      }
    },
    {
      path: '/service-solution/list-by-user',
      component: () => import('@/views/service-solution/list-by-user'),
      name: 'list-by-user',
      meta: {
        title: '服务任务清单', noCache: true
      }
    },
    {
      path: '/service-solution/list-by-creator',
      component: () => import('@/views/service-solution/list-by-creator'),
      name: 'list-by-creator',
      meta: {
        title: '执行中的方案', noCache: true
      }
    },
    {
      path: '/service-solution/bpmn-transfer',
      component: () => import('@/views/service-solution/bpmn-transfer'),
      name: 'bpmn-transfer',
      meta: {
        title: '转换BPMN为智能合约', noCache: true
      }
    }
  ]
}

export default serviceSolutionRouter
