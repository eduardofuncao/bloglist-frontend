import { useState, useEffect } from 'react'
import Blog from './components/Blog'
import blogService from './services/blogs'
import loginService from './services/login'

const App = () => {
  const [blogs, setBlogs] = useState([])
  const [newBlog, setNewBlog] = useState({ title: '', author: '', url: '' })
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState(null)


  const [errorMessage, setErrorMessage] = useState(null)
  const [popupMessage, setPopupMessage] = useState(null)
  
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

  const setErrorTimer = (message) => {
    setErrorMessage(message)
    setTimeout(() => {
      setErrorMessage(null)
    }, 5000);
  }

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
      setErrorTimer('invalid username or password')
    }
    
  }

  const handleBlogChange = (event) => {
    event.preventDefault()
    const { name, value } = event.target
    setNewBlog({ ...newBlog, [name]: value })
  }

  const addBlog = async event => {
    event.preventDefault()
    try {
      const savedBlog = await blogService.create(newBlog)
      setBlogs(blogs.concat(savedBlog))
      setNewBlog({ title: '', author: '', url: '' })
      setPopupMessage('new blog' + savedBlog.title + ' by ' + savedBlog.author + ' added to the blog list')
      setTimeout(() => {
        setPopupMessage(null)
      }, 5000);
    } catch (error) {
      setErrorTimer('error adding blog')

    }
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
          {errorMessage && <p>{errorMessage}</p>}
          <button type='submit'>login</button>
        </form>
      </>
    )
  }

  const blogForm = () => {
    return(
      <>
      <form onSubmit={addBlog}>
        <input
          type="text"
          name="title"
          value={newBlog.title}
          onChange={handleBlogChange}
          placeholder="Title"
        />
        <input
          type="text"
          name="author"
          value={newBlog.author}
          onChange={handleBlogChange}
          placeholder="Author"
        />
        <input
          type="text"
          name="url"
          value={newBlog.url}
          onChange={handleBlogChange}
          placeholder="URL"
        />
        <button type='sumbit'>add blog</button>
      </form>
      </>

    )
  }

  return (
    <div>
      <h1>bloglist</h1>

      {popupMessage && <p>{popupMessage}</p>}

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