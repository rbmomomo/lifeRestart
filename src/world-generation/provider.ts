import type { GeneratedWorld, WorldDefinition, WorldGenerationProvider, WorldGenerationRequest, WorldId } from '../types';

const TAGS: Record<WorldId,string[]> = {
  'modern-city':['爱情','家庭','校园','职场','创业','娱乐圈','阶层跃迁','犯罪悬疑','医疗','科技'],
  'ancient-dynasty':['科举','宅斗','朝堂','商贾','军旅','医术','江湖','婚姻','宗族','权谋'],
  'martial-arts':['门派','复仇','侠义','秘籍','镖局','朝廷','奇案','红尘','比武','隐世高手'],
  cultivation:['宗门','长生','炼丹','剑道','秘境','仙族','散修','灵兽','天劫','因果'],
  apocalypse:['生存','感染','避难所','车队','重建','变异','资源争夺','人性','科技遗迹','荒野'],
  cyberpunk:['巨企','黑客','义体','街头','人工智能','数据犯罪','阶层反抗','虚拟爱情','佣兵','记忆交易'],
  'magic-academy':['学院','魔法','友谊','禁术','社团','家族','异族','冒险','恋爱','毕业试炼'],
  'space-colony':['殖民','探索','生态','工程','外星生命','舰队','政治','孤独','星际贸易','人工智能'],
  custom:['冒险','爱情','家族','成长','权力','秘密','科技','信仰','战争','日常'],
};
const wait=(ms:number)=>new Promise(r=>setTimeout(r,ms));
export class LocalWorldGenerationProvider implements WorldGenerationProvider {
 id='local-ai-world-generator';
 async generateThemeTags(template:WorldDefinition, _customPrompt?:string){ await wait(180); return [...TAGS[template.id]]; }
 async generateWorld({template,selectedThemes,customPrompt}:WorldGenerationRequest):Promise<GeneratedWorld>{
  await wait(1100); const focus=selectedThemes.join('、'); const custom=customPrompt?.trim();
  return {templateId:template.id,name:`${template.name}：${selectedThemes.slice(0,2).join('与')}纪事`,selectedThemes,
   eraBackground:custom||`${template.description} AI 将“${focus}”编织为这个时代最鲜明的底色。`,
   socialStructure:`社会沿着${template.atmosphere.slice(0,3).join('、')}形成多层秩序；身份可以改变，但每次跃迁都有代价。`,
   coreConflict:`个人对理想生活的追求，与围绕${selectedThemes[0]}和${selectedThemes[1]}形成的既有秩序持续碰撞。`,
   livingEnvironment:`主要聚居地兼具${template.keywords.slice(0,3).join('、')}等特征，日常生活会被季节、资源与公共规则影响。`,
   growthPaths:`可经由${template.detailSections[1]?.content||'学习、实践、关系与冒险'}成长；不同家庭拥有不同入口。`,
   loveMarriageRules:`亲密关系既受个人选择影响，也受阶层、家庭责任及“${selectedThemes.includes('爱情')?'自由恋爱':'社会契约'}”观念约束。`,
   familyStructure:`家庭通常承担抚育、资源互助和身份传承；核心家庭、扩展家族与非血缘共同体并存。`,
   dangers:`主要风险来自${template.atmosphere.slice(-2).join('、')}，以及围绕${selectedThemes.slice(-2).join('、')}发生的突发事件。`,
   lifespan:template.id==='cultivation'?'凡人约百年，修行者可跨越数百乃至千年':'平均寿命约 70—90 年，身份与环境会造成显著差异',
   birthRegions:template.familyArchetypes.flatMap(x=>x.locations).slice(0,6),overview:`这是 AI 基于「${template.name}」模板与 ${selectedThemes.length} 个主题推演出的开放世界。${focus}会彼此牵引，而非作为孤立剧本存在。`,generatedAt:new Date().toISOString()};
 }
}
