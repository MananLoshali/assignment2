const express = require("express");
const mysql = require("mysql");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const dotenv = require("dotenv");
dotenv.config();
const encoder = bodyParser.urlencoded();
const app = express();
const PORT = process.env.PORT || 5000;

app.set("view engine", "ejs");
app.set("views", "views");

app.use(express.json());
const db = mysql.createConnection({
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
  port: process.env.PORT_MYSQL,
});

db.connect((error) => {
  if (error) {
    throw error;
  } else {
    console.log("Connection to database successfull");
  }
});

app.get("/", (req, res) => {
  res.render("login");
});
app.get("/customer", (req, res) => {
  res.render("customer");
});
app.get("/changePassword", (req, res) => {
  res.render("changePassword");
});
app.get("/orderDetails", (req, res) => {
  const sql = `SELECT * from Orderitem WHERE user_id = "${req.query.id}"`;

  db.query(sql, (err, data) => {
    if (err) {
      res.status(500).send({ errror: "Something went wrong" });
    } else {
      if (data.length > 0) {
        console.log("data", data);
        res.render("orderDetails", { data: data });
      } else {
        res.status(401).send({ error: "User not found" });
      }
    }
  });
});
// app.post("/showOrderDetails", (req, res) => {
//   console.log(req.body.id);
//   const sql = `SELECT * from Orderitem WHERE user_id = "${req.body.id}"`;
//   db.query(sql, (err, data) => {
//     if (err) {
//       res.status(500).send({ errror: "Something went wrong" });
//     } else {
//       if (data.length > 0) {
//         res.json(data);
//       } else {
//         res.status(401).send({ error: "User not found" });
//       }
//     }
//   });
// });

app.post("/login", encoder, (req, res) => {
  const { id, password } = req.body;
  console.log(id, password);
  const sql = `SELECT * from User WHERE id = "${id}"`;
  db.query(sql, (err, data) => {
    if (err) {
      res.status(500).send({ errror: "Something went wrong" });
    } else {
      if (data.length > 0) {
        if (data[0].password === password) {
          res.status(200).send(data);
        } else {
          res.status(400).send({ error: "Incorrect Password" });
        }
      } else {
        res.status(400).send({ error: "User not found" });
      }
    }
  });
});

app.post("/changePassword", encoder, (req, res) => {
  const { mobileNumber, password, confirmPassword } = req.body;
  const sql = `SELECT * FROM User WHERE phone_number = "${mobileNumber}"`;
  db.query(sql, (err, data) => {
    if (err) {
      res.send("Something went wrong");
    } else {
      if (data.length > 0) {
        if (data[0].phone_number === mobileNumber) {
          const sql = `UPDATE User
          SET password =  "${confirmPassword}" 
          WHERE phone_number = "${mobileNumber}"`;
          db.query(sql, (err, data) => {
            if (err) {
              res.send("Somehing went wrong");
            } else {
              res.redirect("/customer");
            }
          });
        }
      } else {
        res.send("User not found");
      }
    }
  });
});

app.post("/customer", encoder, (req, res) => {
  const sql =
    "INSERT INTO Orderitem (`order_date`,`item`,`count`,`weight`,`requests`,`user_id`) VALUES (?) ";
  const data = [
    req.body.order_date,
    req.body.item,
    req.body.count,
    req.body.weight,
    req.body.requests,
    req.body.company,
  ];
  console.log(data);
  db.query(sql, [data], (err, data) => {
    if (err) {
      return res.json(err);
    } else {
      res.redirect("/customer");
    }
  });
});

app.listen(PORT, () => {
  console.log(`Listening at port ${PORT}....`);
});
