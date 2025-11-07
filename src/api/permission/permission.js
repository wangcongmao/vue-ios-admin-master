import request from '@/utils/request'

export function permissions() {
  return request({
    url: '/rest/permission/all',
    method: 'get'
  })
}

export function permissionsByRole(data) {
  return request({
    url: `/rest/permission/allByRole/${data}`,
    method: 'get'
  })
}

export function addPermission(data) {
  return request({
    url: '/rest/permission/add',
    method: 'post',
    data
  })
}

export function updatePermission(data) {
  return request({
    url: `/rest/permission/update`,
    method: 'post',
    data
  })
}
export function deletePermission(id) {
  return request({
    url: `/rest/permission/delete`,
    method: 'get',
    params: { id }
  })
}
