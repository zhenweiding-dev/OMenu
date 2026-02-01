# OMenu 测试规范 (Test Specification)

## 概述

本文档定义了 OMenu 应用的测试策略和测试用例，用于验证 vibe coding 生成的代码是否符合设计规范。

### 测试框架推荐

| 类型 | 框架 | 用途 |
|------|------|------|
| 单元测试 | Vitest | 组件、工具函数、Store |
| 组件测试 | React Testing Library | UI 组件交互 |
| E2E 测试 | Playwright / Cypress | 完整用户流程 |
| API 测试 | Vitest + MSW | Mock API 响应 |

### 测试文件结构

```
frontend/
├── src/
│   ├── components/
│   │   └── __tests__/
│   ├── pages/
│   │   └── __tests__/
│   ├── stores/
│   │   └── __tests__/
│   ├── utils/
│   │   └── __tests__/
│   └── services/
│       └── __tests__/
├── e2e/
│   ├── menu-book.spec.ts
│   ├── create-flow.spec.ts
│   ├── shopping-list.spec.ts
│   └── fixtures/
└── vitest.config.ts
```

---

## 1. 状态管理测试 (Zustand Stores)

### 1.1 useDraftStore - 创建流程草稿

```typescript
// stores/__tests__/useDraftStore.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { useDraftStore } from '../useDraftStore';

describe('useDraftStore', () => {
  beforeEach(() => {
    useDraftStore.getState().resetDraft();
  });

  describe('初始状态', () => {
    it('应该有正确的初始值', () => {
      const state = useDraftStore.getState();
      expect(state.currentStep).toBe(1);
      expect(state.keywords).toEqual([]);
      expect(state.mustHaveItems).toEqual([]);
      expect(state.dislikedItems).toEqual([]);
      expect(state.numPeople).toBe(2);
      expect(state.budget).toBe(100);
      expect(state.difficulty).toBe('medium');
      expect(state.cookSchedule).toBeDefined();
    });
  });

  describe('setStep', () => {
    it('应该更新当前步骤', () => {
      useDraftStore.getState().setStep(3);
      expect(useDraftStore.getState().currentStep).toBe(3);
    });

    it('步骤范围应该在 1-8 之间', () => {
      useDraftStore.getState().setStep(0);
      expect(useDraftStore.getState().currentStep).toBeGreaterThanOrEqual(1);
      
      useDraftStore.getState().setStep(10);
      expect(useDraftStore.getState().currentStep).toBeLessThanOrEqual(8);
    });
  });

  describe('setKeywords', () => {
    it('应该设置关键词数组', () => {
      useDraftStore.getState().setKeywords(['Quick', 'Healthy', 'Chinese']);
      expect(useDraftStore.getState().keywords).toEqual(['Quick', 'Healthy', 'Chinese']);
    });

    it('应该允许空数组', () => {
      useDraftStore.getState().setKeywords(['Quick']);
      useDraftStore.getState().setKeywords([]);
      expect(useDraftStore.getState().keywords).toEqual([]);
    });
  });

  describe('addKeyword / removeKeyword', () => {
    it('应该添加新关键词', () => {
      useDraftStore.getState().addKeyword('Quick');
      useDraftStore.getState().addKeyword('Healthy');
      expect(useDraftStore.getState().keywords).toContain('Quick');
      expect(useDraftStore.getState().keywords).toContain('Healthy');
    });

    it('不应该添加重复关键词', () => {
      useDraftStore.getState().addKeyword('Quick');
      useDraftStore.getState().addKeyword('Quick');
      expect(useDraftStore.getState().keywords.filter(k => k === 'Quick')).toHaveLength(1);
    });

    it('应该移除指定关键词', () => {
      useDraftStore.getState().setKeywords(['Quick', 'Healthy']);
      useDraftStore.getState().removeKeyword('Quick');
      expect(useDraftStore.getState().keywords).toEqual(['Healthy']);
    });
  });

  describe('setNumPeople', () => {
    it('应该设置人数', () => {
      useDraftStore.getState().setNumPeople(4);
      expect(useDraftStore.getState().numPeople).toBe(4);
    });

    it('人数应该至少为 1', () => {
      useDraftStore.getState().setNumPeople(0);
      expect(useDraftStore.getState().numPeople).toBeGreaterThanOrEqual(1);
    });

    it('人数应该不超过 10', () => {
      useDraftStore.getState().setNumPeople(20);
      expect(useDraftStore.getState().numPeople).toBeLessThanOrEqual(10);
    });
  });

  describe('setBudget', () => {
    it('应该设置预算', () => {
      useDraftStore.getState().setBudget(150);
      expect(useDraftStore.getState().budget).toBe(150);
    });

    it('预算应该是 10 的倍数', () => {
      useDraftStore.getState().setBudget(155);
      const budget = useDraftStore.getState().budget;
      expect(budget % 10).toBe(0);
    });

    it('预算范围应该在 $50-$500 之间', () => {
      useDraftStore.getState().setBudget(30);
      expect(useDraftStore.getState().budget).toBeGreaterThanOrEqual(50);
      
      useDraftStore.getState().setBudget(1000);
      expect(useDraftStore.getState().budget).toBeLessThanOrEqual(500);
    });
  });

  describe('setDifficulty', () => {
    it('应该设置难度', () => {
      useDraftStore.getState().setDifficulty('easy');
      expect(useDraftStore.getState().difficulty).toBe('easy');
    });

    it('只接受有效的难度值', () => {
      const validDifficulties = ['easy', 'medium', 'hard'];
      validDifficulties.forEach(d => {
        useDraftStore.getState().setDifficulty(d as any);
        expect(useDraftStore.getState().difficulty).toBe(d);
      });
    });
  });

  describe('setCookSchedule', () => {
    it('应该设置烹饪计划', () => {
      const schedule = {
        monday: { breakfast: false, lunch: true, dinner: true },
        tuesday: { breakfast: false, lunch: true, dinner: true },
        wednesday: { breakfast: false, lunch: true, dinner: true },
        thursday: { breakfast: false, lunch: true, dinner: true },
        friday: { breakfast: false, lunch: true, dinner: true },
        saturday: { breakfast: true, lunch: true, dinner: true },
        sunday: { breakfast: true, lunch: true, dinner: false },
      };
      useDraftStore.getState().setCookSchedule(schedule);
      expect(useDraftStore.getState().cookSchedule).toEqual(schedule);
    });

    it('toggleMeal 应该切换单个餐的选择状态', () => {
      useDraftStore.getState().toggleMeal('monday', 'breakfast');
      const monday = useDraftStore.getState().cookSchedule.monday;
      expect(monday.breakfast).toBe(true);
      
      useDraftStore.getState().toggleMeal('monday', 'breakfast');
      expect(useDraftStore.getState().cookSchedule.monday.breakfast).toBe(false);
    });

    it('selectAllMeals 应该全选', () => {
      useDraftStore.getState().selectAllMeals();
      const schedule = useDraftStore.getState().cookSchedule;
      Object.values(schedule).forEach(day => {
        expect(day.breakfast).toBe(true);
        expect(day.lunch).toBe(true);
        expect(day.dinner).toBe(true);
      });
    });

    it('deselectAllMeals 应该全不选', () => {
      useDraftStore.getState().selectAllMeals();
      useDraftStore.getState().deselectAllMeals();
      const schedule = useDraftStore.getState().cookSchedule;
      Object.values(schedule).forEach(day => {
        expect(day.breakfast).toBe(false);
        expect(day.lunch).toBe(false);
        expect(day.dinner).toBe(false);
      });
    });
  });

  describe('getSelectedMealCount', () => {
    it('应该正确计算选中的餐数', () => {
      useDraftStore.getState().deselectAllMeals();
      expect(useDraftStore.getState().getSelectedMealCount()).toBe(0);
      
      useDraftStore.getState().toggleMeal('monday', 'lunch');
      useDraftStore.getState().toggleMeal('monday', 'dinner');
      expect(useDraftStore.getState().getSelectedMealCount()).toBe(2);
      
      useDraftStore.getState().selectAllMeals();
      expect(useDraftStore.getState().getSelectedMealCount()).toBe(21); // 7 days × 3 meals
    });
  });

  describe('resetDraft', () => {
    it('应该重置所有状态到初始值', () => {
      // 修改一些状态
      useDraftStore.getState().setStep(5);
      useDraftStore.getState().setKeywords(['Quick']);
      useDraftStore.getState().setNumPeople(4);
      
      // 重置
      useDraftStore.getState().resetDraft();
      
      // 验证
      const state = useDraftStore.getState();
      expect(state.currentStep).toBe(1);
      expect(state.keywords).toEqual([]);
      expect(state.numPeople).toBe(2);
    });
  });

  describe('持久化', () => {
    it('应该自动保存到 localStorage', () => {
      useDraftStore.getState().setKeywords(['Quick', 'Healthy']);
      
      // 检查 localStorage
      const stored = localStorage.getItem('omenu_meal_plan_draft');
      expect(stored).toBeTruthy();
      
      const parsed = JSON.parse(stored!);
      expect(parsed.state.keywords).toContain('Quick');
    });
  });
});
```

