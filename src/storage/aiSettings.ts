import type {AiSettings} from '../types';

const KEY='fusheng-ai-settings';
export const emptyAiSettings=():AiSettings=>({format:'openai',endpoint:'',apiKey:'',model:'',maxTokens:2048,temperature:.7});
export function isAiConfigured(s:AiSettings){return Boolean(s.endpoint.trim()&&s.apiKey.trim()&&s.model.trim()&&s.maxTokens>0&&s.temperature>=0&&s.temperature<=2)}
export function loadAiSettings():AiSettings {if(typeof window==='undefined')return emptyAiSettings();try{const value=JSON.parse(localStorage.getItem(KEY)||'null');return value?{...emptyAiSettings(),...value}:emptyAiSettings()}catch{return emptyAiSettings()}}
export function saveAiSettings(s:AiSettings){localStorage.setItem(KEY,JSON.stringify(s))}
export function clearAiSettings(){localStorage.removeItem(KEY)}
