import Message from "../models/Message.js";
import Converstation from "../models/Converstation.js";

export const createMessage = async (req, res) => {
    try {
        const newMessage = new Message(req.body);
        const savedMessage = await newMessage.save();
        const conversation=await Converstation.findById(req.body.converstationId)
        const senderId=newMessage.sender
        const receiverId = conversation.members.find(member => member !== senderId);
        const unreadCount = conversation.unreadMessages.get(receiverId) || 0;
        conversation.unreadMessages.set(receiverId, unreadCount+1);
        conversation.updatedAt=Date.now()
        
        await conversation.save()

        res.status(200).json(savedMessage);
    } catch (error) {
        res.status(500).json(error);
    }
}

export const getMessages = async (req, res) => {
   const userId=req.query.userId
    try {
        const messages = await Message.find({
            converstationId: req.params.converstationId,
        }); 
        const conversation=await Converstation.findById(req.params.converstationId)
        conversation.unreadMessages.set(userId, 0);
        await conversation.save()

        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json(error);
    }
}
