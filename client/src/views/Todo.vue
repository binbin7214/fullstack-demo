 <template>
  <div class="todo">
    <h2>Todo清单</h2>
    <input v-model="inputText" @keyup.enter="addTodo" placeholder="输入待办事项">
    <button @click="addTodo">新增</button>
    <!-- 筛选下拉 -->
    <div class="filter">
      <select v-model="filterFinished" @change="handleFilterChange">
        <option value="">全部</option>
        <option value="1">已完成</option>
        <option value="0">未完成</option>
      </select>
    </div>
    <ul>
      <li v-for="item in todoList" :key="item.id">
        <input type="checkbox" v-model="item.finished" @change="changeStatus(item)">
        <span :style="{textDecoration: item.finished ? 'line-through' : ''}">
          {{ item.content }}
        </span>
        <button @click="openEdit(item)">编辑</button>
        <button @click="delTodo(item.id)">删除</button>
      </li>
    </ul>
    
    <!-- Pagination Controls -->
    <div class="pagination" v-if="total > 0">
      <button @click="prevPage" :disabled="currentPage <= 1">上一页</button>
      <span>第 {{ currentPage }} / {{ totalPages }} 页，共 {{ total }} 条</span>
      <button @click="nextPage" :disabled="currentPage >= totalPages">下一页</button>
    </div>
    <!-- 编辑弹窗 -->
    <div v-if="editShow" class="modal-mask">
      <div class="modal">
        <h4>编辑待办</h4>
        <input v-model="editContent" placeholder="修改内容" />
        <div class="modal-btns">
          <button @click="saveEdit">保存</button>
          <button @click="editShow = false">取消</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref, computed, onMounted} from 'vue'
import request from '@/utils/request'

const inputText = ref('')
const todoList = ref([])

const currentPage = ref(1)
const size = ref(10)
const total = ref(0)

const filterFinished = ref('')

const editShow = ref(false)
const editId = ref('')
const editContent = ref('')

const totalPages = computed(() => Math.ceil(total.value / size.value))

// 后端 finished(1/0) → 前端 finished(true/false)
const formatList = (list) => {
  return list.map(item => ({
    ...item,
    finished: item.finished === 1 || item.finished === '1'
  }))
}

// 前端 finished(true/false) → 后端 finished(1/0)
const toServerFinished = (val) => val ? 1 : 0

const getList = async () => {  
  const params = {
    page: currentPage.value,
    size: size.value
  }
  if (filterFinished.value !== '') {
    params.finished = filterFinished.value
  }
 
  const res = await request.get('/todos', { params })
  // 获取后统一转换
  todoList.value = formatList(res.list || [])
  total.value = res.total || 0
}

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
    getList()
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    getList()
  }
}

const addTodo = async () => {
  if (!inputText.value.trim()) return
  try {
    await request.post('/todos', {
      content: inputText.value
    })
    inputText.value = ''
    currentPage.value = 1
    getList()
  } catch (err) {
    console.error('新增失败:', err)
  }
}

const changeStatus = async (item) => {
  await request.patch(`/todos/${item.id}`, { 
    finished: toServerFinished(item.finished)  // true→1, false→0
  })
  getList()
}

const delTodo = async (id) => {
  await request.delete(`/todos/${id}`)
  if (todoList.value.length === 1 && currentPage.value > 1) {
    currentPage.value--
  }
  getList()
}

const handleFilterChange = () => {
  currentPage.value = 1
  getList()
}

const openEdit = (item) => {
  editShow.value = true
  editId.value = item.id
  editContent.value = item.content
}

const saveEdit = async () => {
  if (!editContent.value.trim()) return
  await request.put(`/todos/${editId.value}`, {
    content: editContent.value
  })
  editShow.value = false
  getList()
}

onMounted(() => {
  getList()
})
</script>

<style scoped>
.pagination {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 15px;
  justify-content: center;
}
.pagination button {
  padding: 5px 10px;
  cursor: pointer;
}
.pagination button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}
</style>
