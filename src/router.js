import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/home/index.vue'
import Share from './views/share/index.vue'
import Login from './views/login/index.vue'
import Detail from './views/detail/index.vue'
import Transmission from './views/transmission/index.vue'
import Move from './views/move/index.vue'
import Mine from './views/mine/index.vue'
import Storage from './views/mine/storage/index.vue'
import StorageDetail from './views/mine/storage/detail.vue'
import Partition from './views/mine/storage/partition.vue'
import FolderManage from './views/mine/folder-manage/index.vue'
import FolderSetting from './views/mine/folder-manage/setting.vue'
import FolderEdit from './views/mine/folder-manage/edit.vue'
import MemberAdd from './views/mine/folder-manage/member-add.vue'
import AddPool from './views/mine/storage/add-pool.vue'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/login',
      name: 'login',
      component: Login
    },
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/share',
      name: 'share',
      component: Share
    },
    {
      path: '/detail',
      name: 'detail',
      component: Detail
    },
    {
      path: '/transmission',
      name: 'transmission',
      component: Transmission
    },
    {
      path: '/move',
      name: 'move',
      component: Move
    },
    {
      path: '/mine',
      name: 'mine',
      component: Mine
    },
    {
      path: '/mine/storage',
      name: 'storage',
      component: Storage
    },
    {
      path: '/mine/storage/detail',
      name: 'storageDetail',
      component: StorageDetail
    },
    {
      path: '/mine/storage/partition',
      name: 'storagePartition',
      component: Partition
    },
    {
      path: '/mine/folder-manage',
      name: 'folderManage',
      component: FolderManage
    },
    {
      path: '/mine/folder-manage/setting',
      name: 'folderSetting',
      component: FolderSetting
    },
    {
      path: '/mine/folder-manage/add',
      name: 'folderAdd',
      component: FolderEdit
    },
    {
      path: '/mine/folder-manage/edit',
      name: 'folderEdit',
      component: FolderEdit
    },
    {
      path: '/mine/folder-manage/member-add',
      name: 'memberAdd',
      component: MemberAdd
    },
    {
      path: '/mine/storage/add-pool',
      name: 'addPool',
      component: AddPool
    }
  ]
})
