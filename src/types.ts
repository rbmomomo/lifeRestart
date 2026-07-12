export type ThemeMode = 'light' | 'dark';
export type WorldId = 'modern-city' | 'ancient-dynasty' | 'martial-arts' | 'cultivation' | 'apocalypse' | 'cyberpunk' | 'magic-academy' | 'space-colony' | 'custom';
export type BirthMethod = 'random' | 'three-choice' | 'ai-qa';
export interface BirthAnswers { atmosphere:string; resources:string; structure:string; tendency:string }
export type GenderOption = '女' | '男' | '非二元' | '未定';

export interface FamilyArchetype { label:string; parentPairs:string[]; classes:string[]; locations:string[]; advantages:string[]; risks:string[]; secrets:string[] }
export interface WorldDefinition { id:WorldId; name:string; subtitle:string; headline:string; description:string; eraTag:string; atmosphere:string[]; keywords:string[]; detailSections:Array<{title:string;content:string}>; talentPool:string[]; familyArchetypes:FamilyArchetype[]; starterBlessings:string[] }
export type LifespanMode='increasing'|'decreasing'|'mixed'|'unchanged';
export interface LifespanRule {years:number;ageless:boolean;naturalDeathEnabled:boolean}
export interface ProgressionTier {name:string;requiredProgress:number;lifespan:LifespanRule;description:string;advancementConditions:string[];risks:string[]}
export interface ProgressionSystem {name:string;unit:string;description:string;lifespanMode:LifespanMode;tiers:ProgressionTier[]}
export interface BirthQuestion { key:string; title:string; options:[string,string,string,string] }
export interface GeneratedWorld {
  templateId: WorldId; name:string; selectedThemes:string[]; eraBackground:string; socialStructure:string; coreConflict:string;
  livingEnvironment:string; growthPaths:string; loveMarriageRules:string; familyStructure:string; dangers:string;
  lifespan:string; birthRegions:string[]; overview:string; generatedAt:string; progressionSystem:ProgressionSystem;
  familyPool:FamilyCard[]; birthQuestions:BirthQuestion[]; attributeLabels:AttributeLabels;
}
export interface WorldGenerationRequest { template:WorldDefinition; selectedThemes:string[]; customPrompt?:string }
export interface WorldGenerationProvider {id:string;generateThemeTags(template:WorldDefinition,customPrompt?:string):Promise<string[]>;generateWorld(request:WorldGenerationRequest):Promise<GeneratedWorld>;generateProgressionSystem(world:GeneratedWorld,template:WorldDefinition,selectedThemes:string[]):Promise<ProgressionSystem>}
export interface FamilyHouseholdMember {name:string;role:string;occupation:string;ageYears:number}
export interface FamilyCard { id:string; worldId:WorldId; label:string; parents:string; socialClass:string; location:string; advantages:string[]; risks:string[]; hiddenSecret:string; householdMembers?:FamilyHouseholdMember[]; startingWealth?:number }

export type LifeStage = '新生儿'|'幼儿'|'童年'|'少年'|'青年'|'成年'|'老年';
export type AttributeKey = 'physique'|'intelligence'|'charisma'|'willpower'|'creativity'|'social'|'morality'|'luck';
export type LifeAttributes = Record<AttributeKey,number>;
export type AttributeLabels = Record<AttributeKey,string>;
export interface LifeVitals { health:number; energy:number; mood:number; stress:number }
export interface FamilyMember { id:string; name:string; role:string; ageMonths:number; ageYears:number; alive:boolean; occupation:string; health:number; mood:number; relationship:number; personality:string[]; goals:string[] }
export type SocialCharacter=FamilyMember;
export interface TimelineRecord { id:string; ageMonths:number; title:string; description:string; kind:'birth'|'birthday'|'stage'|'event'|'passage'; effectsSummary?:string[] }
export type LifeEventCategory='family'|'health'|'growth'|'exploration'|'school'|'peers'|'education'|'career'|'relationship'|'memory'|'legacy'|'danger'|'other';
export type LifeEffect=
 | {type:'modify_attribute';attribute:AttributeKey;amount:number}
 | {type:'modify_vital';vital:keyof LifeVitals;amount:number}
 | {type:'modify_money';account:'personal'|'family';amount:number}
 | {type:'modify_progression';amount:number}
 | {type:'attempt_breakthrough';risk:'safe'|'balanced'|'reckless';bonus?:number}
 | {type:'modify_relationship';memberId:string;amount:number}
 | {type:'change_location';location:string}
 | {type:'add_character';character:Partial<SocialCharacter>&Pick<SocialCharacter,'name'|'role'>}
 | {type:'update_character';memberId:string;occupation?:string;health?:number;mood?:number;relationship?:number;personality?:string[];goals?:string[]}
 | {type:'kill_character';memberId:string;reason?:string}
 | {type:'kill_player';reason?:string}
 | {type:'add_fact';fact:string};
