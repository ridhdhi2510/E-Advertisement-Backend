const userModel = require("../models/UserModel.js")
const roleModel = require("../models/RoleModel.js")
const mailUtil = require("../utils/MailUtil.js"); // Import mail utility
const bcrypt = require("bcrypt");

const signup = async (req, res) => {
    try {
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
                <a href="http://localhost:5174/signin" style="display: inline-block; padding: 10px 20px; margin: 10px 0; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Login Now</a>

                <p>If you have any questions, feel free to reach out to our support team.</p>
                
                <p>Best regards,</p>
                <p><strong>The E-Advertisement Team</strong></p>
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
    };

module.exports = {
    signup,
    getAllUsers,
    getUserById,
    deleteUser,
    loginUser

}