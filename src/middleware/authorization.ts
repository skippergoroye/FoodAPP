import { Request, Response, NextFunction } from 'express';
import jwt, {JwtPayload} from 'jsonwebtoken';
import { UserInstance } from '../model/userModel'
import { APP_SECRET } from '../config';
import { UserAttributes } from '../interface';


export const auth = async(req: JwtPayload, res: Response, next: NextFunction)=> {
    try {
        const authorization = req.headers.authorization

        if(!authorization){
            return res.status(401).json({
                Error: "Kindly login as a user"
            })
        }
        // Bearer nfnxjfjkhjfdhjdfhdfhjdfhj
        // const token = req.headers.authorization.split(" ")[1];
        const token = authorization.slice(7, authorization.length);
        let verified = jwt.verify(token, APP_SECRET)

        if(!verified){
            return res.status(401).json({
                Error: "unauthorized"
            })
        }

        const {id} = verified as {[key:string]:string}

        // find user by id
        const user = (await UserInstance.findOne({
            where: { id: id},
          })) as unknown as UserAttributes;

        if(!user){
            return res.status(401).json({
                Error: "Invalid Credentials"
            })
        }

        req.user = verified;
        next()


    } catch(error){
        console.log(error)
        return res.status(401).json({
            Error: "unauthorised",
        })
    }
}