### 1.2 useMealPlanStore - 餐饮计划状态

```typescript
// stores/__tests__/useMealPlanStore.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { useMealPlanStore } from '../useMealPlanStore';

describe('useMealPlanStore', () => {
  beforeEach(() => {
    useMealPlanStore.getState().clearCurrentPlan();
  });

  describe('setCurrentPlan', () => {
    it('应该设置当前计划', () => {
      const mockPlan = createMockMealPlan();
      useMealPlanStore.getState().setCurrentPlan(mockPlan);
      expect(useMealPlanStore.getState().currentPlan).toEqual(mockPlan);
    });
  });

  describe('getMealsForDay', () => {
    it('应该返回指定日期的餐食', () => {
      const mockPlan = createMockMealPlan();
      useMealPlanStore.getState().setCurrentPlan(mockPlan);
      
      const mondayMeals = useMealPlanStore.getState().getMealsForDay('monday');
      expect(mondayMeals.breakfast).toBeDefined();
      expect(mondayMeals.lunch).toBeDefined();
      expect(mondayMeals.dinner).toBeDefined();
    });

    it('如果没有计划应该返回空对象', () => {
      const meals = useMealPlanStore.getState().getMealsForDay('monday');
      expect(meals).toEqual({});
    });
  });

  describe('getTotalCaloriesForDay', () => {
    it('应该正确计算一天的总卡路里', () => {
      const mockPlan = createMockMealPlan();
      useMealPlanStore.getState().setCurrentPlan(mockPlan);
      
      const calories = useMealPlanStore.getState().getTotalCaloriesForDay('monday');
      expect(calories).toBe(320 + 450 + 580); // 基于 mock 数据
    });
  });

  describe('getMealCount', () => {
    it('应该正确计算总餐数', () => {
      const mockPlan = createMockMealPlan();
      useMealPlanStore.getState().setCurrentPlan(mockPlan);
      
      const count = useMealPlanStore.getState().getMealCount();
      expect(count).toBeGreaterThan(0);
    });
  });
});

// 辅助函数
function createMockMealPlan() {
  return {
    id: 'test-plan-1',
    weekStartDate: '2025-01-27',
    weekEndDate: '2025-02-02',
    numPeople: 2,
    budget: 100,
    difficulty: 'medium',
    days: {
      monday: {
        breakfast: {
          id: 'meal-1',
          name: 'Scrambled Eggs with Tomato',
          cookTime: 15,
          servings: 2,
          calories: 320,
          ingredients: ['eggs', 'tomatoes'],
          instructions: ['Beat eggs', 'Cook'],
        },
        lunch: {
          id: 'meal-2',
          name: 'Chicken Caesar Salad',
          cookTime: 20,
          servings: 2,
          calories: 450,
          ingredients: ['chicken', 'lettuce'],
          instructions: ['Prepare salad'],
        },
        dinner: {
          id: 'meal-3',
          name: 'Beef Stir-fry with Rice',
          cookTime: 30,
          servings: 2,
          calories: 580,
          ingredients: ['beef', 'rice'],
          instructions: ['Cook rice', 'Stir-fry'],
        },
      },
      // ... 其他天
    },
    createdAt: new Date().toISOString(),
  };
}
```

### 1.3 useMenuBooksStore - 菜单本管理

