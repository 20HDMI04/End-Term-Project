# Readsy Web App - Documentation Index

## 📚 Complete Documentation Library

This directory contains comprehensive documentation for the Readsy web application. Use this index to navigate.

---

## 📖 Documentation Files

### 1. [WEB_DOCUMENTATION.md](./WEB_DOCUMENTATION.md) ⭐ START HERE
**Main documentation covering everything**

Contains:
- Project overview & architecture
- Complete directory structure
- Setup & installation instructions
- Component guides (Dashboard, Home, Discover, Search, Onboarding)
- Routing configuration
- Authentication with SuperTokens
- API integration basics
- Development guidelines
- Troubleshooting common issues
- Contributing guidelines

**Best for:** Getting overall understanding of the project

---

### 2. [COMPONENT_GUIDE.md](./COMPONENT_GUIDE.md)
**Detailed component reference and templates**

Contains:
- Component overview & purpose
- Dashboard component deep dive
- OnboardingScreen component details
- Home, Discover, Search component specs
- Component templates & best practices
- Creating new components step-by-step
- Common React patterns
- Component testing checklist
- Performance optimization tips

**Best for:** Building new components or understanding existing ones

---

### 3. [API_INTEGRATION_GUIDE.md](./API_INTEGRATION_GUIDE.md)
**Complete API integration reference**

Contains:
- Base API configuration
- Making API calls (GET, POST, PATCH, DELETE)
- All available endpoints
- Query parameters & filtering
- Error handling strategies
- Reusable API client patterns
- Data type/interface definitions
- Testing API calls
- Caching & optimization
- Debugging API issues
- Best practices

**Best for:** Integrating with backend APIs and troubleshooting API issues

---

### 4. [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md)
**Setup, troubleshooting, and development workflow**

Contains:
- Quick start guide
- Prerequisites & installation
- Running the application
- Common issues with solutions
- Development workflow
- Performance optimization
- Debugging techniques
- Browser DevTools guide
- React DevTools extension
- VS Code debugging
- Environment variables
- Git workflow
- Useful extensions

**Best for:** Setting up development environment and troubleshooting problems

---

## 🚀 Quick Start

### New to the project?
1. Read [WEB_DOCUMENTATION.md](./WEB_DOCUMENTATION.md) - Overview section
2. Follow [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md) - Initial Setup
3. Run `pnpm dev` and explore

### Want to build a feature?
1. Check [COMPONENT_GUIDE.md](./COMPONENT_GUIDE.md) - Component Template
2. Check [API_INTEGRATION_GUIDE.md](./API_INTEGRATION_GUIDE.md) - API usage
3. Reference [WEB_DOCUMENTATION.md](./WEB_DOCUMENTATION.md) - Routing section

### Having API issues?
1. See [API_INTEGRATION_GUIDE.md](./API_INTEGRATION_GUIDE.md) - Error Handling
2. Check [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md) - Debugging
3. Reference [WEB_DOCUMENTATION.md](./WEB_DOCUMENTATION.md) - Troubleshooting

### Development problem?
1. Check [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md) - Common Issues
2. Try solutions provided
3. Use debugging tips if needed

---

## 📋 Directory Structure

```
web/
├── WEB_DOCUMENTATION.md          ← Main documentation
├── COMPONENT_GUIDE.md            ← Component building guide
├── API_INTEGRATION_GUIDE.md      ← API reference
├── DEVELOPMENT_GUIDE.md          ← Setup & troubleshooting
├── README.md                     ← Original setup guide
│
├── src/
│   ├── App.tsx                   ← Routing & setup
│   ├── main.tsx                  ← Entry point
│   ├── components/
│   │   ├── Dashboard.tsx         ← Main dashboard
│   │   ├── Home.tsx              ← Home page
│   │   ├── Discover.tsx          ← Book discovery
│   │   ├── Search.tsx            ← Search page
│   │   ├── OnboardingScreen.tsx  ← First-time setup
│   │   └── *.css                 ← Component styles
│   ├── assets/                   ← Images, fonts
│   └── *.css                     ← Global styles
│
├── package.json                  ← Dependencies
├── vite.config.ts                ← Vite config
├── tsconfig.json                 ← TypeScript config
└── index.html                    ← HTML entry
```

---

## 🔗 Key Topics by Category

