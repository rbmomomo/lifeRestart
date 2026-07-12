import {describe,expect,it} from 'vitest';
import {buildChatBody,normalizeAiUrl,parseModelList} from '../src/ai/provider';
import {isAiConfigured} from '../src/storage/aiSettings';

describe('AI URL 规范化',()=>{
 it('从基础地址构建 OpenAI 路径并兼容完整路径',()=>{
  expect(normalizeAiUrl('https://api.test/v1/','openai','chat')).toBe('https://api.test/v1/chat/completions');
  expect(normalizeAiUrl('https://api.test/v1/chat/completions','openai','models')).toBe('https://api.test/v1/models');
  expect(normalizeAiUrl('https://api.test/v1/models','openai','chat')).toBe('https://api.test/v1/chat/completions');
 });
 it('从基础地址构建 Anthropic 路径并兼容完整路径',()=>{
  expect(normalizeAiUrl('https://api.test/v1/messages','anthropic','chat')).toBe('https://api.test/v1/messages');
  expect(normalizeAiUrl('https://api.test/v1/messages','anthropic','models')).toBe('https://api.test/v1/models');
 });
});
describe('可选请求参数',()=>{
 it('空值不发送',()=>{const body=buildChatBody({format:'anthropic',endpoint:'x',apiKey:'k',model:'m'},'s','u');expect(body).not.toHaveProperty('max_tokens');expect(body).not.toHaveProperty('temperature')});
 it('填写后发送',()=>{const body=buildChatBody({format:'openai',endpoint:'x',apiKey:'k',model:'m',maxTokens:99,temperature:.4},'s','u');expect(body.max_tokens).toBe(99);expect(body.temperature).toBe(.4)});
 it('配置只校验填写的可选值',()=>{const base={format:'openai' as const,endpoint:'x',apiKey:'k',model:'m'};expect(isAiConfigured(base)).toBe(true);expect(isAiConfigured({...base,maxTokens:0})).toBe(false);expect(isAiConfigured({...base,temperature:3})).toBe(false)});
});
describe('模型解析',()=>{
 it('兼容常见结构、去重排序',()=>{expect(parseModelList({data:[{id:'z'},{id:'a'},{id:'a'}]})).toEqual(['a','z']);expect(parseModelList({models:[{name:'b'},{id:'a'}]})).toEqual(['a','b']);expect(parseModelList(['b',{id:'a'},'b'])).toEqual(['a','b'])});
});
