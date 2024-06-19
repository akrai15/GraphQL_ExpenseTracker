import Transaction from '../models/transaction.model.js';
import User from '../models/user.model.js';

const transactionResolver = {
    Query: {
        transactions: async(_,__,context)=>{
            try{
                const user= await context.getUser();
                if(!user) throw new Error("Problem with backend fetching transactions");
                const userId = user._id;
                
                
                const transactions = await Transaction.find({userId:userId});
                console.log("transactions",transactions);
                return transactions;
            }
            catch(error){

                console.log("Error getting transactions",error);
                throw new Error("Error getting transactions");

            }
        },
        transaction: async(_,{transactionId},)=>{
            try{

                const transaction = await Transaction.findById(transactionId);
                return transaction;
            }
            catch(error){
                console.log("Error getting transaction",error);
                throw new Error("Error getting transaction");

            }
        },
        
        categoryStatistics: async(_,__,context)=>{
             const user= await context.getUser();
            if(!user) throw new Error("Problem with backend category statistics");
            const userId = user._id;
            const transactions = await Transaction.find({userId});
            const categoryMap={};
            transactions.forEach(transaction=>{
                if(!categoryMap[transaction.category]){
                    categoryMap[transaction.category]=0;
                }
                
                    categoryMap[transaction.category]+=transaction.amount;
                
            });
            return Object.entries(categoryMap).map(([category,totalAmount])=>({category,totalAmount}));
        }
        
        
    },
    Mutation: {
       createTransaction:async(_,{input},context)=>{
            try{
                const user= await context.getUser();
                if(!user) throw new Error("Problem with backend create transaction");
                console.log("userId",user);
                console.log("context",user._id);
                const newTransaction = new Transaction({
                    ...input,
                    userId: user._id
                });
               
                await newTransaction.save();
                return newTransaction;
            }
            catch(error){
                console.log("Error creating transaction",error);
                throw new Error("Error creating transaction");

            }



       },
       updateTransaction:async(_,{input},)=>{
            try{
                
                const updatedTransaction = await Transaction.findByIdAndUpdate(input.transactionId,input,{new:true});
                return updatedTransaction;
            }
            catch(error){
                console.log("Error updating transaction",error);
                throw new Error("Error updating transaction");

            }
       },
       deleteTransaction:async(_,{transactionId},)=>{
            try{
                const deletedTransaction = await Transaction.findByIdAndDelete(transactionId);
                return deletedTransaction;
            }
            catch(error){
                console.log("Error deleting transaction",error);
                throw new Error("Error deleting transaction");

            }
       }

    },
    Transaction:{
        user:async(parent)=>{
            const userId=parent.userId
            try{
                const user=await User.findById(userId);
                return user;




            }
            catch(err){
                console.error("Error getting user:",err);
                throw new Error("Error getting user")
            }
        }
    }
}
export default transactionResolver;