```typescript
// stores/__tests__/useMenuBooksStore.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { useMenuBooksStore } from '../useMenuBooksStore';

describe('useMenuBooksStore', () => {
  beforeEach(() => {
    useMenuBooksStore.getState().clearAllMenuBooks();
  });

  describe('addMenuBook', () => {
    it('应该添加新的菜单本', () => {
      const menuBook = createMockMenuBook();
      useMenuBooksStore.getState().addMenuBook(menuBook);
      
      expect(useMenuBooksStore.getState().menuBooks).toHaveLength(1);
      expect(useMenuBooksStore.getState().menuBooks[0].id).toBe(menuBook.id);
    });

    it('新添加的菜单本应该成为当前周', () => {
      const menuBook = createMockMenuBook();
      useMenuBooksStore.getState().addMenuBook(menuBook);
      
      expect(useMenuBooksStore.getState().currentWeekId).toBe(menuBook.id);
    });
  });

  describe('getCurrentMenuBook', () => {
    it('应该返回当前周的菜单本', () => {
      const menuBook = createMockMenuBook();
      useMenuBooksStore.getState().addMenuBook(menuBook);
      
      const current = useMenuBooksStore.getState().getCurrentMenuBook();
      expect(current).toEqual(menuBook);
    });

    it('如果没有当前周应该返回 null', () => {
      const current = useMenuBooksStore.getState().getCurrentMenuBook();
      expect(current).toBeNull();
    });
  });

  describe('setCurrentWeek', () => {
    it('应该设置当前周', () => {
      const book1 = createMockMenuBook('book-1');
      const book2 = createMockMenuBook('book-2');
      
      useMenuBooksStore.getState().addMenuBook(book1);
      useMenuBooksStore.getState().addMenuBook(book2);
      useMenuBooksStore.getState().setCurrentWeek('book-1');
      
      expect(useMenuBooksStore.getState().currentWeekId).toBe('book-1');
    });
  });

  describe('deleteMenuBook', () => {
    it('应该删除指定的菜单本', () => {
      const book1 = createMockMenuBook('book-1');
      const book2 = createMockMenuBook('book-2');
      
      useMenuBooksStore.getState().addMenuBook(book1);
      useMenuBooksStore.getState().addMenuBook(book2);
      useMenuBooksStore.getState().deleteMenuBook('book-1');
      
      expect(useMenuBooksStore.getState().menuBooks).toHaveLength(1);
      expect(useMenuBooksStore.getState().menuBooks[0].id).toBe('book-2');
    });

    it('删除当前周应该自动选择另一个', () => {
      const book1 = createMockMenuBook('book-1');
      const book2 = createMockMenuBook('book-2');
      
      useMenuBooksStore.getState().addMenuBook(book1);
      useMenuBooksStore.getState().addMenuBook(book2);
      useMenuBooksStore.getState().setCurrentWeek('book-2');
      useMenuBooksStore.getState().deleteMenuBook('book-2');
      
      expect(useMenuBooksStore.getState().currentWeekId).toBe('book-1');
    });
  });
});

function createMockMenuBook(id = 'test-book-1') {
  return {
    id,
    weekStartDate: '2025-01-27',
    weekEndDate: '2025-02-02',
    mealPlan: createMockMealPlan(),
    createdAt: new Date().toISOString(),
  };
}
```

---

## 2. 组件测试 (React Components)

### 2.1 DailyMenuCard 组件

```typescript
// components/__tests__/DailyMenuCard.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DailyMenuCard } from '../DailyMenuCard';

describe('DailyMenuCard', () => {
  const mockDayData = {
    weekday: 'Monday',
    date: 'January 27',
    mealCount: 3,
    totalCalories: 1350,
    meals: {
      breakfast: { name: 'Scrambled Eggs', time: 15, servings: 2, calories: 320 },
      lunch: { name: 'Chicken Salad', time: 20, servings: 2, calories: 450 },
      dinner: { name: 'Beef Stir-fry', time: 30, servings: 2, calories: 580 },
    },
  };

  describe('渲染', () => {
    it('应该显示周几（大字）', () => {
      render(<DailyMenuCard {...mockDayData} />);
      const weekday = screen.getByText('Monday');
      expect(weekday).toBeInTheDocument();
      // 检查样式：24px, font-weight 700
    });

    it('应该显示日期（小字）', () => {
      render(<DailyMenuCard {...mockDayData} />);
      expect(screen.getByText('January 27')).toBeInTheDocument();
    });

    it('应该显示餐数统计', () => {
      render(<DailyMenuCard {...mockDayData} />);
      expect(screen.getByText(/3 meals/)).toBeInTheDocument();
    });

    it('应该显示总卡路里', () => {
      render(<DailyMenuCard {...mockDayData} />);
      expect(screen.getByText(/1,350 cal/)).toBeInTheDocument();
    });

    it('应该显示所有餐食', () => {
      render(<DailyMenuCard {...mockDayData} />);
      expect(screen.getByText('Scrambled Eggs')).toBeInTheDocument();
      expect(screen.getByText('Chicken Salad')).toBeInTheDocument();
      expect(screen.getByText('Beef Stir-fry')).toBeInTheDocument();
    });

    it('每个餐食应该显示类型标签', () => {
      render(<DailyMenuCard {...mockDayData} />);
      expect(screen.getByText('BREAKFAST')).toBeInTheDocument();
      expect(screen.getByText('LUNCH')).toBeInTheDocument();
      expect(screen.getByText('DINNER')).toBeInTheDocument();
    });

    it('应该显示添加餐食按钮', () => {
      render(<DailyMenuCard {...mockDayData} />);
      const addButton = screen.getByRole('button', { name: /add/i });
      expect(addButton).toBeInTheDocument();
    });
  });

  describe('空餐位', () => {
    it('应该显示空餐位提示', () => {
      const dataWithEmpty = {
        ...mockDayData,
        meals: {
          breakfast: null,
          lunch: mockDayData.meals.lunch,
          dinner: mockDayData.meals.dinner,
        },
      };
      render(<DailyMenuCard {...dataWithEmpty} />);
      expect(screen.getByText(/No breakfast/i)).toBeInTheDocument();
    });
  });

  describe('交互', () => {
    it('点击餐食应该触发 onMealClick', () => {
      const onMealClick = vi.fn();
      render(<DailyMenuCard {...mockDayData} onMealClick={onMealClick} />);
      
      fireEvent.click(screen.getByText('Scrambled Eggs'));
      expect(onMealClick).toHaveBeenCalledWith('breakfast', mockDayData.meals.breakfast);
    });

    it('点击添加按钮应该触发 onAddMeal', () => {
      const onAddMeal = vi.fn();
      render(<DailyMenuCard {...mockDayData} onAddMeal={onAddMeal} />);
      
      const addButton = screen.getByRole('button', { name: /add/i });
      fireEvent.click(addButton);
      expect(onAddMeal).toHaveBeenCalled();
    });
  });

  describe('样式验证', () => {
    it('卡片应该有正确的圆角 (20px)', () => {
      const { container } = render(<DailyMenuCard {...mockDayData} />);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveStyle({ borderRadius: '20px' });
    });

    it('餐食图标应该有正确的背景色', () => {
      render(<DailyMenuCard {...mockDayData} />);
      // breakfast: #FEF3E2
      // lunch: #E8F5E9
      // dinner: #EDE7F6
    });
  });
});
```

