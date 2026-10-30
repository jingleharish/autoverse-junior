import {openDB} from 'idb';
import type {Build} from '../engine/assembly';
const database=()=>openDB('autoverse-junior',1,{upgrade(db){if(!db.objectStoreNames.contains('garage'))db.createObjectStore('garage');}});
export async function loadBuild():Promise<Build|null>{const db=await database();return (await db.get('garage','current'))??null;}
export async function saveBuild(build:Build){const db=await database();await db.put('garage',build,'current');}