export interface LifeEventChoice {id:string;label:string;intent:string;effects:LifeEffect[]}
export interface PendingLifeEvent {id:string;eventType:'ordinary'|'breakthrough';category:LifeEventCategory;title:string;description:string;participants:string[];choices:LifeEventChoice[];advanceMonths:number}
export interface LifeProgression {systemName:string;tierIndex:number;tierName:string;progress:number;nextTierProgress?:number;pendingBreakthrough?:boolean;tiers?:ProgressionTier[]}
export interface LifeState {ageMonths:number;attributeLabels:AttributeLabels;lifespanLimitMonths:number;currentLifespanRule:LifespanRule;progression:LifeProgression;lifeStage:LifeStage;alive:boolean;attributes:LifeAttributes;vitals:LifeVitals;personalMoney:number;familyWealth:number;currentLocation:string;familyMembers:FamilyMember[];socialCharacters:SocialCharacter[];facts:string[];timeline:TimelineRecord[];eventQueue:PendingLifeEvent[];pendingEvent?:PendingLifeEvent;endedAtAgeMonths?:number;endReason?:string;endingSummary?:string}
export interface CharacterProfile { name:string; gender:GenderOption }
export interface NarrativeContext { template:WorldDefinition; generatedWorld:GeneratedWorld; family:FamilyCard; character:CharacterProfile; talents:string[]; birthMethod:BirthMethod }
export interface FamilyGenerationRequest { template:WorldDefinition; generatedWorld:GeneratedWorld; birthMethod:BirthMethod; birthAnswers?:Partial<BirthAnswers> }
export interface TalentGenerationRequest { template:WorldDefinition; generatedWorld:GeneratedWorld; family:FamilyCard; character:CharacterProfile }
export interface AiNarrativeProvider { id:string; generateBirthNarrative(context:NarrativeContext):Promise<string> }
export type SimulatorStep = 'welcome'|'world-select'|'world-detail'|'theme-select'|'world-generating'|'world-confirm'|'birth-method'|'birth-qa'|'family-selection'|'character-create'|'talent-select'|'birth-result'|'life-home';
export interface SimulatorState { worldId?:WorldId; customWorldPrompt:string; themeTags:string[]; selectedThemes:string[]; generatedWorld?:GeneratedWorld; birthMethod?:BirthMethod; birthAnswers:Partial<BirthAnswers>; familyRefreshCount:number; talentRefreshCount:number; familyCards:FamilyCard[]; selectedFamilyId?:string; character:CharacterProfile; offeredTalents:string[]; selectedTalents:string[]; birthNarrative:string; lifeState?:LifeState; currentStep:SimulatorStep }

export type AiApiFormat = 'openai' | 'anthropic';
export interface AiSettings { format:AiApiFormat; endpoint:string; apiKey:string; model:string; maxTokens?:number; temperature?:number }
export interface LifeEventGenerationContext {state:LifeState;world:GeneratedWorld;character:CharacterProfile;advanceMonths:number}
export interface EventResolution {outcome:'ordinary'|'breakthrough_success'|'breakthrough_failure';summary:string[];breakthrough?:{success:boolean;risk:'safe'|'balanced'|'reckless';chance:number}}
export interface ResolvedEventChoice {state:LifeState;resolution:EventResolution;timelineId:string}
export interface AiProvider extends WorldGenerationProvider,AiNarrativeProvider {testConnection():Promise<string>;listModels():Promise<string[]>;generateFamilies(request:FamilyGenerationRequest):Promise<FamilyCard[]>;generateRandomFamily(request:FamilyGenerationRequest):Promise<FamilyCard>;generateTalents(request:TalentGenerationRequest):Promise<string[]>;generateLifeEvent(context:LifeEventGenerationContext):Promise<PendingLifeEvent>;generateEventOutcomeNarrative?(context:LifeEventGenerationContext,event:PendingLifeEvent,choice:LifeEventChoice,resolution:EventResolution):Promise<string>}
