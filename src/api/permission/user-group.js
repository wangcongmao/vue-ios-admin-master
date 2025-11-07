import request from '@/utils/request2'

export function roleList(data) {
  return request({
    url: '/group/query',
    method: 'get',
    data
  })
}

export function roles() {
  return request({
    url: '/group/list',
    method: 'get'
  })
}

export function users() {
  return request({
    url: '/user/list',
    method: 'get'
  })
}

export function addRole(data) {
  return request({
    url: '/group/create',
    method: 'post',
    data: data
  })
}

export function updateRole(id, data) {
  return request({
    url: `/group/update/${id}`,
    method: 'post',
    data
  })
}

export function deleteRole(id) {
  return request({
    url: `/group/${id}`,
    method: 'delete'
  })
}
