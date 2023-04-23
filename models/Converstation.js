import mongoose from 'mongoose';

const converstationSchema = new mongoose.Schema(
    {
        members: {
            type:Array,
        },
        unreadMessages: {
            type: Map,
            of: Number,
          }, 
    },
    {timestamps: true}
);

const Converstation = mongoose.model('Converstation', converstationSchema);

export default Converstation;
