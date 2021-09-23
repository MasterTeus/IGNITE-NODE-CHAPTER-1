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

  req.user = userExists;

  return next();
}

function getBalance(statment) {
  const balance = statment.reduce((accumulator, operation) => {
    if (operation.type === "credit") {
      return accumulator + operation.amount;
    } else {
      return accumulator - operation.amount;
    }
  }, 0);

  return balance;
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

//TODO: Deve ser possível buscar o extrato bancário do cliente
app.get("/statment", verifyIfExistsAccount, (req, res) => {
  const { user } = req;

  return res.status(201).json(user.statment);
});

//TODO: Deve ser possível buscar o extrato bancário do cliente por data
app.get("/statment/date", verifyIfExistsAccount, (req, res) => {
  const { user } = req;
  const { date } = req.query;

  const dateFormat = new Date(date + " 00:00");

  const filterStatmentDate = user.statment.filter(
    (statment) =>
      statment.created_at.toDateString() === new Date(dateFormat).toDateString()
  );

  return res.status(201).json(filterStatmentDate);
});

//TODO: Deve ser possível realizar um depósito
app.post("/deposit", verifyIfExistsAccount, (req, res) => {
  const { description, amount } = req.body;

  const { user } = req;

  const statmentOperation = {
    description,
    amount,
    created_at: new Date(),
    type: "credit"
  };

  user.statment.push(statmentOperation);

  return res.status(201).json(user.statment);
});

app.post("/withdraw", verifyIfExistsAccount, (req, res) => {
  const { amount } = req.body;
  const { user } = req;

  const total = getBalance(user.statment);

  if (amount > total) {
    return res.status(400).json({ error: "Insufient credit" });
  }

  const statmentOperation = {
    amount,
    created_at: new Date(),
    type: "debit"
  };

  user.statment.push(statmentOperation);

  return res.status(201).json({
    last_debit: statmentOperation,
    last_credit: total,
    credit: getBalance(user.statment)
  });
});

//TODO: Deve ser possível atualizar dados da conta do cliente
app.put("/account", verifyIfExistsAccount, (req, res) => {
  const { name } = req.body;
  const { user } = req;

  user.name = name;

  return res.status(201).send();
});

app.listen(3333);
