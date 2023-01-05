import { Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import { UserInstance } from "../model/userModel";
import { UserAttributes } from "../interface";
import { v4 as uuidv4 } from "uuid";
import { emailHtml, GenerateOTP, GeneratePassword, GenerateSalt, GenerateSignature, option, registerSchema, sendmail } from "../utils";
import { FromAdminMail, UserSubject } from "../config";


export const AdminRegister = async(req: Request, res: Response) => {
    try {
        const { email, phone, password, confirm_password } = req.body;
        const uuiduser = uuidv4();
    
        const validateResult = registerSchema.validate(req.body, option);
        if (validateResult.error) {
          // console.log(validateResult.error.details[0].message)
          return res.status(400).json({
            Error: validateResult.error.details[0].message,
          });
        }
    
        // Generate salt
        const salt = await GenerateSalt();
        const hash = await GeneratePassword(password, salt);
    
        // Generate OTP
        const { otp, expiry } = GenerateOTP();
    
        // Check if user exist
        const User = await UserInstance.findOne({
          where: {
            email: email,
          },
        });
    
        // create user
        if (!User) {
          const user = await UserInstance.create({
            id: uuiduser,
            email,
            password: hash,
            firstName: "",
            lastName: "",
            salt,
            address: "",
            phone,
            otp,
            otp_expiry: expiry,
            lng: 0,
            lat: 0,
            verified: false,
            role: "user",
          });
    
          // Send Otp to user Twilio config
          // await onRequestOTP(otp, phone);
    
          // Send Mail TO User
          const html = emailHtml(otp);
          await sendmail(FromAdminMail, email, UserSubject, html);
    
          // check if user exist
          const User = (await UserInstance.findOne({
            where: { email: email },
          })) as unknown as UserAttributes;
    
          //Generate Signature for user
          let signature = await GenerateSignature({
            id: User.id,
            email: User.email,
            verified: User.verified,
          });
    
          return res.status(201).json({
            message:
              "Admin created successfully check your email or phone for OTP verification",
            signature,
            verified: User.verified,
          });
        }
        return res.status(400).json({
          message: "Admin already exist",
        });
      } catch (err) {
        console.log(err);
        res.status(500).json({
          Error: "Internal server Error",
          route: "/admins/signup",
        });
    }
}


