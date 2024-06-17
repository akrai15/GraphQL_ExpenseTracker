import passport from "passport";

 import bycrpt from "bcryptjs";

 import User from "../models/user.model.js";
 import { GraphQLLocalStrategy } from "graphql-passport";


 export const configurePassport=async()=>{
    passport.serializeUser((user, done) => {
        console.log("serializing user");
        done(null, user._id);
      });
    passport.deserializeUser((id, done) => {
        console.log("deserializing user");
        try{
            const user=User.findById(id);
            done(null, user);
        }
        catch(error){
            done(error);
        }
    });
    passport.use(
        new GraphQLLocalStrategy(async (username, password, done) => {
            try{
                const user=await User.findOne({username});
                if(!user){
                    return new Error("invalid username or password")
                }
                const validPassword=await bycrpt.compare(password,user.password);
                if(!validPassword){
                    return new Error("invalid username or password")
                }
                return done(null, user);

            }
            catch(error){
                return done(error);
            }
        })
    )
}