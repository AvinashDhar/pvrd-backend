const jwt = require("jsonwebtoken");
const express = require("express");
const { User } = require("../models/user");
const bcrypt = require('bcryptjs');
const router = express.Router();

let refreshTokens = [];

router.post("/refresh-token", (req, res) => {
  //take the refresh token from the user
  const refreshToken = req.body.token;

  //send error if there is no token or it's invalid
  if (!refreshToken) return res.status(401).json("You are not authenticated!");
  if (!refreshTokens.includes(refreshToken)) {
    return res.status(403).json("Refresh token is not valid!");
  }
  jwt.verify(refreshToken, "myRefreshSecretKey", (err, user) => {
    err && console.log(err);
    refreshTokens = refreshTokens.filter((token) => token !== refreshToken);

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    refreshTokens.push(newRefreshToken);

    res.status(200).json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  });

  //if everything is ok, create new access token, refresh token and send to user
});

const generateAccessToken = (user) => {
  return jwt.sign({ id: user.id, isAdmin: user.isAdmin, email: user.email, userName: user.name }, "mySecretKey", {
    expiresIn: "1d",
  });
};

const generateRefreshToken = (user) => {
  return jwt.sign({ id: user.id, isAdmin: user.isAdmin }, "myRefreshSecretKey");
};

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({email: email});
  const secret = process.env.SECRET;
  if(!user) {
      return res.status(400).json("Username or password incorrect!");
  }
  console.log("users ",user)
  if(user && bcrypt.compareSync(password, user.passwordHash)) {
      if(user.isActive === true){
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);
        refreshTokens.push(refreshToken);
        res.json({
          username: user.username,
          isAdmin: user.isAdmin,
          accessToken,
          refreshToken,
        });
      }
      else{
          res.status(403).json("Access Denied!");
      } 
  } else {
    res.status(400).json("Username or password incorrect!");
  }
});

router.post('/register', async (req,res)=>{
    let user = new User({
        name: req.body.name,
        email: req.body.email,
        passwordHash: bcrypt.hashSync(req.body.password, 10),
        isAdmin: req.body.isAdmin,
        isActive: false,
        addresses: [req.body.address]
    })
    user = await user.save();

    if(!user)
    return res.status(400).send('the user cannot be created!')

    res.send(user);
});

const verify = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.split(" ")[1];
        console.log("token" ,token)
      jwt.verify(token, "mySecretKey", (err, user) => {
        if (err) {
          return res.status(403).json("Token is not valid!");
        }
  
        req.user = user;
        next();
      });
    } else {
      res.status(401).json("You are not authenticated!");
    }
  };

exports.verify = verify;
exports.authenticationRoutes = router;