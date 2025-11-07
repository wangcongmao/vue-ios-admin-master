/** When your routing table is too long, you can split it into small modules**/

import Layout from '@/layout'

const spRouter = {
  path: '/sp',
  component: Layout,
  name: 'spManagement',
  alwaysShow: true,
  meta: {
    title: '服务模式管理',
    icon: 'lock'
  },
  children: [
    {
      path: '/service-pattern/template-category',
      component: () => import('@/views/service-pattern/sp-template-category'),
      name: 'sp-template-category',
      meta: {
        title: '领域管理', noCache: true
      },
      hidden: true
    },
    {
      path: '/service-pattern/template-add',
      component: () => import('@/views/service-pattern/sp-template-add'),
      name: 'sp-template-add',
      meta: {
        title: '服务模式构建', noCache: true
      }
    },
    {
      path: '/service-pattern/template-list',
      component: () => import('@/views/service-pattern/sp-template-list'),
      name: 'sp-template-list',
      meta: {
        title: '服务模式维护', noCache: true
      }
    },
    {
      path: '/service-pattern/template-property',
      component: () => import('@/views/service-pattern/sp-template-property'),
      name: 'sp-template-property',
      meta: {
        title: '属性管理', noCache: true
      }
    },
    {
      path: '/service-pattern/sp-add',
      component: () => import('@/views/service-pattern/sp-add'),
      name: 'SpAdd',
      meta: {
        title: '服务模式新增', noCache: true
      },
      hidden: true
    },
    {
      path: '/service-pattern/sp-list',
      component: () => import('@/views/service-pattern/sp-list'),
      name: 'SpList',
      meta: {
        title: '服务模式查询', noCache: true
      },
      hidden: true
    },
    {
      path: '/service-pattern/TableMain',
      component: () => import('@/views/service-pattern/TableMain'),
      name: 'sp',
      meta: {
        title: '服务模式维护', noCache: true
      },
      hidden: true
    },
    {
      path: '/service-pattern/list-domain-inner',
      component: () => import('@/views/service-pattern/list-domain-inner'),
      name: 'list-domain-inner',
      meta: {
        title: '领域内服务模式', noCache: true
      }
    },
    {
      path: '/service-pattern/list-domain-outter',
      component: () => import('@/views/service-pattern/list-domain-outter'),
      name: 'list-domain-outter',
      meta: {
        title: '跨领域服务模式', noCache: true
      }
    },
    {
      path: '/service-pattern/list-provider-inner',
      component: () => import('@/views/service-pattern/list-provider-inner'),
      name: 'list-provider-inner',
      meta: {
        title: '组织内服务模式', noCache: true
      }
    },
    {
      path: '/service-pattern/extract-provider-inner',
      component: () => import('@/views/service-pattern/extract-provider-inner'),
      name: 'extract-provider-inner',
      meta: {
        title: '组织内服务模式抽取', noCache: true
      }
    }
  ]
}

export default spRouter
