import os
import psycopg2
import redis
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv

load_dotenv()

def get_db_connection():
    try:
        connection = psycopg2.connect(
            host=os.getenv("DB_HOST"),
            user=os.getenv("DB_USER"),
            password=os.getenv("DB_PASSWORD"),
            dbname=os.getenv("DB_NAME"),
            sslmode=os.getenv("DB_SSL_MODE", "require")
        )
        return connection
    except psycopg2.Error as err:
        print(f"Error connecting to PostgreSQL: {err}")
        raise err

def get_redis_connection():
    try:
        r = redis.Redis(
            host=os.getenv("REDIS_HOST", "localhost"),
            port=int(os.getenv("REDIS_PORT", 6379)),
            password=os.getenv("REDIS_PASSWORD", None),
            ssl=True if os.getenv("REDIS_PASSWORD") else False # Azure usually requires SSL
        )
        return r
    except Exception as e:
        print(f"Error connecting to Redis: {e}")
        return None
