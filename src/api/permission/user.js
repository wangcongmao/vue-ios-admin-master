import request from '@/utils/request'

export function login(data) {
  return request({
    url: '/rest/user/login',
    method: 'post',
    data
  })
}

export function getInfo() {
  return request({
    url: '/rest/user/info',
    method: 'get'
  })
}

export function getNewMenus(id) {
  return request({
    url: '/rest/user/newMenus',
    method: 'get',
    params: { id }
  })
}

export function logout() {
  return request({
    url: '/rest/user/logout',
    method: 'get'
  })
}

export function modifyPwd(data) {
  return request({
    url: '/rest/user/modifyPwd',
    method: 'post',
    data
  })
}

export function userList(data) {
  return request({
    url: '/rest/user/list',
    method: 'post',
    data
  })
}

export function addUser(data) {
  return request({
    url: '/rest/user/add',
    method: 'post',
    data
  })
}

export function updateUser(data) {
  return request({
    url: `/rest/user/update`,
    method: 'post',
    data
  })
}

export function updateState(data) {
  return request({
    url: '/rest/user/updateState',
    method: 'post',
    data
  })
}
