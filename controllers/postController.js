const Post = require('../models/postModel')
const User = require('../models/userModel')
const fs = require('fs')
const path = require('path')
const {v4: uuid} = require('uuid')
const HttpError = require('../models/errorModel')



//==============///////// CREATE A POST
// POST : api/posts
//PROTECTED


// const storage = new CloudinaryStorage({
//     cloudinary: cloudinary,
//     params: {
//       folder: 'YOUR_FOLDER_NAME', // Optional - specify a folder in Cloudinary to store uploads
//       allowed_formats: ['jpg', 'jpeg', 'png'], // Optional - specify allowed formats
//       transformation: [{ width: 500, height: 500, crop: 'limit' }] // Optional - specify image transformations
//     }
//   });
  
//   const parser = multer({ storage: storage });
  
//   const createPost = async (req, res, next) => {
//     try {
//       let { title, category, desc } = req.body;
  
//       if (!title || !category || !desc || !req.file) {
//         return next(new HttpError('Fill in all fields and choose a thumbnail.', 422));
//       }
  
//       // Handle other validations...
  
//       // Upload the thumbnail to Cloudinary
//       const result = await cloudinary.uploader.upload(req.file.path);
  
//       // Create the post with the Cloudinary URL
//       const newPost = await Post.create({ 
//         title,
//         category,
//         desc,
//         thumbnail: result.secure_url, // Use the secure URL from Cloudinary
//         creator: req.user.id
//       });
  
//       // Handle other post creation logic...
  
//       res.status(201).json(newPost);
//     } catch (error) {
//       return next(new HttpError(error));
//     }
//   };
  
  

const createPost = async(req, res, next) => {
    try {
        let {title, category, desc} = req.body;
        const {thumbnail} = req.files;
        if(!title || !category || !desc || !req.files) {
            return next(new HttpError('Fill in all fields and choose thumbnail.', 422))
        }
        
        //check file size
        if(thumbnail.size > 5000000){
            return next(new HttpError('Thumbnail too big. should be less than 500kb'), 422)
        }
        let fileName;
        fileName = thumbnail.name;
        let splittedFileName = fileName.split('.')
        let newFileName = splittedFileName[0] + uuid() + '.' + splittedFileName[splittedFileName.length - 1]
        thumbnail.mv(path.join(__dirname, '..', 'uploads', newFileName), async (err) => {
            if(err){
                return next(new HttpError(err))
            } else {

            const newPost = await Post.create( {title ,category, desc, thumbnail: newFileName, creator: req.user.id})
            if(!newPost) {
                return next(new HttpError("Post couldn't be created.", 422))
            }
           const currentUser = await User.findById(req.user.id);
           const userPostCount = currentUser.posts + 1;
           await User.findByIdAndUpdate(req.user.id, {posts: userPostCount})
            res.status(201).json(newPost)
          }
        })
    } catch (error) {
        return next(new HttpError(error))
    }    
}



//==============///////// GET ALL POSTS
// GET : api/posts
//UNPROTECTED
const getPosts = async(req, res, next) => {
   try {
    const posts =await Post.find().sort({updatedAt: -1})
    res.status(200).json(posts)
   } catch (error) {
    return next(new HttpError(error))
   }
}


//==============///////// GET A POST
// GET : api/posts/:id
//UNPROTECTED
const getPost = async(req, res, next) => {
    try {
        const postId = req.params.id;
        const post = await Post.findById(postId);
        if(!post){
            return next(new HttpError('Post not found', 404))
        }
        res.status(200).json(post)

    } catch (error) {
        return next(new HttpError(error))
    }    
}


//==============///////// GET POSTS BY CATEGO
// GET : api/posts/ctegories/category
//UNPROTECTED
const getCatPosts = async(req, res, next) => {
    try {
        const {category} = req.params;
        const catPosts = await Post.find({category}).sort({createdAt: -1})
        res.status(200).json(catPosts)
    } catch (error) {
        return next(new HttpError(error))
    }
}


//==============///////// GET AUTHOR POSTS
// GET : api/posts/users/:id
//UNPROTECTED
const getUserPosts = async(req, res, next) => {
    try {
        const {id} = req.params;
        const posts = await Post.find({creator: id}).sort({createdAt: -1})
        res.status(200).json(posts)
    } catch (error) {
        return next(new HttpError(error))
    }
}


//==============///////// EDIT A POST
// PATCH : api/posts/:id
//PROTECTED
const editPost = async(req, res, next) => {
    try {
        let fileName;
        let newFileName;
        let updatedPost;
        const postId = req.params.id;
        let {title, category, desc} = req.body;

        if(!title || !category || !desc.length < 12){
            return next(new HttpError('Fill in al fields'), 422)
        }
        if(!req.files){
            updatedPost = await Post.findByIdAndUpdate(postId, {title, category, desc}, {new: true})
        } else {
            //get old post from db
            const oldPost = await Post.findById(postId);
            //delete old thumbnail from upload
            fs.unlink(path.join(__dirname, '..', 'uploads', oldPost.thumbnail), async (err) => {
                if(err){
                     return next(new HttpError(err))
                }
               //upload new thumbnail
               const {thumbnail} = req.files;
               //check file size
               if(thumbnail.size > 200000){
                return next(new HttpError('Thumbnail too big. Should be less than 2kb'))
               }
               fileName = thumbnail.name;
               let splittedFileName = fileName.split('.')
               newFileName = splittedFileName[0] + uuid() +splittedFileName[splittedFileName.length - 1]
               thumbnail.mv(path.join(__dirname, '..', 'uploads', oldPost.thumbnail),async (err) => {
                if(err){
                    return next(new HttpError(err))
               }
            })

            updatedPost = await Post.findByIdAndUpdate(postId, {title, category, description, thumbnail: newFileName}, {new: true})
        })
     }
        res.status()
    } catch (error) {
        return next(new HttpError(error))
    }
}



//==============///////// DELETE A POST
// DELETE : api/posts/:id
//PROTECTED
const deletePost = async(req, res, next) => {
    try {
        
    } catch (error) {
        return next(new HttpError(error))
    }
}


module.exports = { createPost, getPost, getCatPosts, getPosts, getUserPosts, editPost, deletePost }