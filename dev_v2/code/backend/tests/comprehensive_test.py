#!/usr/bin/env python3
"""
Comprehensive API Test Suite for OMenu Backend

Tests multiple scenarios with different Gemini models.
Outputs detailed MD report with prompts, responses, and processing steps.
"""

import json
import asyncio
import time
import re
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, List, Optional
import sys

# Add parent to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from google import genai
from google.genai import types

from app.config import get_settings
from app.services.prompts import (
    multi_day_prompt,
    modification_prompt,
    shopping_list_prompt,
    format_preferences_for_gemini,
    get_scheduled_days,
    get_day_meals,
)


# =============================================================================
# Configuration
# =============================================================================

# Models to test
MODELS = [
    "gemini-2.0-flash",
    "gemini-1.5-flash",
]

# Test scenarios
SCENARIOS = {
    "健康减脂用户": {
        "description": "5-day plan, health-focused, weight loss",
        "preferences": {
            "keywords": ["健康", "低卡", "高蛋白", "减脂"],
            "mustHaveItems": ["鸡胸肉", "西兰花", "鸡蛋"],
            "dislikedItems": ["油炸食品", "甜食"],
            "numPeople": 1,
            "budget": 80,
            "difficulty": "easy",
            "cookSchedule": {
                "monday": {"breakfast": True, "lunch": True, "dinner": True},
                "tuesday": {"breakfast": True, "lunch": True, "dinner": True},
                "wednesday": {"breakfast": False, "lunch": True, "dinner": True},
                "thursday": {"breakfast": False, "lunch": True, "dinner": True},
                "friday": {"breakfast": False, "lunch": True, "dinner": True},
                "saturday": {"breakfast": False, "lunch": False, "dinner": False},
                "sunday": {"breakfast": False, "lunch": False, "dinner": False},
            }
        }
    },
    "中式家庭餐": {
        "description": "2-day plan, Chinese family meals",
        "preferences": {
            "keywords": ["中式", "家常菜", "营养均衡"],
            "mustHaveItems": ["米饭", "豆腐", "猪肉"],
            "dislikedItems": ["内脏"],
            "numPeople": 4,
            "budget": 150,
            "difficulty": "medium",
            "cookSchedule": {
                "monday": {"breakfast": False, "lunch": False, "dinner": False},
                "tuesday": {"breakfast": False, "lunch": False, "dinner": False},
                "wednesday": {"breakfast": False, "lunch": False, "dinner": False},
                "thursday": {"breakfast": False, "lunch": False, "dinner": False},
                "friday": {"breakfast": False, "lunch": False, "dinner": False},
                "saturday": {"breakfast": True, "lunch": True, "dinner": True},
                "sunday": {"breakfast": True, "lunch": True, "dinner": True},
            }
        }
    },
    "素食主义者": {
        "description": "7-day full vegetarian plan",
        "preferences": {
            "keywords": ["素食", "纯素", "植物蛋白"],
            "mustHaveItems": ["豆腐", "蔬菜", "坚果"],
            "dislikedItems": ["肉类", "海鲜", "蛋", "奶制品"],
            "numPeople": 2,
            "budget": 120,
            "difficulty": "medium",
            "cookSchedule": {
                "monday": {"breakfast": True, "lunch": True, "dinner": True},
                "tuesday": {"breakfast": True, "lunch": True, "dinner": True},
                "wednesday": {"breakfast": True, "lunch": True, "dinner": True},
                "thursday": {"breakfast": True, "lunch": True, "dinner": True},
                "friday": {"breakfast": True, "lunch": True, "dinner": True},
                "saturday": {"breakfast": True, "lunch": True, "dinner": True},
                "sunday": {"breakfast": True, "lunch": True, "dinner": True},
            }
        }
    },
}

# Output directory
OUTPUT_DIR = Path(__file__).parent / "reports"


# =============================================================================
# Test Runner
# =============================================================================

