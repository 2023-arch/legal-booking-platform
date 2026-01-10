# Deployment Guide & Free Resources

This guide outlines how to deploy your "Legal Booking" platform for free (or very low cost) and set up a Continuous Integration/Continuous Deployment (CI/CD) pipeline.

## 1. CI/CD Pipeline (GitHub Actions)

I have created a workflow file at `.github/workflows/main.yml`.

*   **What it does:** Every time you push code to GitHub, it automatically:
    *   Installs Python dependencies and lints the **Backend**.
    *   Installs Node.js dependencies and checks if the **Frontend** builds successfully.
*   **How to use:** Simply push your code to a GitHub repository. Go to the "Actions" tab in GitHub to see the pipeline running.

---

## 2. Free Hosting Strategy (The "Modern Stack")

Since you asked for free resources to go live, this is the best combination currently available:

### A. Frontend: Vercel (Best for Next.js)
*   **Cost:** Free (Hobby Plan).
*   **Domain:** You get `your-project-name.vercel.app` for free.
*   **Setup:**
    1.  Push your code to GitHub.
    2.  Go to [Vercel.com](https://vercel.com) and sign up with GitHub.
    3.  Click "Add New..." -> "Project".
    4.  Import your repository.
    5.  **Important:** Configure the **Root Directory** to `frontend`.
    6.  Set Environment Variables (e.g., `NEXT_PUBLIC_API_URL`).
    7.  Deploy.

### B. Backend: Render or Railway
*   **Render:** Offers a free tier for Web Services (spins down after inactivity) and PostgreSQL.
*   **Setup (Render):**
    1.  Go to [Render.com](https://render.com).
    2.  Create a "Web Service".
    3.  Connect GitHub repo.
    4.  **Root Directory**: `backend`.
    5.  **Build Command**: `pip install -r requirements.txt`.
    6.  **Start Command**: `uvicorn main:app --host 0.0.0.0 --port 10000`.
    7.  Add Environment Variables from your `.env`.

### C. Database: Neon (or Render Postgres)
*   **AWS RDS** is free for 12 months, but **Neon** is serverless and free forever (up to a limit).
*   **Setup (Neon):**
    1.  Go to [Neon.tech](https://neon.tech).
    2.  Create a project -> Get the Connection String.
    3.  Update your `DATABASE_URL` in the Backend environment variables.

### D. File Storage: AWS S3 (Free Tier)
*   You are already set up for this!
*   AWS offers 5GB of standard storage for free for 12 months.

---

## 3. Domain Names

### Free Domains
*   **Subdomains:** Vercel (`.vercel.app`) and Render (`.onrender.com`) provide free HTTPS subdomains. This is usually enough for testing.
*   **Custom Free Domains:** Providers like Freenom (.tk, .ml) are currently unstable/unavailable. **I do not recommend them** for a serious project as you can lose the domain anytime.

### Cheap "Pro" Domains
If you want to look professional (e.g., `legalbooking.com`), you must buy a domain.
*   **Namecheap / Porkbun:** You can get domains like `.xyz` or `.online` for less than $2/year.
*   **Setup:** Once bought, go to Vercel Settings -> Domains -> Add your custom domain. Vercel handles the SSL (HTTPS) automatically for free.

---

## Summary of Free Stack
| Component | Service | Cost | Notes |
| :--- | :--- | :--- | :--- |
| **Frontend** | Vercel | Free | Includes SSL & CDN |
| **Backend** | Render / Railway | Free/Trial | Might spin down on free tier |
| **Database** | Neon / Supabase | Free | Postgres Serverless |
| **Storage** | AWS S3 | Free Tier | 5GB for 12 months |
| **CI/CD** | GitHub Actions | Free | Built-in |
