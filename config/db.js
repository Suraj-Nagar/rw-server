import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
mongoose.set('strictPopulate', false);
const connectionTodb = async () => {
    try {
        const { connection } = await mongoose.connect(process.env.MONGO_URL);
        if (connection) {
            console.log(`connected to database:${connection.host}`);

        }


    } catch (error) {
        console.log(error);
        process.exit(1);

    }
}

export default connectionTodb;