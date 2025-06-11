# 🚀 Setup Guide for New Contributors

This guide will help you set up the Social Donation Platform on your local machine.

## 📋 Prerequisites

Before you begin, make sure you have:

- **Node.js 18+** installed ([Download here](https://nodejs.org/))
- **Git** installed ([Download here](https://git-scm.com/))
- **A code editor** (VS Code recommended)

## 🛠️ Quick Setup (Recommended)

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/Social-Donation-Platform.git
cd Social-Donation-Platform
```

### 2. One-Command Setup
```bash
npm run setup
```

This single command will:
- ✅ Install all dependencies
- ✅ Generate Prisma client
- ✅ Create database tables
- ✅ Seed database with sample data

### 3. Start Development Server
```bash
npm run dev
```

### 4. Open Your Browser
Navigate to `http://localhost:5173`

🎉 **You're ready to go!** You should see the donation platform with 8 sample projects.

---

## 🔧 Manual Setup (Step by Step)

If you prefer to run each step manually:

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables
```bash
cp .env.example .env
```

Edit `.env` and add your M-Pesa credentials (see M-Pesa Setup section below).

### 3. Generate Prisma Client
```bash
npm run db:generate
```

### 4. Create Database Tables
```bash
npm run db:push
```

### 5. Seed Database with Sample Data
```bash
npm run db:seed
```

### 6. Start Development Server
```bash
npm run dev
```

---

## 📊 What Gets Seeded

The database seeding creates:

### 👤 **1 Admin User**
- **Email**: admin@donateke.org
- **Name**: Admin User
- **Role**: ADMIN

### 🎯 **8 Sample Projects**

1. **Clean Water for Rural Schools** (Education) - KES 50,000
2. **Emergency Medical Supplies** (Healthcare) - KES 25,000
3. **Tree Planting Initiative** (Environment) - KES 15,000
4. **Community Library Project** (Education) - KES 75,000
5. **Food Security Program** (Emergency Relief) - KES 40,000
6. **Youth Tech Training Center** (Technology) - KES 60,000
7. **Women Empowerment Workshop** (Community Development) - KES 30,000
8. **School Sports Equipment** (Sports) - KES 20,000

Each project includes:
- ✅ Realistic descriptions and goals
- ✅ High-quality stock images
- ✅ Different categories and statuses
- ✅ Various funding goals (KES 15,000 - 75,000)

---

## 💳 M-Pesa Integration Setup

### For Testing (Sandbox)

1. **Get Safaricom Developer Credentials**:
   - Visit [developer.safaricom.co.ke](https://developer.safaricom.co.ke)
   - Create an account and app
   - Get your Consumer Key and Consumer Secret

2. **Update .env file**:
   ```env
   MPESA_CONSUMER_KEY=your_consumer_key_here
   MPESA_CONSUMER_SECRET=your_consumer_secret_here
   ```

3. **Set up ngrok for callbacks**:
   ```bash
   npm install -g ngrok
   ngrok http 5173
   ```

4. **Update callback URL in .env**:
   ```env
   MPESA_CALLBACK_URL=https://your-ngrok-url.ngrok.io/api/payments/mpesa/callback
   ```

See `MPESA_SETUP_GUIDE.md` for detailed M-Pesa setup instructions.

---

## 🗄️ Database Management Commands

```bash
# Seed database with sample data
npm run db:seed

# Reset database and re-seed
npm run db:reset

# Open Prisma Studio (database GUI)
npm run db:studio

# Generate Prisma client after schema changes
npm run db:generate

# Push schema changes to database
npm run db:push
```

---

## 🧪 Testing the Setup

### 1. **Check Homepage**
- Should display 8 projects
- Projects should have images and descriptions

### 2. **Test Donation Flow**
- Click "Donate" on any project
- Try minimum amount (KES 2)
- Fill in phone number (254708374149 for testing)
- Should create donation record

### 3. **Test M-Pesa Integration** (if configured)
- Complete donation form
- Should receive STK Push on phone
- Check payment status updates

---

## 🐛 Troubleshooting

### "Project not found" Error
- **Solution**: Run `npm run db:seed` to add sample projects

### Database Connection Issues
- **Solution**: Delete `prisma/dev.db` and run `npm run db:push && npm run db:seed`

### M-Pesa Errors
- **Check**: Environment variables are set correctly
- **Check**: ngrok is running for callbacks
- **Check**: Phone number format (254XXXXXXXXX)

### Port Already in Use
- **Solution**: Kill process on port 5173 or use different port:
  ```bash
  npm run dev -- --port 3000
  ```

---

## 📁 Project Structure

```
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.js           # Database seeding script
├── src/
│   ├── lib/
│   │   ├── components/   # Svelte components
│   │   ├── services/     # API services (M-Pesa, etc.)
│   │   └── utils/        # Utility functions
│   └── routes/           # SvelteKit routes
├── .env                  # Environment variables
├── package.json          # Dependencies and scripts
└── README.md            # Main documentation
```

---

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes**
4. **Test thoroughly**: `npm run check`
5. **Commit changes**: `git commit -m 'Add amazing feature'`
6. **Push to branch**: `git push origin feature/amazing-feature`
7. **Open a Pull Request**

---

## 📞 Need Help?

- **Check the troubleshooting section above**
- **Review `README.md` for general information**
- **See `MPESA_SETUP_GUIDE.md` for M-Pesa specific help**
- **Open an issue** on GitHub if you're still stuck

---

## 🎯 Next Steps

After setup, you can:

1. **Customize the projects** in `prisma/seed.js`
2. **Add your own branding** and styling
3. **Configure M-Pesa** for real payments
4. **Deploy to production** (Vercel, Netlify, etc.)

Happy coding! 🚀
