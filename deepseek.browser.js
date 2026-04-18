/**
 * DeepSeek API 调用封装 (浏览器版本)
 * 直接通过 script 标签引入，无需模块导入
 */

// 配置
const DeepSeekAPI = {
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
        apiKey = DeepSeekAPI.defaultIflowKey;
    }

    return {
        provider,
        apiKey,
        baseURL: DeepSeekAPI.providers[provider].baseURL,
        model: DeepSeekAPI.providers[provider].model
    };
}

/**
 * 调用 API
 */
async function callAPI(messages, options = {}) {
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
 */
async function chat(userMessage, systemPrompt = '你是经验丰富的上海初中语文名师，擅长指导学生写作和阅读作业。你的点评专业、温和、鼓励性强，能用学生容易理解的语言指出问题并给出具体修改建议.') {
    const messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
    ];

    const result = await callAPI(messages);
    return result.content;
}

// 暴露到全局作用域
window.chat = chat;
window.callAPI = callAPI;
window.getCurrentConfig = getCurrentConfig;
window.DeepSeekAPI = DeepSeekAPI;
