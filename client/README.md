# 🖥️ Frontend - Seafood QMS

Frontend application built with React, TypeScript, and Vite.

## 🛠️ Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Navigation

## 📁 Structure

```
client/
├── src/
│   ├── components/     # Reusable components
│   ├── contexts/       # React contexts
│   ├── pages/          # Page components
│   ├── services/       # API services
│   ├── types/          # TypeScript types
│   ├── App.tsx         # Main app component
│   ├── main.tsx        # Entry point
│   └── index.css       # Global styles
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## 🚀 Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🔐 Authentication

The app uses JWT tokens stored in sessionStorage. All API requests include the token in the Authorization header.

## 📡 API Communication

All API calls go through `services/apiClient.ts` which handles:
- Token management
- Request/response formatting
- Error handling

## 🎨 Styling

Using Tailwind CSS with RTL support for Arabic interface.

---

**Part of Seafood QMS - Quality Management System**
