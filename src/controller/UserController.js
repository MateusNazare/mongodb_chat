import prismaClient from "../prisma/index.js";
import { AppError } from "../error/AppError.js";
import { hash, compare } from "bcrypt";
import jsonwebtoken from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

class UserController {
  async create(request, response) {
    const { name, email, password } = request.body;

    const userExists = await prismaClient.user.findUnique({
      where: { email },
    });

    if (userExists) {
      throw new AppError("User already exists!");
    }

    const passwordHash = await hash(password, 10);

    const user = await prismaClient.user.create({
      data: {
        name,
        email,
        password: passwordHash,
      },
    });

    delete user.password;

    return response.status(201).json(user);
  }

  async getOne(request, response) {
    const { id } = request.user;

    const user = await prismaClient.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    return response.status(200).json(user);
  }

  async delete(request, response) {
    const { id } = request.user;

    try {
      await prismaClient.user.delete({
        where: { id },
      });

      return response.status(200).send();
    } catch (err) {
      return response.status(400).json({
        message: "This user doesn't exists!",
      });
    }
  }

  async update(request, response) {
    const { id } = request.user;
    const { name, password } = request.body;

    try {
      const user = await prismaClient.user.update({
        where: { id },
        data: {
          name,
          password,
        },
      });

      return response.status(200).json(user);
    } catch (err) {
      return response.status(400).json({
        message: "This user doesn't exists!",
      });
    }
  }

  async authenticate(request, response) {
    const { email, password } = request.body;

    const user = await prismaClient.user.findUnique({
      where: { email },
    });

    if (!user) {
      return response.status(401).json({
        message: "Incorrect email or password!",
      });
    }

    const passwordMatch = await compare(password, user.password);

    if (!passwordMatch) {
      throw new AppError("Email or password incorrect!");
    }

    delete user.password;

    const token = jsonwebtoken.sign(user, JWT_SECRET, {
      subject: user.id,
      expiresIn: "1d",
    });

    return response.send({ token });
  }
}

export default UserController;
