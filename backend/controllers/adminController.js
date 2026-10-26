// Admin Login (POST)
const loginAdmin = (req, res) => {
    const { email, password } = req.body;

    // Dummy authentication check
    if (email === "admin@zenvista.com" && password === "123456") {
        res.status(200).json({ success: true, message: "Admin Login Successful", token: "dummy_jwt_token_123" });
    } else {
        res.status(401).json({ success: false, message: "Invalid email or password" });
    }
};

module.exports = { loginAdmin };