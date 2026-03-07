# 🚀 ISL Platform Production Deployment Guide

This guide covers deploying the ISL (Indian Sign Language) Learning Platform using **Render** for the frontend and **Railway** for the backend.

---

## 📋 Prerequisites

- [Railway Account](https://railway.app/) 
- [Render Account](https://render.com/)
- [GitHub Repository](https://github.com/) (for connecting to Render/Railway)

---

## 🖥️ Part 1: Deploy Backend on Railway

### Step 1: Prepare Backend for Railway

The backend is already configured with:
- [`railway.toml`](backend/railway.toml) - Railway configuration
- [`app/Dockerfile`](backend/app/Dockerfile) - Docker build file
- [`.env.production`](backend/.env.production) - Production environment variables

### Step 2: Deploy to Railway

1. **Log in to Railway** and create a new project
2. **Connect your GitHub** repository
3. **Select the backend folder** as the root directory:
   - Root Directory: `backend`
4. **Add Environment Variables** in Railway dashboard:
   
   | Variable | Value |
   |----------|-------|
   | `DEBUG` | `False` |
   | `SECRET_KEY` | Generate a strong random key |
   | `DATABASE_URL` | `sqlite:///./isl.db` |
   | `ALGORITHM` | `HS256` |
   | `ACCESS_TOKEN_EXPIRE_MINUTES` | `1440` |
   | `REFRESH_TOKEN_EXPIRE_DAYS` | `7` |

5. **Deploy** - Railway will build using the Dockerfile

### Step 3: Get Backend URL

After deployment, Railway will provide a URL like:
```
https://your-app-name.up.railway.app
```

Copy this URL (without trailing slash) - you'll need it for the frontend.

---

## 🌐 Part 2: Deploy Frontend on Render

### Step 1: Prepare Frontend

I've already configured:
- [`.env.production`](frontend/.env.production) - Production API URL
- [`nginx-frontend.conf`](frontend/nginx-frontend.conf) - Nginx configuration

### Step 2: Update API URL

Edit [`frontend/.env.production`](frontend/.env.production):
```env
REACT_APP_API_URL=https://your-railway-backend-url.up.railway.app/api
```

Replace `your-railway-backend-url.up.railway.app` with your actual Railway backend URL.

### Step 3: Deploy to Render

1. **Log in to Render** and create a new **Static Site**
2. **Connect your GitHub** repository
3. **Configure the build**:
   
   | Setting | Value |
   |---------|-------|
   | Branch | `main` |
   | Build Command | `npm run build` |
   | Publish Directory | `build` |

4. **Add Environment Variables**:
   
   | Variable | Value |
   |----------|-------|
   | `REACT_APP_API_URL` | `https://your-railway-backend-url.up.railway.app/api` |

5. **Deploy** - Render will build and deploy your frontend

---

## ✅ Verification

After deployment:

1. **Backend Health Check**:
   ```
   https://your-railway-backend.up.railway.app/api/health
   ```
   
2. **Frontend**: Visit your Render URL and test:
   - Login/Register
   - View lessons
   - Practice signs
   - Take quizzes

---

## 🔧 Troubleshooting

### CORS Issues
If frontend can't reach backend, ensure backend CORS allows all origins:
```python
# In backend/app/main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For production, specify your Render domain
    ...
)
```

### Database Issues on Railway
SQLite may not persist on Railway's free tier. Consider:
1. Using Railway's MySQL/PostgreSQL addon
2. Or accepting that data resets on container restart

### ML Model Issues
The ML model files need to be in the `backend/models/` folder. Ensure:
1. Model files exist locally
2. Dockerfile copies them properly

---

## 📝 Important Notes

1. **Database Persistence**: SQLite on Railway is ephemeral. Consider using Railway's MySQL/PostgreSQL addon for production.

2. **Environment Variables**: Never commit `.env.production` to version control.

3. **Security**: Update the `SECRET_KEY` in production to a strong random value.

4. **CORS**: Update CORS in `main.py` to restrict to your Render domain in production.
