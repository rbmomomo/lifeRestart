import type {AiProvider,AiSettings,FamilyCard,FamilyGenerationRequest,GeneratedWorld,LifeEventGenerationContext,NarrativeContext,PendingLifeEvent,TalentGenerationRequest,WorldDefinition,WorldGenerationRequest} from '../types';
import {cryptoRandomIndex} from '../domain/generators';
import {validateLifeEvent} from '../life/engine';

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
export function validateFamilies(value:unknown,worldId:FamilyCard['worldId']):FamilyCard[]{
 if(!Array.isArray(value)||value.length!==3)throw new Error('AI 必须返回恰好 3 个家庭');
 const fields=['label','parents','socialClass','location','hiddenSecret'] as const;
 const cards=value.map((x:any,i)=>{if(!x||typeof x!=='object'||fields.some(k=>typeof x[k]!=='string'||!x[k].trim())||!Array.isArray(x.advantages)||!x.advantages.length||x.advantages.some((v:any)=>typeof v!=='string'||!v.trim())||!Array.isArray(x.risks)||!x.risks.length||x.risks.some((v:any)=>typeof v!=='string'||!v.trim()))throw new Error(`第 ${i+1} 个家庭结构不完整`);return {id:`ai-family-${Date.now()}-${i}-${crypto.getRandomValues(new Uint32Array(1))[0]}`,worldId,label:x.label.trim(),parents:x.parents.trim(),socialClass:x.socialClass.trim(),location:x.location.trim(),advantages:x.advantages.map((v:string)=>v.trim()),risks:x.risks.map((v:string)=>v.trim()),hiddenSecret:x.hiddenSecret.trim()}});
 const keys=cards.map(x=>`${x.label}\u0000${x.parents}\u0000${x.location}`);if(new Set(keys).size!==3)throw new Error('同批家庭的名称、父母与地点组合必须互不重复');return cards;
}
export function validateTalents(value:unknown):string[]{if(!Array.isArray(value))throw new Error('天赋必须是 JSON 数组');const values=value.map(x=>typeof x==='string'?x.trim():'').filter(Boolean);if(values.length!==10||new Set(values).size!==10)throw new Error('AI 必须返回恰好 10 个互不重复的天赋');return values}
export const DEFAULT_MAX_TOKENS = 8192;
export const DEFAULT_TEMPERATURE = 0.7;

