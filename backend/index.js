require('dotenv').config()
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const mongoConnectionString = process.env.MONGODB_CON;
const adminPassword = process.env.ADMIN_PASS;

console.log(mongoConnectionString);
mongoose.connect(mongoConnectionString, { dbName: 'Test'})
.then(() => { 
    console.log('Connected to database') 
    adminUser()
})
.catch((err) => {console.log(err)});

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    profilePicture: {
        type: String,
        default: "../src/assets/noicon.png"
    },
    role: {
        type: String,
        enum: ['user', 'guest', 'admin'],
        default: 'user'
    },
    date: {
        type: Date,
        default: Date.now,
    },
});

UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

UserSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

const ThreadSchema = new mongoose.Schema({
    title:{
        type: String,
        require: true,
    },
    content:{
        type: String,
        require: true,
    },
    image:{
        type: String,
    },
    owner:{
        type: String,
        require: true,
    },
    category:{
        type: String,
        enum: ['general', 'announcements', 'creatorcorner', 'arttrading', 'artdiscussion'],
        require: true,
    },
    date:{
        type: Date,
        default: Date.now,
    }
})

const Comments = new mongoose.Schema({
    post:{
        type: String,
        require: true,
    },
    owner:{
        type: String,
        require: true,
    },
    content:{
        type: String,
        require: true,
    },
    date:{
        type: Date,
        default: Date.now,
    }
})

const User = mongoose.model('Users', UserSchema);
User.createIndexes();

const Thread = mongoose.model('threads', ThreadSchema);
Thread.createIndexes();

const Comment = mongoose.model('comments', Comments);
Comment.createIndexes();

const express = require('express');
const app = express();
const cors = require("cors");
app.use(express.json());
app.use(cors());
app.get("/", (req, resp) => { 
    resp.send("App is Working");
});

async function adminUser() {
    try {
      const adminExists = await User.findOne({ role: 'admin' });
      
      if (!adminExists) {
        const adminUser = new User({
          username: process.env.ADMIN_USERNAME || 'admin',
          email: process.env.ADMIN_EMAIL || 'admin@inkarchive',
          password: process.env.ADMIN_PASS,
          role: 'admin',
          profilePicture: "../src/assets/admin-icon.png"
        });
        await adminUser.save();
        console.log('Default admin user created');
      }
    } catch (error) {
      console.error('Failed to ensure admin exists:', error);
    }
}


app.post("/register", async (req, resp) => {
    try {
        const user = new User(req.body);
        let result = await user.save();

        result = result.toObject();
        if (result) {
            resp.status(201).json(result);
            console.log("User registered:", result);
        }
    } catch (e) {
        console.error("Registration error:", e);
        resp.status(400).json({ error: "Registration failed", message: e.message });
    }
});

app.post("/login", async (req, resp) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        
        if (!user) {
            return resp.status(401).json({ error: "No such email" });
        }
        
        const isMatch = await user.comparePassword(password);
        
        if (!isMatch) {
            return resp.status(401).json({ error: "Wrong password" });
        }
        
        // Returning user with role information
        const userObject = user.toObject();
        delete userObject.password;
        
        resp.status(200).json(userObject);
    } catch (e) {
        resp.status(500).json({ error: "Login failed", message: e.message });
    }
});

app.post("/guest-login", async (req, resp) => {
    try {
        // Generate a random guest username
        const guestUsername = `Guest_${Math.floor(Math.random() * 10000)}`;
        
        // Create a temporary guest user object (not saved to database)
        const guestUser = {
            _id: `guest_${Date.now()}`, // Temporary ID
            username: guestUsername,
            email: `${guestUsername.toLowerCase()}@guest.inkarchive.com`,
            profilePicture: "../src/assets/noicon.png",
            role: 'guest',
            date: new Date()
        };
        
        resp.status(200).json(guestUser);
    } catch (e) {
        resp.status(500).json({ error: "Guest login failed", message: e.message });
    }
});

app.get("/forum/threads/:category", async (req, resp) => {
    try {
      const { category } = req.params;
      const threads = await Thread.find({ category });
  
      if (threads && threads.length > 0) {
        resp.status(200).json(threads);
      } else {
        resp.status(200).json({ message: "No threads found!" });
      }
    } catch (err) {
      resp.status(500).json({ error: err.message });
    }
});

app.get("/forum/thread/:id", async (req, resp) => {
    try {
      const { id } = req.params;
      const thread = await Thread.findById(id);
  
      if (thread) {
        resp.status(200).json(thread);
      } else {
        resp.status(200).json({ message: "No thread found!" });
      }
    } catch (err) {
      resp.status(500).json({ error: err.message });
    }
});
  
  
app.post("/forum/new_thread", async (req, resp) => {
    try{
        const thread = Thread(req.body);
        let result = await thread.save();

        result = result.toObject();
        if (result) {
            resp.status(201).json(result);
            console.log("Thread Made:", result);
        }
    }catch(e){
        resp.status(500).json({err: "Failed to create thread!"})
    }
})

app.post("/forum/thread/create_comment", async (req, resp) => {
    try{
        const comment = Comment(req.body);
        let result = await comment.save();

        result = result.toObject();
        if (result) {
            resp.status(201).json(result);
            console.log("Comment Made:", result);
        }
    }catch(e){
        resp.status(500).json({err: "Failed to create comment!"})
    }
})

