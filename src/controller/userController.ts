import { Request, Response } from "express";
import { UserInstance } from "../model/userModel";
import { v4 as uuidv4 } from "uuid";
import bcrypt from 'bcrypt'
import {
  option,
  registerSchema,
  GenerateSalt,
  GeneratePassword,
  GenerateOTP,
  onRequestOTP,
  emailHtml,
  sendmail,
  GenerateSignature,
  verifySignature,
  loginSchema,
  validatePassword,
} from "../utils";
import { FromAdminMail, UserSubject } from "../config";
import { UserAttributes } from "../interface";




/* =================== Register User ==================== */
export const Register = async (req: Request, res: Response) => {
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
          "User created successfully check your email or phone for OTP verification",
        signature,
        verified: User.verified,
      });
    }
    return res.status(400).json({
      message: "User already exist",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      Error: "Internal server Error",
      route: "/users/signup",
    });
  }
};







/** =================== Verify User ==================== **/
export const verifyUser = async (req: Request, res: Response) => {
  try {
    const token = req.params.signature;
    const decode = await verifySignature(token);

    // Check if the user is a registerd user
    const User = (await UserInstance.findOne({
      where: { email: decode.email },
    })) as unknown as UserAttributes;

    if (User) {
      const { otp } = req.body;
      if (User.otp === parseInt(otp) && User.otp_expiry >= new Date()) {
        const updatedUser = (await UserInstance.update(
          {
            verified: true,
          },
          { where: { email: decode.email } }
        )) as unknown as UserAttributes;

        // Regenerate a new Signature
        let signature = await GenerateSignature({
          id: updatedUser.id,
          email: updatedUser.email,
          verified: updatedUser.verified,
        });

        return res.status(200).json({
          message: "You have successfully verified your Account",
          signature,
          verified: User.verified,
        });
      }
    }
    res.status(400).json({
      Error: "Invalid Credential or OTP Already expired",
    });
  } catch (error) {
    res.status(500).json({
      Error: "Internal Server Error",
      route: "/users/verify",
    });
  }
};







/** =================== Login Users ==================== **/
export const Login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const validateResult = loginSchema.validate(req.body, option);
    if (validateResult.error) {
      return res.status(400).json({
        Error: validateResult.error.details[0].message,
      });
    }


    const User = (await UserInstance.findOne({
      where: { email: email },
    })) as unknown as UserAttributes;

    if(User){
      // const validation = await validatePassword(password, User.password, User.salt) 
        const validation = await bcrypt.compare(password, User.password)

      if(validation){
      //Generate Signature for user
      let signature = await GenerateSignature({
        id: User.id,
        email: User.email,
        verified: User.verified,
      });

      return res.status(200).json({
        message: "You have successfully Logged in",
        signature,
        email: User.email,
        verified: User.verified,
      })
      }
    }
    return res.status(400).json({
      Error: "wrong Username or Password",
    });
  } catch(err){
    res.status(500).json({
      Error: "Internal server Error",
      route: "/users/login",
    });
  }
};




 

/** ====================  Resend OTP ================= **/
export const resendOTP = async (req: Request, res: Response) => {
  try {
    const token = req.params.signature;
    const decode = await verifySignature(token);

    // Check if the user is a registerd user
    const User = (await UserInstance.findOne({
      where: { email: decode.email },
    })) as unknown as UserAttributes;

    if(User){
      // Generate OTP
      const { otp, expiry } = GenerateOTP();
      const updatedUser = (await UserInstance.update(
        {
          otp,
          otp_expiry: expiry,
        },
        { where: { email: decode.email } }
      )) as unknown as UserAttributes;

      if(updatedUser){
        const User = (await UserInstance.findOne({
          where: { email: decode.email },
        })) as unknown as UserAttributes;

        // send OTP to User
        // await onRequestOTP(otp, User.phone);

        // send Mail to user
        const html = emailHtml(otp);
        await sendmail(FromAdminMail, User.email, UserSubject, html);

        return res.status(200).json({
          message: "OTP resend to registered phone number and email"
        })
      }
    }
    return res.status(400).json({
      Error: "Error sending OTP",
    });
  }catch(error){
    res.status(500).json({
      Error: "Internal Server Error",
      route: "/users/resend-otp/:signature",
    });
  }
};






