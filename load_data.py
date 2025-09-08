# backend/load_data.py
import sqlite3
import json

conn = sqlite3.connect('recipes.db')
cursor = conn.cursor()

cursor.execute('''
    CREATE TABLE IF NOT EXISTS recipes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        cuisine TEXT,
        title TEXT,
        rating REAL,
        prep_time INTEGER,
        cook_time INTEGER,
        total_time INTEGER,
        description TEXT,
        nutrients TEXT,
        serves TEXT
    )
''')

def clean_number(value):
    if value is None or value == "NaN" or (isinstance(value, str) and value.lower() == "nan"):
        return None
    try:
        return float(value) if '.' in str(value) else int(value)
    except (ValueError, TypeError):
        return None

with open('US_recipes_null.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

count = 0
for key, recipe in data.items():
    cursor.execute('''
        INSERT INTO recipes (cuisine, title, rating, prep_time, cook_time, total_time, description, nutrients, serves)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        recipe.get("cuisine"),
        recipe.get("title"),
        clean_number(recipe.get("rating")),
        clean_number(recipe.get("prep_time")),
        clean_number(recipe.get("cook_time")),
        clean_number(recipe.get("total_time")),
        recipe.get("description"),
        json.dumps(recipe.get("nutrients")) if recipe.get("nutrients") else None,
        recipe.get("serves")
    ))
    count += 1

conn.commit()
conn.close()

print(f"Successfully inserted {count} recipes into SQLite database!")