app.get("/forum/:id/comments", async (req, resp) => {
    try{
        const { id } = req.params;
        const comments = await Comment.find({ post: id });
    
        if (comments && comments.length > 0) {
            resp.status(200).json(comments);
        } else {
            resp.status(200).json({ message: "No comments found!" });
        }
    }catch(err){
        resp.status(500).json({err: "Failed to fetch comments!"})
    }
})

app.delete('/forum/delete-thread/:id', async (req, resp) => {
    try {
        const { id } = req.params;
        
        const thread = await Thread.findByIdAndDelete(id);

        if (!thread) {
            return resp.status(404).json({ error: 'Thread not found' });
        }

        const deletedComments = await Comment.deleteMany({ post: id })
        
        resp.status(200).json({ message: 'Thread and associated comments deleted successfully' });
    } catch (error) {
        console.error('Delete user error:', error);
        resp.status(500).json({ error: 'Server error' });
    }
});

const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { log } = require('console');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = './uploads/';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
    fileFilter: (req, file, cb) => {
        const fileTypes = /jpeg|jpg|png|gif/;
        const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = fileTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Only image files are allowed'));
    }
});

app.use('/uploads', express.static('uploads'));

app.post('/api/upload-profile-pic', upload.single('profilePicture'), async (req, resp) => {
    try {
        if (!req.file) {
            return resp.status(400).json({ error: 'No file uploaded' });
        }
        
        const { userId } = req.body;
        const profilePicturePath = `/uploads/${req.file.filename}`;
        
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { profilePicture: profilePicturePath },
            { new: true }
        );
        
        if (!updatedUser) {
            return resp.status(404).json({ error: 'User not found' });
        }
        
        const userObject = updatedUser.toObject();
        delete userObject.password;
        
        resp.status(200).json(userObject);
    } catch (error) {
        console.error('Upload profile picture error:', error);
        resp.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/upload-profile-pic', upload.single('profilePicture'), async (req, resp) => {
    try {
        if (!req.file) {
            return resp.status(400).json({ error: 'No file uploaded' });
        }
        
        const { userId } = req.body;
        const profilePicturePath = `/uploads/${req.file.filename}`;
        
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { profilePicture: profilePicturePath },
            { new: true }
        );
        
        if (!updatedUser) {
            return resp.status(404).json({ error: 'User not found' });
        }
        
        const userObject = updatedUser.toObject();
        delete userObject.password;
        
        resp.status(200).json(userObject);
    } catch (error) {
        console.error('Upload profile picture error:', error);
        resp.status(500).json({ error: 'Server error' });
    }
});

app.put('/api/update-profile-picture', async (req, resp) => {
    try {
        const { userId, profilePicture } = req.body;
        
        if (!profilePicture) {
            return resp.status(400).json({ error: 'No image provided' });
        }
        
        // Validate that it's a base64 image
        if (!profilePicture.startsWith('data:image/')) {
            return resp.status(400).json({ error: 'Invalid image format' });
        }
        
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { profilePicture },  // This will store the base64 string directly
            { new: true }
        );
        
        if (!updatedUser) {
            return resp.status(404).json({ error: 'User not found' });
        }
        
        const userObject = updatedUser.toObject();
        delete userObject.password;
        
        resp.status(200).json(userObject);
    } catch (error) {
        console.error('Update profile picture error:', error);
        resp.status(500).json({ error: 'Server error' });
    }
});

app.delete('/api/delete-user/:userId', async (req, resp) => {
    try {
        const { userId } = req.params;
        
        const deletedUser = await User.findByIdAndDelete(userId);
        
        if (!deletedUser) {
            return resp.status(404).json({ error: 'User not found' });
        }
        
        resp.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Delete user error:', error);
        resp.status(500).json({ error: 'Server error' });
    }
});

app.get('/api/user/:userId', async (req, resp) => {
    try {
        const { userId } = req.params;
        
        const user = await User.findById(userId);
        
        if (!user) {
            return resp.status(404).json({ error: 'User not found' });
        }
        
        const userObject = user.toObject();
        delete userObject.password;
        
        resp.status(200).json(userObject);
    } catch (error) {
        console.error('Get user error:', error);
        resp.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/update-username/:userId', async (req, resp) => {
    try {
        const { userId } = req.params;
        const { username } = req.body;
        
        if (!username || username.trim() === '') {
            return resp.status(400).json({ error: 'Username cannot be empty' });
        }
        
        // Check if the username is already taken
        const existingUser = await User.findOne({ username, _id: { $ne: userId } });
        if (existingUser) {
            return resp.status(409).json({ error: 'Username is already taken' });
        }
        
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { username },
            { new: true }
        );
        
        if (!updatedUser) {
            return resp.status(404).json({ error: 'User not found' });
        }
        
        const userObject = updatedUser.toObject();
        delete userObject.password;
        
        resp.status(200).json(userObject);
    } catch (error) {
        console.error('Update username error:', error);
        resp.status(500).json({ error: 'Server error' });
    }
});

app.listen(5000);
console.log("App listen at port 5000");