### 2.2 MenuBookCard 组件

```typescript
// components/__tests__/MenuBookCard.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MenuBookCard } from '../MenuBookCard';

describe('MenuBookCard', () => {
  const mockMenuBook = {
    id: 'book-1',
    dateRange: 'Jan 27 – Feb 2',
    mealCount: 18,
    budget: 100,
    foodEmojis: '🥚🥗🥩\n🍚🥦🍳',
    isCurrent: true,
  };

  describe('渲染', () => {
    it('应该显示日期范围', () => {
      render(<MenuBookCard {...mockMenuBook} />);
      expect(screen.getByText('Jan 27 – Feb 2')).toBeInTheDocument();
    });

    it('应该显示统计信息', () => {
      render(<MenuBookCard {...mockMenuBook} />);
      expect(screen.getByText(/18 meals/)).toBeInTheDocument();
      expect(screen.getByText(/\$100/)).toBeInTheDocument();
    });

    it('应该显示食物 emoji', () => {
      render(<MenuBookCard {...mockMenuBook} />);
      expect(screen.getByText(/🥚/)).toBeInTheDocument();
    });

    it('当前周应该显示 THIS WEEK 标签', () => {
      render(<MenuBookCard {...mockMenuBook} isCurrent={true} />);
      expect(screen.getByText('THIS WEEK')).toBeInTheDocument();
    });

    it('非当前周不应该显示 THIS WEEK 标签', () => {
      render(<MenuBookCard {...mockMenuBook} isCurrent={false} />);
      expect(screen.queryByText('THIS WEEK')).not.toBeInTheDocument();
    });
  });

  describe('交互', () => {
    it('点击应该触发 onClick', () => {
      const onClick = vi.fn();
      render(<MenuBookCard {...mockMenuBook} onClick={onClick} />);
      
      fireEvent.click(screen.getByText('Jan 27 – Feb 2'));
      expect(onClick).toHaveBeenCalledWith(mockMenuBook.id);
    });

    it('hover 应该有视觉反馈', () => {
      const { container } = render(<MenuBookCard {...mockMenuBook} />);
      const card = container.firstChild as HTMLElement;
      
      fireEvent.mouseEnter(card);
      // 检查 transform 或 shadow 变化
    });
  });
});

describe('AddNewMenuBookCard', () => {
  it('应该显示 + 图标和文字', () => {
    render(<AddNewMenuBookCard onClick={() => {}} />);
    expect(screen.getByText('New Menu')).toBeInTheDocument();
  });

  it('应该有虚线边框', () => {
    const { container } = render(<AddNewMenuBookCard onClick={() => {}} />);
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveStyle({ borderStyle: 'dashed' });
  });

  it('点击应该触发 onClick', () => {
    const onClick = vi.fn();
    render(<AddNewMenuBookCard onClick={onClick} />);
    
    fireEvent.click(screen.getByText('New Menu'));
    expect(onClick).toHaveBeenCalled();
  });
});
```

### 2.3 Tag 组件

```typescript
// components/__tests__/Tag.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Tag, AddTag } from '../Tag';

describe('Tag', () => {
  describe('未选中状态', () => {
    it('应该显示文本', () => {
      render(<Tag label="Quick" />);
      expect(screen.getByText('Quick')).toBeInTheDocument();
    });

    it('应该有透明背景和灰色边框', () => {
      const { container } = render(<Tag label="Quick" />);
      const tag = container.firstChild as HTMLElement;
      expect(tag).toHaveStyle({
        background: 'transparent',
        borderColor: '#D4D0C8',
      });
    });
  });

  describe('选中状态', () => {
    it('应该有高亮背景和边框', () => {
      const { container } = render(<Tag label="Quick" selected />);
      const tag = container.firstChild as HTMLElement;
      expect(tag).toHaveStyle({
        background: '#F0EBE3',
        borderColor: '#A68A64',
      });
    });

    it('文字应该是绿色', () => {
      render(<Tag label="Quick" selected />);
      const tag = screen.getByText('Quick');
      expect(tag).toHaveStyle({ color: '#8B9469' });
    });
  });

  describe('交互', () => {
    it('点击应该触发 onClick', () => {
      const onClick = vi.fn();
      render(<Tag label="Quick" onClick={onClick} />);
      
      fireEvent.click(screen.getByText('Quick'));
      expect(onClick).toHaveBeenCalledWith('Quick');
    });

    it('hover 应该改变边框颜色', () => {
      const { container } = render(<Tag label="Quick" />);
      const tag = container.firstChild as HTMLElement;
      
      fireEvent.mouseEnter(tag);
      expect(tag).toHaveStyle({ borderColor: '#A8AD8B' });
    });
  });
});

describe('AddTag', () => {
  it('应该显示 + 图标和 Add 文字', () => {
    render(<AddTag onClick={() => {}} />);
    expect(screen.getByText('Add')).toBeInTheDocument();
  });

  it('应该有虚线边框', () => {
    const { container } = render(<AddTag onClick={() => {}} />);
    const tag = container.firstChild as HTMLElement;
    expect(tag).toHaveStyle({ borderStyle: 'dashed' });
  });

  it('点击应该触发 onClick', () => {
    const onClick = vi.fn();
    render(<AddTag onClick={onClick} />);
    
    fireEvent.click(screen.getByText('Add'));
    expect(onClick).toHaveBeenCalled();
  });
});
```

