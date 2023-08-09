const jwt=require('jsonwebtoken');
const RefreshToken=require('../models/token')
const {AccessTokenSecret,RefershTokenSecret}=require('../config/index')
class JWTServices{
  //sign access token
  //expiry time is less then refresh token
  static signAccessToken(payload,expiryTime){
    return jwt.sign(payload,AccessTokenSecret,{expiresIn:expiryTime})
  }

  static singRefreshToken(payload,expiryTime){
    return jwt.sign(payload,RefershTokenSecret,{expiresIn:expiryTime})
  }

  static verifyAccessToken(token){
    return jwt.verify(token,AccessTokenSecret);
  }

  static verifyRefreshToken(token){
    return jwt.verify(token,RefershTokenSecret)
  }

  static async storeRefreshToken(token,userId)
  {
    try {
      const newToken=new RefreshToken({
        token:token,
        userId:userId
      });

      await newToken.save();
    } catch (error) {
      console.log(error);
      
    }
  }
}

module.exports=JWTServices;
