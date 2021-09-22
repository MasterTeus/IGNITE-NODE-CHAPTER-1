const express = require("express");
const { v4: uuid } = require("uuid");

const app = express();
app.use(express.json());

const users = [];

function verifyIfExistsAccount(req, res, next) {
  const { cpf } = req.headers;

  const userExists = users.find((user) => user.cpf === cpf);

  if (!userExists) {
    return res.status(401).json({ error: "User not exists" });
  }

  res.userExists = userExists;

  return next();
}

/**
 * cpf: string,
 * name: string,
 * id: uuid,
 * statment: []
 */

//TODO: Deve ser possível criar uma conta
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

//TODO: Deve ser possível buscar o extrato bancário do clie nte
app.get("/statment", verifyIfExistsAccount, (req, res) => {
  const { userExists } = res;

  return res.status(201).json({ statment: userExists.statment });
});

app.listen(3333);
