import axios from 'axios'
import { ElMessageBox } from 'element-plus'
import router from '@/router'

const service = axios.create({
  baseURL: '/api',
  timeout: 5000
})

// 请求拦截：自动带token
service.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// 响应拦截：统一处理错误
service.interceptors.response.use(
  (res) => res.data,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      ElMessageBox.confirm(
        '登录已失效，请重新登录',
        '提示',
        {
          confirmButtonText: '去登录',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        router.push('/login')
      }).catch(() => {
        // 用户点击取消，不做处理
      })
    }
    return Promise.reject(err)
  }
)

export default service