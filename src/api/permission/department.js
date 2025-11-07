import request from '@/utils/request'

export function departments() {
  return request({
    url: '/rest/department/all',
    method: 'get'
  })
}

export function addDpartment(data) {
  return request({
    url: '/rest/department/add',
    method: 'post',
    data
  })
}

export function updateDpartment(data) {
  return request({
    url: `/rest/department/update`,
    method: 'post',
    data
  })
}
export function deleteDpartment(id) {
  return request({
    url: '/rest/department/delete',
    method: 'get',
    params: { id }
  })
}
