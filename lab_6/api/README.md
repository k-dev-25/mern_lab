# ShopKart Lab 06 API

Import `ShopKart-Lab-06-Orders.postman_collection.json` into Postman. Set `baseUrl` as needed, configure Razorpay Test Mode `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in `backend/.env`, then run the setup and payment-order tests. The Razorpay secret stays backend-only. A real Test Mode payment must be completed in the frontend Checkout UI before using the manual successful-verification request; the collection also checks fake-signature rejection and confirms the cart remains populated before verification.

The lab 5 cart contract remains available in `ShopKart-Lab-05-Cart.postman_collection.json`. Run the backend with `cd backend && npm install && npm run mongo && npm run dev`.
