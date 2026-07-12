import { getWorldDefinition } from '../data/worlds';
import type { BirthMethod, FamilyCard, GeneratedWorld, WorldId } from '../types';
const randomRng=()=>Math.random();
function pickOne<T>(items:T[],rng:()=>number):T{return items[Math.floor(rng()*items.length)]}
function pickManyUnique<T>(items:T[],count:number,rng:()=>number):T[]{const copy=[...items];for(let i=copy.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[copy[i],copy[j]]=[copy[j],copy[i]]}return copy.slice(0,count)}
export function generateFamilyCards(worldId:WorldId, customPrompt='', generatedWorld?:GeneratedWorld):FamilyCard[]{
 const world=getWorldDefinition(worldId,customPrompt); const archetypes=pickManyUnique(world.familyArchetypes,3,randomRng);
 return archetypes.map((a,i)=>({id:`${world.id}-family-${Date.now()}-${i}`,worldId:world.id,label:a.label,parents:pickOne(a.parentPairs,randomRng),socialClass:pickOne(a.classes,randomRng),location:generatedWorld?pickOne(generatedWorld.birthRegions,randomRng):pickOne(a.locations,randomRng),advantages:pickManyUnique(a.advantages,Math.min(3,a.advantages.length),randomRng),risks:pickManyUnique(a.risks,Math.min(2,a.risks.length),randomRng),hiddenSecret:pickOne(a.secrets,randomRng)}));
}
export function resolveSelectedFamilyId(cards:FamilyCard[],method:BirthMethod){return method==='random'?pickOne(cards,randomRng)?.id:undefined}
export function generateTalentOffer(worldId:WorldId,customPrompt='',generatedWorld?:GeneratedWorld){const world=getWorldDefinition(worldId,customPrompt); const themed=(generatedWorld?.selectedThemes??[]).map(x=>`${x}感知`); return pickManyUnique([...new Set([...themed,...world.talentPool])],10,randomRng)}
export function toggleTalentSelection(current:string[],talent:string,limit=3){if(current.includes(talent))return current.filter(x=>x!==talent); return current.length>=limit?current:[...current,talent]}
export function toggleThemeSelection(current:string[],theme:string,max=5){if(current.includes(theme))return current.filter(x=>x!==theme); return current.length>=max?current:[...current,theme]}
export function isThemeSelectionValid(items:string[],min=3,max=5){return items.length>=min&&items.length<=max}
