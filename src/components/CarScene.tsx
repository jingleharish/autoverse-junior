import {Canvas,ThreeEvent,useFrame} from '@react-three/fiber';
import {OrbitControls,ContactShadows,Html} from '@react-three/drei';
import {Suspense,useMemo,useRef} from 'react';
import * as THREE from 'three';
import {useGarage} from '../engine/store';
import type {PartId} from '../content/parts';
import {isInstalled} from '../engine/assembly';
import {StudioLighting} from './StudioLighting';

// Car faces -x: front axle at -1.27, rear axle at +1.27, ground at y=0.
const AXLES=[-1.27,1.27];
const WHEEL_Z=.74;
const WHEEL_Y=.46;
const SIDES=[-1,1];

function Metal({color='#98a9ba',roughness=.28,metalness=.78,transparent=false,opacity=1}:{color?:string;roughness?:number;metalness?:number;transparent?:boolean;opacity?:number}){return <meshStandardMaterial color={color} metalness={metalness} roughness={roughness} transparent={transparent} opacity={opacity}/>}
function Paint({xray,color='#1f8ea3'}:{xray:boolean;color?:string}){return <meshPhysicalMaterial key={String(xray)} color={color} metalness={.55} roughness={.32} clearcoat={1} clearcoatRoughness={.08} transparent={xray} opacity={xray?.1:1} depthWrite={!xray}/>}
function Trim({xray,color='#0b1218'}:{xray:boolean;color?:string}){return <meshStandardMaterial key={String(xray)} color={color} metalness={.3} roughness={.55} transparent={xray} opacity={xray?.08:1} depthWrite={!xray}/>}
function Glass({xray}:{xray:boolean}){return <meshPhysicalMaterial color="#0a1a24" metalness={.9} roughness={.06} clearcoat={1} transparent opacity={xray?.06:.92} depthWrite={!xray}/>}
function Glow({color,intensity=3,xray=false}:{color:string;intensity?:number;xray?:boolean}){return <meshStandardMaterial key={String(xray)} color={color} emissive={color} emissiveIntensity={intensity} toneMapped={false} transparent={xray} opacity={xray?.25:1}/>}

function PartGroup({id,children}:{id:PartId;children:React.ReactNode}){
 const {selected,select,exploded}=useGarage();const offs:Record<PartId,[number,number,number]>={chassis:[0,-.2,0],body:[0,1.25,0],battery:[0,.3,0],motor:[1.1,.55,0],wheels:[0,0,.75],brakes:[0,.3,.25],steering:[-1.1,.45,0],suspension:[0,.55,0]};const p=offs[id];
 return <group position={exploded?p:[0,0,0]} onClick={(e:ThreeEvent<MouseEvent>)=>{e.stopPropagation();select(id);}} onPointerOver={(e:ThreeEvent<PointerEvent>)=>{e.stopPropagation();document.body.style.cursor='pointer'}} onPointerOut={()=>{document.body.style.cursor=''}}>{children}{selected===id&&<pointLight position={[0,1.6,0]} intensity={2.5} distance={3.5} color="#26d6e7"/>}</group>
}
function Beam({from,to,radius=.04,color='#8a9cad',children}:{from:[number,number,number];to:[number,number,number];radius?:number;color?:string;children?:React.ReactNode}){const a=new THREE.Vector3(...from),b=new THREE.Vector3(...to),d=b.clone().sub(a);return <mesh castShadow position={a.clone().add(b).multiplyScalar(.5).toArray()} quaternion={new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),d.clone().normalize())}><cylinderGeometry args={[radius,radius,d.length(),12]}/>{children??<Metal color={color}/>}</mesh>}

