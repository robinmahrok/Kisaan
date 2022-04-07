import secret from "../config/config";
import jwt from "jsonwebtoken";

export default function Token(token) {
  try {
    var decoded = jwt.verify(token, secret.TOKEN_SECRET);
  } catch (e) {
    return "error";
  }
  var userId = decoded.email;
  return userId;
}
