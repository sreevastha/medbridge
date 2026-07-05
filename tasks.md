# 📋 MedBridge Task Division & Status

## Completed Infrastructure & Flows (Sreevastha & System)
- [x] **M1.6 — React app skeleton**: Fully setup React/Vite with TypeScript, PWA support, and Docker containerization.
- [x] **Database & Backend integration**: Connected FastAPI backend to NeonDB with fully typed SQLAlchemy models (`Lab`, `TestCatalogue`, `Patient`, `Transaction`, `StaffMember`).
- [x] **Secure Auth System**: Direct `bcrypt` password hashing (passlib dependency issue fixed) for robust database insertion.
- [x] **Onboarding (Step 3 & 4 fully dynamic)**:
  - Step 3 allows adding and removing staff members (Name, Email, Contact Number, Role) dynamically without annoying placeholder invitations.
  - Step 4 loads tests instantly from the NeonDB database on mount (cached in background to optimize latency) with interactive multi-select.
- [x] **Interactive Login & Dashboard**:
  - Login form connects dynamically to `/api/auth/login`.
  - Admin Dashboard dynamically loads all 4 statistics, the test mix distribution, and recent transactions from NeonDB.

---

## 👩‍💻 Harika (Next Focus: Patient Registration & Styling Polish)

Harika can now take over and build the real patient registration system since the backend and database schemas are ready!

### Tasks for Harika:
- [ ] **M1.7 — Convert Patient Registration page to Dynamic**
  - Integrate [PatientRegistration.tsx](file:///c:/Users/sriva/Downloads/medbridge/layer1-frontend/src/pages/PatientRegistration.tsx) to fetch available tests dynamically from `/api/catalogue/tests`.
  - Implement form submission to POST to `/api/patients` to save the patient and create a transaction in the database.
- [ ] **M1.8 — Complete ABDM/ABHA Mock Flow**
  - Connect the ABHA verification inputs to mock endpoints (`/api/abha/verify`) so scanning/verifying looks fully functional.
- [ ] **M1.9 — Refactor Shared UI Components**
  - Extract the form inputs, custom buttons, and sidebar layout from [AdminDashboard.tsx](file:///c:/Users/sriva/Downloads/medbridge/layer1-frontend/src/pages/AdminDashboard.tsx) and [LabOnboarding.tsx](file:///c:/Users/sriva/Downloads/medbridge/layer1-frontend/src/pages/LabOnboarding.tsx) into reusable components in `/components`.
