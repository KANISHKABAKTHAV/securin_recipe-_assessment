# backend/main.py
from fastapi import FastAPI, Query, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import sqlite3
import json

app = FastAPI(title="Recipe API", description="API for Recipe Assessment")

class RecipeOut(BaseModel):
    id: int
    cuisine: Optional[str]
    title: Optional[str]
    rating: Optional[float]
    prep_time: Optional[int]
    cook_time: Optional[int]
    total_time: Optional[int]
    description: Optional[str]
    nutrients: Optional[dict]
    serves: Optional[str]

    class Config:
        orm_mode = True

def get_db():
    conn = sqlite3.connect('recipes.db')
    conn.row_factory = sqlite3.Row  # Allows accessing columns by name
    return conn

@app.get("/api/recipes")
def get_recipes(page: int = Query(1, ge=1), limit: int = Query(15, ge=1, le=50)):
    offset = (page - 1) * limit
    conn = get_db()
    cursor = conn.cursor()
    
    # Get total count
    cursor.execute("SELECT COUNT(*) FROM recipes")
    total = cursor.fetchone()[0]

    # Get paginated data
    cursor.execute('''
        SELECT * FROM recipes 
        ORDER BY rating DESC NULLS LAST 
        LIMIT ? OFFSET ?
    ''', (limit, offset))
    
    rows = cursor.fetchall()
    conn.close()

    recipes = []
    for row in rows:
        recipe = dict(row)
        if recipe['nutrients']:
            try:
                recipe['nutrients'] = json.loads(recipe['nutrients'])
            except json.JSONDecodeError:
                recipe['nutrients'] = None
        recipes.append(recipe)

    return {
        "page": page,
        "limit": limit,
        "total": total,
        "data": recipes
    }

@app.get("/api/recipes/search", response_model=List[RecipeOut])
def search_recipes(
    title: Optional[str] = None,
    cuisine: Optional[str] = None,
    min_rating: Optional[float] = None,
    max_rating: Optional[float] = None,
    max_total_time: Optional[int] = None,
    min_total_time: Optional[int] = None,
    calories: Optional[str] = None  # e.g., "<=400"
):
    conn = get_db()
    cursor = conn.cursor()
    
    query = "SELECT * FROM recipes WHERE 1=1"
    params = []

    if title:
        query += " AND title LIKE ?"
        params.append(f"%{title}%")
    if cuisine:
        query += " AND cuisine LIKE ?"
        params.append(f"%{cuisine}%")
    if min_rating is not None:
        query += " AND rating >= ?"
        params.append(min_rating)
    if max_rating is not None:
        query += " AND rating <= ?"
        params.append(max_rating)
    if min_total_time is not None:
        query += " AND total_time >= ?"
        params.append(min_total_time)
    if max_total_time is not None:
        query += " AND total_time <= ?"
        params.append(max_total_time)

    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()

    recipes = []
    for row in rows:
        recipe = dict(row)
        if recipe['nutrients']:
            try:
                nutrients = json.loads(recipe['nutrients'])
                if calories and nutrients.get("calories"):
                    cal_str = nutrients["calories"].replace("kcal", "").strip()
                    try:
                        cal_val = float(cal_str)
                        if "<=" in calories:
                            max_cal = float(calories.replace("<=", "").strip())
                            if cal_val > max_cal:
                                continue
                        elif ">=" in calories:
                            min_cal = float(calories.replace(">=", "").strip())
                            if cal_val < min_cal:
                                continue
                    except ValueError:
                        pass  # Skip if calories can't be parsed
                recipe['nutrients'] = nutrients
            except json.JSONDecodeError:
                recipe['nutrients'] = None
        recipes.append(recipe)

    return recipes