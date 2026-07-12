import type {AiProvider,AiSettings,GeneratedWorld,NarrativeContext,WorldDefinition,WorldGenerationRequest} from '../types';

export function extractJson(text:string):unknown{
 const clean=text.trim().replace(/^```(?:json)?\s*/i,'').replace(/\s*```$/,'');
 try{return JSON.parse(clean)}catch{/* extract below */}
 const starts=[clean.indexOf('{'),clean.indexOf('[')].filter(x=>x>=0).sort((a,b)=>a-b);
 if(!starts.length)throw new Error('AI 响应中没有找到 JSON');
 const start=starts[0], open=clean[start], close=open==='{'?'}':']'; let depth=0,inString=false,escaped=false;
 for(let i=start;i<clean.length;i++){const c=clean[i];if(inString){if(escaped)escaped=false;else if(c==='\\')escaped=true;else if(c==='"')inString=false;continue}if(c==='"'){inString=true;continue}if(c===open)depth++;if(c===close&&--depth===0)return JSON.parse(clean.slice(start,i+1))}
 throw new Error('AI 返回的 JSON 不完整');
}
function contentOf(data:any,format:AiSettings['format']){const value=format==='anthropic'?data?.content?.find((x:any)=>x.type==='text')?.text:data?.choices?.[0]?.message?.content;if(typeof value!=='string'||!value.trim())throw new Error(data?.error?.message||'AI 没有返回文本内容');return value}
export function normalizeAiUrl(endpoint:string,format:AiSettings['format'],kind:'chat'|'models'){
 let base=endpoint.trim().replace(/\/+$/,'');
 const known=format==='anthropic'?['messages','models']:['chat/completions','models'];
 for(const suffix of known){const re=new RegExp(`/${suffix.replace('/','\\/')}/*$`,'i');base=base.replace(re,'')}
 return `${base}/${kind==='models'?'models':format==='anthropic'?'messages':'chat/completions'}`;
}
export function parseModelList(data:unknown):string[]{
 const source=Array.isArray(data)?data:(data&&typeof data==='object'&&(Array.isArray((data as any).data)?(data as any).data:Array.isArray((data as any).models)?(data as any).models:[]));
 const names=source.map((item:unknown)=>typeof item==='string'?item:item&&typeof item==='object'?(item as any).id??(item as any).name:'').filter((x:unknown):x is string=>typeof x==='string'&&Boolean(x.trim())).map((x:string)=>x.trim());
 return [...new Set<string>(names)].sort((a,b)=>a.localeCompare(b));
}
export function buildChatBody(s:AiSettings,system:string,user:string,maxTokens=s.maxTokens){
 const body:any=s.format==='anthropic'?{model:s.model,system,messages:[{role:'user',content:user}]}:{model:s.model,messages:[{role:'system',content:system},{role:'user',content:user}]};
 if(maxTokens!==undefined)body[s.format==='anthropic'?'max_tokens':'max_tokens']=maxTokens;
 if(s.temperature!==undefined)body.temperature=s.temperature;
 return body;
}
export class RemoteAiProvider implements AiProvider{
 id='user-configured-ai'; constructor(private settings:AiSettings){}
 private headers(){const s=this.settings;const headers:Record<string,string>={'Content-Type':'application/json'};if(s.format==='anthropic'){headers['x-api-key']=s.apiKey;headers['anthropic-version']='2023-06-01'}else headers.Authorization=`Bearer ${s.apiKey}`;return headers}
 private async chat(system:string,user:string,maxTokens=this.settings.maxTokens){
  const s=this.settings;
  let response:Response;try{response=await fetch(normalizeAiUrl(s.endpoint,s.format,'chat'),{method:'POST',headers:this.headers(),body:JSON.stringify(buildChatBody(s,system,user,maxTokens))})}catch(e){throw new Error(`网络请求失败：${e instanceof Error?e.message:String(e)}`)}
  const raw=await response.text();let data:any;try{data=JSON.parse(raw)}catch{throw new Error(`API 返回非 JSON（HTTP ${response.status}）`)}if(!response.ok)throw new Error(data?.error?.message||`API 请求失败（HTTP ${response.status}）`);return contentOf(data,s.format)
 }
 async listModels(){let response:Response;try{response=await fetch(normalizeAiUrl(this.settings.endpoint,this.settings.format,'models'),{headers:this.headers()})}catch(e){throw new Error(`拉取模型失败：${e instanceof Error?e.message:String(e)}`)}const raw=await response.text();let data:any;try{data=JSON.parse(raw)}catch{throw new Error(`模型接口返回非 JSON（HTTP ${response.status}）`)}if(!response.ok)throw new Error(data?.error?.message||`拉取模型失败（HTTP ${response.status}）`);const models=parseModelList(data);if(!models.length)throw new Error('模型接口未返回可识别的模型');return models}
 async testConnection(){const result=await this.chat('你是连接测试助手。','只回复“连接成功”。',this.settings.maxTokens===undefined?32:Math.min(this.settings.maxTokens,32));return result.trim()}
 async generateThemeTags(template:WorldDefinition,customPrompt=''){
  const creativeNonce=`${Date.now()}-${crypto.getRandomValues(new Uint32Array(2)).join('-')}`;
  const brief={templateName:template.name,worldBoundary:template.description,tone:template.atmosphere,referenceDimensions:template.keywords,customPrompt};
  const text=await this.chat(
   '你是富有创造力的人生模拟器世界设计师。必须仅返回 JSON 字符串数组，不要解释。每次请求都要重新构思，不能输出固定标签表。',
   `请为这个世界模板即兴生成严格恰好10个互不重复的中文主题标签，供玩家选择3到5个。\n要求：\n1. 每个标签2到6个汉字；\n2. 十项要覆盖情感关系、家庭或身份、成长场景、职业或生存道路、社会矛盾、危险秘密等不同维度；\n3. 至少6项必须是结合本次世界重新创造的具体主题，不得只是机械照抄参考词；\n4. 同一模板重复请求时也应产生明显不同的组合；\n5. 标签必须符合模板世界边界，现代都市不能出现修仙，古代王朝不能出现互联网；\n6. 仅输出JSON数组。\n本次创作扰动码：${creativeNonce}\n模板边界：${JSON.stringify(brief)}`
  );
  const value=extractJson(text);if(!Array.isArray(value))throw new Error('主题标签必须是 JSON 数组');const tags=[...new Set(value.filter(x=>typeof x==='string').map(x=>x.trim()).filter(Boolean))];if(tags.length!==10)throw new Error(`AI 必须返回恰好 10 个不同标签，实际为 ${tags.length} 个`);return tags
 }
 async generateWorld(req:WorldGenerationRequest):Promise<GeneratedWorld>{
  const creativeNonce=`${Date.now()}-${crypto.getRandomValues(new Uint32Array(2)).join('-')}`;
  const templateBrief={id:req.template.id,name:req.template.name,headline:req.template.headline,description:req.template.description,eraTag:req.template.eraTag,atmosphere:req.template.atmosphere,worldRules:req.template.detailSections,customPrompt:req.customPrompt};
  const text=await this.chat('你是严谨而富有原创性的世界构建器。仅返回合法 JSON 对象，所有字段必须完整。不要照抄模板示例，要根据玩家选择重新推演一个具体世界。',`根据世界边界和玩家主题，推演一个全新的、内部自洽且适合模拟完整人生的世界。模板只是类型边界，不是现成剧情；不得读取或复用任何固定家庭、天赋或事件答案。\n必须包含字符串字段 name,eraBackground,socialStructure,coreConflict,livingEnvironment,growthPaths,loveMarriageRules,familyStructure,dangers,lifespan,overview，以及至少4项的非空字符串数组 birthRegions。\n推演时必须说明所选主题如何互相影响，而不是逐项罗列。世界名称、社会制度、地区和矛盾应具体原创。\n本次创作扰动码：${creativeNonce}\n世界边界：${JSON.stringify(templateBrief)}\n玩家选择主题：${JSON.stringify(req.selectedThemes)}`);const x=extractJson(text) as any;const fields=['name','eraBackground','socialStructure','coreConflict','livingEnvironment','growthPaths','loveMarriageRules','familyStructure','dangers','lifespan','overview'];if(!x||typeof x!=='object'||fields.some(k=>typeof x[k]!=='string'||!x[k].trim())||!Array.isArray(x.birthRegions)||!x.birthRegions.length||x.birthRegions.some((v:any)=>typeof v!=='string'||!v.trim()))throw new Error('AI 返回的世界结构字段缺失或格式错误');return {templateId:req.template.id,selectedThemes:req.selectedThemes,generatedAt:new Date().toISOString(),...Object.fromEntries(fields.map(k=>[k,x[k].trim()])),birthRegions:x.birthRegions.map((v:string)=>v.trim())} as GeneratedWorld}
 async generateBirthNarrative(c:NarrativeContext){const text=await this.chat('你是中文文学叙事者。只返回出生篇章正文，不要标题、JSON或代码块。',`请写一段具体、有氛围且与设定一致的出生叙事（约500-800字），不得声称自己是AI。资料：${JSON.stringify(c)}`);if(!text.trim())throw new Error('AI 未生成出生叙事');return text.trim().replace(/^```(?:text|markdown)?\s*/i,'').replace(/\s*```$/,'')}
}
