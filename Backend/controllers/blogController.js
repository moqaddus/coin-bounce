const Joi=require('joi')
const fs=require('fs')
const Blog=require('../models/blogs')
const {BACKEND_SERVER_PATH}=require('../config/index')
const BlogDTO=require('../dto/blog')
const BlogDetailsDTO=require('../dto/blogDetails')
const Comment=require('../models/comment')

const blogController={
  async create(req,res,next){
    //1.validate
    //2.handling photo
    //3.add to db
    //return responce

    //1
    const mongodbIdPattern=/^[0-9a-fA-F]{24}$/;
    //photo form client in the form base 64 pattern
    //photo->decode->store in db
    const createBlogSchema=Joi.object({
      title:Joi.string().required(),
      author:Joi.string().required().regex(mongodbIdPattern),
      content:Joi.string().required(),
      photo:Joi.string().required(),
    });
    const {error}=createBlogSchema.validate(req.body);
    if(error)
    {
      return next(error);
    }

    const {title,author,content,photo}=req.body

    //read as buffer
    const buffer=Buffer.from(photo.replace(/^data:image\/(png|jpg|jpeg);base64,/,''),'base64')
    //allot a random name
    const imagePath=`${Date.now()}-${author}`;



    //save locally
    try {
      fs.writeFileSync(`storage/${imagePath}.png`,buffer)
    } catch (error) {

      return next(error);
      
    }
    let newBlog;

    try {
      newBlog=new Blog({
        title,
        author,
        content,
        photoPath:`${BACKEND_SERVER_PATH}/storage/${imagePath}`
      });

      await newBlog.save();
    } catch (error) {
      return next(error)
      
    }
    const blogDto=new BlogDTO(newBlog);
    res.status(201).json({blog:blogDto})

  },
  async getAll(req,res,next){
    try{
      const blogs=await Blog.find({});

      const blogDto=[]
      for(let i=0;i<blogs.length;i++)
      {
        const dto=new BlogDTO(blogs[i]);
        blogDto.push(dto);
      }

      return res.status(200).json({blogs:blogDto})
    }
    catch(error)
    {
      return next(error);
    }

  },
  async update(req,res,next){


    //validate
    //if photo update then delete photo
    //responce

    const updateBlogSchema=Joi.object({
      title:Joi.string().required(),
      author:Joi.string().required().regex(mongodbIdPattern),
      content:Joi.string().required(),
      photo:Joi.string(),
      blogId:Joi.string().required().regex(mongodbIdPattern),
      
    });

    const {error}=updateBlogSchema.validate(req.body);

    const {title,author,blogId,photo}=req.body;

    //delete prev photo
    //save new photo
    try {
      
    const blog =await Blog.findOne({_id:blogId})
    
    } catch (error) {
      return next(error);
      
    }
    //if photo update
    if(photo){
      previousPhoto=blog.photoPath;

      previousPhoto=previousPhoto.split('/').at(-1);

      //delete photo
      fs.unlinkSync(`storage/${previousPhoto}`);

      const buffer=Buffer.from(photo.replace(/^data:image\/(png|jpg|jpeg);base64,/,''),'base64')
    //allot a random name
    const imagePath=`${Date.now()}-${author}`;



    //save locally
    try {
      fs.writeFileSync(`storage/${imagePath}.png`,buffer)
    } catch (error) {

      return next(error);
      
    }
    await Blog.updateOne({_id:blogId},{
      title,content,photoPath:`${BACKEND_SERVER_PATH}/storage/${imagePath}`
    });
    }
    else
    {
      await Blog.updateOne({_id:blogId},{title,content});
    }


    return res.status(200).json({message:'blog updated'});


  },
  async delete(req,res,next){
    //validation
    //delete blog
    //detele comments if any

    const updateBlogSchema=Joi.object({
      
      id:Joi.string().required().regex(mongodbIdPattern),
      
    });

    const {error}=updateBlogSchema.validate(req.body);

    const {id}=req.params;

    //deletion
    try{
      await Blog.deleteOne({_id:id});
      await Comment.deleteMany({blog:id});
    }
    catch(error){
      return next(error);
    }

    return res.status(200).json({message:'blog deleted'})


  },
  async getById(req,res,next){
    const getByIdSchema=Joi.object({
      id:Joi.string().regex(mongodbIdPattern).required(),

    });

    const {error}=getByIdSchema.validate(req.params);
    if(error)
    {
      return next(error)
    }
    let blog;
    const {id}=req.params;

    try {
      //.populate(author) causes the info of author to be included in blog
      blog= await Blog.findOne({_id:id}).populate('author');
    } catch (error) {
      return next(error);
      
    }
    const blogDto=new BlogDetailsDTO(blog);

    return res.status(200).json({blog:blogDto})

  },
}

module.exports=blogController