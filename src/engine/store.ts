import {create} from 'zustand';
import {getPart,type PartId} from '../content/parts';
import {DEFAULT_BUILD,installPart,removePart,inspectPart,migrateBuild,type Build,type MountSlot} from './assembly';
export type Screen = 'garage'|'explore'|'lab'|'build'|'inspect';
interface AppStore {screen:Screen; selected:PartId; transparent:boolean; exploded:boolean; build:Build; hydrated:boolean; message:string; motorSpeed:number;motorPlaying:boolean;
 setScreen:(s:Screen)=>void;select:(s:PartId)=>void;toggleTransparent:()=>void;toggleExploded:()=>void;setBuild:(b:Build)=>void;install:(part:PartId,slot:MountSlot)=>void;remove:(part:PartId)=>void;inspect:(part:PartId)=>void;setMessage:(msg:string)=>void;setMotorSpeed:(v:number)=>void;setMotorPlaying:(v:boolean)=>void;reset:()=>void;}
export const useGarage=create<AppStore>((set,get)=>({screen:'garage',selected:'motor',transparent:false,exploded:false,build:DEFAULT_BUILD,hydrated:false,message:'',motorSpeed:2,motorPlaying:true,
 setScreen:screen=>set({screen,message:''}),select:selected=>set({selected}),toggleTransparent:()=>set(s=>({transparent:!s.transparent})),toggleExploded:()=>set(s=>({exploded:!s.exploded})),setBuild:build=>set({build:migrateBuild(build),hydrated:true}),
 install:(part,slot)=>{try{const build=installPart(get().build,part,slot);set({build,message:`✓ ${getPart(part).name} securely installed!`,selected:part});}catch(e){set({message:(e as Error).message});}},
 remove:part=>set({build:removePart(get().build,part),message:'Assembly removed with any dependent systems. Inspection cleared.'}),
 inspect:part=>{try{set({build:inspectPart(get().build,part),message:`✓ ${getPart(part).name} inspection recorded.`});}catch(e){set({message:(e as Error).message});}},
 setMessage:message=>set({message}),setMotorSpeed:motorSpeed=>set({motorSpeed}),setMotorPlaying:motorPlaying=>set({motorPlaying}),reset:()=>set({build:{...DEFAULT_BUILD,installed:[],inspection:[]},message:'Workshop reset. Ready for another build.'})}));
