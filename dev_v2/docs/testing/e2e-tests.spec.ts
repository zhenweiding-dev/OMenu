/**
 * OMenu E2E Tests (Playwright)
 * 
 * 运行方式:
 *   npx playwright test
 *   npx playwright test --headed    # 可视化模式
 *   npx playwright test --debug     # 调试模式
 */

import { test, expect, Page } from '@playwright/test';

// ============================================
// 测试配置
// ============================================

test.describe.configure({ mode: 'serial' }); // 按顺序执行

// ============================================
// 辅助函数
// ============================================

async function waitForLoadingComplete(page: Page) {
  // 等待 loading 状态消失
  await page.waitForSelector('[data-testid="loading"]', { state: 'detached', timeout: 130000 });
}

async function navigateToCreateFlow(page: Page) {
  await page.goto('/');
  
  // 如果是空状态，点击 Create Menu
  const createButton = page.getByRole('button', { name: /create menu/i });
  if (await createButton.isVisible()) {
    await createButton.click();
  } else {
    // 如果有计划，通过 Menu Closed 进入
    await page.getByRole('button', { name: /grid/i }).click();
    await page.getByText('New Menu').click();
  }
}

// ============================================
// Menu Book 测试
// ============================================

test.describe('Menu Book', () => {
  
  test.describe('Empty State', () => {
    test('显示空状态 UI', async ({ page }) => {
      // 清除本地存储以确保空状态
      await page.goto('/');
      await page.evaluate(() => localStorage.clear());
      await page.reload();
      
      // 验证空状态元素
      await expect(page.getByText('No menu yet')).toBeVisible();
      await expect(page.getByText(/create your first/i)).toBeVisible();
      await expect(page.getByRole('button', { name: /create menu/i })).toBeVisible();
    });

    test('点击 Create Menu 进入创建流程', async ({ page }) => {
      await page.goto('/');
      await page.evaluate(() => localStorage.clear());
      await page.reload();
      
      await page.getByRole('button', { name: /create menu/i }).click();
      
      // 应该进入 Step 1
      await expect(page.getByText(/let's plan meals/i)).toBeVisible();
    });
  });

  test.describe('Menu Open (有计划)', () => {
    test.beforeEach(async ({ page }) => {
      // 设置 mock 计划数据
      await page.goto('/');
      await page.evaluate(() => {
        // 注入测试数据
        localStorage.setItem('omenu_app_state', JSON.stringify([/* mock data */]));
      });
      await page.reload();
    });

    test('显示 THIS WEEK 标题', async ({ page }) => {
      await expect(page.getByText('This Week')).toBeVisible();
    });

    test('显示日期范围', async ({ page }) => {
      await expect(page.getByText(/Jan.*–.*Feb/)).toBeVisible();
    });

    test('显示滑动指示器', async ({ page }) => {
      const dots = page.locator('.swipe-dot');
      await expect(dots).toHaveCount(7);
    });

    test('显示每日卡片', async ({ page }) => {
      await expect(page.locator('.daily-menu-card')).toBeVisible();
      // 默认显示的日期（如周一）
      await expect(page.getByText('Monday')).toBeVisible();
    });

    test('滑动切换日期', async ({ page }) => {
      // 初始显示周一
      await expect(page.getByText('Monday')).toBeVisible();
      
      // 模拟向左滑动
      const card = page.locator('.daily-menu-card');
      await card.evaluate((el) => {
        el.dispatchEvent(new TouchEvent('touchstart', {
          touches: [{ clientX: 300, clientY: 400 }] as any
        }));
        el.dispatchEvent(new TouchEvent('touchend', {
          changedTouches: [{ clientX: 50, clientY: 400 }] as any
        }));
      });
      
      // 应该切换到周二
      await expect(page.getByText('Tuesday')).toBeVisible();
    });

    test('点击网格按钮进入 Menu Closed', async ({ page }) => {
      await page.getByRole('button', { name: /grid/i }).click();
      
      await expect(page.getByText('My Menus')).toBeVisible();
    });
  });

  test.describe('Menu Closed', () => {
    test('显示所有菜单本', async ({ page }) => {
      await page.goto('/');
      await page.getByRole('button', { name: /grid/i }).click();
      
      const menuBooks = page.locator('.menu-book');
      await expect(menuBooks.first()).toBeVisible();
    });

    test('当前周有 THIS WEEK 标签', async ({ page }) => {
      await page.goto('/');
      await page.getByRole('button', { name: /grid/i }).click();
      
      await expect(page.locator('.menu-book.current')).toBeVisible();
      await expect(page.getByText('THIS WEEK')).toBeVisible();
    });

    test('点击返回回到 Menu Open', async ({ page }) => {
      await page.goto('/');
      await page.getByRole('button', { name: /grid/i }).click();
      await page.getByRole('button', { name: /back/i }).click();
      
      await expect(page.getByText('This Week')).toBeVisible();
    });

    test('点击 New Menu 进入创建流程', async ({ page }) => {
      await page.goto('/');
      await page.getByRole('button', { name: /grid/i }).click();
      await page.getByText('New Menu').click();
      
      await expect(page.getByText(/let's plan meals/i)).toBeVisible();
    });
  });
});

// ============================================
// Create Flow 测试
// ============================================

test.describe('Create Flow', () => {
  
  test('完整创建流程', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    
    // Step 1: Welcome
    await page.getByRole('button', { name: /create menu/i }).click();
    await expect(page.getByText(/let's plan meals/i)).toBeVisible();
    await page.getByRole('button', { name: /begin/i }).click();
    
    // Step 2: Keywords
    await expect(page.getByText('Cooking Style')).toBeVisible();
    await page.getByText('Quick').click();
    await page.getByText('Healthy').click();
    await page.getByText('Chinese').click();
    await page.getByRole('button', { name: /next/i }).click();
    
    // Step 3: Preferred
    await expect(page.getByText(/preferred/i)).toBeVisible();
    await page.getByText('Eggs').click();
    await page.getByText('Chicken').click();
    await page.getByRole('button', { name: /next/i }).click();
    
    // Step 4: Disliked
    await expect(page.getByText(/dislike/i)).toBeVisible();
    await page.getByText('Mushrooms').click();
    await page.getByRole('button', { name: /next/i }).click();
    
    // Step 5: Sentence
    await expect(page.getByText(/menu is for/i)).toBeVisible();
    await page.getByRole('button', { name: /next/i }).click();
    
    // Step 6: Schedule
    await expect(page.getByText('Choose meals')).toBeVisible();
    await page.getByText('Select All').click();
    await page.getByRole('button', { name: /generate plan/i }).click();
    
    // Step 7: Loading
    await expect(page.getByText(/generating/i)).toBeVisible();
    
    // Step 8: Plan Generated (等待完成，最多 2.5 分钟)
    await expect(page.getByText('Your New Menu')).toBeVisible({ timeout: 150000 });
  });

  test.describe('Step 2: Keywords', () => {
    test.beforeEach(async ({ page }) => {
      await navigateToCreateFlow(page);
      await page.getByRole('button', { name: /begin/i }).click();
    });

    test('标签选择切换', async ({ page }) => {
      const quickTag = page.getByText('Quick');
      
      // 初始未选中
      await expect(quickTag).not.toHaveClass(/selected/);
      
      // 点击选中
      await quickTag.click();
      await expect(quickTag).toHaveClass(/selected/);
      
      // 再次点击取消
      await quickTag.click();
      await expect(quickTag).not.toHaveClass(/selected/);
    });

    test('可选择多个标签', async ({ page }) => {
      await page.getByText('Quick').click();
      await page.getByText('Healthy').click();
      await page.getByText('Chinese').click();
      
      const selectedTags = page.locator('.tag.selected');
      await expect(selectedTags).toHaveCount(3);
    });

    test('添加自定义标签', async ({ page }) => {
      await page.getByText('Add').click();
      // 假设打开输入框
      await page.getByPlaceholder(/add/i).fill('Low Sugar');
      await page.keyboard.press('Enter');
      
      await expect(page.getByText('Low Sugar')).toBeVisible();
    });

    test('自定义标签不能超过 20 字符', async ({ page }) => {
      await page.getByText('Add').click();
      await page.getByPlaceholder(/add/i).fill('This is a very long tag name that exceeds limit');
      
      // 应该显示错误或截断
      const input = page.getByPlaceholder(/add/i);
      const value = await input.inputValue();
      expect(value.length).toBeLessThanOrEqual(20);
    });
  });

  test.describe('Step 5: Sentence Style', () => {
    test.beforeEach(async ({ page }) => {
      await navigateToCreateFlow(page);
      // 快速跳到 Step 5
      await page.getByRole('button', { name: /begin/i }).click();
      await page.getByRole('button', { name: /next/i }).click(); // Step 2
      await page.getByRole('button', { name: /next/i }).click(); // Step 3
      await page.getByRole('button', { name: /next/i }).click(); // Step 4
    });

    test('编辑人数', async ({ page }) => {
      const peopleValue = page.getByText('2');
      await peopleValue.click();
      
      // 点击 + 增加
      await page.getByRole('button', { name: '+' }).click();
      await expect(page.getByText('3')).toBeVisible();
    });

    test('人数范围限制', async ({ page }) => {
      const peopleValue = page.getByText('2');
      await peopleValue.click();
      
      // 尝试减到 0
      await page.getByRole('button', { name: '-' }).click();
      await page.getByRole('button', { name: '-' }).click();
      
      // 不应该低于 1
      await expect(page.getByText('1')).toBeVisible();
    });

    test('编辑预算', async ({ page }) => {
      const budgetValue = page.getByText('$100');
      await budgetValue.click();
      
      // 应该打开选择器
      await expect(page.getByText('$90')).toBeVisible();
      await expect(page.getByText('$110')).toBeVisible();
      
      // 选择新预算
      await page.getByText('$150').click();
      await expect(page.locator('.sentence-text')).toContainText('$150');
    });

    test('编辑难度', async ({ page }) => {
      const difficultyValue = page.getByText('medium');
      await difficultyValue.click();
      
      // 选择新难度
      await page.getByText('Easy').click();
      await expect(page.locator('.sentence-text')).toContainText('easy');
    });
  });

  test.describe('Step 6: Schedule Grid', () => {
    test.beforeEach(async ({ page }) => {
      await navigateToCreateFlow(page);
      // 快速跳到 Step 6
      for (let i = 0; i < 5; i++) {
        await page.getByRole('button', { name: /begin|next/i }).click();
      }
    });

    test('Select All 全选', async ({ page }) => {
      await page.getByText('Select All').click();
      
      const selectedCells = page.locator('.meal-cell.selected');
      await expect(selectedCells).toHaveCount(21);
    });

    test('Deselect All 全不选', async ({ page }) => {
      await page.getByText('Select All').click();
      await page.getByText('Deselect All').click();
      
      const selectedCells = page.locator('.meal-cell.selected');
      await expect(selectedCells).toHaveCount(0);
    });

    test('至少选择一餐才能继续', async ({ page }) => {
      await page.getByText('Deselect All').click();
      
      const generateButton = page.getByRole('button', { name: /generate/i });
      await expect(generateButton).toBeDisabled();
      
      // 选择一餐
      await page.locator('.meal-cell').first().click();
      await expect(generateButton).toBeEnabled();
    });
  });

  test.describe('Step 8: Plan Generated', () => {
    // 这个测试需要较长时间，因为要等待 API
    test.slow();
    
    test('显示双按钮', async ({ page }) => {
      // 假设已经生成了计划
      // ... 设置 mock 或等待真实生成
      
      await expect(page.getByText('💬 Modify')).toBeVisible();
      await expect(page.getByText('🛒 Shopping List')).toBeVisible();
    });

    test('Modify 打开输入框', async ({ page }) => {
      await page.getByText('💬 Modify').click();
      
      await expect(page.getByPlaceholder(/modification/i)).toBeVisible();
    });

    test('修改文本限制 200 字符', async ({ page }) => {
      await page.getByText('💬 Modify').click();
      
      const input = page.getByPlaceholder(/modification/i);
      await input.fill('a'.repeat(250));
      
      const value = await input.inputValue();
      expect(value.length).toBeLessThanOrEqual(200);
    });
  });
});

// ============================================
// Shopping List 测试
// ============================================

test.describe('Shopping List', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/shopping');
  });

  test('显示分类', async ({ page }) => {
    await expect(page.getByText('🥩 Proteins')).toBeVisible();
    await expect(page.getByText('🥬 Vegetables')).toBeVisible();
  });

  test('勾选项目', async ({ page }) => {
    const firstCheckbox = page.locator('.checkbox').first();
    
    // 初始未勾选
    await expect(firstCheckbox).not.toHaveClass(/checked/);
    
    // 点击勾选
    await firstCheckbox.click();
    await expect(firstCheckbox).toHaveClass(/checked/);
  });

  test('已勾选项显示删除线', async ({ page }) => {
    const firstItem = page.locator('.shopping-item').first();
    const checkbox = firstItem.locator('.checkbox');
    const itemName = firstItem.locator('.shopping-item-name');
    
    await checkbox.click();
    
    await expect(itemName).toHaveCSS('text-decoration-line', 'line-through');
  });

  test('添加项目', async ({ page }) => {
    await page.getByRole('button', { name: /add/i }).click();
    
    // 填写表单
    await page.getByPlaceholder(/name/i).fill('Avocado');
    await page.getByPlaceholder(/quantity/i).fill('3 count');
    await page.getByRole('button', { name: /save|add/i }).click();
    
    await expect(page.getByText('Avocado')).toBeVisible();
  });
});

// ============================================
// Recipe Detail 测试
// ============================================

test.describe('Recipe Detail Modal', () => {
  test('点击餐食打开 Modal', async ({ page }) => {
    await page.goto('/');
    
    // 点击一个餐食
    await page.locator('.meal-item').first().click();
    
    // Modal 应该出现
    await expect(page.getByRole('dialog')).toBeVisible();
  });

  test('显示食谱信息', async ({ page }) => {
    await page.goto('/');
    await page.locator('.meal-item').first().click();
    
    await expect(page.getByText('Ingredients')).toBeVisible();
    await expect(page.getByText('Instructions')).toBeVisible();
  });

  test('关闭 Modal', async ({ page }) => {
    await page.goto('/');
    await page.locator('.meal-item').first().click();
    
    await page.getByRole('button', { name: /close/i }).click();
    
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('删除餐食', async ({ page }) => {
    await page.goto('/');
    const mealName = await page.locator('.meal-name').first().textContent();
    
    await page.locator('.meal-item').first().click();
    await page.getByRole('button', { name: /delete/i }).click();
    
    // 确认删除
    await page.getByRole('button', { name: /confirm/i }).click();
    
    // Modal 关闭，餐食消失
    await expect(page.getByRole('dialog')).not.toBeVisible();
    await expect(page.getByText(mealName!)).not.toBeVisible();
  });
});

// ============================================
// 导航测试
// ============================================

test.describe('Navigation', () => {
  test('底部导航切换', async ({ page }) => {
    await page.goto('/');
    
    // 切换到 List
    await page.getByText('List').click();
    await expect(page).toHaveURL(/\/shopping/);
    
    // 切换到 Me
    await page.getByText('Me').click();
    await expect(page).toHaveURL(/\/me/);
    
    // 切换回 Plan
    await page.getByText('Plan').click();
    await expect(page).toHaveURL('/');
  });

  test('激活状态正确显示', async ({ page }) => {
    await page.goto('/');
    
    const planTab = page.locator('.nav-item').filter({ hasText: 'Plan' });
    await expect(planTab).toHaveClass(/active/);
    
    await page.goto('/shopping');
    const listTab = page.locator('.nav-item').filter({ hasText: 'List' });
    await expect(listTab).toHaveClass(/active/);
  });
});

// ============================================
// 错误处理测试
// ============================================

test.describe('Error Handling', () => {
  test('API 超时显示错误', async ({ page }) => {
    // 模拟超慢响应
    await page.route('**/api/menu-books/generate', async route => {
      await new Promise(r => setTimeout(r, 130000)); // 超过 2 分钟
      await route.fulfill({ json: {} });
    });
    
    await navigateToCreateFlow(page);
    // ... 完成创建流程直到 Step 7
    
    // 应该显示超时错误
    await expect(page.getByText(/taking longer/i)).toBeVisible({ timeout: 150000 });
    await expect(page.getByRole('button', { name: /retry/i })).toBeVisible();
  });

  test('网络错误显示提示', async ({ page }) => {
    await page.route('**/api/**', route => route.abort());
    
    // 尝试一个 API 操作
    await page.goto('/');
    // ... 触发 API 调用
    
    await expect(page.getByText(/network|connection/i)).toBeVisible();
  });
});

// ============================================
// 状态持久化测试
// ============================================

test.describe('State Persistence', () => {
  test('草稿自动保存', async ({ page }) => {
    await navigateToCreateFlow(page);
    await page.getByRole('button', { name: /begin/i }).click();
    
    // 选择一些标签
    await page.getByText('Quick').click();
    await page.getByText('Healthy').click();
    
    // 刷新页面
    await page.reload();
    
    // 应该恢复到之前的状态
    await expect(page.getByText('Quick')).toHaveClass(/selected/);
    await expect(page.getByText('Healthy')).toHaveClass(/selected/);
  });

  test('完成后清除草稿', async ({ page }) => {
    // 完成整个创建流程
    // ...
    
    // 检查 localStorage 是否清除
    const draft = await page.evaluate(() => 
      localStorage.getItem('omenu-draft')
    );
    expect(draft).toBeNull();
  });
});

// ============================================
// 可访问性测试
// ============================================

test.describe('Accessibility', () => {
  test('页面无 WCAG 违规', async ({ page }) => {
    await page.goto('/');
    
    // 使用 axe 检查可访问性
    // 需要安装 @axe-core/playwright
    // const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    // expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('键盘导航', async ({ page }) => {
    await page.goto('/');
    
    // Tab 键应该能遍历所有可交互元素
    await page.keyboard.press('Tab');
    const focused = page.locator(':focus');
    await expect(focused).toBeVisible();
  });
});

// ============================================
// 移动端测试
// ============================================

test.describe('Mobile', () => {
  test.use({ viewport: { width: 375, height: 812 } }); // iPhone X

  test('触摸滑动正常', async ({ page }) => {
    await page.goto('/');
    
    // 使用 touch 事件滑动
    const card = page.locator('.daily-menu-card');
    const box = await card.boundingBox();
    
    if (box) {
      await page.touchscreen.swipe(
        box.x + box.width - 50, box.y + box.height / 2,
        box.x + 50, box.y + box.height / 2,
        { steps: 10 }
      );
    }
    
    // 验证切换了日期
    // ...
  });

  test('底部导航在 safe area 内', async ({ page }) => {
    await page.goto('/');
    
    const nav = page.locator('.bottom-nav');
    const navBox = await nav.boundingBox();
    
    // 导航应该有底部 padding (safe area)
    expect(navBox?.height).toBeGreaterThan(60);
  });
});
