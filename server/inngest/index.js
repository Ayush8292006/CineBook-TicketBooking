import { Inngest } from "inngest";
import User from "../models/User.js";
import Booking from "../models/Booking.js";
import Show from "../models/Show.js";

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
            const name = getUserName(data);
            
            console.log("Creating user with:", { id, name, email, image });
            
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
            
            const newUser = await User.create({
                _id: id,
                name: name,
                email: email,
                image: image
            });
            
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

// ✅ FIXED: Release seats and delete booking after 10 minutes if not paid
const releaseSeatAndDeleteBooking = inngest.createFunction(
    { 
        id: 'release-seats-delete-booking',
        triggers: [{ event: 'app/checkpayment' }]  // ✅ Fixed syntax
    },
    async ({ event, step }) => {
        try {
            const bookingId = event.data.bookingId;
            console.log(`⏰ Starting timer for booking: ${bookingId}`);
            
            // Wait for 10 minutes
            const tenMinutesLater = new Date(Date.now() + 10 * 60 * 1000);
            await step.sleepUntil('wait-for-10-minutes', tenMinutesLater);
            
            console.log(`⏰ 10 minutes passed for booking: ${bookingId}`);
            
            // Check payment status
            await step.run('check-payment-status', async () => {
                const booking = await Booking.findById(bookingId);
                
                if (!booking) {
                    console.log(`Booking ${bookingId} not found, already deleted`);
                    return;
                }
                
                // If payment not made, release seats and delete booking
                if (!booking.isPaid) {
                    console.log(`💸 Payment not made for booking ${bookingId}, releasing seats...`);
                    
                    const show = await Show.findById(booking.show);
                    if (show) {
                        // Release seats
                        booking.bookedSeats.forEach((seat) => {
                            delete show.occupiedSeats[seat];
                        });
                        show.markModified('occupiedSeats');
                        await show.save();
                        console.log(`✅ Seats released for show ${show._id}`);
                    }
                    
                    // Delete booking
                    await Booking.findByIdAndDelete(booking._id);
                    console.log(`✅ Booking ${bookingId} deleted`);
                } else {
                    console.log(`✅ Payment made for booking ${bookingId}, keeping seats`);
                }
            });
            
            return { success: true, message: "Booking processed" };
            
        } catch (error) {
            console.error("❌ Error in releaseSeatAndDeleteBooking:", error);
            return { success: false, error: error.message };
        }
    }
);

// Export all functions
export const functions = [
    syncUserCreation,
    syncUserDeletion,
    syncUserUpdation,
    releaseSeatAndDeleteBooking 
];