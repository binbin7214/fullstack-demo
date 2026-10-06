const express = require('express');
// const cors = require('cors') // 新增
const app = express();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const SECRET_KEY = 'my-secret-2026';
const prisma = require('./db')

// 新增，放在最前面，允许所有来源跨域
// app.use(cors({origin:"http://localhost:5173"}))

// 解析前端传过来的json
app.use(express.json());
app.use(express.urlencoded({ extended: true }))


app.use((req,res,next) => {
  console.log(`[${new Date().toLocaleString()}] ${req.url} ${req.method}`);
  next()
})

const validateTodo = (req,res,next) => {
  if (!req.body) {
    return res.status(400).json({msg:"请求体不能为空，请传入JSON格式数据"})
  }
  const { content } = req.body;
  if(!content || !content.trim()){
    return res.status(400).json({msg:"参数不能为空！"})
  }
  next()
}


// JWT鉴权中间件
const authMiddleware = (req,res,next) => {
  const authHeader = req.headers.authorization;
  if(!authHeader){
    return res.status(401).json({msg:"未登录，请先登录!"})
  }
  const token = authHeader.split(' ')[1]
  try {
    const payload = jwt.verify(token, SECRET_KEY)
    req.user = payload
    next()
  } catch(err) {
    return res.status(401).json({msg:'token失效，请重新登录'})
  }
}


// 注册接口
app.post('/api/register', async (req, res,next) => { 
  try{
    const { username, password } = req.body;
    if(!username || !password){
      return res.status(400).json({msg:"参数不能为空！"})
    }
    const existUser = await prisma.users.findUnique({
      where:{
        username
      }
    })
    if(existUser){
      return res.status(400).json({msg:"用户已存在！"})
    }

    const hasPwd = await bcrypt.hash(password,10);
    await prisma.users.create({
      data:{
        username,
        password:hasPwd
      }
    })
    res.json({msg:"注册成功"})
  }catch(err){
    next(err)
  }
})

// 登录接口
app.post('/api/login', async (req, res,next) => { 
  try{
    const { username, password } = req.body;
    if(!username || !password){
      return res.status(400).json({msg:"参数不能为空！"})
    }
    const existUser = await prisma.users.findUnique({
      where:{
        username
      }
    })
    if(!existUser){
      return res.status(400).json({msg:"用户不存在！"})
    }
    const isOk = await bcrypt.compare(password,existUser.password)
    if(!isOk){
      return res.status(400).json({msg:"密码错误！"})
    }
    // 生成token 1h有效
    const token = jwt.sign({id:existUser.id,username: existUser.username},SECRET_KEY,{expiresIn:'1h'})
    return res.json({msg:'登录成功', token})
  }catch(err){
    next(err) 
  }
})
// 获取所有todo
app.get('/api/todos',authMiddleware, async (req, res,next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const size = parseInt(req.query.size) || 10;
    const finished = req.query.finished;
    const skip = (page - 1) * size;
    const where = {
      userId:req.user.id
    }
    if(finished !== undefined && finished !== ''){
      where.finished = Number(finished)
    }
    const [list,total] = await Promise.all([
      prisma.todos.findMany({
        skip,
        take:size,
        where,
        orderBy:{id:'desc'}
      }),
      prisma.todos.count({
        where
      })
    ])
    res.json({list,total,page,size});
  } catch (err) {
    res.status(500).json({msg:'查询失败',detail: err.message});
  }
})

// 新增todo
app.post('/api/todos',authMiddleware,validateTodo, async (req, res,next) => {
  try{
    const { content } = req.body;    
    const newTodo = await prisma.todos.create({
      data:{
        content,
        finished:0,
        userId:req.user.id
      }
    })
    res.json({success:true,data:newTodo})
  }catch(err){
    res.status(500).json({msg:'查询失败',detail: err.message});
  }
})

// 修改todo
app.put('/api/todos/:id',authMiddleware,validateTodo, async (req, res,next) => {
  try{
    const { finished, content } = req.body;
    const { id } = req.params;
    const editTodo = await prisma.todos.update({
      where:{
        id:Number(id),
        userId:req.user.id
      },
      data:{
        content,
        finished:Number(finished)
      }
    })
    res.json({success:true,data:editTodo})
  }catch(err){
    res.status(500).json({msg:'修改失败',detail: err.message});
  }
})
    

// 修改完成状态
app.patch('/api/todos/:id',authMiddleware, async (req, res,next) => {
  try{
    const { finished } = req.body;
    const { id } = req.params;
    const editTodo = await prisma.todos.update({
      where:{
        id:Number(id),
        userId:req.user.id
      },
      data:{
        finished:Number(finished)
      }
    })
    res.json({success:true,data:editTodo})
  }catch(err){
    res.status(500).json({msg:'修改失败',detail: err.message});
  }
})
// 

// 删除todo
app.delete('/api/todos/:id',authMiddleware, async (req, res) => {
  try{
    const { id } = req.params;
    await prisma.todos.delete({
      where:{
        id:Number(id),
        userId:req.user.id
      }
    })
    res.json({success:true})
  }catch(err){
    res.status(500).json({msg:'删除失败',detail: err.message});
  }
})

// 全局处理
app.use((err,req,res,next) => {
  console.log(err,'服务器内部错误');
  return res.status(500).json({msg:`服务器内部错误,detial:${err.message}`})
})

// 启动服务
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀后端启动成功，地址 http://localhost:${PORT}`)
})

