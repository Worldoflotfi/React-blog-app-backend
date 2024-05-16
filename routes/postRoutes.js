const {Router} = require('express')

const authMiddleware = require('../middlewares/authMiddleware')
const {createPost, getPost, getCatPosts, getPosts, getUserPosts, editPost, deletePost} = require('../controllers/postController')

const router = Router()

router.post('/', createPost)
router.get('/:id', getPost)
router.get('/', getPosts)
router.get('/categories/category', getCatPosts)
router.get('/users:id', getUserPosts)
router.patch('/:id',authMiddleware, editPost)
router.delete('/:id', deletePost)

module.exports = router