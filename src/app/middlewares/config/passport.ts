import passport from "passport";
import { Strategy as GoogleStrategy, Profile, VerifyCallback } from "passport-google-oauth20";

import { envConfig } from "./env";

import { Strategy as localStrategy } from "passport-local";
import bcryptjs from "bcryptjs";
import User from "../../modules/user/user.model";
import { Role } from "../../modules/user/user.interface";

passport.use(
   new localStrategy(
      {
         usernameField: "email",
         passwordField: "password",
      },
      async (email: string, password: string, done) => {
         try {
            const isUserExist = await User.findOne({ email });

            if (!isUserExist) {
               return done(null, false, { message: "user does not exist" });
            }
            // if (!isUserExist) {
            //    return done("user does not exist");
            // }

            const isGoogleAuthenticated = isUserExist.auth?.some((providerObject) => providerObject.provider === "google");

            if (isGoogleAuthenticated && !isUserExist.password) {
               return done(null, false, { message: "You have authenticated through Google.so if you want to login with credentials, then at first login with google and set a password for your Gmail then you can login with email and password" });
            }
            const isPasswordMatch = await bcryptjs.compare(password as string, isUserExist.password as string);
            if (!isPasswordMatch) {
               return done(null, false, { message: "password does not match" });
            }

            return done(null, isUserExist);
         } catch (error) {
            // console.log(error);
            done(error);
         }
      }
   )
);

passport.use(
   new GoogleStrategy(
      {
         clientID: envConfig.GOOGLE_CLIENT_ID,
         clientSecret: envConfig.GOOGLE_CLIENT_SECRET,
         callbackURL: envConfig.GOOGLE_CALLBACK_URL,
      },
      async (accessToken: string, refreshToken: string, profile: Profile, done: VerifyCallback) => {
         try {
            const email = profile.emails?.[0].value;

            if (!email) {
               return done(null, false, { message: "No email found" });
            }

            let user = await User.findOne({ email });

            if (!user) {
               user = await User.create({
                  email,
                  name: profile.displayName,
                  picture: profile.photos?.[0].value,
                  role: Role.USER,
                  isVerified: true,
                  auths: [
                     {
                        provider: "google",
                        providerId: profile.id,
                     },
                  ],
               });
            }

            return done(null, user);
         } catch (error) {
            // console.log("Google Strategy Error", error);
            return done(error);
         }
      }
   )
);

// frontend localhost:5173/login?redirect=/booking -> localhost:5000/api/v1/auth/google?redirect=/booking -> passport -> Google OAuth Consent -> gmail login -> successful -> callback url localhost:5000/api/v1/auth/google/callback -> db store -> token

// Bridge == Google -> user db store -> token
//Custom -> email , password, role : USER, name... -> registration -> DB -> 1 User create
//Google -> req -> google -> successful : Jwt Token : Role , email -> DB - Store -> token - api access

passport.serializeUser((user: any, done: (err: any, id?: unknown) => void) => {
   done(null, user._id);
});

passport.deserializeUser(async (id: string, done: any) => {
   try {
      const user = await User.findById(id);
      done(null, user);
   } catch (error) {
      // console.log(error);
      done(error);
   }
});
