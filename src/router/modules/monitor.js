/** When your routing table is too long, you can split it into small modules**/

import Layout from '@/layout'

const monitorRouter = {
  path: '/monitor',
  component: Layout,
  name: 'Monitor',
  meta: {
    title: '系统监控',
    icon: 'monitor'
  },
  children: [
    {
      path: '/monitor/blog',
      component: () => import('@/views/monitor/blog'),
      name: 'Blog',
      meta: { title: '业务日志', noCache: true }
    },
    {
      path: '/monitor/error-log',
      component: () => import('@/views/monitor/error-log'),
      name: 'ErrorLog',
      meta: { title: '错误日志', noCache: true }
    }
  ]
}

export default monitorRouter