class TestRunner:
    """Runs comprehensive tests and generates MD reports."""
    
    def __init__(self):
        settings = get_settings()
        self.client = genai.Client(api_key=settings.gemini_api_key)
        self.generation_config = types.GenerateContentConfig(
            temperature=0.7,
            top_p=0.95,
            top_k=40,
            max_output_tokens=16384,
        )
        self.results: List[Dict] = []
        
    def _clean_json_response(self, text: str) -> str:
        """Clean Gemini response to extract pure JSON."""
        text = re.sub(r"```json\s*", "", text)
        text = re.sub(r"```\s*", "", text)
        return text.strip()
    
    def _parse_json_response(self, text: str) -> Dict[str, Any]:
        """Parse JSON from Gemini response."""
        cleaned = self._clean_json_response(text)
        return json.loads(cleaned)
    
    def _count_recipes(self, data: Dict) -> int:
        """Count non-null recipes in response."""
        count = 0
        for day_data in data.values():
            if isinstance(day_data, dict):
                for meal in ["breakfast", "lunch", "dinner"]:
                    if day_data.get(meal) is not None:
                        count += 1
        return count
    
    def _validate_recipe(self, recipe: Dict, day: str, meal: str) -> Dict:
        """Validate recipe and return issues found."""
        issues = []
        
        if not recipe.get("name"):
            issues.append("missing name")
        if not recipe.get("ingredients"):
            issues.append("missing ingredients")
        if not recipe.get("instructions"):
            issues.append("missing instructions")
        if recipe.get("estimatedTime") is None:
            issues.append("missing estimatedTime")
        if recipe.get("totalCalories") is None:
            issues.append("missing totalCalories")
            
        return {
            "day": day,
            "meal": meal,
            "name": recipe.get("name", "N/A"),
            "has_issues": len(issues) > 0,
            "issues": issues,
        }
    
    async def run_single_test(
        self, 
        model: str, 
        scenario_name: str, 
        preferences: Dict
    ) -> Dict:
        """Run a single test and capture all details."""
        result = {
            "model": model,
            "scenario": scenario_name,
            "timestamp": datetime.now().isoformat(),
            "preferences": preferences,
            "prompt": None,
            "raw_response": None,
            "cleaned_response": None,
            "parsed_data": None,
            "processing_steps": [],
            "validation_results": [],
            "recipe_count": 0,
            "expected_count": 0,
            "success": False,
            "error": None,
            "duration_seconds": 0,
        }
        
        start_time = time.time()
        
        try:
            # Step 1: Build prompt
            result["processing_steps"].append("Step 1: Building prompt...")
            
            scheduled_days = get_scheduled_days(preferences)
            days_meals = {}
            expected_count = 0
            for day in scheduled_days:
                meals = get_day_meals(preferences, day)
                days_meals[day] = meals
                expected_count += len(meals)
            
            result["expected_count"] = expected_count
            result["processing_steps"].append(
                f"  - Scheduled days: {scheduled_days}"
            )
            result["processing_steps"].append(
                f"  - Expected recipes: {expected_count}"
            )
            
            prompt = multi_day_prompt(days_meals, preferences, None)
            result["prompt"] = prompt
            result["processing_steps"].append(
                f"  - Prompt length: {len(prompt)} chars"
            )
            
            # Step 2: Call Gemini API
            result["processing_steps"].append(f"Step 2: Calling {model}...")
            
            response = await asyncio.wait_for(
                self.client.aio.models.generate_content(
                    model=model,
                    contents=prompt,
                    config=self.generation_config,
                ),
                timeout=120
            )
            
            raw_text = response.text
            result["raw_response"] = raw_text
            result["processing_steps"].append(
                f"  - Response length: {len(raw_text)} chars"
            )
            
            # Step 3: Clean response
            result["processing_steps"].append("Step 3: Cleaning response...")
            cleaned = self._clean_json_response(raw_text)
            result["cleaned_response"] = cleaned
            result["processing_steps"].append(
                f"  - Cleaned length: {len(cleaned)} chars"
            )
            
            # Step 4: Parse JSON
            result["processing_steps"].append("Step 4: Parsing JSON...")
            parsed = self._parse_json_response(raw_text)
            result["parsed_data"] = parsed
            result["processing_steps"].append("  - JSON parsed successfully")
            
            # Step 5: Validate recipes
            result["processing_steps"].append("Step 5: Validating recipes...")
            recipe_count = 0
            for day in ["monday", "tuesday", "wednesday", "thursday", 
                       "friday", "saturday", "sunday"]:
                day_data = parsed.get(day, {})
                for meal in ["breakfast", "lunch", "dinner"]:
                    recipe = day_data.get(meal)
                    if recipe is not None:
                        recipe_count += 1
                        validation = self._validate_recipe(recipe, day, meal)
                        result["validation_results"].append(validation)
            
            result["recipe_count"] = recipe_count
            result["processing_steps"].append(
                f"  - Found {recipe_count}/{expected_count} recipes"
            )
            
            # Check success
            issues_count = sum(
                1 for v in result["validation_results"] if v["has_issues"]
            )
            result["success"] = (
                recipe_count == expected_count and issues_count == 0
            )
            result["processing_steps"].append(
                f"  - Validation issues: {issues_count}"
            )
            
        except asyncio.TimeoutError:
            result["error"] = "Timeout after 120 seconds"
            result["processing_steps"].append(f"ERROR: {result['error']}")
        except json.JSONDecodeError as e:
            result["error"] = f"JSON parse error: {str(e)}"
            result["processing_steps"].append(f"ERROR: {result['error']}")
        except Exception as e:
            result["error"] = str(e)
            result["processing_steps"].append(f"ERROR: {result['error']}")
        
        result["duration_seconds"] = round(time.time() - start_time, 2)
        result["processing_steps"].append(
            f"Completed in {result['duration_seconds']}s"
        )
        
        return result
    
    def generate_md_report(self, result: Dict) -> str:
        """Generate markdown report for a single test."""
        lines = []
        
        # Header
        lines.append(f"# Test Report: {result['scenario']}")
        lines.append("")
        lines.append(f"**Model**: `{result['model']}`")
        lines.append(f"**Timestamp**: {result['timestamp']}")
        lines.append(f"**Duration**: {result['duration_seconds']}s")
        lines.append(f"**Status**: {'✅ PASSED' if result['success'] else '❌ FAILED'}")
        if result['error']:
            lines.append(f"**Error**: {result['error']}")
        lines.append("")
        
        # Summary
        lines.append("## Summary")
        lines.append("")
        lines.append(f"- Expected recipes: {result['expected_count']}")
        lines.append(f"- Generated recipes: {result['recipe_count']}")
        issues = [v for v in result['validation_results'] if v['has_issues']]
        lines.append(f"- Validation issues: {len(issues)}")
        lines.append("")
        
        # Preferences
        lines.append("## User Preferences")
        lines.append("")
        lines.append("```json")
        lines.append(json.dumps(result['preferences'], indent=2, ensure_ascii=False))
        lines.append("```")
        lines.append("")
        
        # Prompt
        lines.append("## Prompt Sent to Gemini")
        lines.append("")
        lines.append("```")
        lines.append(result['prompt'] or "N/A")
        lines.append("```")
        lines.append("")
        
        # Raw Response
        lines.append("## Raw Response from Gemini")
        lines.append("")
        lines.append("```json")
        raw = result['raw_response'] or "N/A"
        # Truncate if too long
        if len(raw) > 10000:
            lines.append(raw[:10000])
            lines.append(f"\n... (truncated, total {len(raw)} chars)")
        else:
            lines.append(raw)
        lines.append("```")
        lines.append("")
        
        # Processing Steps
        lines.append("## Processing Steps")
        lines.append("")
        for step in result['processing_steps']:
            lines.append(f"- {step}")
        lines.append("")
        
        # Validation Results
        lines.append("## Validation Results")
        lines.append("")
        if result['validation_results']:
            lines.append("| Day | Meal | Recipe Name | Status | Issues |")
            lines.append("|-----|------|-------------|--------|--------|")
            for v in result['validation_results']:
                status = "❌" if v['has_issues'] else "✅"
                issues_str = ", ".join(v['issues']) if v['issues'] else "-"
                lines.append(
                    f"| {v['day']} | {v['meal']} | {v['name'][:30]} | {status} | {issues_str} |"
                )
        else:
            lines.append("No recipes to validate.")
        lines.append("")
        
        # Final Parsed Data (pretty print)
        lines.append("## Final Parsed Data")
        lines.append("")
        if result['parsed_data']:
            lines.append("```json")
            lines.append(json.dumps(result['parsed_data'], indent=2, ensure_ascii=False))
            lines.append("```")
        else:
            lines.append("No data parsed.")
        lines.append("")
        
        return "\n".join(lines)
    
    def generate_summary_report(self, all_results: List[Dict]) -> str:
        """Generate summary report for all tests."""
        lines = []
        
        lines.append("# OMenu Backend Comprehensive Test Report")
        lines.append("")
        lines.append(f"**Generated**: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        lines.append("")
        
        # Overall Summary
        total = len(all_results)
        passed = sum(1 for r in all_results if r['success'])
        lines.append("## Overall Summary")
        lines.append("")
        lines.append(f"- **Total Tests**: {total}")
        lines.append(f"- **Passed**: {passed}")
        lines.append(f"- **Failed**: {total - passed}")
        lines.append(f"- **Pass Rate**: {passed/total*100:.1f}%")
        lines.append("")
        
        # Results by Model
        lines.append("## Results by Model")
        lines.append("")
        for model in MODELS:
            model_results = [r for r in all_results if r['model'] == model]
            model_passed = sum(1 for r in model_results if r['success'])
            lines.append(f"### {model}")
            lines.append("")
            lines.append(f"- Pass: {model_passed}/{len(model_results)}")
            avg_time = sum(r['duration_seconds'] for r in model_results) / len(model_results)
            lines.append(f"- Average time: {avg_time:.1f}s")
            lines.append("")
        
        # Results Table
        lines.append("## Detailed Results")
        lines.append("")
        lines.append("| Model | Scenario | Recipes | Time | Status |")
        lines.append("|-------|----------|---------|------|--------|")
        for r in all_results:
            status = "✅" if r['success'] else "❌"
            lines.append(
                f"| {r['model']} | {r['scenario']} | "
                f"{r['recipe_count']}/{r['expected_count']} | "
                f"{r['duration_seconds']}s | {status} |"
            )
        lines.append("")
        
        # Links to individual reports
        lines.append("## Individual Test Reports")
        lines.append("")
        for r in all_results:
            filename = f"{r['model'].replace('.', '_')}_{r['scenario']}.md"
            status = "✅" if r['success'] else "❌"
            lines.append(f"- {status} [{r['model']} - {r['scenario']}]({filename})")
        lines.append("")
        
        return "\n".join(lines)
    
    async def run_all_tests(self):
        """Run all tests and generate reports."""
        print("=" * 60)
        print("OMenu Backend Comprehensive Test Suite")
        print("=" * 60)
        print()
        
        # Ensure output directory exists
        OUTPUT_DIR.mkdir(exist_ok=True)
        
        all_results = []
        
        for model in MODELS:
            print(f"\n{'='*40}")
            print(f"Testing Model: {model}")
            print(f"{'='*40}")
            
            for scenario_name, scenario_data in SCENARIOS.items():
                print(f"\n  Scenario: {scenario_name}")
                print(f"  Description: {scenario_data['description']}")
                
                result = await self.run_single_test(
                    model, 
                    scenario_name, 
                    scenario_data['preferences']
                )
                all_results.append(result)
                
                status = "✅ PASSED" if result['success'] else "❌ FAILED"
                print(f"  Result: {status} ({result['duration_seconds']}s)")
                print(f"  Recipes: {result['recipe_count']}/{result['expected_count']}")
                
                if result['error']:
                    print(f"  Error: {result['error']}")
                
                # Save individual report
                filename = f"{model.replace('.', '_')}_{scenario_name}.md"
                report_path = OUTPUT_DIR / filename
                report_content = self.generate_md_report(result)
                report_path.write_text(report_content, encoding='utf-8')
                print(f"  Report: {filename}")
        
        # Generate summary report
        summary = self.generate_summary_report(all_results)
        summary_path = OUTPUT_DIR / "SUMMARY.md"
        summary_path.write_text(summary, encoding='utf-8')
        print(f"\n{'='*60}")
        print(f"Summary report saved to: {summary_path}")
        print(f"{'='*60}")
        
        return all_results


async def main():
    runner = TestRunner()
    results = await runner.run_all_tests()
    
    # Print final summary
    print("\n" + "=" * 60)
    print("FINAL SUMMARY")
    print("=" * 60)
    
    passed = sum(1 for r in results if r['success'])
    total = len(results)
    print(f"Total: {total}, Passed: {passed}, Failed: {total - passed}")
    print(f"Pass Rate: {passed/total*100:.1f}%")
    
    # Exit code
    return 0 if passed == total else 1


if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)
