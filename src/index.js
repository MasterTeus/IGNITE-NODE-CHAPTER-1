const express = require("express");
const { v4: uuid } = require("uuid");

const app = express();
app.use(express.json());
const users = [];

/**
 * cpf: string,
 * name: string,
 * id: uuid,
 * statment: []
 */

app.post("/account", (req, res) => {
  const { name, cpf } = req.body;

  const userAlreadyExists = users.some((user) => user.cpf === cpf);

  if (userAlreadyExists) {
    return res.status(400).json({
      error: "User already exists"
    });
  }

  users.push({
    cpf,
    name,
    id: uuid(),
    statment: []
  });

  return res.status(201).json(users);
});

app.listen(3333);
