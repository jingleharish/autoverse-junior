import type {PartId} from '../content/parts';
export type MountSlot = 'rear-motor-mount'|'front-motor-mount'|'battery-tray';
export interface Installation {partId:PartId;slot:MountSlot;}
export interface Build {id:string;name:string;installed:Installation[];updatedAt:number;}
export const DEFAULT_BUILD:Build={id:'starter-ev',name:'My First EV',installed:[],updatedAt:0};
export function validateInstallation(build:Build,partId:PartId,slot:MountSlot):{ok:boolean;reason:string}{
 if(partId!=='motor'&&partId!=='battery')return {ok:false,reason:'This workshop mission currently installs only the motor and battery.'};
 if(partId==='motor'&&slot!=='rear-motor-mount')return {ok:false,reason:'This rear-drive motor fits the rear motor mount only. Try the highlighted rear mount.'};
 if(partId==='battery'&&slot!=='battery-tray')return {ok:false,reason:'The battery pack belongs in the protected centre battery tray.'};
 if(build.installed.some(p=>p.partId===partId))return {ok:false,reason:`${partId==='motor'?'Motor':'Battery'} is already installed.`};
 if(build.installed.some(p=>p.slot===slot))return {ok:false,reason:'That mounting point is already occupied.'};
 return {ok:true,reason:'Compatible mount found. Component fitted successfully.'};
}
export function installPart(build:Build,partId:PartId,slot:MountSlot,now=Date.now()):Build{
 const verdict=validateInstallation(build,partId,slot);
 if(!verdict.ok)throw new Error(verdict.reason);
 return {...build,installed:[...build.installed,{partId,slot}],updatedAt:now};
}
export function isInstalled(build:Build,id:PartId){return build.installed.some(x=>x.partId===id)}
