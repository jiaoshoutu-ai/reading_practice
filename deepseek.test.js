import { callAPI, chat } from './deepseek.js';

// Simple test runner
const tests = {
  passed: 0,
  failed: 0,
};

async function runTest(name, testFn) {
  try {
    await testFn();
    console.log(`✓ ${name}`);
    tests.passed++;
  } catch (error) {
    console.error(`✗ ${name}`);
    console.error(`  Error: ${error.message}`);
    tests.failed++;
  }
}

// Test 1: Basic chat function
async function testBasicChat() {
  const result = await chat('Say "Hello" only');
  if (!result || typeof result !== 'string') {
    throw new Error('Expected a string response');
  }
  console.log(`  Response: ${result.substring(0, 50)}...`);
}

// Test 2: callAPI with custom options
async function testCallAPIWithOptions() {
  const result = await callAPI([
    { role: 'user', content: 'What is 2+2? Answer with just the number.' }
  ], {
    model: 'deepseek-chat',
    temperature: 0.5,
    max_tokens: 10
  });

  if (!result.content) {
    throw new Error('Expected content in response');
  }
  if (!result.usage) {
    throw new Error('Expected usage info in response');
  }
  console.log(`  Response: ${result.content}`);
  console.log(`  Usage: prompt_tokens=${result.usage.prompt_tokens}, completion_tokens=${result.usage.completion_tokens}`);
}

// Test 3: System prompt handling
async function testSystemPrompt() {
  const result = await chat(
    'What programming language are you expert in?',
    'You are a Python expert, always respond mentioning Python.'
  );
  if (!result.toLowerCase().includes('python')) {
    console.warn('  Warning: Response may not follow system prompt');
  }
  console.log(`  Response: ${result.substring(0, 80)}...`);
}

// Test 4: Multi-turn conversation
async function testMultiTurnConversation() {
  const messages = [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: 'My name is Alice.' },
    { role: 'assistant', content: 'Nice to meet you, Alice!' },
    { role: 'user', content: 'What is my name?' }
  ];

  const result = await callAPI(messages);
  if (!result.content.toLowerCase().includes('alice')) {
    throw new Error('Expected assistant to remember the name Alice');
  }
  console.log(`  Response: ${result.content}`);
}

// Main test runner
async function runTests() {
  console.log('Running DeepSeek API Tests...\n');
  console.log('='.repeat(50));

  await runTest('Basic chat', testBasicChat);
  await runTest('callAPI with options', testCallAPIWithOptions);
  await runTest('System prompt', testSystemPrompt);
  await runTest('Multi-turn conversation', testMultiTurnConversation);

  console.log('='.repeat(50));
  console.log(`Results: ${tests.passed} passed, ${tests.failed} failed`);

  if (tests.failed > 0) {
    process.exit(1);
  }
}

runTests();