function extrude(shape:THREE.Shape,halfWidth:number,bevel:number){const g=new THREE.ExtrudeGeometry(shape,{depth:2*(halfWidth-bevel),bevelEnabled:true,bevelThickness:bevel,bevelSize:bevel,bevelOffset:-bevel,bevelSegments:6,curveSegments:32});g.translate(0,0,-(halfWidth-bevel));return g}
function bodyShape(){const s=new THREE.Shape();s.moveTo(-1.98,.34);s.lineTo(-1.801,.32);s.absarc(AXLES[0],WHEEL_Y,.55,Math.PI+.26,-.26,true);s.lineTo(.739,.32);s.absarc(AXLES[1],WHEEL_Y,.55,Math.PI+.26,-.26,true);s.lineTo(1.97,.36);s.quadraticCurveTo(2.08,.55,2.03,.8);s.quadraticCurveTo(2,.98,1.86,1.06);s.lineTo(-.7,1.02);s.quadraticCurveTo(-1.4,.96,-1.85,.82);s.quadraticCurveTo(-2.08,.72,-2.06,.52);s.closePath();return s}
function cabinShape(){const s=new THREE.Shape();s.moveTo(-.88,.98);s.quadraticCurveTo(-.38,1.36,-.02,1.47);s.quadraticCurveTo(.5,1.54,1,1.44);s.quadraticCurveTo(1.45,1.28,1.86,1.02);s.closePath();return s}
function roofShape(){const s=new THREE.Shape();s.moveTo(-.12,1.44);s.quadraticCurveTo(.5,1.565,1.04,1.44);s.lineTo(1.04,1.39);s.quadraticCurveTo(.5,1.5,-.12,1.39);s.closePath();return s}

function Wheel({x,side}:{x:number;side:number}){
 const tire=useMemo(()=>new THREE.LatheGeometry([[.3,-.14],[.42,-.14],[.45,-.12],[.46,-.08],[.46,.08],[.45,.12],[.42,.14],[.3,.14]].map(([r,y])=>new THREE.Vector2(r,y)),64),[]);
 const barrel=useMemo(()=>new THREE.LatheGeometry([[.27,-.13],[.3,-.11],[.3,.11],[.325,.135]].map(([r,y])=>new THREE.Vector2(r,y)),64),[]);
 return <group position={[x,WHEEL_Y,side*WHEEL_Z]} rotation={[side*Math.PI/2,0,0]}>
  <mesh castShadow geometry={tire}><meshStandardMaterial color="#14181d" roughness={.82} side={THREE.DoubleSide}/></mesh>
  <mesh geometry={barrel}><meshStandardMaterial color="#c8d2da" metalness={.9} roughness={.25} side={THREE.DoubleSide}/></mesh>
  {Array.from({length:5},(_,i)=><group key={i} rotation={[0,i*Math.PI*2/5,0]}>{[-.14,.14].map(a=><mesh key={a} position={[.17*Math.cos(a),.11,.17*Math.sin(a)]} rotation={[0,-a*1.6,0]} castShadow><boxGeometry args={[.3,.035,.035]}/><meshStandardMaterial color="#d8e0e6" metalness={.9} roughness={.22}/></mesh>)}</group>)}
  <mesh position={[0,.115,0]}><cylinderGeometry args={[.062,.07,.05,24]}/><meshStandardMaterial color="#222c35" metalness={.8} roughness={.3}/></mesh>
  <mesh position={[0,.143,0]}><cylinderGeometry args={[.03,.03,.008,16]}/><Glow color="#5eead4" intensity={1.4}/></mesh>
 </group>}
