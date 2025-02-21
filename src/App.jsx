import { useState, useEffect } from 'react'
import Blog from './components/Blog'
import blogService from './services/blogs'
import loginService from './services/login'

const App = () => {
  const [blogs, setBlogs] = useState([])
  const [newBlog, setNewBlog] = useState({ name: '', author: '', url: '' })
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState(null)


  const [errorMessage, setErrorMessage] = useState(null)
  
  useEffect(() => {
    blogService.getAll().then(blogs =>
      setBlogs( blogs )
    )  
  }, [])

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      setUser(user)
      blogService.setToken(user.token)
    }
  }, [])

  const handleLogin = async event => {
    event.preventDefault()
    
    try{
      const user = await loginService.login(
        { username, password }
      )
      blogService.setToken(user.token)
      window.localStorage.setItem('loggedUser', JSON.stringify(user))
      setUser(user)
      setUsername('')
      setPassword('')
    }
    catch (exception) {
      setErrorMessage('invalid username or password')
      setTimeout(() => {
        setErrorMessage(null)
      }, 5000);
    }
    
  }

  const addBlog = async event => {
    event.preventDefault
    const newBlog = {
      title: "Viagens na minha terra",
      author: "Graciliano Ramos",
      url: "teste.com"
    }
    const savedBlog = await blogService.create(newBlog)
    setBlogs(blogs.concat(savedBlog))
    setNewBlog(null)
  }

  const logout = () => {
    window.localStorage.removeItem('loggedUser')
    setUser(null)
  }


  const loginForm = () => {
    return(
      <>
        <h2>login</h2>
        <form onSubmit={handleLogin}>
          <div>
            username
            <input
              type='text'
              value={username}
              onChange={({ target }) => setUsername(target.value)}
            />
          </div>
          <div>
            password
            <input
              type="password"
              value={password}
              onChange={({ target }) => setPassword(target.value)}
            />
          </div>
          <button type='submit'>login</button>
        </form>
      </>
    )
  }

  const blogForm = () => {
    return(
      <>
      <form onSubmit={addBlog}>
        <input type="text" 
        value={newBlog.name}
        onChange={ event => setNewBlog({ ...newBlog, name: event.target.value })}
        />
        <button type='sumbit'>add blog</button>
      </form>
      </>

    )
  }

  return (
    <div>
      <h1>bloglist</h1>

      {user === null
        ? loginForm()
        : <>
          <p>{user.name} logged in</p>
          <button onClick={logout}>logout</button>
          {blogForm()}
          </>
      }

      <h2>blogs</h2>
      {blogs.map(blog =>
        <Blog key={blog.id} blog={blog} />
      )}
    </div>
  )
}

export default App