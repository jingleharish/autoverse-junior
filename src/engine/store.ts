import {create} from 'zustand';
import type {PartId} from '../content/parts';
import {DEFAULT_BUILD,installPart,type Build,type MountSlot} from './assembly';
export type Screen = 'garage'|'explore'|'lab'|'build';
interface AppStore {screen:Screen; selected:PartId; transparent:boolean; exploded:boolean; build:Build; hydrated:boolean; message:string; motorSpeed:number;motorPlaying:boolean;
 setScreen:(s:Screen)=>void;select:(s:PartId)=>void;toggleTransparent:()=>void;toggleExploded:()=>void;setBuild:(b:Build)=>void;install:(part:PartId,slot:MountSlot)=>void;setMessage:(msg:string)=>void;setMotorSpeed:(v:number)=>void;setMotorPlaying:(v:boolean)=>void;reset:()=>void;}
export const useGarage=create<AppStore>((set,get)=>({screen:'garage',selected:'motor',transparent:false,exploded:false,build:DEFAULT_BUILD,hydrated:false,message:'',motorSpeed:2,motorPlaying:true,
 setScreen:screen=>set({screen,message:''}),select:selected=>set({selected}),toggleTransparent:()=>set(s=>({transparent:!s.transparent})),toggleExploded:()=>set(s=>({exploded:!s.exploded})),setBuild:build=>set({build,hydrated:true}),
 install:(part,slot)=>{try{const build=installPart(get().build,part,slot);set({build,message:`✓ ${part==='motor'?'Electric motor':'Battery pack'} securely installed!`,selected:part});}catch(e){set({message:(e as Error).message});}},setMessage:message=>set({message}),setMotorSpeed:motorSpeed=>set({motorSpeed}),setMotorPlaying:motorPlaying=>set({motorPlaying}),reset:()=>set({build:{...DEFAULT_BUILD},message:'Workshop reset. Ready for another build.'})}));
