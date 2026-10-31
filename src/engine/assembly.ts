import {getPart,type PartId} from '../content/parts';
export type MountSlot = 'chassis-jig'|'rear-motor-mount'|'front-motor-mount'|'battery-tray'|'suspension-towers'|'front-steering-rack'|'wheel-hubs'|'brake-carriers'|'body-mounts';
export interface Installation {partId:PartId;slot:MountSlot;}
export interface Build {id:string;name:string;installed:Installation[];updatedAt:number;inspection?:PartId[];}
export const DEFAULT_BUILD:Build={id:'starter-ev',name:'My First EV',installed:[],updatedAt:0,inspection:[]};
export interface AssemblyStep {partId:PartId;slot:MountSlot;mount:string;requires:PartId[];hint:string;check:string;}
export const assemblySteps:AssemblyStep[]=[
 {partId:'chassis',slot:'chassis-jig',mount:'Assembly jig',requires:[],hint:'Start with the structural platform. Every other system needs its support.',check:'Identify the frame rails that support the vehicle and protect the battery tray.'},
 {partId:'suspension',slot:'suspension-towers',mount:'Four suspension towers',requires:['chassis'],hint:'Fit the springs, dampers and control arms to the chassis.',check:'Find the springs and dampers at all four corners. They help maintain tyre contact.'},
 {partId:'steering',slot:'front-steering-rack',mount:'Front rack mounts',requires:['chassis','suspension'],hint:'Connect the rack to the front suspension knuckles.',check:'Locate the front steering rack and tie rods leading to the front wheels.'},
 {partId:'brakes',slot:'brake-carriers',mount:'Four brake carriers',requires:['suspension'],hint:'Install the discs and calipers before fitting the wheels.',check:'Locate the discs and calipers inside the wheels. These convert motion into heat.'},
 {partId:'motor',slot:'rear-motor-mount',mount:'Rear motor mount',requires:['chassis'],hint:'This rear-drive motor belongs at the rear axle, opposite the steering rack.',check:'Identify the rear traction motor and its connection to the driven wheels.'},
 {partId:'battery',slot:'battery-tray',mount:'Protected centre tray',requires:['chassis'],hint:'Place the pack low in the chassis to keep its mass near the ground.',check:'Find the battery pack between the axles, inside the protected centre tray.'},
 {partId:'wheels',slot:'wheel-hubs',mount:'Four wheel hubs',requires:['suspension','brakes','steering'],hint:'Fit all four wheels after the brakes and steering are connected.',check:'Check that four wheels are present, with brakes and suspension behind them.'},
 {partId:'body',slot:'body-mounts',mount:'Chassis body mounts',requires:['chassis','suspension','steering','brakes','motor','battery','wheels'],hint:'The body is the final assembly. Finish the systems underneath first.',check:'Inspect the body, then use X-ray body to reveal the systems beneath it.'},
];
export function validateInstallation(build:Build,partId:PartId,slot:MountSlot):{ok:boolean;reason:string}{
 const step=assemblySteps.find(s=>s.partId===partId)!;
 if(slot!==step.slot)return {ok:false,reason:`${getPart(partId).name} fits ${step.mount.toLowerCase()} only.`};
 if(isInstalled(build,partId))return {ok:false,reason:`${getPart(partId).name} is already installed.`};
 if(build.installed.some(p=>p.slot===slot))return {ok:false,reason:'That mounting point is already occupied.'};
 const missing=step.requires.filter(id=>!isInstalled(build,id));
 if(missing.length)return {ok:false,reason:`Install first: ${missing.map(id=>getPart(id).name).join(', ')}.`};
 return {ok:true,reason:'Compatible mount found. Component fitted successfully.'};
}
export function installPart(build:Build,partId:PartId,slot:MountSlot,now=Date.now()):Build{
 const verdict=validateInstallation(build,partId,slot);
 if(!verdict.ok)throw new Error(verdict.reason);
 return {...build,installed:[...build.installed,{partId,slot}],inspection:[],updatedAt:now};
}
export function isInstalled(build:Build,id:PartId){return build.installed.some(x=>x.partId===id)}
export function removePart(build:Build,id:PartId,now=Date.now()):Build{
 const removed=new Set<PartId>([id]);
 let changed=true;
 while(changed){changed=false;for(const step of assemblySteps){if(!removed.has(step.partId)&&step.requires.some(p=>removed.has(p))){removed.add(step.partId);changed=true;}}}
 return {...build,installed:build.installed.filter(p=>!removed.has(p.partId)),inspection:[],updatedAt:now};
}
export function inspectPart(build:Build,id:PartId,now=Date.now()):Build{
 if(!assemblySteps.every(s=>isInstalled(build,s.partId)))throw new Error('Finish all eight assemblies before starting inspection.');
 return {...build,inspection:[...new Set([...(build.inspection??[]),id])],updatedAt:now};
}
export function missionComplete(build:Build){return assemblySteps.every(s=>isInstalled(build,s.partId)&&(build.inspection??[]).includes(s.partId));}
// M1 started with a prepared rolling chassis and saved only motor/battery installs.
export function migrateBuild(build:Build):Build{
 if(build.inspection!==undefined)return build;
 const prepared=assemblySteps.filter(s=>['chassis','suspension','steering','brakes','wheels'].includes(s.partId)).map(s=>({partId:s.partId,slot:s.slot}));
 return {...build,installed:[...prepared,...build.installed.filter(p=>!prepared.some(s=>s.partId===p.partId))],inspection:[]};
}