### 2.4 BottomNav 组件

```typescript
// components/__tests__/BottomNav.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BottomNav } from '../BottomNav';

describe('BottomNav', () => {
  describe('渲染', () => {
    it('应该显示三个导航项', () => {
      render(<BottomNav activeTab="plan" />);
      expect(screen.getByText('Plan')).toBeInTheDocument();
      expect(screen.getByText('List')).toBeInTheDocument();
      expect(screen.getByText('Me')).toBeInTheDocument();
    });

    it('每个导航项应该有图标', () => {
      render(<BottomNav activeTab="plan" />);
      const svgs = document.querySelectorAll('svg');
      expect(svgs).toHaveLength(3);
    });
  });

  describe('激活状态', () => {
    it('Plan 激活时应该高亮', () => {
      render(<BottomNav activeTab="plan" />);
      const planTab = screen.getByText('Plan');
      expect(planTab).toHaveStyle({ color: '#8B9469' });
    });

    it('List 激活时应该高亮', () => {
      render(<BottomNav activeTab="list" />);
      const listTab = screen.getByText('List');
      expect(listTab).toHaveStyle({ color: '#8B9469' });
    });

    it('非激活项应该是灰色', () => {
      render(<BottomNav activeTab="plan" />);
      const listTab = screen.getByText('List');
      expect(listTab).toHaveStyle({ color: '#B5B5B5' });
    });
  });

  describe('交互', () => {
    it('点击应该触发 onTabChange', () => {
      const onTabChange = vi.fn();
      render(<BottomNav activeTab="plan" onTabChange={onTabChange} />);
      
      fireEvent.click(screen.getByText('List'));
      expect(onTabChange).toHaveBeenCalledWith('list');
    });
  });

  describe('图标', () => {
    it('Plan 应该使用 Book 图标', () => {
      render(<BottomNav activeTab="plan" />);
      // 验证 SVG path
    });

    it('List 应该使用 Checklist 图标', () => {
      render(<BottomNav activeTab="list" />);
      // 验证 SVG path
    });

    it('Me 应该使用 Person 图标', () => {
      render(<BottomNav activeTab="me" />);
      // 验证 SVG path
    });
  });
});
```

### 2.5 SwipeIndicator 组件

```typescript
// components/__tests__/SwipeIndicator.test.tsx
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { SwipeIndicator } from '../SwipeIndicator';

describe('SwipeIndicator', () => {
  it('应该显示 7 个点（代表一周）', () => {
    const { container } = render(<SwipeIndicator totalDays={7} activeIndex={0} />);
    const dots = container.querySelectorAll('.swipe-dot');
    expect(dots).toHaveLength(7);
  });

  it('激活的点应该有不同的样式', () => {
    const { container } = render(<SwipeIndicator totalDays={7} activeIndex={2} />);
    const dots = container.querySelectorAll('.swipe-dot');
    
    // 第三个点（index 2）应该是激活状态
    expect(dots[2]).toHaveClass('active');
    expect(dots[0]).not.toHaveClass('active');
  });

  it('激活的点应该更宽（16px）', () => {
    const { container } = render(<SwipeIndicator totalDays={7} activeIndex={0} />);
    const activeDot = container.querySelector('.swipe-dot.active');
    expect(activeDot).toHaveStyle({ width: '16px' });
  });

  it('非激活的点应该是圆形（5px）', () => {
    const { container } = render(<SwipeIndicator totalDays={7} activeIndex={0} />);
    const inactiveDots = container.querySelectorAll('.swipe-dot:not(.active)');
    inactiveDots.forEach(dot => {
      expect(dot).toHaveStyle({ width: '5px', height: '5px' });
    });
  });
});
```

---

## 3. 页面/流程测试

### 3.1 Create Flow 流程测试

