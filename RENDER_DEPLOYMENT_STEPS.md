# Deploy to Render - Step-by-Step Guide

## Prerequisites
- ✅ GitHub account (you have this)
- ✅ Repository: `ingrptr-lt/termchat-lt` (you have this)
- ✅ Render account (free: https://render.com - sign up if needed)

---

## STEP 1: Create Render Account (if needed)

1. Go to **https://render.com**
2. Click **"Sign up"**
3. Choose **"Sign up with GitHub"**
4. Authorize Render to access your GitHub account
5. Verify email
6. Done! ✅

---

## STEP 2: Create New Web Service

1. Log in to Render Dashboard: **https://dashboard.render.com**
2. Click **"+ New"** button (top right)
3. Select **"Web Service"**
4. Choose **"Build and deploy from a Git repository"**

---

## STEP 3: Connect Your GitHub Repository

1. In **"Connect a repository"** section:
   - Search for: `termchat-lt`
   - Click on **`ingrptr-lt/termchat-lt`**
   - Click **"Connect"** button

2. If prompted for GitHub permissions:
   - Click **"Authorize"**
   - Render will get access to your repo

---

## STEP 4: Configure Deployment Settings

Fill in these fields:

### Basic Settings:
```
Name:                  termchat-lt
Environment:           Python 3
Region:                USA (Oregon) [or closest to you]
Branch:                main
Root Directory:        (leave empty)
```

### Build & Deploy:

**Build Command:**
```bash
pip install -r requirements.txt
```

**Start Command:**
```bash
python mqtt_service.py
```

### Advanced Settings:
- Auto-deploy: ✅ Yes (automatically deploy on GitHub push)
- Health Check Path: / (optional)

---

## STEP 5: Environment Variables (if needed)

Click **"Advanced"** section, then **"Add Environment Variable"**

| Key | Value | Notes |
|-----|-------|-------|
| `MQTT_HOST` | `broker.emqx.io` | (optional - already in code) |
| `MQTT_PORT` | `8084` | (optional - already in code) |

*Most configs are already in your code, so you may not need these*

---

## STEP 6: Review & Deploy

1. Scroll to bottom
2. Click **"Create Web Service"** (blue button)
3. Render will:
   - Install Python dependencies from `requirements.txt`
   - Run `python mqtt_service.py`
   - Start serving your app
   
⏳ **First deployment takes 3-5 minutes**

---

## STEP 7: Monitor Deployment

1. You'll see a deployment log in real-time
2. Look for:
   ```
   ✓ Build successful
   ✓ Server listening on 0.0.0.0:10000
   ```

3. When done, you'll see:
   ```
   ✓ Deploy successful
   ```

4. Your app URL will appear at top:
   ```
   https://termchat-lt.onrender.com
   ```

---

## STEP 8: Access Your App

1. Copy your Render URL (e.g., `https://termchat-lt.onrender.com`)
2. Open in browser
3. You should see your TermChat LT interface
4. Check browser console (F12) for MQTT connection status

---

## Verification Checklist

After deployment, verify:

### ✅ In Browser:
- [ ] Page loads (no 404 errors)
- [ ] Terminal interface displays
- [ ] Console shows: `[DIAG] Window.mqtt = LOADED`
- [ ] MQTT connection message appears

### ✅ In Render Dashboard:
- [ ] Status: "Live"
- [ ] No deployment errors
- [ ] mqtt.min.js served (check Network tab in DevTools)

### ✅ MQTT Connection:
- [ ] Message: "Connecting to MQTT broker..."
- [ ] Message: "✅ Connected to TermOS LT Multiverse!"
- [ ] Can type messages and they appear

---

## If Deployment Fails

### Check these in order:

**1. Check Render Logs:**
- Go to Render Dashboard
- Click on your service
- Scroll to "Logs"
- Look for error messages

**2. Common Issues:**

| Error | Solution |
|-------|----------|
| `requirements.txt not found` | File must be in root directory (it is) |
| `mqtt_service.py not found` | File must be in root directory (it is) |
| `ModuleNotFoundError: mqtt` | Add `paho-mqtt` to requirements.txt |
| `mqtt.min.js 404` | Browser can't find file, check Network tab |
| Connection timeout | Broker unavailable, check firewall |

**3. Fix & Redeploy:**
- Make changes locally
- Push to GitHub: `git push origin main`
- Render auto-redeploys (if auto-deploy enabled)
- Monitor logs in dashboard

---

## MQTT Connection Troubleshooting

### If MQTT won't connect:

**Check browser console (F12):**
```
[DIAG] Initializing MQTT.js Client...
[DIAG] Window.mqtt = LOADED
```

If it says `MISSING`:
1. Hard refresh page: `Ctrl+Shift+R`
2. Check Network tab - mqtt.min.js should be loaded
3. If 404: File isn't being served by Render

**Test MQTT library locally:**
```bash
curl https://your-app.onrender.com/mqtt.min.js | head -c 100
```

Should output JavaScript code (not HTML error)

---

## Auto-Deployment (GitHub → Render)

Once connected, Render automatically deploys when you:

```bash
git push origin main
```

You'll see:
1. GitHub notification (push received)
2. Render dashboard shows "Deploying..."
3. Logs update in real-time
4. App restarts with new code

No manual action needed! 🚀

---

## Useful Render Dashboard Features

- **Logs** - See real-time server output
- **Metrics** - CPU, RAM, disk usage
- **Environment** - Edit variables without redeploy
- **Settings** - Change start command, environment, etc.
- **Deploys** - See deployment history

---

## Next Steps

After successful deployment:

1. **Share URL:** `https://termchat-lt.onrender.com`
2. **Test Features:** Try chat, apps, games
3. **Monitor Logs:** Watch for errors/warnings
4. **Update Code:** Push to GitHub, auto-deploys

---

## Support

If you need help:

1. Check Render logs first
2. Check browser console (F12)
3. Verify `mqtt.min.js` file exists in GitHub repo
4. Re-push to GitHub to trigger redeploy

**Key Point:** Everything you need is in your GitHub repo now. Render just needs to pull it and run it!

Good luck! 🚀
