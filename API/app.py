"""
OMenu v3 Demo Backend
简单的Flask服务器，连接Gemini API和前端
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
from dotenv import load_dotenv
import json
import os
from datetime import datetime, timedelta

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Configure Gemini API
genai.configure(api_key=os.getenv('GEMINI_API_KEY'))

# 存储session数据
sessions = {}

def call_gemini(prompt):
    """Call Gemini API and return response text"""
    try:
        model = genai.GenerativeModel('gemini-3-flash-preview')
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        raise Exception(f"Gemini API error: {str(e)}")

@app.route('/api/parse-preferences', methods=['POST'])
def parse_preferences():
    """
    解析用户偏好输入
    """
    try:
        data = request.json
        user_input = data.get('preferences', '')
        num_people = data.get('numPeople', 1)
        budget = data.get('budget', 100)
        cook_difficulty = data.get('cookDifficulty', 'easy')
        
        # 构建prompt
        prompt = f"""
用户提供的信息：
- 人数: {num_people}
- 周预算: ${budget}
- 烹饪难度偏好: {cook_difficulty}
- 用户输入: "{user_input}"

请解析这个用户偏好，并生成一个JSON格式的preferenceProfile，包含以下字段：
1. userMoods: 用户的饮食心情/偏好 (数组)
2. preferredRecipes: 喜欢的菜谱 (数组, 最多5个)
3. dietaryRestrictions: 饮食限制 (数组)
4. cuisine: 偏好的菜系 (数组)
5. budget: 预算信息
6. cookTimePerMeal: 每餐烹饪时间 (分钟)
7. nutritionFocus: 营养关注 (如balanced, high_protein等)

请返回纯JSON，不要其他文字。
"""
        
        result = call_gemini(prompt)
        
        # 尝试解析JSON
        try:
            preference_profile = json.loads(result)
        except:
            # 如果失败，返回原始结果
            preference_profile = {"raw_response": result}
        
        return jsonify({
            "success": True,
            "preferenceProfile": preference_profile
        })
    
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route('/api/generate-meal-plan', methods=['POST'])
def generate_meal_plan():
    """
    基于偏好生成周meal plan
    """
    try:
        data = request.json
        preferences = data.get('preferences', '')
        num_people = data.get('numPeople', 1)
        budget = data.get('budget', 100)
        difficulty = data.get('cookDifficulty', 'easy')
        
        # 构建prompt
        prompt = f"""
基于以下用户偏好，为{num_people}个人生成一份完整的7天meal plan。

用户偏好:
- 预算: ${budget}每周每人
- 烹饪难度: {difficulty}
- 特殊需求: {preferences}

请生成一个JSON格式的mealPlan，包含：
1. 周一到周日 (monday-sunday)
2. 每天早中晚三餐 (breakfast, lunch, dinner)
3. 每个meal包含:
   - recipeName: 菜名
   - ingredients: 食材列表(每个格式: "名称 数量 单位", 数组)
   - cookTime: 烹饪时间(分钟)
   - difficulty: 难度(easy/medium/hard)
   - totalCalories: 总卡路里数
   - description: 简短描述
   - estimatedCost: 估计成本($)

请只返回JSON，不要其他文字。
"""
        
        result = call_gemini(prompt)
        
        # 尝试解析JSON
        try:
            meal_plan = json.loads(result)
        except:
            meal_plan = {"raw_response": result}
        
        return jsonify({
            "success": True,
            "mealPlan": meal_plan
        })
    
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route('/api/generate-shopping-list', methods=['POST'])
def generate_shopping_list():
    """
    基于meal plan生成购物清单
    """
    try:
        data = request.json
        meal_plan = data.get('mealPlan', {})
        budget = data.get('budget', 100)
        
        # 构建prompt
        meal_plan_str = json.dumps(meal_plan, ensure_ascii=False)
        prompt = f"""
基于以下meal plan，生成一份详细的、按分类的购物清单。总预算: ${budget}

Meal Plan:
{meal_plan_str}