function Brake({x,side}:{x:number;side:number}){return <group position={[x,WHEEL_Y,side*(WHEEL_Z-.02)]} rotation={[Math.PI/2,0,0]}><mesh><cylinderGeometry args={[.245,.245,.03,40]}/><Metal color="#9aa6b0" roughness={.34} metalness={.9}/></mesh><mesh><cylinderGeometry args={[.1,.1,.06,24]}/><Metal color="#3a4650"/></mesh><mesh position={[.18,0,.1]} rotation={[0,.5,0]}><boxGeometry args={[.1,.11,.17]}/><Metal color="#f0763c" roughness={.4} metalness={.4}/></mesh></group>}
function Suspension({x,side}:{x:number;side:number}){const z=side*WHEEL_Z;return <group><Beam from={[x-.2,.34,z*.42]} to={[x,.37,z*.86]} radius={.024}/><Beam from={[x+.2,.34,z*.42]} to={[x,.37,z*.86]} radius={.024}/><Beam from={[x,.72,z*.5]} to={[x,.58,z*.84]} radius={.02}/><Beam from={[x,.37,z*.72]} to={[x,.86,z*.56]} radius={.03} color="#2f3f4d"/>{Array.from({length:7},(_,i)=>{const t=i/6;return <mesh key={i} position={[x,.45+t*.34,z*(.694-t*.11)]} rotation={[Math.PI/2,0,0]}><torusGeometry args={[.07,.014,8,20]}/><Metal color="#e8c264" roughness={.35}/></mesh>})}</group>}
function Motor({installed=false}:{installed?:boolean}){const rotor=useRef<THREE.Group>(null);const {motorPlaying,motorSpeed,screen}=useGarage();useFrame((_,dt)=>{if(rotor.current&&motorPlaying&&screen!=='lab')rotor.current.rotation.x+=dt*motorSpeed*.6});return <group position={[AXLES[1],WHEEL_Y+.06,0]}><group rotation={[0,Math.PI/2,0]}><mesh castShadow rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[.25,.25,.56,40]}/><Metal color="#8ea3b2" roughness={.3}/></mesh>{Array.from({length:9},(_,i)=><mesh key={i} position={[-.24+i*.06,0,0]} rotation={[0,Math.PI/2,0]}><torusGeometry args={[.255,.012,8,40]}/><Metal color="#4c6272"/></mesh>)}<group ref={rotor}><mesh rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[.05,.05,.72,20]}/><Metal color="#e6aa5c" roughness={.2}/></mesh></group><mesh position={[.38,0,0]} rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[.17,.2,.2,32]}/><Metal color="#2b414f"/></mesh></group><Beam from={[0,-.06,.4]} to={[0,-.06,.66]} radius={.024} color="#c9d4dc"/><Beam from={[0,-.06,-.4]} to={[0,-.06,-.66]} radius={.024} color="#c9d4dc"/>{installed&&<Html position={[0,.5,0]} center distanceFactor={8}><div className="mesh-label">MOTOR INSTALLED</div></Html>}</group>}
function Battery(){return <group position={[-.3,.3,0]}><mesh castShadow><boxGeometry args={[1.56,.12,1.1]}/><Metal color="#17303b" roughness={.45}/></mesh>{Array.from({length:12},(_,i)=><mesh key={i} position={[-.57+(i%4)*.38,.09,-.34+Math.floor(i/4)*.34]}><boxGeometry args={[.34,.07,.3]}/><Metal color="#2fb29a" roughness={.32}/></mesh>)}<mesh position={[.84,.03,.2]}><boxGeometry args={[.12,.09,.16]}/><Metal color="#f0763c" metalness={.3} roughness={.5}/></mesh></group>}
function Chassis(){return <group>{[-.5,.5].map(z=><mesh key={z} castShadow position={[0,.3,z]}><boxGeometry args={[3.5,.1,.08]}/><Metal color="#9babba" roughness={.34}/></mesh>)}{[-1.72,-.95,.62,1.72].map(x=><mesh key={x} position={[x,.3,0]}><boxGeometry args={[.07,.08,1]}/><Metal color="#5f7484"/></mesh>)}<mesh position={[-.3,.235,0]}><boxGeometry args={[1.62,.025,1.1]}/><Metal color="#3f5261" roughness={.5}/></mesh></group>}
function Steering(){const x=AXLES[0];return <group><Beam from={[x+.16,.5,-.46]} to={[x+.16,.5,.46]} radius={.03} color="#bca3d6"/>{SIDES.map(s=><Beam key={s} from={[x+.16,.5,s*.46]} to={[x+.1,.47,s*.68]} radius={.016}/>)}<Beam from={[x+.16,.5,.12]} to={[-.6,.95,.34]} radius={.018}/></group>}
function Body(){
 const xray=useGarage(s=>s.transparent);
 const shell=useMemo(()=>extrude(bodyShape(),.86,.09),[]);const cabin=useMemo(()=>extrude(cabinShape(),.76,.15),[]);const roof=useMemo(()=>extrude(roofShape(),.53,.03),[]);
 return <group>
  <mesh castShadow geometry={shell}><Paint xray={xray}/></mesh>
  <mesh castShadow geometry={cabin}><Glass xray={xray}/></mesh>
  <mesh castShadow geometry={roof}><Paint xray={xray}/></mesh>
  {SIDES.map(s=><group key={s}>
   <Beam from={[-.84,1.02,s*.72]} to={[-.12,1.43,s*.56]} radius={.026}><Paint xray={xray}/></Beam>
   <Beam from={[-.12,1.43,s*.56]} to={[1.03,1.42,s*.56]} radius={.026}><Paint xray={xray}/></Beam>
   <Beam from={[1.03,1.42,s*.56]} to={[1.78,1.06,s*.72]} radius={.026}><Paint xray={xray}/></Beam>
   <Beam from={[.38,1.04,s*.75]} to={[.38,1.46,s*.58]} radius={.02}><Trim xray={xray}/></Beam>
   {[-.62,.38,1.2].map(x=><mesh key={x} position={[x,.68,s*.862]}><boxGeometry args={[.012,.66,.004]}/><Trim xray={xray} color="#06222a"/></mesh>)}
   {[-.2,.82].map(x=><mesh key={x} position={[x,.93,s*.868]}><boxGeometry args={[.2,.028,.014]}/><Metal key={String(xray)} color="#c9d4dc" transparent={xray} opacity={xray?.1:1}/></mesh>)}
   <mesh position={[.05,.37,s*.85]}><boxGeometry args={[1.42,.09,.04]}/><Trim xray={xray}/></mesh>
   <mesh position={[-.74,1.05,s*.9]} rotation={[0,s*.25,0]} castShadow><boxGeometry args={[.13,.07,.13]}/><Paint xray={xray}/></mesh>
   <mesh position={[-1.93,.755,s*.5]} rotation={[0,0,-.55]}><boxGeometry args={[.11,.028,.5]}/><Glow color="#e6fbff" intensity={3.2} xray={xray}/></mesh>
   <mesh position={[-2.03,.45,s*.56]}><boxGeometry args={[.04,.05,.26]}/><Trim xray={xray} color="#1a2630"/></mesh>
  </group>)}
  <mesh position={[1.97,.94,0]} rotation={[0,0,-.5]}><boxGeometry args={[.035,.035,1.5]}/><Glow color="#ff2d3f" intensity={2.8} xray={xray}/></mesh>
  <mesh position={[-2.05,.42,0]}><boxGeometry args={[.05,.14,1.1]}/><Trim xray={xray}/></mesh>
  <mesh position={[2.03,.45,0]}><boxGeometry args={[.05,.16,1.2]}/><Trim xray={xray}/></mesh>
 </group>}
