import { Inngest } from "inngest";
import User from "../models/User.js";
import Booking from "../models/Booking.js";
import Show from "../models/Show.js";
import sendEmail from "../configs/nodeMailer.js";

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

// inngest function to send email when user books a show

// ✅ PROFESSIONAL EMAIL FUNCTION with HTML Styling
const sendBookingConfirmationEmail = inngest.createFunction(
    { 
        id: 'send-booking-confirmation-email',
        triggers: [{ event: 'app/show.booked' }]
    },
    async ({ event, step }) => {
        try {
            const { bookingId } = event.data;
            console.log(`📧 Sending confirmation email for booking: ${bookingId}`);
            
            const booking = await Booking.findById(bookingId)
                .populate('user')
                .populate({ 
                    path: 'show', 
                    populate: { path: "movie", model: "Movie" } 
                });
            
            if (!booking) {
                console.log(`Booking ${bookingId} not found`);
                return { success: false, message: "Booking not found" };
            }
            
            const user = booking.user;
            const movie = booking.show?.movie;
            const showTime = booking.show?.showDateTime;
            const seats = booking.bookedSeats?.join(', ');
            const amount = booking.amount;
            
            // Format date
            const formattedDate = new Date(showTime).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            const formattedTime = new Date(showTime).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
            });
            
            // Professional HTML Email Template
            const emailHtml = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Booking Confirmation - CineBook</title>
                    <style>
                        body {
                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                            line-height: 1.6;
                            color: #333;
                            background-color: #f4f4f5;
                            margin: 0;
                            padding: 0;
                        }
                        .container {
                            max-width: 600px;
                            margin: 0 auto;
                            padding: 20px;
                        }
                        .email-card {
                            background: #ffffff;
                            border-radius: 16px;
                            overflow: hidden;
                            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                        }
                        .email-header {
                            background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
                            padding: 32px 24px;
                            text-align: center;
                        }
                        .email-header h1 {
                            color: white;
                            margin: 0;
                            font-size: 28px;
                            font-weight: 700;
                        }
                        .email-header p {
                            color: rgba(255, 255, 255, 0.9);
                            margin: 8px 0 0;
                            font-size: 14px;
                        }
                        .email-body {
                            padding: 32px 24px;
                        }
                        .booking-details {
                            background: #f9fafb;
                            border-radius: 12px;
                            padding: 20px;
                            margin: 20px 0;
                        }
                        .detail-row {
                            display: flex;
                            justify-content: space-between;
                            padding: 12px 0;
                            border-bottom: 1px solid #e5e7eb;
                        }
                        .detail-row:last-child {
                            border-bottom: none;
                        }
                        .detail-label {
                            font-weight: 600;
                            color: #4b5563;
                        }
                        .detail-value {
                            color: #1f2937;
                            font-weight: 500;
                        }
                        .movie-title {
                            font-size: 20px;
                            font-weight: 700;
                            color: #6366f1;
                            margin-bottom: 8px;
                        }
                        .seats-badge {
                            display: inline-block;
                            background: #e0e7ff;
                            color: #6366f1;
                            padding: 4px 12px;
                            border-radius: 20px;
                            font-size: 14px;
                            font-weight: 500;
                        }
                        .total-amount {
                            font-size: 24px;
                            font-weight: 700;
                            color: #10b981;
                        }
                        .footer {
                            background: #f9fafb;
                            padding: 24px;
                            text-align: center;
                            border-top: 1px solid #e5e7eb;
                        }
                        .footer p {
                            margin: 0;
                            color: #6b7280;
                            font-size: 12px;
                        }
                        .button {
                            display: inline-block;
                            background: #6366f1;
                            color: white;
                            padding: 12px 24px;
                            border-radius: 8px;
                            text-decoration: none;
                            font-weight: 600;
                            margin-top: 20px;
                        }
                        .button:hover {
                            background: #4f46e5;
                        }
                        @media (max-width: 480px) {
                            .email-body {
                                padding: 24px 16px;
                            }
                            .detail-row {
                                flex-direction: column;
                                gap: 4px;
                            }
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="email-card">
                            <div class="email-header">
                                <h1>🎬 Booking Confirmed!</h1>
                                <p>Your movie tickets are ready</p>
                            </div>
                            
                            <div class="email-body">
                                <p>Hi <strong>${user?.name || 'Movie Lover'}</strong>,</p>
                                <p>Thank you for booking with <strong>CineBook</strong>! Your payment has been successfully processed. Here are your booking details:</p>
                                
                                <div class="booking-details">
                                    <div class="movie-title">🎥 ${movie?.title}</div>
                                    
                                    <div class="detail-row">
                                        <span class="detail-label">📅 Date</span>
                                        <span class="detail-value">${formattedDate}</span>
                                    </div>
                                    <div class="detail-row">
                                        <span class="detail-label">⏰ Time</span>
                                        <span class="detail-value">${formattedTime}</span>
                                    </div>
                                    <div class="detail-row">
                                        <span class="detail-label">💺 Seats</span>
                                        <span class="detail-value"><span class="seats-badge">${seats || 'N/A'}</span></span>
                                    </div>
                                    <div class="detail-row">
                                        <span class="detail-label">🎟️ Booking ID</span>
                                        <span class="detail-value" style="font-family: monospace;">${booking._id}</span>
                                    </div>
                                    <div class="detail-row">
                                        <span class="detail-label">💰 Total Amount</span>
                                        <span class="detail-value total-amount">₹${amount}</span>
                                    </div>
                                </div>
                                
                                <p><strong>Important:</strong> Please arrive at least 15 minutes before showtime. Present this email or your booking ID at the counter.</p>
                                
                               
                            </div>
                            
                            <div class="footer">
                                <p>© ${new Date().getFullYear()} CineBook. All rights reserved.</p>
                                <p>For any queries, contact us at support@cinebook.com</p>
                                <p style="margin-top: 12px; font-size: 11px;">This is a system generated email, please do not reply.</p>
                            </div>
                        </div>
                    </div>
                </body>
                </html>
            `;
            
            // Plain text version as fallback
            const plainText = `
Booking Confirmation - ${movie?.title}

Hi ${user?.name || 'Movie Lover'},

Thank you for booking with CineBook! Your payment has been successfully processed.

Booking Details:
- Movie: ${movie?.title}
- Date: ${formattedDate}
- Time: ${formattedTime}
- Seats: ${seats}
- Booking ID: ${booking._id}
- Total Amount: ₹${amount}

Please arrive at least 15 minutes before showtime.

View your bookings: ${process.env.FRONTEND_URL}/my-bookings

© ${new Date().getFullYear()} CineBook
            `;
            
            // Send email
            await sendEmail({
                to: user?.email,
                subject: `🎬 Booking Confirmed! ${movie?.title} tickets booked`,
                html: emailHtml,
                text: plainText
            });
            
            console.log(`✅ Booking confirmation email sent to ${user?.email}`);
            return { 
                success: true, 
                message: "Email sent successfully",
                email: user?.email,
                bookingId: booking._id
            };
            
        } catch (error) {
            console.error("❌ Error sending email:", error);
            return { success: false, error: error.message };
        }
    }
);

// Export all functions
export const functions = [
    syncUserCreation,
    syncUserDeletion,
    syncUserUpdation,
    releaseSeatAndDeleteBooking,
    sendBookingConfirmationEmail
];