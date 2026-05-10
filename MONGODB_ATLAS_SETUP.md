# MongoDB Atlas Setup Guide

## Why MongoDB Atlas?

- ✅ Free tier available (512MB storage)
- ✅ Cloud-hosted (accessible from anywhere)
- ✅ Automatic backups
- ✅ Better for production
- ✅ No local MongoDB installation needed

## Step-by-Step Setup

### 1. Create MongoDB Atlas Account

1. Visit: https://www.mongodb.com/cloud/atlas/register
2. Sign up with email or Google account
3. Verify your email

### 2. Create a Cluster

1. After login, click **Build a Database**
2. Choose **FREE** (M0 Sandbox)
3. Select **Cloud Provider**: AWS (recommended)
4. Select **Region**: Choose closest to your location (e.g., Mumbai for India)
5. **Cluster Name**: Leave default or name it (e.g., "ShriyashFoods")
6. Click **Create Cluster**
7. Wait 3-5 minutes for cluster creation

### 3. Create Database User

1. Click **Database Access** in left sidebar
2. Click **+ ADD NEW DATABASE USER**
3. Authentication Method: **Password**
4. Username: `shriyash_admin` (or your choice)
5. Password: Click **Autogenerate Secure Password** (SAVE THIS!)
6. Database User Privileges: **Read and write to any database**
7. Click **Add User**

### 4. Configure Network Access

1. Click **Network Access** in left sidebar
2. Click **+ ADD IP ADDRESS**
3. For Development:
   - Click **ALLOW ACCESS FROM ANYWHERE**
   - Click **Confirm**
4. For Production:
   - Add your server's specific IP address

### 5. Get Connection String

1. Click **Database** in left sidebar
2. Click **Connect** button on your cluster
3. Choose **Connect your application**
4. Driver: **Node.js**
5. Version: **4.1 or later**
6. Copy the connection string

Example:
```
mongodb+srv://shriyash_admin:<password>@cluster0.abc123.mongodb.net/?retryWrites=true&w=majority
```

### 6. Update .env File

Replace the connection string in `Ragnor/.env`:

```env
MONGO_URI=mongodb+srv://shriyash_admin:YOUR_PASSWORD@cluster0.abc123.mongodb.net/shriyash-foods?retryWrites=true&w=majority
```

**Important:**
- Replace `YOUR_PASSWORD` with your actual password
- Replace `cluster0.abc123` with your actual cluster address
- Add `/shriyash-foods` before the `?` to specify database name

### 7. Migrate Existing Data (Optional)

If you have data in local MongoDB:

#### Option A: Re-seed the database
```bash
cd Ragnor/server
node seed.js
```

#### Option B: Export/Import using MongoDB Compass
1. Download MongoDB Compass: https://www.mongodb.com/products/compass
2. Connect to local MongoDB
3. Export collections
4. Connect to Atlas
5. Import collections

### 8. Test Connection

1. Restart your server
2. Check server logs for "✅ MongoDB Connected"
3. If you see errors, check:
   - Password is correct (no special characters issues)
   - IP address is whitelisted
   - Connection string format is correct

## Connection String Format

```
mongodb+srv://<username>:<password>@<cluster-address>/<database-name>?retryWrites=true&w=majority
```

**Parts:**
- `<username>`: Your database user (e.g., shriyash_admin)
- `<password>`: Your database password
- `<cluster-address>`: Your cluster URL (e.g., cluster0.abc123.mongodb.net)
- `<database-name>`: Your database name (e.g., shriyash-foods)

## Common Issues & Solutions

### Issue 1: "Authentication failed"
**Solution:** Check username and password are correct

### Issue 2: "Connection timeout"
**Solution:** 
- Check if IP address is whitelisted
- Try "Allow Access from Anywhere"

### Issue 3: "Special characters in password"
**Solution:** URL encode special characters:
- `@` → `%40`
- `#` → `%23`
- `$` → `%24`
- `%` → `%25`

Or generate a new password without special characters

### Issue 4: "Database not found"
**Solution:** Add database name in connection string before `?`

## Security Best Practices

1. **Never commit .env file** to Git
2. **Use strong passwords** for database users
3. **Whitelist specific IPs** in production
4. **Enable 2FA** on your Atlas account
5. **Regular backups** (Atlas does this automatically)
6. **Monitor usage** in Atlas dashboard

## Free Tier Limits

- Storage: 512 MB
- RAM: Shared
- Connections: 500 max
- Backups: Not included (upgrade for backups)

Perfect for development and small production apps!

## Upgrading

When you need more:
1. Go to your cluster
2. Click **Upgrade**
3. Choose M10 or higher tier
4. Pricing starts at ~$0.08/hour (~$57/month)

## Support

- Documentation: https://docs.atlas.mongodb.com/
- Community: https://www.mongodb.com/community/forums/
- Support: https://support.mongodb.com/

## Next Steps

After setup:
1. ✅ Update MONGO_URI in .env
2. ✅ Restart server
3. ✅ Run seed.js to populate data
4. ✅ Test your application
5. ✅ Monitor Atlas dashboard
