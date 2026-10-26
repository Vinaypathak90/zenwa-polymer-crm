// Fetch all products (GET)
const getProducts = (req, res) => {
    // Abhi ke liye dummy data bhej rahe hain
    res.status(200).json({ 
        success: true, 
        message: "Saare products fetch ho gaye (Mock Data)",
        data: [
            { id: 1, name: "Polymer Grade A", category: "Industrial" },
            { id: 2, name: "Polymer Grade B", category: "Medical" }
        ]
    });
};

// Create new product (POST)
const createProduct = (req, res) => {
    const { name, category } = req.body;
    
    res.status(201).json({ 
        success: true, 
        message: "Naya product create ho gaya",
        receivedData: { name, category }
    });
};

module.exports = { getProducts, createProduct };