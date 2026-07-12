export type ThemeMode = 'light' | 'dark';
export type WorldId = 'modern-city' | 'ancient-dynasty' | 'martial-arts' | 'cultivation' | 'apocalypse' | 'cyberpunk' | 'magic-academy' | 'space-colony' | 'custom';
export type BirthMethod = 'random' | 'three-choice' | 'custom' | 'ai-qa';
export type GenderOption = '女' | '男' | '非二元' | '未定';

export interface FamilyArchetype { label:string; parentPairs:string[]; classes:string[]; locations:string[]; advantages:string[]; risks:string[]; secrets:string[] }
export interface WorldDefinition { id:WorldId; name:string; subtitle:string; headline:string; description:string; eraTag:string; atmosphere:string[]; keywords:string[]; detailSections:Array<{title:string;content:string}>; talentPool:string[]; familyArchetypes:FamilyArchetype[]; starterBlessings:string[] }
export interface GeneratedWorld {
  templateId: WorldId; name:string; selectedThemes:string[]; eraBackground:string; socialStructure:string; coreConflict:string;
  livingEnvironment:string; growthPaths:string; loveMarriageRules:string; familyStructure:string; dangers:string;
  lifespan:string; birthRegions:string[]; overview:string; generatedAt:string;
}
export interface WorldGenerationRequest { template:WorldDefinition; selectedThemes:string[]; customPrompt?:string }
export interface WorldGenerationProvider { id:string; generateThemeTags(template:WorldDefinition, customPrompt?:string):Promise<string[]>; generateWorld(request:WorldGenerationRequest):Promise<GeneratedWorld> }
export interface FamilyCard { id:string; worldId:WorldId; label:string; parents:string; socialClass:string; location:string; advantages:string[]; risks:string[]; hiddenSecret:string }
export interface CharacterProfile { name:string; gender:GenderOption; personality:string }
export interface NarrativeContext { template:WorldDefinition; generatedWorld:GeneratedWorld; family:FamilyCard; character:CharacterProfile; talents:string[]; birthMethod:BirthMethod }
export interface AiNarrativeProvider { id:string; generateBirthNarrative(context:NarrativeContext):Promise<string> }
export type SimulatorStep = 'welcome'|'world-select'|'world-detail'|'theme-select'|'world-generating'|'world-confirm'|'birth-method'|'family-selection'|'character-create'|'talent-select'|'birth-result'|'life-home';
export interface SimulatorState { worldId?:WorldId; customWorldPrompt:string; themeTags:string[]; selectedThemes:string[]; generatedWorld?:GeneratedWorld; birthMethod?:BirthMethod; familyCards:FamilyCard[]; selectedFamilyId?:string; character:CharacterProfile; offeredTalents:string[]; selectedTalents:string[]; birthNarrative:string; currentStep:SimulatorStep }

export type AiApiFormat = 'openai' | 'anthropic';
export interface AiSettings { format:AiApiFormat; endpoint:string; apiKey:string; model:string; maxTokens:number; temperature:number }
export interface AiProvider extends WorldGenerationProvider, AiNarrativeProvider { testConnection():Promise<string> }
