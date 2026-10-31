import {useState} from 'react';
import {Check,ChevronRight,RotateCcw,ShieldCheck,Wrench} from 'lucide-react';
import {getPart} from '../content/parts';
import {assemblySteps,isInstalled,missionComplete,validateInstallation} from '../engine/assembly';
import {useGarage} from '../engine/store';

export function Workshop(){
 const s=useGarage();
 const [confirmReset,setConfirmReset]=useState(false);
 const [confirmRemove,setConfirmRemove]=useState(false);
 const step=assemblySteps.find(step=>step.partId===s.selected)!;
 const fitted=isInstalled(s.build,step.partId);
 const verdict=validateInstallation(s.build,step.partId,step.slot);
 const count=assemblySteps.filter(step=>isInstalled(s.build,step.partId)).length;
 return <div className="inspector-body workshop">
  <div className="tag"><Wrench size={13}/> ASSEMBLY MISSION 002</div>
  <h2>Build it. Understand it.</h2>
  <p>Start with the frame and fit eight systems. Select a step to see its mount and prerequisites.</p>
  <div className="mission-progress"><span>{count} of 8 assemblies fitted</span><progress aria-label="Assembly progress" max={8} value={count}/></div>
  <ol className="assembly-list">{assemblySteps.map((item,i)=>{
   const installed=isInstalled(s.build,item.partId);
   const ready=validateInstallation(s.build,item.partId,item.slot).ok;
   return <li key={item.partId}><button className={s.selected===item.partId?'assembly-step active':'assembly-step'} aria-pressed={s.selected===item.partId} onClick={()=>{s.select(item.partId);setConfirmRemove(false)}}>
    <span className={installed?'step-number complete':'step-number'}>{installed?<Check size={15}/>:i+1}</span>
    <span><strong>{getPart(item.partId).name}</strong><small>{installed?'Installed':ready?'Ready to fit':'Waiting for prerequisites'}</small></span><ChevronRight size={14}/>
   </button></li>;
  })}</ol>
  <section className="step-detail" aria-label="Selected assembly">
   <div className="subheading">{step.mount}</div><h3>{getPart(step.partId).name}</h3><p>{step.hint}</p>
   {!fitted&&!verdict.ok&&<p className="dependency-note">{verdict.reason}</p>}
   <button className="primary" disabled={!s.hydrated||!verdict.ok} onClick={()=>s.install(step.partId,step.slot)}>{fitted?'Installed ✓':`Fit ${getPart(step.partId).name}`}</button>
   {fitted&&(confirmRemove?<div className="confirm-actions"><p>Dependent assemblies will also be removed and inspection progress cleared.</p><button className="secondary" onClick={()=>{s.remove(step.partId);setConfirmRemove(false)}}>Confirm removal</button><button className="reset" onClick={()=>setConfirmRemove(false)}>Keep assembly</button></div>:<button className="reset" onClick={()=>setConfirmRemove(true)}>Remove this assembly</button>)}
  </section>
  <button className="primary" disabled={count<8||!s.hydrated} onClick={()=>{s.select(assemblySteps.find(step=>!s.build.inspection?.includes(step.partId))?.partId??'chassis');s.setScreen('inspect');if(!s.transparent)s.toggleTransparent()}}>Continue to inspection <ChevronRight size={16}/></button>
  {confirmReset?<div className="confirm-actions"><p>Reset all eight assemblies and inspection progress?</p><button className="secondary" onClick={()=>{s.reset();setConfirmReset(false)}}>Confirm reset</button><button className="reset" onClick={()=>setConfirmReset(false)}>Keep my build</button></div>:<button className="reset" disabled={!s.hydrated||count===0} onClick={()=>setConfirmReset(true)}><RotateCcw size={14}/> Start a new build</button>}
 </div>;
}

export function Inspection(){
 const s=useGarage();
 const assembled=assemblySteps.every(step=>isInstalled(s.build,step.partId));
 const checked=s.build.inspection??[];
 const step=assemblySteps.find(step=>step.partId===s.selected)!;
 const complete=missionComplete(s.build);
 const markChecked=()=>{
  s.inspect(step.partId);
  const next=assemblySteps.find(item=>item.partId!==step.partId&&!checked.includes(item.partId));
  if(next)s.select(next.partId);
 };
 return <div className="inspector-body workshop">
  <div className="tag"><ShieldCheck size={13}/> VEHICLE INSPECTION</div>
  <h2>{complete?'Mission accomplished':'Know every connection'}</h2>
  <p>{complete?'You assembled and inspected all eight systems. Your learning record is saved on this browser.':'Use the model, X-ray body and exploded view to identify each system. Record each observation to finish the mission.'}</p>
  {!assembled?<div className="step-detail"><p>Fit all eight assemblies before inspection.</p><button className="primary" onClick={()=>s.setScreen('build')}>Return to workshop</button></div>:<>
   <div className="mission-progress"><span>{checked.length} of 8 systems inspected</span><progress aria-label="Inspection progress" max={8} value={checked.length}/></div>
   <ol className="assembly-list">{assemblySteps.map((item,i)=><li key={item.partId}><button className={s.selected===item.partId?'assembly-step active':'assembly-step'} aria-pressed={s.selected===item.partId} onClick={()=>s.select(item.partId)}><span className={checked.includes(item.partId)?'step-number complete':'step-number'}>{checked.includes(item.partId)?<Check size={15}/>:i+1}</span><span><strong>{getPart(item.partId).name}</strong><small>{checked.includes(item.partId)?'Inspection recorded':'Identify on the model'}</small></span></button></li>)}</ol>
   {complete?<div className="completion-card" role="status"><ShieldCheck size={32}/><h3>Junior vehicle engineer</h3><p>8 assemblies · 8 inspections</p><small>Educational model inspection completed</small></div>:<section className="step-detail"><div className="subheading">VISUAL CHECK</div><h3>{getPart(step.partId).name}</h3><p>{step.check}</p><button className="primary" disabled={!s.hydrated||checked.includes(step.partId)} onClick={markChecked}>{checked.includes(step.partId)?'Inspection recorded ✓':'I identified this system'}</button></section>}
   <button className="secondary" onClick={()=>s.setScreen('build')}>Return to workshop</button>
  </>}
  <div className="info-box"><ShieldCheck size={17}/><span>This is a learning checklist for a simplified model. It does not certify a real vehicle for driving.</span></div>
 </div>;
}
