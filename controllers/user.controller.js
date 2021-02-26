const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

exports.createUser = (req, res, next) => {
  bcrypt.hash(req.body.password, 10).then(hash => {
    const user = new User({
      email: req.body.email,
      password: hash,
      role: req.body.role
    });
    user
      .save()
      .then(result => {
        res.status(201).json({
          message: "User created!",
          result: result
        });
      })
      .catch(err => {
        res.status(401).json({
          message: "Invalid authentication credentials!"
        });
      });
  });
};

exports.updateUser = (req, res, next) => {
  console.log('Update user wordt aangeroepen!');
  if(req.body.password) {
    console.log(req.userData.userId);
    bcrypt.hash(req.body.password, 10).then(hash => {
      const newUserValues = {$set: {
        password: hash
      }};
      User.updateOne({
        _id: req.userData.userId
      }, newUserValues)
      .then(result => {
        if(result.n > 0) {
          res.status(200).json({ message: 'Account successfully updated!'});
        } else {
          res.status(401).json({ message: 'Not authorized!' });
        }
      })
      .catch(error => {
        console.log(error);
        res.status(500).json({
          message: 'Couldnt\' update document!'
        });
      });
    });
  };
};

exports.userLogin = (req, res, next) => {
  let fetchedUser;
  User.findOne({ email: req.body.email })
    .then(user => {
      if (!user) {
        return res.status(401).json({
          message: "Auth failed"
        });
      }
      fetchedUser = user;
      return bcrypt.compare(req.body.password, user.password);
    })
    .catch(err => {
      return res.status(401).json({
        message: "Invalid authentication credentials!"
      })
    })
    .then(result => {
      if (!result) {
        return res.status(401).json({
          message: "Auth failed"
        });
      } else {
        const token = jwt.sign(
          { email: fetchedUser.email, userId: fetchedUser._id, role: fetchedUser.role},
          process.env.JWT_KEY,
          { expiresIn: "15m" }
        );
        res.status(200).json({
          token: token,
          expiresIn: 900,
          userId: fetchedUser._id,
          role: fetchedUser.role
        });
      }
    })
    .catch(err => {
      console.log(err);
      return res.status(400).json({
        message: "Bad request!"
      });
    });
};