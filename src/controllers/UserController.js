const userModel = require("../models/UserModel.js")
const bcrypt = require("bcrypt");

//add user----->Sign up
const signup = async (req,res)=>{
    try{
        const salt = bcrypt.genSaltSync(10);
        const hasedPassword = bcrypt.hashSync(req.body.password,salt);
        req.body.password = hasedPassword;

        const createUser = await userModel.create(req.body);
        res.status(201).json({
            message:"user created....",
            data:createUser
        });
    }catch(err){
        console.log(err)
        res.status(500).json({
            message:"error",
            data:err
        })
    }
}

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
// const loginUser = async(req,res) =>{
//     const email = req.body.email;
//     const password = req.body.password;

//     const foundUserFromEmail = await userModel.findOne({email:email});
//     console.log(foundUserFromEmail);

//     if(foundUserFromEmail != null){

//         const isMatch = bcrypt.compareSync(password,foundUserFromEmail.password);
//         if(isMatch == true){
//             res.status(200).json({
//                 message:"login sucessfully",
//                 data:foundUserFromEmail
//             })
//         }else{
//             res.status(404).json({
//                 message:"Invalid Cred....."
//             })
//         }

//     } else{
//         res.status(404).json({
//             message:"Email not found....."
//         })
//     }
// }


    // for(const foundUserFromEmail of users){
    //     if(users.roleId){
    //         users.roleName = foundUserFromEmail.roleId.name;
    //         await users.save();
    //     }

    // }


const loginUser = async (req, res) => {
    const { email, password } = req.body;
    const foundUserFromEmail = await userModel.findOne({ email }).populate("roleId");
    console.log(foundUserFromEmail)

    if (!foundUserFromEmail) {
        return res.status(401).json({ message: "Email not found" });
    }

    const isMatch = bcrypt.compareSync(password, foundUserFromEmail.password);
    if (!isMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
    }

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