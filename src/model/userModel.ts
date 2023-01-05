import { DataTypes, Model } from 'sequelize';
import {sequelizeDB} from '../Database/index';
import { UserAttributes } from '../interface/UserAttributes';



export class UserInstance extends Model<UserAttributes> {}


UserInstance.init({
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          notNull: {
            msg: "Email address is required",
          },
          isEmail: {
            msg: "please provide a valid email",
          },
        },
      },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notNull:{
                msg: "Password is required"
            },
            notEmpty:{
                msg: "Provide a password"
            },
        }
    },
    firstName: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    salt: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    address: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notNull: {
                msg: "phone number is required"
            },
            notEmpty: {
                msg: "provide a phone number"
            },
        }
    },
    otp: {
        type: DataTypes.NUMBER,
        allowNull: false,
        validate: {
            notNull: {
                msg: "otp is required"
            },
            notEmpty: {
                msg: "provide an otp"
            },
        }
    },
    otp_expiry: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
            notNull: {
                msg: "Otp expired"
            },
        }
    },
    lng: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    lat: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    verified:{
        type:DataTypes.BOOLEAN,
        allowNull:false,
        validate: {
            notNull: {
              msg: "User must must be verified",
            },
            notEmpty: {
                msg: "user not verified",
              },
          }
    },
    role: {
      type: DataTypes.STRING,
      allowNull: true,
    }
},
{ 
    sequelize: sequelizeDB,
    tableName: 'user',
    timestamps: true
});









