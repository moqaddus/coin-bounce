class BlogDetailsDTO{
  constructor(blog){
    this._id=blog._id;
    this.content=blog.content;
    this.title=blog.title;
    this.photoPath=blog.photoPath;
    this.createrAt=blog.createrAt;
    this.authorName=blog.author.name;
    this.authorUsername=blog.author.username;
  }
}

module.exports=BlogDetailsDTO;