```typescript
// pages/__tests__/CreateFlow.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { CreateFlow } from '../CreateFlow';

describe('CreateFlow', () => {
  const renderWithRouter = (initialRoute = '/create') => {
    return render(
      <MemoryRouter initialEntries={[initialRoute]}>
        <CreateFlow />
      </MemoryRouter>
    );
  };

  describe('Step 1: Welcome', () => {
    it('应该显示欢迎信息', () => {
      renderWithRouter();
      expect(screen.getByText(/Let's plan meals/i)).toBeInTheDocument();
    });

    it('应该有 Begin 按钮', () => {
      renderWithRouter();
      expect(screen.getByRole('button', { name: /begin/i })).toBeInTheDocument();
    });

    it('点击 Begin 应该进入 Step 2', async () => {
      renderWithRouter();
      fireEvent.click(screen.getByRole('button', { name: /begin/i }));
      
      await waitFor(() => {
        expect(screen.getByText(/keywords/i)).toBeInTheDocument();
      });
    });
  });

  describe('Step 2: Keywords', () => {
    beforeEach(async () => {
      renderWithRouter();
      fireEvent.click(screen.getByRole('button', { name: /begin/i }));
      await waitFor(() => screen.getByText(/keywords/i));
    });

    it('应该显示分类的标签', () => {
      expect(screen.getByText('Cooking Style')).toBeInTheDocument();
      expect(screen.getByText('Diet & Health')).toBeInTheDocument();
      expect(screen.getByText('Cuisine')).toBeInTheDocument();
    });

    it('点击标签应该切换选中状态', () => {
      const quickTag = screen.getByText('Quick');
      fireEvent.click(quickTag);
      expect(quickTag.parentElement).toHaveClass('selected');
      
      fireEvent.click(quickTag);
      expect(quickTag.parentElement).not.toHaveClass('selected');
    });

    it('可以选择多个标签', () => {
      fireEvent.click(screen.getByText('Quick'));
      fireEvent.click(screen.getByText('Healthy'));
      fireEvent.click(screen.getByText('Chinese'));
      
      // 验证状态
    });

    it('点击 Next 应该进入 Step 3', async () => {
      fireEvent.click(screen.getByRole('button', { name: /next/i }));
      await waitFor(() => {
        expect(screen.getByText(/must-have/i)).toBeInTheDocument();
      });
    });
  });

  describe('Step 5: Sentence Style', () => {
    // 导航到 Step 5
    beforeEach(async () => {
      // ... 导航逻辑
    });

    it('应该显示句子格式', () => {
      expect(screen.getByText(/meal plan is for/i)).toBeInTheDocument();
    });

    it('可编辑值应该是橙色', () => {
      const editableValues = document.querySelectorAll('.editable');
      editableValues.forEach(el => {
        expect(el).toHaveStyle({ color: '#D97706' });
      });
    });

    it('点击人数应该打开编辑器', async () => {
      const peopleValue = screen.getByText('2');
      fireEvent.click(peopleValue);
      
      await waitFor(() => {
        // 检查是否出现 +/- 按钮或选择器
      });
    });

    it('点击预算应该打开选择器', async () => {
      const budgetValue = screen.getByText('$100');
      fireEvent.click(budgetValue);
      
      await waitFor(() => {
        expect(screen.getByText('$90')).toBeInTheDocument();
        expect(screen.getByText('$110')).toBeInTheDocument();
      });
    });
  });

  describe('Step 6: Schedule Grid', () => {
    it('应该显示 7 天 x 3 餐的网格', () => {
      // 21 个 meal-cell
      const cells = document.querySelectorAll('.meal-cell');
      expect(cells).toHaveLength(21);
    });

    it('点击 cell 应该切换选中状态', () => {
      const firstCell = document.querySelector('.meal-cell');
      fireEvent.click(firstCell!);
      expect(firstCell).toHaveClass('selected');
    });

    it('Select All 应该全选', () => {
      fireEvent.click(screen.getByText('Select All'));
      const selectedCells = document.querySelectorAll('.meal-cell.selected');
      expect(selectedCells).toHaveLength(21);
    });

    it('Deselect All 应该全不选', () => {
      fireEvent.click(screen.getByText('Select All'));
      fireEvent.click(screen.getByText('Deselect All'));
      const selectedCells = document.querySelectorAll('.meal-cell.selected');
      expect(selectedCells).toHaveLength(0);
    });

    it('至少选择一餐才能继续', () => {
      fireEvent.click(screen.getByText('Deselect All'));
      const nextButton = screen.getByRole('button', { name: /generate/i });
      expect(nextButton).toBeDisabled();
    });
  });

  describe('Step 7: Loading', () => {
    it('应该显示加载动画', () => {
      expect(screen.getByText(/generating/i)).toBeInTheDocument();
    });

    it('应该显示计时器', () => {
      expect(screen.getByText(/0:00/)).toBeInTheDocument();
    });

    it('1 分钟后才能显示 Go to Home 按钮', async () => {
      // 初始不可见或禁用
      const homeButton = screen.queryByText('Go to Home');
      expect(homeButton).not.toBeInTheDocument(); // 或 toBeDisabled
      
      // 等待 1 分钟后...
      // await waitFor(() => {}, { timeout: 60000 });
    });

    it('2 分钟超时应该显示错误', async () => {
      // 模拟 2 分钟超时
      // expect(screen.getByText(/taking longer/i)).toBeInTheDocument();
    });
  });

  describe('Step 8: Plan Generated', () => {
    it('应该显示双按钮', () => {
      expect(screen.getByText('💬 Modify')).toBeInTheDocument();
      expect(screen.getByText('🛒 Shopping List')).toBeInTheDocument();
    });

    it('应该可以左右滑动查看不同日期', () => {
      // 模拟滑动手势
    });

    it('点击 Modify 应该打开输入框', async () => {
      fireEvent.click(screen.getByText('💬 Modify'));
      await waitFor(() => {
        expect(screen.getByPlaceholderText(/modification/i)).toBeInTheDocument();
      });
    });

    it('点击 Shopping List 应该进入 Step 10', async () => {
      fireEvent.click(screen.getByText('🛒 Shopping List'));
      await waitFor(() => {
        expect(screen.getByText(/generating.*shopping/i)).toBeInTheDocument();
      });
    });
  });
});
```

### 3.2 Home Page 测试

```typescript
// pages/__tests__/HomePage.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { HomePage } from '../HomePage';

describe('HomePage', () => {
  describe('空状态', () => {
    it('没有计划时应该显示空状态', () => {
      render(<HomePage />);
      expect(screen.getByText(/No menu yet/i)).toBeInTheDocument();
    });

    it('空状态应该有 Create Menu 按钮', () => {
      render(<HomePage />);
      expect(screen.getByRole('button', { name: /create menu/i })).toBeInTheDocument();
    });
  });

  describe('Menu Open (有计划)', () => {
    beforeEach(() => {
      // 设置 mock 计划
    });

    it('应该显示 THIS WEEK 标题', () => {
      render(<HomePage />);
      expect(screen.getByText('This Week')).toBeInTheDocument();
    });

    it('应该显示日期范围', () => {
      render(<HomePage />);
      expect(screen.getByText(/Jan 27.*Feb 2/)).toBeInTheDocument();
    });

    it('应该显示滑动指示器', () => {
      render(<HomePage />);
      const dots = document.querySelectorAll('.swipe-dot');
      expect(dots).toHaveLength(7);
    });

    it('应该显示每日卡片', () => {
      render(<HomePage />);
      expect(screen.getByText('Monday')).toBeInTheDocument();
    });

    it('点击网格按钮应该进入 Menu Closed', async () => {
      render(<HomePage />);
      const gridButton = screen.getByRole('button', { name: /grid/i });
      fireEvent.click(gridButton);
      
      // 验证进入 Menu Closed 视图
      expect(screen.getByText('My Menus')).toBeInTheDocument();
    });
  });

  describe('Menu Closed', () => {
    it('应该显示所有菜单本', () => {
      // 设置多个菜单本
      render(<HomePage viewMode="closed" />);
      
      expect(document.querySelectorAll('.menu-book').length).toBeGreaterThan(0);
    });

    it('当前周应该有 THIS WEEK 标签', () => {
      render(<HomePage viewMode="closed" />);
      expect(screen.getByText('THIS WEEK')).toBeInTheDocument();
    });

    it('应该有 New Menu 卡片', () => {
      render(<HomePage viewMode="closed" />);
      expect(screen.getByText('New Menu')).toBeInTheDocument();
    });

    it('点击返回应该回到 Menu Open', () => {
      render(<HomePage viewMode="closed" />);
      fireEvent.click(screen.getByRole('button', { name: /back/i }));
      
      expect(screen.queryByText('My Menus')).not.toBeInTheDocument();
    });

    it('点击菜单本应该打开该周', () => {
      // ...
    });

    it('点击 New Menu 应该进入创建流程', () => {
      // ...
    });
  });
});
```

