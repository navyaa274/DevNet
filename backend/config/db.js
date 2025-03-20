import mongoose from "mongoose";

const connectDB = () => {
    mongoose.connect(process.env.DB_URI, {
        ssl: true,
        tls: true,
        tlsAllowInvalidCertificates: false,
        retryWrites: true,
        w: "majority"
    })
    .then((data) => {
        console.log(`MongoDB Connected: ${data.connection.host}`)
    })
    .catch((error) => {
        console.error('MongoDB Connection Error:', error.message)
        process.exit(1)
    })
}

export default connectDB;