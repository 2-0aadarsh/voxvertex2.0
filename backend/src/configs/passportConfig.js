import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcryptjs";
import User from "../models/user.js";

passport.use(
  new LocalStrategy(
    { usernameField: "email", passwordField: "password" }, // <== THIS FIXES IT
    async (email, password, done) => {
      try {
        const query = email.includes("@") ? { email } : { mobileNo: email };
        const user = await User.findOne(query);
        if (!user) {
          return done(null, false, { message: "User not found!" });
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (isValid) {
          return done(null, user);
        } else {
          return done(null, false, { message: "Incorrect Password!" });
        }
      } catch (error) {
        return done(error);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  console.log('Serializing user:', user._id);
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  console.log('Deserializing user ID:', id);
  try {
    const user = await User.findById(id);
    if (!user) {
      console.log('User not found during deserialization');
      return done(null, false);
    }
    console.log('Successfully deserialized user:', user.email);
    done(null, user);
  } catch (err) {
    console.error('Deserialization error:', err);
    done(err);
  }
});




