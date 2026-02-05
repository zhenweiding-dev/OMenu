/**
 * MSW (Mock Service Worker) Handlers
 * 用于测试时模拟 API 请求
 */

import { http, HttpResponse, delay } from 'msw';
import { 
  mockMenuBook, 
  mockShoppingList, 
  mockApiResponses 
} from './test-mocks';

// API Base URL
const API_BASE = '/api';

// ============================================
// 正常响应 Handlers
// ============================================

export const successHandlers = [
  // 生成餐饮计划
  http.post(`${API_BASE}/menu-books/generate`, async ({ request }) => {
    // 模拟正常延迟
    await delay(1000);
    
    const body = await request.json();
    
    // 基于请求参数生成响应
    const plan = {
      ...mockMenuBook,
      id: `plan-${Date.now()}`,
      numPeople: body.numPeople || 2,
      budget: body.budget || 100,
      difficulty: body.difficulty || 'medium',
      keywords: body.keywords || [],
      preferredItems: body.preferredItems || [],
      dislikedItems: body.dislikedItems || [],
      createdAt: new Date().toISOString(),
    };
    
    return HttpResponse.json(plan);
  }),

  // 修改餐饮计划
  http.post(`${API_BASE}/menu-books/:id/modify`, async ({ params, request }) => {
    await delay(800);
    
    const body = await request.json();
    const modificationText = body.modification || '';
    
    // 验证修改文本长度
    if (modificationText.length > 200) {
      return HttpResponse.json(
        { error: 'Modification text cannot exceed 200 characters' },
        { status: 400 }
      );
    }
    
    const modifiedPlan = {
      ...mockMenuBook,
      id: params.id,
      updatedAt: new Date().toISOString(),
      // 模拟一些修改（实际会根据 AI 响应变化）
    };
    
    return HttpResponse.json(modifiedPlan);
  }),

  // 生成购物清单
  http.post(`${API_BASE}/shopping-lists/generate`, async ({ request }) => {
    await delay(500);
    
    const body = await request.json();
    
    const shoppingList = {
      ...mockShoppingList,
      id: `list-${Date.now()}`,
      menuBookId: body.menuBookId,
      createdAt: new Date().toISOString(),
    };
    
    return HttpResponse.json(shoppingList);
  }),

  // 获取餐饮计划
  http.get(`${API_BASE}/menu-books/:id`, ({ params }) => {
    return HttpResponse.json({
      ...mockMenuBook,
      id: params.id,
    });
  }),

  // 获取购物清单
  http.get(`${API_BASE}/shopping-lists/:id`, ({ params }) => {
    return HttpResponse.json({
      ...mockShoppingList,
      id: params.id,
    });
  }),

  // 更新购物清单项（勾选/取消勾选）
  http.patch(`${API_BASE}/shopping-lists/:listId/items/:itemId`, async ({ params, request }) => {
    const body = await request.json();
    
    return HttpResponse.json({
      id: params.itemId,
      checked: body.checked,
      updatedAt: new Date().toISOString(),
    });
  }),

  // 添加购物清单项
  http.post(`${API_BASE}/shopping-lists/:listId/items`, async ({ params, request }) => {
    const body = await request.json();
    
    return HttpResponse.json({
      id: `item-${Date.now()}`,
      name: body.name,
      quantity: body.quantity || '',
      category: body.category || 'other',
      checked: false,
      isManuallyAdded: true,
      createdAt: new Date().toISOString(),
    });
  }),

  // 删除餐食
  http.delete(`${API_BASE}/menu-books/:planId/meals/:mealId`, ({ params }) => {
    return HttpResponse.json({
      success: true,
      deletedMealId: params.mealId,
    });
  }),
];

// ============================================
// 错误响应 Handlers (用于测试错误处理)
// ============================================

export const errorHandlers = {
  // 生成计划失败
  generatePlanError: http.post(`${API_BASE}/menu-books/generate`, () => {
    return HttpResponse.json(
      { error: 'Failed to generate menu book', code: 'GENERATION_FAILED' },
      { status: 500 }
    );
  }),

  // 修改计划失败
  modifyPlanError: http.post(`${API_BASE}/menu-books/:id/modify`, () => {
    return HttpResponse.json(
      { error: 'Failed to modify menu book', code: 'MODIFICATION_FAILED' },
      { status: 500 }
    );
  }),

  // 生成购物清单失败
  generateListError: http.post(`${API_BASE}/shopping-lists/generate`, () => {
    return HttpResponse.json(
      { error: 'Failed to generate shopping list', code: 'GENERATION_FAILED' },
      { status: 500 }
    );
  }),

  // 404 Not Found
  notFound: http.get(`${API_BASE}/menu-books/:id`, () => {
    return HttpResponse.json(
      { error: 'Meal plan not found', code: 'NOT_FOUND' },
      { status: 404 }
    );
  }),

  // 401 Unauthorized
  unauthorized: http.all(`${API_BASE}/*`, () => {
    return HttpResponse.json(
      { error: 'Unauthorized', code: 'UNAUTHORIZED' },
      { status: 401 }
    );
  }),

  // 网络错误
  networkError: http.post(`${API_BASE}/menu-books/generate`, () => {
    return HttpResponse.error();
  }),
};

