const express = require('express'); //서버구축 프레임워크
const cookieParser = require('cookie-parser'); //node.js에서 사용자 cookie 이용
const morgan = require('morgan'); //로그 찍는거
const path = require('path'); // 경로관련(경로 합치기(join)등에쓰임)
const session = require('express-session'); //쿠키보다 더 안전, 더많은 데이터 저장, 로그인에 쓰임
const flash = require('connect-flash'); //사용자 메세지날리기(일회성)
const passport = require('passport'); // 로그인 구현 + 카카오톡이나 구글도 가능
require('dotenv').config(); // env파일에 비밀키 모아두고, dotenv가 .env파일을 읽어 process.env 객체에 넣음.

const pageRouter = require('./routes/page');
const authRouter = require('./routes/auth');
const postRouter = require('./routes/post');
const userRouter = require('./routes/user');
const { sequelize } = require('./models');
const passportConfig = require('./passport');

const app = express();
sequelize.sync();
passportConfig(passport);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.set('port', process.env.PORT || 8001);

app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/img', express.static(path.join(__dirname, 'uploads')));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.COOKIE_SECRET)); // dotenv가 process.env에 넣은 비밀 키 사용하는법
app.use(session({
  resave: false,
  saveUninitialized: false,
  secret: process.env.COOKIE_SECRET,
  cookie: {
    httpOnly: true,
    secure: false,
  },
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

app.use('/', pageRouter);
app.use('/auth', authRouter);
app.use('/post', postRouter);
app.use('/user', userRouter);

app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

app.listen(app.get('port'), () => {
  console.log(app.get('port'), '번 포트에서 대기중');
});