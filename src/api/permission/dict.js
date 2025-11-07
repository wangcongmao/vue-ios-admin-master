import request from '@/utils/request'

export function dictList(data) {
  return request({
    url: '/rest/dict/list',
    method: 'post',
    data
  })
}

export function dictInfo(type) {
  return request({
    url: `/rest/dict/info`,
    method: 'get',
    params: { type }
  })
}

export function addDict(data) {
  return request({
    url: '/rest/dict/add',
    method: 'post',
    data
  })
}

export function updateDict(data) {
  return request({
    url: `/rest/dict/update`,
    method: 'post',
    data
  })
}

export function deleteDict(id) {
  return request({
    url: `/rest/dict/delete`,
    method: 'get',
    params: { id }
  })
}
