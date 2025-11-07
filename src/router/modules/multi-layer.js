/** When your routing table is too long, you can split it into small modules**/

import Layout from '@/layout'

const multiLayerRouter = {
  path: '/multi-layer',
  component: Layout,
  name: 'multi-layer',
  alwaysShow: true,
  meta: {
    title: '多层服务模式展示',
    icon: 'lock'
  },
  children: [
    {
      path: '/multi-layer/domain',
      component: () => import('@/views/multi-layer/domain'),
      name: 'domain',
      meta: {
        title: '领域信息维护', noCache: true
      }
    },
    {
      path: '/multi-layer/organization',
      component: () => import('@/views/multi-layer/organization'),
      name: 'organization',
      meta: {
        title: '服务组织维护', noCache: true
      }
    },
    {
      path: '/multi-layer/atomic-service',
      component: () => import('@/views/multi-layer/atomic-service'),
      name: 'atomic-service',
      meta: {
        title: '原子服务查询', noCache: true
      }
    },
    {
      path: '/multi-layer/inner-organization',
      component: () => import('@/views/multi-layer/inner-organization'),
      name: 'inner-organization',
      meta: {
        title: '组织内服务模式', noCache: true
      }
    },
    {
      path: '/multi-layer/inner-domain',
      component: () => import('@/views/multi-layer/inner-domain'),
      name: 'inner-domain',
      meta: {
        title: '领域内服务模式', noCache: true
      }
    },
    {
      path: '/multi-layer/cross-domain',
      component: () => import('@/views/multi-layer/cross-domain'),
      name: 'cross-domain',
      meta: {
        title: '跨领域服务模式', noCache: true
      }
    },
    {
      path: '/multi-layer/inner-domain/domain-provider-relation3',
      component: () => import('@/views/multi-layer/inner-domain/domain-provider-relation3'),
      name: 'test',
      meta: {
        title: '测试', noCache: true
      }
    }
  ]
}

export default multiLayerRouter
