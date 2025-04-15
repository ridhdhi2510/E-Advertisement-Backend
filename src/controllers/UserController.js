const userModel = require("../models/UserModel.js")
const roleModel = require("../models/RoleModel.js")
const { createActivity } = require('./ActivityController');
const mailUtil = require("../utils/MailUtil.js"); // Import mail utility
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken")
const secret = "e-hoarding"

const signup = async (req, res) => {
    try {
        console.log("Received signup request:", req.body)
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(req.body.password, salt);

        // Find the roleId from the database using the role name
        const role = await roleModel.findOne({ name: req.body.role }); // Convert role name to roleId

        if (!role) {
            return res.status(400).json({ message: "Invalid role selected" });
        }

        // Create the user with the corresponding roleId
        const createUser = await userModel.create({
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword,
            roleId: role._id, // Store roleId instead of role name
        });

        // Log the activity (with error handling)
        try {
            await createActivity(
                'signup',
                createUser._id,
                createUser.name,
                null,
                `${createUser.name} signed up as ${role.name}` // Use role.name from DB
            );
        } catch (activityError) {
            console.error("Failed to log signup activity:", activityError);
        }

        //html mail text
        const welcomeEmail = `
            <div style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.5; color: #333;">
                <h2 style="color: #007bff;">Welcome to E-Advertisement, ${createUser.name}!</h2>
                <p>Thank you for joining <strong>E-Advertisement</strong>. We're excited to have you on board!</p>
                
                <p>Here’s what you can do:</p>
                <ul>
                    <li>Browse available advertisement slots.</li>
                    <li>Book the best locations for your campaigns.</li>
                    <li>Track your advertisements in real-time.</li>
                </ul>

                <p>To get started, log in to your account and explore the platform.</p>
                <a href="http://localhost:5173/signin" style="display: inline-block; padding: 10px 20px; margin: 10px 0; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Login Now</a>

                <p>If you have any questions, feel free to reach out to our support team.</p>
                
                <p>Best regards,</p>
                <p><strong>Take Outdoors Team</strong></p>
            </div>
        `;

        //send mail to user
        const mailResponse = await mailUtil.sendingMail(createUser.email,"Welcome to eadvertisement",welcomeEmail )
        res.status(201).json({
            message: "User created successfully",
            data: createUser
        });
    } catch (err) {
        console.error("Signup error:", err);
        res.status(500).json({ message: "Error", data: err });
    }
};

// get all users
const getAllUsers = async (req,res)=>{
    const users = await userModel.find().populate("roleId")

    res.json({
        message: "users fetches successfully",
        data: users
    });
};

//get user by id
const getUserById = async(req,res)=>{

    const foundUser = await userModel.findById(req.params.id)
    res.json({
        message: "User Fatched....",
        data:foundUser
    })
}

//delete user
const deleteUser = async(req,res)=>{

    const deletedUser = await userModel.findByIdAndDelete(req.params.id)
    res.json({
        message: "User Deleted Successfully....",
        data: deletedUser
    })
}

//login user---->verification
    const loginUser = async (req, res) => {
        try{
            const { email, password } = req.body;
            const foundUserFromEmail = await userModel.findOne({ email }).populate("roleId"); // Ensure roleId is populated
    
            if (!foundUserFromEmail) {
                return res.status(401).json({ message: "Email not found" });
            }
    
            const isMatch = bcrypt.compareSync(password, foundUserFromEmail.password);
            if (!isMatch) {
                return res.status(401).json({ message: "Invalid credentials" });
            }
    
            // Debugging: Log the response to check if roleId is present
            console.log("User Data Response:", foundUserFromEmail);
    
            res.status(200).json({
                message: "Login successfully",
                data: foundUserFromEmail
            });

        }catch(err){
            res.status(500).json({
                message: err.message
            })
        }
    };

//login user with Authentication and Authorization using JWT
    const loginUserWithToken = async (req, res) => {
        try{
            const { email, password } = req.body;
            const foundUserFromEmail = await userModel.findOne({ email }).populate("roleId"); // Ensure roleId is populated
    
            if (!foundUserFromEmail) {
                return res.status(401).json({ message: "Email not found" });
            }
            else{
                const isMatch = bcrypt.compareSync(password, foundUserFromEmail.password);
                if (!isMatch) {
                    return res.status(401).json({ message: "Invalid credentials" });
                }
                else{
                    // Debugging: Log the response to check if roleId is present
                    // console.log("User Data Response:", foundUserFromEmail);
                    const token = jwt.sign(foundUserFromEmail.toObject(),secret)
                    //const token = jwt.sign({id:foundUserFromEmail._id},secret)
                    res.status(200).json({
                        message: "Login successfully",
                        token: token
                    });
                }
            }
        }catch(err){
            res.status(500).json({
                message: err.message
            })
        }
    }

//forgotpassword ---> mail for it
    const forgotPassword = async (req,res)=>{
        try{
            const foundUser = await userModel.findOne({ email: req.body.email })
            if(foundUser){
                const token = jwt.sign(foundUser.toObject(),secret);
                console.log(token)
                const url = `http://localhost:5173/resetpassword/${token}`;
                const forgotPasswordEmail = `<!DOCTYPE html>
                                             <html>
                                             <head>
                                                 <meta charset="UTF-8">
                                                 <meta name="viewport" content="width=device-width, initial-scale=1.0">
                                                 <title>Reset Your Password</title>
                                             </head>
                                             <body>
                                                 <div style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.5; color: #333;">
                                                     <h2 style="color: #007bff;">Password Reset Request</h2>
                                                     <p>You recently requested to reset your password. Click the button below to set a new password.</p>
                                                     <a href="${url}" style="display: inline-block; padding: 10px 20px; margin: 10px 0; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
                                                     <p>If you did not request this, please ignore this email. Your password will remain unchanged.</p>
                                                     <p>Best regards,</p>
                                                     <p><strong>Take Outdoors Team</strong></p>
                                                 </div>
                                             </body>
                                             </html>
                `;
                //email send...
                await mailUtil.sendingMail(foundUser.email,"Reset Password",forgotPasswordEmail)
                res.status(200).json({
                    message:"Reset password link sent to mail, Please check your mail"
                })
            }
            else{
                res.status(404).json({
                    message: "User is not Found, Register first"
                })
            }

        }
        catch(err){
            res.status(500).json({
                message: err.message
            })
        }
    }

//reset password api ---> set new password
    const resetPassword = async(req,res)=>{
        try{
            const token = req.body.token;
            const newPassword = req.body.password;

            const userFromToken = jwt.verify(token,secret)//get user object from token after verification

            const salt = bcrypt.genSaltSync(10)
            const hashedPassword = bcrypt.hashSync(newPassword,salt)

            const updatedPassword = await userModel.findByIdAndUpdate(userFromToken._id,{password:hashedPassword})

            res.status(200).json({
                message: "Password Updated Successfully..."
            })
        }
        catch(err){
            res.status(500).json({
                message: err.message
            })
        }
    }

    const updateProfile = async(req , res) => {
        try{
            const { id } = req.params;
            const { name, email } = req.body;
            const updatedPro = await userModel.findByIdAndUpdate(
                id,
                { name, email },
                { new: true, runValidators: true }
            );

            res.status(200).json({
                message: "Profile Updated Successfully...",
                data : updatedPro
            })            

        }catch(err){
            console.log(err.message)
        }
    }

module.exports = {
    signup,
    getAllUsers,
    getUserById,
    deleteUser,
    loginUser,
    loginUserWithToken,
    forgotPassword,
    resetPassword,
    updateProfile
}