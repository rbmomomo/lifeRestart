import type { AiNarrativeProvider, NarrativeContext } from '../types';
export class LocalNarrativeProvider implements AiNarrativeProvider { id='local-narrator'; async generateBirthNarrative(c:NarrativeContext){return `在${c.generatedWorld.name}的${c.family.location}，${c.character.name||'一个新生命'}随着啼哭降生。${c.family.parents}组成的${c.family.socialClass}家庭，是你面对“${c.generatedWorld.coreConflict}”前最初的港湾。${c.talents.join('、')}将在成长中逐渐显露，而 AI 推演出的世界不会替你预写结局。`;}}
export const narrateBirth=(p:AiNarrativeProvider,c:NarrativeContext)=>p.generateBirthNarrative(c);