export function buildChatBody(s:AiSettings,system:string,user:string,maxTokens=s.maxTokens){
 const body:any=s.format==='anthropic'?{model:s.model,system,messages:[{role:'user',content:user}]}:{model:s.model,messages:[{role:'system',content:system},{role:'user',content:user}]};
 body.max_tokens=maxTokens??DEFAULT_MAX_TOKENS;
 body.temperature=s.temperature??DEFAULT_TEMPERATURE;
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
   `请为这个世界模板即兴生成严格恰好10个互不重复的中文主题标签，供玩家选择3到5个。\n要求：\n1. 每个标签2到6个汉字；\n2. 严格10项中，约5到6项要形成两组明显关联的主题，每组约2到3项；同组主题被玩家选中后，应能自然串成一条连续人生主线或层层推进的矛盾链；\n3. 其余约4到5项应彼此相对独立，也与两组主线保持距离，用于制造支线、偶遇和意外转折；\n4. 标签文字本身绝对不要出现组号、分组、主线、支线等说明，也不要输出嵌套数组或对象；\n5. 十项整体覆盖情感关系、家庭或身份、成长场景、职业或生存道路、社会矛盾、危险秘密等维度；至少6项必须结合本次世界重新创造，不得机械照抄参考词；\n6. 同一模板重复请求时应产生明显不同的组合；所有标签必须符合模板边界，现代都市不能出现修仙，古代王朝不能出现互联网；\n7. 最终仍只输出一个合法JSON字符串数组，严格恰好10个互不重复的字符串，不要任何解释。\n本次创作扰动码：${creativeNonce}\n模板边界：${JSON.stringify(brief)}`
  );
  const value=extractJson(text);if(!Array.isArray(value))throw new Error('主题标签必须是 JSON 数组');const tags=[...new Set(value.filter(x=>typeof x==='string').map(x=>x.trim()).filter(Boolean))];if(tags.length!==10)throw new Error(`AI 必须返回恰好 10 个不同标签，实际为 ${tags.length} 个`);return tags
 }
 async generateWorld(req:WorldGenerationRequest):Promise<GeneratedWorld>{
  const creativeNonce=`${Date.now()}-${crypto.getRandomValues(new Uint32Array(2)).join('-')}`;
  const templateBrief={id:req.template.id,name:req.template.name,headline:req.template.headline,description:req.template.description,eraTag:req.template.eraTag,atmosphere:req.template.atmosphere,worldRules:req.template.detailSections,customPrompt:req.customPrompt};
  const text=await this.chat('你是严谨而富有原创性的世界构建器。仅返回合法 JSON 对象，所有字段必须完整。不要照抄模板示例，要根据玩家选择重新推演一个具体世界。',`根据世界边界和玩家主题，推演一个全新的、内部自洽且适合模拟完整人生的世界。模板只是类型边界，不是现成剧情；不得读取或复用任何固定家庭、天赋或事件答案。\n必须包含字符串字段 name,eraBackground,socialStructure,coreConflict,livingEnvironment,growthPaths,loveMarriageRules,familyStructure,dangers,lifespan,overview，以及至少4项的非空字符串数组 birthRegions。\n推演时必须说明所选主题如何互相影响，而不是逐项罗列。世界名称、社会制度、地区和矛盾应具体原创。\n本次创作扰动码：${creativeNonce}\n世界边界：${JSON.stringify(templateBrief)}\n玩家选择主题：${JSON.stringify(req.selectedThemes)}`);const x=extractJson(text) as any;const fields=['name','eraBackground','socialStructure','coreConflict','livingEnvironment','growthPaths','loveMarriageRules','familyStructure','dangers','lifespan','overview'];if(!x||typeof x!=='object'||fields.some(k=>typeof x[k]!=='string'||!x[k].trim())||!Array.isArray(x.birthRegions)||!x.birthRegions.length||x.birthRegions.some((v:any)=>typeof v!=='string'||!v.trim()))throw new Error('AI 返回的世界结构字段缺失或格式错误');return {templateId:req.template.id,selectedThemes:req.selectedThemes,generatedAt:new Date().toISOString(),...Object.fromEntries(fields.map(k=>[k,x[k].trim()])),birthRegions:x.birthRegions.map((v:string)=>v.trim())} as GeneratedWorld}
 async generateFamilies(r:FamilyGenerationRequest){const text=await this.chat('你是人生模拟器家庭生成器。仅返回合法JSON数组。',`严格生成3个结构完整且本批互不重复的家庭。每项字段：label,parents,socialClass,location,advantages(非空字符串数组),risks(非空字符串数组),hiddenSecret。家庭必须由本次世界与问答原创推演，禁止固定内容库。三项的label+parents+location组合不得相同。资料：${JSON.stringify({world:r.generatedWorld,birthMethod:r.birthMethod,birthAnswers:r.birthAnswers})}`);return validateFamilies(extractJson(text),r.template.id)}
 async generateRandomFamily(r:FamilyGenerationRequest){const cards=await this.generateFamilies(r);return cards[cryptoRandomIndex(cards.length)]}
 async generateTalents(r:TalentGenerationRequest){const text=await this.chat('你是人生模拟器天赋生成器。仅返回合法JSON字符串数组。',`严格生成恰好10个互不重复的中文天赋字符串，必须同时符合生成世界、已选家庭与角色，不得使用固定天赋池。资料：${JSON.stringify({world:r.generatedWorld,family:r.family,character:r.character})}`);return validateTalents(extractJson(text))}
 async generateBirthNarrative(c:NarrativeContext){const text=await this.chat('你是中文文学叙事者。只返回出生篇章正文，不要标题、JSON或代码块。',`请写一段具体、有氛围且与设定一致的出生叙事（约500-800字），不得声称自己是AI。资料：${JSON.stringify(c)}`);if(!text.trim())throw new Error('AI 未生成出生叙事');return text.trim().replace(/^```(?:text|markdown)?\s*/i,'').replace(/\s*```$/,'')}
 async generateLifeEvent(c:LifeEventGenerationContext):Promise<PendingLifeEvent>{
  const s=c.state, stageGuide={新生儿:'家庭、健康、成长',幼儿:'家庭与探索',童年:'学校与家庭',少年:'同伴与学业',青年:'教育、职业、关系',成年:'事业、家庭、健康',老年:'健康、回忆、传承'}[s.lifeStage];
  const brief={world:{name:c.world.name,overview:c.world.overview,dangers:c.world.dangers,socialStructure:c.world.socialStructure},character:c.character,advanceMonths:c.advanceMonths,state:{ageMonths:s.ageMonths,stage:s.lifeStage,attributes:s.attributes,vitals:s.vitals,money:{personal:s.personalMoney,family:s.familyWealth},location:s.currentLocation,family:s.familyMembers,social:s.socialCharacters,facts:s.facts},recentTimeline:s.timeline.slice(-10).map(x=>({title:x.title,description:x.description}))};
  const text=await this.chat('你是人生事件导演。只返回严格合法JSON对象，不得解释。效果只能使用指定白名单字段，不得输出对象路径。',`为这次推进生成一个必然发生、适龄且不重复近期内容的事件。阶段重点：${stageGuide}。返回字段 category,title,description,participants,choices；choices严格2-4项，每项含id,label,intent,effects。effects白名单：modify_attribute(attribute为8项之一,amount -10..10), modify_vital(vital为health/energy/mood/stress,amount -20..20), modify_money(account personal/family,amount -100000..100000), modify_relationship(memberId,amount -20..20), change_location(location), add_character(character含name/role等), update_character(memberId及允许字段), kill_character(memberId,reason), kill_player(reason), add_fact(fact)。每个选择给出合理建议效果；不得创造任意状态路径。上下文：${JSON.stringify(brief)}`);
  return validateLifeEvent(extractJson(text),s,c.advanceMonths)
 }
 async generateEventOutcomeNarrative(c:LifeEventGenerationContext,event:PendingLifeEvent,choice:PendingLifeEvent['choices'][number]){const text=await this.chat('你是简洁的中文人生叙事者。只返回结果正文。',`用80-180字叙述选择后的结果，不新增未提供的数值效果。资料：${JSON.stringify({world:c.world.name,age:c.state.ageMonths,event,choice})}`);if(!text.trim())throw new Error('AI 未生成结果叙事');return text.trim()}
}
