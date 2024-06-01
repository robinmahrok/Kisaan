import secret from "../config/config";
import { isExpired, decodeToken } from "react-jwt";

export default function Token(token) {
  try {
    const tokenValue = decodeToken(token);
    // var decoded = jwt.verify(token, secret.TOKEN_SECRET);
    console.log(tokenValue,'---------');

    var userId = tokenValue.email;
    return userId;
  } catch (e) {
    return "error "+e;
  }
 
}
