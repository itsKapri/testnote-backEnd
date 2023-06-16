const mongoose = require('mongoose');
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.dbURL);
        console.log("---mongodb-connect------");
    } catch (error) {
        console.log(error);
        throw error;
    }
};

module.exports = connectDB;
