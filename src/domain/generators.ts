export function cryptoRandomIndex(length:number, cryptoLike:Pick<Crypto,'getRandomValues'>=crypto):number{
 if(!Number.isInteger(length)||length<=0)throw new Error('随机范围必须大于 0');
 const max=0x100000000-(0x100000000%length), value=new Uint32Array(1);
 do{cryptoLike.getRandomValues(value)}while(value[0]>=max);
 return value[0]%length;
}
export function toggleTalentSelection(current:string[],talent:string,limit=3){if(current.includes(talent))return current.filter(x=>x!==talent); return current.length>=limit?current:[...current,talent]}
export function toggleThemeSelection(current:string[],theme:string,max=5){if(current.includes(theme))return current.filter(x=>x!==theme); return current.length>=max?current:[...current,theme]}
export function isThemeSelectionValid(items:string[],min=3,max=5){return items.length>=min&&items.length<=max}

import type {FamilyCard} from '../types';
export function sampleFamilies(pool:FamilyCard[],count=3):FamilyCard[]{if(pool.length<count)throw new Error('家庭候选池不足');const copy=[...pool],out:FamilyCard[]=[];while(out.length<count)out.push(copy.splice(cryptoRandomIndex(copy.length),1)[0]);return out}
export function rankFamilies(pool:FamilyCard[],answers:Record<string,string|undefined>,count=3):FamilyCard[]{const terms=Object.values(answers).filter((x):x is string=>!!x);return [...pool].map((card,i)=>({card,i,score:terms.reduce((n,t)=>n+(card.birthFit?.includes(t)?3:0)+([card.label,card.parents,card.socialClass,card.location,...card.advantages,...card.risks,card.hiddenSecret].join('').includes(t)?1:0),0)})).sort((a,b)=>b.score-a.score||a.i-b.i).slice(0,count).map(x=>x.card)}
