import {describe,it,expect} from 'vitest';
import {DEFAULT_BUILD,validateInstallation,installPart,isInstalled} from '../engine/assembly';
describe('engineering assembly validation',()=>{
 it('accepts motor on its rear mount',()=>{expect(validateInstallation(DEFAULT_BUILD,'motor','rear-motor-mount').ok).toBe(true)});
 it('rejects incorrect mount with explanation',()=>{const v=validateInstallation(DEFAULT_BUILD,'motor','front-motor-mount');expect(v.ok).toBe(false);expect(v.reason).toMatch(/rear/i)});
 it('fits battery only in the protected tray',()=>{expect(validateInstallation(DEFAULT_BUILD,'battery','battery-tray').ok).toBe(true);expect(validateInstallation(DEFAULT_BUILD,'battery','rear-motor-mount').ok).toBe(false)});
 it('preserves immutable build and prevents duplicates',()=>{const next=installPart(DEFAULT_BUILD,'motor','rear-motor-mount',123);expect(isInstalled(DEFAULT_BUILD,'motor')).toBe(false);expect(isInstalled(next,'motor')).toBe(true);expect(next.updatedAt).toBe(123);expect(()=>installPart(next,'motor','rear-motor-mount')).toThrow(/already installed/)});
 it('prevents unsupported installation',()=>{expect(validateInstallation(DEFAULT_BUILD,'wheels','rear-motor-mount').ok).toBe(false)});
 it('retains independent battery and motor installations',()=>{const a=installPart(DEFAULT_BUILD,'motor','rear-motor-mount',1);const b=installPart(a,'battery','battery-tray',2);expect(b.installed).toHaveLength(2)})
});
