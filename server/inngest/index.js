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

// PROFESSIONAL EMAIL FUNCTION with Attractive Styling
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
            
            // Professional HTML Email Template with Attractive Design
            const emailHtml = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Booking Confirmation - CineBook</title>
                    <style>
                        * {
                            margin: 0;
                            padding: 0;
                            box-sizing: border-box;
                        }
                        body {
                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            padding: 40px 20px;
                        }
                        .container {
                            max-width: 600px;
                            margin: 0 auto;
                            background: #ffffff;
                            border-radius: 24px;
                            overflow: hidden;
                            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                        }
                        .header {
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            padding: 48px 32px;
                            text-align: center;
                            position: relative;
                            overflow: hidden;
                        }
                        .header::before {
                            content: "🎬";
                            position: absolute;
                            font-size: 120px;
                            opacity: 0.1;
                            bottom: -20px;
                            right: -20px;
                            transform: rotate(-10deg);
                        }
                        .header h1 {
                            color: #ffffff;
                            font-size: 32px;
                            font-weight: 700;
                            margin-bottom: 8px;
                            letter-spacing: -0.5px;
                        }
                        .header p {
                            color: rgba(255, 255, 255, 0.9);
                            font-size: 16px;
                        }
                        .content {
                            padding: 40px 32px;
                            background: #ffffff;
                        }
                        .greeting {
                            font-size: 18px;
                            color: #1f2937;
                            margin-bottom: 24px;
                            line-height: 1.5;
                        }
                        .greeting strong {
                            color: #667eea;
                            font-weight: 600;
                        }
                        .booking-card {
                            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
                            border-radius: 20px;
                            padding: 24px;
                            margin: 24px 0;
                            border: 1px solid #e2e8f0;
                        }
                        .movie-title {
                            font-size: 24px;
                            font-weight: 700;
                            color: #1e293b;
                            margin-bottom: 20px;
                            padding-bottom: 16px;
                            border-bottom: 2px solid #e2e8f0;
                            display: flex;
                            align-items: center;
                            gap: 8px;
                        }
                        .movie-title span {
                            background: #667eea;
                            color: white;
                            font-size: 12px;
                            padding: 2px 8px;
                            border-radius: 20px;
                        }
                        .details-grid {
                            display: grid;
                            grid-template-columns: repeat(2, 1fr);
                            gap: 16px;
                        }
                        .detail-item {
                            display: flex;
                            flex-direction: column;
                            gap: 4px;
                        }
                        .detail-label {
                            font-size: 12px;
                            font-weight: 500;
                            color: #64748b;
                            text-transform: uppercase;
                            letter-spacing: 0.5px;
                        }
                        .detail-value {
                            font-size: 16px;
                            font-weight: 600;
                            color: #1e293b;
                        }
                        .seats-badge {
                            background: #667eea;
                            color: white;
                            padding: 4px 12px;
                            border-radius: 20px;
                            font-size: 14px;
                            font-weight: 500;
                            display: inline-block;
                        }
                        .amount-section {
                            margin-top: 20px;
                            padding-top: 16px;
                            border-top: 2px solid #e2e8f0;
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                        }
                        .amount-label {
                            font-size: 14px;
                            font-weight: 500;
                            color: #64748b;
                        }
                        .amount-value {
                            font-size: 28px;
                            font-weight: 700;
                            color: #10b981;
                        }
                        .message {
                            background: #fef3c7;
                            border-left: 4px solid #f59e0b;
                            padding: 16px;
                            margin: 24px 0;
                            border-radius: 12px;
                        }
                        .message p {
                            color: #92400e;
                            font-size: 14px;
                            line-height: 1.5;
                        }
                        .thankyou {
                            text-align: center;
                            margin: 32px 0 24px;
                        }
                        .thankyou h3 {
                            font-size: 20px;
                            font-weight: 600;
                            color: #1e293b;
                            margin-bottom: 8px;
                        }
                        .thankyou p {
                            color: #64748b;
                            font-size: 14px;
                        }
                        .footer {
                            background: #f8fafc;
                            padding: 32px;
                            text-align: center;
                            border-top: 1px solid #e2e8f0;
                        }
                        .footer p {
                            color: #64748b;
                            font-size: 12px;
                            margin-bottom: 8px;
                        }
                        .footer .brand {
                            color: #667eea;
                            font-weight: 600;
                            font-size: 14px;
                            margin-bottom: 12px;
                        }
                        @media (max-width: 480px) {
                            .content {
                                padding: 24px 20px;
                            }
                            .details-grid {
                                grid-template-columns: 1fr;
                                gap: 12px;
                            }
                            .movie-title {
                                font-size: 20px;
                            }
                            .amount-value {
                                font-size: 24px;
                            }
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>✨ Booking Confirmed!</h1>
                            <p>Your movie experience awaits</p>
                        </div>
                        
                        <div class="content">
                            <div class="greeting">
                                Hello <strong>${user?.name || 'Movie Lover'}!</strong>
                            </div>
                            
                            <p style="color: #4b5563; margin-bottom: 16px;">
                                Thank you for choosing <strong style="color: #667eea;">CineBook</strong>. Your booking has been successfully confirmed and payment received.
                            </p>
                            
                            <div class="booking-card">
                                <div class="movie-title">
                                    🎬 ${movie?.title}
                                    <span>${movie?.release_date?.split('-')[0] || 'NEW'}</span>
                                </div>
                                
                                <div class="details-grid">
                                    <div class="detail-item">
                                        <span class="detail-label">📅 Show Date</span>
                                        <span class="detail-value">${formattedDate}</span>
                                    </div>
                                    <div class="detail-item">
                                        <span class="detail-label">⏰ Show Time</span>
                                        <span class="detail-value">${formattedTime}</span>
                                    </div>
                                    <div class="detail-item">
                                        <span class="detail-label">💺 Seats</span>
                                        <span class="detail-value"><span class="seats-badge">${seats || 'N/A'}</span></span>
                                    </div>
                                    <div class="detail-item">
                                        <span class="detail-label">🎟️ Booking ID</span>
                                        <span class="detail-value" style="font-family: monospace; font-size: 13px;">${booking._id.slice(-8).toUpperCase()}</span>
                                    </div>
                                </div>
                                
                                <div class="amount-section">
                                    <span class="amount-label">Total Amount Paid</span>
                                    <span class="amount-value">₹${amount}</span>
                                </div>
                            </div>
                            
                            <div class="message">
                                <p>🎯 <strong>Quick Reminder:</strong> Please arrive 15 minutes before showtime. Carry a valid ID proof. Screen your e-ticket at the entrance.</p>
                            </div>
                            
                            <div class="thankyou">
                                <h3>🎉 Thank You for Booking!</h3>
                                <p>We hope you enjoy your movie experience. For any assistance, contact us at <strong>support@cinebook.com</strong></p>
                            </div>
                        </div>
                        
                        <div class="footer">
                            <div class="brand">🎬 CineBook</div>
                            <p>Experience Cinema, Redefined</p>
                            <p style="margin-top: 16px; font-size: 11px;">This is a system-generated confirmation. Please do not reply to this email.</p>
                            <p style="font-size: 10px;">© ${new Date().getFullYear()} CineBook. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
            `;
            
            // Plain text version as fallback
            const plainText = `
✨ BOOKING CONFIRMED! ✨

Hello ${user?.name || 'Movie Lover'}!

Thank you for choosing CineBook. Your booking has been successfully confirmed.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎬 MOVIE: ${movie?.title}
📅 DATE: ${formattedDate}
⏰ TIME: ${formattedTime}
💺 SEATS: ${seats}
🎟️ BOOKING ID: ${booking._id.slice(-8).toUpperCase()}
💰 AMOUNT: ₹${amount}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 Quick Reminder:
• Arrive 15 minutes before showtime
• Carry a valid ID proof
• Screen your e-ticket at the entrance

🎉 Thank You for Booking!
We hope you enjoy your movie experience.

For assistance: support@cinebook.com

© ${new Date().getFullYear()} CineBook - Experience Cinema, Redefined
            `;
            
            // Send email
            await sendEmail({
                to: user?.email,
                subject: `✨ Booking Confirmed! ${movie?.title} | CineBook`,
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