---

## 4. API 服务测试

```typescript
// services/__tests__/api.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { api } from '../api';

// Mock Server
const server = setupServer(
  http.post('/api/meal-plans/generate', () => {
    return HttpResponse.json({
      id: 'plan-1',
      days: { /* mock data */ },
    });
  }),
  
  http.post('/api/meal-plans/:id/modify', () => {
    return HttpResponse.json({
      id: 'plan-1',
      days: { /* modified data */ },
    });
  }),
  
  http.post('/api/shopping-lists/generate', () => {
    return HttpResponse.json({
      id: 'list-1',
      categories: { /* mock data */ },
    });
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('API Service', () => {
  describe('generateMealPlan', () => {
    it('应该发送正确的请求参数', async () => {
      const params = {
        keywords: ['Quick', 'Healthy'],
        mustHaveItems: ['Eggs'],
        dislikedItems: ['Mushrooms'],
        numPeople: 2,
        budget: 100,
        difficulty: 'medium',
        cookSchedule: { /* ... */ },
      };

      const result = await api.generateMealPlan(params);
      
      expect(result).toBeDefined();
      expect(result.id).toBe('plan-1');
    });

    it('超时应该抛出错误', async () => {
      server.use(
        http.post('/api/meal-plans/generate', async () => {
          await new Promise(resolve => setTimeout(resolve, 150000)); // 超过 2 分钟
          return HttpResponse.json({});
        })
      );

      await expect(api.generateMealPlan({})).rejects.toThrow(/timeout/i);
    });

    it('API 错误应该正确处理', async () => {
      server.use(
        http.post('/api/meal-plans/generate', () => {
          return HttpResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
          );
        })
      );

      await expect(api.generateMealPlan({})).rejects.toThrow();
    });
  });

  describe('modifyMealPlan', () => {
    it('应该发送修改请求', async () => {
      const result = await api.modifyMealPlan('plan-1', 'Add more vegetables');
      expect(result).toBeDefined();
    });

    it('修改文本不能超过 200 字符', async () => {
      const longText = 'a'.repeat(201);
      await expect(api.modifyMealPlan('plan-1', longText)).rejects.toThrow(/200/);
    });
  });

  describe('generateShoppingList', () => {
    it('应该基于计划生成购物清单', async () => {
      const result = await api.generateShoppingList('plan-1');
      expect(result).toBeDefined();
      expect(result.categories).toBeDefined();
    });
  });
});
```

---

## 5. E2E 测试 (Playwright)

```typescript
// e2e/complete-flow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('OMenu Complete Flow', () => {
  
  test('新用户完整创建流程', async ({ page }) => {
    // 1. 访问首页，看到空状态
    await page.goto('/');
    await expect(page.getByText('No menu yet')).toBeVisible();
    
    // 2. 点击 Create Menu
    await page.getByRole('button', { name: 'Create Menu' }).click();
    
    // 3. Step 1: Welcome - 点击 Begin
    await expect(page.getByText(/Let's plan meals/)).toBeVisible();
    await page.getByRole('button', { name: 'Begin' }).click();
    
    // 4. Step 2: Keywords - 选择一些标签
    await expect(page.getByText('Cooking Style')).toBeVisible();
    await page.getByText('Quick').click();
    await page.getByText('Healthy').click();
    await page.getByText('Chinese').click();
    await page.getByRole('button', { name: 'Next' }).click();
    
    // 5. Step 3: Must-Have - 选择必须项
    await expect(page.getByText(/must-have/i)).toBeVisible();
    await page.getByText('Eggs').click();
    await page.getByText('Chicken').click();
    await page.getByRole('button', { name: 'Next' }).click();
    
    // 6. Step 4: Disliked - 选择不喜欢的
    await expect(page.getByText(/dislike/i)).toBeVisible();
    await page.getByText('Mushrooms').click();
    await page.getByRole('button', { name: 'Next' }).click();
    
    // 7. Step 5: Sentence - 设置人数和预算
    await expect(page.getByText(/meal plan is for/i)).toBeVisible();
    // 保持默认值或修改
    await page.getByRole('button', { name: 'Next' }).click();
    
    // 8. Step 6: Schedule - 选择餐食
    await expect(page.getByText('Choose meals')).toBeVisible();
    await page.getByText('Select All').click();
    await page.getByRole('button', { name: 'Generate Plan' }).click();
    
    // 9. Step 7: Loading
    await expect(page.getByText(/generating/i)).toBeVisible();
    
    // 10. Step 8: Plan Generated (等待完成)
    await expect(page.getByText('Your New Menu')).toBeVisible({ timeout: 130000 });
    await expect(page.getByText('Monday')).toBeVisible();
    
    // 11. 点击 Shopping List
    await page.getByText('🛒 Shopping List').click();
    
    // 12. 等待购物清单生成
    await expect(page.getByText('Shopping List')).toBeVisible({ timeout: 130000 });
    await expect(page.getByText('Proteins')).toBeVisible();
  });

  test('切换 Menu Open / Menu Closed', async ({ page }) => {
    // 假设已有计划
    await page.goto('/');
    
    // 点击网格按钮
    await page.getByRole('button', { name: /grid/i }).click();
    
    // 验证进入 Menu Closed
    await expect(page.getByText('My Menus')).toBeVisible();
    await expect(page.getByText('THIS WEEK')).toBeVisible();
    
    // 点击返回
    await page.getByRole('button', { name: /back/i }).click();
    
    // 验证回到 Menu Open
    await expect(page.getByText('This Week')).toBeVisible();
  });

  test('滑动切换日期', async ({ page }) => {
    await page.goto('/');
    
    // 验证初始在周一
    await expect(page.getByText('Monday')).toBeVisible();
    
    // 模拟向左滑动
    await page.locator('.daily-menu-card').swipe('left');
    
    // 验证切换到周二
    await expect(page.getByText('Tuesday')).toBeVisible();
  });

  test('购物清单勾选功能', async ({ page }) => {
    await page.goto('/shopping');
    
    // 找到一个未勾选的项
    const item = page.locator('.shopping-item').first();
    const checkbox = item.locator('.checkbox');
    
    // 验证初始未勾选
    await expect(checkbox).not.toHaveClass('checked');
    
    // 点击勾选
    await checkbox.click();
    
    // 验证已勾选
    await expect(checkbox).toHaveClass('checked');
    
    // 再次点击取消
    await checkbox.click();
    await expect(checkbox).not.toHaveClass('checked');
  });

  test('查看食谱详情', async ({ page }) => {
    await page.goto('/');
    
    // 点击一个餐食
    await page.getByText('Scrambled Eggs').click();
    
    // 验证弹出 Modal
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText('Ingredients')).toBeVisible();
    await expect(page.getByText('Instructions')).toBeVisible();
    
    // 关闭 Modal
    await page.getByRole('button', { name: /close/i }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('修改计划流程', async ({ page }) => {
    await page.goto('/');
    
    // 进入生成完成的计划页面
    // ... 假设已有计划
    
    // 点击 Modify
    await page.getByText('💬 Modify').click();
    
    // 输入修改内容
    await page.getByPlaceholder(/modification/i).fill('Add more vegetables');
    await page.getByRole('button', { name: /submit/i }).click();
    
    // 验证进入加载状态
    await expect(page.getByText(/generating/i)).toBeVisible();
  });
});
```

