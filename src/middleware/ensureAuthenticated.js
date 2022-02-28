import jsonwebtoken from "jsonwebtoken";
import { AppError } from "../error/AppError.js";
import prismaClient from "../prisma/index.js";

export async function ensureAuthenticated(request, response, next) {
  const authHeader = request.headers.authorization;

  if (!authHeader) {
    throw new AppError("Token missing", 401);
  }

  const [, token] = authHeader.split(" ");

  try {
    const { sub: user_id } = jsonwebtoken.verify(token, process.env.JWT_SECRET);

    const user = await prismaClient.user.findUnique({
      where: { id: user_id },
    });

    if (!user) {
      throw new AppError("User does not exists!", 401);
    }

    request.user = {
      id: user_id,
    };

    return next();
  } catch (err) {
    throw new AppError("Invalid token!", 401);
  }
}
