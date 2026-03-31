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
// PROFESSIONAL EMAIL FUNCTION with Attractive Styling (No Buttons)
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
            
            // Format date and time
            const formattedDate = new Date(showTime).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            const formattedTime = new Date(showTime).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
            
            // Beautiful HTML Email Template - No Buttons
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
                            font-family: 'Segoe UI', 'Poppins', -apple-system, BlinkMacSystemFont, 'Roboto', Helvetica, Arial, sans-serif;
                            background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
                            padding: 40px 20px;
                            min-height: 100vh;
                        }
                        .container {
                            max-width: 580px;
                            margin: 0 auto;
                            background: #ffffff;
                            border-radius: 32px;
                            overflow: hidden;
                            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.35);
                        }
                        .header {
                            background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 50%, #3b82f6 100%);
                            padding: 48px 32px 40px;
                            text-align: center;
                            position: relative;
                            overflow: hidden;
                        }
                        .header::before {
                            content: "🎬";
                            position: absolute;
                            font-size: 140px;
                            opacity: 0.08;
                            bottom: -30px;
                            right: -30px;
                            transform: rotate(-15deg);
                        }
                        .header::after {
                            content: "🍿";
                            position: absolute;
                            font-size: 100px;
                            opacity: 0.08;
                            top: -20px;
                            left: -20px;
                            transform: rotate(10deg);
                        }
                        .header h1 {
                            color: #ffffff;
                            font-size: 36px;
                            font-weight: 700;
                            margin-bottom: 12px;
                            letter-spacing: -0.5px;
                            text-shadow: 0 2px 4px rgba(0,0,0,0.1);
                        }
                        .header p {
                            color: rgba(255, 255, 255, 0.95);
                            font-size: 16px;
                            font-weight: 500;
                            letter-spacing: 0.3px;
                        }
                        .content {
                            padding: 40px 36px;
                            background: #ffffff;
                        }
                        .greeting {
                            font-size: 18px;
                            color: #1e293b;
                            margin-bottom: 20px;
                            line-height: 1.5;
                            font-weight: 500;
                        }
                        .greeting strong {
                            color: #8b5cf6;
                            font-weight: 700;
                            background: linear-gradient(135deg, #8b5cf6, #6366f1);
                            background-clip: text;
                            -webkit-background-clip: text;
                            -webkit-text-fill-color: transparent;
                        }
                        .message-text {
                            color: #475569;
                            font-size: 15px;
                            line-height: 1.6;
                            margin-bottom: 28px;
                        }
                        .booking-card {
                            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
                            border-radius: 24px;
                            padding: 28px;
                            margin: 28px 0;
                            border: 1px solid #e2e8f0;
                            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
                        }
                        .movie-title {
                            font-size: 26px;
                            font-weight: 800;
                            background: linear-gradient(135deg, #8b5cf6, #6366f1);
                            background-clip: text;
                            -webkit-background-clip: text;
                            -webkit-text-fill-color: transparent;
                            margin-bottom: 24px;
                            padding-bottom: 16px;
                            border-bottom: 2px solid #e2e8f0;
                            display: flex;
                            align-items: center;
                            gap: 10px;
                        }
                        .movie-title span {
                            background: linear-gradient(135deg, #8b5cf6, #6366f1);
                            color: white;
                            font-size: 11px;
                            font-weight: 600;
                            padding: 4px 12px;
                            border-radius: 30px;
                            letter-spacing: 0.5px;
                        }
                        .details-grid {
                            display: grid;
                            grid-template-columns: repeat(2, 1fr);
                            gap: 20px;
                            margin-bottom: 24px;
                        }
                        .detail-item {
                            display: flex;
                            flex-direction: column;
                            gap: 6px;
                        }
                        .detail-label {
                            font-size: 11px;
                            font-weight: 600;
                            color: #64748b;
                            text-transform: uppercase;
                            letter-spacing: 0.8px;
                        }
                        .detail-value {
                            font-size: 16px;
                            font-weight: 600;
                            color: #0f172a;
                        }
                        .seats-badge {
                            background: linear-gradient(135deg, #8b5cf6, #6366f1);
                            color: white;
                            padding: 6px 16px;
                            border-radius: 30px;
                            font-size: 14px;
                            font-weight: 600;
                            display: inline-block;
                            box-shadow: 0 2px 8px rgba(139, 92, 246, 0.25);
                        }
                        .booking-id {
                            background: #f1f5f9;
                            padding: 8px 16px;
                            border-radius: 12px;
                            font-family: 'Monaco', 'Menlo', monospace;
                            font-size: 13px;
                            color: #334155;
                            letter-spacing: 0.3px;
                            display: inline-block;
                        }
                        .amount-section {
                            margin-top: 20px;
                            padding-top: 20px;
                            border-top: 2px solid #e2e8f0;
                            display: flex;
                            justify-content: space-between;
                            align-items: baseline;
                        }
                        .amount-label {
                            font-size: 14px;
                            font-weight: 600;
                            color: #475569;
                        }
                        .amount-value {
                            font-size: 32px;
                            font-weight: 800;
                            background: linear-gradient(135deg, #10b981, #059669);
                            background-clip: text;
                            -webkit-background-clip: text;
                            -webkit-text-fill-color: transparent;
                        }
                        .info-box {
                            background: #fffbeb;
                            border-left: 4px solid #f59e0b;
                            padding: 18px 20px;
                            margin: 28px 0;
                            border-radius: 16px;
                        }
                        .info-box p {
                            color: #92400e;
                            font-size: 13px;
                            line-height: 1.5;
                            margin-bottom: 8px;
                        }
                        .info-box p:last-child {
                            margin-bottom: 0;
                        }
                        .info-icon {
                            display: inline-block;
                            margin-right: 8px;
                        }
                        .wishes {
                            text-align: center;
                            margin: 32px 0 24px;
                            padding: 24px 0 16px;
                            border-top: 1px solid #e2e8f0;
                        }
                        .wishes h3 {
                            font-size: 20px;
                            font-weight: 700;
                            background: linear-gradient(135deg, #8b5cf6, #6366f1);
                            background-clip: text;
                            -webkit-background-clip: text;
                            -webkit-text-fill-color: transparent;
                            margin-bottom: 12px;
                        }
                        .wishes p {
                            color: #64748b;
                            font-size: 14px;
                            line-height: 1.5;
                        }
                        .footer {
                            background: #f8fafc;
                            padding: 32px 36px;
                            text-align: center;
                            border-top: 1px solid #e2e8f0;
                        }
                        .footer .brand {
                            font-size: 20px;
                            font-weight: 800;
                            background: linear-gradient(135deg, #8b5cf6, #6366f1);
                            background-clip: text;
                            -webkit-background-clip: text;
                            -webkit-text-fill-color: transparent;
                            margin-bottom: 12px;
                            letter-spacing: -0.3px;
                        }
                        .footer .tagline {
                            color: #64748b;
                            font-size: 13px;
                            margin-bottom: 16px;
                            font-weight: 500;
                        }
                        .footer .copyright {
                            color: #94a3b8;
                            font-size: 11px;
                            margin-top: 16px;
                        }
                        hr {
                            border: none;
                            height: 1px;
                            background: linear-gradient(90deg, transparent, #e2e8f0, transparent);
                            margin: 16px 0;
                        }
                        @media (max-width: 480px) {
                            .content {
                                padding: 28px 20px;
                            }
                            .details-grid {
                                grid-template-columns: 1fr;
                                gap: 16px;
                            }
                            .movie-title {
                                font-size: 22px;
                            }
                            .amount-value {
                                font-size: 26px;
                            }
                            .header h1 {
                                font-size: 28px;
                            }
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>Booking Confirmed ✨</h1>
                            <p>Your cinematic experience awaits</p>
                        </div>
                        
                        <div class="content">
                            <div class="greeting">
                                Dear <strong>${user?.name || 'Movie Enthusiast'}</strong>,
                            </div>
                            
                            <div class="message-text">
                                Thank you for choosing <strong style="color: #8b5cf6;">CineBook</strong>! Your booking has been successfully confirmed and your seats are now reserved.
                            </div>
                            
                            <div class="booking-card">
                                <div class="movie-title">
                                    🎬 ${movie?.title}
                                    <span>${movie?.release_date?.split('-')[0] || 'NEW'}</span>
                                </div>
                                
                                <div class="details-grid">
                                    <div class="detail-item">
                                        <span class="detail-label">📅 SHOW DATE</span>
                                        <span class="detail-value">${formattedDate}</span>
                                    </div>
                                    <div class="detail-item">
                                        <span class="detail-label">⏰ SHOW TIME</span>
                                        <span class="detail-value">${formattedTime}</span>
                                    </div>
                                    <div class="detail-item">
                                        <span class="detail-label">💺 SEAT NUMBERS</span>
                                        <span class="detail-value"><span class="seats-badge">${seats || 'N/A'}</span></span>
                                    </div>
                                    <div class="detail-item">
                                        <span class="detail-label">🎟️ BOOKING REFERENCE</span>
                                        <span class="detail-value"><span class="booking-id">${booking._id.slice(-8).toUpperCase()}</span></span>
                                    </div>
                                </div>
                                
                                <div class="amount-section">
                                    <span class="amount-label">Total Amount</span>
                                    <span class="amount-value">₹${amount}</span>
                                </div>
                            </div>
                            
                            <div class="info-box">
                                <p><span class="info-icon">🎯</span> <strong>Important Reminders:</strong></p>
                                <p>• Please arrive at least 15 minutes before showtime</p>
                                <p>• Carry a valid government ID proof for verification</p>
                                <p>• Show this email or your booking ID at the ticket counter</p>
                                <p>• Outside food and beverages are not permitted</p>
                            </div>
                            
                            <div class="wishes">
                                <h3>🎉 Enjoy Your Movie!</h3>
                                <p>We hope you have a wonderful cinematic experience.<br>For any assistance, reach out to us at <strong style="color: #8b5cf6;">support@cinebook.com</strong></p>
                            </div>
                        </div>
                        
                        <div class="footer">
                            <div class="brand">🎬 CineBook</div>
                            <div class="tagline">Experience Cinema, Redefined</div>
                            <hr>
                            <div class="copyright">
                                © ${new Date().getFullYear()} CineBook Entertainment. All rights reserved.<br>
                                This is a system-generated confirmation email. Please do not reply.
                            </div>
                        </div>
                    </div>
                </body>
                </html>
            `;
            
            // Plain text version
            const plainText = `
╔══════════════════════════════════════════════════════╗
║                    ✨ BOOKING CONFIRMED ✨               ║
╚══════════════════════════════════════════════════════╝

Dear ${user?.name || 'Movie Enthusiast'},

Thank you for choosing CineBook! Your booking has been successfully confirmed.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎬 MOVIE: ${movie?.title}
📅 DATE: ${formattedDate}
⏰ TIME: ${formattedTime}
💺 SEATS: ${seats}
🎟️ BOOKING ID: ${booking._id.slice(-8).toUpperCase()}
💰 AMOUNT: ₹${amount}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📌 IMPORTANT REMINDERS:
• Arrive 15 minutes before showtime
• Carry a valid government ID proof
• Show this email at the ticket counter
• Outside food not permitted

🎉 Enjoy Your Movie!

For assistance: support@cinebook.com

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎬 CineBook - Experience Cinema, Redefined
© ${new Date().getFullYear()} CineBook Entertainment
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
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