---

## 6. 边界情况测试

```typescript
// __tests__/edge-cases.test.ts
import { describe, it, expect } from 'vitest';

describe('Edge Cases', () => {
  describe('空数据处理', () => {
    it('没有餐食的日期应该正确显示', () => {
      // 所有餐都为 null 的情况
    });

    it('关键词为空应该可以继续', () => {
      // keywords: []
    });

    it('购物清单为空应该显示提示', () => {
      // 
    });
  });

  describe('网络错误', () => {
    it('网络断开时应该显示错误信息', () => {
      // 模拟网络错误
    });

    it('API 超时应该允许重试', () => {
      // 
    });

    it('部分加载失败应该优雅降级', () => {
      // 
    });
  });

  describe('输入验证', () => {
    it('自定义标签不能超过 20 字符', () => {
      // 
    });

    it('修改文本不能超过 200 字符', () => {
      // 
    });

    it('预算必须是有效数字', () => {
      // 
    });
  });

  describe('状态恢复', () => {
    it('刷新页面应该恢复草稿', () => {
      // localStorage 持久化
    });

    it('创建流程中途退出应该保存进度', () => {
      // 
    });

    it('删除草稿应该清空 localStorage', () => {
      // 
    });
  });

  describe('并发操作', () => {
    it('快速多次点击不应该重复提交', () => {
      // 防抖/节流
    });

    it('同时修改多个标签状态应该正确同步', () => {
      // 
    });
  });

  describe('长内容', () => {
    it('很长的食谱名应该正确截断', () => {
      // text-overflow: ellipsis
    });

    it('很多食材应该可滚动显示', () => {
      // 
    });
  });
});
```

---

## 7. 可访问性测试

```typescript
// __tests__/accessibility.test.ts
import { describe, it, expect } from 'vitest';
import { axe } from 'vitest-axe';
import { render } from '@testing-library/react';

describe('Accessibility', () => {
  it('HomePage 应该没有可访问性问题', async () => {
    const { container } = render(<HomePage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('所有按钮应该有 accessible name', () => {
    const { getAllByRole } = render(<HomePage />);
    const buttons = getAllByRole('button');
    buttons.forEach(button => {
      expect(button).toHaveAccessibleName();
    });
  });

  it('颜色对比度应该符合 WCAG AA', () => {
    // 文字颜色 #2C2C2C 在背景 #FAF9F7 上
    // 对比度应该 >= 4.5:1
  });

  it('可聚焦元素应该有可见的 focus 状态', () => {
    // 
  });

  it('图标按钮应该有 aria-label', () => {
    const { getAllByRole } = render(<BottomNav />);
    const buttons = getAllByRole('button');
    buttons.forEach(button => {
      expect(button).toHaveAttribute('aria-label');
    });
  });
});
```

---

## 8. 测试配置文件

### vitest.config.ts

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 70,
        statements: 80,
      },
    },
  },
});
```

### test/setup.ts

```typescript
// src/test/setup.ts
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeAll, afterAll } from 'vitest';

// 每个测试后清理
afterEach(() => {
  cleanup();
  localStorage.clear();
});

// Mock IntersectionObserver
beforeAll(() => {
  global.IntersectionObserver = class IntersectionObserver {
    constructor() {}
    observe() {}
    unobserve() {}
    disconnect() {}
  } as any;
});

// Mock matchMedia
beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => {},
    }),
  });
});
```

### playwright.config.ts

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
```

---

## 9. 测试检查清单

### 提交前检查

- [ ] 所有单元测试通过
- [ ] 所有组件测试通过
- [ ] E2E 测试通过
- [ ] 覆盖率 >= 80%
- [ ] 无可访问性错误
- [ ] 无 TypeScript 错误

### 功能检查清单

**Menu Book**
- [ ] Menu Open 正确显示每日卡片
- [ ] Menu Closed 正确显示菜单本网格
- [ ] THIS WEEK 标签正确显示
- [ ] 滑动切换日期正常
- [ ] 空状态正确显示

**Create Flow**
- [ ] Step 1 Welcome 动画正常
- [ ] Step 2-4 标签选择正常
- [ ] Step 5 句子编辑正常
- [ ] Step 6 网格选择正常
- [ ] Step 7 加载动画和计时器正常
- [ ] Step 8 双按钮显示正常
- [ ] 草稿自动保存/恢复正常

**Shopping List**
- [ ] 分类显示正确
- [ ] 勾选状态正确
- [ ] 添加项目正常

**Recipe Detail**
- [ ] Modal 打开/关闭正常
- [ ] 内容显示完整
- [ ] 删除功能正常

**导航**
- [ ] 底部导航切换正常
- [ ] 返回按钮正常
- [ ] 路由切换正常
