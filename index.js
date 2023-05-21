let express = require('express');
let bodyParser = require('body-parser');
let multer = require('multer');
let upload = multer();
let app = express();
const fs = require('fs');

let mongoose = require('mongoose');
const { response } = require('express');
mongoose.connect('mongodb://127.0.0.1/my_db');



// inbuilt middleware
app.set('view engine', 'pug');
app.set('views','./views');
app.use(express.static('public'));
app.use(express.static('images'));
// for parsing application/json
app.use(bodyParser.json()); 
// for parsing application/xwww-
app.use(bodyParser.urlencoded({ extended: true })); 
//form-urlencoded
// for parsing multipart/form-data
app.use(upload.array()); 
app.use(express.static('public'));



// Initialise DB
let commentSchema = mongoose.Schema({
    user: String,
    votes: Number,
    dateTime: Date,
    content: String,
 });
 
let Comment = mongoose.model("Comment", commentSchema);



// handlers
app.get('/', async function(req, res){
    const comments = await Comment.find({});
    res.render(
        'index',
        {comments: comments},    
    );
 });
 
app.post('/', async function(req, res){
    let commentInfo = req.body;
    if(!commentInfo.user || !commentInfo.comment) {
        res.render(
            'error', 
            {errorMessage: 'Invalid Info', errorType:'input error'},
        );
    }
    else {
        let newComment = new Comment({
            user: commentInfo.user,
            votes: 0,
            dateTime: Date.now(),
            content: commentInfo.comment
        });
        // ToDo - Make this an async with error handling
        newComment.save();
        const comments = await Comment.find({});
        res.render('index', {comments: comments, flashMessage: "Comment successfully added!"});
    }
});

app.post('/upvote/:id', async function(req, res){      
    let doc = await Comment.findByIdAndUpdate(req.params.id, {$inc:{votes: 1}});
    res.redirect('/')
});


app.post('/downvote/:id', async function(req, res){      
    let doc = await Comment.findByIdAndUpdate(req.params.id, {$inc:{votes: -1}});
    res.redirect('/')
});

app.listen(3000);