function Car(){const {screen,build}=useGarage();const activeBuild=screen==='build';const motorReady=!activeBuild||isInstalled(build,'motor');const batteryReady=!activeBuild||isInstalled(build,'battery');const corners=AXLES.flatMap(x=>SIDES.map(side=>({x,side})));return <group><PartGroup id="chassis"><Chassis/></PartGroup><PartGroup id="suspension">{corners.map(c=><Suspension key={`${c.x}${c.side}`} {...c}/>)}</PartGroup><PartGroup id="brakes">{corners.map(c=><Brake key={`${c.x}${c.side}`} {...c}/>)}</PartGroup><PartGroup id="wheels">{corners.map(c=><Wheel key={`${c.x}${c.side}`} {...c}/>)}</PartGroup><PartGroup id="steering"><Steering/></PartGroup><PartGroup id="battery">{batteryReady&&<Battery/>}</PartGroup><PartGroup id="motor">{motorReady&&<Motor installed={activeBuild&&isInstalled(build,'motor')}/>}</PartGroup>{screen!=='build'&&<PartGroup id="body"><Body/></PartGroup>}{activeBuild&&!motorReady&&<group position={[AXLES[1],WHEEL_Y+.06,0]}><mesh rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.28,.28,.7,24]}/><meshBasicMaterial color="#34e3cb" transparent opacity={.2} wireframe/></mesh><Html position={[0,.5,0]} center distanceFactor={8}><div className="mesh-label">REAR MOTOR MOUNT</div></Html></group>}{activeBuild&&!batteryReady&&<mesh position={[-.3,.33,0]}><boxGeometry args={[1.56,.2,1.1]}/><meshBasicMaterial color="#34e3cb" transparent opacity={.2} wireframe/></mesh>}</group>}
function Stage(){return <group><mesh rotation={[-Math.PI/2,0,0]} position={[0,-.005,0]} receiveShadow><circleGeometry args={[3.5,96]}/><meshStandardMaterial color="#121e28" metalness={0} roughness={.95} envMapIntensity={.25}/></mesh><mesh rotation={[-Math.PI/2,0,0]} position={[0,-.002,0]}><ringGeometry args={[3.46,3.5,128]}/><meshBasicMaterial color="#4fe5c4" transparent opacity={.55}/></mesh></group>}
export function CarScene(){const {screen}=useGarage();return <Canvas camera={{position:[-5.6,2.3,6.2],fov:30}} shadows dpr={[1,2]} gl={{antialias:true}}><StudioLighting/><Suspense fallback={null}><Car/><Stage/><ContactShadows position={[0,.002,0]} opacity={.75} scale={8} blur={2} far={2} resolution={1024}/></Suspense><OrbitControls makeDefault enablePan={false} minDistance={4} maxDistance={13} maxPolarAngle={Math.PI/2.08} minPolarAngle={.2} target={[0,.68,0]} autoRotate={screen==='garage'} autoRotateSpeed={.5}/></Canvas>}
