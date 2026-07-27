import psycopg2

conn = psycopg2.connect("postgresql://postgres.erlgsozfvcybghjyrwnl:%40AP39rg8899@aws-1-ap-south-1.pooler.supabase.com:5432/postgres?sslmode=require")
cur = conn.cursor()

cur.execute("SELECT id, email, role, status, must_change_password FROM clinic_auth.users WHERE email = 'store@clinic.com'")
print("Before:", cur.fetchone())

cur.execute("UPDATE clinic_auth.users SET status = 'active' WHERE email = 'store@clinic.com'")
conn.commit()

cur.execute("SELECT id, email, role, status, must_change_password FROM clinic_auth.users WHERE email = 'store@clinic.com'")
print("After:", cur.fetchone())

# Also check reception account
cur.execute("SELECT id, email, role, status, must_change_password FROM clinic_auth.users WHERE email = 'reception@clinic.com'")
print("Reception:", cur.fetchone())

conn.close()
