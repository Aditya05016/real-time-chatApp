import mongoose from 'mongoose';


// function to connect to the mongdb databases

  export const connectDB = async () => {
    try {
        mongoose.connection.on('connected', ()=> console.log("Database connected"));
        await mongoose.connect(process.env.MONGODB_URI,{
         writeConcern: { w: 'majority' } 
         } );               //pehel aisa tha(`${process.env.MONGODB_URI}/chat-app`)
    } catch(error) {
        console.log(error);
         process.exit(1);
    }
}

