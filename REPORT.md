# Trade Skill Certification Platform — Project Report

## 1. Project Overview

**TradeCert** is a web platform concept for verifying and certifying trade skills — connecting apprentices and skilled workers with assessments, digital certificates, and employers. This submission delivers the **Phase 1 foundation**: a responsive React frontend (landing page + role-based registration), an Express.js backend serving the app and a REST API scaffold, and a production deployment.

- **Program:** Unified Mentor Internship
- **Project:** UM_PROJECT_1 — Trade Skill Certification Platform
- **Live demo:** https://tradeskillcertification.onrender.com
- **Repository:** https://github.com/Sanjanapatil16/TradeSkillCertification

## 2. Problem Statement

Skilled trades (electrical, welding, carpentry, HVAC, etc.) lack a unified, verifiable way to:

- Prove worker competency to employers
- Track an apprentice's learning and assessment progress
- Issue portable, tamper-proof digital certificates
- Connect verified talent with job opportunities

Existing processes rely on paper certificates and informal verification, leading to fraud risk and hiring friction.

## 3. Objectives

**Primary**
- Provide a centralized platform for trade skill certification
- Enable role-based onboarding (apprentice, skilled worker, certified professional, employer/trainer)
- Deliver a fast, mobile-friendly web experience

**Secondary**
- Lay the API + deployment foundation for auth, assessments, and certificate issuance
- Support future integration with assessment engines and employer portals

## 4. Scope

**In scope (Phase 1 — delivered)**
- Responsive landing page presenting the platform
- Role-based registration UI (4 personas)
- Express.js backend with health-check API, serving the production React build
- CI-ready build pipeline (`npm run install:all && npm run build` → `npm start`)
- Free-tier cloud deployment (Render)

**Out of scope (planned next phases)**
- User authentication & authorization (JWT/bcryptjs deps already included)
- MongoDB persistence via Mongoose (dependency already included)
- Assessment engine, certificate generation (PDF/blockchain-style verification)
- Employer dashboard & job matching

## 5. Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite 8, plain CSS (responsive design) |
| Backend | Node.js, Express 5, CORS |
| Database | MongoDB/Mongoose — scaffolded (next phase) |
| Auth | JWT + bcryptjs — scaffolded (next phase) |
| Deployment | Render (Node web service, free tier) |
| Version control | Git + GitHub |

## 6. Architecture

```
Browser → Render (Express :10000)
            ├── /api/health        → JSON health check
            └── /*                 → React SPA (frontend/dist)
```

The Express server serves the Vite production build statically with SPA fallback routing, so the entire app runs as a single Node process — simple to deploy and scale.

## 7. Features Implemented

1. **Landing page** — hero section, value proposition, feature cards (skill verification, digital certificates, progress tracking, employer hiring)
2. **Role-based registration** — selectable personas (Apprentice / Skilled Worker / Certified Professional / Employer-Trainer) with form validation and success feedback
3. **Responsive UI** — works on desktop and mobile
4. **Backend API scaffold** — `/api/health`, JSON parsing, CORS enabled; ready for auth & CRUD routes
5. **Automated production build** — one-command install + build + start

## 8. Key Files

```
UM_PROJECT_1/
├── package.json          # root scripts: install:all, build, start
├── backend/
│   └── server.js         # Express server: API + static SPA hosting
└── frontend/
    └── src/
        ├── App.jsx       # landing page + registration UI
        ├── App.css       # styling
        └── index.css     # global reset
```

## 9. How to Run Locally

```bash
npm run install:all   # install backend + frontend deps
npm run build         # build React app
npm start             # serve at http://localhost:5000
```

## 10. Deployment

Deployed on **Render** as a free Node web service:
- Build: `npm run install:all && npm run build`
- Start: `npm start`
- URL: https://tradeskillcertification.onrender.com

## 11. Roadmap

- JWT auth + role-based access control (deps ready)
- MongoDB schemas: User, Skill, Assessment, Certificate
- Assessment & scoring module
- PDF certificate generation + public verification link
- Employer portal & candidate search
- Notifications (email/SMS) via provider APIs

## 12. Conclusion

Phase 1 establishes a working, deployed full-stack foundation for the Trade Skill Certification Platform — a professional public-facing UI, a runnable backend, and a reproducible build/deploy pipeline that the remaining features can be built on.
