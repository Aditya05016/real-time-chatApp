import User from "../models/user.js";
import jwt from "jsonwebtoken";

//midlleware to protect route

export const protectRoute = async(req,res , next)=>{
    try{
        const token = req.headers.token;
        const decoded = jwt.verify(token,process.env.JWT_SECRET)
        const currentUser = await User.findById(decoded.userId).select("-password");

        if(!currentUser){
             return res.json({success: false, message:"User not found"});
        }
        req.user = currentUser; //pehlw !
        next();

    } catch(error){
        console.log(error.message);
        res.json({success: false, message:"error.message"});

    }
}
// import User from "../models/user.js";
// import jwt from "jsonwebtoken";

// // Middleware to protect route
// export const protectRoute = async (req, res, next) => {
//   try {
//     const token = req.headers.token;

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const currentUser = await User.findById(decoded.userId).select("-password");

//     if (!currentUser) {
//       return res.json({ success: false, message: "User not found" });
//     }

//     req.user = currentUser; // ✅ Corrected line
//     next();

//   } catch (error) {
//     console.log(error.message);
//     res.json({ success: false, message: error.message }); // optional: remove quotes around error.message
//   }
// };
