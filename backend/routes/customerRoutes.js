const Customer = require("./models/Customer"); // Adjust path as needed
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Customer Registration
app.post("/api/customers/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    const existing = await Customer.findOne({ email });
    if (existing) return res.status(400).json({ error: "Email already registered" });

    const hashed = await bcrypt.hash(password, 10);

    const newCustomer = new Customer({ name, email, password: hashed });
    await newCustomer.save();

    res.status(201).json({ message: "Customer registered successfully" });
  } catch (err) {
    res.status(500).json({ error: "Registration failed" });
  }
});
// Customer Login Route
app.post("/api/customers/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const customer = await Customer.findOne({ email });
    if (!customer) return res.status(400).json({ error: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, customer.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid email or password" });

    const token = jwt.sign(
      { id: customer._id, role: "customer" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token, customer: { id: customer._id, name: customer.name, email: customer.email } });
  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
});
