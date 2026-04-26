// Using global fetch (Node.js 18+)

async function test() {
    const key = 'sk-955476e8b0d9ac77363f5dd3167914a8';
    const model = 'deepseek-chat';
    
    console.log('Testing iflow API with key:', key.substring(0, 12) + '...');
    console.log('Model:', model);
    
    const response = await fetch('https://apis.iflow.cn/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${key}`,
        },
        body: JSON.stringify({
            model: model,
            messages: [
                { role: 'system', content: 'You are a helpful assistant.' },
                { role: 'user', content: 'Hello' }
            ],
            max_tokens: 50,
        }),
    });
    
    console.log('Status:', response.status);
    const data = await response.json();
    console.log('Response:', JSON.stringify(data, null, 2));
}

test().catch(console.error);
