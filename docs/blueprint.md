# **App Name**: Comment2DM

## Core Features:

- Secure User Authentication: Enables user registration, login, and account management, securing access to the application via Firebase Authentication.
- Instagram Account Integration: Facilitates secure connection to Instagram Professional accounts through OAuth, including robust access token storage and refresh handling.
- DM Automation Configuration: Allows users to define custom keyword triggers, craft personalized direct message responses, and specify target URLs for automated replies.
- Automated Comment Detection & DM Sending: A backend webhook detects Instagram comments, matches them against user-defined keywords, and automatically dispatches direct messages via the Instagram Graph API, preventing duplicate replies and logging activity to Firestore.
- Usage & Performance Dashboard: Presents a clear overview of DMs sent, active automations, subscription status, and recent activity to help users track their engagement.
- Subscription Billing Management: Integrates Stripe to manage tiered subscription plans (Starter, Growth, Unlimited), enabling secure payment processing and quota enforcement.
- AI-Powered DM Response Tool: Leverages generative AI to suggest engaging and contextually relevant direct message responses based on specified keywords and campaign goals, streamlining automation setup.

## Style Guidelines:

- Primary color: A professional and clean muted blue-violet (#6957BF) to establish a sophisticated and trustworthy brand identity for a SaaS platform.
- Background color: A very light, desaturated blue-violet (#F2F1F8) to provide a soft and spacious canvas, minimizing eye strain for prolonged use in a light theme.
- Accent color: A vibrant, clear blue (#449AEA) for interactive elements, call-to-action buttons, and highlighting key information, ensuring strong contrast and usability.
- Headlines: 'Space Grotesk' (sans-serif) for a modern, tech-forward, and crisp aesthetic, ensuring clarity in titles and headings. Body text: 'Inter' (sans-serif) for high readability and neutrality across various screen sizes and information densities, suitable for a professional SaaS application.
- Utilize a consistent set of clean, outlined Material Design 3 icons to ensure clarity and intuitive navigation throughout the application, aligning with a modern UI standard.
- Implement a fully responsive and adaptive mobile-first layout with modern dashboard elements. Emphasize card-based UI components with subtle rounded corners for a sleek, organized, and modular visual structure. Include thoughtful empty states and smooth loading skeletons to enhance user experience.
- Incorporate subtle, purposeful animations for transitions, state changes, and interactive feedback, creating a fluid, engaging, and professional user interface experience.