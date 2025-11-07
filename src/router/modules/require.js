/** When your routing table is too long, you can split it into small modules**/

import Layout from '@/layout'

const requireRouter = {
  path: '/requires',
  component: Layout,
  name: 'require',
  meta: {
    title: '需求操作',
    icon: 'lock'
  },
  children: [
    {
      path: '/requires/add-require/index',
      component: () => import('@/views/requires/add-require/index'),
      name: 'add-require',
      meta: {
        title: '新增需求', noCache: true
      }
    },
    {
      path: '/requires/add-require/llm',
      component: () => import('@/views/requires/add-require/llm_add_require'),
      name: 'llm-add-require',
      meta: {
        title: '文本生成需求', noCache: true
      }
    },
    {
      path: '/requires/all-requires/index',
      component: () => import('@/views/requires/all-requires/index'),
      name: 'all-requires',
      meta: {
        title: '需求维护', noCache: true
      }
    },
    // {
    //   path: '/requires/template-category',
    //   component: () => import('@/views/requires/rp-template-category'),
    //   name: 'rp-template-category',
    //   meta: {
    //     title: '领域管理', noCache: true
    //   }
    // },
    // {
    //   path: '/requires/template-property',
    //   component: () => import('@/views/requires/rp-template-property'),
    //   name: 'rp-template-property',
    //   meta: {
    //     title: '属性管理', noCache: true
    //   }
    // },
    // {
    //   path: '/requires/template-add',
    //   component: () => import('@/views/requires/rp-template-add'),
    //   name: 'rp-template-add',
    //   meta: {
    //     title: '模板注册', noCache: true
    //   }
    // },
    // {
    //   path: '/requires/template-list',
    //   component: () => import('@/views/requires/rp-template-list'),
    //   name: 'rp-template-list',
    //   meta: {
    //     title: '模板管理', noCache: true
    //   }
    // },
    {
      path: '/requires/add-rp/index',
      component: () => import('@/views/requires/add-rp/index'),
      name: 'add-rp',
      meta: {
        title: '新增需求模式', noCache: true
      },
      hidden: true
    },
    {
      path: '/requires/all-rps/index',
      component: () => import('@/views/requires/all-rps/index'),
      name: 'all-rps',
      meta: {
        title: '需求模式维护', noCache: true
      },
      hidden: true
    }
    // {
    //   path: '/requires/mine-rp/index',
    //   component: () => import('@/views/requires/mine-rp/index'),
    //   name: 'mine-rp',
    //   meta: {
    //     title: '需求模式挖掘', noCache: true
    //   }
    // }
  ]
}

export default requireRouter
