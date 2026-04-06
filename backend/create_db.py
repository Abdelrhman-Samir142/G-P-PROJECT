import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
import os
from dotenv import load_dotenv

load_dotenv()

def create_database():
    dbname = os.getenv('DB_NAME', 'refurbai_db')
    user = os.getenv('DB_USER', 'postgres')
    password = os.getenv('DB_PASSWORD', 'postgres')
    host = os.getenv('DB_HOST', 'localhost')
    port = os.getenv('DB_PORT', '5432')

    try:
        # Connect to default database
        conn = psycopg2.connect(
            user=user,
            password=password,
            host=host,
            port=port,
            database='postgres'
        )
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cur = conn.cursor()
        
        # Check if database exists
        cur.execute(f"SELECT 1 FROM pg_catalog.pg_database WHERE datname = %s", (dbname,))
        exists = cur.fetchone()
        
        if not exists:
            print(f"Creating database {dbname}...")
            cur.execute(f'CREATE DATABASE "{dbname}"')
        else:
            print(f"Database {dbname} already exists.")
            
        cur.close()
        conn.close()
    except Exception as e:
        print(f"Error creating database: {e}")

if __name__ == "__main__":
    create_database()
