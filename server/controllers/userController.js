// import { generateToken } from '../lib/util.js';
// import User from '../models/user.js';
// import bcrypt from 'bcryptjs';
// import cloudinary from '../lib/cloudinary.js';

// // ...existing code...








// //signup a new user 

// export const signup = async(req,res)=>{
//     const {fullName,email,password,bio } = req.body;

//     try{
//         if(!fullName || !email || !password  ||!bio) {
//             return res.json({success:false, message: "Missing details"})
//         }
//       const existingUser  = await User.findOne({email});
//         if(existingUser){
//             return res.json({success:false,message: "acoount alreaady exist"})
//         }

//         const salt = await bcrypt.genSalt(10);
//         const hashedPassword = await bcrypt.hash(password,salt);

//         const newUser = await User.create({
//             fullName,email,password:hashedPassword,bio });

//             const token = generateToken(newUser._id)
//             res.json({success:true,userData:newUser,token,message:"Acoount created Sucessfully"})
//     } catch(error){
//         console.log(error.message);
//         res.json({success:false,message:"error.message"})
        

//     }

// }

// /// controller to login  a user

// export const login =  async(req,res)=>{
//     try{
//          const {email,password } = req.body;
//          const userData = await User.findOne({email})

//          const isPasswordCorrect = await bcrypt.compare(password,userData.password);

//          if(!isPasswordCorrect){
//             return res.json({success:false,message:"Invalid Credentials"});
//          }
         
//             const token = generateToken(userData._id)
//             res.json({success:true,userData,token,message:"login Sucessfully"})

//     }catch(error){
//         console.log(error.message);
//         res.json({success:false,message:error.message})
        

//     }
// }

// //comntroller to check if user is authenticated ro not 

// export const checkAuth = (req,res)=>{
//     res.json({success:true,user:req.user});
// }

// //controller to update user profile 
// export const updateProfile = async(req,res)=>{
//     try {
//         const {profilePic,bio,fullName} = req.body;
//          console.log("Received profilePic:", profilePic ? 'YES' : 'NO');

//         const userId = req.user._id;
//         let updatedUser;

//         if(!profilePic){
//           updatedUser =   await User.findByIdAndUpdate(userId, {bio,fullName}, {new:true})
//         }else{
//              console.log("Uploading profilePic to cloudinary...");
//             const upload = await cloudinary.uploader.upload(profilePic);
//               console.log("Upload result:", upload);
//             updatedUser = await User.findByIdAndUpdate(userId,{profilePic:upload.secure_url,bio,fullName},{new:true})
//         }
//         res.json({success:true,user:updatedUser})
//     } catch(error){
//         console.log(error.message);
//          res.json({success:false,message:error.message})

//     }

// }

import { generateToken } from '../lib/util.js';
import User from '../models/user.js';
import bcrypt from 'bcryptjs';
import cloudinary from '../lib/cloudinary.js';

// ...existing code...

//signup a new user 
export const signup = async(req,res)=>{
    const {fullName,email,password,bio } = req.body;

    try{
        if(!fullName || !email || !password || !bio) {
            return res.status(400).json({success: false, message: "Missing details"});
        }
        const existingUser = await User.findOne({email});
        if(existingUser){
            return res.status(409).json({success: false, message: "Account already exists"});
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password,salt);

        const newUser = await User.create({
            fullName,email,password:hashedPassword,bio
        });

        const token = generateToken(newUser._id);
        const userData = {
            _id: newUser._id,
            fullName: newUser.fullName,
            email: newUser.email,
            bio: newUser.bio,
            profilePic: newUser.profilePic
        };
        res.status(201).json({success: true, userData, token, message: "Account created successfully"});
    } catch(error){
        console.error(error.message);
        res.status(500).json({success: false, message: "Internal server error"});
    }
}

//controller to login a user
export const login = async(req,res)=>{
    try{
        const {email, password} = req.body;
        const userData = await User.findOne({email});

        if(!userData){
            return res.status(401).json({success: false, message: "Invalid Credentials"});
        }

        const isPasswordCorrect = await bcrypt.compare(password, userData.password);

        if(!isPasswordCorrect){
            return res.status(401).json({success: false, message: "Invalid Credentials"});
        }
        
        const token = generateToken(userData._id);
        res.status(200).json({success: true, userData, token, message: "Login successful"});

    } catch(error){
        console.error(error.message);
        res.status(500).json({success: false, message: "Internal server error"});
    }
}

//controller to check if user is authenticated or not 
export const checkAuth = (req,res)=>{
    res.status(200).json({success: true, user: req.user});
}

//controller to update user profile 
export const updateProfile = async(req,res)=>{
    try {
        console.log('=== UPDATE PROFILE DEBUG ===');
        console.log('Request body:', req.body);
        console.log('User from middleware:', req.user);
        console.log('User ID:', req.user?._id);
        const {profilePic, bio, fullName} = req.body;
        const userId = req.user._id;
          console.log('Extracted data:', { profilePic: profilePic ? 'has image' : 'no image', bio, fullName });
        const updateData = {};

        if (fullName) updateData.fullName = fullName;
        if (bio) updateData.bio = bio;

        if(profilePic){
            console.log('Uploading to Cloudinary...');
            try {
                const upload = await cloudinary.uploader.upload(profilePic);
                updateData.profilePic = upload.secure_url;
                 console.log('Cloudinary upload successful');
            } catch (uploadError) {
                console.error("Cloudinary upload failed:", uploadError.message);
                return res.status(500).json({success: false, message: "Failed to upload profile picture"});
            }
        }

         console.log('Update data:', updateData);
        console.log('Updating user with ID:', userId);

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            updateData,
            { new: true, runValidators: true }
        ).select("-password");
        console.log('Database update result:', updatedUser ? 'Success' : 'No user found');

        if (!updatedUser) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        console.log('=== UPDATE SUCCESSFUL ===');
        
        res.status(200).json({success: true, user: updatedUser});
    } catch(error){
          console.error('=== UPDATE PROFILE ERROR ===');
            console.error('Error stack:', error.stack);
        console.error('Error details:', error);
        console.error(error.message);
        res.status(500).json({success: false, message: "Internal server error"});
    }
}