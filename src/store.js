import Vue from 'vue'
import Vuex from 'vuex'
import { getFileType, getFileIcon } from './config/file-icon'
import * as methods from './utils/common'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    scopeToken: {}, // 网盘的token跟token有效时间
    userInfo: {}, // 保存用户的信息，由智汀app那边带过来
    uploadList: [], // 上传文件列表
    uploadedList: [], // 已上传文件列表
    uploadingNum: 0, // 当前上传的数量
    folderPass: {}, // 文件夹密码集合
    currentFolderPass: '', // 当前文件下根目录密码
  },
  getters: {
    scopeToken: state => state.scopeToken,
    userInfo: state => state.userInfo,
    uploadList: state => state.uploadList,
    uploadedList: state => state.uploadedList,
    uploadingNum: state => state.uploadingNum,
    folderPass: state => state.folderPass,
    currentFolderPass: state => state.currentFolderPass
  },
  mutations: {
    setScopeToken(state, scopeToken) {
      state.scopeToken = scopeToken
    },
    setUserInfo(state, userInfo) {
      state.userInfo = userInfo
    },
    setUploadList(state, uploadList) {
      state.uploadList = uploadList
    },
    setUploadedList(state, uploadedList) {
      state.uploadedList = uploadedList
    },
    setUploadingNum(state, uploadingNum) {
      state.uploadingNum = uploadingNum
    },
    setFolderPass(state, folderPass) {
      state.folderPass = folderPass
    },
    setCurrentFolderPass(state, currentFolderPass) {
      state.currentFolderPass = currentFolderPass
    }
  },
  actions: {
    setScopeToken({ commit }, payload) {
      commit('setScopeToken', payload)
    },
    setUserInfo({ commit }, payload) {
      commit('setUserInfo', payload)
    },
    setUploadList({ commit }, list) {
      list.forEach((file) => {
        const type = methods.default.getSuffix(file.name)
        file.icon = getFileIcon(type) || getFileIcon('gho')
      })
      commit('setUploadList', list)
    },
    setUploadedList({ commit }, list) {
      list.forEach((file) => {
        file.suffix = methods.default.getSuffix(file.name)
        file.icon = getFileIcon(file.suffix) || getFileIcon('gho')
        if (file.thumbnail_url) {
          file.poster = `/api/plugin/wangpan/${file.thumbnail_url}`
        }
        file.fileType = getFileType(file.suffix)
      })
      commit('setUploadedList', list)
    },
    setFolderPass({ commit }, payload) {
      commit('setFolderPass', payload)
    },
    setUploadingNum({ commit }, payload) {
      commit('setUploadingNum', payload)
    },
    setCurrentFolderPass({ commit }, payload) {
      commit('setCurrentFolderPass', payload)
    }
  },
})
