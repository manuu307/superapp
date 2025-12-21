Act as a Full Stack Senior Engineer. I need to implement a "Business-to-Client" (B2C) Chat Widget for our SuperApp.

THE STACK

Frontend: Next.js (React) + Tailwind CSSBackend: Node.js + Socket.io + Redis (for scaling)Database: MongoDB (Mongoose)THE TASKCreate a modular Chat Widget that integrates into a Business Public Profile page.DATA MODELS (MongoDB/Mongoose):Update/Create a 'User' schema to support "incomplete" status (isGuest: boolean).Use the 'newMessage' schema linked to a 'Room'.Create a 'Room' schema identifying the Business and the Guest.

FRONTEND WIDGET (React):Create a component BusinessChatWidget.jsx that accepts businessId and enabled props.If enabled=false, render nothing.If enabled=true, show a FAB. When clicked:If user is not "known" (no session/localstorage), show a Lead Generation Form (Name, Email, Phone).Upon form submission, hit an API to create the Guest User and get a roomId.Open a real-time chat window using Socket.io-client.Persist the Guest Session in localStorage.

BACKEND (Node.js/Socket.io):Add a socket event join_business_room that uses the roomId.Implement send_message event:Save message to MongoDB.Broadcast to the room via Redis adapter.Create an API endpoint POST /api/chat/initiate to handle the Lead Gen form and return/create the Room.

UI/UX REQUIREMENTS:Use a modern "WeChat" or "WhatsApp" bubble style.Ensure the widget is responsive and doesn't block the main profile content.