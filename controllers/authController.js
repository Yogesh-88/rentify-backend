const prisma = require("../models/prismaClient");
const { StatusCodes } = require("http-status-codes");
const bcrypt = require("bcrypt");
const { generateToken } = require("../utils/jwt");

exports.register = async (req, res) => {
  const { firstName, lastName, email, password, phoneNumber, role } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        phoneNumber,
        role,
      },
    });
    const token = generateToken({ userId: user.id });
    res.status(StatusCodes.CREATED).json({ msg: "User Created", token, user });
  } catch (error) {
    res
      .status(StatusCodes.BAD_REQUEST)
      .json({ error: "Error registering user" });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (user && (await bcrypt.compare(password, user.password))) {
      const token = generateToken({ userId: user.id });
      res.json({ token, user });
    } else {
      res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ error: "Invalid credentials" });
    }
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Error logging in" });
  }
};
