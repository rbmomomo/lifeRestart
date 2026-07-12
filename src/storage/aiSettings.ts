import type {AiSettings} from '../types';

const KEY='fusheng-ai-settings';
export const emptyAiSettings=():AiSettings=>({format:'openai',endpoint:'',apiKey:'',model:'',maxTokens:undefined,temperature:undefined});
export function isAiConfigured(s:AiSettings){
 const maxOk=s.maxTokens===undefined||(Number.isFinite(s.maxTokens)&&s.maxTokens>0&&Number.isInteger(s.maxTokens));
 const temperatureOk=s.temperature===undefined||(Number.isFinite(s.temperature)&&s.temperature>=0&&s.temperature<=2);
 return Boolean(s.endpoint.trim()&&s.apiKey.trim()&&s.model.trim()&&maxOk&&temperatureOk);
}
export function loadAiSettings():AiSettings {if(typeof window==='undefined')return emptyAiSettings();try{const value=JSON.parse(localStorage.getItem(KEY)||'null');if(!value)return emptyAiSettings();return {...emptyAiSettings(),...value,maxTokens:value.maxTokens??undefined,temperature:value.temperature??undefined}}catch{return emptyAiSettings()}}
export function saveAiSettings(s:AiSettings){localStorage.setItem(KEY,JSON.stringify(s))}
export function clearAiSettings(){localStorage.removeItem(KEY)}
