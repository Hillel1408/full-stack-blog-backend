import express from 'express';
import multer from 'multer';
import mongoose from 'mongoose';
import cors from 'cors';
import fs from 'fs';
import {
    registerValidation,
    loginValidation,
    postCreateValidation,
} from './validations.js';

import { handleValidationErrors, checkAuth } from './utils/index.js';

import { UserController, PostController } from './controllers/index.js';

mongoose
    .connect(
        'mongodb+srv://Hillel:Sdi7Ojw0@cluster0.wzdbyxy.mongodb.net/blog?retryWrites=true&w=majority'
    )
    .then(() => {
        console.log('DB ok');
    })
    .catch((err) => {
        console.log('DB error', err);
    });

const app = express();

const storage = multer.diskStorage({
    destination: (_, __, cb) => {
        if (!fs.existsSync('uploads')) {
            fs.mkdirSync('uploads');
        }
        cb(null, 'uploads');
    },
    filename: (_, file, cb) => {
        cb(null, file.originalname);
    },
});

const upload = multer({ storage });

app.use(express.json()); //читаем json запросы
app.use(cors());
app.use('/uploads', express.static('uploads'));

app.post(
    '/auth/login',
    loginValidation,
    handleValidationErrors,
    UserController.login
);
app.post(
    '/auth/register',
    registerValidation,
    handleValidationErrors,
    UserController.register
);
app.get('/auth/me', checkAuth, UserController.getMe);
app.get('/tags', PostController.getLastTags);
app.get('/posts', PostController.getAll);
app.get('/posts/tags', PostController.getLastTags);
app.get('/posts/:id', PostController.getOne);
app.delete('/posts/:id', checkAuth, PostController.remove);
app.post(
    '/posts',
    checkAuth,
    postCreateValidation,
    handleValidationErrors,
    PostController.create
);
app.patch(
    '/posts/:id',
    checkAuth,
    postCreateValidation,
    handleValidationErrors,
    PostController.update
);
app.post('/upload', checkAuth, upload.single('image'), (req, res) => {
    res.json({
        url: `/uploads/${req.file.originalname}`,
    });
});

app.listen(4444, (err) => {
    if (err) {
        return console.log(err);
    }
    console.log('server ok');
});
