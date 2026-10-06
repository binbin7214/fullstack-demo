<template>
  <div class="register">
    <h2>注册</h2>
    <input v-model="form.username" placeholder="用户名" />
    <input v-model="form.password" type="password" placeholder="密码" />
    <input v-model="form.confirmPassword" type="password" placeholder="确认密码" />
    <button @click="handleRegister">注册</button>
    <p>
      已有账号？<router-link to="/login">去登录</router-link>
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
  password: '',
  confirmPassword: ''
})

const handleRegister = async () => {
  if (!form.value.username || !form.value.password) {
    ElMessage.warning('请填写用户名和密码')
    return
  }
  if (form.value.password !== form.value.confirmPassword) {
    ElMessage.error('两次密码输入不一致')
    return
  }
  try {
    const res = await request.post('/register', {
      username: form.value.username,
      password: form.value.password
    })
    if (res.success) {
      ElMessage.success('注册成功，请登录')
      router.push('/login')
    }
  } catch (err) {
    const msg = err.response?.data?.msg
      || (err.response ? `请求错误 (${err.response.status})` : '网络异常，请检查网络连接')
    ElMessage.error(msg)
  }
}
</script>

<style scoped>
.register {
  max-width: 400px;
  margin: 100px auto;
  padding: 20px;
  text-align: center;
}
.register input {
  display: block;
  width: 100%;
  padding: 8px;
  margin: 10px 0;
  box-sizing: border-box;
}
.register button {
  width: 100%;
  padding: 10px;
  margin-top: 10px;
  cursor: pointer;
}
</style>