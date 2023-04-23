import Converstation from "../models/Converstation.js";
import Message from "../models/Message.js";

export const createConverstation = async (req, res) => {
    try {
        const { id } = req.user;
        const { friendId } = req.body;

        // Check if there is a conversation already existing between the two members
        const existingConvo = await Converstation.findOne({
            members: { $all: [id, friendId] }
        });

        if (existingConvo) {
            return res.status(200).json(existingConvo);
        }

        // Create new conversation
        const newConverstation = new Converstation({
            members: [id, friendId],
            unreadMessages: {
            },
        });

        const savedConverstation = await newConverstation.save();
        res.status(200).json(savedConverstation);
    } catch (error) {
        res.status(500).json(error);
    }
}

export const getConverstation = async (req, res) => {
    try {
        const converstation = await Converstation.find({
            members: { $in: [req.params.converstationId] }
        })
            .sort({ updatedAt: -1 })

        const conversationsWithLastMessage = await Promise.all(converstation.map(async (conversation) => {
            const lastMessage = await Message.find({ converstationId: conversation._id }).sort({ createdAt: -1 }).limit(1)
            const lastMessageData = lastMessage.length ? { sender: lastMessage[0].sender, text: lastMessage[0].text, time: lastMessage[0].createdAt } : {};
            const otherMemberId = conversation.members.find(memberId => memberId !== req.params.converstationId);
            const unreadCount = conversation.unreadMessages.get(req.params.converstationId) || 0;
            const unreadCountof = conversation.unreadMessages.get(otherMemberId) || 0;
            const updatedConversation = { ...conversation.toObject(), lastMessageData, unreadCount, unreadCountof };
            return updatedConversation;
        }));

        res.status(200).json(conversationsWithLastMessage)
    } catch (error) {
        res.status(500).json(error);
    }
}

export const getConverstationCount=async(req,res)=>{
    try {
        let userId=req.params.userId
        let conversations=await Converstation.find({
            members:{$in:[userId]}
        })
        let conversationCount=0
        const count = conversations.map(async(conversation)=>{
            const unreadCount = conversation.unreadMessages.get(userId) || 0;
            if(unreadCount!=0){
                conversationCount=conversationCount+1
            }
        })
        res.status(200).json(conversationCount)

    } catch (error) {
        
    }
}