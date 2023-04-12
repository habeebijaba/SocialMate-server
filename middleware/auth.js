import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const verifyToken = async (req, res, next) => {
    try {
        
        let token = req.header("Authorization");

        if (!token) {
            return res.status(403).send("Access Denied");
        }

        if (token.startsWith("Bearer ")) {
            token = token.slice(7, token.length).trimLeft();
        }
        const verified = jwt.verify(token, process.env.SECRET_KEY);
        req.user = verified;
        next();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const verifyBlock=async(req,res,next)=>{
    try{
        let token = req.header("Authorization");

        if (token.startsWith("Bearer ")) {
            token = token.slice(7, token.length).trimLeft();
        }
        const verified = jwt.verify(token, process.env.SECRET_KEY);
        const user = await User.findById(verified.id);

        if(user.isBlocked==true){
        res.status(200).json({blocked:true});
        }else{
        res.status(200).json({blocked:false});

            next()
        }
    }catch(err){
        res.status(500).json({ error: err.message });

    }
}