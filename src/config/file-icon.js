const docIcon = require('../assets/file-icon/doc.png')
const excelIcon = require('../assets/file-icon/excel.png')
const folderIcon = require('../assets/file-icon/folder.png')
const folderShareIcon = require('../assets/file-icon/folder-share.png')
const ghoIcon = require('../assets/file-icon/gho.png')
const imgIcon = require('../assets/file-icon/img.png')
const musicIcon = require('../assets/file-icon/music.png')
const pdfIcon = require('../assets/file-icon/pdf.png')
const pptIcon = require('../assets/file-icon/ppt.png')
const txtIcon = require('../assets/file-icon/txt.png')
// eslint-disable-next-line
const videoIcon = require('../assets/file-icon/video.png')
const zipIcon = require('../assets/file-icon/zip.png')

export const getFileType = (suffix) => {
  const doc = ['doc', 'docx', 'dot', 'dotx', 'docm']
  const excel = ['xls', 'xlsx']
  const ppt = ['ppt', 'pptx']
  const image = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'ico', 'dc3', 'dcm', 'dib', 'dic', 'eps', 'icb', 'iff', 'j2c', 'j2k', 'jp2', 'jpc', 'jpf', 'jps', 'jpx',
    'mpo', 'pam', 'pbm', 'pcx', 'pdd', 'pdp', 'pfm', 'pgm', 'pnm', 'ppm', 'psb', 'psd', 'psdt', 'pxr', 'raw', 'rle', 'sct', 'tdi', 'tga', 'tif', 'tiff', 'vda', 'vst', 'heic']
  const folder = ['folder']
  const gho = ['gho']
  const mp3 = ['mp3', 'ape', 'flac', 'ogg', 'aac', 'wav', 'mod', 'ac3', 'aif', 'aifc', 'aiff', 'amr', 'caf', 'cda', 'fiv', 'm4a', 'm4b', 'mid', 'oga',
    'ra', 'sf2', 'sfark', 'voc', 'weba', 'wma']
  const video = ['mp4', 'mov', 'avi', 'rmvb', 'rm', 'flv', '3gp', 'asf', 'm2ts', 'm4v', 'mkv', 'movie', 'mpeg', 'mpg', 'ram', 'vob', 'webm', 'wmv']
  const pdf = ['pdf']
  const txt = ['txt']
  const zip = ['zip', 'rar', 'arj', 'z', '0', '000', '001', '7z', 'ace', 'ain', 'alz', 'apz', 'ar', 'arc', 'ari', 'axx', 'bh', 'bhx', 'boo', 'bz', 'bz2', 'bza', 'c00',
    'c01', 'c02', 'cab', 'car', 'cbr', 'cbz', 'cp9', 'cpgz', 'cpt', 'dar', 'dd', 'dgc', 'efw', 'f', 'gca', 'gz', 'ha', 'hbc', 'hbc2', 'hbe', 'hki', 'hki1', 'hki2', 'hki3',
    'hpk', 'hyp', 'ice', 'imp', 'ipk', 'ish', 'jar', 'jgz', 'jic', 'kgb', 'kz', 'lbr', 'lha', 'lnx', 'lqr', 'lz4', 'lzh', 'lzm', 'lzma', 'lzo', 'lzx', 'md', 'mint', 'mou',
    'mpkg', 'mzp', 'nz', 'p7m', 'package', 'pae', 'pak', 'paq6', 'paq7', 'paq8', 'par', 'par2', 'pbi', 'pcv', 'pea', 'pf', 'pim', 'pit', 'piz', 'puz', 'pwa', 'qda', 'r00',
    'r01', 'r02', 'r03', 'rk', 'rnc', 'rpm', 'rte', 'rz', 'rzs', 's00', 's01', 's02', 's7z', 'sar', 'sdn', 'sea', 'sfs', 'sfx', 'sh', 'shar', 'shk', 'shr', 'sit', 'sitx',
    'spt', 'sqx', 'sqz', 'tar', 'taz', 'tbz', 'tbz2', 'tgz', 'tlz', 'tlz4', 'txz', 'uc2']
  const share = ['foldershare']
  if (doc.includes(suffix)) {
    return 'doc'
  }
  if (excel.includes(suffix)) {
    return 'excel'
  }
  if (ppt.includes(suffix)) {
    return 'ppt'
  }
  if (image.includes(suffix)) {
    return 'image'
  }
  if (folder.includes(suffix)) {
    return 'folder'
  }
  if (gho.includes(suffix)) {
    return 'gho'
  }
  if (mp3.includes(suffix)) {
    return 'mp3'
  }
  if (video.includes(suffix)) {
    return 'video'
  }
  if (pdf.includes(suffix)) {
    return 'pdf'
  }
  if (txt.includes(suffix)) {
    return 'txt'
  }
  if (zip.includes(suffix)) {
    return 'zip'
  }
  if (share.includes(suffix)) {
    return 'share'
  }
  return ''
}

export const getFileIcon = (suffix) => {
  const type = getFileType(suffix)
  if (type === 'doc') {
    return docIcon
  }
  if (type === 'excel') {
    return excelIcon
  }
  if (type === 'ppt') {
    return pptIcon
  }
  if (type === 'image') {
    return imgIcon
  }
  if (type === 'folder') {
    return folderIcon
  }
  if (type === 'gho') {
    return ghoIcon
  }
  if (type === 'mp3') {
    return musicIcon
  }
  if (type === 'video') {
    return videoIcon
  }
  if (type === 'pdf') {
    return pdfIcon
  }
  if (type === 'txt') {
    return txtIcon
  }
  if (type === 'zip') {
    return zipIcon
  }
  if (type === 'share') {
    return folderShareIcon
  }
  return ghoIcon
}

export default {
  getFileIcon
}
