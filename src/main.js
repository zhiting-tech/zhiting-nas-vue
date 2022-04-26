import Vue from 'vue'
import {
  Tabbar,
  TabbarItem,
  NavBar,
  Badge,
  Image as VanImage,
  Checkbox,
  CheckboxGroup,
  Empty,
  Popup,
  Button,
  DropdownMenu,
  DropdownItem,
  Icon,
  Field,
  List,
  Progress,
  Dialog,
  Cell,
  CellGroup,
  Loading,
  PullRefresh,
  Overlay,
  Switch,
  Radio,
  RadioGroup,
  Popover,
  Form,
  ImagePreview,
  Slider,
  Swipe,
  SwipeItem,
  SwipeCell
} from 'vant'
import Cookies from 'js-cookie'
import i18n from './lang/index' // 多语言
import App from './App.vue'
import WeakNetwork from './components/WeakNetwork.vue'
import CommonLoading from './components/Loading.vue'
import Operation from './components/Operation.vue'
import router from './router'
import store from './store'
import './styles/index.scss'
import * as common from './utils/common'
import * as http from './api/http'
import Bus from './bus/index'

Vue.use(Tabbar)
  .use(TabbarItem)
  .use(NavBar)
  .use(Badge)
  .use(VanImage)
  .use(Checkbox)
  .use(CheckboxGroup)
  .use(Empty)
  .use(Icon)
  .use(Field)
  .use(Popup)
  .use(Button)
  .use(DropdownMenu)
  .use(DropdownItem)
  .use(List)
  .use(Progress)
  .use(Dialog)
  .use(Cell)
  .use(CellGroup)
  .use(Loading)
  .use(PullRefresh)
  .use(Overlay)
  .use(Switch)
  .use(Radio)
  .use(RadioGroup)
  .use(Popover)
  .use(Form)
  .use(ImagePreview)
  .use(Slider)
  .use(Swipe)
  .use(SwipeItem)
  .use(SwipeCell)

Vue.component('WeakNetwork', WeakNetwork)
Vue.component('Loading', CommonLoading)
Vue.component('Operation', Operation)

Vue.prototype.http = http
Vue.prototype.$methods = common.default
Vue.prototype.$EventBus = Bus
Vue.prototype.Cookies = Cookies

Vue.config.productionTip = false

new Vue({
  router,
  i18n,
  store,
  render: h => h(App),
}).$mount('#app')
