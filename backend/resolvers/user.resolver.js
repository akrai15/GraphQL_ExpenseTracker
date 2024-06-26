

import bcrypt from 'bcryptjs';
import User from '../models/user.model.js';
import Transaction from '../models/transaction.model.js'

const userResolver = {
    Query: {
        authUser: async(_,__,context)=>{
            try{
                const user=await context.getUser();
               
                
                return user;
            }
            catch(error){
                console.log("error in authUser",error);
                throw new Error(error.message || "Auth user problem");
            }    
        
        
        },

        user: async(_,{userId})=>{
            try{
                const user=await User.findById(userId);
                return user;
            }
            catch(error){
                console.log("error in user finding",error);
                throw new Error(error.message || "error getting user");
            }
        }


       




    },
    Mutation: {
        signUp: async (_,{input},context)=>{
            try{
                const {username,name,password,gender}=input;
                if(!username|| !name || !password || !gender){
                    throw new Error("Please fill all the fields");
                }
                const existingUser= await User.findOne({username});
                console.log("Existing user :",existingUser)
                if(existingUser){
                    throw new Error("User already exists");
                }
                const salt=await bcrypt.genSalt(10);
                const hashedPassword=await bcrypt.hash(password,salt);
                const boyProfilePic=`https://avatar.iran.liara.run/public/boy?username=${username}`;
                const girlProfilePic=`https://avatar.iran.liara.run/public/girl?username=${username}`;
                const newUser=new User({
                    username,
                    name,
                    password:hashedPassword,
                    gender,
                    profilePicture:gender==="male"?boyProfilePic:girlProfilePic
                });
                await newUser.save();
                await context.login(newUser);
                return newUser;


            }
            catch(error){
                console.log("error in sign up",error);
                throw new Error(error.message || "internal server error");
            }
        },

        login: async (_,{input},context)=>{
            try{
                const {username,password}=input;
                if(!username|| !password){
                    throw new Error("Please fill all the fields");
                }
                const {user}= await context.authenticate("graphql-local",{username,password});
                await context.login(user);
                return user;    
            }
            catch(error){
                console.log("error in login",error);
                throw new Error(error.message || "internal server error");
            }
        },

        logout: async(_,__,context)=>{
            try{
                await context.logout();
                context.req.session.destroy((err)=>{
                    if(err){
                        throw err;
                    }
                });
                context.res.clearCookie("connect.sid");
                return {message:"Logged out successfully"};
            }
            catch(error){
                console.log("error in logout",error);
                throw new Error(error.message || "internal server error");
            }
        }

    },
    User:{
        transactions: async(parent)=>{
            try{
                const transactions=await Transaction.find({userId:parent._id})
                return transactions;

            }
            catch(error){
                console.log("Error in user transactions resolver",error);
                throw new Error(error.message || "Internal Server Error");
            }
        }
    }
};
export default userResolver;