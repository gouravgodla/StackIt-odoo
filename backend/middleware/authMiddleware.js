import { clerkClient } from '@clerk/clerk-sdk-node';

// Middleware to check for admin role by making a live API call to Clerk.
// This is more robust than relying on JWT claims, which can be misconfigured.
export const requireAdmin = async (req, res, next) => {
    try {
        if (!req.auth.userId) {
            // This should technically be caught by ClerkExpressRequireAuth first, but we check as a safeguard.
            return res.status(401).json({ message: 'Unauthenticated.' });
        }
        
        const user = await clerkClient.users.getUser(req.auth.userId);

        if (user.publicMetadata?.role !== 'admin') {
            return res.status(403).json({ message: 'Forbidden: Admin access required.' });
        }
        
        // If the user is an admin, proceed to the next handler.
        next();
    } catch (error) {
        console.error("Admin check failed:", error);
        return res.status(500).json({ message: 'Server error during authorization.' });
    }
};
