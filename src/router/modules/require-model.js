/** When your routing table is too long, you can split it into small modules**/

import Layout from '@/layout'

const requireModelRouter = {
  path: '/require-model',
  component: Layout,
  name: 'require',
  meta: {
    title: '模型管理',
    icon: 'lock'
  },
  children: [

    {
      path: '/require-model/model-category',
      component: () => import('@/views/require-model/rm-category'),
      name: 'model-category',
      meta: {
        title: '领域管理', noCache: true
      },
      hidden: true
    },
    {
      path: '/require-model/list-models',
      component: () => import('@/views/require-model/list-models'),
      name: 'list-models',
      meta: {
        title: '模型管理', noCache: true
      }
    },
    {
      path: '/service-pattern/rpsp',
      component: () => import('@/views/service-pattern/rpsp'),
      name: 'rpsp',
      meta: {
        title: '模型与服务偶对表', noCache: true
      }
    },
    {
      path: '/service-pattern/miner',
      component: () => import('@/views/service-pattern/miner'),
      name: 'miner',
      meta: {
        title: '模型挖掘', noCache: true
      }
    }
  ]
}

export default requireModelRouter
