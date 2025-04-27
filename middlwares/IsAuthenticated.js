const jwt = require("jsonwebtoken")




export const IsAuthentics = async(req, res, next) =>{
    try {
        const token = req.cookies.token 
        if(!token){
            res.status(501).json({
                succuss:false, 
                message:"user Not authenticated"
            })
        }


        const decode = await jwt.verify(token , process.env.JWT)

        if(!decode){
            return res.status(501).send({
                succuss:false, 
                message:"invalid "
            })
        }

        req.id = decode.userId
        next()
        
    } catch (error) {
        console.log(error)
    }
}