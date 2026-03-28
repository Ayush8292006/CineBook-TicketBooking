import { Inngest } from "inngest";
import User from "../models/User.js";

export const inngest = new Inngest({ id: "movie-ticket-booking" });

// CREATE USER FUNCTION
const syncUserCreation = inngest.createFunction(
    { 
        id: 'sync-user-from-clerk',
        triggers: [{ event: 'clerk/user.created' }]  // Use triggers array
    },
    async ({ event }) => {
        try {
            const { id, first_name, last_name, email_addresses, image_url } = event.data;
            const userData = {
                _id: id,
                email: email_addresses[0].email_address,
                name: `${first_name} ${last_name}`,
                image: image_url
            };

            await User.create(userData);
            return { success: true, message: "User created successfully" };
        } catch (error) {
            console.error("Error creating user:", error);
            return { success: false, error: error.message };
        }
    }
);

// DELETE USER FUNCTION
const syncUserDeletion = inngest.createFunction(
    { 
        id: 'delete-user-with-clerk',
        triggers: [{ event: 'clerk/user.deleted' }]  // Use triggers array
    },
    async ({ event }) => {
        try {
            const { id } = event.data;
            await User.findByIdAndDelete(id);
            return { success: true, message: "User deleted successfully" };
        } catch (error) {
            console.error("Error deleting user:", error);
            return { success: false, error: error.message };
        }
    }
);

// UPDATE USER FUNCTION
const syncUserUpdation = inngest.createFunction(
    { 
        id: 'update-user-with-clerk',
        triggers: [{ event: 'clerk/user.updated' }]  // Use triggers array
    },
    async ({ event }) => {
        try {
            const { id, first_name, last_name, email_addresses, image_url } = event.data;
            const userData = {
                email: email_addresses[0].email_address,
                name: `${first_name} ${last_name}`,
                image: image_url
            };
            
            await User.findByIdAndUpdate(id, userData, { new: true, runValidators: true });
            return { success: true, message: "User updated successfully" };
        } catch (error) {
            console.error("Error updating user:", error);
            return { success: false, error: error.message };
        }
    }
);

export const functions = [
    syncUserCreation,
    syncUserDeletion,
    syncUserUpdation
];