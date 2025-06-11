# DonateKE - Social Donation Platform

A modern, anonymous donation platform built with SvelteKit for supporting social projects across Kenya.

## 🚀 Features

- **Anonymous Donations**: Support projects while maintaining privacy
- **Project Categories**: Education, Healthcare, Environment, Community Development, and more
- **Real-time Progress Tracking**: See donation progress and impact
- **Mobile-First Design**: Responsive design optimized for all devices
- **Secure Payments**: M-Pesa integration for secure transactions
- **Project Management**: Create and manage social impact projects
- **Transparent Reporting**: Track fund usage and project outcomes

## 🛠️ Tech Stack

- **Frontend**: SvelteKit with JavaScript
- **Styling**: Tailwind CSS
- **Database**: Prisma ORM with SQLite (development)
- **Icons**: Lucide Svelte
- **Payments**: M-Pesa API integration (simulated)
- **State Management**: Svelte stores

## 📁 Project Structure

```
src/
├── lib/
│   ├── components/
│   │   ├── layout/          # Header, Footer, Navigation
│   │   ├── projects/        # Project cards, badges, filters
│   │   ├── donations/       # Donation forms and components
│   │   └── ui/             # Reusable UI components
│   ├── stores/             # Svelte stores for state management
│   ├── utils/              # Utility functions
│   ├── services/           # API service classes
│   └── db.js              # Database connection
├── routes/
│   ├── api/               # API endpoints
│   ├── projects/          # Project pages
│   └── +layout.svelte     # Main layout
└── app.html               # HTML template
```

## 🏗️ Architecture & Best Practices

### Component Organization
- **Modular Components**: Small, focused components with single responsibilities
- **Reusable UI Elements**: Consistent design system with reusable components
- **Smart/Dumb Components**: Separation of business logic and presentation

### State Management
- **Centralized Stores**: Organized stores for different data domains
- **Reactive Updates**: Automatic UI updates when data changes
- **Local Storage Integration**: Persistent user preferences

### API Design
- **RESTful Endpoints**: Clean, predictable API structure
- **Error Handling**: Comprehensive error handling and user feedback
- **Validation**: Input validation on both client and server

### Database Schema
- **Normalized Design**: Efficient relational database structure
- **Audit Trail**: Track all donations and project changes
- **Privacy First**: Anonymous donation support

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd social-donation-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up the database**
   ```bash
   npm run db:generate
   npm run db:push
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run check` - Run Svelte checks
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:studio` - Open Prisma Studio

## 🎨 Design System

### Colors
- **Primary**: Emerald (environmental/growth theme)
- **Secondary**: Gray scale for text and backgrounds
- **Status Colors**: Red (urgent), Green (success), Yellow (warning)

### Typography
- **Font**: Inter (clean, modern, accessible)
- **Hierarchy**: Clear heading and body text scales

### Components
- **Buttons**: Primary, secondary, and outline variants
- **Cards**: Consistent card design for projects
- **Forms**: Accessible form inputs with validation
- **Progress Bars**: Visual progress indicators

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
DATABASE_URL="file:./dev.db"
MPESA_CONSUMER_KEY="your_mpesa_consumer_key"
MPESA_CONSUMER_SECRET="your_mpesa_consumer_secret"
MPESA_SHORTCODE="your_shortcode"
MPESA_PASSKEY="your_passkey"
```

### Database Configuration
The project uses SQLite for development. For production, update the `prisma/schema.prisma` file to use PostgreSQL or MySQL.

## 📱 Mobile Responsiveness

- **Mobile-First**: Designed for mobile devices first
- **Responsive Grid**: Adaptive layouts for all screen sizes
- **Touch-Friendly**: Large touch targets and intuitive gestures
- **Performance**: Optimized for mobile networks

## 🔒 Security Features

- **Input Validation**: Comprehensive validation on all inputs
- **SQL Injection Protection**: Prisma ORM prevents SQL injection
- **XSS Protection**: Svelte's built-in XSS protection
- **Anonymous Donations**: Privacy-first donation system

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Vercel
```bash
npm install -g vercel
vercel
```

### Deploy to Netlify
```bash
npm run build
# Upload dist folder to Netlify
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Svelte Team** for the amazing framework
- **Tailwind CSS** for the utility-first CSS framework
- **Lucide** for the beautiful icons
- **Prisma** for the excellent ORM

## 📞 Support

For support, email support@donateke.org or create an issue in the repository.

---

**Made with ❤️ in Kenya**
