import * as http from './instance'

const apiHeader = process.env.NODE_ENV === 'development' ? '/api' : '/api'

/**
* 请求列子
*/
export const example = params => http.p(
  `${apiHeader}/examle`,
  params
)

/**
 * 获取文件夹列表
 */
export const getFolderList = (params = {}) => http.g(
  `${apiHeader}/plugin/wangpan/folders`,
  params
)

/**
 * 目录下的文件/子目录列表
 */
export const resources = (path = '/', params = {}) => http.g(
  `${apiHeader}/plugin/wangpan/resources${path}`,
  params
)

/**
 * 上传文件/创建目录
 */
export const postResources = (path = '/', params) => http.p(
  `${apiHeader}/plugin/wangpan/resources${path}`,
  params
)

/**
 * 上传文件/创建目录
 */
export const getChunks = (path, params) => http.g(
  `${apiHeader}/plugin/wangpan/chunks/${path}`,
  params
)

/**
 * 复制/移动文件/目录
 */
export const moveFile = params => http.pa(
  `${apiHeader}/plugin/wangpan/resources`,
  params
)

/**
 * 删除文件/目录
 */
export const deleteFile = params => http.d(
  `${apiHeader}/plugin/wangpan/resources`,
  params
)

/**
 * 文件/目录重命名
 */
export const rename = (path, params) => http.u(
  `${apiHeader}/plugin/wangpan/resources/${path}`,
  params
)

/**
 * 文件下载
 */
export const downloadFiles = (path, params = { responseType: 'blob' }) => http.g(
  `${apiHeader}/plugin/wangpan/download${path}`,
  params
)

/**
 * 获取别人共享给我的目录列表
 */
export const getShareList = (params = {}) => http.g(
  `${apiHeader}/plugin/wangpan/shares`,
  params
)

/**
 * 共享目录
 */
export const shareFiles = (params = {}) => http.p(
  `${apiHeader}/plugin/wangpan/shares`,
  params
)

/**
 * SA成员列表
 */
export const getUserList = (params = {}) => http.g(
  `${apiHeader}/users`,
  params
)

/**
 * 合并分片
 */
export const mergeFile = (path, params = {}) => http.p(
  `${apiHeader}/plugin/wangpan/resources${path}`,
  params
)

/**
 * 解密文件夹
 */
export const decryptFolder = (name, params) => http.pa(
  `${apiHeader}/plugin/wangpan/folders/${name}`,
  params
)

/**
 * 闲置硬盘列表
 */
export const disksList = params => http.g(
  `${apiHeader}/plugin/wangpan/disks`,
  params
)

/**
 * 选中添加到存储池
 */
export const addDisk = params => http.p(
  `${apiHeader}/plugin/wangpan/disks`,
  params
)

/**
 * 存储池列表
 */
export const poolsList = params => http.g(
  `${apiHeader}/plugin/wangpan/pools`,
  params
)

/**
 * 选择硬盘创建存储池
 */
export const addPool = params => http.p(
  `${apiHeader}/plugin/wangpan/pools`,
  params
)

/**
 * 编辑存储池
 */
export const editPool = (id, params) => http.u(
  `${apiHeader}/plugin/wangpan/pools/${id}`,
  params
)

/**
 * 存储池详情
 */
export const poolDetail = (name, params) => http.g(
  `${apiHeader}/plugin/wangpan/pools/${name}`,
  params
)

/**
 * 删除存储池
 */
export const deletePool = (name, params) => http.d(
  `${apiHeader}/plugin/wangpan/pools/${name}`,
  params
)

/**
 * 分区列表
 */
export const partitionsList = params => http.g(
  `${apiHeader}/plugin/wangpan/partitions`,
  params
)

/**
 * 新建分区
 */
export const addPartition = params => http.p(
  `${apiHeader}/plugin/wangpan/partitions`,
  params
)

/**
 * 编辑分区
 */
export const editPartition = (id, params) => http.u(
  `${apiHeader}/plugin/wangpan/partitions/${id}`,
  params
)

/**
 * 删除分区
 */
export const deletePartition = (id, params) => http.d(
  `${apiHeader}/plugin/wangpan/partitions/${id}`,
  params
)

/**
 * 文件夹详情
 */
export const folderDetail = (id, params) => http.g(
  `${apiHeader}/plugin/wangpan/folders/${id}`,
  params
)

/**
 * 删除文件夹
 */
export const folderDelete = (id, params) => http.d(
  `${apiHeader}/plugin/wangpan/folders/${id}`,
  params
)

/**
 * 编辑文件夹
 */
export const folderEdit = (id, params) => http.u(
  `${apiHeader}/plugin/wangpan/folders/${id}`,
  params
)

/**
 * 添加文件夹
 */
export const folderAdd = params => http.p(
  `${apiHeader}/plugin/wangpan/folders`,
  params
)

/**
 * 修改文件夹密码
 */
export const updateFolderPassword = params => http.p(
  `${apiHeader}/plugin/wangpan/updateFolderPwd`,
  params
)

/**
 * 获取文件设置信息
 */
export const getSetInfo = params => http.g(
  `${apiHeader}/plugin/wangpan/settings`,
  params
)

/**
 * 修改文件设置信息
 */
export const updateSetInfo = params => http.p(
  `${apiHeader}/plugin/wangpan/settings`,
  params
)

/**
 * 删除任务
 */
export const deleteTask = (id, params) => http.d(
  `${apiHeader}/plugin/wangpan/tasks/${id}`,
  params
)

/**
 * 重新开始任务
 */
export const restartTask = (id, params) => http.u(
  `${apiHeader}/plugin/wangpan/tasks/${id}`,
  params
)

/**
 * 获取预览文件
 */
export const preview = (id, params) => http.g(
  `${apiHeader}/plugin/wangpan/preview/${id}`,
  params
)