// ============================================
// 超时 Handlers (用于测试超时处理)
// ============================================

export const timeoutHandlers = {
  // 生成计划超时（超过 2 分钟）
  generatePlanTimeout: http.post(`${API_BASE}/menu-books/generate`, async () => {
    // 延迟 130 秒（超过 2 分钟超时限制）
    await delay(130000);
    return HttpResponse.json(mockMenuBook);
  }),

  // 修改计划超时
  modifyPlanTimeout: http.post(`${API_BASE}/menu-books/:id/modify`, async () => {
    await delay(130000);
    return HttpResponse.json(mockMenuBook);
  }),

  // 生成购物清单超时
  generateListTimeout: http.post(`${API_BASE}/shopping-lists/generate`, async () => {
    await delay(130000);
    return HttpResponse.json(mockShoppingList);
  }),
};

// ============================================
// 慢响应 Handlers (用于测试加载状态)
// ============================================

export const slowHandlers = {
  // 慢速生成计划（正好在超时边缘）
  generatePlanSlow: http.post(`${API_BASE}/menu-books/generate`, async () => {
    await delay(90000); // 90 秒
    return HttpResponse.json(mockMenuBook);
  }),

  // 正常慢速响应
  normalSlow: http.post(`${API_BASE}/menu-books/generate`, async () => {
    await delay(3000); // 3 秒
    return HttpResponse.json(mockMenuBook);
  }),
};

// ============================================
// 验证 Handlers (用于测试请求验证)
// ============================================

export const validationHandlers = {
  // 验证生成计划请求
  validateGeneratePlan: http.post(`${API_BASE}/menu-books/generate`, async ({ request }) => {
    const body = await request.json();
    const errors = [];

    // 验证必填字段
    if (!body.cookSchedule) {
      errors.push('cookSchedule is required');
    }

    // 验证人数范围
    if (body.numPeople && (body.numPeople < 1 || body.numPeople > 10)) {
      errors.push('numPeople must be between 1 and 10');
    }

    // 验证预算范围
    if (body.budget && (body.budget < 50 || body.budget > 500)) {
      errors.push('budget must be between 50 and 500');
    }

    // 验证难度值
    if (body.difficulty && !['easy', 'medium', 'hard'].includes(body.difficulty)) {
      errors.push('difficulty must be easy, medium, or hard');
    }

    // 验证至少选择一餐
    if (body.cookSchedule) {
      let hasMeal = false;
      Object.values(body.cookSchedule).forEach((day: any) => {
        if (day.breakfast || day.lunch || day.dinner) {
          hasMeal = true;
        }
      });
      if (!hasMeal) {
        errors.push('At least one meal must be selected');
      }
    }

    if (errors.length > 0) {
      return HttpResponse.json(
        { error: 'Validation failed', details: errors },
        { status: 400 }
      );
    }

    await delay(1000);
    return HttpResponse.json({
      ...mockMenuBook,
      id: `plan-${Date.now()}`,
    });
  }),
};

// ============================================
// 默认 Handlers (组合常用的)
// ============================================

export const handlers = [...successHandlers];

// ============================================
// 测试场景 Presets
// ============================================

export const testScenarios = {
  // 正常流程
  happyPath: successHandlers,
  
  // 全部失败
  allErrors: [
    errorHandlers.generatePlanError,
    errorHandlers.modifyPlanError,
    errorHandlers.generateListError,
  ],
  
  // 网络问题
  networkIssues: [errorHandlers.networkError],
  
  // 超时场景
  timeouts: [
    timeoutHandlers.generatePlanTimeout,
    timeoutHandlers.modifyPlanTimeout,
  ],
  
  // 慢响应
  slowResponses: [slowHandlers.normalSlow],
  
  // 严格验证
  strictValidation: [validationHandlers.validateGeneratePlan],
};

// ============================================
// Setup 函数
// ============================================

import { setupServer } from 'msw/node';

export function createTestServer(customHandlers = handlers) {
  return setupServer(...customHandlers);
}

// 用于浏览器环境的 worker
// import { setupWorker } from 'msw/browser';
// export function createTestWorker(customHandlers = handlers) {
//   return setupWorker(...customHandlers);
// }
