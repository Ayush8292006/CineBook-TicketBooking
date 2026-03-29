import { Inngest } from "inngest";
import User from "../models/User.js";

export const inngest = new Inngest({ id: "movie-ticket-booking" });

// Helper function to get user name from Clerk data
const getUserName = (data) => {
    console.log("Raw Clerk data for name extraction:", {
        first_name: data.first_name,
        last_name: data.last_name,
        username: data.username,
        full_name: data.full_name,
        email: data.email_addresses?.[0]?.email_address
    });
    
    // Try full_name first
    if (data.full_name && data.full_name !== "null" && data.full_name.trim()) {
        return data.full_name.trim();
    }
    
    // Try first_name and last_name
    if (data.first_name && data.first_name !== "null") {
        const firstName = data.first_name.trim();
        const lastName = (data.last_name && data.last_name !== "null") ? ` ${data.last_name.trim()}` : "";
        const fullName = firstName + lastName;
        if (fullName && fullName !== "null") {
            return fullName;
        }
    }
    
    // Try username
    if (data.username && data.username !== "null" && data.username.trim()) {
        return data.username.trim();
    }
    
    // Try email (fallback)
    if (data.email_addresses && data.email_addresses[0] && data.email_addresses[0].email_address) {
        const emailName = data.email_addresses[0].email_address.split('@')[0];
        // Capitalize first letter
        return emailName.charAt(0).toUpperCase() + emailName.slice(1);
    }
    
    // Default fallback
    return "User";
};

// CREATE USER FUNCTION
const syncUserCreation = inngest.createFunction(
    { 
        id: 'sync-user-from-clerk',
        triggers: [{ event: 'clerk/user.created' }]
    },
    async ({ event }) => {
        try {
            console.log("=== CREATE USER EVENT RECEIVED ===");
            
            const data = event.data;
            const id = data.id;
            const email = data.email_addresses?.[0]?.email_address;
            const image = data.image_url || "";
            
            // Get proper name
            const name = getUserName(data);
            
            console.log("Creating user with:", { id, name, email, image });
            
            // Check if user already exists
            const existingUser = await User.findById(id);
            if (existingUser) {
                console.log("User already exists, updating instead...");
                const updatedUser = await User.findByIdAndUpdate(
                    id,
                    { name, email, image },
                    { new: true }
                );
                return { 
                    success: true, 
                    message: "User updated successfully",
                    user: updatedUser 
                };
            }
            
            // Create new user
            const userData = {
                _id: id,
                name: name,
                email: email,
                image: image
            };
            
            const newUser = await User.create(userData);
            console.log("✅ User created:", newUser);
            
            return { 
                success: true, 
                message: "User created successfully",
                user: newUser 
            };
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
        triggers: [{ event: 'clerk/user.deleted' }]
    },
    async ({ event }) => {
        try {
            console.log("=== DELETE USER EVENT RECEIVED ===");
            const { id } = event.data;
            
            const deletedUser = await User.findByIdAndDelete(id);
            
            if (!deletedUser) {
                console.log(`User ${id} not found`);
                return { success: false, message: "User not found" };
            }
            
            console.log(`✅ User deleted: ${id}`);
            return { success: true, message: "User deleted successfully", userId: id };
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
        triggers: [{ event: 'clerk/user.updated' }]
    },
    async ({ event }) => {
        try {
            console.log("=== UPDATE USER EVENT RECEIVED ===");
            
            const data = event.data;
            const id = data.id;
            const email = data.email_addresses?.[0]?.email_address;
            const image = data.image_url || "";
            
            // Get proper name
            const name = getUserName(data);
            
            console.log("Updating user:", { id, name, email, image });
            
            const updatedUser = await User.findByIdAndUpdate(
                id, 
                { name, email, image }, 
                { new: true, runValidators: true }
            );
            
            if (!updatedUser) {
                console.log(`User ${id} not found`);
                return { success: false, message: "User not found" };
            }
            
            console.log("✅ User updated:", updatedUser);
            return { 
                success: true, 
                message: "User updated successfully",
                user: updatedUser 
            };
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