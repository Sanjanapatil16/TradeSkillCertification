# Trade Skill Certification Verification & Digital Badge Platform — Project Report

## 1. Project Overview

**TradeCert** is a full-stack platform that lets vocational training institutes (ITIs, skill centers) issue **verified digital certificates** to students. Each certificate gets a unique ID and QR code; anyone — especially employers — can verify authenticity online in seconds. Students keep a digital portfolio of badges; admins approve institutes and monitor the platform.

- **Program:** Unified Mentor Internship
- **Project:** UM_PROJECT_1
- **References:** National Skill Development Corporation · Skill India · Credly
- **Live demo:** https://tradeskillcertification.onrender.com
- **Repository:** https://github.com/Sanjanapatil16/TradeSkillCertification

## 2. Problem Statement

Vocational certificates are often paper-based — easy to forge, lose, or slow to verify. Employers hiring electricians, welders, machinists and mechanics cannot quickly confirm whether a candidate truly holds a certification.

## 3. Objectives

**Primary**
- Digital issuance of verified trade certificates by institutes
- One-click/QR certificate verification for employers
- Student digital badge portfolio
- Fraud reduction via unique IDs + revocation

**Secondary**
- QR-based verification, institute self-service issuance, shareable badges, central verification records

## 4. Scope

**Phase 1 (implemented)**
- Student registration/login + certificate portfolio
- Institute registration with admin approval workflow
- Certificate issuance with auto-generated unique ID + QR code
- Public verification page (ID or QR)
- Public digital badge page
- Admin panel: approve/reject institutes, revoke certificates, KPIs

**Out of scope (Phase 1)**
- Blockchain storage, government portal integration, online skill testing, mobile app

## 5. Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, custom CSS (responsive, hash-routed SPA) |
| Backend | Node.js, Express 5, REST API |
| Database | JSON document store (MongoDB-compatible schema, swappable for Mongoose) |
| QR codes | `qrcode` package — generated server-side as data URLs |
| Auth | Session tokens, SHA-256 hashed passwords, role-based access control |
| Deployment | Render (Node web service, free tier) |

## 6. Architecture

```
React SPA (hash routes)                Express API
#/           Landing page              POST /api/register|login
#/login      Auth (student/institute)  GET  /api/me
#/dashboard  Student portfolio         GET  /api/certificates/mine
#/institute  Issue certs + QR          POST /api/certificates
#/admin      Admin panel               GET  /api/verify/:id (public, counts verifications)
#/verify/:id Public verification       POST /api/institutes/:id/approve|reject
#/badge/:id  Public digital badge      GET  /api/admin/overview
```

Single Node process serves API + built frontend — simple Render deployment.

## 7. Roles & Workflows

- **Student:** registers → sees all certificates issued to their email as digital badges → shares badge/verify links with employers
- **Institute:** registers → *pending until admin approves* → issues certificates (student name/email, trade skill, level, grade) → gets certificate ID + QR instantly → can revoke mistakes
- **Employer (public, no login):** opens verify page → enters ID or scans QR → sees student, trade, date, institute, valid/revoked status
- **Admin:** seeded account (`admin@tradecert.com`) → approves institutes, views all users/certificates, revokes fraudulent certs, sees KPIs (certs issued, verification count, pending institutes)

## 8. Data Model

- **User:** id, name, email, passwordHash, role (student/institute/admin), status (active/pending/rejected), profile {instituteName, location, programs}, createdAt
- **Certificate:** id (`TC-XXXXXX-XXXXXX`), studentName, studentEmail, tradeSkill, level, grade, issueDate, instituteId/Name/Location, status (valid/revoked), qr (data URL), verifyCount
- **Session:** token → userId

## 9. How to Run Locally

```bash
npm run install:all   # backend + frontend deps
npm run build         # build React app
npm start             # http://localhost:5000
```

Demo credentials: admin login `admin@tradecert.com / admin123`.

## 10. Deployment

Render free tier — Build `npm run install:all && npm run build`, Start `npm start`. Live at https://tradeskillcertification.onrender.com

## 11. Roadmap

JWT auth · MongoDB persistence · PDF certificate download · email notifications to students · richer badge visuals · employer dashboard · analytics reports · mobile app

## 12. Conclusion

A working end-to-end certification verification platform: institutes issue QR-coded digital certificates, students build portfolios, employers verify authenticity publicly, and admins govern the ecosystem — deployed live on Render.
