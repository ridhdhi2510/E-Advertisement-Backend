const roleModel = require("../models/RoleModel")
const getAllRoles = async (req,res)=>{
    const roles = await roleModel.find()

    res.json({
        message: "Role fetches successfully",
        data: roles
    });
};

const addRole = async (req,res)=>{
    const savedRole = await roleModel.create(req.body)
    res.json({
        message:"Role Created....",
        data: savedRole
    })
}

const deleteRole = async(req,res)=>{

    const deletedRole = await roleModel.findByIdAndDelete(req.params.id)
    res.json({
        message: "Role Deleted Successfully....",
        data: deletedRole
    })
}

const getRoleById = async(req,res)=>{

    const foundRole = await roleModel.findById(req.params.id)
    res.json({
        message: "Role Fatched....",
        data:foundRole
    })
}

const getRoleByName  = async(req , res) => {
    const foundRole = await roleModel.findOne({name:req.params.name})
    res.json({
        data:foundRole
    })
}

module.exports = {
    getAllRoles,addRole,deleteRole,getRoleById , getRoleByName
}