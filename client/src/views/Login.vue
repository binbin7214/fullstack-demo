<template>
  <div class="login">
    <h2>登录</h2>
    <input v-model="form.username" placeholder="用户名" />
    <input v-model="form.password" type="password" placeholder="密码" />
    <button @click="handleLogin">登录</button>
    <p>
      没有账号？<router-link to="/register">去注册</router-link>
    </p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import request from '@/utils/request.js'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'

const router = useRouter()
const form = ref({
  username: '',
  password: ''
})

const handleLogin = async () => {
  try {
    const res = await request.post('/login', form.value)
    if (res) {
      localStorage.setItem('token', res.token)
      router.push('/')
    }
  } catch (err) {
    const msg = err.response?.data?.msg
      || (err.response ? `请求错误 (${err.response.status})` : '网络异常，请检查网络连接')
    ElMessage.error(msg)
  }
}
</script>

<style scoped>
.login {
  max-width: 400px;
  margin: 100px auto;
  padding: 20px;
  text-align: center;
}
.login input {
  display: block;
  width: 100%;
  padding: 8px;
  margin: 10px 0;
  box-sizing: border-box;
}
.login button {
  width: 100%;
  padding: 10px;
  margin-top: 10px;
  cursor: pointer;
}
</style>