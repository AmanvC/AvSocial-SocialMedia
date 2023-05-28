const passport = require("passport");
const JWTStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;

const User = require("../models/User");

let options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_KEY,
};

passport.use(
  new JWTStrategy(options, async (jwtPayload, done) => {
    try {
      const user = await User.findOne({ email: jwtPayload.email });

      if (user) {
        const { password, ...otherData } = user._doc;
        return done(null, otherData);
      } else {
        return done(null, false);
      }
    } catch (err) {
      return done(err);
    }
  })
);

module.exports = passport;