请生成一个JSON格式的shoppingList，包含以下9个分类:
1. proteins (蛋白质): 肉类、豆类等
2. vegetables (蔬菜)
3. fruits (水果)
4. grains (谷物)
5. dairy (乳制品)
6. oils_condiments (油和调料)
7. spices_seasonings (香料)
8. pantry_staples (常用食材)
9. others (其他)

每个分类下是一个数组，包含每个食材:
- name: 食材名称
- quantity: 数量
- unit: 单位
- estimatedPrice: 估计价格($)

请只返回JSON，不要其他文字。
"""
        
        result = call_gemini(prompt)
        
        try:
            shopping_list = json.loads(result)
        except:
            shopping_list = {"raw_response": result}
        
        return jsonify({
            "success": True,
            "shoppingList": shopping_list
        })
    
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route('/api/daily-timeline', methods=['POST'])
def daily_timeline():
    """
    生成当天的meal timeline
    """
    try:
        data = request.json
        meal_plan = data.get('mealPlan', {})
        target_date = data.get('date', 'monday')
        
        # 构建prompt
        meals_str = json.dumps(meal_plan.get(target_date, {}), ensure_ascii=False)
        prompt = f"""
基于{target_date}的以下meals，生成一个详细的每日timeline，精确到分钟：

Meals:
{meals_str}

请生成一个JSON格式的dailyTimeline对象，包含:
1. date: 日期
2. meals: 数组，包含每个meal的timeline项
3. 每个timeline项包含:
   - time: 时间(HH:MM格式)
   - task: 任务描述(e.g. "Prepare breakfast ingredients", "Cook breakfast")
   - duration: 持续时间(分钟)
   - meal: 属于哪个meal (breakfast/lunch/dinner)
   - status: 状态(upcoming/current/completed)

请只返回JSON，不要其他文字。
"""
        
        result = call_gemini(prompt)
        
        try:
            timeline = json.loads(result)
        except:
            timeline = {"raw_response": result}
        
        # 添加当前时间信息
        now = datetime.now()
        timeline["currentTime"] = now.strftime("%H:%M")
        
        return jsonify({
            "success": True,
            "dailyTimeline": timeline
        })
    
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route('/api/regenerate-recipe', methods=['POST'])
def regenerate_recipe():
    """
    重新生成单个菜谱
    """
    try:
        data = request.json
        current_recipe = data.get('currentRecipe', {})
        preferences = data.get('preferences', '')
        context_meals = data.get('contextMeals', [])
        
        # 构建prompt
        current_str = json.dumps(current_recipe, ensure_ascii=False)
        context_str = json.dumps(context_meals, ensure_ascii=False)
        
        prompt = f"""
请生成一个替代菜谱来替换当前菜谱。

当前菜谱: {current_str}

相邻日期的菜谱(需要避免重复): {context_str}

用户偏好: {preferences}

生成的新菜谱需要:
1. 不与context中的菜谱相同
2. 食材不超过50%重叠
3. 烹饪难度相似
4. 包含: recipeName, ingredients, cookTime, difficulty, totalCalories, description, estimatedCost

请只返回JSON格式的新菜谱，不要其他文字。
"""
        
        result = call_gemini(prompt)
        
        try:
            new_recipe = json.loads(result)
        except:
            new_recipe = {"raw_response": result}
        
        return jsonify({
            "success": True,
            "newRecipe": new_recipe
        })
    
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route('/health', methods=['GET'])
def health():
    """健康检查"""
    return jsonify({
        "status": "ok",
        "message": "OMenu API is running with Gemini AI",
        "version": "v3-live"
    })


if __name__ == '__main__':
    print("🍜 OMenu v3 Demo Backend Starting...")
    print("📡 API running on http://localhost:8080")
    print("🔗 Frontend: file:///Users/shu/Library/Mobile%20Documents/com~apple~CloudDocs/Programs/OMenu/prototype/demo.html")
    print("🤖 Using Gemini 1.5 Flash API for AI generation")
    print("\n✨ Ready for live testing with real AI!")
    app.run(debug=True, host='localhost', port=8080)