### Setup & Installation
- [Initial Setup](./DEVELOPMENT_GUIDE.md#initial-setup)
- [Prerequisites](./DEVELOPMENT_GUIDE.md#prerequisites)
- [First-Time Configuration](./DEVELOPMENT_GUIDE.md#first-time-configuration)

### Running the App
- [Development Server](./DEVELOPMENT_GUIDE.md#development-server)
- [Production Build](./DEVELOPMENT_GUIDE.md#production-build)
- [Quick Start](./WEB_DOCUMENTATION.md#quick-start)

### Components
- [Component Guide](./COMPONENT_GUIDE.md)
- [Dashboard Component](./COMPONENT_GUIDE.md#dashboard-component)
- [OnboardingScreen](./COMPONENT_GUIDE.md#onboardingscreen-component)
- [Creating New Components](./COMPONENT_GUIDE.md#creating-new-components)
- [Component Template](./COMPONENT_GUIDE.md#component-template)

### Routing
- [Routing Configuration](./WEB_DOCUMENTATION.md#routing)
- [Available Routes](./WEB_DOCUMENTATION.md#available-routes)
- [Navigation](./COMPONENT_GUIDE.md#navigation)

### Authentication
- [SuperTokens Setup](./WEB_DOCUMENTATION.md#supertokens-integration)
- [Session Management](./WEB_DOCUMENTATION.md#session-management)
- [Protected Routes](./WEB_DOCUMENTATION.md#protected-routes)

### API Integration
- [Making API Calls](./API_INTEGRATION_GUIDE.md#making-api-calls)
- [Available Endpoints](./API_INTEGRATION_GUIDE.md#api-endpoints)
- [Error Handling](./API_INTEGRATION_GUIDE.md#error-handling)
- [API Client Abstraction](./API_INTEGRATION_GUIDE.md#reusable-api-functions)

### Development
- [Code Style](./WEB_DOCUMENTATION.md#code-style)
- [Component Best Practices](./WEB_DOCUMENTATION.md#component-best-practices)
- [Debugging Guide](./DEVELOPMENT_GUIDE.md#debugging-guide)
- [Development Workflow](./DEVELOPMENT_GUIDE.md#development-workflow)

### Troubleshooting
- [Common Issues](./DEVELOPMENT_GUIDE.md#common-issues)
- [Troubleshooting](./WEB_DOCUMENTATION.md#troubleshooting)
- [Debug Tips](./WEB_DOCUMENTATION.md#debug-tips)

---

## 💡 Common Tasks

### "How do I...?"

**...start the development server?**
→ See [DEVELOPMENT_GUIDE.md - Development Server](./DEVELOPMENT_GUIDE.md#development-server)

**...create a new page?**
→ See [COMPONENT_GUIDE.md - Creating New Components](./COMPONENT_GUIDE.md#creating-new-components)

**...call the backend API?**
→ See [API_INTEGRATION_GUIDE.md - Making API Calls](./API_INTEGRATION_GUIDE.md#making-api-calls)

**...add routing for a new page?**
→ See [WEB_DOCUMENTATION.md - Adding New Routes](./WEB_DOCUMENTATION.md#adding-new-routes)

**...debug an API issue?**
→ See [API_INTEGRATION_GUIDE.md - Debugging API Issues](./API_INTEGRATION_GUIDE.md#debugging-api-issues)

**...fix a TypeScript error?**
→ See [DEVELOPMENT_GUIDE.md - TypeScript Errors](./DEVELOPMENT_GUIDE.md#4-typescript-errors)

**...get backend data to display?**
→ See [COMPONENT_GUIDE.md - Data Fetching](./COMPONENT_GUIDE.md#data-fetching)

**...handle form submission?**
→ See [COMPONENT_GUIDE.md - Form Handling](./COMPONENT_GUIDE.md#form-handling)

**...check authentication status?**
→ See [WEB_DOCUMENTATION.md - Session Management](./WEB_DOCUMENTATION.md#session-management)

---

## 📊 Architecture Overview

### High-Level Architecture
See [WEB_DOCUMENTATION.md - Architecture](./WEB_DOCUMENTATION.md#high-level-architecture)

### Data Flow
See [WEB_DOCUMENTATION.md - Data Flow](./WEB_DOCUMENTATION.md#data-flow)

### Authentication Flow
See [WEB_DOCUMENTATION.md - Authentication Flow](./WEB_DOCUMENTATION.md#authentication-flow)

---

## 🛠️ Tools & Technologies

### Core Technologies
- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool & dev server
- **React Router v7** - Client-side routing
- **SuperTokens** - Authentication
- **CSS** - Styling

### Development Tools
- **ESLint** - Code quality
- **Node.js 18+** - Runtime
- **pnpm** - Package manager
- **VS Code** - Code editor
- **DevTools** - Browser debugging

See [WEB_DOCUMENTATION.md - Tech Stack](./WEB_DOCUMENTATION.md#tech-stack) for full details

---

## 📝 Code Examples

### API Call Example
See [API_INTEGRATION_GUIDE.md - Basic GET Request](./API_INTEGRATION_GUIDE.md#basic-get-request)

### Component Example
See [COMPONENT_GUIDE.md - Component Template](./COMPONENT_GUIDE.md#component-template)

### Data Fetching Pattern
See [COMPONENT_GUIDE.md - Data Fetching](./COMPONENT_GUIDE.md#data-fetching)

### Form Handling Pattern
See [COMPONENT_GUIDE.md - Form Handling](./COMPONENT_GUIDE.md#form-handling)

### Error Handling Example
See [API_INTEGRATION_GUIDE.md - Handling Errors](./API_INTEGRATION_GUIDE.md#handling-errors)

---

## ✅ Development Checklist

### Before Starting
- [ ] Read WEB_DOCUMENTATION.md overview
- [ ] Run `pnpm install`
- [ ] Verify backend is running
- [ ] Run `pnpm dev`
- [ ] Open browser to check it works

### Before Committing
- [ ] Run `pnpm lint`
- [ ] Run `pnpm build`
- [ ] Test in browser
- [ ] No console errors
- [ ] Check git diff

### Before Pushing
- [ ] All checks pass
- [ ] Code follows guidelines
- [ ] Documentation updated (if needed)
- [ ] No breaking changes

See [DEVELOPMENT_GUIDE.md - Before Committing](./DEVELOPMENT_GUIDE.md#before-committing)

---

## 🚨 Emergency Fixes

**App won't start?**
1. Check backend: `curl http://localhost:3000/health`
2. Clear cache: `rm -r node_modules && pnpm install`
3. Restart dev server: `pnpm dev`

**API calls failing?**
1. Check backend is running
2. Verify credentials included: `credentials: 'include'`
3. Check DevTools Network tab
4. See [API_INTEGRATION_GUIDE.md - Debugging API Issues](./API_INTEGRATION_GUIDE.md#debugging-api-issues)

**TypeScript errors?**
1. Run `pnpm build`
2. Check imports are correct
3. Verify dependencies installed
4. See [DEVELOPMENT_GUIDE.md - TypeScript Errors](./DEVELOPMENT_GUIDE.md#4-typescript-errors)

**Session expires?**
1. Check cookies in DevTools
2. Call `Session.attemptRefreshingSession()`
3. See [WEB_DOCUMENTATION.md - Session Management](./WEB_DOCUMENTATION.md#session-management)

---

## 📚 External Resources

- [React Documentation](https://react.dev)
- [React Router Documentation](https://reactrouter.com)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Vite Documentation](https://vitejs.dev)
- [SuperTokens Documentation](https://supertokens.com/docs)

---

## 📞 Getting Help

1. **Search this documentation** - Most questions answered
2. **Check console** (DevTools) - Error messages are helpful
3. **Check Network tab** - See API requests/responses
4. **Check Related Guide** - See above sections
5. **Review component code** - See actual implementations
6. **Ask team member** - If still stuck

---

## 📅 Documentation Updates

- **Version:** 1.0.0
- **Last Updated:** February 2026
- **Maintained by:** Development Team

---

## 📋 File Navigation

| File | Purpose | Read Time |
|------|---------|-----------|
| [WEB_DOCUMENTATION.md](./WEB_DOCUMENTATION.md) | Complete overview | 30 min |
| [COMPONENT_GUIDE.md](./COMPONENT_GUIDE.md) | Component development | 20 min |
| [API_INTEGRATION_GUIDE.md](./API_INTEGRATION_GUIDE.md) | API reference | 20 min |
| [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md) | Setup & troubleshooting | 15 min |

---

## 🎯 Getting Started Path

```
Want to understand the project?
    ↓
Read WEB_DOCUMENTATION.md (Overview section)
    ↓
Follow DEVELOPMENT_GUIDE.md (Setup section)
    ↓
Run: pnpm install && pnpm dev
    ↓
Open browser: http://localhost:5173
    ↓
Explore the app!
    ↓
Check components in COMPONENT_GUIDE.md
    ↓
Ready to code!
```

---

**Happy coding! 🚀**

For questions or issues, consult the appropriate guide above.
