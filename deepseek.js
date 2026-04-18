/**
 * DeepSeek API 调用封装
 * 使用 WritingAssistant 统一入口
 *
 * 使用示例：
 *   // 方法 1：直接使用 callAPI
 *   const result = await callAPI([
 *     { role: 'system', content: '你是助手' },
 *     { role: 'user', content: '你好' }
 *   ]);
 *
 *   // 方法 2：使用 chat 快捷方法
 *   const result = await chat('你好', '你是助手');
 *
 *   // 方法 3：使用 WritingAssistant 的高级功能
 *   WritingAssistant.init(); // 自动从 localStorage 加载配置
 *   const result = await WritingAssistant.evaluate('学生作文');
 */

// 配置
const APIConfig = {
    providers: {
        deepseek: {
            baseURL: 'https://api.deepseek.com/v1',
            model: 'deepseek-chat'
        },
        iflow: {
            baseURL: 'https://apis.iflow.cn/v1',
            model: 'deepseek-v3'
        }
    },
    defaultIflowKey: 'sk-4586617c5fbb22d14515429ff4698bec'
};

// 获取当前 API 配置
function getCurrentConfig() {
    const provider = localStorage.getItem('api_provider') || 'deepseek';
    const storageKey = provider === 'iflow' ? 'iflow_api_key' : 'deepseek_api_key';
    let apiKey = localStorage.getItem(storageKey);

    // iflow 使用默认 key
    if (provider === 'iflow' && !apiKey) {
        apiKey = APIConfig.defaultIflowKey;
    }

    return {
        provider,
        apiKey,
        baseURL: APIConfig.providers[provider].baseURL,
        model: APIConfig.providers[provider].model
    };
}

/**
 * 调用 API
 * @param {Array<{role: string, content: string}>} messages - 消息数组
 * @param {Object} options - 配置选项
 * @param {string} options.model - 模型名称
 * @param {number} options.max_tokens - 最大 token 数
 * @param {number} options.temperature - 温度 (0-2)
 * @returns {Promise<{content: string, usage: object}>}
 */
export async function callAPI(messages, options = {}) {
    const config = getCurrentConfig();

    if (!config.apiKey) {
        console.error('[API] Error: API Key is not configured');
        throw new Error('请先在「大模型配置」页面设置 API Key');
    }

    const {
        model = config.model,
        max_tokens,
        temperature = 0.7,
    } = options;

    const requestBody = {
        model,
        messages,
        temperature,
    };

    if (max_tokens !== undefined) {
        requestBody.max_tokens = max_tokens;
    }

    let response;
    try {
        response = await fetch(`${config.baseURL}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.apiKey}`,
            },
            body: JSON.stringify(requestBody),
        });
    } catch (error) {
        console.error('[API] Network error:', error.message);
        throw error;
    }

    const data = await response.json();

    if (!response.ok) {
        console.error('[API] Error:', JSON.stringify(data, null, 2));
        throw new Error(`API error: ${response.status} ${data.error?.message || 'Unknown error'}`);
    }

    return {
        content: data.choices[0].message.content,
        usage: data.usage,
    };
}

/**
 * 简单聊天
 * @param {string} userMessage - 用户消息
 * @param {string} systemPrompt - 系统提示
 * @returns {Promise<string>}
 */
export async function chat(userMessage, systemPrompt = '你是上海初中语文名师.') {
    const messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
    ];

    const result = await callAPI(messages);
    return result.content;
}

// 导出配置获取方法
export { getCurrentConfig };

// 兼容 WritingAssistant
if (typeof window !== 'undefined') {
    window.callAPI = callAPI;
    window.chat = chat;
    window.getCurrentConfig = getCurrentConfig;
}
