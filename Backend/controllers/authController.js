const Joi=require('joi');
const User=require('../models/user');
const bcrypt=require('bcryptjs')
const UserDTO=require('../dto/user')
const RefreshToken=require('../models/token')
const JWTServices=require('../services/JWTServices')

const passPattern=/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,25}$/;
const authController={
  async login(req,res,next){
    //validation
    const userLoginSchema=Joi.object({
      username:Joi.string().min(5).max(30).required(),
      password:Joi.string().pattern(passPattern).required(),
    });

    const {error}=userLoginSchema.validate(req.body);

    if(error){
      return next(error);
    }

    const {username,password}=req.body;

    let user;

    try{
      user =await User.findOne({username:username})
      if(!user){
        const error={
          status:401,
          message:'invalid username'
        }
        return next(error);
      }

      //match password
      //req.body.password->decrypt->match
      const match=await bcrypt.compare(password,user.password);
      if(!match)
      {
        const error={
          status:401,
          message:'Invalid password'
        }
        return next(error);
      }
    }
    catch(error){
      return next(error)
    }
   
    const accessToken=JWTServices.signAccessToken({_id:user._id}, '30m');
    const refreshToken=JWTServices.signAccessToken({_id:user._id}, '60m');
    
    //update refresh token in db
    try {
      RefreshToken.updateOne({
        _id:user._id,
  
      },
      {token:refreshToken},
      {upsert:true}
      )
      
    } catch (error) {
      return next(error);
    }




    
    res.cookie('accessToken',accessToken,{
      maxAge:1000*60*60*24,
      httpOnly:true
    });

    res.cookie('refreshToken',refreshToken,{
      maxAge:1000*60*60*24,
      httpOnly:true
    });


    const userDto=new UserDTO(user);
    //if error
    //matching with db data


    return res.status(200).json({user:userDto,auth: true});


  },

  async register(req,res,next){
    //validation of input
    const userRegisterSchema=Joi.object({
      username:Joi.string().min(5).max(30).required(),
      name:Joi.string().max(30).required(),
      email:Joi.string().email().required(),
      password:Joi.string().pattern(passPattern).required(),
      confirmPassword:Joi.ref('password')
    });

    const {error}=userRegisterSchema.validate(req.body);
    //if error in validation->return error via middleware
    if(error){
      return next(error);
    }

    //if already reistered(name or email)
    const {username,name,email,password}=req.body;

    try {
      const emailInUse=await User.exists({email});

      const usernameTinuse=await User.exists({username});

      if(emailInUse){
        const error={
          status:409,
          message:'Email already registered,use another email'
        }
        return next(error)

      }
      if(usernameTinuse)
      {
        const error={
          status:409,
          message:'Username not available'
        }
        return next(error)
      }
    } catch (error) {
      return next(error)
      
    }
    //password hashing
    const hashedPassword=await bcrypt.hash(password,10);
    
    
    //store data in db
    let accessToken;
    let refreshToken;
    let user;
    try {
      const userToRegister=new User({
        username:username,
        email:email,
        name:name,
        password:hashedPassword
      });

      user=await userToRegister.save();

      //token
      accessToken=JWTServices.signAccessToken({_id:user._id},'30m');

      refreshToken=JWTServices.singRefreshToken({_id:user._id},'30m');
      
    } catch (error) {
      return next(error)
    }
    //storing token in db
    await JWTServices.storeRefreshToken(refreshToken,user._id)
    //sending cookies
    res.cookie('accessToken',accessToken,{
      maxAge:1000*60*60*24,
      httpOnly:true,//can be accessed when comes from client side
    })

    res.cookie('refreshToken',refreshToken,{
      maxAge:1000*60*60*24,
      httpOnly:true,//can be accessed when comes from client side
    })

    
    
    //responce send
    const userDto=new UserDTO(user);
    return res.status(201).json({ user: userDto, auth: true });

  },
  async logout(req,res,next){
    //delete refresh token from db
    const {refreshToken}=req.cookies;
    try {
      await RefreshToken.deleteOne({token:refreshToken})
    } catch (error) {
      return next(error)
    }
    //delete cookies
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');


    //responce
    res.status(200).json({user:null,auth:false});
  }
  
}
module.exports=authController;